/**
 * LightBuilder - Media & URL Resolver
 * Resolves uploaded media URLs dynamically across any domain or nested deployment subfolder.
 */

export function getBasePath() {
  if (typeof window === 'undefined') return '';
  let pathname = window.location.pathname || '';
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
  }
  pathname = pathname.replace(/\/(published|editor|templates|media|websites|pages|login|register|dashboard)(\/.*)?$/, '');
  return pathname.replace(/\/+$/, '');
}

export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  // Return external URLs, data URIs, blob URIs as-is
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }

  const basePath = getBasePath();

  // Extract clean /uploads/... filename from any incoming string to avoid double prefixing
  let cleanPath = url;
  const uploadsIdx = cleanPath.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    cleanPath = cleanPath.substring(uploadsIdx);
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = '/' + cleanPath;
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // If in Vite Dev Mode (port 5173), direct relative path works via proxy
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return cleanPath;
  }

  // If path is /uploads/... map to ${basePath}/server/uploads/...
  if (cleanPath.startsWith('/uploads/')) {
    return `${basePath}/server${cleanPath}`;
  }

  if (cleanPath.startsWith('/server/uploads/')) {
    return `${basePath}${cleanPath}`;
  }

  return `${basePath}${cleanPath}`;
}

export function getPublishedUrl(slug, filename = 'index.html') {
  if (!slug) return '#';
  const cleanFilename = (!filename || filename === 'home' || filename === 'index') ? 'index.html' : (filename.endsWith('.html') ? filename : `${filename}.html`);
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const host = typeof window !== 'undefined' ? (window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host) : 'localhost';
  const basePath = getBasePath();
  return `${protocol}//${host}${basePath}/published/${slug}/${cleanFilename}`;
}
