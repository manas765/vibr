// Small browser-side cache for the quota-metered /api/youtube-* routes.
// - Identical requests inside the TTL are answered from memory/sessionStorage.
// - Simultaneous identical requests share one network call (e.g. Discover's
//   cover wall and charts widget both need /api/youtube-charts).
// - Failed responses (429/403 quota errors) are never cached, and fall back
//   to the last good copy if we have one.

const memory = new Map(); // url -> { t, data }
const inflight = new Map(); // url -> Promise
const PREFIX = "vibr-cache:";

export function normalizeQuery(q) {
  return String(q || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function readStored(url) {
  try {
    const raw = sessionStorage.getItem(PREFIX + url);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(url, entry) {
  try {
    sessionStorage.setItem(PREFIX + url, JSON.stringify(entry));
  } catch {
    // storage full or unavailable — memory cache still works
  }
}

export function cachedJson(url, ttlMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hit = memory.get(url) || readStored(url);

  if (hit && now - hit.t < ttlMs) {
    memory.set(url, hit);
    return Promise.resolve(hit.data);
  }

  if (inflight.has(url)) return inflight.get(url);

  const request = fetch(url)
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const entry = { t: Date.now(), data };
        memory.set(url, entry);
        writeStored(url, entry);
        return data;
      }
      return hit ? hit.data : data; // quota error: serve stale if we have it
    })
    .catch(() => (hit ? hit.data : {}))
    .finally(() => inflight.delete(url));

  inflight.set(url, request);
  return request;
}