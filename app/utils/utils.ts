/**
 * Builds a complete image URL based on the provided URL.
 * If the URL starts with 'http', it returns the URL as is.
 * Otherwise, it prefixes the URL with the DATA_API environment variable.
 *
 * @param url - The URL to be processed.
 * @returns The complete image URL.
 */
export function buildImgUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${process.env.DATA_API}${url}`;
}
