const cache = new Map();
const pending = new Map();

const TTL = 60 * 60 * 1000;

export const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

export const setCache = (key, data) => {
  cache.set(key, {
    data,
    expiry: Date.now() + TTL
  });
};

export const getPending = (key) => pending.get(key);
export const setPending = (key, promise) => pending.set(key, promise);
export const clearPending = (key) => pending.delete(key);