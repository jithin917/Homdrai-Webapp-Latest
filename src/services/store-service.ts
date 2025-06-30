import { supabase } from '../lib/supabase';

export interface Store {
  id: string;
  code: string;
  name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_pin_code: string;
  address_country: string;
  phone: string;
  email: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class StoreService {
  async getAll(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('oms_stores')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching stores:', error);
      throw new Error('Failed to fetch stores');
    }

    return data || [];
  }

  async getAllStores(): Promise<Store[]> {
    return this.getAll();
  }

  async getActiveStores(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('oms_stores')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active stores:', error);
      throw new Error('Failed to fetch active stores');
    }

    return data || [];
  }

  async getStoreById(id: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('oms_stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching store:', error);
      throw new Error('Failed to fetch store');
    }

    return data;
  }
}

export const storeService = new StoreService();