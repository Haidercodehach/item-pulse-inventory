
-- Check current enum values and add 'sale' if not present
DO $$
BEGIN
    -- Add 'sale' to the transaction_type enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sale' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
    ) THEN
        ALTER TYPE transaction_type ADD VALUE 'sale';
    END IF;
END $$;
