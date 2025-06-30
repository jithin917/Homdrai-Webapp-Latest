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

      const stores: Store[] = data.map(item => ({
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
  }
};