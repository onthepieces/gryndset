import React, { useState, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { 
  User, 
  Target, 
  ShieldAlert, 
  Save, 
  RotateCcw,
  Database,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsApp() {
  const { 
    db, 
    updateSettings, 
    updateFinanceTargets, 
    triggerToast, 
    exportBackup, 
    importBackup 
  } = useOS();

  const fileInputRef = useRef(null);

  // Local Form state - Settings
  const [username, setUsername] = useState(db.settings?.username || 'Developer');
  const [currency, setCurrency] = useState(db.settings?.currency || '₹');

  // Local Form state - Financial targets
  const isINR = (db.settings?.currency || '₹') === '₹';
  const [monthlyBudget, setMonthlyBudget] = useState(db.finance?.budget?.toString() || (isINR ? '50000' : '2000'));
  const [monthlyTarget, setMonthlyTarget] = useState(db.finance?.monthlyTarget?.toString() || (isINR ? '15000' : '1500'));
  const [yearlyTarget, setYearlyTarget] = useState(db.finance?.yearlyTarget?.toString() || (isINR ? '200000' : '18000'));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!username.trim() || !currency.trim()) return;
    updateSettings(username, currency);
  };

  const handleSaveTargets = (e) => {
    e.preventDefault();
    updateFinanceTargets(monthlyBudget, monthlyTarget, yearlyTarget);
  };

  const handleResetSystem = () => {
    if (window.confirm('Are you absolutely sure you want to reset the OS data? This will clear all transactions, habits, projects, notes, and investments!')) {
      localStorage.removeItem('gryndset-data-store');
      triggerToast('System database cleared. Refreshing...', 'danger');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const success = importBackup(text);
        if (success) {
          triggerToast('System data restored', 'success');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  const getStorageSize = () => {
    try {
      const json = JSON.stringify(db);
      const sizeBytes = new Blob([json]).size;
      if (sizeBytes < 1024) return `${sizeBytes} B`;
      return `${(sizeBytes / 1024).toFixed(1)} KB`;
    } catch (e) {
      return 'N/A';
    }
  };

  const popularCurrencies = [
    { code: '$', name: 'USD / CAD ($)' },
    { code: '€', name: 'Euro (€)' },
    { code: '£', name: 'GBP (£)' },
    { code: '₹', name: 'INR (₹)' },
    { code: '¥', name: 'JPY / CNY (¥)' },
    { code: '₽', name: 'RUB (₽)' }
  ];

  return (
    <div className="settings-layout">
      
      {/* Profile & Core Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <User size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profile Specifications</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Username</label>
              <input
                type="text"
                placeholder="Developer"
                className="glass-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Currency Symbol</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  className="glass-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ cursor: 'pointer', flexGrow: 1 }}
                >
                  {popularCurrencies.map(cur => (
                    <option key={cur.code} value={cur.code} style={{ background: '#121214' }}>{cur.name}</option>
                  ))}
                  {!popularCurrencies.some(c => c.code === currency) && (
                    <option value={currency} style={{ background: '#121214' }}>Custom ({currency})</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="Custom"
                  className="glass-input font-mono"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.substring(0, 3))} // cap length
                  style={{ width: '80px', textAlign: 'center' }}
                />
              </div>
            </div>

            <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '8px' }}>
              <Save size={16} /> Save Profile Settings
            </button>
          </form>
        </div>

        {/* Danger Zone Controls */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--color-danger-border)', background: 'var(--color-danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <ShieldAlert size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danger Zone</h3>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            Clearing local storage database resets all modules back to factory state. This operation is irreversible. Please export backup JSON if you wish to preserve it.
          </p>

          <button 
            onClick={handleResetSystem} 
            className="glass-btn" 
            style={{ 
              width: '100%', 
              background: 'rgba(244, 63, 94, 0.1)', 
              borderColor: 'var(--color-danger-border)',
              color: 'var(--color-danger)' 
            }}
          >
            <RotateCcw size={16} /> Hard Reset Database
          </button>
        </div>

      </div>

      {/* Financial Targets & Database Maintenance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Targets Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Target size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Target Objectives</h3>
          </div>

          <form onSubmit={handleSaveTargets} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Monthly Spending Budget Cap ({currency})
              </label>
              <input
                type="number"
                placeholder="2000"
                className="glass-input font-mono"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Maximum monthly expense limit.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Monthly Savings/Earnings Target ({currency})
              </label>
              <input
                type="number"
                placeholder="1500"
                className="glass-input font-mono"
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target monthly surplus goal.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Yearly Savings/Earnings Target ({currency})
              </label>
              <input
                type="number"
                placeholder="18000"
                className="glass-input font-mono"
                value={yearlyTarget}
                onChange={(e) => setYearlyTarget(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Annual asset accumulation milestone.</span>
            </div>

            <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '8px' }}>
              <Save size={16} /> Save Finance Targets
            </button>
          </form>
        </div>

        {/* Database Maintenance Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Database size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Maintenance</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Storage Used (Roughly):</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)', fontWeight: 600 }}>{getStorageSize()}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button 
                onClick={exportBackup} 
                className="glass-btn"
                style={{ flexGrow: 1 }}
              >
                <Download size={16} /> Export Backup
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="glass-btn"
                style={{ flexGrow: 1 }}
              >
                <Upload size={16} /> Import Backup
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
