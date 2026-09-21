import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Search, 
  Loader2, 
  Copy, 
  Check, 
  ExternalLink,
  HardDrive
} from 'lucide-react';

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await api.getMedia();
      setMediaItems(data || []);
      if (data && data.length > 0 && !activeItem) {
        setActiveItem(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const file = files[0];
      const uploaded = await api.uploadMedia(file);
      await fetchMedia();
      setActiveItem(uploaded);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await api.deleteMedia(id);
        if (activeItem?.id === id) setActiveItem(null);
        await fetchMedia();
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredItems = mediaItems.filter(m => 
    m.original_name.toLowerCase().includes(search.toLowerCase()) ||
    m.filename.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Media Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            Upload, preview, and manage images for your websites and visual builder.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload New Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: activeItem ? '1fr 320px' : '1fr', gap: '24px' }}>
        {/* Gallery Section */}
        <div>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search images by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} color="var(--text-dim)" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--primary)' }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading media files...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="glass-card" style={{
              textAlign: 'center',
              padding: '60px 24px',
              border: '1px dashed var(--border-subtle)'
            }}>
              <ImageIcon size={48} color="var(--text-dim)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Media Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
                Upload image assets (PNG, JPG, SVG, WebP) to use in your visual editor.
              </p>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                <Upload size={16} />
                <span>Upload First Image</span>
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {filteredItems.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="glass-card"
                    style={{
                      aspectRatio: '1',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <img
                      src={item.file_url}
                      alt={item.original_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      padding: '16px 8px 6px',
                      fontSize: '11px',
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.original_name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Media Inspector Sidebar */}
        {activeItem && (
          <div className="glass-card" style={{ padding: '24px', height: 'fit-content', position: 'sticky', top: '88px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '16/10',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-surface-elevated)',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={activeItem.file_url}
                alt={activeItem.original_name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', wordBreak: 'break-all', marginBottom: '12px' }}>
              {activeItem.original_name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>File Type:</span>
                <span style={{ color: 'var(--text-muted)' }}>{activeItem.file_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>File Size:</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatSize(activeItem.file_size)}</span>
              </div>
              {activeItem.width && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dimensions:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{activeItem.width} × {activeItem.height} px</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uploaded:</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(activeItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Direct URL</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  readOnly
                  value={activeItem.file_url}
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => handleCopyUrl(activeItem.file_url)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px' }}
                  title="Copy URL"
                >
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={activeItem.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                <ExternalLink size={14} />
                <span>Open</span>
              </a>

              <button
                onClick={() => handleDelete(activeItem.id)}
                className="btn btn-danger"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
