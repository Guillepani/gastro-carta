ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS menu_theme text NOT NULL DEFAULT 'classic';

ALTER TABLE restaurants
  DROP CONSTRAINT IF EXISTS restaurants_menu_theme_valid;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_menu_theme_valid
  CHECK (menu_theme IN ('classic', 'warm', 'minimal', 'dark', 'fresh'));

UPDATE restaurants
SET menu_theme = 'classic'
WHERE menu_theme IS NULL;
