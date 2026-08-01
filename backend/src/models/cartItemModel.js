import { query } from "../config/database.js";

const BASE_SELECT = `
  SELECT ci.*, p.name, p.slug, p.price, p.sale_price, p.images, p.stock, p.is_active,
         p.created_at AS product_created_at
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
`;

export const CartItemModel = {
  async findByUser(userId) {
    const { rows } = await query(`${BASE_SELECT} WHERE ci.user_id = $1 ORDER BY ci.created_at DESC`, [userId]);
    return rows;
  },

  async findOne(userId, productId) {
    const { rows } = await query(
      `SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    return rows[0] || null;
  },

  async findById(id, userId) {
    const { rows } = await query(`${BASE_SELECT} WHERE ci.id = $1 AND ci.user_id = $2`, [id, userId]);
    return rows[0] || null;
  },

  async create({ userId, productId, quantity }) {
    const { rows } = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
      [userId, productId, quantity]
    );
    return rows[0];
  },

  async updateQuantity(id, quantity) {
    const { rows } = await query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *`,
      [quantity, id]
    );
    return rows[0];
  },

  async remove(id) {
    await query(`DELETE FROM cart_items WHERE id = $1`, [id]);
  },

  async clearForUser(userId) {
    await query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
  },

  async countForUser(userId) {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM cart_items WHERE user_id = $1`, [userId]);
    return rows[0].count;
  },
};
