import React from 'react';
import { useOS } from '../context/OSContext';
import { 
  TrendingUp, 
  CheckSquare, 
  Award, 
  FileEdit, 
  ArrowRight,
  Plus,
  AlertCircle,
  X,
  ChevronDown,
  Wallet,
  Briefcase,
  Code,
  Server,
  Coffee,
  Zap,
  Smile,
  CreditCard,
  Users,
  FileText,
  ShoppingCart,
  Home,
  Car,
  Heart,
  Shield,
  Gift,
  HelpCircle,
  DollarSign,
  Clock,
  Building,
  Coins
} from 'lucide-react';

const FINANCE_ICON_MAP = {
  'wallet': <Wallet size={14} />,
  'briefcase': <Briefcase size={14} />,
  'code': <Code size={14} />,
  'server': <Server size={14} />,
  'coffee': <Coffee size={14} />,
  'zap': <Zap size={14} />,
  'smile': <Smile size={14} />,
  'credit-card': <CreditCard size={14} />,
  'users': <Users size={14} />,
  'file-text': <FileText size={14} />,
  'shopping-cart': <ShoppingCart size={14} />,
  'home': <Home size={14} />,
  'car': <Car size={14} />,
  'heart': <Heart size={14} />,
  'shield': <Shield size={14} />,
  'gift': <Gift size={14} />,
  'help-circle': <HelpCircle size={14} />,
  'dollar-sign': <DollarSign size={14} />,
  'clock': <Clock size={14} />
};

const AccountLogo = ({ name }) => {
  const isCash = name.toLowerCase().includes('cash');
  return (
    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCash ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255,255,255,0.04)', borderRadius: '4px', border: isCash ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid var(--border-subtle)', color: isCash ? '#34d399' : 'var(--text-secondary)', flexShrink: 0 }}>
      {isCash ? <Coins size={10} /> : <Building size={10} />}
    </div>
  );
};

const GlassSelect = ({ value, onChange, options, style }) => {
  const [isOpen, setIsOpen] = React.useState(false);
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

export default function Dashboard() {
  const { 
    db, 
    updateScratchpad, 
    setActiveApp, 
    toggleHabitDate,
    filterMonth,
    filterYear,
    addTransaction
  } = useOS();

  const [isAddTxOpen, setIsAddTxOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState('expense');
  const [category, setCategory] = React.useState('General');
  const [accountId, setAccountId] = React.useState('');
  const [txDate, setTxDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = React.useState('paid');

  const accounts = db.finance?.accounts || [];
  const categories = db.finance?.categories || [];

  const getFinanceCatIcon = (catName, catType) => {
    const cat = categories.find(c => c.name === catName && c.type === catType);
    if (cat && cat.icon && FINANCE_ICON_MAP[cat.icon]) {
      return FINANCE_ICON_MAP[cat.icon];
    }
    return catType === 'income' ? <CreditCard size={14} /> : <Wallet size={14} />;
  };

  React.useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const availableCategories = React.useMemo(() => {
    return categories.filter(c => c.type === type).map(c => c.name);
  }, [categories, type]);

  React.useEffect(() => {
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories]);

  React.useEffect(() => {
    setStatus(type === 'income' ? 'received' : 'paid');
  }, [type]);

  const handleAddTxSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !accountId) return;

    addTransaction({
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      date: txDate,
      status
    });

    setDescription('');
    setAmount('');
    setIsAddTxOpen(false);
  };

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

  // 1. Get Greeting based on time and friendly phrases
  const greetingText = React.useMemo(() => {
    const hrs = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hrs >= 12 && hrs < 18) timeGreeting = 'Good Afternoon';
    else if (hrs >= 18) timeGreeting = 'Good Evening';

    const greetingsPool = [
      timeGreeting,
      'Hey',
      'Welcome back',
      'How\'s it going',
      'Ready to build',
      'Own your grind',
      'Let\'s make moves',
      'Crush it today',
      'Focus mode active',
      'Let\'s build something great',
      'Get after it'
    ];
    const randomIndex = Math.floor(Math.random() * greetingsPool.length);
    return greetingsPool[randomIndex];
  }, []);

  const firstName = React.useMemo(() => {
    const fullName = db.settings?.username || 'User';
    return fullName.trim().split(/\s+/)[0];
  }, [db.settings?.username]);

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
      <section className="dashboard-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '8px' }}>
            {greetingText}, {firstName}.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Welcome back to gryndset. Own your grind. Stored locally.
          </p>
        </div>
        <button
          onClick={() => setIsAddTxOpen(true)}
          className="glass-btn accent"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', height: 'fit-content' }}
        >
          <Plus size={16} /> Add Transaction
        </button>
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
                {upcomingDues.map(due => {
                  const isIncome = due.type === 'income';
                  return (
                    <div key={due.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{due.description}</span>
                      <span 
                        className={`font-mono status-pill ${isIncome ? 'info' : 'warning'}`} 
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                        title={isIncome ? 'Incoming Due' : 'Outgoing Due'}
                      >
                        {isIncome ? '+' : '-'}{currency}{due.amount.toLocaleString(getLocale(currency), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
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

      {/* Quick Add Transaction Modal Overlay */}
      {isAddTxOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 0 }} onClick={() => setIsAddTxOpen(false)}>
          <div className="glass-panel" style={{ width: '420px', maxWidth: '90%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: 'var(--text-pure)' }} /> Log Transaction
              </h3>
              <button onClick={() => setIsAddTxOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleAddTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. Server hosting fee"
                  className="glass-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="glass-input font-mono"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</label>
                  <input
                    type="date"
                    className="glass-input font-mono"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                    style={{ padding: '8px 10px', fontSize: '12px', height: '38px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</label>
                  <GlassSelect
                    value={type}
                    onChange={setType}
                    options={[
                      { value: 'expense', label: 'Expense', icon: <Wallet size={14} style={{ color: 'var(--color-danger)' }} /> },
                      { value: 'income', label: 'Income', icon: <CreditCard size={14} style={{ color: 'var(--color-success)' }} /> }
                    ]}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                  <GlassSelect
                    value={category}
                    onChange={setCategory}
                    options={availableCategories.map(cat => ({
                      value: cat,
                      label: cat,
                      icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{getFinanceCatIcon(cat, type)}</span>
                    }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account</label>
                  <GlassSelect
                    value={accountId}
                    onChange={setAccountId}
                    options={accounts.map(acc => ({
                      value: acc.id,
                      label: acc.name,
                      icon: <AccountLogo name={acc.name} />
                    }))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                  <GlassSelect
                    value={status}
                    onChange={setStatus}
                    options={type === 'income' ? [
                      { value: 'received', label: 'Received', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} /> },
                      { value: 'due', label: 'Due', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-info)' }} /> }
                    ] : [
                      { value: 'paid', label: 'Paid', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-danger)' }} /> },
                      { value: 'due', label: 'Due', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)' }} /> }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsAddTxOpen(false)} className="glass-btn" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="glass-btn active" style={{ flexGrow: 1 }}>Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
