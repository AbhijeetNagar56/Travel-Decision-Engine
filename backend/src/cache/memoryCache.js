const cache = new Map();
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

export const getCached = (key) => {
  const entry = cache.get(key);

  if (!entry) return null;

  // Expiration check
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }

  return entry.value;
};

export const setCache = (key, value, ttl = DEFAULT_TTL) => {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl
  });
};

export const getCacheSize = () => {
  return cache.size;
};