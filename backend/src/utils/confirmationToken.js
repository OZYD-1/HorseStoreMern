import jwt from "jsonwebtoken";
import env from "../config/env.js";

export function issueConfirmToken({ action, resourceId, userId, extra = {} }) {
  return jwt.sign(
    { action, resourceId, userId, extra, purpose: "double-confirm" },
    env.confirmToken.secret,
    { expiresIn: env.confirmToken.expires }
  );
}

export function verifyConfirmToken(token) {
  return jwt.verify(token, env.confirmToken.secret);
}

export function assertConfirmTokenMatches(token, { action, resourceId, userId }) {
  const payload = verifyConfirmToken(token);
  if (payload.purpose !== "double-confirm") return false;
  if (payload.action !== action) return false;
  if (String(payload.resourceId) !== String(resourceId)) return false;
  if (String(payload.userId) !== String(userId)) return false;
  return true;
}
