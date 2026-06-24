CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(320) NOT NULL,
  password_hash text NOT NULL,
  name varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_email_not_blank CHECK (btrim(email) <> ''),
  CONSTRAINT admin_users_email_format CHECK (position('@' IN email) > 1),
  CONSTRAINT admin_users_password_hash_not_blank CHECK (btrim(password_hash) <> ''),
  CONSTRAINT admin_users_name_not_blank CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_unique_idx
  ON admin_users (lower(email));

CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  slug varchar(160) NOT NULL UNIQUE,
  description text,
  address text,
  phone varchar(40),
  email varchar(320),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurants_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT restaurants_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT restaurants_email_format CHECK (email IS NULL OR position('@' IN email) > 1)
);

CREATE INDEX IF NOT EXISTS restaurants_admin_user_id_idx
  ON restaurants (admin_user_id);

CREATE INDEX IF NOT EXISTS restaurants_active_slug_idx
  ON restaurants (slug)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL,
  slug varchar(120) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT categories_sort_order_non_negative CHECK (sort_order >= 0),
  CONSTRAINT categories_restaurant_slug_unique UNIQUE (restaurant_id, slug),
  CONSTRAINT categories_id_restaurant_unique UNIQUE (id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS categories_restaurant_id_idx
  ON categories (restaurant_id);

CREATE INDEX IF NOT EXISTS categories_restaurant_sort_idx
  ON categories (restaurant_id, sort_order);

CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  category_id uuid NOT NULL,
  name varchar(120) NOT NULL,
  slug varchar(120) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subcategories_category_restaurant_fk
    FOREIGN KEY (category_id, restaurant_id)
    REFERENCES categories(id, restaurant_id)
    ON DELETE CASCADE,
  CONSTRAINT subcategories_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT subcategories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT subcategories_sort_order_non_negative CHECK (sort_order >= 0),
  CONSTRAINT subcategories_category_slug_unique UNIQUE (category_id, slug),
  CONSTRAINT subcategories_id_category_restaurant_unique
    UNIQUE (id, category_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS subcategories_restaurant_id_idx
  ON subcategories (restaurant_id);

CREATE INDEX IF NOT EXISTS subcategories_category_sort_idx
  ON subcategories (category_id, sort_order);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  category_id uuid NOT NULL,
  subcategory_id uuid,
  name varchar(160) NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_category_restaurant_fk
    FOREIGN KEY (category_id, restaurant_id)
    REFERENCES categories(id, restaurant_id)
    ON DELETE CASCADE,
  CONSTRAINT products_subcategory_category_restaurant_fk
    FOREIGN KEY (subcategory_id, category_id, restaurant_id)
    REFERENCES subcategories(id, category_id, restaurant_id)
    ON DELETE SET NULL (subcategory_id),
  CONSTRAINT products_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT products_price_non_negative CHECK (price >= 0),
  CONSTRAINT products_sort_order_non_negative CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS products_restaurant_id_idx
  ON products (restaurant_id);

CREATE INDEX IF NOT EXISTS products_category_sort_idx
  ON products (category_id, sort_order);

CREATE INDEX IF NOT EXISTS products_subcategory_id_idx
  ON products (subcategory_id)
  WHERE subcategory_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS products_public_menu_idx
  ON products (restaurant_id, is_available, sort_order);

CREATE TABLE IF NOT EXISTS allergens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(80) NOT NULL UNIQUE,
  slug varchar(80) NOT NULL UNIQUE,
  emoji varchar(16) NOT NULL,
  description text NOT NULL,
  CONSTRAINT allergens_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT allergens_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT allergens_emoji_not_blank CHECK (btrim(emoji) <> ''),
  CONSTRAINT allergens_description_not_blank CHECK (btrim(description) <> '')
);

CREATE TABLE IF NOT EXISTS product_allergens (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  allergen_id uuid NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, allergen_id)
);

CREATE INDEX IF NOT EXISTS product_allergens_allergen_id_idx
  ON product_allergens (allergen_id);
