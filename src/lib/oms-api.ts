import { authService } from '../services/auth-service';
import { customerService } from '../services/customer-service';
import { orderService } from '../services/order-service';
import { dashboardService } from '../services/dashboard-service';
import { storeService } from '../services/store-service';
import { measurementsService } from '../services/measurements-service';

// Export all services
export const authAPI = authService;
export const customerAPI = customerService;
export const orderAPI = orderService;
export const dashboardAPI = dashboardService;
export const storeAPI = storeService;
export const measurementsAPI = measurementsService;