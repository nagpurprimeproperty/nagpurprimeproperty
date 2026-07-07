// Debounced socket utility for better performance
export function createDebouncedSocketListener(socket, event, handler, delay = 100) {
  let timeout;
  
  const debouncedHandler = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      handler(...args);
    }, delay);
  };
  
  const cleanup = socket.on(event, debouncedHandler);
  
  return () => {
    clearTimeout(timeout);
    cleanup?.();
  };
}

// Throttled socket listener
export function createThrottledSocketListener(socket, event, handler, delay = 100) {
  let lastCall = 0;
  let timeout;
  
  const throttledHandler = (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= delay) {
      lastCall = now;
      handler(...args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        handler(...args);
      }, delay - timeSinceLastCall);
    }
  };
  
  const cleanup = socket.on(event, throttledHandler);
  
  return () => {
    clearTimeout(timeout);
    cleanup?.();
  };
}

// Batch multiple socket events
export function createBatchedSocketListener(socket, events, handler, batchDelay = 150) {
  let batchTimeout;
  const batch = [];
  
  const listeners = events.map(event => {
    return socket.on(event, (data) => {
      batch.push({ event, data });
      clearTimeout(batchTimeout);
      
      batchTimeout = setTimeout(() => {
        handler(batch);
        batch.length = 0;
      }, batchDelay);
    });
  });
  
  return () => {
    clearTimeout(batchTimeout);
    listeners.forEach(cleanup => cleanup?.());
  };
}
