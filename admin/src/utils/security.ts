/**
 * Security Utility Module for Admin Panel
 */

export function sanitizeUrl(url?: string, fallback: string = '#'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#') {
    return fallback;
  }

  const sanitized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  const lowercase = sanitized.toLowerCase();

  if (
    lowercase.startsWith('javascript:') ||
    lowercase.startsWith('vbscript:') ||
    lowercase.startsWith('data:text/html') ||
    lowercase.startsWith('data:text/javascript')
  ) {
    console.warn(`[Security Alert] Blocked potentially unsafe URL vector: "${sanitized}"`);
    return fallback;
  }

  if (
    sanitized.startsWith('/') ||
    sanitized.startsWith('#') ||
    lowercase.startsWith('http://') ||
    lowercase.startsWith('https://') ||
    lowercase.startsWith('mailto:') ||
    lowercase.startsWith('tel:') ||
    lowercase.startsWith('data:image/') ||
    lowercase.startsWith('data:application/pdf')
  ) {
    return sanitized;
  }

  if (!sanitized.includes('://') && !sanitized.startsWith('data:')) {
    return `https://${sanitized}`;
  }

  return fallback;
}

export function safeClamp(value: any, min: number = 0, max: number = 100, fallback: number = 50): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (isNaN(num)) {
    return fallback;
  }
  return Math.min(Math.max(num, min), max);
}
