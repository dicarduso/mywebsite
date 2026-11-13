const rawBase = import.meta.env.BASE_URL || "/";
const basePath = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

/**
 * Prefixes a root-relative path with Astro's configured base.
 * External URLs and same-page hashes are returned unchanged.
 */
export const withBase = (path: string) => {
  if (!path) return path;
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path)) return path;
  if (path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }

  return `${basePath}/${path.replace(/^\/+/, "")}`;
};
