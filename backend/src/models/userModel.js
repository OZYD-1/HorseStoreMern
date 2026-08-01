import bcrypt from "bcryptjs";
import { query } from "../config/database.js";

/**
 * كل دالة هون = استعلام SQL خام واحد أو أكثر، بدون أي ORM.
 */

function toSafeUser(row) {
  if (!row) return null;
  const { password, ...safe } = row;
  return safe;
}

export const UserModel = {
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async create({ name, email, password, phone, address, role = "user" }) {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, password, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, hashed, phone || null, address || null, role]
    );
    return rows[0];
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const { rows } = await query(
      `UPDATE users SET password = $1 WHERE id = $2 RETURNING *`,
      [hashed, id]
    );
    return rows[0];
  },

  async updateProfile(id, { name, phone, address, avatar }) {
    const { rows } = await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         address = COALESCE($3, address),
         avatar = COALESCE($4, avatar)
       WHERE id = $5
       RETURNING *`,
      [name ?? null, phone ?? null, address ?? null, avatar ?? null, id]
    );
    return rows[0];
  },

  async setActive(id, isActive) {
    const { rows } = await query(
      `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
    return rows[0];
  },

  async remove(id) {
    await query("DELETE FROM users WHERE id = $1", [id]);
  },

  async count() {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'user'`);
    return rows[0].count;
  },

  async list({ limit = 20, offset = 0, search = "" }) {
    const listWhere = search ? `WHERE name ILIKE $3 OR email ILIKE $3` : "";
    const countWhere = search ? `WHERE name ILIKE $1 OR email ILIKE $1` : "";

    const { rows } = await query(
      `SELECT id, name, email, phone, address, role, is_active, created_at
       FROM users
       ${listWhere}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      search ? [limit, offset, `%${search}%`] : [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM users ${countWhere}`,
      search ? [`%${search}%`] : []
    );

    return { rows, total: countResult.rows[0].count };
  },

  toSafeUser,
};