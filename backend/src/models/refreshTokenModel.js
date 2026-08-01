import { query } from "../config/database.js";

export const RefreshTokenModel = {
  async create({ token, userId, expiresAt }) {
    const { rows } = await query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [token, userId, expiresAt]
    );
    return rows[0];
  },

  async findValid({ token, userId }) {
    const { rows } = await query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND user_id = $2 AND revoked = FALSE
       LIMIT 1`,
      [token, userId]
    );
    return rows[0] || null;
  },

  async revokeByToken(token) {
    await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1`, [token]);
  },

  async revokeAllForUser(userId) {
    await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [userId]);
  },
};
