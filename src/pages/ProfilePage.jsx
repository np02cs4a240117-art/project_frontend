import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  BookUser, 
  User, 
  ShieldCheck, 
  LogOut, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Save, 
  Lock, 
  KeyRound,
  ChevronLeft,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Smartphone,
  Fingerprint
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { showNotification, soundEnabled, toggleSound } = useNotification();
  
  const [activePanel, setActivePanel] = useState(null); // 'account', 'profile', 'security'
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  });

  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name
      });
    }
  }, [user]);

  const togglePanel = (panelName) => {
    if (activePanel === panelName) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await refreshUser();
        showNotification('Profile updated successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.detail || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      showNotification('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.confirm_password) {
      showNotification('Passwords do not match.', 'error');
      return;
    }
    showNotification('Password updated successfully! (Simulated)', 'success');
    setSecurityData({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  return (
    <Layout>
      {/* Custom Menu Header */}
      <div className="menu-header">
        <button className="menu-back-btn" onClick={() => navigate('/')}>
          <ChevronLeft size={24} />
        </button>
        <h2>Menu</h2>
        <div style={{ width: 24 }}></div> {/* Balance Spacer */}
      </div>

      <div className="menu-container animate-fade-in">
        {/* Account Info Accordion Item */}
        <div className={`menu-accordion-card ${activePanel === 'account' ? 'active' : ''}`}>
          <button className="menu-row-trigger" onClick={() => togglePanel('account')}>
            <div className="menu-row-label">
              <div className="menu-icon-wrapper account-info">
                <BookUser size={24} />
              </div>
              <span>Account Info</span>
            </div>
            {activePanel === 'account' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          <div className="menu-expanded-content">
            <div className="menu-expanded-inner">
              <div className="account-details-grid">
                <div className="account-stat-card total-balance">
                  <div className="stat-icon"><DollarSign size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Balance</span>
                    <strong className="stat-val">NPR {user?.balance?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="account-stat-card income">
                  <div className="stat-icon"><ArrowUpRight size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Income</span>
                    <strong className="stat-val">NPR {user?.total_income?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="account-stat-card expense">
                  <div className="stat-icon"><ArrowDownRight size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Total Expenses</span>
                    <strong className="stat-val">NPR {user?.total_expense?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="account-stat-card status">
                  <div className="stat-icon"><CheckCircle size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Account Status</span>
                    <strong className="stat-val status-active">
                      Active
                      <span className="pulse-dot"></span>
                    </strong>
                  </div>
                </div>
              </div>

              <div className="account-metadata">
                <div className="metadata-row">
                  <span>User Email</span>
                  <strong>{user?.email}</strong>
                </div>
                <div className="metadata-row">
                  <span>Full Name</span>
                  <strong>{user?.first_name} {user?.last_name}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Profile Accordion Item */}
        <div className={`menu-accordion-card ${activePanel === 'profile' ? 'active' : ''}`}>
          <button className="menu-row-trigger" onClick={() => togglePanel('profile')}>
            <div className="menu-row-label">
              <div className="menu-icon-wrapper personal-profile">
                <User size={24} />
              </div>
              <span>Personal Profile</span>
            </div>
            {activePanel === 'profile' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="menu-expanded-content">
            <div className="menu-expanded-inner">
              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>First Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input 
                        type="text" 
                        className="input-field" 
                        style={{ paddingLeft: '44px' }}
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input 
                        type="text" 
                        className="input-field" 
                        style={{ paddingLeft: '44px' }}
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email Address (Read-only)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="email" 
                      className="input-field" 
                      style={{ paddingLeft: '44px', background: 'var(--background)', cursor: 'not-allowed' }}
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="preferences-section">
                  <h4>Sound Preferences</h4>
                  <div className="preference-item">
                    <div className="preference-label-block">
                      {soundEnabled ? <Volume2 size={20} className="pref-iconactive" /> : <VolumeX size={20} style={{ color: 'var(--text-light)' }} />}
                      <div>
                        <div className="pref-title">Notification Sounds</div>
                        <div className="pref-subtitle">Play audio alerts upon transfers or actions</div>
                      </div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={soundEnabled} onChange={toggleSound} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                  <Save size={18} /> {loading ? 'Saving...' : 'Save Details'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Login and Security Accordion Item */}
        <div className={`menu-accordion-card ${activePanel === 'security' ? 'active' : ''}`}>
          <button className="menu-row-trigger" onClick={() => togglePanel('security')}>
            <div className="menu-row-label">
              <div className="menu-icon-wrapper login-security">
                <ShieldCheck size={24} />
              </div>
              <span>Login and Security</span>
            </div>
            {activePanel === 'security' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="menu-expanded-content">
            <div className="menu-expanded-inner">
              <form onSubmit={handleSecuritySubmit}>
                <h4 style={{ marginBottom: '16px' }}>Update Password</h4>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input 
                      type="password" 
                      className="input-field" 
                      style={{ paddingLeft: '44px' }}
                      placeholder="Enter current password"
                      value={securityData.current_password}
                      onChange={(e) => setSecurityData({...securityData, current_password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input 
                        type="password" 
                        className="input-field" 
                        style={{ paddingLeft: '44px' }}
                        placeholder="New password"
                        value={securityData.new_password}
                        onChange={(e) => setSecurityData({...securityData, new_password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                      <input 
                        type="password" 
                        className="input-field" 
                        style={{ paddingLeft: '44px' }}
                        placeholder="Confirm password"
                        value={securityData.confirm_password}
                        onChange={(e) => setSecurityData({...securityData, confirm_password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                  <Save size={18} /> Update Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Large Prominent Logout Button */}
        <button className="menu-logout-btn" onClick={logout}>
          <LogOut size={24} />
          <span>Log Out</span>
        </button>
      </div>

      <style>{`
        /* Premium Menu Header Styles */
        .menu-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          color: white;
          border-bottom-left-radius: var(--radius-lg);
          border-bottom-right-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-bottom: 24px;
        }

        .menu-header h2 {
          color: white;
          font-size: 1.5rem;
          margin: 0;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .menu-back-btn {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .menu-back-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateX(-2px);
        }

        /* Menu Container Layout */
        .menu-container {
          max-width: 880px;
          margin: 0 auto;
          padding: 0 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Accordion Cards styling */
        .menu-accordion-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: var(--transition);
        }

        .menu-accordion-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-light);
        }

        .menu-accordion-card.active {
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        /* Accordion Trigger row styling */
        .menu-row-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: transparent;
          color: var(--text-main);
          font-weight: 600;
          font-size: 1.1rem;
          text-align: left;
        }

        .menu-row-label {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .menu-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: var(--transition);
        }

        /* Color custom theme tags */
        .menu-icon-wrapper.account-info {
          background: rgba(45, 149, 158, 0.1);
          color: var(--primary);
        }
        
        .menu-icon-wrapper.personal-profile {
          background: rgba(45, 149, 158, 0.1);
          color: var(--primary);
        }
        
        .menu-icon-wrapper.login-security {
          background: rgba(45, 149, 158, 0.1);
          color: var(--primary);
        }

        .menu-accordion-card.active .menu-icon-wrapper {
          background: var(--primary);
          color: white;
          transform: scale(1.05);
        }

        /* Smooth expanded content area */
        .menu-expanded-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-accordion-card.active .menu-expanded-content {
          max-height: 1000px; /* high max height to permit expansion */
        }

        .menu-expanded-inner {
          padding: 8px 24px 24px;
          border-top: 1px solid var(--border);
          background: rgba(245, 247, 249, 0.3);
        }

        /* Account detail panels styling */
        .account-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .account-stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--surface);
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .account-stat-card .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .account-stat-card.total-balance .stat-icon {
          background: rgba(45, 149, 158, 0.1);
          color: var(--primary);
        }
        
        .account-stat-card.income .stat-icon {
          background: var(--success-light);
          color: var(--success);
        }
        
        .account-stat-card.expense .stat-icon {
          background: var(--error-light);
          color: var(--error);
        }
        
        .account-stat-card.status .stat-icon {
          background: rgba(78, 159, 61, 0.1);
          color: var(--success);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .stat-label {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .stat-val {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-active {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--success);
        }

        /* Pulse green status indicator */
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(78, 159, 61, 0.7);
          animation: pulse 1.6s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(78, 159, 61, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(78, 159, 61, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(78, 159, 61, 0);
          }
        }

        .account-metadata {
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metadata-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
        }

        .metadata-row span {
          color: var(--text-muted);
        }

        .metadata-row strong {
          color: var(--text-main);
          word-break: break-all;
        }

        /* Preference Section styling */
        .preferences-section {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }

        .preferences-section h4 {
          font-size: 0.95rem;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .preference-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--surface);
          border-radius: 14px;
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .preference-item:hover {
          border-color: var(--primary);
        }

        .preference-label-block {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pref-iconactive {
          color: var(--primary);
        }

        .pref-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .pref-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Custom Security Grid */
        .security-status-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .security-status-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--surface);
          border-radius: 14px;
          border: 1px solid var(--border);
        }

        .security-status-card .status-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .security-status-card .status-value {
          font-size: 0.88rem;
          color: var(--text-main);
        }

        /* Custom Toggle Switch styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--primary);
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }

        /* Massive Red Logout button matching visual drawing */
        .menu-logout-btn {
          width: 100%;
          background: #D32F2F; /* Rich Red */
          color: white;
          font-size: 1.35rem;
          font-weight: 700;
          padding: 16px 24px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
          box-shadow: 0 8px 24px rgba(211, 47, 47, 0.25);
          transition: var(--transition);
          font-family: inherit;
        }

        .menu-logout-btn:hover {
          background: #B71C1C;
          box-shadow: 0 12px 32px rgba(211, 47, 47, 0.4);
          transform: translateY(-2px);
        }

        .menu-logout-btn:active {
          transform: scale(0.97);
        }

        /* Responsive menu styling */
        @media (max-width: 576px) {
          .menu-header {
            padding: 16px;
            margin-bottom: 16px;
          }
          
          .menu-container {
            padding: 0 12px 20px;
            gap: 12px;
          }

          .menu-row-trigger {
            padding: 14px 18px;
            font-size: 1rem;
          }

          .menu-expanded-inner {
            padding: 8px 16px 20px;
          }

          .account-details-grid,
          .security-status-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .menu-logout-btn {
            font-size: 1.15rem;
            padding: 14px 20px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ProfilePage;
