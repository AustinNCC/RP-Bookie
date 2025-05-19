import { format, subWeeks, startOfDay, endOfDay, formatDistance } from 'date-fns';

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats a date with time
 */
export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

/**
 * Formats date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

/**
 * Returns start date for report period
 */
export const getReportStartDate = (weeks: number): Date => {
  return startOfDay(subWeeks(new Date(), weeks));
};

/**
 * Returns end date for report period (today)
 */
export const getReportEndDate = (): Date => {
  return endOfDay(new Date());
};

/**
 * Formats currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats percentage values
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};