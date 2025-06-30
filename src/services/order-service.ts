import { supabase } from '../lib/supabase';
import type { Order, OrderStatus, OrderType, PriorityLevel } from '../types/oms';

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email),
          measurement:oms_customer_measurements(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email),
          measurement:oms_customer_measurements(*),
          items:oms_order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.getById:', error);
      throw error;
    }
  },

  async create(order: Partial<Order>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .insert([order])
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email)
        `)
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.create:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email)
        `)
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.update:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email)
        `)
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Create status history entry
      if (notes) {
        await supabase
          .from('oms_order_status_history')
          .insert([{
            order_id: id,
            status,
            notes,
            updated_by_name: 'System' // You might want to get this from auth context
          }]);
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.updateStatus:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('oms_orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in orderService.delete:', error);
      throw error;
    }
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getByCustomerId:', error);
      throw error;
    }
  },

  async getByStoreId(storeId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id, name, phone, email),
          store:oms_stores(id, name, code),
          assigned_user:oms_users(id, username, email)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching store orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getByStoreId:', error);
      throw error;
    }
  },

  async getStatusHistory(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('oms_order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching order status history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getStatusHistory:', error);
      throw error;
    }
  }
};

// Export standalone function for backward compatibility
export const createOrder = orderService.create;