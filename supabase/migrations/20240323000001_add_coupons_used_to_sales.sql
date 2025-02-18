-- Begin transaction
BEGIN;

-- Add columns to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS coupons_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS treat_items_sold INTEGER DEFAULT 0;

-- Update existing sales to have default values
UPDATE sales
SET 
    coupons_used = 0,
    items_sold = 0,
    treat_items_sold = 0
WHERE coupons_used IS NULL 
   OR items_sold IS NULL 
   OR treat_items_sold IS NULL;

-- Add check constraints
ALTER TABLE sales
ADD CONSTRAINT coupons_used_not_negative CHECK (coupons_used >= 0),
ADD CONSTRAINT items_sold_not_negative CHECK (items_sold >= 0),
ADD CONSTRAINT treat_items_sold_not_negative CHECK (treat_items_sold >= 0);

COMMIT; 