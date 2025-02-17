-- Begin transaction
BEGIN;

-- Add created_by column to registers table
ALTER TABLE registers
ADD COLUMN created_by uuid REFERENCES profiles(id);

-- Commit transaction
COMMIT; 