import { query } from "../config/database.js";

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export const ProductModel = {
  async list({ page = 1, limit = 12, search = "", categoryId, minPrice, maxPrice, sort = "newest", featured, onlyActive = true }) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (onlyActive) conditions.push(`p.is_active = TRUE`);
    if (search) {
      conditions.push(`p.name ILIKE $${idx}`);
      params.push(`%${search}%`);
      idx++;
    }
    if (categoryId) {
      conditions.push(`p.category_id = $${idx}`);
      params.push(categoryId);
      idx++;
    }
    if (featured === "true" || featured === true) {
      conditions.push(`p.is_featured = TRUE`);
    }
    if (minPrice) {
      conditions.push(`p.price >= $${idx}`);
      params.push(minPrice);
      idx++;
    }
    if (maxPrice) {
      conditions.push(`p.price <= $${idx}`);
      params.push(maxPrice);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderBy =
      sort === "price_asc" ? "p.price ASC" :
      sort === "price_desc" ? "p.price DESC" :
      sort === "rating" ? "p.rating DESC" :
      "p.created_at DESC";

    const offset = (Number(page) - 1) * Number(limit);
    const listParams = [...params, limit, offset];

    const { rows } = await query(
      `${BASE_SELECT} ${whereClause} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx + 1}`,
      listParams
    );

    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM products p ${whereClause}`,
      params
    );

    return { rows, total: countResult.rows[0].count };
  },

  async findBySlug(slug, { onlyActive = true } = {}) {
    const clause = onlyActive ? "AND p.is_active = TRUE" : "";
    const { rows } = await query(`${BASE_SELECT} WHERE p.slug = $1 ${clause}`, [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(`${BASE_SELECT} WHERE p.id = $1`, [id]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = null) {
    const { rows } = excludeId
      ? await query(`SELECT id FROM products WHERE slug = $1 AND id != $2`, [slug, excludeId])
      : await query(`SELECT id FROM products WHERE slug = $1`, [slug]);
    return rows.length > 0;
  },

  async create({ name, slug, description, price, salePrice, stock, brand, categoryId, isFeatured, images }) {
    const { rows } = await query(
      `INSERT INTO products (name, slug, description, price, sale_price, stock, brand, category_id, is_featured, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        name, slug, description || null, price, salePrice || null, stock || 0,
        brand || null, categoryId || null, !!isFeatured, JSON.stringify(images || []),
      ]
    );
    return rows[0];
  },

  async update(id, { name, slug, description, price, salePrice, stock, brand, categoryId, isFeatured, isActive, images }) {
    const { rows } = await query(
      `UPDATE products SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         sale_price = COALESCE($5, sale_price),
         stock = COALESCE($6, stock),
         brand = COALESCE($7, brand),
         category_id = COALESCE($8, category_id),
         is_featured = COALESCE($9, is_featured),
         is_active = COALESCE($10, is_active),
         images = COALESCE($11, images)
       WHERE id = $12
       RETURNING *`,
      [
        name ?? null, slug ?? null, description ?? null, price ?? null, salePrice ?? null,
        stock ?? null, brand ?? null, categoryId ?? null, isFeatured ?? null, isActive ?? null,
        images ? JSON.stringify(images) : null, id,
      ]
    );
    return rows[0];
  },

  async remove(id) {
    await query(`DELETE FROM products WHERE id = $1`, [id]);
  },

  async decrementStock(id, quantity, client) {
    const exec = client ? client.query.bind(client) : query;
    const { rows } = await exec(
      `UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING *`,
      [quantity, id]
    );
    return rows[0];
  },

  async incrementStock(id, quantity, client) {
    const exec = client ? client.query.bind(client) : query;
    const { rows } = await exec(
      `UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *`,
      [quantity, id]
    );
    return rows[0];
  },

  async count() {
    const { rows } = await query(`SELECT COUNT(*)::int AS count FROM products`);
    return rows[0].count;
  },

  async countLowStock(threshold = 5) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM products WHERE stock <= $1 AND is_active = TRUE`,
      [threshold]
    );
    return rows[0].count;
  },
};
