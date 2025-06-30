import { supabase } from '../lib/supabase';
import { Customer } from '../types/oms';
import { generateCustomerId } from '../utils/id-generators';

export const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
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
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Customer not found
        }
        console.error('Error fetching customer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  },

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    try {
      // Generate a unique customer ID
      const customerId = generateCustomerId();
      
      const newCustomer = {
        id: customerId,
        ...customerData,
        // Ensure required fields have defaults
        communication_email: customerData.communication_email ?? true,
        communication_sms: customerData.communication_sms ?? true,
        communication_whatsapp: customerData.communication_whatsapp ?? true,
        address_country: customerData.address_country || 'India'
      };

      console.log('Creating customer with data:', newCustomer);

      const { data, error } = await supabase
        .from('oms_customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }

      console.log('Customer created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createCustomer:', error);
      throw error;
    }
  },

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      throw error;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
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
      console.error('Error in deleteCustomer:', error);
      throw error;
    }
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      if (!query.trim()) {
        return this.getAllCustomers();
      }

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
      console.error('Error in searchCustomers:', error);
      throw error;
    }
  }
};