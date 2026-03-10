const axios = require("axios");

const normalizeBaseUrl = (url) => String(url || "").trim().replace(/\/+$/, "");
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getSupabaseConfig = () => {
  const url = normalizeBaseUrl(process.env.SUPABASE_URL);
  const apiKey = String(process.env.SUPABASE_ANON_KEY || "").trim();
  const provider = String(process.env.EMAIL_VERIFICATION_PROVIDER || "").trim().toLowerCase();

  return {
    url,
    apiKey,
    provider,
  };
};

const isSupabaseVerificationEnabled = () => {
  const { url, apiKey, provider } = getSupabaseConfig();
  if (!url || !apiKey) {
    return false;
  }

  return provider === "supabase";
};

const buildHeaders = (apiKey) => ({
  apikey: apiKey,
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
});

const buildVerificationRedirectUrl = (userType) => {
  const clientUrl = normalizeBaseUrl(process.env.CLIENT_URL);
  if (!clientUrl) {
    return undefined;
  }

  const normalizedUserType = userType === "captain" ? "captain" : "user";
  return `${clientUrl}/${normalizedUserType}/verify-email`;
};

const getErrorMessage = (error, fallback) => {
  if (error?.response?.data) {
    const payload = error.response.data;
    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }

    if (payload.msg) {
      return payload.msg;
    }

    if (payload.error_description) {
      return payload.error_description;
    }

    if (payload.error) {
      return payload.error;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return fallback;
};

const postSupabaseAuth = async (path, payload, apiKey, fallbackMessage) => {
  const { url } = getSupabaseConfig();
  const endpoint = `${url}${path}`;

  try {
    const response = await axios.post(endpoint, payload, {
      headers: buildHeaders(apiKey),
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, fallbackMessage));
  }
};

const signUpWithEmailLink = async ({ email, password, userType }) => {
  const { apiKey } = getSupabaseConfig();
  const redirectTo = buildVerificationRedirectUrl(userType);
  const payload = {
    email: normalizeEmail(email),
    password: String(password || ""),
    data: {
      userType: userType === "captain" ? "captain" : "user",
    },
  };

  if (redirectTo) {
    payload.email_redirect_to = redirectTo;
  }

  return postSupabaseAuth(
    "/auth/v1/signup",
    payload,
    apiKey,
    "Failed to start Supabase email signup"
  );
};

const resendVerificationLink = async ({ email, userType }) => {
  const { url, apiKey } = getSupabaseConfig();
  if (!url || !apiKey) {
    throw new Error("Supabase email verification is not configured");
  }

  const payload = {
    type: "signup",
    email: normalizeEmail(email),
  };

  const redirectTo = buildVerificationRedirectUrl(userType);
  if (redirectTo) {
    payload.email_redirect_to = redirectTo;
  }

  return postSupabaseAuth(
    "/auth/v1/resend",
    payload,
    apiKey,
    "Failed to resend verification email"
  );
};

const ensureSupabaseSignup = async ({ email, password, userType }) => {
  const { url, apiKey } = getSupabaseConfig();
  if (!url || !apiKey) {
    throw new Error("Supabase email verification is not configured");
  }

  try {
    const signUpResult = await signUpWithEmailLink({ email, password, userType });
    const looksLikeExistingUserResponse =
      Array.isArray(signUpResult?.identities) && signUpResult.identities.length === 0;

    if (looksLikeExistingUserResponse) {
      return resendVerificationLink({ email, userType });
    }

    return signUpResult;
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("already registered") || message.includes("user already exists")) {
      return resendVerificationLink({ email, userType });
    }
    throw error;
  }
};

const sendVerificationOtp = async (email) => {
  const { url, apiKey } = getSupabaseConfig();
  if (!url || !apiKey) {
    throw new Error("Supabase email verification is not configured");
  }

  const endpoint = `${url}/auth/v1/otp`;
  try {
    await axios.post(
      endpoint,
      {
        email,
        create_user: true,
      },
      {
        headers: buildHeaders(apiKey),
        timeout: 15000,
      }
    );
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to send verification code"));
  }
};

const verifyEmailOtp = async ({ email, otp }) => {
  const { url, apiKey } = getSupabaseConfig();
  if (!url || !apiKey) {
    throw new Error("Supabase email verification is not configured");
  }

  const endpoint = `${url}/auth/v1/verify`;
  const candidateTypes = ["email", "magiclink", "signup"];
  let lastErrorMessage = "Invalid or expired OTP";

  for (const type of candidateTypes) {
    try {
      const response = await axios.post(
        endpoint,
        {
          email,
          token: String(otp).trim(),
          type,
        },
        {
          headers: buildHeaders(apiKey),
          timeout: 15000,
        }
      );

      if (response?.status >= 200 && response?.status < 300) {
        return response.data;
      }
    } catch (error) {
      lastErrorMessage = getErrorMessage(error, lastErrorMessage);
    }
  }

  throw new Error(lastErrorMessage);
};

const verifyEmailTokenHash = async ({ tokenHash, type }) => {
  const { url, apiKey } = getSupabaseConfig();
  if (!url || !apiKey) {
    throw new Error("Supabase email verification is not configured");
  }

  const normalizedTokenHash = String(tokenHash || "").trim();
  if (!normalizedTokenHash) {
    throw new Error("Verification token hash is required");
  }

  const normalizedType = String(type || "").trim().toLowerCase() || "signup";
  return postSupabaseAuth(
    "/auth/v1/verify",
    {
      token_hash: normalizedTokenHash,
      type: normalizedType,
    },
    apiKey,
    "Failed to verify email token"
  );
};

module.exports = {
  isSupabaseVerificationEnabled,
  ensureSupabaseSignup,
  resendVerificationLink,
  sendVerificationOtp,
  verifyEmailOtp,
  verifyEmailTokenHash,
};
