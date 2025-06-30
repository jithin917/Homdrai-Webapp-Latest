import { supabase } from '../lib/supabase';
import { ApiResponse } from '../types/oms-api';
import { DashboardStats } from '../types/oms-api';

/**
 * Dashboard statistics service
 */
export const dashboardService = {
  /**
   * Gets dashboard statistics
   * 
   * @returns API response with dashboard statistics
   */
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('oms_orders')
        .select('*');

      if (ordersError) throw ordersError;

      const { data: customers, error: customersError } = await supabase
        .from('oms_customers')
        .select('id');

      if (customersError) throw customersError;

      const { data: stores, error: storesError } = await supabase
        .from('oms_stores')
        .select('*');

      if (storesError) throw storesError;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyOrders = orders.filter(o => {
        const orderDate = new Date(o.order_date);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });

      const stats: DashboardStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        inProgressOrders: orders.filter(o => ['confirmed', 'in_progress', 'fitting_scheduled'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
        monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
        customerCount: customers.length,
        storePerformance: stores.map(store => {
          const storeOrders = orders.filter(o => o.store_id === store.id);
          const storeRevenue = storeOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
          const completedStoreOrders = storeOrders.filter(o => o.status === 'delivered');
          
          return {
            storeId: store.id,
            storeName: store.name,
            orderCount: storeOrders.length,
            revenue: storeRevenue,
            averageOrderValue: storeOrders.length > 0 ? storeRevenue / storeOrders.length : 0,
            completionRate: storeOrders.length > 0 ? (completedStoreOrders.length / storeOrders.length) * 100 : 0
          };
        })
      };
      
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch dashboard stats' };
    }
  }
};

/**
 * Standalone function for getting dashboard statistics
 * This is an alias for dashboardService.getStats() to maintain compatibility
 */
export const getDashboardStats = dashboardService.getStats;