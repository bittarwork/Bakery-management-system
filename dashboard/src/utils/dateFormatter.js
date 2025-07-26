/**
 * Date formatting utilities for Arabic interface with Gregorian calendar
 * All dates will be displayed in Gregorian calendar regardless of locale
 */

/**
 * Format date to Arabic text with Gregorian calendar
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateArabic = (date, options = {}) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory', // Force Gregorian calendar
    numberingSystem: 'arab', // Use Arabic-Indic numerals
    ...options
  };
  
  // Use en-GB locale with calendar override to ensure Gregorian dates
  return dateObj.toLocaleDateString('en-GB', {
    ...defaultOptions,
    calendar: 'gregory'
  });
};

/**
 * Format date and time to Arabic text with Gregorian calendar
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTimeArabic = (date, options = {}) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    calendar: 'gregory', // Force Gregorian calendar
    numberingSystem: 'arab', // Use Arabic-Indic numerals
    ...options
  };
  
  // Use en-GB locale with calendar override
  return dateObj.toLocaleString('en-GB', {
    ...defaultOptions,
    calendar: 'gregory'
  });
};

/**
 * Format time only to Arabic text
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTimeArabic = (date, options = {}) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'وقت غير صحيح';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    numberingSystem: 'arab',
    ...options
  };
  
  return dateObj.toLocaleTimeString('en-GB', defaultOptions);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format date to short format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
  
  return dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'gregory'
  });
};

/**
 * Format date to medium format with day name
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateMedium = (date) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
  
  return dateObj.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory' // Force Gregorian calendar
  });
};

/**
 * Get relative time in Arabic (e.g., "منذ 5 دقائق")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTimeArabic = (date) => {
  if (!date) return 'غير محدد';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
  
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return formatDateShort(date);
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if date is this week
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is this week
 */
export const isThisWeek = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return dateObj >= weekAgo && dateObj <= today;
}; 