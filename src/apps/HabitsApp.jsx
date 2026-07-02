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
  X,
  Calendar,
  Edit2,
  Archive,
  RotateCcw,
  Dumbbell,
  Coffee,
  Code,
  Music,
  Sparkles,
  Trophy,
  Target,
  Star,
  Compass,
  ChevronDown
} from 'lucide-react';

const ICON_MAP = {
  'heart': <Heart size={14} />,
  'book-open': <BookOpen size={14} />,
  'briefcase': <Briefcase size={14} />,
  'smile': <Smile size={14} />,
  'dumbbell': <Dumbbell size={14} />,
  'coffee': <Coffee size={14} />,
  'code': <Code size={14} />,
  'music': <Music size={14} />,
  'sparkles': <Sparkles size={14} />,
  'trophy': <Trophy size={14} />,
  'target': <Target size={14} />,
  'star': <Star size={14} />,
  'compass': <Compass size={14} />
};

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
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '8px 12px',
          fontSize: '12px',
          height: '38px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          outline: 'none',
          color: 'var(--text-primary)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>
          {selectedOption?.icon}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : 'Select...'}
          </span>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            background: 'rgba(18, 18, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: isSelected ? 'var(--text-pure)' : 'var(--text-primary)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {opt.icon}
                  <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                </div>
                {opt.extra}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function HabitsApp() {
  const { 
    db, 
    addHabit, 
    deleteHabit, 
    editHabit,
    toggleArchiveHabit,
    toggleHabitDate,
    addHabitCategory,
    renameHabitCategory,
    deleteHabitCategory
  } = useOS();

  // Local Form States
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [frequency, setFrequency] = useState('daily');
  const [weeklyCount, setWeeklyCount] = useState(3);
  const [specificDays, setSpecificDays] = useState([1, 3, 5]); // Mon, Wed, Fri by default

  const [selectedFilter, setSelectedFilter] = useState('All');

  // Manage categories modal state
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('smile');
  const [editingCatName, setEditingCatName] = useState(null);
  const [editingCatInput, setEditingCatInput] = useState('');
  const [editingCatIcon, setEditingCatIcon] = useState('smile');

  // Edit Habit Modal State
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFrequency, setEditFrequency] = useState('daily');
  const [editWeeklyCount, setEditWeeklyCount] = useState(3);
  const [editSpecificDays, setEditSpecificDays] = useState([]);

  // Calendar Modal State
  const [calendarHabitId, setCalendarHabitId] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth()); // 0-11
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const habits = db.habits || [];
  const habitCategories = db.habitCategories || [
    { name: 'Health', icon: 'heart' },
    { name: 'Learning', icon: 'book-open' },
    { name: 'Work', icon: 'briefcase' },
    { name: 'Routine', icon: 'smile' }
  ];

  const habitCategoriesList = habitCategories.map(c => typeof c === 'string' ? c : c.name);

  React.useEffect(() => {
    if (habitCategoriesList.length > 0 && !habitCategoriesList.includes(habitCategory)) {
      setHabitCategory(habitCategoriesList[0]);
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

  // Filtering: Active vs Archived
  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);

  const filteredHabits = selectedFilter === 'Archived'
    ? archivedHabits
    : (selectedFilter === 'All'
      ? activeHabits
      : activeHabits.filter(h => h.category === selectedFilter));

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    addHabit(habitName.trim(), habitCategory, frequency, weeklyCount, specificDays);
    setHabitName('');
  };

  // Get category icon
  const getCatIcon = (catName) => {
    const cat = habitCategories.find(c => (typeof c === 'string' ? c : c.name) === catName);
    if (cat && cat.icon && ICON_MAP[cat.icon]) {
      return ICON_MAP[cat.icon];
    }
    // Fallbacks
    if (catName === 'Health') return <Heart size={14} />;
    if (catName === 'Learning') return <BookOpen size={14} />;
    if (catName === 'Work') return <Briefcase size={14} />;
    return <Smile size={14} />;
  };

  // Get frequency label
  const getFrequencyLabel = (h) => {
    const freq = h.frequency || 'daily';
    if (freq === 'weekly') {
      return `${h.weeklyCount || 3}x per week`;
    }
    if (freq === 'days') {
      const daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sortedDays = [...(h.specificDays || [])].sort((a, b) => a - b);
      
      if (sortedDays.length === 7) return 'Every day';
      if (sortedDays.length === 5 && sortedDays.every((d, i) => d === i + 1)) return 'Weekdays';
      if (sortedDays.length === 2 && sortedDays[0] === 0 && sortedDays[1] === 6) return 'Weekends';
      
      return sortedDays.map(d => daysList[d]).join(', ');
    }
    return 'Daily';
  };

  // Open Edit Modal
  const openEditModal = (habit) => {
    setEditingHabitId(habit.id);
    setEditName(habit.name);
    setEditCategory(habit.category);
    setEditFrequency(habit.frequency || 'daily');
    setEditWeeklyCount(habit.weeklyCount || 3);
    setEditSpecificDays(habit.specificDays || [1, 3, 5]);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    editHabit(editingHabitId, {
      name: editName.trim(),
      category: editCategory,
      frequency: editFrequency,
      weeklyCount: parseInt(editWeeklyCount) || 3,
      specificDays: editSpecificDays
    });
    setEditingHabitId(null);
  };

  // Open Calendar Modal
  const openCalendarModal = (habit) => {
    setCalendarHabitId(habit.id);
    setCalMonth(new Date().getMonth());
    setCalYear(new Date().getFullYear());
  };

  const calendarHabit = habits.find(h => h.id === calendarHabitId);

  // Month navigation
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  return (
    <div className="habits-layout">
      
      {/* Left Column: Habits List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toolbar & Filters */}
        <div className="habit-toolbar">
          <div className="habit-filters-container">
            {['All', ...habitCategoriesList, 'Archived'].map(cat => (
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
            className="glass-btn habit-manage-cats-btn" 
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Manage Categories
          </button>
        </div>

        {/* Weekly Checklist Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredHabits.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No {selectedFilter === 'Archived' ? 'archived' : ''} habits found. Create a habit on the right panel to get started!
            </div>
          ) : (
            filteredHabits.map(habit => (
              <div 
                key={habit.id} 
                className="glass-card habit-card" 
              >
                {/* Habit details */}
                <div className="habit-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{getCatIcon(habit.category)}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-pure)' }}>{habit.name}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{habit.category}</span>
                    <span>•</span>
                    <span>{getFrequencyLabel(habit)}</span>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: habit.streak > 0 ? 'var(--color-warning)' : 'inherit' }}>
                      <Flame size={12} fill={habit.streak > 0 ? 'var(--color-warning)' : 'none'} />
                      <span>{habit.streak} {habit.frequency === 'weekly' ? 'week' : 'day'} streak</span>
                    </div>
                  </div>
                </div>

                {/* Actions / 7 Days checklist */}
                {habit.archived ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleArchiveHabit(habit.id)}
                      className="glass-btn"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button 
                      onClick={() => deleteHabit(habit.id)}
                      className="glass-btn-icon"
                      style={{ color: 'var(--color-danger)' }}
                      title="Permanently Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="habit-checklist">
                    {weekDays.map(day => {
                      const isCompleted = habit.history[day.dateStr];
                      const isToday = day.dateStr === todayStr;
                      const dayOfWeek = new Date(day.dateStr).getDay();
                      const isScheduled = habit.frequency === 'daily' ||
                        (habit.frequency === 'days' && (habit.specificDays || []).includes(dayOfWeek)) ||
                        (habit.frequency === 'weekly');

                      return (
                        <div 
                          key={day.dateStr}
                          onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                          className="habit-checklist-day"
                          style={{ opacity: isScheduled ? 1 : 0.4 }}
                        >
                          <span className="habit-day-name" style={{ color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday ? '700' : 'normal' }}>
                            {day.dayName}
                          </span>
                          
                          <div 
                            className="habit-day-circle"
                            style={{ 
                              border: isToday ? '1px solid var(--text-pure)' : (isScheduled ? '1px solid var(--border-subtle)' : '1px dashed var(--border-subtle)'),
                              background: isCompleted ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            {isCompleted && <Check size={16} />}
                          </div>

                          <span className="habit-day-num">
                            {day.dayNum}
                          </span>
                        </div>
                      );
                    })}

                    {/* Interactive Tools */}
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                      <button 
                        onClick={() => openCalendarModal(habit)}
                        className="glass-btn-icon"
                        title="History Calendar"
                      >
                        <Calendar size={14} />
                      </button>
                      <button 
                        onClick={() => openEditModal(habit)}
                        className="glass-btn-icon"
                        title="Edit Habit"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

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
              <span style={{ color: 'var(--text-secondary)' }}>Total Active</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)', fontWeight: 600 }}>{activeHabits.length}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Streaks</span>
              <span className="font-mono" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                {activeHabits.filter(h => h.streak > 0).length} habits
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Today's Checkins</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)', fontWeight: 600 }}>
                {activeHabits.filter(h => h.history[todayStr]).length} / {activeHabits.length}
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
              <GlassSelect
                value={habitCategory}
                onChange={setHabitCategory}
                options={habitCategories.map(cat => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const catIcon = typeof cat === 'string' ? 'smile' : cat.icon;
                  return {
                    value: catName,
                    label: catName,
                    icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{ICON_MAP[catIcon] || ICON_MAP['smile']}</span>
                  };
                })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Frequency</label>
              <GlassSelect
                value={frequency}
                onChange={setFrequency}
                options={[
                  { value: 'daily', label: 'Daily', icon: <Calendar size={12} /> },
                  { value: 'weekly', label: 'X times per week', icon: <Flame size={12} /> },
                  { value: 'days', label: 'Specific Days', icon: <Grid size={12} /> }
                ]}
              />
            </div>

            {frequency === 'weekly' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Days Per Week</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  className="glass-input font-mono"
                  value={weeklyCount}
                  onChange={(e) => setWeeklyCount(parseInt(e.target.value) || 3)}
                  required
                />
              </div>
            )}

            {frequency === 'days' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>On Which Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
                    const isChecked = specificDays.includes(idx);
                    return (
                      <button
                        type="button"
                        key={dayName}
                        onClick={() => {
                          if (isChecked) {
                            setSpecificDays(specificDays.filter(d => d !== idx));
                          } else {
                            setSpecificDays([...specificDays, idx]);
                          }
                        }}
                        className={`glass-btn ${isChecked ? 'active' : ''}`}
                        style={{ padding: '4px 8px', fontSize: '11px', flexGrow: 1 }}
                      >
                        {dayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button type="submit" className="glass-btn" style={{ width: '100%', marginTop: '8px' }}>
              <Plus size={16} /> Add Habit
            </button>
          </form>
        </div>

      </div>

      {/* Modal: Manage Habit Categories */}
      {isManageCatsOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0' }} onClick={() => setIsManageCatsOpen(false)}>
          <div className="glass-panel" style={{ width: '420px', maxWidth: '90%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>Manage Habit Categories</h3>
              <button onClick={() => setIsManageCatsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCatInput.trim()) {
                addHabitCategory(newCatInput.trim(), newCatIcon);
                setNewCatInput('');
                setNewCatIcon('smile');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
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
              </div>

              {/* Icon selector for creation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Select Icon</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.keys(ICON_MAP).map(iconKey => (
                    <button
                      type="button"
                      key={iconKey}
                      onClick={() => setNewCatIcon(iconKey)}
                      className={`glass-btn-icon ${newCatIcon === iconKey ? 'active' : ''}`}
                      style={{ width: '28px', height: '28px', borderRadius: '6px', background: newCatIcon === iconKey ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                      title={iconKey}
                    >
                      {ICON_MAP[iconKey]}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* List and Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {habitCategories.map(cat => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catIcon = typeof cat === 'string' ? 'smile' : cat.icon;

                return (
                  <div key={catName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                    {editingCatName === catName ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (editingCatInput.trim()) {
                          renameHabitCategory(catName, editingCatInput.trim(), editingCatIcon);
                          setEditingCatName(null);
                        }
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
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
                        </div>

                        {/* Icon selector for editing */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {Object.keys(ICON_MAP).map(iconKey => (
                            <button
                              type="button"
                              key={iconKey}
                              onClick={() => setEditingCatIcon(iconKey)}
                              className={`glass-btn-icon ${editingCatIcon === iconKey ? 'active' : ''}`}
                              style={{ width: '24px', height: '24px', borderRadius: '4px', background: editingCatIcon === iconKey ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                              title={iconKey}
                            >
                              {React.cloneElement(ICON_MAP[iconKey], { size: 12 })}
                            </button>
                          ))}
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{getCatIcon(catName)}</span>
                          <span>{catName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingCatName(catName);
                              setEditingCatInput(catName);
                              setEditingCatIcon(catIcon || 'smile');
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
                                if (window.confirm(`Are you sure you want to delete the category "${catName}"? Associated habits will fallback to "${habitCategoriesList.filter(c => c !== catName)[0] || 'Routine'}".`)) {
                                  deleteHabitCategory(catName);
                                  if (selectedFilter === catName) setSelectedFilter('All');
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
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
              <button onClick={() => setIsManageCatsOpen(false)} className="glass-btn" style={{ fontSize: '12px' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Habit Details */}
      {editingHabitId && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0' }} onClick={() => setEditingHabitId(null)}>
          <div className="glass-panel" style={{ width: '460px', maxWidth: '90%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Edit Habit</h3>
              <button onClick={() => setEditingHabitId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Habit Name</label>
                <input
                  type="text"
                  className="glass-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                <GlassSelect
                  value={editCategory}
                  onChange={setEditCategory}
                  options={habitCategories.map(cat => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    const catIcon = typeof cat === 'string' ? 'smile' : cat.icon;
                    return {
                      value: catName,
                      label: catName,
                      icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{ICON_MAP[catIcon] || ICON_MAP['smile']}</span>
                    };
                  })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Frequency</label>
                <GlassSelect
                  value={editFrequency}
                  onChange={setEditFrequency}
                  options={[
                    { value: 'daily', label: 'Daily', icon: <Calendar size={12} /> },
                    { value: 'weekly', label: 'X times per week', icon: <Flame size={12} /> },
                    { value: 'days', label: 'Specific Days', icon: <Grid size={12} /> }
                  ]}
                />
              </div>

              {editFrequency === 'weekly' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Days Per Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    className="glass-input font-mono"
                    value={editWeeklyCount}
                    onChange={(e) => setEditWeeklyCount(parseInt(e.target.value) || 3)}
                    required
                  />
                </div>
              )}

              {editFrequency === 'days' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>On Which Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => {
                      const isChecked = editSpecificDays.includes(idx);
                      return (
                        <button
                          type="button"
                          key={dayName}
                          onClick={() => {
                            if (isChecked) {
                              setEditSpecificDays(editSpecificDays.filter(d => d !== idx));
                            } else {
                              setEditSpecificDays([...editSpecificDays, idx]);
                            }
                          }}
                          className={`glass-btn ${isChecked ? 'active' : ''}`}
                          style={{ padding: '4px 8px', fontSize: '11px', flexGrow: 1 }}
                        >
                          {dayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    toggleArchiveHabit(editingHabitId);
                    setEditingHabitId(null);
                  }} 
                  className="glass-btn" 
                  style={{ gap: '6px' }}
                >
                  <Archive size={14} /> Archive Habit
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to permanently delete this habit? All history will be lost.")) {
                      deleteHabit(editingHabitId);
                      setEditingHabitId(null);
                    }
                  }} 
                  className="glass-btn" 
                  style={{ color: 'var(--color-danger)' }}
                >
                  Delete
                </button>
                <button type="submit" className="glass-btn active" style={{ flexGrow: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Monthly History Calendar */}
      {calendarHabitId && calendarHabit && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0' }} onClick={() => setCalendarHabitId(null)}>
          <div className="glass-panel" style={{ width: '450px', maxWidth: '95%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Calendar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{calendarHabit.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Historical completion ledger</span>
              </div>
              <button onClick={() => setCalendarHabitId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {/* Month Navigator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button onClick={prevMonth} className="glass-btn" style={{ padding: '4px 8px', fontSize: '12px' }}>&larr; Prev</button>
              <strong style={{ fontSize: '14px', color: 'var(--text-pure)' }}>
                {new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </strong>
              <button onClick={nextMonth} className="glass-btn" style={{ padding: '4px 8px', fontSize: '12px' }}>Next &rarr;</button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day headers */}
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}

              {/* Empty spaces for preceding days */}
              {Array.from({ length: getFirstDayOfMonth(calMonth, calYear) }).map((_, idx) => (
                <div key={`empty-${idx}`} className="calendar-day empty"></div>
              ))}

              {/* Days of the Month */}
              {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isCompleted = calendarHabit.history[dateStr];
                const isToday = dateStr === todayStr;
                const dayOfWeek = new Date(calYear, calMonth, dayNum).getDay();
                
                const isScheduled = calendarHabit.frequency === 'daily' ||
                  (calendarHabit.frequency === 'days' && (calendarHabit.specificDays || []).includes(dayOfWeek)) ||
                  (calendarHabit.frequency === 'weekly');

                return (
                  <div 
                    key={`day-${dayNum}`}
                    onClick={() => {
                      toggleHabitDate(calendarHabit.id, dateStr);
                    }}
                    className={`calendar-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isScheduled ? 'not-scheduled' : ''}`}
                    title={dateStr}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            {/* Month Metrics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Month Completions:</span>
              <strong className="font-mono" style={{ color: 'var(--text-pure)' }}>
                {Object.keys(calendarHabit.history).filter(d => d.startsWith(`${calYear}-${String(calMonth + 1).padStart(2, '0')}`)).length} days
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button onClick={() => setCalendarHabitId(null)} className="glass-btn" style={{ fontSize: '12px' }}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
