import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../context/OSContext';
import { Search, Compass, Zap, FileText, CheckCircle, Award } from 'lucide-react';

export default function CommandPalette() {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    setActiveApp, 
    db, 
    addNote, 
    triggerToast 
  } = useOS();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Global event listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Focus input when open
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Build commands list
  const navCommands = [
    { type: 'nav', id: 'dashboard', label: 'Go to Dashboard', detail: 'System widgets and scratchpad', icon: <Compass size={16} /> },
    { type: 'nav', id: 'finance', label: 'Go to Finance Tracker', detail: 'Transactions, budget, and insights', icon: <Compass size={16} /> },
    { type: 'nav', id: 'projects', label: 'Go to Project Kanban', detail: 'Manage boards, folders, tasks, subtasks', icon: <Compass size={16} /> },
    { type: 'nav', id: 'habits', label: 'Go to Habit Checklist', detail: 'Streaks, grids, habit categories', icon: <Compass size={16} /> },
    { type: 'nav', id: 'notes', label: 'Go to Notes Organizer', detail: 'Markdown editor, folder search', icon: <Compass size={16} /> },
    { type: 'nav', id: 'investments', label: 'Go to Investments Manager', detail: 'Stock/Crypto trades, average cost', icon: <Compass size={16} /> }
  ];

  const actionCommands = [
    { type: 'action', id: 'new-note', label: 'Quick Action: Create New Note', detail: 'Open Notes App and generate a blank page', icon: <Zap size={16} />, action: () => {
      const id = addNote('Untitled Note', '', [], 'General');
      setActiveApp('notes');
      setIsSearchOpen(false);
    }},
    { type: 'action', id: 'quick-finance', label: 'Quick Action: Log Transaction', detail: 'Open Finance ledger and prompt entry', icon: <Zap size={16} />, action: () => {
      setActiveApp('finance');
      setIsSearchOpen(false);
      triggerToast('Use the "Log Transaction" panel on the screen', 'info');
    }},
    { type: 'action', id: 'quick-task', label: 'Quick Action: Add Project Task', detail: 'Open Project space to record new card', icon: <Zap size={16} />, action: () => {
      setActiveApp('projects');
      setIsSearchOpen(false);
      triggerToast('Click "New Task" on the Kanban board', 'info');
    }}
  ];

  // Dynamic Search results
  const searchResults = [];
  if (query.trim().length > 1) {
    const q = query.toLowerCase();

    // Search Notes
    db.notes.forEach(note => {
      if (note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'search',
          id: `note-${note.id}`,
          label: `Note: ${note.title}`,
          detail: note.content.substring(0, 50) + '...',
          icon: <FileText size={16} />,
          action: () => {
            setActiveApp('notes');
            setIsSearchOpen(false);
          }
        });
      }
    });

    // Search Project Tasks
    db.projects.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'search',
          id: `task-${task.id}`,
          label: `Task: ${task.title}`,
          detail: `Project: ${task.project} (${task.column.toUpperCase()})`,
          icon: <CheckCircle size={16} />,
          action: () => {
            setActiveApp('projects');
            setIsSearchOpen(false);
          }
        });
      }
    });

    // Search Habits
    db.habits.forEach(habit => {
      if (habit.name.toLowerCase().includes(q)) {
        searchResults.push({
          type: 'search',
          id: `habit-${habit.id}`,
          label: `Habit: ${habit.name}`,
          detail: `${habit.category} | Active Streak: ${habit.streak} days`,
          icon: <Award size={16} />,
          action: () => {
            setActiveApp('habits');
            setIsSearchOpen(false);
          }
        });
      }
    });
  }

  // Combine items
  const allItems = query.trim().length > 0 
    ? [...searchResults, ...navCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())), ...actionCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))]
    : [...navCommands, ...actionCommands];

  const handleSelect = (item) => {
    if (item.type === 'nav') {
      setActiveApp(item.id);
      setIsSearchOpen(false);
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="cmd-overlay" onClick={() => setIsSearchOpen(false)}>
      <div 
        className="cmd-box glass-panel" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="cmd-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command or search entries..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
        </div>

        <div className="cmd-results">
          {query.trim().length === 0 && (
            <div className="cmd-group-title">Standard Commands</div>
          )}
          
          {query.trim().length > 0 && searchResults.length > 0 && (
            <div className="cmd-group-title">Matching Database Records</div>
          )}

          {allItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No results found for "{query}"
            </div>
          ) : (
            allItems.map((item, index) => (
              <div
                key={item.id}
                className={`cmd-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ display: 'flex', color: index === selectedIndex ? 'var(--text-pure)' : 'inherit' }}>
                  {item.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: index === selectedIndex ? 'var(--text-pure)' : 'var(--text-primary)' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {item.detail}
                  </span>
                </div>
                {item.type === 'nav' && (
                  <span className="cmd-item-shortcut">Enter</span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="cmd-footer">
          <span><kbd>↑↓</kbd> Navigation</span>
          <span><kbd>Enter</kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
