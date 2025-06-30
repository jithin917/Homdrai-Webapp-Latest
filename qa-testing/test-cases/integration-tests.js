// Integration Test Cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { OMSDashboard } from '../../../src/pages/oms/OMSDashboard';

// Mock API services
vi.mock('../../../src/services/customer-service', () => ({
  getCustomers: vi.fn(() => Promise.resolve([
    { id: 'CUST001', name: 'John Doe', phone: '1234567890' },
    { id: 'CUST002', name: 'Jane Smith', phone: '0987654321' }
  ])),
  createCustomer: vi.fn((customer) => Promise.resolve({ id: 'CUST003', ...customer }))
}));

vi.mock('../../../src/services/order-service', () => ({
  createOrder: vi.fn((order) => Promise.resolve({ id: 'ORD001', ...order })),
  getOrders: vi.fn(() => Promise.resolve([]))
}));

describe('Integration Tests', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  describe('TC-INT-001: Complete Order Creation Flow', () => {
    test('should create order with existing customer', async () => {
      renderWithRouter(<OMSDashboard />);
      
      // Open new order modal
      const newOrderButton = screen.getByText(/new order/i);
      fireEvent.click(newOrderButton);
      
      await waitFor(() => {
        expect(screen.getByText(/create new order/i)).toBeInTheDocument();
      });
      
      // Select customer
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      // Fill order details
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Wedding Dress' } });
      
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      fireEvent.change(totalAmountInput, { target: { value: '5000' } });
      
      const deliveryDateInput = screen.getByLabelText(/expected delivery date/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      fireEvent.change(deliveryDateInput, { 
        target: { value: futureDate.toISOString().split('T')[0] } 
      });
      
      // Submit order
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      // Verify order creation
      await waitFor(() => {
        expect(screen.getByText(/order created successfully/i)).toBeInTheDocument();
      });
    });

    test('should create order with new customer', async () => {
      renderWithRouter(<OMSDashboard />);
      
      // Open new order modal
      const newOrderButton = screen.getByText(/new order/i);
      fireEvent.click(newOrderButton);
      
      // Click add new customer
      const addCustomerButton = screen.getByText(/add new customer/i);
      fireEvent.click(addCustomerButton);
      
      await waitFor(() => {
        expect(screen.getByText(/add new customer/i)).toBeInTheDocument();
      });
      
      // Fill customer details
      const nameInput = screen.getByLabelText(/customer name/i);
      fireEvent.change(nameInput, { target: { value: 'New Customer' } });
      
      const phoneInput = screen.getByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { value: '9999999999' } });
      
      // Save customer
      const saveCustomerButton = screen.getByText(/save customer/i);
      fireEvent.click(saveCustomerButton);
      
      // Continue with order creation
      await waitFor(() => {
        expect(screen.getByDisplayValue('New Customer')).toBeInTheDocument();
      });
      
      // Fill remaining order details and submit
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Casual Shirt' } });
      
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/order created successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-INT-002: Error Handling Integration', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API failure
      vi.mocked(require('../../../src/services/order-service').createOrder)
        .mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<OMSDashboard />);
      
      // Try to create order
      const newOrderButton = screen.getByText(/new order/i);
      fireEvent.click(newOrderButton);
      
      // Fill form
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      // Submit
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to create order/i)).toBeInTheDocument();
      });
    });

    test('should handle network connectivity issues', async () => {
      // Simulate network failure
      vi.mocked(require('../../../src/services/customer-service').getCustomers)
        .mockRejectedValueOnce(new Error('Network unavailable'));
      
      renderWithRouter(<OMSDashboard />);
      
      // Should show appropriate error state
      await waitFor(() => {
        expect(screen.getByText(/unable to load customers/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-INT-003: Performance Integration', () => {
    test('should handle large datasets efficiently', async () => {
      // Mock large customer dataset
      const largeCustomerList = Array.from({ length: 1000 }, (_, i) => ({
        id: `CUST${i.toString().padStart(4, '0')}`,
        name: `Customer ${i}`,
        phone: `${i}`.padStart(10, '0')
      }));
      
      vi.mocked(require('../../../src/services/customer-service').getCustomers)
        .mockResolvedValueOnce(largeCustomerList);
      
      const startTime = performance.now();
      renderWithRouter(<OMSDashboard />);
      
      // Open modal and measure render time
      const newOrderButton = screen.getByText(/new order/i);
      fireEvent.click(newOrderButton);
      
      await waitFor(() => {
        expect(screen.getByText(/create new order/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('TC-INT-004: State Management Integration', () => {
    test('should maintain state across component interactions', async () => {
      renderWithRouter(<OMSDashboard />);
      
      // Open modal
      const newOrderButton = screen.getByText(/new order/i);
      fireEvent.click(newOrderButton);
      
      // Fill some data
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      // Close and reopen modal
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      
      fireEvent.click(newOrderButton);
      
      // State should be reset
      await waitFor(() => {
        const newCustomerSelect = screen.getByDisplayValue('Select Customer');
        expect(newCustomerSelect.value).toBe('');
      });
    });
  });
});