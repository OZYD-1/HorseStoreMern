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

-- ---------------------------------------------------------
-- Smartphones (15 new products, real photos)
-- ---------------------------------------------------------
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone 5s', 'iphone-5s', 'A compact classic with a reliable, well-rounded user experience.', 199.99, 174.15, 25, 'Apple',
  '["https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/1.webp"]'::jsonb, 2.8, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-5s');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone 6', 'iphone-6', 'A stylish larger-screen iPhone with solid everyday performance.', 299.99, 279.93, 60, 'Apple',
  '["https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/iphone-6/1.webp"]'::jsonb, 3.4, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-6');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone 13 Pro', 'iphone-13-pro', 'Flagship iPhone with a pro camera system and top-tier performance.', 1099.99, 996.85, 56, 'Apple',
  '["https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp"]'::jsonb, 4.1, TRUE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-13-pro');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Oppo A57', 'oppo-a57', 'A capable, affordable mid-ranger with a clean, sleek design.', 249.99, 243.92, 19, 'Oppo',
  '["https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/1.webp"]'::jsonb, 3.9, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'oppo-a57');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Oppo F19 Pro Plus', 'oppo-f19-pro-plus', 'Camera-focused Oppo flagship with strong photography features.', 399.99, 325.44, 78, 'Oppo',
  '["https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/1.webp"]'::jsonb, 3.5, TRUE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'oppo-f19-pro-plus');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Oppo K1', 'oppo-k1', 'Stylish design with reliable everyday performance.', 299.99, 245.14, 55, 'Oppo',
  '["https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/1.webp"]'::jsonb, 4.3, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'oppo-k1');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Realme C35', 'realme-c35', 'Budget-friendly phone with all the everyday essentials.', 149.99, 127.05, 48, 'Realme',
  '["https://cdn.dummyjson.com/product-images/smartphones/realme-c35/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/realme-c35/1.webp"]'::jsonb, 4.2, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'realme-c35');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Realme X', 'realme-x', 'Sleek mid-ranger balancing design, camera, and performance.', 299.99, 279.15, 12, 'Realme',
  '["https://cdn.dummyjson.com/product-images/smartphones/realme-x/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/realme-x/1.webp"]'::jsonb, 3.7, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'realme-x');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Realme XT', 'realme-xt', 'Camera-focused device with advanced sensors for photography fans.', 349.99, 309.72, 80, 'Realme',
  '["https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/realme-xt/1.webp"]'::jsonb, 4.6, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'realme-xt');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Galaxy S7', 'samsung-galaxy-s7', 'Flagship Samsung device with a sharp display and strong camera.', 299.99, 241.37, 67, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/1.webp"]'::jsonb, 3.3, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-s7');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Galaxy S8', 'samsung-galaxy-s8', 'Premium Infinity Display device with cutting-edge camera tech.', 499.99, 402.76, 0, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/1.webp"]'::jsonb, 4.4, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-s8');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Samsung Galaxy S10', 'samsung-galaxy-s10', 'Dynamic AMOLED flagship with a versatile multi-camera system.', 699.99, 660.87, 19, 'Samsung',
  '["https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/1.webp"]'::jsonb, 3.1, TRUE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'samsung-galaxy-s10');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Vivo S1', 'vivo-s1', 'Mid-range device blending sharp design with dependable performance.', 249.99, 224.58, 50, 'Vivo',
  '["https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/1.webp"]'::jsonb, 3.5, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'vivo-s1');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Vivo V9', 'vivo-v9', 'Notch-display phone built around a strong dual-camera selfie setup.', 299.99, 247.04, 82, 'Vivo',
  '["https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/1.webp"]'::jsonb, 3.6, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'vivo-v9');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Vivo X21', 'vivo-x21', 'Premium Vivo device with an in-display fingerprint sensor.', 499.99, 412.95, 7, 'Vivo',
  '["https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/thumbnail.webp","https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/1.webp"]'::jsonb, 4.3, FALSE,
  (SELECT id FROM categories WHERE slug = 'smartphones')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'vivo-x21');

