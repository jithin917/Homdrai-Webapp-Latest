// Customer Search Test Cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NewOrderModal } from '../../../src/pages/oms/components/NewOrderModal';

describe('Customer Search Tests', () => {
  const mockCustomers = [
    { id: 'CUST001', name: 'John Doe', phone: '1234567890', email: 'john@example.com' },
    { id: 'CUST002', name: 'Jane Smith', phone: '0987654321', email: 'jane@example.com' },
    { id: 'CUST003', name: 'Bob Johnson', phone: '5555555555', email: 'bob@example.com' }
  ];

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    customers: mockCustomers,
    stores: [{ id: 'store1', name: 'Main Store', code: 'MS001' }],
    users: [{ id: 'user1', username: 'staff1', role: 'sales_staff' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC-CS-001: Customer Search Functionality', () => {
    test('should display all customers in dropdown initially', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.click(customerSelect);
      
      await waitFor(() => {
        mockCustomers.forEach(customer => {
          expect(screen.getByText(customer.name)).toBeInTheDocument();
        });
      });
    });

    test('should filter customers by name', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('should filter customers by phone number', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      fireEvent.change(searchInput, { target: { value: '1234' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('should handle empty search results gracefully', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentCustomer' } });
      
      await waitFor(() => {
        expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
      });
    });
  });

  describe('TC-CS-002: Customer Selection', () => {
    test('should select customer from dropdown', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      await waitFor(() => {
        expect(customerSelect.value).toBe('CUST001');
      });
    });

    test('should display selected customer information', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
      });
    });

    test('should clear selection when customer is deselected', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const customerSelect = screen.getByDisplayValue('Select Customer');
      fireEvent.change(customerSelect, { target: { value: 'CUST001' } });
      fireEvent.change(customerSelect, { target: { value: '' } });
      
      await waitFor(() => {
        expect(customerSelect.value).toBe('');
      });
    });
  });

  describe('TC-CS-003: Customer Search Error Handling', () => {
    test('should handle customers.map error when customers is not an array', async () => {
      const propsWithInvalidCustomers = {
        ...mockProps,
        customers: null
      };
      
      render(<NewOrderModal {...propsWithInvalidCustomers} />);
      )
      
      // Should not crash and should show appropriate message
      expect(screen.getByText(/no customers available/i)).toBeInTheDocument();
    });

    test('should handle undefined customers gracefully', async () => {
      const propsWithUndefinedCustomers = {
        ...mockProps,
        customers: undefined
      };
      
      render(<NewOrderModal {...propsWithUndefinedCustomers} />);
      )
      
      expect(screen.getByText(/loading customers/i)).toBeInTheDocument();
    });

    test('should handle empty customers array', async () => {
      const propsWithEmptyCustomers = {
        ...mockProps,
        customers: []
      };
      
      render(<NewOrderModal {...propsWithEmptyCustomers} />);
      )
      
      expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
    });
  });

  describe('TC-CS-004: Search Performance', () => {
    test('should debounce search input', async () => {
      const mockSearchFunction = vi.fn();
      render(<NewOrderModal {...mockProps} onSearchCustomers={mockSearchFunction} />);
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      
      // Type rapidly
      fireEvent.change(searchInput, { target: { value: 'J' } });
      fireEvent.change(searchInput, { target: { value: 'Jo' } });
      fireEvent.change(searchInput, { target: { value: 'Joh' } });
      fireEvent.change(searchInput, { target: { value: 'John' } });
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockSearchFunction).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    test('should handle large customer datasets efficiently', async () => {
      const largeCustomerList = Array.from({ length: 1000 }, (_, i) => ({
        id: `CUST${i.toString().padStart(3, '0')}`,
        name: `Customer ${i}`,
        phone: `${i}`.padStart(10, '0'),
        email: `customer${i}@example.com`
      }));

      const propsWithLargeDataset = {
        ...mockProps,
        customers: largeCustomerList
      };

      const startTime = performance.now();
      render(<NewOrderModal {...propsWithLargeDataset} />);
      )
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});