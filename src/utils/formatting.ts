export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 1): string {
  return num.toFixed(decimals);
}

export function formatYAxisCurrency(value: number): string {
  const millions = value / 1000000;
  return `$${millions.toFixed(0)}M`;
}

export function formatCurrencyInput(value: string): string {
  // Remove all non-digit characters
  const numericValue = value.replace(/[^\d]/g, '');
  
  // Convert to number and format with commas
  if (numericValue === '') return '';
  
  const number = parseInt(numericValue);
  return new Intl.NumberFormat('en-US').format(number);
}

export function getNumericValue(formattedValue: string): number {
  return parseInt(formattedValue.replace(/[^\d]/g, '')) || 0;
}