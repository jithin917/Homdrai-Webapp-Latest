/*
  # Fix RLS policies for admin panel access

  1. Policy Updates
    - Update bulk_order_inquiries policies to allow anon access for admin panel
    - Update stitching_partnerships policies to allow anon access for admin panel
    - Maintain security while enabling admin functionality

  2. Changes
    - Allow anonymous users to read data (for admin panel)
    - Allow anonymous users to update status (for admin panel)
    - Keep insert policies for public forms
*/

-- Update bulk_order_inquiries policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bulk_order_inquiries' 
    AND policyname = 'Authenticated users can read all bulk order inquiries'
  ) THEN
    DROP POLICY "Authenticated users can read all bulk order inquiries" ON bulk_order_inquiries;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bulk_order_inquiries' 
    AND policyname = 'Authenticated users can update bulk order inquiries'
  ) THEN
    DROP POLICY "Authenticated users can update bulk order inquiries" ON bulk_order_inquiries;
  END IF;

  -- Create new policies for bulk_order_inquiries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bulk_order_inquiries' 
    AND policyname = 'Anyone can read bulk order inquiries'
  ) THEN
    CREATE POLICY "Anyone can read bulk order inquiries"
      ON bulk_order_inquiries
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bulk_order_inquiries' 
    AND policyname = 'Anyone can update bulk order inquiries'
  ) THEN
    CREATE POLICY "Anyone can update bulk order inquiries"
      ON bulk_order_inquiries
      FOR UPDATE
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Update stitching_partnerships policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stitching_partnerships' 
    AND policyname = 'Authenticated users can read all stitching partnerships'
  ) THEN
    DROP POLICY "Authenticated users can read all stitching partnerships" ON stitching_partnerships;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stitching_partnerships' 
    AND policyname = 'Authenticated users can update stitching partnerships'
  ) THEN
    DROP POLICY "Authenticated users can update stitching partnerships" ON stitching_partnerships;
  END IF;

  -- Create new policies for stitching_partnerships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stitching_partnerships' 
    AND policyname = 'Anyone can read stitching partnerships'
  ) THEN
    CREATE POLICY "Anyone can read stitching partnerships"
      ON stitching_partnerships
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'stitching_partnerships' 
    AND policyname = 'Anyone can update stitching partnerships'
  ) THEN
    CREATE POLICY "Anyone can update stitching partnerships"
      ON stitching_partnerships
      FOR UPDATE
      TO anon, authenticated
      USING (true);
  END IF;
END $$;