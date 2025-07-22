import { appCache } from './cache';

// Prefetch critical app data to improve initial load experience
export async function prefetchCriticalData() {
  const promises = [];

  // Prefetch navigation data
  promises.push(
    fetch('/api/user/nav')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.nav)) {
          appCache.set('user-nav-links', data.nav, 60000);
        }
      })
      .catch(console.error)
  );

  // Prefetch user cards data
  promises.push(
    fetch('/api/user/cards')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.cards)) {
          appCache.set('admin-cards', data.cards, 30000);
        }
      })
      .catch(console.error)
  );

  // Prefetch user features data
  promises.push(
    fetch('/api/user/features')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.features)) {
          appCache.set('user-features', data.features, 60000);
        }
      })
      .catch(console.error)
  );

  // Wait for all prefetch operations
  await Promise.allSettled(promises);
}

// Prefetch on app initialization
export function initializePrefetch() {
  // Prefetch immediately
  prefetchCriticalData();
  
  // Set up periodic prefetch to keep cache warm
  const interval = setInterval(prefetchCriticalData, 45000); // Every 45 seconds
  
  // Cleanup function
  return () => clearInterval(interval);
}
