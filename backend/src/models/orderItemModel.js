import { query } from "../config/database.js";

export const OrderItemModel = {
  async create({ orderId, productId, productName, quantity, price }, client) {
    const exec = client ? client.query.bind(client) : query;
    const { rows } = await exec(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [orderId, productId, productName, quantity, price]
    );
    return rows[0];
  },

  async findByOrder(orderId) {
    const { rows } = await query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);
    return rows;
  },
};
