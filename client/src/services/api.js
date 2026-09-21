/**
 * LightBuilder - REST API Client Service
 */

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('lightbuilder_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('lightbuilder_token', token);
    } else {
      localStorage.removeItem('lightbuilder_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'omit'
    };

    try {
      const response = await fetch(url, config);
      const text = await response.text();
      
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status} (${response.statusText}). Make sure the PHP backend is running with "npm start".`);
        }
        throw new Error('Invalid response format received from server.');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  }

  // Setup
  getSetupStatus() {
    return this.request('/setup/status');
  }

  install(payload) {
    return this.request('/setup/install', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Websites
  getWebsites() {
    return this.request('/websites');
  }

  getWebsite(id) {
    return this.request(`/websites/${id}`);
  }

  createWebsite(data) {
    return this.request('/websites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateWebsite(id, data) {
    return this.request(`/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deleteWebsite(id) {
    return this.request(`/websites/${id}`, {
      method: 'DELETE'
    });
  }

  duplicateWebsite(id) {
    return this.request(`/websites/${id}/duplicate`, {
      method: 'POST'
    });
  }

  publishWebsite(id) {
    return this.request(`/websites/${id}/publish`, {
      method: 'POST'
    });
  }

  // Pages
  getPages(websiteId) {
    return this.request(`/websites/${websiteId}/pages`);
  }

  getPage(id) {
    return this.request(`/pages/${id}`);
  }

  createPage(websiteId, data) {
    return this.request(`/websites/${websiteId}/pages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  savePage(id, data) {
    return this.request(`/pages/${id}/save`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  publishPage(id) {
    return this.request(`/pages/${id}/publish`, {
      method: 'POST'
    });
  }

  getPagePreviewUrl(id) {
    return `${API_BASE}/pages/${id}/preview`;
  }

  updatePageMeta(id, data) {
    return this.request(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  deletePage(id) {
    return this.request(`/pages/${id}`, {
      method: 'DELETE'
    });
  }

  duplicatePage(id) {
    return this.request(`/pages/${id}/duplicate`, {
      method: 'POST'
    });
  }

  // Media
  getMedia() {
    return this.request('/media');
  }

  uploadMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/media/upload', {
      method: 'POST',
      body: formData
    });
  }

  deleteMedia(id) {
    return this.request(`/media/${id}`, {
      method: 'DELETE'
    });
  }

  // Templates
  getTemplates() {
    return this.request('/templates');
  }

  getTemplate(id) {
    return this.request(`/templates/${id}`);
  }

  saveTemplate(data) {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Settings
  getSettings() {
    return this.request('/settings');
  }

  updateSettings(data) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient();
