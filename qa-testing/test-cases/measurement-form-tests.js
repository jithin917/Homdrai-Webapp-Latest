// Measurement Form Test Cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NewOrderModal } from '../../../src/pages/oms/components/NewOrderModal';

describe('Measurement Form Tests', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    customers: [
      { id: 'CUST001', name: 'John Doe', phone: '1234567890' },
      { id: 'CUST002', name: 'Jane Smith', phone: '0987654321' }
    ],
    stores: [
      { id: 'store1', name: 'Main Store', code: 'MS001' }
    ],
    users: [
      { id: 'user1', username: 'staff1', role: 'sales_staff' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-MF-001: Measurement Form Accessibility', () => {
    test('should display measurement form when "Use Custom Measurements" is selected', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Select a customer first
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      // Click on custom measurements checkbox
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Verify measurement form appears
      await waitFor(() => {
        expect(screen.getByText(/measurement details/i)).toBeInTheDocument();
      });
    });

    test('should persist measurement data when switching between form sections', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Navigate to measurements section
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Fill in measurement data
      const chestInput = screen.getByLabelText(/chest/i);
      fireEvent.change(chestInput, { target: { value: '40' } });
      
      // Switch to another section and back
      const orderDetailsTab = screen.getByText(/order details/i);
      fireEvent.click(orderDetailsTab);
      
      const measurementTab = screen.getByText(/measurement details/i);
      fireEvent.click(measurementTab);
      
      // Verify data is still there
      expect(chestInput.value).toBe('40');
    });
  });

  describe('TC-MF-002: Measurement Form Validation', () => {
    test('should validate required measurement fields', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Setup form
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Try to submit without required measurements
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/please fill in required measurements/i)).toBeInTheDocument();
      });
    });

    test('should accept valid measurement values', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill valid measurements
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Fill measurement fields
      const measurements = {
        chest: '40',
        waist: '32',
        shoulder: '18',
        length: '28'
      };
      
      Object.entries(measurements).forEach(([field, value]) => {
        const input = screen.getByLabelText(new RegExp(field, 'i'));
        fireEvent.change(input, { target: { value } });
      });
      
      // Verify no validation errors
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('TC-MF-003: Measurement Form Disappearance Bug', () => {
    test('should not hide measurement form on customer change', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Select customer and enable custom measurements
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Verify form is visible
      expect(screen.getByText(/measurement details/i)).toBeInTheDocument();
      
      // Change customer
      fireEvent.change(customerSelect, { target: { value: 'CUST002' } });
      
      // Form should still be visible
      await waitFor(() => {
        expect(screen.getByText(/measurement details/i)).toBeInTheDocument();
      });
    });

    test('should maintain form state during re-renders', async () => {
      const { rerender } = render(<NewOrderModal {...mockProps} />);
      )
      
      // Setup form
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const customMeasurementsCheckbox = screen.getByLabelText(/use custom measurements/i);
      fireEvent.click(customMeasurementsCheckbox);
      
      // Fill some data
      const chestInput = screen.getByLabelText(/chest/i);
      fireEvent.change(chestInput, { target: { value: '42' } });
      
      // Force re-render
      rerender(<NewOrderModal {...mockProps} />);
      )
      
      // Data should persist
      expect(screen.getByDisplayValue('42')).toBeInTheDocument();
    });
  });
});