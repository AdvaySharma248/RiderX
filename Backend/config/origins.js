const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ""));

const isProduction = () => process.env.ENVIRONMENT === "production";

const getHostname = (origin) => {
  try {
    return new URL(origin).hostname;
  } catch {
    return "";
  }
};

const isLocalOrigin = (origin) => {
  const hostname = getHostname(origin);
  return hostname === "localhost" || hostname === "127.0.0.1";
};

const buildAllowedOrigins = () => {
  const configured = [
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
    ...parseOrigins(process.env.FRONTEND_ORIGIN),
    ...parseOrigins(process.env.CLIENT_URL),
  ];

  const hasLocalConfiguredOrigin = configured.some(isLocalOrigin);
  if (!isProduction() || hasLocalConfiguredOrigin) {
    configured.push(...DEV_ORIGINS);
  }

  return Array.from(new Set(configured));
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, "");
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // If local development origins are enabled, allow localhost/127.0.0.1 on any port.
  const localOriginsEnabled = allowedOrigins.some(isLocalOrigin);
  if (!localOriginsEnabled) {
    return false;
  }

  return isLocalOrigin(normalizedOrigin);
};

module.exports = {
  buildAllowedOrigins,
  isOriginAllowed,
  isProduction,
};
