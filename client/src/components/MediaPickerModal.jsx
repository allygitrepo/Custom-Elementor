import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  X, 
  Loader2, 
  Search,
  HardDrive
} from 'lucide-react';

export default function MediaPickerModal({ isOpen, onClose, onSelect, selectedUrl }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await api.getMedia();
      setMediaItems(data || []);
      if (selectedUrl && data) {
        const found = data.find(m => m.file_url === selectedUrl);
        if (found) setActiveItem(found);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 200
    }}>
      <div className="glass-card" style={{
        maxWidth: '960px',
        width: '100%',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Media Library</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Upload and select image assets</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload Image</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ margin: '12px 24px 0' }} className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Grid Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 24px' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
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

            {/* Gallery Grid */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '12px',
              paddingRight: '4px'
            }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--primary)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Loading media...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px 20px',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-dim)'
                }}>
                  <ImageIcon size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px' }}>No media assets found</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Upload Image" to add files.</p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItem(item)}
                      onDoubleClick={() => {
                        if (onSelect) {
                          onSelect(item.file_url, item);
                          onClose();
                        }
                      }}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: 'var(--bg-surface)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'border-color var(--transition-fast)'
                      }}
                    >
                      <img
                        src={item.file_url}
                        alt={item.original_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          color: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Sidebar */}
          {activeItem && (
            <div style={{
              width: '280px',
              borderLeft: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}>
              <div>
                <div style={{
                  width: '100%',
                  aspectRatio: '16/10',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-elevated)',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <img
                    src={activeItem.file_url}
                    alt={activeItem.original_name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: '700', wordBreak: 'break-all', marginBottom: '8px' }}>
                  {activeItem.original_name}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '16px' }}>
                  <div>Type: <span style={{ color: 'var(--text-muted)' }}>{activeItem.file_type}</span></div>
                  <div>Size: <span style={{ color: 'var(--text-muted)' }}>{formatSize(activeItem.file_size)}</span></div>
                  {activeItem.width && (
                    <div>Dimensions: <span style={{ color: 'var(--text-muted)' }}>{activeItem.width} × {activeItem.height} px</span></div>
                  )}
                  <div>Uploaded: <span style={{ color: 'var(--text-muted)' }}>{new Date(activeItem.created_at).toLocaleDateString()}</span></div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Direct URL</label>
                  <input
                    type="text"
                    readOnly
                    value={activeItem.file_url}
                    className="form-input"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                    onClick={(e) => e.target.select()}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                {onSelect && (
                  <button
                    onClick={() => {
                      onSelect(activeItem.file_url, activeItem);
                      onClose();
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <Check size={16} />
                    <span>Select Media</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleDelete(activeItem.id, e)}
                  className="btn btn-danger"
                  style={{ width: '100%', padding: '8px' }}
                >
                  <Trash2 size={15} />
                  <span>Delete File</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
