import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
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
