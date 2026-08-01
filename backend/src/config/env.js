import dotenv from "dotenv";
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

const env = {
  port: process.env.PORT || 5000,
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminUrl: process.env.ADMIN_URL || "http://localhost:5174",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "horsestore",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access_secret",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },

  confirmToken: {
    secret: process.env.CONFIRM_TOKEN_SECRET || "confirm_secret",
    expires: process.env.CONFIRM_TOKEN_EXPIRES || "5m",
  },

  upload: {
    dir: process.env.UPLOAD_DIR || "uploads",
    maxSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  },
};

// Refuse to boot in production with well-known, publicly-visible default secrets.
if (nodeEnv === "production") {
  const insecureDefaults = [
    ["JWT_ACCESS_SECRET", env.jwt.accessSecret, "access_secret"],
    ["JWT_REFRESH_SECRET", env.jwt.refreshSecret, "refresh_secret"],
    ["CONFIRM_TOKEN_SECRET", env.confirmToken.secret, "confirm_secret"],
    ["DB_PASSWORD", env.db.password, "postgres"],
  ];
  const usedDefaults = insecureDefaults.filter(([, value, fallback]) => value === fallback);

  if (usedDefaults.length > 0) {
    const names = usedDefaults.map(([name]) => name).join(", ");
    console.error(
      `Refusing to start in production: the following env vars are missing and are falling back to insecure defaults: ${names}`
    );
    process.exit(1);
  }
}

export default env;