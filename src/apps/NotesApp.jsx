import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Folder, 
  FileText, 
  Eye, 
  Edit3, 
  Columns,
  Tag
} from 'lucide-react';

export default function NotesApp() {
  const { 
    db, 
    addNote, 
    updateNote, 
    deleteNote,
    renameNotesFolder,
    deleteNotesFolder
  } = useOS();

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'edit' | 'preview'
  const [mobileActiveView, setMobileActiveView] = useState('list'); // 'list' | 'editor'

  const notes = db.notes || [];

  // Folders list
  const folders = ['All', ...new Set(notes.map(n => n.folder).filter(Boolean))];

  // Current active note
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  // Auto-select first note if none selected
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  // Filtering
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'All' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Sort notes: pinned first, then by date updated
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const handleCreateNote = () => {
    const newId = addNote('Untitled Note', '', [], selectedFolder === 'All' ? 'General' : selectedFolder);
    setSelectedNoteId(newId);
    setMobileActiveView('editor');
  };

  // Basic client-side markdown parser
  const parseMarkdown = (md) => {
    if (!md) return '<p style="color: var(--text-secondary)">Start writing notes in markdown...</p>';
    
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers
    html = html.replace(/^# (.*?)$/gm, '<h1 style="font-size: 24px; font-weight: 700; margin: 16px 0 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="font-size: 18px; font-weight: 600; margin: 14px 0 6px;">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 style="font-size: 15px; font-weight: 600; margin: 12px 0 4px; color: var(--text-pure)">$1</h3>');

    // Checkboxes
    html = html.replace(/^- \[x\] (.*?)$/gm, '<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;"><input type="checkbox" checked disabled style="accent-color: var(--text-secondary)" /> <span style="text-decoration: line-through; color: var(--text-secondary)">$1</span></div>');
    html = html.replace(/^- \[ \] (.*?)$/gm, '<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;"><input type="checkbox" disabled /> <span style="color: var(--text-primary)">$1</span></div>');

    // Bullet Lists
    html = html.replace(/^- (.*?)$/gm, '<ul style="margin-left: 20px; padding: 4px 0;"><li>$1</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // Join lists

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Code Blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="font-mono" style="background: rgba(0, 0, 0, 0.4); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); overflow-x: auto; margin: 12px 0; font-size: 12px; line-height: 1.5;">$1</pre>');

    // Inline Code
    html = html.replace(/`(.*?)`/g, '<code class="font-mono" style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 12px;">$1</code>');

    // Line breaks
    html = html.split('\n').join('<br />');

    // Clean up empty lines that became double breaks
    html = html.replace(/<br \/><br \/>/g, '<br />');

    return html;
  };

  return (
    <div className={`notes-layout mobile-view-${mobileActiveView}`}>
      
      {/* Sidebar List panel */}
      <div className="glass-panel notes-sidebar" style={{ borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
        
        {/* Search & Add Note */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              placeholder="Search notes..."
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', paddingRight: '10px', height: '36px', fontSize: '13px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-secondary)' }} />
          </div>
          <button 
            onClick={handleCreateNote} 
            className="glass-btn" 
            style={{ width: '36px', height: '36px', padding: 0 }}
            title="Create Note"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Folder Select Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
            <Folder size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            {isRenamingFolder ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (renameInput.trim()) {
                  renameNotesFolder(selectedFolder, renameInput.trim());
                  setSelectedFolder(renameInput.trim());
                  setIsRenamingFolder(false);
                }
              }} style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%' }}>
                <input
                  type="text"
                  className="glass-input font-mono"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  style={{ fontSize: '11px', padding: '2px 6px', height: '24px', flexGrow: 1 }}
                  required
                  autoFocus
                />
                <button type="submit" className="glass-btn font-mono" style={{ padding: '2px 4px', fontSize: '9px' }}>Save</button>
                <button type="button" onClick={() => setIsRenamingFolder(false)} className="glass-btn font-mono" style={{ padding: '2px 4px', fontSize: '9px' }}>X</button>
              </form>
            ) : (
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="glass-input"
                style={{ height: '30px', padding: '0 26px 0 8px', fontSize: '12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', width: '100%' }}
              >
                {folders.map(f => (
                  <option key={f} value={f} style={{ background: '#121214', color: '#fff' }}>{f}</option>
                ))}
              </select>
            )}
          </div>

          {!isRenamingFolder && (
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
              <button 
                type="button"
                onClick={() => {
                  const name = window.prompt('Enter new folder name:');
                  if (name && name.trim()) {
                    const newId = addNote('Untitled Note', '', [], name.trim());
                    setSelectedFolder(name.trim());
                    setSelectedNoteId(newId);
                  }
                }} 
                className="glass-btn-icon" 
                title="New Folder"
                style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Plus size={11} />
              </button>

              {selectedFolder !== 'All' && selectedFolder !== 'General' && (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setRenameInput(selectedFolder);
                      setIsRenamingFolder(true);
                    }} 
                    className="glass-btn-icon" 
                    title="Rename Folder"
                    style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <Edit3 size={11} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete notes folder "${selectedFolder}"? Notes inside will be moved to "General".`)) {
                        deleteNotesFolder(selectedFolder);
                        setSelectedFolder('All');
                      }
                    }} 
                    className="glass-btn-icon" 
                    title="Delete Folder"
                    style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={11} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Notes list */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sortedNotes.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No notes found
            </div>
          ) : (
            sortedNotes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setMobileActiveView('editor');
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: note.id === activeNote?.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  background: note.id === activeNote?.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: note.id === activeNote?.id ? 'var(--text-pure)' : 'var(--text-primary)',
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}>
                    {note.title || 'Untitled Note'}
                  </h4>
                  {note.pinned && <Pin size={10} style={{ color: 'var(--text-secondary)' }} />}
                </div>
                <p style={{ 
                  fontSize: '11px', 
                  color: 'var(--text-secondary)', 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap',
                  marginBottom: '6px'
                }}>
                  {note.content || 'Empty note...'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)' }}>
                  <span>{note.folder}</span>
                  <span className="font-mono">{new Date(note.updatedAt).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Editor & Preview Workspace */}
      <div className="notes-editor-pane" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        {activeNote ? (
          <>
            {/* Note Editor Header / Actions */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setMobileActiveView('list')}
                  className="glass-btn mobile-back-btn"
                  style={{ display: 'none' }}
                >
                  Back
                </button>
                <input
                  type="text"
                  className="font-logo"
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--text-pure)',
                    flexGrow: 1
                  }}
                  placeholder="Untitled Note"
                />

                {/* View Mode controls */}
                <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '2px' }}>
                  <button 
                    onClick={() => setViewMode('edit')} 
                    className={`glass-btn ${viewMode === 'edit' ? 'active' : ''}`}
                    style={{ padding: '4px 8px', fontSize: '11px', border: 'none' }}
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => setViewMode('split')} 
                    className={`glass-btn ${viewMode === 'split' ? 'active' : ''}`}
                    style={{ padding: '4px 8px', fontSize: '11px', border: 'none' }}
                  >
                    <Columns size={12} />
                  </button>
                  <button 
                    onClick={() => setViewMode('preview')} 
                    className={`glass-btn ${viewMode === 'preview' ? 'active' : ''}`}
                    style={{ padding: '4px 8px', fontSize: '11px', border: 'none' }}
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>

              {/* Note Metadata settings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Folder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Folder size={12} />
                    <input
                      type="text"
                      value={activeNote.folder}
                      onChange={(e) => updateNote(activeNote.id, { folder: e.target.value })}
                      style={{ background: 'transparent', border: 'none', fontSize: '12px', borderBottom: '1px solid transparent', width: '90px' }}
                      placeholder="Folder..."
                      onBlur={(e) => {
                        if (!e.target.value.trim()) updateNote(activeNote.id, { folder: 'General' });
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={12} />
                    <input
                      type="text"
                      value={activeNote.tags.join(', ')}
                      onChange={(e) => {
                        const parsed = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateNote(activeNote.id, { tags: parsed });
                      }}
                      style={{ background: 'transparent', border: 'none', fontSize: '12px', width: '150px' }}
                      placeholder="Tags (comma separated)..."
                    />
                  </div>
                </div>

                {/* Right actions: Pin, Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateNote(activeNote.id, { pinned: !activeNote.pinned })}
                    className="glass-btn"
                    style={{ padding: '4px 8px', fontSize: '11px', color: activeNote.pinned ? 'var(--text-pure)' : 'var(--text-secondary)' }}
                  >
                    <Pin size={12} fill={activeNote.pinned ? 'currentColor' : 'none'} /> Pin
                  </button>
                  <button
                    onClick={() => {
                      deleteNote(activeNote.id);
                      setSelectedNoteId(null);
                      setMobileActiveView('list');
                    }}
                    className="glass-btn"
                    style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--color-danger)', border: '1px solid var(--color-danger-border)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Split screen content editors */}
            <div className="notes-editor-split" style={{ 
              gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr', 
              gap: '16px', 
              flexGrow: 1, 
              height: 'calc(100% - 100px)',
              overflow: 'hidden'
            }}>
              {/* Left Raw Markdown Editor */}
              {(viewMode === 'split' || viewMode === 'edit') && (
                <textarea
                  className="glass-input font-mono"
                  style={{
                    height: '100%',
                    resize: 'none',
                    background: 'rgba(5, 5, 5, 0.4)',
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="# Enter Markdown here..."
                />
              )}

              {/* Right Rendered Live HTML Preview */}
              {(viewMode === 'split' || viewMode === 'preview') && (
                <div 
                  className="glass-card"
                  style={{
                    height: '100%',
                    overflowY: 'auto',
                    padding: '20px 24px',
                    borderRadius: '12px',
                    background: 'rgba(10, 10, 15, 0.2)',
                    lineHeight: '1.7',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote.content) }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--text-secondary)' }}>
            <FileText size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <span>Create or select a note from the directory</span>
          </div>
        )}
      </div>

    </div>
  );
}
