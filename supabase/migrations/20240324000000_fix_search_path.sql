-- Begin transaction
BEGIN;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', 'staff');
  RETURN NEW;
END;
$$;

-- Fix update_sale_total function
CREATE OR REPLACE FUNCTION update_sale_total()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  -- Handle DELETE operation
  IF TG_OP = 'DELETE' THEN
    UPDATE public.sales
    SET total_amount = (
      SELECT COALESCE(SUM(quantity * price_at_sale), 0)
      FROM public.sale_items
      WHERE sale_id = OLD.sale_id
      AND is_deleted = FALSE
    )
    WHERE id = OLD.sale_id;
    RETURN OLD;
  END IF;

  -- Handle INSERT and UPDATE operations
  UPDATE public.sales
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * price_at_sale), 0)
    FROM public.sale_items
    WHERE sale_id = NEW.sale_id
    AND is_deleted = FALSE
  )
  WHERE id = NEW.sale_id;
  RETURN NEW;
END;
$$;

-- Fix handle_edit_sale_item function
CREATE OR REPLACE FUNCTION handle_edit_sale_item(
  p_sale_item_id UUID,
  p_new_quantity INTEGER,
  p_new_product_id UUID,
  p_new_price DECIMAL,
  p_user_id UUID,
  p_old_product_id UUID,
  p_old_quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  -- First restore the stock for the old product
  UPDATE public.products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock + p_old_quantity
  END
  WHERE id = p_old_product_id;

  -- Then reduce stock for the new product
  UPDATE public.products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock - p_new_quantity
  END
  WHERE id = p_new_product_id;

  -- Update the sale item
  UPDATE public.sale_items
  SET 
    quantity = p_new_quantity,
    product_id = p_new_product_id,
    price_at_sale = p_new_price,
    last_edited_by = p_user_id,
    last_edited_at = NOW()
  WHERE id = p_sale_item_id;
END;
$$;

-- Fix handle_delete_sale_item function
CREATE OR REPLACE FUNCTION handle_delete_sale_item(
  p_sale_item_id UUID,
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  -- Restore the stock
  UPDATE public.products
  SET stock = CASE 
    WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
    ELSE stock + p_quantity
  END
  WHERE id = p_product_id;

  -- Mark the sale item as deleted
  UPDATE public.sale_items
  SET 
    is_deleted = true,
    deleted_by = p_user_id,
    deleted_at = NOW()
  WHERE id = p_sale_item_id;
END;
$$;

-- Fix update_product_stock function
CREATE OR REPLACE FUNCTION update_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  -- Update the product stock
  UPDATE public.products
  SET 
    stock = CASE 
      WHEN stock = -1 THEN -1  -- Keep unlimited stock as is
      ELSE GREATEST(0, stock - quantity)  -- Ensure stock doesn't go below 0
    END,
    updated_at = NOW()
  WHERE id = product_id;
END;
$$;

-- Fix handle_user_deletion function
CREATE OR REPLACE FUNCTION handle_user_deletion(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Delete from profiles first (due to foreign key constraint)
    DELETE FROM public.profiles WHERE id = user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Fix delete_user function
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if the calling user has admin role
    IF NOT EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can delete users';
    END IF;

    -- Call the actual deletion function
    PERFORM handle_user_deletion(user_id);
END;
$$;

-- Commit transaction
COMMIT; 