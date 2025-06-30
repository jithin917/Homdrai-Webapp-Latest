// Performance Test Cases
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NewOrderModal } from '../../../src/pages/oms/components/NewOrderModal';

describe('Performance Tests', () => {
  describe('TC-PERF-001: Render Performance', () => {
    test('should render modal within acceptable time', () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        customers: Array.from({ length: 100 }, (_, i) => ({
          id: `CUST${i}`,
          name: `Customer ${i}`,
          phone: `${i}`.padStart(10, '0')
        })),
        stores: [{ id: 'store1', name: 'Main Store', code: 'MS001' }],
        users: [{ id: 'user1', username: 'staff1', role: 'sales_staff' }]
      };

      const startTime = performance.now();
      render(<NewOrderModal {...mockProps} />);
      )
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    test('should handle search input without lag', async () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        customers: Array.from({ length: 1000 }, (_, i) => ({
          id: `CUST${i}`,
          name: `Customer ${i}`,
          phone: `${i}`.padStart(10, '0')
        })),
        stores: [{ id: 'store1', name: 'Main Store', code: 'MS001' }],
        users: [{ id: 'user1', username: 'staff1', role: 'sales_staff' }]
      };

      render(<NewOrderModal {...mockProps} />);
      )
      
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      
      const startTime = performance.now();
      fireEvent.change(searchInput, { target: { value: 'Customer 1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Customer 1')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // Search should complete in less than 200ms
    });
  });

  describe('TC-PERF-002: Memory Usage', () => {
    test('should not cause memory leaks on modal open/close', () => {
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn(),
        customers: [{ id: 'CUST001', name: 'John Doe', phone: '1234567890' }],
        stores: [{ id: 'store1', name: 'Main Store', code: 'MS001' }],
        users: [{ id: 'user1', username: 'staff1', role: 'sales_staff' }]
      };

      const { unmount } = render(<NewOrderModal {...mockProps} />);
      )
      
      // Simulate multiple open/close cycles
      for (let i = 0; i < 10; i++) {
        unmount();
        render(<NewOrderModal {...mockProps} />);
        )
      }
      
      // Memory usage should remain stable
      expect(performance.memory?.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });
});