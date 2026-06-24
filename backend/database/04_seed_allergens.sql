INSERT INTO allergens (name, slug, emoji, description)
VALUES
  ('Gluten', 'gluten', '🌾', 'Cereales que contienen gluten y productos derivados.'),
  ('Crustáceos', 'crustaceos', '🦐', 'Crustáceos y productos a base de crustáceos.'),
  ('Huevo', 'huevo', '🥚', 'Huevos y productos a base de huevo.'),
  ('Pescado', 'pescado', '🐟', 'Pescado y productos a base de pescado.'),
  ('Cacahuetes', 'cacahuetes', '🥜', 'Cacahuetes y productos a base de cacahuetes.'),
  ('Soja', 'soja', '🫘', 'Soja y productos a base de soja.'),
  ('Leche', 'leche', '🥛', 'Leche y derivados, incluida la lactosa.'),
  ('Frutos de cáscara', 'frutos-de-cascara', '🌰', 'Frutos de cáscara y productos derivados.'),
  ('Apio', 'apio', '🌿', 'Apio y productos derivados.'),
  ('Mostaza', 'mostaza', '🟡', 'Mostaza y productos derivados.'),
  ('Sésamo', 'sesamo', '⚪', 'Granos de sésamo y productos derivados.'),
  ('Sulfitos', 'sulfitos', '🍷', 'Dióxido de azufre y sulfitos en concentraciones declarables.'),
  ('Altramuces', 'altramuces', '🌼', 'Altramuces y productos a base de altramuces.'),
  ('Moluscos', 'moluscos', '🦪', 'Moluscos y productos a base de moluscos.')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description;
