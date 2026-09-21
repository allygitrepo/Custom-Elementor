import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  Server, 
  HardDrive, 
  Save, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    current_password: '',
    new_password: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  const [settings, setSettings] = useState({
    site_name: 'My LightBuilder Site',
    allow_registration: '0'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({ ...prev, name: user.name, email: user.email }));
    }

    api.getSettings().then(data => {
      if (data) setSettings(data);
    }).catch(console.error);
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setSavingProfile(true);

    try {
      await api.updateProfile(profileData);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setProfileData(prev => ({ ...prev, current_password: '', new_password: '' }));
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMsg({ text: '', type: '' });
    setSavingSettings(true);

    try {
      await api.updateSettings(settings);
      setSettingsMsg({ text: 'System settings saved!', type: 'success' });
    } catch (err) {
      setSettingsMsg({ text: err.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
          Manage your account profile, credentials, and system configuration.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Administrator Profile</h2>
          </div>

          {profileMsg.text && (
            <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-muted)' }}>
                Change Password (Leave blank to keep unchanged)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Required if changing password"
                    value={profileData.current_password}
                    onChange={(e) => setProfileData({ ...profileData, current_password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={profileData.new_password}
                    onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
              disabled={savingProfile}
            >
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* System Settings Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <SettingsIcon size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Workspace Configuration</h2>
          </div>

          {settingsMsg.text && (
            <div className={`alert ${settingsMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{settingsMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">Workspace Title</label>
              <input
                type="text"
                className="form-input"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
              disabled={savingSettings}
            >
              {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Configuration</span>
            </button>
          </form>
        </div>

        {/* Environment Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Environment & Deployment</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--text-dim)' }}>
            <div>Engine: <span style={{ color: 'var(--text-muted)' }}>LightBuilder Standalone v1.0.0</span></div>
            <div>Database: <span style={{ color: 'var(--text-muted)' }}>SQLite 3 (PDO WAL Mode)</span></div>
            <div>Database Path: <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>server/storage/database/</span></div>
            <div>Security: <span style={{ color: 'var(--accent-emerald)' }}>Storage Directory Protected</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
