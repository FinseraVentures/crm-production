// src/config/config.js
import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * Soft env getter (warns only)
 */
const env = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`[ENV WARNING] Missing environment variable: ${key}`);
  }
  return value ?? defaultValue;
};

/**
 * Hard env getter (crashes app if missing)
 */
const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

const NODE_ENV = env("NODE_ENV", "production"); // development | production | test
const isDev = NODE_ENV === "development";
const isTest = NODE_ENV === "test";
const isProd = NODE_ENV === "production";

/**
 * Resolve Mongo URI with HARD guard in production
 */
const resolveMongoUri = () => {
  if (isDev) return env("MONGO_URI_DEV", env("MONGO_URI"));
  if (isTest) return env("MONGO_URI_TEST", env("MONGO_URI"));
  return requireEnv("MONGO_URI_PROD"); // 🔒 HARD
};

/**
 * Resolve backup Mongo URI (soft – cron only)
 */
const resolveBackupUri = () => {
  if (isDev) return env("MONGO_BACKUP_URI_DEV", env("MONGO_BACKUP_URI"));
  if (isTest) return env("MONGO_BACKUP_URI_TEST", env("MONGO_BACKUP_URI"));
  return env("MONGO_BACKUP_URI_PROD", env("MONGO_BACKUP_URI"));
};

/**
 * 🔒 HARD guards for production-only secrets
 */
if (isProd) {
  requireEnv("JWT_SECRET");
  requireEnv("RAZORPAY_KEY_ID");
  requireEnv("RAZORPAY_KEY_SECRET");
}

export default {
  nodeEnv: NODE_ENV,
  isDev,
  isTest,
  isProd,

  server: {
    port: env("PORT", 5000),
  },

  database: {
    uri: resolveMongoUri(), // primary DB (hard in prod)
    backupUri: resolveBackupUri(), // backup DB (soft)
  },

  auth: {
    jwtSecret: isProd ? requireEnv("JWT_SECRET") : env("JWT_SECRET"),
    jwtExpiresIn: env("JWT_EXPIRES_IN", "7d"),
  },

  logging: {
    level: env("LOG_LEVEL", isDev ? "debug" : "info"),
    toConsole: env("LOG_TO_CONSOLE", "true") === "true",
    toFile: env("LOG_TO_FILE", isProd ? "true" : "false") === "true",
    directory: env("LOG_DIRECTORY", "logs"),
    compress: env("LOG_COMPRESS", isProd ? "true" : "false") === "true",

    external: {
      host: env("LOG_EXTERNAL_HOST", ""),
      port: env("LOG_EXTERNAL_PORT", ""),
      token: env("LOG_EXTERNAL_TOKEN", ""),
    },
  },

  cors: {
    origin: env("CORS_ORIGIN", "*"),
  },

  rateLimit: {
    windowMs: env("RATE_LIMIT_WINDOW", "15m"),
    max: env("RATE_LIMIT_MAX", 100),
  },

  razorpay: {
    keyId: isProd ? requireEnv("RAZORPAY_KEY_ID") : env("RAZORPAY_KEY_ID"),
    keySecret: isProd
      ? requireEnv("RAZORPAY_KEY_SECRET")
      : env("RAZORPAY_KEY_SECRET"),
  },

  appscript: {
    url: env("APPSCRIPT_URL"),
    secret: env("APPSCRIPT_SECRET"),
  },
};
