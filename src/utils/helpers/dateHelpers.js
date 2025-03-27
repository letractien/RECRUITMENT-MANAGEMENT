/**
 * Format a date to a string representation
 * @param {Date|string} date - Date object or date string
 * @param {string} format - Format string (optional, defaults to 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string} date - Date object or date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 0) {
    // Future date
    if (diffInSeconds > -60) return `in ${Math.abs(diffInSeconds)} seconds`;
    if (diffInMinutes > -60) return `in ${Math.abs(diffInMinutes)} minutes`;
    if (diffInHours > -24) return `in ${Math.abs(diffInHours)} hours`;
    if (diffInDays > -30) return `in ${Math.abs(diffInDays)} days`;
    return formatDate(d);
  } else {
    // Past date
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return formatDate(d);
  }
};

/**
 * Get the start and end dates for a given time range
 * @param {string} timeRange - Time range key ('week', 'month', 'quarter', 'year')
 * @returns {object} Object with startDate and endDate
 */
export const getDateRangeFromPeriod = (timeRange) => {
  const now = new Date();
  const endDate = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      break;
    case 'month':
      startDate.setDate(1); // Start of month
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1); // Start of year
      break;
    default:
      startDate.setDate(now.getDate() - 30); // Default to last 30 days
  }
  
  return {
    startDate,
    endDate
  };
}; 