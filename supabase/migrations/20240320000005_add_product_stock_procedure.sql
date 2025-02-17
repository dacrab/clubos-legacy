-- Begin transaction
BEGIN;

-- Create function to handle updating product stock
CREATE OR REPLACE FUNCTION update_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Update the product stock
  UPDATE products
  SET 
    stock = CASE 
      WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
      ELSE GREATEST(0, stock - quantity)  -- Ensure stock doesn't go below 0
    END,
    updated_at = NOW()
  WHERE id = product_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_product_stock TO authenticated;

-- Commit transaction
COMMIT; 