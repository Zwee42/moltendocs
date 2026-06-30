/**
 * Generates a URL-friendly slug from a title string
 * @param title - The title to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Collapse multiple dashes
    .replace(/^-|-$/g, '');        // Trim leading/trailing dashes
}

/**
 * Validates that a title is not empty or whitespace-only
 * @param title - The title to validate
 * @returns True if valid, false otherwise
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}

/**
 * Sanitizes a slug to ensure it uses dashes for spaces
 * @param slug - The slug to sanitize
 * @returns A sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  return slug.replace(/\s+/g, '-');
}

/**
 * Validates a session ID format
 * @param sessionId - The session ID to validate
 * @returns True if valid format
 */
export function isValidSessionId(sessionId: string | undefined): sessionId is string {
  return typeof sessionId === 'string' && sessionId.length > 0;
}

/**
 * Parses cookie string into an object
 * @param cookieString - Raw cookie header string
 * @returns Object with cookie key-value pairs
 */
export function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [key, value] = cookie.split('=').map(s => s.trim());
    if (key && value) {
      cookies[key] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * Calculates word count from content
 * @param content - The text content
 * @returns Number of words
 */
export function getWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}
