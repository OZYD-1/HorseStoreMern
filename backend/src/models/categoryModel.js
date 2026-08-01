import { query } from "../config/database.js";

export const CategoryModel = {
  async findAllActive() {
    const { rows } = await query(
      `SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC`
    );
    return rows;
  },

  async findAll() {
    const { rows } = await query(`SELECT * FROM categories ORDER BY name ASC`);
    return rows;
  },

  async findById(id) {
    const { rows } = await query(`SELECT * FROM categories WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const { rows } = await query(`SELECT * FROM categories WHERE slug = $1`, [slug]);
    return rows[0] || null;
  },

  async findByName(name) {
    const { rows } = await query(`SELECT * FROM categories WHERE name = $1`, [name]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = null) {
    const { rows } = excludeId
      ? await query(`SELECT id FROM categories WHERE slug = $1 AND id != $2`, [slug, excludeId])
      : await query(`SELECT id FROM categories WHERE slug = $1`, [slug]);
    return rows.length > 0;
  },

  async create({ name, slug, image }) {
    const { rows } = await query(
      `INSERT INTO categories (name, slug, image) VALUES ($1, $2, $3) RETURNING *`,
      [name, slug, image || null]
    );
    return rows[0];
  },

  async update(id, { name, slug, image, isActive }) {
    const { rows } = await query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         image = COALESCE($3, image),
         is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
      [name ?? null, slug ?? null, image ?? null, isActive ?? null, id]
    );
    return rows[0];
  },

  async remove(id) {
    await query(`DELETE FROM categories WHERE id = $1`, [id]);
  },

  async countProductsInCategory(categoryId) {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM products WHERE category_id = $1`, [categoryId]);
    return rows[0].count;
  },

  async count() {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM categories`);
    return rows[0].count;
  },
};
