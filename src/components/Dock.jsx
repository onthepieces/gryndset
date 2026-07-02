import React, { useRef } from 'react';
import { useOS } from '../context/OSContext';
import { 
  LayoutGrid, 
  DollarSign, 
  FolderKanban, 
  Flame, 
  FileText, 
  FileSpreadsheet,
  Download, 
  Upload,
  Database,
  Settings,
  Users
} from 'lucide-react';

export default function Dock() {
  const { activeApp, setActiveApp, exportBackup, importBackup, db, triggerToast } = useOS();
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} /> },
    { id: 'finance', label: 'Finance', icon: <DollarSign size={20} /> },
    { id: 'crm', label: 'CRM', icon: <Users size={20} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} /> },
    { id: 'habits', label: 'Habits', icon: <Flame size={20} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={20} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileSpreadsheet size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

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

  // Calculate local storage size used roughly
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

  return (
    <aside className="os-dock glass-panel">
      <div 
        className="dock-logo" 
        onClick={() => setActiveApp('dashboard')}
      >
        g
      </div>

      <nav className="dock-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveApp(item.id)}
            className={`dock-item ${activeApp === item.id ? 'active' : ''}`}
            data-tooltip={item.label}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      <div className="dock-footer">
        <button 
          onClick={exportBackup} 
          className="dock-item"
          data-tooltip="Export Database"
        >
          <Download size={18} />
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="dock-item"
          data-tooltip="Import Database"
        >
          <Upload size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImport} 
          accept=".json" 
          style={{ display: 'none' }} 
        />

        <div 
          className="dock-item" 
          style={{ cursor: 'default', height: '24px', opacity: 0.5 }}
          data-tooltip={`Storage: ${getStorageSize()}`}
        >
          <Database size={14} />
        </div>
      </div>
    </aside>
  );
}
