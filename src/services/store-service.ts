import { supabase } from '../lib/supabase';
import { Store } from '../types/oms';
import { ApiResponse } from '../types/oms-api';

/**
 * Store management service
 */
export const storeService = {
  /**
   * Gets all active stores
   * 
   * @returns API response with all stores
   */
  getAll: async (): Promise<ApiResponse<Store[]>> => {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const stores: Store[] = (data || []).map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        address: {
          street: item.address_street,
          city: item.address_city,
          state: item.address_state,
          pinCode: item.address_pin_code,
          country: item.address_country
        },
        phone: item.phone,
        email: item.email,
        managerId: item.manager_id,
        isActive: item.is_active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return { success: true, data: stores };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch stores' };
    }
  },

  /**
   * Gets the first active store (for fallback purposes)
   * 
   * @returns API response with a single store or null
   */
  getFirstActive: async (): Promise<ApiResponse<Store | null>> => {
    try {
      const { data, error } = await supabase
        .from('oms_stores')
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { success: true, data: null };
      }

      const store: Store = {
        id: data.id,
        code: data.code,
        name: data.name,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        phone: data.phone,
        email: data.email,
        managerId: data.manager_id,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: store };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch store' };
    }
  }
};