// Request deduplication utility to prevent duplicate API calls
let requestCache = new Map();
let pendingRequests = new Map();

export function cacheRequest(key, fn, ttl = 5000) {
  const now = Date.now();
  
  // Check if we have a valid cached result
  if (requestCache.has(key)) {
    const cached = requestCache.get(key);
    if (now - cached.timestamp < ttl) {
      return Promise.resolve(cached.data);
    }
    requestCache.delete(key);
  }
  
  // Check if we already have a pending request for this key
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create new request
  const promise = Promise.resolve(fn()).then(data => {
    requestCache.set(key, { data, timestamp: now });
    pendingRequests.delete(key);
    return data;
  }).catch(error => {
    pendingRequests.delete(key);
    throw error;
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

export function clearRequestCache(pattern) {
  if (pattern) {
    Array.from(requestCache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    });
  } else {
    requestCache.clear();
  }
}
