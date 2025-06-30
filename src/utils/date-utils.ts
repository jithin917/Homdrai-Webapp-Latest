/**
 * Calculates the expected delivery date based on order type and priority
 * 
 * @param orderType - The type of order (new_stitching or alterations)
 * @param priority - The priority level of the order
 * @returns The calculated delivery date
 */
export const calculateDeliveryDate = (
  orderType: 'new_stitching' | 'alterations', 
  priority: 'low' | 'medium' | 'high' | 'urgent'
): Date => {
  const now = new Date();
  let days = 7; // Default 7 days
  
  if (orderType === 'alterations') {
    days = 3;
  } else if (orderType === 'new_stitching') {
    days = 14;
  }
  
  // Adjust based on priority
  switch (priority) {
    case 'urgent':
      days = Math.ceil(days * 0.5);
      break;
    case 'high':
      days = Math.ceil(days * 0.7);
      break;
    case 'low':
      days = Math.ceil(days * 1.5);
      break;
  }
  
  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
};

/**
 * Formats a date to a localized string
 * 
 * @param date - The date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', options);
};

/**
 * Formats a currency value
 * 
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }
): string => {
  return new Intl.NumberFormat('en-IN', options).format(amount);
};