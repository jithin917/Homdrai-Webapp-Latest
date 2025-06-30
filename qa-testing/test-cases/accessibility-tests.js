// Accessibility Test Cases
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { NewOrderModal } from '../../../src/pages/oms/components/NewOrderModal';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
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

  describe('TC-A11Y-001: WCAG Compliance', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(<NewOrderModal {...mockProps} />);
      )
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper ARIA labels', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/garment type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total amount/i)).toBeInTheDocument();
    });

    test('should have proper heading hierarchy', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent(/create new order/i);
    });

    test('should support keyboard navigation', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const firstInput = screen.getByDisplayValue('Select Customer');
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
    });
  });

  describe('TC-A11Y-002: Screen Reader Support', () => {
    test('should have descriptive button text', () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      expect(screen.getByRole('button', { name: /create order/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('should announce form validation errors', async () => {
      render(<NewOrderModal {...mockProps} />);
      )
      
      const submitButton = screen.getByText(/create order/i);
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});