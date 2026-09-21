import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Database, 
  HardDrive, 
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function SetupPage() {
  const { setupStatus, install, refresh } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    site_name: 'My LightBuilder Site',
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const reqs = setupStatus?.requirements || {};

  const handleRefreshRequirements = async () => {
    try {
      setRefreshing(true);
      setError('');
      await refresh();
    } catch (err) {
      setError('Failed to connect to backend server: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required administrator fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await install(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Installation failed. Make sure the PHP server is running.');
    } finally {
      setLoading(false);
    }
  };

  const canInstall = setupStatus.canInstall || (setupStatus.requirements && Object.values(setupStatus.requirements).every(r => r.status));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.15) 0%, transparent 70%), var(--bg-main)'
    }}>
      <div className="glass-card" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '240px',
          background: 'var(--primary-glow)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          borderRadius: '50%'
        }} />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '16px'
          }}>
            <Sparkles size={28} color="#0f172a" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            LightBuilder <span style={{ color: 'var(--primary)' }}>Setup</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Welcome! Set up your visual website builder environment and create your administrator account.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* System Checklist */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-dim)',
              margin: 0,
              fontWeight: '700'
            }}>
              System Requirements
            </h3>

            <button
              type="button"
              onClick={handleRefreshRequirements}
              title="Refresh requirements check"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Checking...' : 'Re-check'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Server size={16} color="var(--primary)" />
              <span>PHP {reqs.php?.current || '>= 8.1'}</span>
              {reqs.php?.status !== false ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginLeft: 'auto' }} />
              ) : (
                <XCircle size={16} color="var(--accent-rose)" style={{ marginLeft: 'auto' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <Database size={16} color="var(--primary)" />
              <span>SQLite & PDO</span>
              {reqs.sqlite?.status !== false ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginLeft: 'auto' }} />
              ) : (
                <XCircle size={16} color="var(--accent-rose)" style={{ marginLeft: 'auto' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <HardDrive size={16} color="var(--primary)" />
              <span>Writable Storage</span>
              {reqs.storage_writable?.status !== false ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginLeft: 'auto' }} />
              ) : (
                <XCircle size={16} color="var(--accent-rose)" style={{ marginLeft: 'auto' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Writable Uploads</span>
              {reqs.uploads_writable?.status !== false ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginLeft: 'auto' }} />
              ) : (
                <XCircle size={16} color="var(--accent-rose)" style={{ marginLeft: 'auto' }} />
              )}
            </div>
          </div>
        </div>

        {/* Installation Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Site / Brand Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="e.g. My LightBuilder Workspace"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Admin Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Admin Name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '38px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: showPassword ? 'var(--primary)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '38px' }}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: showConfirmPassword ? 'var(--primary)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Installing LightBuilder...</span>
              </>
            ) : (
              <>
                <span>Complete Installation</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
