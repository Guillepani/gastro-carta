DROP POLICY IF EXISTS admin_users_backend_access ON admin_users;
CREATE POLICY admin_users_backend_access
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS restaurants_backend_access ON restaurants;
CREATE POLICY restaurants_backend_access
  ON restaurants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS categories_backend_access ON categories;
CREATE POLICY categories_backend_access
  ON categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS subcategories_backend_access ON subcategories;
CREATE POLICY subcategories_backend_access
  ON subcategories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS products_backend_access ON products;
CREATE POLICY products_backend_access
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS allergens_backend_access ON allergens;
CREATE POLICY allergens_backend_access
  ON allergens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS product_allergens_backend_access ON product_allergens;
CREATE POLICY product_allergens_backend_access
  ON product_allergens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
