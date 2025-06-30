import { supabase } from '../lib/supabase';
import { Order } from '../types/oms';
import { ApiResponse, PaginatedResponse, SearchFilters } from '../types/oms-api';
import { generateOrderId } from '../utils/id-generators';
import { calculateDeliveryDate } from '../utils/date-utils';
import { authService } from './auth-service';

/**
 * Order management service
 */
export const orderService = {
  /**
   * Creates a new order
   * 
   * @param orderData - The order data
   * @returns API response with the created order
   */
  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<ApiResponse<Order>> => {
    try {
      // Get store code for order ID generation
      // Get current user's default store or first available store
      const currentUser = authService.getCurrentUser();
      let storeCode = 'KCH'; // Default store code
      
      if (currentUser?.storeId) {
        const { data: storeData } = await supabase
          .from('oms_stores')
          .select('code')
          .eq('id', currentUser.storeId)
          .single();
          
        if (storeData) {
          storeCode = storeData.code;
        }
      } else {
        // If no store is associated with user, get the first active store
        const { data: storeData } = await supabase
          .from('oms_stores')
          .select('code')
          .eq('is_active', true)
          .order('name')
          .limit(1)
          .single();
          
        if (storeData) {
          storeCode = storeData.code;
        }
      }

      const orderId = generateOrderId(storeCode);
      const expectedDeliveryDate = calculateDeliveryDate(orderData.type, orderData.priority);

      // Get store ID from current user or first available store
      let storeId = currentUser?.storeId;
      
      if (!storeId) {
        const { data: storeData } = await supabase
          .from('oms_stores')
          .select('id')
          .eq('is_active', true)
          .order('name')
          .limit(1)
          .single();
          
        if (storeData) {
          storeId = storeData.id;
        }
      }

      const { data, error } = await supabase
        .from('oms_orders')
        .insert([{
          id: orderId,
          customer_id: orderData.customerId,
          store_id: storeId,
          assigned_to: currentUser?.id || orderData.assignedTo,
          type: orderData.type,
          status: 'pending',
          priority: orderData.priority,
          garment_type: orderData.garmentType,
          fabric_type: orderData.fabricDetails?.type,
          fabric_color: orderData.fabricDetails?.color,
          fabric_quantity: orderData.fabricDetails?.quantity,
          fabric_unit: orderData.fabricDetails?.unit,
          measurement_id: orderData.measurementId,
          special_instructions: orderData.specialInstructions,
          expected_delivery_date: expectedDeliveryDate.toISOString(),
          total_amount: orderData.totalAmount,
          advance_paid: orderData.advancePaid,
          balance_amount: orderData.balanceAmount,
          notes: orderData.notes
        }])
        .select()
        .single();

      if (error) throw error;

      // Create initial status history
      await supabase
        .from('oms_order_status_history')
        .insert([{
          order_id: orderId,
          status: 'pending',
          notes: 'Order created',
          updated_by_name: 'System'
        }]);

      const order: Order = {
        id: data.id,
        customerId: data.customer_id,
        storeId: data.store_id,
        assignedTo: data.assigned_to,
        type: data.type,
        status: data.status,
        priority: data.priority,
        garmentType: data.garment_type,
        styleImages: data.style_images || [],
        fabricImages: data.fabric_images || [],
        fabricDetails: {
          type: data.fabric_type || '',
          color: data.fabric_color || '',
          quantity: data.fabric_quantity || 0,
          unit: data.fabric_unit || 'meters'
        },
        measurementId: data.measurement_id,
        specialInstructions: data.special_instructions,
        orderDate: new Date(data.order_date),
        expectedDeliveryDate: new Date(data.expected_delivery_date),
        actualDeliveryDate: data.actual_delivery_date ? new Date(data.actual_delivery_date) : undefined,
        fittingDate: data.fitting_date ? new Date(data.fitting_date) : undefined,
        totalAmount: parseFloat(data.total_amount),
        advancePaid: parseFloat(data.advance_paid),
        balanceAmount: parseFloat(data.balance_amount),
        advancePaidDate: data.advance_paid_date ? new Date(data.advance_paid_date) : undefined,
        balancePaidDate: data.balance_paid_date ? new Date(data.balance_paid_date) : undefined,
        statusHistory: [],
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create order' };
    }
  },

  /**
   * Gets an order by ID
   * 
   * @param id - The order ID
   * @returns API response with the order
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          oms_order_status_history (
            id,
            status,
            notes,
            updated_by_name,
            timestamp
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const order: Order = {
        id: data.id,
        customerId: data.customer_id,
        storeId: data.store_id,
        assignedTo: data.assigned_to,
        type: data.type,
        status: data.status,
        priority: data.priority,
        garmentType: data.garment_type,
        styleImages: data.style_images || [],
        fabricImages: data.fabric_images || [],
        fabricDetails: {
          type: data.fabric_type || '',
          color: data.fabric_color || '',
          quantity: data.fabric_quantity || 0,
          unit: data.fabric_unit || 'meters'
        },
        measurementId: data.measurement_id,
        specialInstructions: data.special_instructions,
        orderDate: new Date(data.order_date),
        expectedDeliveryDate: new Date(data.expected_delivery_date),
        actualDeliveryDate: data.actual_delivery_date ? new Date(data.actual_delivery_date) : undefined,
        fittingDate: data.fitting_date ? new Date(data.fitting_date) : undefined,
        totalAmount: parseFloat(data.total_amount),
        advancePaid: parseFloat(data.advance_paid),
        balanceAmount: parseFloat(data.balance_amount),
        advancePaidDate: data.advance_paid_date ? new Date(data.advance_paid_date) : undefined,
        balancePaidDate: data.balance_paid_date ? new Date(data.balance_paid_date) : undefined,
        statusHistory: data.oms_order_status_history.map((h: any) => ({
          id: h.id,
          orderId: data.id,
          status: h.status,
          notes: h.notes,
          updatedBy: h.updated_by_name,
          timestamp: new Date(h.timestamp)
        })),
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: error.message || 'Order not found' };
    }
  },

  /**
   * Gets all orders with optional filtering
   * 
   * @param filters - Optional filters to apply
   * @returns Paginated response with orders
   */
  getAll: async (filters?: Partial<SearchFilters>): Promise<PaginatedResponse<Order>> => {
    try {
      let query = supabase
        .from('oms_orders')
        .select(`
          *,
          oms_customers (name, phone),
          oms_stores (name, code)
        `);
      
      if (filters?.orderId) {
        query = query.ilike('id', `%${filters.orderId}%`);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.customerPhone) {
        query = query.eq('oms_customers.phone', filters.customerPhone);
      }
      if (filters?.storeId) {
        query = query.eq('store_id', filters.storeId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.dateFrom) {
        query = query.gte('order_date', filters.dateFrom.toISOString());
      }
      if (filters?.dateTo) {
        query = query.lte('order_date', filters.dateTo.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const orders: Order[] = data.map((item: any) => ({
        id: item.id,
        customerId: item.customer_id,
        storeId: item.store_id,
        assignedTo: item.assigned_to,
        type: item.type,
        status: item.status,
        priority: item.priority,
        garmentType: item.garment_type,
        styleImages: item.style_images || [],
        fabricImages: item.fabric_images || [],
        fabricDetails: {
          type: item.fabric_type || '',
          color: item.fabric_color || '',
          quantity: item.fabric_quantity || 0,
          unit: item.fabric_unit || 'meters'
        },
        measurementId: item.measurement_id,
        specialInstructions: item.special_instructions,
        orderDate: new Date(item.order_date),
        expectedDeliveryDate: new Date(item.expected_delivery_date),
        actualDeliveryDate: item.actual_delivery_date ? new Date(item.actual_delivery_date) : undefined,
        fittingDate: item.fitting_date ? new Date(item.fitting_date) : undefined,
        totalAmount: parseFloat(item.total_amount),
        advancePaid: parseFloat(item.advance_paid),
        balanceAmount: parseFloat(item.balance_amount),
        advancePaidDate: item.advance_paid_date ? new Date(item.advance_paid_date) : undefined,
        balancePaidDate: item.balance_paid_date ? new Date(item.balance_paid_date) : undefined,
        statusHistory: [],
        notes: item.notes || '',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return {
        success: true,
        data: orders,
        pagination: {
          page: 1,
          limit: orders.length,
          total: orders.length,
          totalPages: 1
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch orders',
        pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }
      };
    }
  },

  /**
   * Searches for orders based on filters
   * 
   * @param filters - The search filters
   * @returns Paginated response with matching orders
   */
  search: async (filters: SearchFilters): Promise<PaginatedResponse<Order>> => {
    try {
      let query = supabase
        .from('oms_orders')
        .select(`
          *,
          oms_customers (name, phone),
          oms_stores (name, code)
        `);
      
      if (filters.orderId) {
        query = query.ilike('id', `%${filters.orderId}%`);
      }
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters.customerPhone) {
        query = query.eq('oms_customers.phone', filters.customerPhone);
      }
      if (filters.storeId) {
        query = query.eq('store_id', filters.storeId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const orders: Order[] = data.map((item: any) => ({
        id: item.id,
        customerId: item.customer_id,
        storeId: item.store_id,
        assignedTo: item.assigned_to,
        type: item.type,
        status: item.status,
        priority: item.priority,
        garmentType: item.garment_type,
        styleImages: item.style_images || [],
        fabricImages: item.fabric_images || [],
        fabricDetails: {
          type: item.fabric_type || '',
          color: item.fabric_color || '',
          quantity: item.fabric_quantity || 0,
          unit: item.fabric_unit || 'meters'
        },
        measurementId: item.measurement_id,
        specialInstructions: item.special_instructions,
        orderDate: new Date(item.order_date),
        expectedDeliveryDate: new Date(item.expected_delivery_date),
        actualDeliveryDate: item.actual_delivery_date ? new Date(item.actual_delivery_date) : undefined,
        fittingDate: item.fitting_date ? new Date(item.fitting_date) : undefined,
        totalAmount: parseFloat(item.total_amount),
        advancePaid: parseFloat(item.advance_paid),
        balanceAmount: parseFloat(item.balance_amount),
        advancePaidDate: item.advance_paid_date ? new Date(item.advance_paid_date) : undefined,
        balancePaidDate: item.balance_paid_date ? new Date(item.balance_paid_date) : undefined,
        statusHistory: [],
        notes: item.notes || '',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return {
        success: true,
        data: orders,
        pagination: {
          page: 1,
          limit: orders.length,
          total: orders.length,
          totalPages: 1
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Search failed',
        pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }
      };
    }
  },

  /**
   * Updates an order's status
   * 
   * @param id - The order ID
   * @param status - The new status
   * @param notes - Optional notes about the status change
   * @returns API response with the updated order
   */
  updateStatus: async (id: string, status: Order['status'], notes?: string): Promise<ApiResponse<Order>> => {
    try {
      const currentUser = authService.getCurrentUser();
      
      const { data, error } = await supabase
        .from('oms_orders')
        .update({ 
          status,
          actual_delivery_date: status === 'delivered' ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Add status history entry
      await supabase
        .from('oms_order_status_history')
        .insert([{
          order_id: id,
          status,
          notes,
          updated_by: currentUser?.id,
          updated_by_name: currentUser?.username || 'System'
        }]);

      const order: Order = {
        id: data.id,
        customerId: data.customer_id,
        storeId: data.store_id,
        assignedTo: data.assigned_to,
        type: data.type,
        status: data.status,
        priority: data.priority,
        garmentType: data.garment_type,
        styleImages: data.style_images || [],
        fabricImages: data.fabric_images || [],
        fabricDetails: {
          type: data.fabric_type || '',
          color: data.fabric_color || '',
          quantity: data.fabric_quantity || 0,
          unit: data.fabric_unit || 'meters'
        },
        measurementId: data.measurement_id,
        specialInstructions: data.special_instructions,
        orderDate: new Date(data.order_date),
        expectedDeliveryDate: new Date(data.expected_delivery_date),
        actualDeliveryDate: data.actual_delivery_date ? new Date(data.actual_delivery_date) : undefined,
        fittingDate: data.fitting_date ? new Date(data.fitting_date) : undefined,
        totalAmount: parseFloat(data.total_amount),
        advancePaid: parseFloat(data.advance_paid),
        balanceAmount: parseFloat(data.balance_amount),
        advancePaidDate: data.advance_paid_date ? new Date(data.advance_paid_date) : undefined,
        balancePaidDate: data.balance_paid_date ? new Date(data.balance_paid_date) : undefined,
        statusHistory: [],
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update order status' };
    }
  },

  /**
   * Tracks an order by order ID and phone number
   * 
   * @param orderId - The order ID
   * @param phone - The customer's phone number
   * @returns API response with the order
   */
  trackByOrderAndPhone: async (orderId: string, phone: string): Promise<ApiResponse<Order>> => {
    try {
      const { data, error } = await supabase
        .from('oms_orders')
        .select(`
          *,
          oms_customers!inner (name, phone),
          oms_stores (name, phone),
          oms_order_status_history (
            id,
            status,
            notes,
            updated_by_name,
            timestamp
          )
        `)
        .eq('id', orderId)
        .eq('oms_customers.phone', phone)
        .single();

      if (error) throw error;

      const order: Order = {
        id: data.id,
        customerId: data.customer_id,
        storeId: data.store_id,
        assignedTo: data.assigned_to,
        type: data.type,
        status: data.status,
        priority: data.priority,
        garmentType: data.garment_type,
        styleImages: data.style_images || [],
        fabricImages: data.fabric_images || [],
        fabricDetails: {
          type: data.fabric_type || '',
          color: data.fabric_color || '',
          quantity: data.fabric_quantity || 0,
          unit: data.fabric_unit || 'meters'
        },
        measurementId: data.measurement_id,
        specialInstructions: data.special_instructions,
        orderDate: new Date(data.order_date),
        expectedDeliveryDate: new Date(data.expected_delivery_date),
        actualDeliveryDate: data.actual_delivery_date ? new Date(data.actual_delivery_date) : undefined,
        fittingDate: data.fitting_date ? new Date(data.fitting_date) : undefined,
        totalAmount: parseFloat(data.total_amount),
        advancePaid: parseFloat(data.advance_paid),
        balanceAmount: parseFloat(data.balance_amount),
        advancePaidDate: data.advance_paid_date ? new Date(data.advance_paid_date) : undefined,
        balancePaidDate: data.balance_paid_date ? new Date(data.balance_paid_date) : undefined,
        statusHistory: data.oms_order_status_history.map((h: any) => ({
          id: h.id,
          orderId: data.id,
          status: h.status,
          notes: h.notes,
          updatedBy: h.updated_by_name,
          timestamp: new Date(h.timestamp)
        })),
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: order };
    } catch (error: any) {
      return { success: false, error: error.message || 'Order not found or invalid phone number' };
    }
  }
};

// Export individual functions for backward compatibility and direct imports
export const createOrder = orderService.create;
export const getOrders = orderService.getAll;
export const getOrderById = orderService.getById;
export const searchOrders = orderService.search;
export const updateOrderStatus = orderService.updateStatus;
export const trackOrder = orderService.trackByOrderAndPhone;