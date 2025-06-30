// Automated Test Suite for OMS Issues
// Run with: npm test

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import NewOrderModal from '../src/pages/oms/components/NewOrderModal';

// Mock the API services
vi.mock('../src/services/customer-service', () => ({
  getAllCustomers: vi.fn(),
  createCustomer: vi.fn(),
  searchCustomers: vi.fn(),
}));

vi.mock('../src/services/order-service', () => ({
  createOrder: vi.fn(),
}));

describe('New Order Modal - QA Test Suite', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onOrderCreated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility and Basic Functionality', () => {
    test('should render modal when isOpen is true', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      expect(screen.getByText('Create New Order')).toBeInTheDocument();
    });

    test('should not render modal when isOpen is false', () => {
      render(<NewOrderModal {...mockProps} isOpen={false} />);
      expect(screen.queryByText('Create New Order')).not.toBeInTheDocument();
    });

    test('should call onClose when cancel button is clicked', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when close (X) button is clicked', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Customer Search Functionality', () => {
    const mockCustomers = [
      { id: 'CUST001', name: 'John Doe', phone: '9876543210', email: 'john@example.com' },
      { id: 'CUST002', name: 'Jane Smith', phone: '9876543211', email: 'jane@example.com' },
    ];

    test('should display customer search dropdown', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      expect(screen.getByText('Select Customer')).toBeInTheDocument();
    });

    test('should filter customers based on search input', async () => {
      const { searchCustomers } = require('../src/services/customer-service');
      searchCustomers.mockResolvedValue(mockCustomers);

      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByRole('combobox');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(searchCustomers).toHaveBeenCalledWith('John');
      });
    });

    test('should handle empty search results gracefully', async () => {
      const { searchCustomers } = require('../src/services/customer-service');
      searchCustomers.mockResolvedValue([]);

      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByRole('combobox');
      fireEvent.change(searchInput, { target: { value: 'NonExistentCustomer' } });

      await waitFor(() => {
        expect(screen.getByText('No customers found')).toBeInTheDocument();
      });
    });

    test('should handle API errors in customer search', async () => {
      const { searchCustomers } = require('../src/services/customer-service');
      searchCustomers.mockRejectedValue(new Error('API Error'));

      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByRole('combobox');
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('Error loading customers')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    test('should show validation errors for required fields', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const submitButton = screen.getByText('Create Order');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Customer is required')).toBeInTheDocument();
        expect(screen.getByText('Garment type is required')).toBeInTheDocument();
      });
    });

    test('should validate total amount is greater than 0', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      fireEvent.change(totalAmountInput, { target: { value: '0' } });

      const submitButton = screen.getByText('Create Order');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Total amount must be greater than 0')).toBeInTheDocument();
      });
    });

    test('should validate advance paid does not exceed total amount', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      const advancePaidInput = screen.getByLabelText(/advance paid/i);
      
      fireEvent.change(totalAmountInput, { target: { value: '1000' } });
      fireEvent.change(advancePaidInput, { target: { value: '1500' } });

      const submitButton = screen.getByText('Create Order');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Advance cannot exceed total amount')).toBeInTheDocument();
      });
    });
  });

  describe('Measurement Form Integration', () => {
    test('should show measurement fields when customer is selected', async () => {
      const mockCustomers = [
        { id: 'CUST001', name: 'John Doe', phone: '9876543210' }
      ];
      
      const { getAllCustomers } = require('../src/services/customer-service');
      getAllCustomers.mockResolvedValue(mockCustomers);

      render(<NewOrderModal {...mockProps} />);
      )
      
      // Select a customer
      const customerSelect = screen.getByRole('combobox');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });

      await waitFor(() => {
        expect(screen.getByText('Measurements')).toBeInTheDocument();
      });
    });

    test('should preserve measurement data when switching between form sections', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill in measurement data
      const chestInput = screen.getByLabelText(/chest/i);
      fireEvent.change(chestInput, { target: { value: '40' } });

      // Switch to another section and back
      const orderDetailsTab = screen.getByText('Order Details');
      fireEvent.click(orderDetailsTab);

      const measurementsTab = screen.getByText('Measurements');
      fireEvent.click(measurementsTab);

      // Verify data is preserved
      expect(chestInput.value).toBe('40');
    });
  });

  describe('Order Creation Flow', () => {
    test('should create order successfully with valid data', async () => {
      const { createOrder } = require('../src/services/order-service');
      const { getAllCustomers } = require('../src/services/customer-service');
      
      getAllCustomers.mockResolvedValue([
        { id: 'CUST001', name: 'John Doe', phone: '9876543210' }
      ]);
      createOrder.mockResolvedValue({ id: 'ORDER001' });

      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill in required fields
      const customerSelect = screen.getByRole('combobox');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });

      const garmentTypeInput = screen.getByLabelText(/garment type/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Shirt' } });

      const totalAmountInput = screen.getByLabelText(/total amount/i);
      fireEvent.change(totalAmountInput, { target: { value: '1000' } });

      const deliveryDateInput = screen.getByLabelText(/delivery date/i);
      fireEvent.change(deliveryDateInput, { target: { value: '2024-02-01' } });

      // Submit form
      const submitButton = screen.getByText('Create Order');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createOrder).toHaveBeenCalled();
        expect(mockProps.onOrderCreated).toHaveBeenCalled();
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });

    test('should handle order creation errors gracefully', async () => {
      const { createOrder } = require('../src/services/order-service');
      createOrder.mockRejectedValue(new Error('Order creation failed'));

      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill in required fields and submit
      // ... (similar to above test)

      await waitFor(() => {
        expect(screen.getByText('Failed to create order')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    test('should have proper ARIA labels', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/garment type/i)).toBeInTheDocument();
    });

    test('should support keyboard navigation', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const firstInput = screen.getByRole('combobox');
      firstInput.focus();
      
      // Test Tab navigation
      fireEvent.keyDown(firstInput, { key: 'Tab' });
      
      // Verify focus moves to next element
      expect(document.activeElement).not.toBe(firstInput);
    });

    test('should close modal on Escape key', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    test('should not cause memory leaks', () => {
      const { unmount } = render(<NewOrderModal {...mockProps} />);
      )
      
      // Simulate component unmount
      unmount();
      
      // Verify no lingering event listeners or timers
      expect(vi.getTimerCount()).toBe(0);
    });

    test('should debounce search input', async () => {
      const { searchCustomers } = require('../src/services/customer-service');
      
      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByRole('combobox');
      
      // Type rapidly
      fireEvent.change(searchInput, { target: { value: 'J' } });
      fireEvent.change(searchInput, { target: { value: 'Jo' } });
      fireEvent.change(searchInput, { target: { value: 'Joh' } });
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Wait for debounce
      await waitFor(() => {
        // Should only call search once after debounce period
        expect(searchCustomers).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });
  });
});

// Performance monitoring utilities
export const performanceMonitor = {
  startTiming: (label) => {
    performance.mark(`${label}-start`);
  },
  
  endTiming: (label) => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    console.log(`${label}: ${measure.duration}ms`);
    
    return measure.duration;
  },
  
  checkMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};