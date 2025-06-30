import { supabase } from '../lib/supabase';
import { Customer } from '../types/oms';
import { ApiResponse } from '../types/oms-api';
import { generateCustomerId } from '../utils/id-generators';

/**
 * Customer management service
 */
export const customerService = {
  /**
   * Creates a new customer
   * 
   * @param customerData - The customer data
   * @returns API response with the created customer
   */
  create: async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Customer>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .insert([{
          id: generateCustomerId(),
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address_street: customerData.address.street,
          address_city: customerData.address.city,
          address_state: customerData.address.state,
          address_pin_code: customerData.address.pinCode,
          address_country: customerData.address.country,
          communication_email: customerData.communicationPreferences.email,
          communication_sms: customerData.communicationPreferences.sms,
          communication_whatsapp: customerData.communicationPreferences.whatsapp
        }])
        .select()
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create customer' };
    }
  },

  /**
   * Gets a customer by ID
   * 
   * @param id - The customer ID
   * @returns API response with the customer
   */
  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Customer not found' };
    }
  },

  /**
   * Searches for customers based on filters
   * 
   * @param filters - The search filters
   * @returns API response with matching customers
   */
  search: async (filters: Partial<Customer>): Promise<ApiResponse<Customer[]>> => {
    try {
      let query = supabase.from('oms_customers').select('*');
      
      if (filters.phone) {
        query = query.ilike('phone', `%${filters.phone}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const customers: Customer[] = data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: {
          street: item.address_street,
          city: item.address_city,
          state: item.address_state,
          pinCode: item.address_pin_code,
          country: item.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: item.communication_email,
          sms: item.communication_sms,
          whatsapp: item.communication_whatsapp
        },
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return { success: true, data: customers };
    } catch (error: any) {
      return { success: false, error: error.message || 'Search failed' };
    }
  },

  /**
   * Updates a customer
   * 
   * @param id - The customer ID
   * @param updates - The customer updates
   * @returns API response with the updated customer
   */
  update: async (id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.address) {
        updateData.address_street = updates.address.street;
        updateData.address_city = updates.address.city;
        updateData.address_state = updates.address.state;
        updateData.address_pin_code = updates.address.pinCode;
        updateData.address_country = updates.address.country;
      }
      if (updates.communicationPreferences) {
        updateData.communication_email = updates.communicationPreferences.email;
        updateData.communication_sms = updates.communicationPreferences.sms;
        updateData.communication_whatsapp = updates.communicationPreferences.whatsapp;
      }

      const { data, error } = await supabase
        .from('oms_customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update customer' };
    }
  }
};