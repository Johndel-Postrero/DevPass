// Debug utility to track refresh loops
let refreshCount = 0;
let lastRefreshTime = Date.now();
const refreshLog = [];

export const logRefresh = (source, details = {}) => {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  
  refreshCount++;
  const logEntry = {
    count: refreshCount,
    source,
    timestamp: new Date().toISOString(),
    timeSinceLastRefresh,
    pathname: window.location.pathname,
    details,
    stack: new Error().stack
  };
  
  refreshLog.push(logEntry);
  lastRefreshTime = now;
  
  // Log to console with color coding
  if (timeSinceLastRefresh < 2000) {
    console.warn(`🔄 [REFRESH LOOP DETECTED] ${source}`, {
      count: refreshCount,
      timeSinceLastRefresh: `${timeSinceLastRefresh}ms`,
      pathname: window.location.pathname,
      details
    });
  } else {
    console.log(`📍 [REFRESH] ${source}`, {
      count: refreshCount,
      timeSinceLastRefresh: `${timeSinceLastRefresh}ms`,
      pathname: window.location.pathname,
      details
    });
  }
  
  // Keep only last 50 entries
  if (refreshLog.length > 50) {
    refreshLog.shift();
  }
  
  return logEntry;
};

export const getRefreshLog = () => refreshLog;
export const getRefreshCount = () => refreshCount;
export const resetRefreshLog = () => {
  refreshCount = 0;
  refreshLog.length = 0;
};

// Export to window for debugging
if (typeof window !== 'undefined') {
  window.debugRefresh = {
    log: logRefresh,
    getLog: getRefreshLog,
    getCount: getRefreshCount,
    reset: resetRefreshLog
  };
}

