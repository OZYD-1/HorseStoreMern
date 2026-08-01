CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  address VARCHAR(255),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- data table for products
-- =========================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(10, 2) CHECK (sale_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  brand VARCHAR(100),
  images JSONB NOT NULL DEFAULT '[]',
  rating NUMERIC(2, 1) NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('simple', name));

-- =========================================================
--  table for cart items
-- =========================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- =========================================================
--  table for favorites
-- =========================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- =========================================================
--  table for orders
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_price NUMERIC(10, 2) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'cash_on_delivery'
    CHECK (payment_method IN ('cash_on_delivery', 'card')),
  notes VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =========================================================
--  table for order items (snapshot of price and name at time of purchase)
-- =========================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(150) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =========================================================
--  table for blogs
-- =========================================================
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(300),
  image VARCHAR(255),
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
--  Triggers to automatically update the updated_at column on update
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_blogs_updated_at ON blogs;
CREATE TRIGGER trg_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

--  admin user creation (if not exists)
--  email: admin@horsestore.com
--  password: Admin@123456
INSERT INTO users (name, email, password, role)
SELECT 'Super Admin', 'admin@horsestore.com', crypt('Admin@123456', gen_salt('bf')), 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@horsestore.com'
);

-- Insert default categories if they do not exist
INSERT INTO categories (name, slug) VALUES ('Smartphones', 'smartphones')
  ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Laptops', 'laptops')
  ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Tablets', 'tablets')
  ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name, slug) VALUES ('Mobile Accessories', 'mobile-accessories')
  ON CONFLICT (name) DO NOTHING;

-- =========================================================
-- demo data for products
-- =========================================================
 
-- Smartphones
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone 9', 'iphone-9', 'An apple mobile which is nothing like apple', 549, 494.10, 94, 'Apple',
  '["https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"]'::jsonb, 4.7, TRUE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-9');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone X', 'iphone-x', 'SIM-Free, Model A19211 6.5-inch Super Retina HD display', 899, 810.51, 34, 'Apple',
  '["https://cdn.dummyjson.com/product-images/2/thumbnail.jpg"]'::jsonb, 4.4, TRUE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-x');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Universe 9', 'samsung-universe-9', 'Samsung''s new variant which goes beyond Galaxy to the Universe', 1249, 1136.59, 36, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/3/thumbnail.jpg"]'::jsonb, 4.0, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-universe-9');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'OPPOF19', 'oppof19', 'OPPO F19 is officially announced on April 2021', 280, 254.80, 123, 'OPPO',
  '["https://cdn.dummyjson.com/product-images/4/thumbnail.jpg"]'::jsonb, 4.3, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'oppof19');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Huawei P30', 'huawei-p30', 'Huawei’s re-badged P30 offers a stunning quad-camera system', 499, NULL, 32, 'Huawei',
  '["https://cdn.dummyjson.com/product-images/5/thumbnail.jpg"]'::jsonb, 4.1, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'huawei-p30');
 
-- Laptops
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'MacBook Pro', 'macbook-pro', 'MacBook Pro 2021 with mini-LED display may launch between September, October', 1749, 1574.10, 83, 'Apple',
  '["https://cdn.dummyjson.com/product-images/6/thumbnail.jpg"]'::jsonb, 4.6, TRUE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'macbook-pro');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Galaxy Book', 'samsung-galaxy-book', 'Samsung Galaxy Book S (2020) Laptop With Intel Lakefield Chip', 1499, 1349.10, 50, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/7/thumbnail.jpg"]'::jsonb, 4.2, FALSE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-book');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Lenovo ThinkPad X1', 'lenovo-thinkpad-x1', 'Business ultrabook with legendary keyboard and long battery life', 1299, NULL, 60, 'Lenovo',
  '["https://cdn.dummyjson.com/product-images/8/thumbnail.jpg"]'::jsonb, 4.3, FALSE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'lenovo-thinkpad-x1');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Dell XPS 15', 'dell-xps-15', 'Premium laptop with InfinityEdge display and powerful performance', 1599, 1439.10, 45, 'Dell',
  '["https://cdn.dummyjson.com/product-images/9/thumbnail.jpg"]'::jsonb, 4.5, TRUE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'dell-xps-15');
 
-- Tablets
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPad Air', 'ipad-air', 'Colorful, gorgeous screen, powerful chip, all-day battery life', 599, 539.10, 70, 'Apple',
  '["https://cdn.dummyjson.com/product-images/10/thumbnail.jpg"]'::jsonb, 4.6, TRUE,
  (SELECT id FROM categories WHERE slug = 'tablets')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ipad-air');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Galaxy Tab S7', 'samsung-galaxy-tab-s7', 'Powerful tablet with S Pen included and stunning AMOLED display', 649, NULL, 55, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/11/thumbnail.jpg"]'::jsonb, 4.4, FALSE,
  (SELECT id FROM categories WHERE slug = 'tablets')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-tab-s7');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Lenovo Tab P11', 'lenovo-tab-p11', 'Affordable tablet with large display, perfect for entertainment', 279, 251.10, 90, 'Lenovo',
  '["https://cdn.dummyjson.com/product-images/12/thumbnail.jpg"]'::jsonb, 4.0, FALSE,
  (SELECT id FROM categories WHERE slug = 'tablets')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'lenovo-tab-p11');
 
-- Mobile Accessories
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Wireless Charging Pad', 'wireless-charging-pad', 'Fast wireless charging pad compatible with all Qi-enabled devices', 29.99, NULL, 200, 'Generic',
  '["https://cdn.dummyjson.com/product-images/13/thumbnail.jpg"]'::jsonb, 4.1, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'wireless-charging-pad');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Bluetooth Earbuds', 'bluetooth-earbuds', 'True wireless earbuds with noise cancellation and long battery life', 59.99, 49.99, 150, 'Generic',
  '["https://cdn.dummyjson.com/product-images/14/thumbnail.jpg"]'::jsonb, 4.3, TRUE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'bluetooth-earbuds');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Phone Tripod Stand', 'phone-tripod-stand', 'Adjustable tripod stand for smartphones, perfect for content creators', 19.99, NULL, 300, 'Generic',
  '["https://cdn.dummyjson.com/product-images/15/thumbnail.jpg"]'::jsonb, 3.9, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'phone-tripod-stand');
 
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Fast Charging Cable Set', 'fast-charging-cable-set', 'Pack of 3 durable fast-charging USB-C cables', 15.99, 12.99, 250, 'Generic',
  '["https://cdn.dummyjson.com/product-images/16/thumbnail.jpg"]'::jsonb, 4.2, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'fast-charging-cable-set');