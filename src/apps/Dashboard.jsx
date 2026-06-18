import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  TrendingUp, 
  CheckSquare, 
  Award, 
  FileEdit, 
  ArrowRight,
  Plus,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { 
    db, 
    updateScratchpad, 
    setActiveApp, 
    toggleHabitDate,
    filterMonth,
    filterYear 
  } = useOS();

  const currency = db.settings?.currency || '₹';
  const getLocale = (curr) => {
    if (curr === '₹') return 'en-IN';
    if (curr === '€') return 'de-DE';
    if (curr === '£') return 'en-GB';
    if (curr === '¥') return 'ja-JP';
    if (curr === '₽') return 'ru-RU';
    return 'en-US';
  };
  const datePrefix = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;

  // 1. Get Greeting based on time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // 2. Finance Widget Math (Filtered by Year and Month)
  const monthlyTransactions = (db.finance.transactions || []).filter(t => t.date.startsWith(datePrefix));

  const income = monthlyTransactions
    .filter(t => t.type === 'income' && t.status === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDues = monthlyTransactions
    .filter(t => t.status === 'due')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = income - expenses;
  
  const monthlyTarget = db.finance.monthlyTarget || 0;
  const savingsTargetProgress = monthlyTarget > 0 ? (netBalance / monthlyTarget) * 100 : 0;
  const upcomingDues = monthlyTransactions.filter(t => t.status === 'due').slice(0, 2);

  // 3. Habits Widget Math
  const todayStr = new Date().toISOString().split('T')[0];
  const totalHabits = db.habits.length;
  const completedToday = db.habits.filter(h => h.history[todayStr]).length;
  const habitCompletionPercent = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  
  // 4. Tasks Widget Math (Filtered by Year and Month)
  const pendingTasks = db.projects.tasks.filter(t => t.column !== 'done' && t.dueDate.startsWith(datePrefix));
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high').slice(0, 3);
  const generalPendingTasks = pendingTasks.filter(t => t.priority !== 'high').slice(0, 2);
  const displayTasks = [...highPriorityTasks, ...generalPendingTasks].slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flexGrow: 1 }} className="dashboard-welcome">
      {/* Welcome Section */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '8px' }}>
            {getGreeting()}, {db.settings?.username || 'User'}.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Welcome back to gryndset. Own your grind. Stored locally.
          </p>
        </div>
      </section>

      {/* Grid Layout of Widgets */}
      <div className="dashboard-grid">
        {/* Finance Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <TrendingUp size={16} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Finance</h3>
            </div>
            <button 
              onClick={() => setActiveApp('finance')} 
              className="glass-btn" 
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              Ledger <ArrowRight size={12} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Net Balance</span>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-pure)' }}>
              {currency}{netBalance.toLocaleString(getLocale(currency), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Monthly Savings Target Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Savings Target Progress</span>
              <span className="font-mono" style={{ color: 'var(--text-pure)' }}>
                {currency}{netBalance.toFixed(0)} / {currency}{monthlyTarget.toFixed(0)}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '2px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${Math.min(Math.max(0, savingsTargetProgress), 100)}%`, 
                height: '100%', 
                background: savingsTargetProgress >= 100 ? 'var(--color-success)' : 'var(--text-pure)', 
                borderRadius: '2px',
                transition: 'var(--transition-smooth)'
              }} />
            </div>
          </div>

          {/* Upcoming Dues */}
          {upcomingDues.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                <AlertCircle size={12} />
                <span>Upcoming Unpaid Dues</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingDues.map(due => (
                  <div key={due.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{due.description}</span>
                    <span className="font-mono status-pill warning" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      {currency}{due.amount.toLocaleString(getLocale(currency), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Task Tracker Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <CheckSquare size={16} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Projects</h3>
            </div>
            <button 
              onClick={() => setActiveApp('projects')} 
              className="glass-btn" 
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              Kanban <ArrowRight size={12} />
            </button>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Unfinished tasks</span>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-pure)' }}>
              {pendingTasks.length}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayTasks.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No active tasks. Create one!
              </div>
            ) : (
              displayTasks.map(task => (
                <div 
                  key={task.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.title}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{task.project}</span>
                  </div>
                  {task.priority === 'high' && (
                    <span className="status-pill danger" style={{ fontSize: '9px', padding: '2px 6px' }}>HIGH</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habit Tracker Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Award size={16} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Habits</h3>
            </div>
            <button 
              onClick={() => setActiveApp('habits')} 
              className="glass-btn" 
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              Habits <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* SVG Progress Gauge */}
            <div style={{ position: 'relative', width: '70px', height: '70px' }}>
              <svg width="70" height="70" viewBox="0 0 36 36">
                <path
                  className="gauge-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="2.5"
                />
                <path
                  className="gauge-fill"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--text-pure)"
                  strokeWidth="2.5"
                  strokeDasharray={`${habitCompletionPercent}, 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              </svg>
              <div className="font-mono" style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '14px',
                fontWeight: 700
              }}>
                {completedToday}/{totalHabits}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Today's Progress</span>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                {habitCompletionPercent === 100 
                  ? 'All habits checked!' 
                  : `${completedToday} completed today`}
              </h4>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {db.habits.slice(0, 3).map(habit => {
              const isChecked = habit.history[todayStr];
              return (
                <div 
                  key={habit.id} 
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px',
                    borderRadius: '8px',
                    background: isChecked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{ 
                    color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: isChecked ? 'line-through' : 'none'
                  }}>
                    {habit.name}
                  </span>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Streak: {habit.streak}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scratchpad Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <FileEdit size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Scratchpad</h3>
          </div>
          <textarea
            className="glass-input font-mono"
            style={{ 
              height: '110px', 
              resize: 'none', 
              fontSize: '13px', 
              lineHeight: '1.6', 
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              background: 'rgba(10,10,10,0.4)',
              borderRadius: '8px',
              padding: '12px'
            }}
            value={db.scratchpad}
            onChange={(e) => updateScratchpad(e.target.value)}
            placeholder="Write temporary notes, clipboard content, or scratch items here..."
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
            Auto-saves immediately to browser storage
          </div>
        </div>
      </div>
    </div>
  );
}
