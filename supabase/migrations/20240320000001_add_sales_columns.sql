-- Add treat and coupon columns to sales table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'is_treat') THEN
        ALTER TABLE sales ADD COLUMN is_treat BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sales' AND column_name = 'coupon_applied') THEN
        ALTER TABLE sales ADD COLUMN coupon_applied BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Add indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'sales' AND indexname = 'idx_sales_is_treat') THEN
        CREATE INDEX idx_sales_is_treat ON sales(is_treat);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'sales' AND indexname = 'idx_sales_coupon_applied') THEN
        CREATE INDEX idx_sales_coupon_applied ON sales(coupon_applied);
    END IF;
END $$; 