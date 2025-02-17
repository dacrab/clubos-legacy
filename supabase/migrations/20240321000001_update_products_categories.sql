-- Add new category reference columns
ALTER TABLE products
ADD COLUMN category_id UUID REFERENCES categories(id),
ADD COLUMN subcategory_id UUID REFERENCES categories(id);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);

-- Drop old category columns (after migrating data if needed)
ALTER TABLE products
DROP COLUMN category,
DROP COLUMN subcategory; 