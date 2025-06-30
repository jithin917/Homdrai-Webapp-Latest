import { supabase } from '../lib/supabase';
import type { Order } from '../types/oms';

export const orderService = {
  async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
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
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.getById:', error);
      throw error;
    }
  },

  async create(orderData: Partial<Order>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .insert([orderData])
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.create:', error);
      throw error;
    }
  },

  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .update(orderData)
        .eq('id', id)
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.update:', error);
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
        throw new Error(`Failed to delete order: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in orderService.delete:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .update({ 
          status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw new Error(`Failed to update order status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in orderService.updateStatus:', error);
      throw error;
    }
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer orders:', error);
        throw new Error(`Failed to fetch customer orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getByCustomerId:', error);
      throw error;
    }
  },

  async getByStatus(status: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id,name,phone,email),
          store:oms_stores(id,name,code),
          assigned_to:oms_users!oms_orders_assigned_to_fkey(id,username,email),
          created_by_staff:oms_users!oms_orders_created_by_staff_id_fkey(id,username,email),
          measurement:oms_customer_measurements(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by status:', error);
        throw new Error(`Failed to fetch orders by status: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in orderService.getByStatus:', error);
      throw error;
    }
  }
};

// Export individual functions for backward compatibility
export const createOrder = orderService.create;
export const getOrders = orderService.getAll;
export const getOrderById = orderService.getById;
export const updateOrder = orderService.update;
export const deleteOrder = orderService.delete;
export const updateOrderStatus = orderService.updateStatus;
export const getOrdersByCustomerId = orderService.getByCustomerId;
export const getOrdersByStatus = orderService.getByStatus;