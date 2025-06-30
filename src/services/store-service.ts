import { supabase } from '../lib/supabase';
import type { Store } from '../types/oms';

export const storeService = {
  async getAll(): Promise<Store[]> {
    const { data, error } = await supabase
      .from('oms_stores')
      .select(`
        *,
        manager:oms_users!fk_stores_manager(id, username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stores:', error);
      throw new Error(`Failed to fetch stores: ${error.message}`);
    }

    return data || [];
  },

  async getById(id: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('oms_stores')
      .select(`
        *,
        manager:oms_users!fk_stores_manager(id, username, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Store not found
      }
      console.error('Error fetching store:', error);
      throw new Error(`Failed to fetch store: ${error.message}`);
    }

    return data;
  },

  async create(store: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    const { data, error } = await supabase
      .from('oms_stores')
      .insert(store)
      .select(`
        *,
        manager:oms_users!fk_stores_manager(id, username, email)
      `)
      .single();

    if (error) {
      console.error('Error creating store:', error);
      throw new Error(`Failed to create store: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: Partial<Store>): Promise<Store> {
    const { data, error } = await supabase
      .from('oms_stores')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        manager:oms_users!fk_stores_manager(id, username, email)
      `)
      .single();

    if (error) {
      console.error('Error updating store:', error);
      throw new Error(`Failed to update store: ${error.message}`);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('oms_stores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store:', error);
      throw new Error(`Failed to delete store: ${error.message}`);
    }
  }
};