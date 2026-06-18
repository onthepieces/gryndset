import React, { createContext, useContext, useState, useEffect } from 'react';

const OSContext = createContext();

const DEFAULT_STORAGE_KEY = 'gryndset-data-store';

export const OSProvider = ({ children }) => {
  const [activeApp, setActiveApp] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const today = new Date();
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  
  const sanitizeDb = (parsed) => {
    const defaultData = {
      settings: { username: 'User', currency: '₹', onboarded: false },
      finance: {
        budget: 0,
        monthlyTarget: 0,
        yearlyTarget: 0,
        transactions: [],
        subscriptions: [],
        accounts: [
          { id: 'acc-cash', name: 'Cash', initialBalance: 0 },
          { id: 'acc-bank', name: 'Bank Account', initialBalance: 0 }
        ],
        categories: [
          { name: 'General', type: 'expense' },
          { name: 'Office', type: 'expense' },
          { name: 'Software', type: 'expense' },
          { name: 'Infrastructure', type: 'expense' },
          { name: 'Meals', type: 'expense' },
          { name: 'Utilities', type: 'expense' },
          { name: 'Miscellaneous', type: 'expense' },
          { name: 'General', type: 'income' },
          { name: 'Salary', type: 'income' },
          { name: 'Consulting', type: 'income' },
          { name: 'Invoicing', type: 'income' }
        ]
      },
      projects: {
        projectsList: ['General'],
        tasks: []
      },
      habits: [],
      habitCategories: ['Health', 'Learning', 'Work', 'Routine'],
      notes: [],
      investments: {
        trades: [],
        marketPrices: {}
      },
      scratchpad: ''
    };

    if (parsed) {
      // Merge values
      return {
        ...defaultData,
        ...parsed,
        settings: { 
          ...defaultData.settings, 
          onboarded: parsed.settings?.onboarded !== undefined ? parsed.settings.onboarded : true, 
          ...parsed.settings 
        },
        finance: { 
          ...defaultData.finance, 
          ...parsed.finance,
          subscriptions: parsed.finance?.subscriptions || defaultData.finance.subscriptions,
          categories: parsed.finance?.categories || defaultData.finance.categories,
          accounts: parsed.finance?.accounts || defaultData.finance.accounts,
          transactions: (parsed.finance?.transactions || defaultData.finance.transactions).map(t => ({
            ...t,
            accountId: t.accountId || 'acc-bank'
          }))
        },
        projects: {
          ...defaultData.projects,
          ...parsed.projects,
          projectsList: parsed.projects?.projectsList || defaultData.projects.projectsList
        },
        habitCategories: parsed.habitCategories || defaultData.habitCategories
      };
    }
    return defaultData;
  };

  // Root persistent state
  const [db, setDb] = useState(() => {
    const local = localStorage.getItem(DEFAULT_STORAGE_KEY);
    let parsed = null;
    if (local) {
      try {
        parsed = JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
    return sanitizeDb(parsed);
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  // Auto-renew subscriptions checker
  useEffect(() => {
    setDb((currentDb) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      let dbChanged = false;
      const newTransactions = [...(currentDb.finance?.transactions || [])];
      const subs = currentDb.finance?.subscriptions || [];

      subs.forEach(sub => {
        if (!sub.active) return;

        if (currentDay >= sub.renewalDay) {
          const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
          const txDescription = `[Sub] ${sub.name}`;
          const txDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(sub.renewalDay).padStart(2, '0')}`;
          
          const alreadyLogged = newTransactions.some(t => 
            t.description === txDescription && 
            t.date.startsWith(monthStr)
          );

          if (!alreadyLogged) {
            newTransactions.unshift({
              id: 'f-' + Math.random().toString(36).substring(2, 9),
              date: txDate,
              description: txDescription,
              category: sub.category,
              amount: sub.amount,
              type: 'expense',
              status: 'paid',
              accountId: 'acc-bank'
            });
            dbChanged = true;
          }
        }
      });

      if (dbChanged) {
        setTimeout(() => triggerToast('Processed monthly subscription renewals', 'success'), 100);
        return {
          ...currentDb,
          finance: {
            ...currentDb.finance,
            transactions: newTransactions
          }
        };
      }
      return currentDb;
    });
  }, []);

  // Toast System
  const triggerToast = (text, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, text, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // State modifiers
  const updateScratchpad = (text) => {
    setDb((prev) => ({ ...prev, scratchpad: text }));
  };

  // Finance updates
  const setFinanceBudget = (budget) => {
    setDb((prev) => ({
      ...prev,
      finance: { ...prev.finance, budget: parseFloat(budget) || 0 }
    }));
    triggerToast('Budget cap updated', 'success');
  };

  const addTransaction = (transaction) => {
    const newTx = { ...transaction, id: 'f-' + Math.random().toString(36).substring(2, 9) };
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        transactions: [newTx, ...prev.finance.transactions]
      }
    }));
    triggerToast(`Added transaction: ${transaction.description}`, 'success');
  };

  const deleteTransaction = (id) => {
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        transactions: prev.finance.transactions.filter(t => t.id !== id)
      }
    }));
    triggerToast('Transaction removed', 'info');
  };

  const toggleTransactionStatus = (id) => {
    setDb((prev) => {
      const updated = prev.finance.transactions.map((tx) => {
        if (tx.id === id) {
          let nextStatus = 'paid';
          if (tx.type === 'expense') {
            nextStatus = tx.status === 'paid' ? 'due' : 'paid';
          } else {
            nextStatus = tx.status === 'received' ? 'due' : 'received';
          }
          return { ...tx, status: nextStatus };
        }
        return tx;
      });
      return {
        ...prev,
        finance: { ...prev.finance, transactions: updated }
      };
    });
    triggerToast('Transaction status toggled', 'success');
  };

  const editTransaction = (id, updatedFields) => {
    setDb((prev) => {
      const updated = prev.finance.transactions.map((t) => {
        if (t.id === id) {
          return { ...t, ...updatedFields };
        }
        return t;
      });
      return {
        ...prev,
        finance: { ...prev.finance, transactions: updated }
      };
    });
    triggerToast('Transaction updated', 'success');
  };

  const addSubscription = (subscription) => {
    const newSub = {
      ...subscription,
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      active: true
    };
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        subscriptions: [...(prev.finance.subscriptions || []), newSub]
      }
    }));
    triggerToast(`Added subscription: ${subscription.name}`, 'success');
  };

  const deleteSubscription = (id) => {
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        subscriptions: (prev.finance.subscriptions || []).filter(s => s.id !== id)
      }
    }));
    triggerToast('Subscription deleted', 'info');
  };

  // Project updates
  const addProject = (projectName) => {
    if (!projectName.trim()) return;
    if (db.projects.projectsList.includes(projectName)) {
      triggerToast('Project folder already exists', 'warning');
      return;
    }
    setDb((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        projectsList: [...prev.projects.projectsList, projectName]
      }
    }));
    triggerToast(`Created folder: ${projectName}`, 'success');
  };

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      subtasks: task.subtasks || []
    };
    setDb((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        tasks: [...prev.projects.tasks, newTask]
      }
    }));
    triggerToast(`Task added: ${task.title}`, 'success');
  };

  const updateTaskColumn = (taskId, newColumn) => {
    setDb((prev) => {
      const updated = prev.projects.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, column: newColumn };
        }
        return task;
      });
      return {
        ...prev,
        projects: { ...prev.projects, tasks: updated }
      };
    });
    triggerToast(`Task updated to ${newColumn}`, 'info');
  };

  const deleteTask = (taskId) => {
    setDb((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        tasks: prev.projects.tasks.filter((t) => t.id !== taskId)
      }
    }));
    triggerToast('Task removed', 'info');
  };

  const editTask = (id, updatedFields) => {
    setDb((prev) => {
      const updated = prev.projects.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, ...updatedFields };
        }
        return t;
      });
      return {
        ...prev,
        projects: { ...prev.projects, tasks: updated }
      };
    });
    triggerToast('Task updated', 'success');
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setDb((prev) => {
      const updatedTasks = prev.projects.tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSub = t.subtasks.map((sub) => {
            if (sub.id === subtaskId) {
              return { ...sub, completed: !sub.completed };
            }
            return sub;
          });
          return { ...t, subtasks: updatedSub };
        }
        return t;
      });
      return {
        ...prev,
        projects: { ...prev.projects, tasks: updatedTasks }
      };
    });
  };

  // Habits updates
  const addHabit = (name, category) => {
    if (!name.trim()) return;
    const newHabit = {
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      name,
      category,
      streak: 0,
      history: {}
    };
    setDb((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
    triggerToast(`New habit tracking: ${name}`, 'success');
  };

  const deleteHabit = (id) => {
    setDb((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id)
    }));
    triggerToast('Habit deleted', 'info');
  };

  const toggleHabitDate = (habitId, dateStr) => {
    setDb((prev) => {
      const updated = prev.habits.map((habit) => {
        if (habit.id === habitId) {
          const newHistory = { ...habit.history };
          if (newHistory[dateStr]) {
            delete newHistory[dateStr];
          } else {
            newHistory[dateStr] = true;
          }

          // Calculate streak
          // Simple streak calculation: count consecutive completed days backwards from today or last completed day
          let currentStreak = 0;
          let tempDate = new Date();
          
          // Let's count backwards to calculate current streak
          for (let i = 0; i < 365; i++) {
            const checkStr = tempDate.toISOString().split('T')[0];
            if (newHistory[checkStr]) {
              currentStreak++;
              tempDate.setDate(tempDate.getDate() - 1);
            } else {
              // If it's today and not checked, we check yesterday to keep streak active
              if (i === 0) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const checkYesterdayStr = yesterday.toISOString().split('T')[0];
                if (newHistory[checkYesterdayStr]) {
                  // Streak is active from yesterday
                  tempDate.setDate(tempDate.getDate() - 1);
                  continue;
                }
              }
              break;
            }
          }

          return { ...habit, history: newHistory, streak: currentStreak };
        }
        return habit;
      });
      return { ...prev, habits: updated };
    });
  };

  // Notes updates
  const addNote = (title, content, tags, folder) => {
    const newNote = {
      id: 'n-' + Math.random().toString(36).substring(2, 9),
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      pinned: false,
      folder: folder || 'General',
      updatedAt: new Date().toISOString()
    };
    setDb((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    triggerToast('Note created', 'success');
    return newNote.id;
  };

  const updateNote = (id, fields) => {
    setDb((prev) => {
      const updated = prev.notes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            ...fields,
            updatedAt: new Date().toISOString()
          };
        }
        return note;
      });
      return { ...prev, notes: updated };
    });
  };

  const deleteNote = (id) => {
    setDb((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id)
    }));
    triggerToast('Note deleted', 'info');
  };

  // Investments updates
  const addTrade = (trade) => {
    const newTrade = {
      ...trade,
      id: 't-' + Math.random().toString(36).substring(2, 9),
      price: parseFloat(trade.price) || 0,
      shares: parseFloat(trade.shares) || 0
    };
    setDb((prev) => {
      // Add unique tickers to market prices if not present
      const updatedPrices = { ...prev.investments.marketPrices };
      if (!(trade.ticker in updatedPrices)) {
        updatedPrices[trade.ticker] = trade.price; // default to purchase price
      }
      return {
        ...prev,
        investments: {
          trades: [newTrade, ...prev.investments.trades],
          marketPrices: updatedPrices
        }
      };
    });
    triggerToast(`Logged trade: ${trade.type.toUpperCase()} ${trade.ticker}`, 'success');
  };

  const updateMarketPrice = (ticker, price) => {
    const val = parseFloat(price) || 0;
    setDb((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        marketPrices: {
          ...prev.investments.marketPrices,
          [ticker]: val
        }
      }
    }));
    triggerToast(`Updated price for ${ticker}`, 'info');
  };

  const deleteTrade = (id) => {
    setDb((prev) => ({
      ...prev,
      investments: {
        ...prev.investments,
        trades: prev.investments.trades.filter((t) => t.id !== id)
      }
    }));
    triggerToast('Trade transaction deleted', 'info');
  };

  // Backup system
  const exportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `gryndset-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('System backup exported', 'success');
    } catch (e) {
      triggerToast('Export failed', 'danger');
    }
  };

  const importBackup = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      // Basic check
      if (data.finance && data.projects && data.habits && data.notes && data.investments) {
        const sanitized = sanitizeDb(data);
        setDb(sanitized);
        triggerToast('System backup restored successfully', 'success');
        return true;
      } else {
        triggerToast('Invalid backup file schema', 'danger');
        return false;
      }
    } catch (e) {
      triggerToast('Failed to parse backup file', 'danger');
      return false;
    }
  };

  const updateSettings = (username, currency) => {
    setDb((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        username: username.trim() || prev.settings.username,
        currency: currency.trim() || prev.settings.currency
      }
    }));
    triggerToast('Settings updated', 'success');
  };

  const completeOnboarding = (username, currency, budget, monthlyTarget, yearlyTarget) => {
    setDb((prev) => ({
      ...prev,
      settings: {
        username: username.trim() || 'User',
        currency: currency.trim() || '₹',
        onboarded: true
      },
      finance: {
        ...prev.finance,
        budget: parseFloat(budget) || 0,
        monthlyTarget: parseFloat(monthlyTarget) || 0,
        yearlyTarget: parseFloat(yearlyTarget) || 0
      }
    }));
    triggerToast('Welcome to gryndset!', 'success');
  };

  const updateFinanceTargets = (budget, monthlyTarget, yearlyTarget) => {
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        budget: parseFloat(budget) || 0,
        monthlyTarget: parseFloat(monthlyTarget) || 0,
        yearlyTarget: parseFloat(yearlyTarget) || 0
      }
    }));
    triggerToast('Finance targets updated', 'success');
  };

  // Financial Accounts CRUD
  const addAccount = (name, initialBalance) => {
    if (!name.trim()) return;
    const newAcc = {
      id: 'acc-' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      initialBalance: parseFloat(initialBalance) || 0
    };
    setDb((prev) => ({
      ...prev,
      finance: {
        ...prev.finance,
        accounts: [...(prev.finance.accounts || []), newAcc]
      }
    }));
    triggerToast(`Account created: ${name}`, 'success');
  };

  const editAccount = (id, name, initialBalance) => {
    if (!name.trim()) return;
    setDb((prev) => {
      const updated = (prev.finance.accounts || []).map(acc => {
        if (acc.id === id) {
          return { ...acc, name: name.trim(), initialBalance: parseFloat(initialBalance) || 0 };
        }
        return acc;
      });
      return {
        ...prev,
        finance: { ...prev.finance, accounts: updated }
      };
    });
    triggerToast('Account updated', 'success');
  };

  const deleteAccount = (id, transferToId) => {
    setDb((prev) => {
      const updatedAccounts = (prev.finance.accounts || []).filter(acc => acc.id !== id);
      const updatedTransactions = (prev.finance.transactions || []).map(t => {
        if (t.accountId === id) {
          return { ...t, accountId: transferToId };
        }
        return t;
      });
      return {
        ...prev,
        finance: {
          ...prev.finance,
          accounts: updatedAccounts,
          transactions: updatedTransactions
        }
      };
    });
    triggerToast('Account deleted and transactions re-allocated', 'info');
  };

  // Dynamic Finance Category management
  const addFinanceCategory = (name, type) => {
    if (!name.trim()) return;
    setDb((prev) => {
      const cats = prev.finance.categories || [];
      if (cats.some(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.type === type)) {
        setTimeout(() => triggerToast('Category already exists', 'warning'), 100);
        return prev;
      }
      return {
        ...prev,
        finance: {
          ...prev.finance,
          categories: [...cats, { name: name.trim(), type }]
        }
      };
    });
    triggerToast(`Category added: ${name}`, 'success');
  };

  const deleteFinanceCategory = (name, type) => {
    setDb((prev) => {
      const cats = prev.finance.categories || [];
      return {
        ...prev,
        finance: {
          ...prev.finance,
          categories: cats.filter(c => !(c.name === name && c.type === type))
        }
      };
    });
    triggerToast(`Category removed: ${name}`, 'info');
  };

  // Projects Folders renaming/deleting
  const renameProject = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    setDb((prev) => {
      const projectsList = prev.projects.projectsList.map(p => p === oldName ? newName.trim() : p);
      const tasks = prev.projects.tasks.map(t => t.project === oldName ? { ...t, project: newName.trim() } : t);
      return {
        ...prev,
        projects: { ...prev.projects, projectsList, tasks }
      };
    });
    triggerToast(`Renamed project folder to ${newName}`, 'success');
  };

  const deleteProject = (name) => {
    if (name === 'General') {
      triggerToast('Cannot delete default General folder', 'warning');
      return;
    }
    setDb((prev) => {
      const projectsList = prev.projects.projectsList.filter(p => p !== name);
      const tasks = prev.projects.tasks.filter(t => t.project !== name);
      return {
        ...prev,
        projects: { ...prev.projects, projectsList, tasks }
      };
    });
    triggerToast(`Deleted folder and its tasks: ${name}`, 'info');
  };

  // Habits Categories CRUD
  const addHabitCategory = (name) => {
    if (!name.trim()) return;
    setDb((prev) => {
      const list = prev.habitCategories || [];
      if (list.includes(name.trim())) {
        setTimeout(() => triggerToast('Category already exists', 'warning'), 100);
        return prev;
      }
      return {
        ...prev,
        habitCategories: [...list, name.trim()]
      };
    });
    triggerToast(`Added habit category: ${name}`, 'success');
  };

  const renameHabitCategory = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    setDb((prev) => {
      const list = (prev.habitCategories || []).map(c => c === oldName ? newName.trim() : c);
      const habits = prev.habits.map(h => h.category === oldName ? { ...h, category: newName.trim() } : h);
      return {
        ...prev,
        habitCategories: list,
        habits
      };
    });
    triggerToast(`Renamed habit category to ${newName}`, 'success');
  };

  const deleteHabitCategory = (name) => {
    setDb((prev) => {
      const list = (prev.habitCategories || []).filter(c => c !== name);
      const fallback = list[0] || 'Routine';
      const habits = prev.habits.map(h => h.category === name ? { ...h, category: fallback } : h);
      return {
        ...prev,
        habitCategories: list,
        habits
      };
    });
    triggerToast(`Deleted habit category: ${name}`, 'info');
  };

  // Notes folders renaming/deleting
  const renameNotesFolder = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    setDb((prev) => {
      const notes = prev.notes.map(n => n.folder === oldName ? { ...n, folder: newName.trim() } : n);
      return { ...prev, notes };
    });
    triggerToast(`Renamed notes folder to ${newName}`, 'success');
  };

  const deleteNotesFolder = (name) => {
    setDb((prev) => {
      const notes = prev.notes.map(n => n.folder === name ? { ...n, folder: 'General' } : n);
      return { ...prev, notes };
    });
    triggerToast(`Deleted notes folder: ${name}`, 'info');
  };

  return (
    <OSContext.Provider
      value={{
        activeApp,
        setActiveApp,
        isSearchOpen,
        setIsSearchOpen,
        notifications,
        triggerToast,
        removeToast,
        db,
        updateScratchpad,
        filterMonth,
        setFilterMonth,
        filterYear,
        setFilterYear,
        // Settings & General
        updateSettings,
        completeOnboarding,
        // Finance
        setFinanceBudget,
        addTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        editTransaction,
        updateFinanceTargets,
        addSubscription,
        deleteSubscription,
        addFinanceCategory,
        deleteFinanceCategory,
        // Financial Accounts
        addAccount,
        editAccount,
        deleteAccount,
        // Projects
        addProject,
        addTask,
        updateTaskColumn,
        deleteTask,
        editTask,
        toggleSubtask,
        renameProject,
        deleteProject,
        // Habits
        addHabit,
        deleteHabit,
        toggleHabitDate,
        addHabitCategory,
        renameHabitCategory,
        deleteHabitCategory,
        // Notes
        addNote,
        updateNote,
        deleteNote,
        renameNotesFolder,
        deleteNotesFolder,
        // Investments
        addTrade,
        updateMarketPrice,
        deleteTrade,
        // Backups
        exportBackup,
        importBackup
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
