import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardStats() {
    try {
      // Get total orders count
      const { count: totalOrders } = await supabase
        .from('oms_orders')
        .select('*', { count: 'exact', head: true });

      // Get pending orders count
      const { count: pendingOrders } = await supabase
        .from('oms_orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'in_progress']);

      // Get total customers count
      const { count: totalCustomers } = await supabase
        .from('oms_customers')
        .select('*', { count: 'exact', head: true });

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('oms_orders')
        .select('advance_paid')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      const todayRevenue = todayOrders?.reduce((sum, order) => 
        sum + (parseFloat(order.advance_paid?.toString() || '0')), 0) || 0;

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('oms_orders')
        .select(`
          *,
          customer:oms_customers(id, name, phone),
          store:oms_stores(id, name, code)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get orders by status for chart
      const { data: ordersByStatus } = await supabase
        .from('oms_orders')
        .select('status')
        .order('created_at', { ascending: false });

      const statusCounts = ordersByStatus?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get daily sales for the last 7 days
      const { data: dailySales } = await supabase
        .from('oms_daily_sales')
        .select('*')
        .order('order_date', { ascending: false })
        .limit(7);

      return {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        todayRevenue,
        recentOrders: recentOrders || [],
        ordersByStatus: statusCounts,
        dailySales: dailySales || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getPendingOrders() {
    try {
      const { data, error } = await supabase
        .from('oms_pending_orders')
        .select('*')
        .order('expected_delivery_date', { ascending: true });

      if (error) {
        console.error('Error fetching pending orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in dashboardService.getPendingOrders:', error);
      throw error;
    }
  },

  async getOrderSummary() {
    try {
      const { data, error } = await supabase
        .from('oms_order_summary')
        .select('*')
        .order('order_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching order summary:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in dashboardService.getOrderSummary:', error);
      throw error;
    }
  }
};