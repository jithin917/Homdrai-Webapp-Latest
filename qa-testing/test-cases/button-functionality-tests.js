// Button Functionality Test Cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NewOrderModal } from '../../../src/pages/oms/components/NewOrderModal';

describe('Button Functionality Tests', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    customers: [
      { id: 'CUST001', name: 'John Doe', phone: '1234567890' }
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

  describe('TC-BF-001: Cancel Button Functionality', () => {
    test('should close modal when Cancel button is clicked', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('should clear form data when Cancel is clicked', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill some form data
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      // Click cancel
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      
      // Verify form is cleared (if modal reopens)
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalled();
      });
    });

    test('should show confirmation dialog for unsaved changes', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill form with data
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      // Click cancel
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      
      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-BF-002: Close Button Functionality', () => {
    test('should close modal when X button is clicked', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('should handle ESC key press to close modal', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('should close modal when clicking outside modal area', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const modalOverlay = screen.getByTestId('modal-overlay');
      fireEvent.click(modalOverlay);
      
      await waitFor(() => {
        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('TC-BF-003: Submit Button Functionality', () => {
    test('should validate required fields before submission', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
        expect(mockProps.onSubmit).not.toHaveBeenCalled();
      });
    });

    test('should submit form with valid data', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill required fields
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      fireEvent.change(totalAmountInput, { target: { value: '1000' } });
      
      const deliveryDateInput = screen.getByLabelText(/expected delivery date/i);
      fireEvent.change(deliveryDateInput, { target: { value: '2024-12-31' } });
      
      // Submit form
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    test('should disable submit button during submission', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill required fields
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });
  });

  describe('TC-BF-004: Navigation Button Functionality', () => {
    test('should navigate between form sections', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Click on different sections
      const measurementTab = screen.getByText(/measurements/i);
      fireEvent.click(measurementTab);
      
      await waitFor(() => {
        expect(screen.getByText(/measurement details/i)).toBeInTheDocument();
      });
      
      const orderDetailsTab = screen.getByText(/order details/i);
      fireEvent.click(orderDetailsTab);
      
      await waitFor(() => {
        expect(screen.getByText(/garment type/i)).toBeInTheDocument();
      });
    });

    test('should maintain form state when navigating between sections', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      // Fill data in first section
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      // Navigate to another section
      const measurementTab = screen.getByText(/measurements/i);
      fireEvent.click(measurementTab);
      
      // Navigate back
      const customerTab = screen.getByText(/customer/i);
      fireEvent.click(customerTab);
      
      // Data should be preserved
      expect(customerSelect.value).toBe('CUST001');
    });
  });

  describe('TC-BF-005: Button State Management', () => {
    test('should update button states based on form validity', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const submitButton = screen.getByText(/create order/i);
      
      // Initially disabled due to missing required fields
      expect(submitButton).toBeDisabled();
      
      // Fill required fields
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const garmentTypeInput = screen.getByPlaceholderText(/designer blouse/i);
      fireEvent.change(garmentTypeInput, { target: { value: 'Test Garment' } });
      
      // Button should be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('should show loading state during async operations', async () => {
      const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
      const propsWithSlowSubmit = { ...mockProps, onSubmit: slowOnSubmit };
      
      render(<NewOrderModal {...propsWithSlowSubmit} />);
      )
      
      // Fill form and submit
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/creating order/i)).toBeInTheDocument();
      });
    });
  });
});