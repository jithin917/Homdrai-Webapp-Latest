import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Tailor = Database['public']['Tables']['oms_tailors']['Row'];
type TailorInsert = Database['public']['Tables']['oms_tailors']['Insert'];
type TailorUpdate = Database['public']['Tables']['oms_tailors']['Update'];
type TailorPerformance = Database['public']['Tables']['oms_tailor_performance']['Row'];

export const tailorService = {
  // Get all tailors with user information
  async getAllTailors() {
    const { data, error } = await supabase
      .from('oms_tailors')
      .select(`
        *,
        user:oms_users(id, username, email, phone, is_active)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get available tailors for assignment
  async getAvailableTailors() {
    const { data, error } = await supabase
      .from('oms_tailors')
      .select(`
        *,
        user:oms_users(id, username, email, phone)
      `)
      .eq('is_available', true)
      .order('current_order_count', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get tailor by ID
  async getTailorById(id: string) {
    const { data, error } = await supabase
      .from('oms_tailors')
      .select(`
        *,
        user:oms_users(id, username, email, phone, is_active)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get tailor by user ID
  async getTailorByUserId(userId: string) {
    const { data, error } = await supabase
      .from('oms_tailors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new tailor
  async createTailor(tailorData: TailorInsert) {
    const { data, error } = await supabase
      .from('oms_tailors')
      .insert(tailorData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update tailor
  async updateTailor(id: string, updates: TailorUpdate) {
    const { data, error } = await supabase
      .from('oms_tailors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete tailor
  async deleteTailor(id: string) {
    const { error } = await supabase
      .from('oms_tailors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get tailor performance metrics
  async getTailorPerformance(tailorId: string, monthYear?: string) {
    let query = supabase
      .from('oms_tailor_performance')
      .select('*')
      .eq('tailor_id', tailorId);

    if (monthYear) {
      query = query.eq('month_year', monthYear);
    }

    const { data, error } = await query.order('month_year', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update tailor performance
  async updateTailorPerformance(tailorId: string, monthYear: string, performance: Partial<TailorPerformance>) {
    const { data, error } = await supabase
      .from('oms_tailor_performance')
      .upsert({
        tailor_id: tailorId,
        month_year: monthYear,
        ...performance
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get tailor assignments
  async getTailorAssignments(tailorId: string, status?: string) {
    let query = supabase
      .from('oms_order_assignments')
      .select(`
        *,
        order:oms_orders(
          id, garment_type, expected_delivery_date, status, priority,
          customer:oms_customers(name, phone)
        )
      `)
      .eq('tailor_id', tailorId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('assigned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Assign order to tailor
  async assignOrderToTailor(orderId: string, tailorId: string, assignedBy: string, estimatedTime?: string) {
    const { data, error } = await supabase
      .from('oms_order_assignments')
      .insert({
        order_id: orderId,
        tailor_id: tailorId,
        assigned_by: assignedBy,
        estimated_completion_time: estimatedTime
      })
      .select()
      .single();

    if (error) throw error;

    // Update order status and assigned tailor
    await supabase
      .from('oms_orders')
      .update({
        assigned_tailor_id: tailorId,
        workflow_stage: 'assigned',
        status: 'confirmed'
      })
      .eq('id', orderId);

    return data;
  },

  // Update assignment status
  async updateAssignmentStatus(assignmentId: string, status: string, notes?: string) {
    const updates: any = { status };
    
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    if (notes) {
      updates.notes = notes;
    }

    const { data, error } = await supabase
      .from('oms_order_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;

    // Update order workflow stage
    if (status === 'completed') {
      await supabase
        .from('oms_orders')
        .update({
          workflow_stage: 'stitching_complete',
          stitching_completed_at: new Date().toISOString()
        })
        .eq('id', data.order_id);
    }

    return data;
  },

  // Generate unique tailor code
  async generateTailorCode(): Promise<string> {
    const prefix = 'TLR';
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      code = `${prefix}${randomNum}`;
      
      const { data } = await supabase
        .from('oms_tailors')
        .select('id')
        .eq('tailor_code', code)
        .single();
      
      if (!data) {
        isUnique = true;
      }
    }
    
    return code;
  }
};