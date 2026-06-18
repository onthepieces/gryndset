import React from 'react';
import { OSProvider, useOS } from './context/OSContext';
import Dock from './components/Dock';
import Statusbar from './components/Statusbar';
import NotificationToasts from './components/NotificationToasts';
import CommandPalette from './components/CommandPalette';
import Dashboard from './apps/Dashboard';
import FinanceApp from './apps/FinanceApp';
import ProjectsApp from './apps/ProjectsApp';
import HabitsApp from './apps/HabitsApp';
import NotesApp from './apps/NotesApp';
import InvestmentsApp from './apps/InvestmentsApp';
import SettingsApp from './apps/SettingsApp';

import './App.css';

function AppContent() {
  const { activeApp } = useOS();

  const renderActiveApp = () => {
    switch (activeApp) {
      case 'finance':
        return <FinanceApp />;
      case 'projects':
        return <ProjectsApp />;
      case 'habits':
        return <HabitsApp />;
      case 'notes':
        return <NotesApp />;
      case 'investments':
        return <InvestmentsApp />;
      case 'settings':
        return <SettingsApp />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="os-container">
      {/* Left Dock Panel */}
      <Dock />

      {/* Main OS Workspace Canvas */}
      <main className="os-workspace">
        {/* Top Status Bar */}
        <Statusbar />

        {/* Content App Frame */}
        <div className="os-content">
          {renderActiveApp()}
        </div>

        {/* Bottom Footer Watermark */}
        <footer className="os-footer">
          An app by <a href="https://onthepieces.in/" target="_blank" rel="noopener noreferrer">On The Pieces</a>
        </footer>
      </main>

      {/* Command Palette Keyboard Overlay */}
      <CommandPalette />

      {/* Dynamic Notification Toasts */}
      <NotificationToasts />
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <AppContent />
    </OSProvider>
  );
}
