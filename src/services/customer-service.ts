import { supabase } from '../lib/supabase';
import type { Customer, CustomerMeasurements } from '../types/oms';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('oms_customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

export async function createCustomer(customerData: Omit<Customer, 'created_at' | 'updated_at'>): Promise<Customer> {
  try {
    console.log('Creating customer with data:', customerData);
    
    // Validate required fields
    if (!customerData.id) {
      throw new Error('Customer ID is required');
    }
    if (!customerData.name?.trim()) {
      throw new Error('Customer name is required');
    }
    if (!customerData.phone?.trim()) {
      throw new Error('Phone number is required');
    }

    const { data, error } = await supabase
      .from('oms_customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating customer:', error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        if (error.message.includes('oms_customers_pkey')) {
          throw new Error('A customer with this ID already exists');
        }
      }
      
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after creating customer');
    }

    console.log('Customer created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  try {
    const { data, error } = await supabase
      .from('oms_customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error(`Failed to update customer: ${error.message}`);
    }

    if (!data) {
      throw new Error('Customer not found');
    }

    return data;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('oms_customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    if (!query.trim()) {
      return await getCustomers();
    }

    const { data, error } = await supabase
      .from('oms_customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching customers:', error);
      throw new Error(`Failed to search customers: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    throw error;
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
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
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error;
  }
}

export async function getCustomerMeasurements(customerId: string): Promise<CustomerMeasurements[]> {
  try {
    const { data, error } = await supabase
      .from('oms_customer_measurements')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer measurements:', error);
      throw new Error(`Failed to fetch customer measurements: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCustomerMeasurements:', error);
    throw error;
  }
}

export async function createCustomerMeasurements(
  customerId: string,
  measurements: Omit<CustomerMeasurements, 'id' | 'customer_id' | 'created_at' | 'updated_at'>
): Promise<CustomerMeasurements> {
  try {
    const measurementData = {
      customer_id: customerId,
      ...measurements,
    };

    const { data, error } = await supabase
      .from('oms_customer_measurements')
      .insert([measurementData])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer measurements:', error);
      throw new Error(`Failed to create customer measurements: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after creating customer measurements');
    }

    return data;
  } catch (error) {
    console.error('Error in createCustomerMeasurements:', error);
    throw error;
  }
}

export async function updateCustomerMeasurements(
  id: string,
  updates: Partial<CustomerMeasurements>
): Promise<CustomerMeasurements> {
  try {
    const { data, error } = await supabase
      .from('oms_customer_measurements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer measurements:', error);
      throw new Error(`Failed to update customer measurements: ${error.message}`);
    }

    if (!data) {
      throw new Error('Customer measurements not found');
    }

    return data;
  } catch (error) {
    console.error('Error in updateCustomerMeasurements:', error);
    throw error;
  }
}

// Export customerService object containing all functions
export const customerService = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerById,
  getCustomerMeasurements,
  createCustomerMeasurements,
  updateCustomerMeasurements,
};