const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { sendMail } = require("../services/mail.service");
const supabaseAuthService = require("../services/supabase-auth.service");
let { fillTemplate } = require("../templates/mail.template");

const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");

const createHttpError = (status, message, code) => {
  const error = new Error(message);
  error.status = status;
  if (code) {
    error.code = code;
  }
  return error;
};

const isSmtpConfigured = () => {
  const user = String(process.env.MAIL_USER || "").trim();
  const pass = String(process.env.MAIL_PASS || "").trim();
  return Boolean(user && pass);
};

const getModelByUserType = (userType) => {
  if (userType === "user") return userModel;
  if (userType === "captain") return captainModel;
  return null;
};

const toVerificationResponse = (message, provider, user) => ({
  message,
  provider,
  user: {
    email: user.email,
    fullname: user.fullname,
  },
});

const buildSupabaseProvisionPassword = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const entropy = crypto
    .createHash("sha256")
    .update(`${normalizedEmail}:${String(process.env.JWT_SECRET || "quickride")}`)
    .digest("hex")
    .slice(0, 24);

  return `Qr!${entropy}9Z`;
};

const sendJwtVerificationLink = async (user, userType) => {
  const token = jwt.sign(
    { id: user._id, userType, purpose: "email-verification" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const verificationLink = `${process.env.CLIENT_URL}/${userType}/verify-email?token=${token}`;

  const mailHtml = fillTemplate({
    title: "Email Verification Required",
    name: user.fullname.firstname,
    message:
      "Thank you for signing up with QuickRide! To complete your registration and activate your account, please verify your email address by clicking the button below.",
    cta_link: verificationLink,
    cta_text: "Verify Email",
    note: "For your security, this verification link is valid for only <strong>15 minutes</strong>.  If the link expires, you can request a new one from the login page. <br/>If you did not create a QuickRide account, please disregard this email.",
  });

  if (!isSmtpConfigured()) {
    throw createHttpError(503, "SMTP email is not configured", "MAIL_NOT_CONFIGURED");
  }

  try {
    await sendMail(user.email, "QuickRide - Email Verification", mailHtml);
  } catch (error) {
    throw createHttpError(
      502,
      error?.message || "Failed to send verification email",
      "MAIL_SEND_FAILED"
    );
  }

  return toVerificationResponse("Verification email sent successfully", "email", user);
};

const sendVerificationForUser = async (user, userType) => {
  if (!user) {
    throw createHttpError(404, "Account not found. Please register first.", "ACCOUNT_NOT_FOUND");
  }

  if (user.emailVerified) {
    throw createHttpError(
      400,
      "Your email is already verified. You may continue using the application.",
      "EMAIL_ALREADY_VERIFIED"
    );
  }

  if (supabaseAuthService.isSupabaseVerificationEnabled()) {
    try {
      await supabaseAuthService.ensureSupabaseSignup({
        email: user.email,
        password: buildSupabaseProvisionPassword(user.email),
        userType,
      });
    } catch (error) {
      throw createHttpError(
        502,
        error?.message || "Failed to send verification link",
        "VERIFICATION_SEND_FAILED"
      );
    }
    return toVerificationResponse("Verification link sent successfully", "supabase", user);
  }

  return sendJwtVerificationLink(user, userType);
};

module.exports.sendVerificationEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  let user;

  if (req.userType === "user") {
    user = req.user;
  } else if (req.userType === "captain") {
    user = req.captain;
  } else {
    return res.status(400).json({ message: "The email verification link is invalid because of incorrect user type" });
  }

  const response = await sendVerificationForUser(user, req.userType);
  return res.status(200).json(response);
});

module.exports.resendVerificationEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const userType = String(req.body?.userType || "").trim().toLowerCase();
  const model = getModelByUserType(userType);

  if (!model) {
    return res.status(400).json({
      message: "Invalid user type. Expected user or captain.",
      code: "INVALID_USER_TYPE",
    });
  }

  const account = await model.findOne({ email });
  if (!account) {
    return res.status(404).json({
      message: "Account not found. Please register first.",
      code: "ACCOUNT_NOT_FOUND",
    });
  }

  const response = await sendVerificationForUser(account, userType);
  return res.status(200).json(response);
});

module.exports.forgotPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { email } = req.body;
  const { userType } = req.params;

  let user = null;
  if (userType === "user") {
    user = await userModel.findOne({ email });
  } else if (userType === "captain") {
    user = await captainModel.findOne({ email });
  }
  if (!user) return res.status(404).json({ message: "User not found. Please check your credentials and try again" });

  const token = jwt.sign(
    { id: user._id, type: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.CLIENT_URL}/${userType}/reset-password?token=${token}`;

  let mailHtml = fillTemplate({
    title: "Reset Password",
    name: user.fullname.firstname,
    message: "We received a request to reset the password associated with your QuickRide account. If you made this request, please click the button below to proceed.",
    cta_link: resetLink,
    cta_text: "Reset Password",
    note: "If you didn’t request a password reset, you can safely ignore this email. Your current password will remain unchanged. <br/>This verification link is valid for <strong>15 minutes</strong> only.",
  });

  if (!isSmtpConfigured()) {
    return res.status(503).json({
      message: "SMTP email is not configured",
      code: "MAIL_NOT_CONFIGURED",
    });
  }

  await sendMail(user.email, "QuickRide - Reset Password", mailHtml);

  res.status(200).json({ message: "Reset password email sent successfully" });
});

// Reset Password
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  const { token, password } = req.body;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await userModel.findById(payload.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = await userModel.hashPassword(password);
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});
