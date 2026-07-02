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
 */
export async function fetchPortfolioData() {
  if (!portfolioPromise) {
    portfolioPromise = fetch(`${API_BASE_URL}/portfolio`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio data: ${res.statusText}`);
        }
        return res.json();
      })
      .catch((err) => {
        console.warn('Backend API is offline or unreachable. Falling back to local static constants. Error:', err);
        return null;
      });
  }
  return portfolioPromise;
}

/**
 * Sends contact message (optional helper)
 */
export async function submitContactMessage(formData: { name: string; email: string; subject: string; message: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    return res.ok;
  } catch (error) {
    console.error('Failed to submit contact message:', error);
    return false;
  }
}
