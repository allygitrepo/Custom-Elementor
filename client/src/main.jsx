// Global Production URL interceptor to rewrite '/api' requests in all environments
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  let finalUrl = url;

  if (typeof url === "string" && (url.startsWith("/api") || url.startsWith("api/"))) {
    const isDev = import.meta.env.DEV;
    const configuredApiBase = import.meta.env.VITE_API_URL;

    if (isDev) {
      finalUrl = url.startsWith("/") ? url : `/${url}`;
    } else if (configuredApiBase) {
      finalUrl = configuredApiBase.replace(/\/+$/, '') + '/' + url.replace(/^\/?api\/?/, '');
    } else {
      // Dynamically calculate the base subfolder from window.location.pathname
      let pathname = window.location.pathname || '';
      if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
        pathname = pathname.substring(0, pathname.lastIndexOf('/'));
      }
      pathname = pathname.replace(/\/+$/, '');
      const endpoint = url.startsWith('/') ? url : `/${url}`;
      finalUrl = `${pathname}${endpoint}`;
    }

    // Apply cache busting for GET requests to /api
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET") {
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${separator}_t=${Date.now()}`;
    }
  }

  // Auto-inject Authorization token if available in localStorage
  const token = localStorage.getItem("lightbuilder_token");
  if (token && typeof url === "string" && (url.includes("/api") || url.includes("api/"))) {
    if (!options.headers) options.headers = {};
    if (options.headers instanceof Headers) {
      if (!options.headers.has("Authorization")) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    } else {
      if (!options.headers["Authorization"]) {
        options.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  return originalFetch(finalUrl, options);
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
