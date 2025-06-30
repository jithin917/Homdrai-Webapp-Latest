/*
  # Stakeholder Management System Migration

  1. New Tables
    - `oms_tailors` - Tailor profiles with specializations and performance metrics
    - `oms_tailor_performance` - Monthly performance tracking for tailors
    - `oms_sales_performance` - Monthly performance tracking for sales staff
    - `oms_order_assignments` - Order assignment and tracking system
    - `oms_quality_checks` - Quality assessment and control system

  2. Schema Updates
    - Add 'tailor' role to user_role enum
    - Add workflow management columns to oms_orders table

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for role-based access control
    - Tailors have restricted access (no customer personal info)

  4. Performance
    - Add indexes for efficient querying
    - Create triggers for automatic availability updates
*/

-- Update user_role enum to include tailor
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tailor';

-- Create tailors table
CREATE TABLE IF NOT EXISTS oms_tailors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES oms_users(id) ON DELETE CASCADE,
  tailor_code text UNIQUE NOT NULL,
  specializations text[] DEFAULT '{}',
  skill_level text DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  hourly_rate numeric(8,2) DEFAULT 0,
  is_available boolean DEFAULT true,
  max_concurrent_orders integer DEFAULT 5,
  current_order_count integer DEFAULT 0,
  total_orders_completed integer DEFAULT 0,
  average_completion_time interval,
  quality_rating numeric(3,2) DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tailor performance tracking
CREATE TABLE IF NOT EXISTS oms_tailor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tailor_id uuid REFERENCES oms_tailors(id) ON DELETE CASCADE,
  month_year date NOT NULL,
  orders_completed integer DEFAULT 0,
  orders_rejected integer DEFAULT 0,
  average_completion_time interval,
  quality_score numeric(3,2) DEFAULT 0,
  efficiency_rating numeric(3,2) DEFAULT 0,
  total_earnings numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tailor_id, month_year)
);

-- Create sales performance tracking
CREATE TABLE IF NOT EXISTS oms_sales_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_staff_id uuid REFERENCES oms_users(id) ON DELETE CASCADE,
  month_year date NOT NULL,
  orders_created integer DEFAULT 0,
  orders_completed integer DEFAULT 0,
  total_revenue numeric(12,2) DEFAULT 0,
  customer_satisfaction_score numeric(3,2) DEFAULT 0,
  quality_checks_passed integer DEFAULT 0,
  quality_checks_failed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sales_staff_id, month_year)
);

-- Create order assignments table
CREATE TABLE IF NOT EXISTS oms_order_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text REFERENCES oms_orders(id) ON DELETE CASCADE,
  tailor_id uuid REFERENCES oms_tailors(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES oms_users(id),
  assigned_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  estimated_completion_time interval,
  actual_completion_time interval,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quality checks table
CREATE TABLE IF NOT EXISTS oms_quality_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text REFERENCES oms_orders(id) ON DELETE CASCADE,
  checked_by uuid REFERENCES oms_users(id),
  check_date timestamptz DEFAULT now(),
  overall_quality text NOT NULL CHECK (overall_quality IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'rejected')),
  stitching_quality integer CHECK (stitching_quality >= 1 AND stitching_quality <= 5),
  finishing_quality integer CHECK (finishing_quality >= 1 AND finishing_quality <= 5),
  measurement_accuracy integer CHECK (measurement_accuracy >= 1 AND measurement_accuracy <= 5),
  design_adherence integer CHECK (design_adherence >= 1 AND design_adherence <= 5),
  defects_found text[],
  corrective_actions text,
  passed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to oms_orders for workflow management
