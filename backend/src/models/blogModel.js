import { query } from "../config/database.js";

const BASE_SELECT = `
  SELECT b.*, u.name AS author_name
  FROM blogs b
  LEFT JOIN users u ON u.id = b.author_id
`;

export const BlogModel = {
  async list({ limit = 9, offset = 0, onlyPublished = true }) {
    const whereClause = onlyPublished ? "WHERE b.is_published = TRUE" : "";
    const { rows } = await query(
      `${BASE_SELECT} ${whereClause} ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*)::int AS count FROM blogs b ${whereClause}`);
    return { rows, total: countResult.rows[0].count };
  },

  async findBySlug(slug, { onlyPublished = true } = {}) {
    const clause = onlyPublished ? "AND b.is_published = TRUE" : "";
    const { rows } = await query(`${BASE_SELECT} WHERE b.slug = $1 ${clause}`, [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(`${BASE_SELECT} WHERE b.id = $1`, [id]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = null) {
    const { rows } = excludeId
      ? await query(`SELECT id FROM blogs WHERE slug = $1 AND id != $2`, [slug, excludeId])
      : await query(`SELECT id FROM blogs WHERE slug = $1`, [slug]);
    return rows.length > 0;
  },

  async create({ title, slug, content, excerpt, image, authorId }) {
    const { rows } = await query(
      `INSERT INTO blogs (title, slug, content, excerpt, image, author_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, slug, content, excerpt || null, image || null, authorId || null]
    );
    return rows[0];
  },

  async update(id, { title, slug, content, excerpt, image, isPublished }) {
    const { rows } = await query(
      `UPDATE blogs SET
         title = COALESCE($1, title),
         slug = COALESCE($2, slug),
         content = COALESCE($3, content),
         excerpt = COALESCE($4, excerpt),
         image = COALESCE($5, image),
         is_published = COALESCE($6, is_published)
       WHERE id = $7
       RETURNING *`,
      [title ?? null, slug ?? null, content ?? null, excerpt ?? null, image ?? null, isPublished ?? null, id]
    );
    return rows[0];
  },

  async remove(id) {
    await query(`DELETE FROM blogs WHERE id = $1`, [id]);
  },
};