-- Begin transaction
BEGIN;

-- Create function to handle editing sale items
CREATE OR REPLACE FUNCTION handle_edit_sale_item(
  p_sale_item_id UUID,
  p_new_quantity INTEGER,
  p_new_product_id UUID,
  p_new_price DECIMAL,
  p_user_id UUID,
  p_old_product_id UUID,
  p_old_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- First restore the stock for the old product
  UPDATE products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock + p_old_quantity
  END
  WHERE id = p_old_product_id;

  -- Then reduce stock for the new product
  UPDATE products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock - p_new_quantity
  END
  WHERE id = p_new_product_id;

  -- Update the sale item
  UPDATE sale_items
  SET 
    quantity = p_new_quantity,
    product_id = p_new_product_id,
    price_at_sale = p_new_price,
    last_edited_by = p_user_id,
    last_edited_at = NOW()
  WHERE id = p_sale_item_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle deleting sale items
CREATE OR REPLACE FUNCTION handle_delete_sale_item(
  p_sale_item_id UUID,
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Restore the stock
  UPDATE products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock + p_quantity
  END
  WHERE id = p_product_id;

  -- Mark the sale item as deleted
  UPDATE sale_items
  SET 
    is_deleted = true,
    deleted_by = p_user_id,
    deleted_at = NOW()
  WHERE id = p_sale_item_id;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
COMMIT; 