DO $$
BEGIN
  -- Add tailor assignment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'created_by_staff_id') THEN
    ALTER TABLE oms_orders ADD COLUMN created_by_staff_id uuid REFERENCES oms_users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'assigned_tailor_id') THEN
    ALTER TABLE oms_orders ADD COLUMN assigned_tailor_id uuid REFERENCES oms_tailors(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'stitching_started_at') THEN
    ALTER TABLE oms_orders ADD COLUMN stitching_started_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'stitching_completed_at') THEN
    ALTER TABLE oms_orders ADD COLUMN stitching_completed_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'quality_checked_at') THEN
    ALTER TABLE oms_orders ADD COLUMN quality_checked_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oms_orders' AND column_name = 'workflow_stage') THEN
    ALTER TABLE oms_orders ADD COLUMN workflow_stage text DEFAULT 'created' 
    CHECK (workflow_stage IN ('created', 'assigned', 'in_progress', 'stitching_complete', 'quality_check', 'approved', 'completed', 'rejected'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oms_tailors_user_id ON oms_tailors(user_id);
CREATE INDEX IF NOT EXISTS idx_oms_tailors_available ON oms_tailors(is_available);
CREATE INDEX IF NOT EXISTS idx_oms_tailor_performance_month ON oms_tailor_performance(month_year);
CREATE INDEX IF NOT EXISTS idx_oms_sales_performance_month ON oms_sales_performance(month_year);
CREATE INDEX IF NOT EXISTS idx_oms_order_assignments_order_id ON oms_order_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_oms_order_assignments_tailor_id ON oms_order_assignments(tailor_id);
CREATE INDEX IF NOT EXISTS idx_oms_quality_checks_order_id ON oms_quality_checks(order_id);
CREATE INDEX IF NOT EXISTS idx_oms_orders_workflow_stage ON oms_orders(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_oms_orders_assigned_tailor ON oms_orders(assigned_tailor_id);

-- Enable RLS
ALTER TABLE oms_tailors ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_tailor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_sales_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE oms_quality_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oms_tailors
CREATE POLICY "Admins can manage tailors"
  ON oms_tailors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role = 'admin'
    )
  );

CREATE POLICY "Tailors can read own profile"
  ON oms_tailors
  FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Sales staff can read tailors"
  ON oms_tailors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role IN ('admin', 'store_manager', 'sales_staff')
    )
  );

-- RLS Policies for oms_tailor_performance
CREATE POLICY "Admins can manage tailor performance"
  ON oms_tailor_performance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role = 'admin'
    )
  );

CREATE POLICY "Tailors can read own performance"
  ON oms_tailor_performance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_tailors 
      WHERE oms_tailors.id = tailor_id 
      AND oms_tailors.user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for oms_sales_performance
CREATE POLICY "Admins can manage sales performance"
  ON oms_sales_performance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role = 'admin'
    )
  );

CREATE POLICY "Sales staff can read own performance"
  ON oms_sales_performance
  FOR SELECT
  TO authenticated
  USING (sales_staff_id::text = auth.uid()::text);

-- RLS Policies for oms_order_assignments
CREATE POLICY "Staff can manage order assignments"
  ON oms_order_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role IN ('admin', 'store_manager', 'sales_staff')
    )
  );

CREATE POLICY "Tailors can read own assignments"
  ON oms_order_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_tailors 
      WHERE oms_tailors.id = tailor_id 
      AND oms_tailors.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Tailors can update own assignments"
  ON oms_order_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_tailors 
      WHERE oms_tailors.id = tailor_id 
      AND oms_tailors.user_id::text = auth.uid()::text
    )
  );

-- RLS Policies for oms_quality_checks
CREATE POLICY "Staff can manage quality checks"
  ON oms_quality_checks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM oms_users 
      WHERE oms_users.id::text = auth.uid()::text 
      AND oms_users.role IN ('admin', 'store_manager', 'sales_staff')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_oms_tailors_updated_at
  BEFORE UPDATE ON oms_tailors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oms_order_assignments_updated_at
  BEFORE UPDATE ON oms_order_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tailor availability based on current orders
CREATE OR REPLACE FUNCTION update_tailor_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current order count for the tailor
  UPDATE oms_tailors 
  SET current_order_count = (
    SELECT COUNT(*) 
    FROM oms_order_assignments 
    WHERE tailor_id = COALESCE(NEW.assigned_tailor_id, OLD.assigned_tailor_id)
    AND status IN ('assigned', 'in_progress')
  ),
  is_available = (
    SELECT COUNT(*) < max_concurrent_orders
    FROM oms_order_assignments 
    WHERE tailor_id = COALESCE(NEW.assigned_tailor_id, OLD.assigned_tailor_id)
    AND status IN ('assigned', 'in_progress')
  )
  WHERE id = COALESCE(NEW.assigned_tailor_id, OLD.assigned_tailor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update tailor availability
CREATE TRIGGER update_tailor_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON oms_order_assignments
  FOR EACH ROW EXECUTE FUNCTION update_tailor_availability();