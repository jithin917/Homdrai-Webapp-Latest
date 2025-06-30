import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type OrderAssignment = Database['public']['Tables']['oms_order_assignments']['Row'];
type QualityCheck = Database['public']['Tables']['oms_quality_checks']['Row'];

export const assignmentService = {
  // Get all assignments with order and tailor details
  async getAllAssignments() {
    const { data, error } = await supabase
      .from('oms_order_assignments')
      .select(`
        *,
        order:oms_orders(
          id, garment_type, expected_delivery_date, status, priority, workflow_stage,
          customer:oms_customers(name, phone)
        ),
        tailor:oms_tailors(
          tailor_code,
          user:oms_users(username, email)
        ),
        assigned_by_user:oms_users!assigned_by(username)
      `)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get assignments for a specific tailor
  async getTailorAssignments(tailorId: string) {
    const { data, error } = await supabase
      .from('oms_order_assignments')
      .select(`
        *,
        order:oms_orders(
          id, garment_type, expected_delivery_date, status, priority, workflow_stage,
          special_instructions, fabric_type, fabric_color,
          measurement:oms_customer_measurements(*)
        )
      `)
      .eq('tailor_id', tailorId)
      .in('status', ['assigned', 'in_progress'])
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Start working on an assignment
  async startAssignment(assignmentId: string) {
    const { data, error } = await supabase
      .from('oms_order_assignments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;

    // Update order workflow stage
    await supabase
      .from('oms_orders')
      .update({
        workflow_stage: 'in_progress',
        stitching_started_at: new Date().toISOString()
      })
      .eq('id', data.order_id);

    return data;
  },

  // Complete stitching
  async completeStitching(assignmentId: string, notes?: string) {
    const { data, error } = await supabase
      .from('oms_order_assignments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;

    // Update order workflow stage
    await supabase
      .from('oms_orders')
      .update({
        workflow_stage: 'stitching_complete',
        stitching_completed_at: new Date().toISOString(),
        status: 'ready'
      })
      .eq('id', data.order_id);

    return data;
  },

  // Perform quality check
  async performQualityCheck(qualityCheckData: {
    order_id: string;
    checked_by: string;
    overall_quality: string;
    stitching_quality: number;
    finishing_quality: number;
    measurement_accuracy: number;
    design_adherence: number;
    defects_found?: string[];
    corrective_actions?: string;
    notes?: string;
  }) {
    const passed = qualityCheckData.overall_quality !== 'rejected' && 
                   qualityCheckData.stitching_quality >= 3 &&
                   qualityCheckData.finishing_quality >= 3;

    const { data, error } = await supabase
      .from('oms_quality_checks')
      .insert({
        ...qualityCheckData,
        passed,
        check_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update order workflow stage based on quality check result
    const newWorkflowStage = passed ? 'approved' : 'quality_check';
    const newStatus = passed ? 'ready' : 'in_progress';

    await supabase
      .from('oms_orders')
      .update({
        workflow_stage: newWorkflowStage,
        status: newStatus,
        quality_checked_at: new Date().toISOString()
      })
      .eq('id', qualityCheckData.order_id);

    return data;
  },

  // Get quality checks for an order
  async getOrderQualityChecks(orderId: string) {
    const { data, error } = await supabase
      .from('oms_quality_checks')
      .select(`
        *,
        checker:oms_users!checked_by(username, email)
      `)
      .eq('order_id', orderId)
      .order('check_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Mark order as complete
  async completeOrder(orderId: string, completedBy: string) {
    const { data, error } = await supabase
      .from('oms_orders')
      .update({
        workflow_stage: 'completed',
        status: 'delivered',
        actual_delivery_date: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get workflow statistics
  async getWorkflowStats() {
    const { data, error } = await supabase
      .from('oms_orders')
      .select('workflow_stage')
      .not('workflow_stage', 'is', null);

    if (error) throw error;

    const stats = data.reduce((acc: any, order) => {
      acc[order.workflow_stage] = (acc[order.workflow_stage] || 0) + 1;
      return acc;
    }, {});

    return stats;
  }
};