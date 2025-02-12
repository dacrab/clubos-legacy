-- Add tracking columns to sale_items table
ALTER TABLE sale_items
ADD COLUMN last_edited_by UUID REFERENCES profiles(id),
ADD COLUMN last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN deleted_by UUID REFERENCES profiles(id),
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX idx_sale_items_last_edited_by ON sale_items(last_edited_by);
CREATE INDEX idx_sale_items_deleted_by ON sale_items(deleted_by);
CREATE INDEX idx_sale_items_is_deleted ON sale_items(is_deleted); 