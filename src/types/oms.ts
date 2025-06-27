// Order Management System Types
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'store_manager' | 'sales_staff';
  storeId?: string;
  isActive: boolean;
  lastLogin?: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  code: string; // Used in order ID generation
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };
  phone: string;
  email: string;
  managerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string; // CUST-YYYY-XXXXX format
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    country: string;
  };
  measurements?: CustomerMeasurements;
  orderHistory: string[]; // Order IDs
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerMeasurements {
  id: string;
  customerId: string;
  unit: 'cm' | 'inches';
  top: {
    FL: number; // Full Length
    SH: number; // Shoulder
    SL: number; // Sleeve Length
    SR: number; // Sleeve Round
    MR: number; // Mid Round
    AH: number; // Arm Hole
    CH: number; // Chest
    BR: number; // Bust Round
    WR: number; // Waist Round
    HIP: number; // Hip
    SLIT: number; // Slit
    FN: number; // Front Neck
    BN: number; // Back Neck
    DP: number; // Dart Point
    PP: number; // Princess Panel
  };
  bottom?: {
    FL: number; // Full Length
    WR: number; // Waist Round
    SR: number; // Seat Round
    TR: number; // Thigh Round
    LR: number; // Leg Round
    AR: number; // Ankle Round
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string; // ORD-STORECODE-YYYYMMDD-XXX format
  customerId: string;
  storeId: string;
  type: 'new_stitching' | 'alterations';
  status: 'pending' | 'confirmed' | 'in_progress' | 'fitting_scheduled' | 'ready' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Garment Details
  garmentType: string;
  styleImages: string[]; // URLs to uploaded images
  fabricImages: string[]; // URLs to fabric photos
  fabricDetails: {
    type: string;
    color: string;
    quantity: number;
    unit: 'meters' | 'yards';
  };
  
  // Measurements
  // Measurements
  measurementId?: string;
  measurements?: OrderMeasurements;
  specialInstructions?: string;
  
  // Dates and Timeline
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  fittingDate?: Date;
  
  // Financial
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  advancePaidDate?: Date;
  balancePaidDate?: Date;
  
  // Tracking
  statusHistory: OrderStatusHistory[];
  assignedTo?: string; // Staff member ID
  notes: string;
  
  createdAt: Date;
  updatedAt: Date;
}

interface OrderMeasurements {
  id?: string;
  unit: 'cm' | 'inches';
  top: {
    FL?: number | string; // Full Length
    SH?: number | string; // Shoulder
    SL?: number | string; // Sleeve Length
    SR?: number | string; // Sleeve Round
    MR?: number | string; // Mid Round
    AH?: number | string; // Arm Hole
    CH?: number | string; // Chest
    BR?: number | string; // Bust Round
    WR?: number | string; // Waist Round
    HIP?: number | string; // Hip
    SLIT?: number | string; // Slit
    FN?: number | string; // Front Neck
    BN?: number | string; // Back Neck
    DP?: number | string; // Dart Point
    PP?: number | string; // Princess Panel
  };
  bottom?: {
    FL?: number | string; // Full Length
    WR?: number | string; // Waist Round
    SR?: number | string; // Seat Round
    TR?: number | string; // Thigh Round
    LR?: number | string; // Leg Round
    AR?: number | string; // Ankle Round
  };
  notes?: string;
  customMeasurements?: any;
}

interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: Order['status'];
  notes?: string;
  updatedBy: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  orderId?: string;
  customerId?: string;
  sentAt?: Date;
  createdAt: Date;
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

interface StorePerformance {
  storeId: string;
  storeName: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
  completionRate: number;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}