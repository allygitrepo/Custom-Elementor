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
  HardDrive,
  Film,
  FileText,
  Music
} from 'lucide-react';
import { getMediaUrl } from '../utils/media';

export default function MediaPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
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

  const filteredItems = mediaItems.filter(m => {
    const matchesSearch = m.original_name.toLowerCase().includes(search.toLowerCase()) ||
      m.filename.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'image') return m.file_type?.startsWith('image/');
    if (filterType === 'video') return m.file_type?.startsWith('video/');
    if (filterType === 'other') return !m.file_type?.startsWith('image/') && !m.file_type?.startsWith('video/');
    return true;
  });

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderMediaThumbnail = (item) => {
    const isVideo = item.file_type?.startsWith('video/');
    const isAudio = item.file_type?.startsWith('audio/');
    const isPdf = item.file_type === 'application/pdf';

    if (isVideo) {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#070a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video src={getMediaUrl(item.file_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
          <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.8)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Film size={11} />
            <span>Video</span>
          </div>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div style={{ width: '100%', height: '100%', background: '#0d2b5e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', gap: '6px' }}>
          <Music size={28} />
          <span style={{ fontSize: '10px' }}>Audio</span>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div style={{ width: '100%', height: '100%', background: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', gap: '6px' }}>
          <FileText size={28} />
          <span style={{ fontSize: '10px' }}>PDF</span>
        </div>
      );
    }

    return (
      <img
        src={getMediaUrl(item.file_url)}
        alt={item.original_name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
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
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardDrive size={24} color="var(--primary)" />
            <span>Media Library</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Upload and manage images, videos, audio, and documents for your pages.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*,audio/*,.pdf"
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
                <span>Upload Media / Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: activeItem ? '1fr 340px' : '1fr', gap: '24px' }}>
        {/* Gallery Section */}
        <div>
          {/* Search & Filter bar */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search media files by name..."
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

            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: '8px' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'image', label: 'Images' },
                { key: 'video', label: 'Videos' },
                { key: 'other', label: 'Docs' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: filterType === tab.key ? 'var(--primary)' : 'transparent',
                    color: filterType === tab.key ? '#070a0f' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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
                Upload image, video, audio, or document assets to use in your visual editor.
              </p>
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary">
                <Upload size={16} />
                <span>Upload First Media</span>
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
                    {renderMediaThumbnail(item)}
                    <div style={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      padding: '16px 8px 6px',
                      fontSize: '11px',
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      zIndex: 10
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
              {activeItem.file_type?.startsWith('video/') ? (
                <video
                  src={getMediaUrl(activeItem.file_url)}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={getMediaUrl(activeItem.file_url)}
                  alt={activeItem.original_name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', wordBreak: 'break-all', marginBottom: '12px' }}>
              {activeItem.original_name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-dim)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{activeItem.file_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>File Size:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatSize(activeItem.file_size)}</span>
              </div>
              {activeItem.width && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dimensions:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{activeItem.width} × {activeItem.height} px</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uploaded:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{new Date(activeItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* URL Display */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px' }}>Direct File URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={activeItem.file_url}
                  className="form-input"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
                <button
                  onClick={() => handleCopyUrl(activeItem.file_url)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px' }}
                  title="Copy link"
                >
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <a
                href={activeItem.file_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px' }}
              >
                <ExternalLink size={15} />
                <span>Open File</span>
              </a>

              <button
                onClick={() => handleDelete(activeItem.id)}
                className="btn btn-danger"
                style={{ padding: '8px 14px' }}
                title="Delete Media"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
