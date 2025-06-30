import { Customer, Order, User, Store, CustomerMeasurements } from './oms';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search Filter Types
export interface SearchFilters {
  orderId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  storeId?: string;
  status?: Order['status'];
  type?: Order['type'];
  dateFrom?: Date;
  dateTo?: Date;
  assignedTo?: string;
}

// Authentication Types
export interface LoginResponse {
  user: User;
  token: string;
}

// Dashboard Types
export interface StorePerformance {
  storeId: string;
  storeName: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  completionRate: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  customerCount: number;
  storePerformance: StorePerformance[];
}