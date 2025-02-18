-- Begin transaction
BEGIN;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_sale_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle DELETE operation
  IF TG_OP = 'DELETE' THEN
    UPDATE sales
    SET total_amount = (
      SELECT COALESCE(SUM(quantity * price_at_sale), 0)
      FROM sale_items
      WHERE sale_id = OLD.sale_id
      AND is_deleted = FALSE
    )
    WHERE id = OLD.sale_id;
    RETURN OLD;
  END IF;

  -- Handle INSERT and UPDATE operations
  UPDATE sales
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * price_at_sale), 0)
    FROM sale_items
    WHERE sale_id = NEW.sale_id
    AND is_deleted = FALSE
  )
  WHERE id = NEW.sale_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_sale_total_trigger ON sale_items;
CREATE TRIGGER update_sale_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sale_items
  FOR EACH ROW
  EXECUTE FUNCTION update_sale_total();

-- Commit transaction
COMMIT; 