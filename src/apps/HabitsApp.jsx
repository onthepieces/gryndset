import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Grid, 
  Heart, 
  BookOpen, 
  Briefcase, 
  Smile,
  Check,
  X
} from 'lucide-react';

export default function HabitsApp() {
  const { 
    db, 
    addHabit, 
    deleteHabit, 
    toggleHabitDate,
    addHabitCategory,
    renameHabitCategory,
    deleteHabitCategory
  } = useOS();

  // Local Form States
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Manage categories modal state
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatName, setEditingCatName] = useState(null);
  const [editingCatInput, setEditingCatInput] = useState('');

  const habits = db.habits || [];
  const habitCategories = db.habitCategories || ['Health', 'Learning', 'Work', 'Routine'];

  React.useEffect(() => {
    if (habitCategories.length > 0 && !habitCategories.includes(habitCategory)) {
      setHabitCategory(habitCategories[0]);
    }
  }, [habitCategories]);

  // Generate last 7 days
  const getLast7Days = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
      const dayNum = d.getDate();
      list.push({ dateStr, dayName, dayNum });
    }
    return list;
  };

  const weekDays = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredHabits = selectedFilter === 'All'
    ? habits
    : habits.filter(h => h.category === selectedFilter);

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    addHabit(habitName.trim(), habitCategory);
    setHabitName('');
  };

  // Get category icon
  const getCatIcon = (cat) => {
    switch (cat) {
      case 'Health': return <Heart size={14} />;
      case 'Learning': return <BookOpen size={14} />;
      case 'Work': return <Briefcase size={14} />;
      default: return <Smile size={14} />;
    }
  };

  return (
    <div className="habits-layout">
      
      {/* Left Column: Habits List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toolbar & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', ...habitCategories].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`glass-btn ${selectedFilter === cat ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsManageCatsOpen(true)} 
            className="glass-btn" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Manage Categories
          </button>
        </div>

        {/* Weekly Checklist Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredHabits.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No habits found for "{selectedFilter}". Create a habit on the right panel to get started!
            </div>
          ) : (
            filteredHabits.map(habit => (
              <div 
                key={habit.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(20, 20, 25, 0.4)'
                }}
              >
                {/* Habit details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{getCatIcon(habit.category)}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-pure)' }}>{habit.name}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{habit.category}</span>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: habit.streak > 0 ? 'var(--color-warning)' : 'inherit' }}>
                      <Flame size={12} fill={habit.streak > 0 ? 'var(--color-warning)' : 'none'} />
                      <span>{habit.streak} day streak</span>
                    </div>
                  </div>
                </div>

                {/* 7 Days checklist */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {weekDays.map(day => {
                    const isCompleted = habit.history[day.dateStr];
                    const isToday = day.dateStr === todayStr;
                    return (
                      <div 
                        key={day.dateStr}
                        onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday ? '700' : 'normal' }}>
                          {day.dayName}
                        </span>
                        
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '8px', 
                          border: isToday ? '1px solid var(--text-pure)' : '1px solid var(--border-subtle)',
                          background: isCompleted ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-pure)',
                          transition: 'var(--transition-smooth)'
                        }}>
                          {isCompleted && <Check size={16} />}
                        </div>

                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {day.dayNum}
                        </span>
                      </div>
                    );
                  })}

                  {/* Delete button */}
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: 'var(--text-muted)',
                      marginLeft: '12px'
                    }}
                    className="glass-btn-icon"
                    title="Delete Habit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Column: Stats & Add Habit Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Habit Stats */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Habit Metrics</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Tracked</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)', fontWeight: 600 }}>{habits.length}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Streaks</span>
              <span className="font-mono" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                {habits.filter(h => h.streak > 0).length} habits
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Today's Checkins</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)', fontWeight: 600 }}>
                {habits.filter(h => h.history[todayStr]).length} / {habits.length}
              </span>
            </div>
          </div>
        </div>

        {/* Create Habit Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Create Habit</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Habit Name</label>
              <input
                type="text"
                placeholder="e.g. Read research paper"
                className="glass-input"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
              <select
                className="glass-input"
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {habitCategories.map(cat => (
                  <option key={cat} value={cat} style={{ background: '#121214' }}>{cat}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '8px' }}>
              <Plus size={16} /> Add Habit
            </button>
          </form>
        </div>

      </div>

      {/* Modal: Manage Habit Categories */}
      {isManageCatsOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0' }} onClick={() => setIsManageCatsOpen(false)}>
          <div className="glass-panel" style={{ width: '420px', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>Manage Habit Categories</h3>
              <button onClick={() => setIsManageCatsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCatInput.trim()) {
                addHabitCategory(newCatInput.trim());
                setNewCatInput('');
              }
            }} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="New category name..."
                className="glass-input"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '12px', flexGrow: 1 }}
                required
              />
              <button type="submit" className="glass-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Add</button>
            </form>

            {/* List and Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {habitCategories.map(cat => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  {editingCatName === cat ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCatInput.trim()) {
                        renameHabitCategory(cat, editingCatInput.trim());
                        setEditingCatName(null);
                      }
                    }} style={{ display: 'flex', gap: '6px', width: '100%' }}>
                      <input
                        type="text"
                        className="glass-input"
                        value={editingCatInput}
                        onChange={(e) => setEditingCatInput(e.target.value)}
                        style={{ padding: '2px 6px', fontSize: '12px', flexGrow: 1 }}
                        required
                        autoFocus
                      />
                      <button type="submit" className="glass-btn" style={{ padding: '2px 6px', fontSize: '11px' }}>Save</button>
                      <button type="button" onClick={() => setEditingCatName(null)} className="glass-btn" style={{ padding: '2px 6px', fontSize: '11px' }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span>{cat}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingCatName(cat);
                            setEditingCatInput(cat);
                          }}
                          className="glass-btn"
                          style={{ padding: '2px 6px', fontSize: '11px' }}
                        >
                          Rename
                        </button>
                        {habitCategories.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the category "${cat}"? Associated habits will fallback to "${habitCategories.filter(c => c !== cat)[0] || 'Routine'}".`)) {
                                deleteHabitCategory(cat);
                                if (selectedFilter === cat) setSelectedFilter('All');
                              }
                            }}
                            className="glass-btn"
                            style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--color-danger)' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
              <button onClick={() => setIsManageCatsOpen(false)} className="glass-btn" style={{ fontSize: '12px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
