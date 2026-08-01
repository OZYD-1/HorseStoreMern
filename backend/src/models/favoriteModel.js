import { query } from "../config/database.js";

const BASE_SELECT = `
  SELECT p.*, f.created_at AS favorited_at
  FROM favorites f
  JOIN products p ON p.id = f.product_id
`;

export const FavoriteModel = {
  async findByUser(userId) {
    const { rows } = await query(`${BASE_SELECT} WHERE f.user_id = $1 ORDER BY f.created_at DESC`, [userId]);
    return rows;
  },

  async findOne(userId, productId) {
    const { rows } = await query(`SELECT * FROM favorites WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
    return rows[0] || null;
  },

  async create({ userId, productId }) {
    const { rows } = await query(
      `INSERT INTO favorites (user_id, product_id) VALUES ($1, $2) RETURNING *`,
      [userId, productId]
    );
    return rows[0];
  },

  async remove(userId, productId) {
    await query(`DELETE FROM favorites WHERE user_id = $1 AND product_id = $2`, [userId, productId]);
  },
};
