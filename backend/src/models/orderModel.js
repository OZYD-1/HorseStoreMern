import { query } from "../config/database.js";

export const OrderModel = {
  async create({ userId, totalPrice, shippingAddress, phone, paymentMethod, notes }, client) {
    const exec = client ? client.query.bind(client) : query;
    const { rows } = await exec(
      `INSERT INTO orders (user_id, total_price, shipping_address, phone, payment_method, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [userId, totalPrice, shippingAddress, phone, paymentMethod || "cash_on_delivery", notes || null]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query(`SELECT * FROM orders WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findByIdForUser(id, userId) {
    const { rows } = await query(`SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [id, userId]);
    return rows[0] || null;
  },

  async findByUser(userId) {
    const { rows } = await query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
    return rows;
  },

  async findAll({ status, limit = 20, offset = 0 }) {
    const conditions = [];
    const params = [];
    let idx = 1;
    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const listParams = [...params, limit, offset];

    const { rows } = await query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      listParams
    );
    const countResult = await query(`SELECT COUNT(*)::int AS count FROM orders ${whereClause}`, params);

    return { rows, total: countResult.rows[0].count };
  },

  async updateStatus(id, status, client) {
    const exec = client ? client.query.bind(client) : query;
    const { rows } = await exec(`UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`, [status, id]);
    return rows[0];
  },

  async count() {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM orders`);
    return rows[0].count;
  },

  async countByStatus(status) {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM orders WHERE status = $1`, [status]);
    return rows[0].count;
  },

  async sumRevenue(statuses = ["confirmed", "shipped", "delivered"]) {
    const { rows } = await query(
      `SELECT COALESCE(SUM(total_price), 0)::float AS total FROM orders WHERE status = ANY($1)`,
      [statuses]
    );
    return rows[0].total;
  },

  async recent(limit = 5) {
    const { rows } = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT $1`, [limit]);
    return rows;
  },
};
