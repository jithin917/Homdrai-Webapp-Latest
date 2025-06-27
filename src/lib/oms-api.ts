import { supabase } from './supabase';
import type { 
  User, 
  Store, 
  Customer, 
  Order, 
  CustomerMeasurements,
  SearchFilters,
  ApiResponse,
  PaginatedResponse,
  DashboardStats,
  Notification
} from '../types/oms';

// Utility functions
const generateCustomerId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `CUST-${year}-${random}`;
};

const generateOrderId = (storeCode: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `ORD-${storeCode}-${year}${month}${day}-${random}`;
};

const calculateDeliveryDate = (orderType: Order['type'], priority: Order['priority']): Date => {
  const now = new Date();
  let days = 7; // Default 7 days
  
  if (orderType === 'alterations') {
    days = 3;
  } else if (orderType === 'new_stitching') {
    days = 14;
  }
  
  // Adjust based on priority
  switch (priority) {
    case 'urgent':
      days = Math.ceil(days * 0.5);
      break;
    case 'high':
      days = Math.ceil(days * 0.7);
      break;
    case 'low':
      days = Math.ceil(days * 1.5);
      break;
  }
  
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
};

// Authentication API
export const authAPI = {
  login: async (username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
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

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      localStorage.removeItem('omsToken');
      localStorage.removeItem('omsUser');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('omsUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};

// Customer API
export const customerAPI = {
  create: async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Customer>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .insert([{
          id: generateCustomerId(),
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address_street: customerData.address.street,
          address_city: customerData.address.city,
          address_state: customerData.address.state,
          address_pin_code: customerData.address.pinCode,
          address_country: customerData.address.country,
          communication_email: customerData.communicationPreferences.email,
          communication_sms: customerData.communicationPreferences.sms,
          communication_whatsapp: customerData.communicationPreferences.whatsapp
        }])
        .select()
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create customer' };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Customer>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Customer not found' };
    }
  },

  search: async (filters: Partial<Customer>): Promise<ApiResponse<Customer[]>> => {
    try {
      let query = supabase.from('oms_customers').select('*');
      
      if (filters.phone) {
        query = query.ilike('phone', `%${filters.phone}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const customers: Customer[] = data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: {
          street: item.address_street,
          city: item.address_city,
          state: item.address_state,
          pinCode: item.address_pin_code,
          country: item.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: item.communication_email,
          sms: item.communication_sms,
          whatsapp: item.communication_whatsapp
        },
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return { success: true, data: customers };
    } catch (error: any) {
      return { success: false, error: error.message || 'Search failed' };
    }
  },

  update: async (id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.address) {
        updateData.address_street = updates.address.street;
        updateData.address_city = updates.address.city;
        updateData.address_state = updates.address.state;
        updateData.address_pin_code = updates.address.pinCode;
        updateData.address_country = updates.address.country;
      }
      if (updates.communicationPreferences) {
        updateData.communication_email = updates.communicationPreferences.email;
        updateData.communication_sms = updates.communicationPreferences.sms;
        updateData.communication_whatsapp = updates.communicationPreferences.whatsapp;
      }

      const { data, error } = await supabase
        .from('oms_customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address_street,
          city: data.address_city,
          state: data.address_state,
          pinCode: data.address_pin_code,
          country: data.address_country
        },
        orderHistory: [],
        communicationPreferences: {
          email: data.communication_email,
          sms: data.communication_sms,
          whatsapp: data.communication_whatsapp
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update customer' };
    }
  }
};

// Order API
export const orderAPI = {
  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<ApiResponse<Order>> => {
    try {
      // Get store code for order ID generation
      // Get current user's default store or first available store
      const currentUser = authAPI.getCurrentUser();
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

  updateStatus: async (id: string, status: Order['status'], notes?: string): Promise<ApiResponse<Order>> => {
    try {
      const currentUser = authAPI.getCurrentUser();
      
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

// Dashboard API
export const dashboardAPI = {
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

// Store API
export const storeAPI = {
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

// Measurements API
const measurementsAPI = {
  create: async (measurementData: Omit<CustomerMeasurements, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CustomerMeasurements>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customer_measurements')
        .insert([{
          customer_id: measurementData.customerId,
          unit: measurementData.unit,
          top_fl: measurementData.top.FL,
          top_sh: measurementData.top.SH,
          top_sl: measurementData.top.SL,
          top_sr: measurementData.top.SR,
          top_mr: measurementData.top.MR,
          top_ah: measurementData.top.AH,
          top_ch: measurementData.top.CH,
          top_br: measurementData.top.BR,
          top_wr: measurementData.top.WR,
          top_hip: measurementData.top.HIP,
          top_slit: measurementData.top.SLIT,
          top_fn: measurementData.top.FN,
          top_bn: measurementData.top.BN,
          top_dp: measurementData.top.DP,
          top_pp: measurementData.top.PP,
          bottom_fl: measurementData.bottom?.FL,
          bottom_wr: measurementData.bottom?.WR,
          bottom_sr: measurementData.bottom?.SR,
          bottom_tr: measurementData.bottom?.TR,
          bottom_lr: measurementData.bottom?.LR,
          bottom_ar: measurementData.bottom?.AR,
          notes: measurementData.notes
        }])
        .select()
        .single();

      if (error) throw error;

      const measurements: CustomerMeasurements = {
        id: data.id,
        customerId: data.customer_id,
        unit: data.unit,
        top: {
          FL: data.top_fl,
          SH: data.top_sh,
          SL: data.top_sl,
          SR: data.top_sr,
          MR: data.top_mr,
          AH: data.top_ah,
          CH: data.top_ch,
          BR: data.top_br,
          WR: data.top_wr,
          HIP: data.top_hip,
          SLIT: data.top_slit,
          FN: data.top_fn,
          BN: data.top_bn,
          DP: data.top_dp,
          PP: data.top_pp
        },
        bottom: data.bottom_fl ? {
          FL: data.bottom_fl,
          WR: data.bottom_wr,
          SR: data.bottom_sr,
          TR: data.bottom_tr,
          LR: data.bottom_lr,
          AR: data.bottom_ar
        } : undefined,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: measurements };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create measurements' };
    }
  },

  getByCustomerId: async (customerId: string): Promise<ApiResponse<CustomerMeasurements[]>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customer_measurements')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const measurements: CustomerMeasurements[] = data.map(item => ({
        id: item.id,
        customerId: item.customer_id,
        unit: item.unit,
        top: {
          FL: item.top_fl,
          SH: item.top_sh,
          SL: item.top_sl,
          SR: item.top_sr,
          MR: item.top_mr,
          AH: item.top_ah,
          CH: item.top_ch,
          BR: item.top_br,
          WR: item.top_wr,
          HIP: item.top_hip,
          SLIT: item.top_slit,
          FN: item.top_fn,
          BN: item.top_bn,
          DP: item.top_dp,
          PP: item.top_pp
        },
        bottom: item.bottom_fl ? {
          FL: item.bottom_fl,
          WR: item.bottom_wr,
          SR: item.bottom_sr,
          TR: item.bottom_tr,
          LR: item.bottom_lr,
          AR: item.bottom_ar
        } : undefined,
        notes: item.notes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return { success: true, data: measurements };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch measurements' };
    }
  }
};
