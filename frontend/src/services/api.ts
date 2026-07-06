const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Automatically handle trailing slashes and ensure /api endpoint is present
let tempBase = base.endsWith('/') ? base.slice(0, -1) : base;
if (!tempBase.endsWith('/api')) {
  tempBase += '/api';
}
const API_BASE_URL = tempBase;

let portfolioPromise: Promise<any> | null = null;

/**
 * Fetches the unified portfolio payload.
 * Cache/Promise sharing ensures we make at most 1 network request on load.
 * Includes timeout controller and fallback resilience.
 */
export async function fetchPortfolioData(retries = 2, delayMs = 1000): Promise<any> {
  if (!portfolioPromise) {
    portfolioPromise = (async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

          const res = await fetch(`${API_BASE_URL}/portfolio`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
          }
          return await res.json();
        } catch (err: any) {
          if (attempt < retries) {
            console.warn(`[API Retry] Failed attempt ${attempt + 1}/${retries + 1}. Retrying in ${delayMs}ms... Error:`, err.message || err);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            console.warn('[API Offline] Backend API unreachable. Falling back to default section rendering. Error:', err.message || err);
            return null;
          }
        }
      }
      return null;
    })();
  }
  return portfolioPromise;
}

/**
 * Sends contact message with timeout and error handling.
 */
export async function submitContactMessage(formData: { name: string; email: string; subject: string; message: string }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return res.ok;
  } catch (error) {
    console.error('Failed to submit contact message:', error);
    return false;
  }
}

