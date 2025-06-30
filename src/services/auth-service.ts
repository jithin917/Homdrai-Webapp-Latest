import { User } from '../types/oms';
import { ApiResponse, LoginResponse } from '../types/oms-api';

/**
 * Authentication service for OMS users
 */
export const authService = {
  /**
   * Authenticates a user with username and password
   * 
   * @param username - The username
   * @param password - The password
   * @returns API response with user and token
   */
  login: async (username: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    try {
      // For demo purposes, we'll use the existing admin credentials
      if (username === 'admin' && password === 'admin123') {
        const user: User = {
          id: '550e8400-e29b-41d4-a716-446655440010',
          username: 'admin',
          email: 'admin@homdrai.com',
          phone: '+919567199920',
          role: 'admin',
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return { success: true, data: { user, token: 'admin-token' } };
      }
      
      // Check other demo users
      const demoUsers = [
        { username: 'manager_kochi', password: 'manager123', role: 'store_manager', storeId: '550e8400-e29b-41d4-a716-446655440001' },
        { username: 'staff_kochi_1', password: 'staff123', role: 'sales_staff', storeId: '550e8400-e29b-41d4-a716-446655440001' }
      ];
      
      const demoUser = demoUsers.find(u => u.username === username && u.password === password);
      if (demoUser) {
        const user: User = {
          id: '550e8400-e29b-41d4-a716-446655440013',
          username: demoUser.username,
          email: `${demoUser.username}@homdrai.com`,
          phone: '+919567199923',
          role: demoUser.role as any,
          storeId: demoUser.storeId,
          isActive: true,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return { success: true, data: { user, token: 'user-token' } };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  /**
   * Logs out the current user
   * 
   * @returns API response
   */
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      localStorage.removeItem('omsToken');
      localStorage.removeItem('omsUser');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },

  /**
   * Gets the current authenticated user
   * 
   * @returns The current user or null
   */
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('omsUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};