-- ---------------------------------------------------------
-- Laptops (3 new products, real photos)
-- ---------------------------------------------------------
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Microsoft Surface Laptop 4', 'microsoft-surface-laptop-4', 'A refined, portable touchscreen laptop for work and creativity.', 1499, 1345.65, 68, 'Microsoft Surface',
  '["https://cdn.dummyjson.com/product-images/8/thumbnail.jpg"]'::jsonb, 4.4, TRUE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'microsoft-surface-laptop-4');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Infinix INBOOK', 'infinix-inbook', 'Infinix Inbook X1 — Core i3 10th Gen, 8GB RAM, 256GB SSD.', 1099, 969.14, 96, 'Infinix',
  '["https://cdn.dummyjson.com/product-images/9/thumbnail.jpg"]'::jsonb, 4.5, FALSE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'infinix-inbook');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'HP Pavilion 15-DK1056WM', 'hp-pavilion-15-dk1056wm', 'Gaming laptop — Core i5 10th Gen, 8GB RAM, GTX 1650 4GB.', 1099, 1030.09, 89, 'HP Pavilion',
  '["https://cdn.dummyjson.com/product-images/10/thumbnail.jpg"]'::jsonb, 4.4, FALSE,
  (SELECT id FROM categories WHERE slug = 'laptops')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'hp-pavilion-15-dk1056wm');

-- ---------------------------------------------------------
-- Mobile Accessories (7 new products, real photos)
-- ---------------------------------------------------------
INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Apple AirPods Max Silver', 'apple-airpods-max-silver', 'Premium over-ear headphones with adaptive EQ and active noise cancellation.', 549.99, 474.83, 59, 'Apple',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp"]'::jsonb, 3.5, TRUE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'apple-airpods-max-silver');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Apple iPhone Charger', 'apple-iphone-charger', 'High-quality charger for fast, efficient iPhone charging.', 19.99, 16.28, 31, 'Apple',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp"]'::jsonb, 4.2, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'apple-iphone-charger');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Apple MagSafe Battery Pack', 'apple-magsafe-battery-pack', 'Portable battery pack that attaches magnetically to MagSafe iPhones.', 99.99, 82.85, 1, 'Apple',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp"]'::jsonb, 3.6, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'apple-magsafe-battery-pack');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Beats Flex Wireless Earphones', 'beats-flex-wireless-earphones', 'Comfortable magnetic wireless earbuds with up to 12 hours battery life.', 49.99, 47.13, 50, 'Beats',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/1.webp"]'::jsonb, 4.2, TRUE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'beats-flex-wireless-earphones');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'iPhone 12 Silicone Case with MagSafe (Plum)', 'iphone-12-silicone-case-magsafe-plum', 'Stylish, protective silicone case for iPhone 12 with MagSafe support.', 29.99, 25.84, 69, 'Apple',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/1.webp"]'::jsonb, 3.6, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'iphone-12-silicone-case-magsafe-plum');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Selfie Lamp with iPhone Clip', 'selfie-lamp-with-iphone-clip', 'Adjustable LED clip-on light for brighter selfies and video calls.', 14.99, 12.08, 58, 'GadgetMaster',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/1.webp"]'::jsonb, 3.6, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'selfie-lamp-with-iphone-clip');

INSERT INTO products (name, slug, description, price, sale_price, stock, brand, images, rating, is_featured, category_id)
SELECT 'Selfie Stick Monopod', 'selfie-stick-monopod', 'Extendable, foldable monopod compatible with smartphones and cameras.', 12.99, 10.51, 11, 'SnapTech',
  '["https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp","https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/1.webp"]'::jsonb, 3.9, FALSE,
  (SELECT id FROM categories WHERE slug = 'mobile-accessories')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = 'selfie-stick-monopod');