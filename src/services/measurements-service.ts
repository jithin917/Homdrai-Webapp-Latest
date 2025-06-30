import { supabase } from '../lib/supabase';

export interface CustomerMeasurements {
  id: string;
  customer_id: string;
  unit: 'cm' | 'inches';
  top_fl?: number;
  top_sh?: number;
  top_sl?: number;
  top_sr?: number;
  top_mr?: number;
  top_ah?: number;
  top_ch?: number;
  top_br?: number;
  top_wr?: number;
  top_hip?: number;
  top_slit?: number;
  top_fn?: number;
  top_bn?: number;
  top_dp?: number;
  top_pp?: number;
  bottom_fl?: number;
  bottom_wr?: number;
  bottom_sr?: number;
  bottom_tr?: number;
  bottom_lr?: number;
  bottom_ar?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderMeasurements {
  id: string;
  order_id: string;
  unit: 'cm' | 'inches';
  top_fl?: number;
  top_sh?: number;
  top_sl?: number;
  top_sr?: number;
  top_mr?: number;
  top_ah?: number;
  top_ch?: number;
  top_br?: number;
  top_wr?: number;
  top_hip?: number;
  top_slit?: number;
  top_fn?: number;
  top_bn?: number;
  top_dp?: number;
  top_pp?: number;
  bottom_fl?: number;
  bottom_wr?: number;
  bottom_sr?: number;
  bottom_tr?: number;
  bottom_lr?: number;
  bottom_ar?: number;
  custom_measurements?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const measurementsService = {
  // Customer measurements
  async getByCustomerId(customerId: string): Promise<CustomerMeasurements | null> {
    try {
      const { data, error } = await supabase
        .from('oms_customer_measurements')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer measurements:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getByCustomerId:', error);
      return null;
    }
  },

  async createCustomerMeasurements(measurements: Omit<CustomerMeasurements, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerMeasurements> {
    const { data, error } = await supabase
      .from('oms_customer_measurements')
      .insert(measurements)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customer measurements: ${error.message}`);
    }

    return data;
  },

  async updateCustomerMeasurements(id: string, measurements: Partial<CustomerMeasurements>): Promise<CustomerMeasurements> {
    const { data, error } = await supabase
      .from('oms_customer_measurements')
      .update(measurements)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update customer measurements: ${error.message}`);
    }

    return data;
  },

  // Order measurements
  async getByOrderId(orderId: string): Promise<OrderMeasurements | null> {
    try {
      const { data, error } = await supabase
        .from('order_measurements')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order measurements:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getByOrderId:', error);
      return null;
    }
  },

  async createOrderMeasurements(measurements: Omit<OrderMeasurements, 'id' | 'created_at' | 'updated_at'>): Promise<OrderMeasurements> {
    const { data, error } = await supabase
      .from('order_measurements')
      .insert(measurements)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order measurements: ${error.message}`);
    }

    return data;
  },

  async updateOrderMeasurements(id: string, measurements: Partial<OrderMeasurements>): Promise<OrderMeasurements> {
    const { data, error } = await supabase
      .from('order_measurements')
      .update(measurements)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order measurements: ${error.message}`);
    }

    return data;
  },

  async deleteCustomerMeasurements(id: string): Promise<void> {
    const { error } = await supabase
      .from('oms_customer_measurements')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete customer measurements: ${error.message}`);
    }
  },

  async deleteOrderMeasurements(id: string): Promise<void> {
    const { error } = await supabase
      .from('order_measurements')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete order measurements: ${error.message}`);
    }
  }
};