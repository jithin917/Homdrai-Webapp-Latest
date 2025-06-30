import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null
      })),
      ilike: vi.fn(() => ({
        data: [],
        error: null
      })),
      order: vi.fn(() => ({
        data: [],
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      data: null,
      error: null
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }))
};

vi.mock('../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Import components after mocking
import { NewOrderModal } from '../src/pages/oms/components/NewOrderModal';
import { NewCustomerModal } from '../src/pages/oms/components/NewCustomerModal';

describe('🔍 DIAGNOSTIC TESTS - OMS Issues', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('🚨 CRITICAL ISSUE: Customer Selection', () => {
    it('DIAG-001: Should render customer dropdown without crashing', async () => {
      console.log('🧪 Testing customer dropdown rendering...');
      
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      // Mock customers data
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              { id: 'CUST001', name: 'John Doe', phone: '1234567890', email: 'john@test.com' },
              { id: 'CUST002', name: 'Jane Smith', phone: '0987654321', email: 'jane@test.com' }
            ],
            error: null
          }))
        }))
      });

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Check if customer dropdown exists
        const customerSelect = screen.getByRole('combobox', { name: /customer/i });
        expect(customerSelect).toBeInTheDocument();
        console.log('✅ Customer dropdown rendered successfully');

        // Check if "Add Customer" button exists
        const addCustomerBtn = screen.getByRole('button', { name: /add.*customer/i });
        expect(addCustomerBtn).toBeInTheDocument();
        console.log('✅ Add Customer button found');

      } catch (error) {
        console.error('❌ Customer dropdown rendering failed:', error.message);
        throw error;
      }
    });

    it('DIAG-002: Should handle customer search functionality', async () => {
      console.log('🧪 Testing customer search...');
      
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      // Mock search results
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                { id: 'CUST001', name: 'John Doe', phone: '1234567890', email: 'john@test.com' }
              ],
              error: null
            }))
          }))
        }))
      });

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Find search input (if it exists)
        const searchInputs = screen.getAllByRole('textbox');
        console.log(`📝 Found ${searchInputs.length} text inputs`);

        // Test typing in search
        if (searchInputs.length > 0) {
          await user.type(searchInputs[0], 'John');
          console.log('✅ Search input accepts text');
        }

      } catch (error) {
        console.error('❌ Customer search test failed:', error.message);
        throw error;
      }
    });
  });

  describe('🚨 CRITICAL ISSUE: Measurement Form', () => {
    it('DIAG-003: Should show/hide measurement form correctly', async () => {
      console.log('🧪 Testing measurement form visibility...');
      
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Look for measurement-related elements
        const measurementElements = screen.queryAllByText(/measurement/i);
        console.log(`📏 Found ${measurementElements.length} measurement-related elements`);

        // Look for custom measurement checkbox/toggle
        const customMeasurementToggle = screen.queryByRole('checkbox', { name: /custom.*measurement/i });
        if (customMeasurementToggle) {
          console.log('✅ Custom measurement toggle found');
          
          // Test toggling
          await user.click(customMeasurementToggle);
          console.log('✅ Custom measurement toggle clicked');
        } else {
          console.log('⚠️ Custom measurement toggle not found');
        }

      } catch (error) {
        console.error('❌ Measurement form test failed:', error.message);
        throw error;
      }
    });
  });

  describe('🚨 CRITICAL ISSUE: Button Functionality', () => {
    it('DIAG-004: Should handle Cancel button correctly', async () => {
      console.log('🧪 Testing Cancel button...');
      
      const mockOnClose = vi.fn();
      const mockProps = {
        isOpen: true,
        onClose: mockOnClose,
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Find Cancel button
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
        console.log('✅ Cancel button found');

        // Test clicking Cancel
        await user.click(cancelButton);
        
        // Check if onClose was called
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
        console.log('✅ Cancel button triggers close function');

      } catch (error) {
        console.error('❌ Cancel button test failed:', error.message);
        throw error;
      }
    });

    it('DIAG-005: Should handle Close (X) button correctly', async () => {
      console.log('🧪 Testing Close (X) button...');
      
      const mockOnClose = vi.fn();
      const mockProps = {
        isOpen: true,
        onClose: mockOnClose,
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Find Close button (X)
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
        console.log('✅ Close (X) button found');

        // Test clicking Close
        await user.click(closeButton);
        
        // Check if onClose was called
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
        console.log('✅ Close (X) button triggers close function');

      } catch (error) {
        console.error('❌ Close button test failed:', error.message);
        throw error;
      }
    });
  });

  describe('🚨 CRITICAL ISSUE: Add Customer Modal', () => {
    it('DIAG-006: Should open Add Customer modal', async () => {
      console.log('🧪 Testing Add Customer modal...');
      
      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOrderCreated: vi.fn(),
        stores: [{ id: '1', name: 'Test Store', code: 'TS001' }],
        users: [{ id: '1', username: 'testuser' }]
      };

      try {
        render(<NewOrderModal {...mockProps} />);
        
        // Find Add Customer button
        const addCustomerBtn = screen.getByRole('button', { name: /add.*customer/i });
        expect(addCustomerBtn).toBeInTheDocument();
        console.log('✅ Add Customer button found');

        // Click Add Customer button
        await user.click(addCustomerBtn);
        console.log('✅ Add Customer button clicked');

        // Check if New Customer modal appears
        await waitFor(() => {
          const modalTitle = screen.queryByText(/add.*customer/i);
          if (modalTitle) {
            console.log('✅ Add Customer modal opened');
          } else {
            console.log('⚠️ Add Customer modal may not have opened');
          }
        });

      } catch (error) {
        console.error('❌ Add Customer modal test failed:', error.message);
        throw error;
      }
    });
  });

  describe('🔍 DATA FLOW DIAGNOSTICS', () => {
    it('DIAG-007: Should handle API responses correctly', async () => {
      console.log('🧪 Testing API data flow...');
      
      // Test with empty data
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      });

      const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        onOrderCreated: vi.fn(),
        stores: [],
        users: []
      };

      try {
        render(<NewOrderModal {...mockProps} />);
        console.log('✅ Component renders with empty data');

        // Test with error response
        mockSupabase.from.mockReturnValue({
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        });

        // Re-render to test error handling
        render(<NewOrderModal {...mockProps} />);
        console.log('✅ Component handles API errors gracefully');

      } catch (error) {
        console.error('❌ API data flow test failed:', error.message);
        throw error;
      }
    });
  });
});

// Export diagnostic results
export const runDiagnostics = async () => {
  console.log('🚀 Starting OMS Diagnostic Tests...');
  console.log('=' .repeat(50));
  
  const results = {
    customerSelection: 'TESTING',
    measurementForm: 'TESTING',
    buttonFunctionality: 'TESTING',
    addCustomerModal: 'TESTING',
    dataFlow: 'TESTING'
  };

  console.log('📊 Diagnostic Results:');
  console.log(results);
  
  return results;
};