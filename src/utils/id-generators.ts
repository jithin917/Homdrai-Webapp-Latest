/**
 * Utility functions for generating unique IDs for various entities
 */

/**
 * Generate a unique customer ID with format: CUST-YYYYMMDD-XXXX
 * Example: CUST-20240101-A1B2
 */
export function generateCustomerId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate a random 4-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `CUST-${dateStr}-${suffix}`;
}

/**
 * Generate a unique order ID with format: ORD-YYYYMMDD-XXXX
 * Example: ORD-20240101-A1B2
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate a random 4-character alphanumeric suffix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `ORD-${dateStr}-${suffix}`;
}

/**
 * Generate a unique measurement ID
 */
export function generateMeasurementId(): string {
  return `MEAS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique store code with format: ST-XXX
 * Example: ST-001, ST-002
 */
export function generateStoreCode(sequence: number): string {
  return `ST-${String(sequence).padStart(3, '0')}`;
}

/**
 * Generate a unique user ID (for internal use)
 */
export function generateUserId(): string {
  return `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a random token for various purposes
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}