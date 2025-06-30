import { supabase } from '../lib/supabase';
import type { Store } from '../types/oms';

export const storeService = {
  async getAll(): Promise<Store[]> {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .select(`
          *,
          manager:oms_users(id, username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in storeService.getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Store | null> {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .select(`
          *,
          manager:oms_users(id, username, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in storeService.getById:', error);
      throw error;
    }
  },

  async create(store: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .insert([store])
        .select(`
          *,
          manager:oms_users(id, username, email)
        `)
        .single();

      if (error) {
        console.error('Error creating store:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in storeService.create:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Store>): Promise<Store> {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          manager:oms_users(id, username, email)
        `)
        .single();

      if (error) {
        console.error('Error updating store:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in storeService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('oms_stores')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting store:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in storeService.delete:', error);
      throw error;
    }
  },

  async getActiveStores(): Promise<Store[]> {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .select(`
          *,
          manager:oms_users(id, username, email)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching active stores:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in storeService.getActiveStores:', error);
      throw error;
    }
  }
};