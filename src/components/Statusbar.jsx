import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { Search, Bell, ChevronDown } from 'lucide-react';

const GlassSelect = ({ value, onChange, options, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 'fit-content', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          fontSize: '11px',
          height: '26px',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px'
        }}
      >
        {selectedOption?.icon}
        <span>{selectedOption?.label}</span>
        <ChevronDown size={10} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            background: 'rgba(18, 18, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '4px',
            zIndex: 100,
            minWidth: '100px'
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                color: opt.value === value ? 'var(--text-pure)' : 'var(--text-primary)',
                background: opt.value === value ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
      setTimeStr(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAppTitle = () => {
    switch (activeApp) {
      case 'dashboard': return 'Dashboard';
      case 'notes': return 'Notes';
      case 'finance': return 'Finance';
      case 'invoices': return 'Invoices';
      case 'crm': return 'Client CRM';
      case 'projects': return 'Projects';
      case 'habits': return 'Habits';
      case 'settings': return 'Settings';
      default: return 'G-OS';
    }
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
        <GlassSelect
          value={filterMonth}
          onChange={(val) => setFilterMonth(val)}
          options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((name, idx) => ({
            value: idx + 1,
            label: name.substring(0, 3)
          }))}
        />
        
        <GlassSelect
          value={filterYear}
          onChange={(val) => setFilterYear(val)}
          options={[2024, 2025, 2026, 2027, 2028].map(yr => ({
            value: yr,
            label: String(yr)
          }))}
        />
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
