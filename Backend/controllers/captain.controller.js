const asyncHandler = require("express-async-handler");
const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");
const jwt = require("jsonwebtoken");
const supabaseAuthService = require("../services/supabase-auth.service");

module.exports.registerCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, email, password, phone, vehicle } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const requireEmailVerification =
    String(process.env.REQUIRE_EMAIL_VERIFICATION || "").trim().toLowerCase() === "true";

  const alreadyExists = await captainModel.findOne({ email: normalizedEmail });

  if (alreadyExists) {
    const existingCaptain = {
      _id: alreadyExists._id,
      fullname: {
        firstname: alreadyExists.fullname.firstname,
        lastname: alreadyExists.fullname.lastname,
      },
      email: alreadyExists.email,
      phone: alreadyExists.phone,
      emailVerified: alreadyExists.emailVerified || false,
    };

    if (requireEmailVerification && !existingCaptain.emailVerified) {
      let verificationDispatchFailed = false;

      if (supabaseAuthService.isSupabaseVerificationEnabled()) {
        try {
          await supabaseAuthService.ensureSupabaseSignup({
            email: existingCaptain.email,
            password: String(password || ""),
            userType: "captain",
          });
        } catch (error) {
          verificationDispatchFailed = true;
        }
      }

      return res.status(200).json({
        message: verificationDispatchFailed
          ? "Captain already exists but is not verified. Failed to send verification link. Use resend verification."
          : "Captain already exists but is not verified. Verification link sent.",
        requiresEmailVerification: true,
        verificationDispatchFailed,
        captain: existingCaptain,
      });
    }

    return res.status(400).json({ message: "Captain already exists" });
  }

  const captain = await captainService.createCaptain(
    fullname.firstname,
    fullname.lastname,
    normalizedEmail,
    password,
    phone,
    vehicle.color,
    vehicle.number,
    vehicle.capacity,
    vehicle.type
  );

  const publicCaptain = {
    _id: captain._id,
    fullname: {
      firstname: captain.fullname.firstname,
      lastname: captain.fullname.lastname,
    },
    email: captain.email,
    phone: captain.phone,
    emailVerified: captain.emailVerified || false,
  };

  const requiresEmailVerification = requireEmailVerification && !publicCaptain.emailVerified;
  let verificationDispatchFailed = false;

  if (requiresEmailVerification && supabaseAuthService.isSupabaseVerificationEnabled()) {
    try {
      await supabaseAuthService.ensureSupabaseSignup({
        email: publicCaptain.email,
        password,
        userType: "captain",
      });
    } catch (error) {
      verificationDispatchFailed = true;
    }
  }

  if (requiresEmailVerification) {
    return res.status(201).json({
      message: verificationDispatchFailed
        ? "Captain registered successfully, but verification email could not be sent. Use resend verification."
        : "Captain registered successfully. Please verify your email before logging in.",
      requiresEmailVerification: true,
      verificationDispatchFailed,
      captain: publicCaptain,
    });
  }

  const token = captain.generateAuthToken();
  return res.status(201).json({
    message: "Captain registered successfully",
    requiresEmailVerification: false,
    token,
    captain: publicCaptain,
  });
});

module.exports.verifyEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token, email, otp, code, token_hash: tokenHash, type } = req.body;
  const providedOtp = otp || code;
  const providedTokenHash = String(tokenHash || "").trim();

  if (supabaseAuthService.isSupabaseVerificationEnabled() && (providedOtp || providedTokenHash)) {
    let resolvedEmail = String(email || "").trim().toLowerCase();

    if (providedTokenHash) {
      const verificationResult = await supabaseAuthService.verifyEmailTokenHash({
        tokenHash: providedTokenHash,
        type,
      });
      resolvedEmail =
        resolvedEmail || String(verificationResult?.user?.email || "").trim().toLowerCase();
    } else {
      if (!resolvedEmail) {
        return res.status(400).json({
          message: "Email is required for OTP verification",
        });
      }

      await supabaseAuthService.verifyEmailOtp({
        email: resolvedEmail,
        otp: providedOtp,
      });
    }

    if (!resolvedEmail) {
      return res.status(400).json({
        message: "Email is required for verification",
      });
    }

    const captainByEmail = await captainModel.findOne({ email: resolvedEmail });
    if (!captainByEmail) {
      return res.status(404).json({
        message: "Captain not found. Please register first.",
      });
    }

    if (!captainByEmail.emailVerified) {
      captainByEmail.emailVerified = true;
      await captainByEmail.save();
    }

    return res.status(200).json({
      message: "Email verified successfully",
      provider: "supabase",
    });
  }

  if (!token) {
    return res
      .status(400)
      .json({ message: "Invalid verification request", error: "Token, token hash, or OTP is required" });
  }

  let decodedTokenData;
  try {
    decodedTokenData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({
      message: "You're trying to use an invalid or expired verification link",
      error: "Invalid token",
    });
  }

  if (!decodedTokenData || decodedTokenData.purpose !== "email-verification") {
    return res.status(400).json({ message: "You're trying to use an invalid or expired verification link", error: "Invalid token" });
  }

  let captain = await captainModel.findOne({ _id: decodedTokenData.id });

  if (!captain) {
    return res.status(404).json({ message: "User not found. Please ask for another verification link." });
  }

  if (captain.emailVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  captain.emailVerified = true;
  await captain.save();

  res.status(200).json({
    message: "Email verified successfully",
  });
});

module.exports.loginCaptain = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email, password } = req.body;

  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    res.status(404).json({ message: "Invalid email or password" });
  }

  const isMatch = await captain.comparePassword(password);

  if (!isMatch) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  if (String(process.env.REQUIRE_EMAIL_VERIFICATION || "").trim().toLowerCase() === "true" && !captain.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email before logging in.",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  const token = captain.generateAuthToken();
  res.cookie("token", token);
  res.json({ message: "Logged in successfully", token, captain });
});

module.exports.captainProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ captain: req.captain });
});

module.exports.updateCaptainProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { captainData } = req.body;
  const updatedCaptainData = await captainModel.findOneAndUpdate(
    { email: req.captain.email },
    captainData,
    { new: true }
  );

  res.status(200).json({
    message: "Profile updated successfully",
    user: updatedCaptainData,
  });
});

module.exports.logoutCaptain = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.token;

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { token, password } = req.body;
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "This password reset link has expired or is no longer valid. Please request a new one to continue" });
    } else {
      return res.status(400).json({ message: "The password reset link is invalid or has already been used. Please request a new one to proceed", error: err });
    }
  }

  const captain = await captainModel.findById(payload.id);
  if (!captain) return res.status(404).json({ message: "User not found. Please check your credentials and try again" });

  captain.password = await captainModel.hashPassword(password);
  await captain.save();

  res.status(200).json({ message: "Your password has been successfully reset. You can now log in with your new credentials" });
});
