import { supabase } from '../lib/supabase';
import type { UserRole } from '../types/oms';

export interface OMSUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  store_id?: string;
  default_store_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  store?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  store_id?: string;
  default_store_id?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  store_id?: string;
  default_store_id?: string;
  is_active?: boolean;
}

class UserManagementService {
  async getAllUsers(): Promise<OMSUser[]> {
    const { data, error } = await supabase
      .from('oms_users')
      .select(`
        *,
        store:oms_stores(id, name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    return data || [];
  }

  async getUsersByRole(role: UserRole): Promise<OMSUser[]> {
    const { data, error } = await supabase
      .from('oms_users')
      .select(`
        *,
        store:oms_stores(id, name, code)
      `)
      .eq('role', role)
      .eq('is_active', true)
      .order('username');

    if (error) {
      console.error('Error fetching users by role:', error);
      throw new Error(`Failed to fetch ${role} users`);
    }

    return data || [];
  }

  async getUserById(id: string): Promise<OMSUser | null> {
    const { data, error } = await supabase
      .from('oms_users')
      .select(`
        *,
        store:oms_stores(id, name, code)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }

    return data;
  }

  async createUser(userData: CreateUserData): Promise<OMSUser> {
    // Hash the password (in a real app, this should be done server-side)
    const passwordHash = await this.hashPassword(userData.password);

    const { data, error } = await supabase
      .from('oms_users')
      .insert({
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password_hash: passwordHash,
        role: userData.role,
        store_id: userData.store_id,
        default_store_id: userData.default_store_id,
        is_active: true
      })
      .select(`
        *,
        store:oms_stores(id, name, code)
      `)
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<OMSUser> {
    const { data, error } = await supabase
      .from('oms_users')
      .update(userData)
      .eq('id', id)
      .select(`
        *,
        store:oms_stores(id, name, code)
      `)
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('oms_users')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating user:', error);
      throw new Error('Failed to deactivate user');
    }
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);

    const { error } = await supabase
      .from('oms_users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo purposes - use proper bcrypt in production
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Customer-related methods
  async getAllCustomers() {
    const { data, error } = await supabase
      .from('oms_customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }

    return data || [];
  }

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('oms_customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }

    return data;
  }

  async getCustomerOrders(customerId: string) {
    const { data, error } = await supabase
      .from('oms_orders')
      .select(`
        *,
        store:oms_stores(name, code),
        assigned_user:oms_users!oms_orders_assigned_to_fkey(username, email)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error);
      throw new Error('Failed to fetch customer orders');
    }

    return data || [];
  }
}

export const userManagementService = new UserManagementService();