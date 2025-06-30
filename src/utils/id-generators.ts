/**
 * Generates a customer ID with the format CUST-YYYY-XXXXX
 * 
 * @returns A unique customer ID
 */
export const generateCustomerId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `CUST-${year}-${random}`;
};

/**
 * Generates an order ID with the format ORD-STORECODE-YYYYMMDD-XXX
 * 
 * @param storeCode - The code of the store
 * @returns A unique order ID
 */
export const generateOrderId = (storeCode: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `ORD-${storeCode}-${year}${month}${day}-${random}`;
};