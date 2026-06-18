import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { Search, Bell } from 'lucide-react';

export default function Statusbar() {
  const { 
    activeApp, 
    setIsSearchOpen, 
    notifications,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear
  } = useOS();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${year}-${month}-${day} // ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAppTitle = () => {
    if (activeApp === 'dashboard') return 'system dashboard';
    return `${activeApp} tracker`;
  };

  return (
    <header className="os-statusbar glass-panel">
      <div className="statusbar-left">
        <h2 style={{ 
          fontSize: '15px', 
          fontWeight: 700, 
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'var(--text-pure)',
          marginRight: '16px'
        }}>
          {getAppTitle()}
        </h2>
      </div>

      {/* Global Date Filter */}
      <div className="statusbar-filters" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          className="glass-input font-mono"
          style={{ 
            padding: '0 26px 0 8px', 
            fontSize: '11px', 
            height: '26px', 
            width: '95px', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((name, idx) => (
            <option key={name} value={idx + 1} style={{ background: '#121214', color: '#fff' }}>{name.substring(0, 3)}</option>
          ))}
        </select>
        
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(parseInt(e.target.value))}
          className="glass-input font-mono"
          style={{ 
            padding: '0 26px 0 8px', 
            fontSize: '11px', 
            height: '26px', 
            width: '80px', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          {[2024, 2025, 2026, 2027, 2028].map(yr => (
            <option key={yr} value={yr} style={{ background: '#121214', color: '#fff' }}>{yr}</option>
          ))}
        </select>
      </div>

      <button 
        className="statusbar-search-trigger"
        onClick={() => setIsSearchOpen(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} />
          <span>Search command...</span>
        </div>
        <kbd className="search-kbd">⌘K</kbd>
      </button>

      <div className="statusbar-right">
        <div className="statusbar-time font-mono">
          {timeStr}
        </div>
        
        <div className="notification-bell">
          <Bell size={16} />
          {notifications.length > 0 && <span className="notification-badge" />}
        </div>
      </div>
    </header>
  );
}
