-- Migration to fix order creation issues
-- This migration ensures all required fields exist in the database

-- Add missing columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total_cost_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_cost_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS scheduled_delivery_date DATE NULL;

-- Update priority enum to include 'normal' if it doesn't exist
-- Note: This might need to be done manually if the enum already exists with different values
-- ALTER TABLE orders MODIFY COLUMN priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal';

-- Add missing columns to order_items table if they don't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS final_price_eur DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS final_price_syp DECIMAL(15,2) NOT NULL DEFAULT 0.00;

-- Update existing orders to have proper values
UPDATE orders 
SET 
    total_cost_eur = total_amount_eur * 0.7, -- Assuming 70% cost
    total_cost_syp = total_amount_syp * 0.7,
    commission_eur = (total_amount_eur - (total_amount_eur * 0.7)) * 0.1,
    commission_syp = (total_amount_syp - (total_amount_syp * 0.7)) * 0.1
WHERE total_cost_eur = 0.00 OR total_cost_syp = 0.00;

-- Update existing order items to have proper final prices
UPDATE order_items 
SET 
    final_price_eur = total_price_eur,
    final_price_syp = total_price_syp
WHERE final_price_eur = 0.00 OR final_price_syp = 0.00;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Verify the changes
SELECT 'Orders table structure:' as info;
DESCRIBE orders;

SELECT 'Order items table structure:' as info;
DESCRIBE order_items;

SELECT 'Sample order data:' as info;
SELECT id, order_number, store_id, total_amount_eur, total_cost_eur, commission_eur, status, priority 
FROM orders 
LIMIT 5;

SELECT 'Sample order items data:' as info;
SELECT id, order_id, product_id, quantity, total_price_eur, final_price_eur 
FROM order_items 
LIMIT 5; 