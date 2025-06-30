import { supabase } from '../lib/supabase';
import type { Customer } from '../types/oms';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in customerService.getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in customerService.getById:', error);
      throw error;
    }
  },

  async create(customer: Omit<Customer, 'created_at' | 'updated_at'>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .insert([customer])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in customerService.create:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in customerService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('oms_customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in customerService.delete:', error);
      throw error;
    }
  },

  async search(query: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching customers:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in customerService.search:', error);
      throw error;
    }
  },

  async getWithOrderSummary(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('oms_customer_summary')
        .select('*')
        .order('last_order_date', { ascending: false });

      if (error) {
        console.error('Error fetching customer summary:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in customerService.getWithOrderSummary:', error);
      throw error;
    }
  }
};

// Export standalone functions for backward compatibility
export const createCustomer = customerService.create;
export const getCustomers = customerService.getAll;