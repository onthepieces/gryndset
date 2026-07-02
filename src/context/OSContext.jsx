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
          { id: 'acc-cash', name: 'Cash', initialBalance: 0 }
        ],
        categories: [
          { name: 'General', type: 'expense', icon: 'wallet' },
          { name: 'Office', type: 'expense', icon: 'briefcase' },
          { name: 'Software', type: 'expense', icon: 'code' },
          { name: 'Infrastructure', type: 'expense', icon: 'server' },
          { name: 'Meals', type: 'expense', icon: 'coffee' },
          { name: 'Utilities', type: 'expense', icon: 'zap' },
          { name: 'Miscellaneous', type: 'expense', icon: 'help-circle' },
          { name: 'General', type: 'income', icon: 'credit-card' },
          { name: 'Salary', type: 'income', icon: 'dollar-sign' },
          { name: 'Consulting', type: 'income', icon: 'users' },
          { name: 'Invoicing', type: 'income', icon: 'file-text' }
        ]
      },
      projects: {
        projectsList: ['General'],
        tasks: []
      },
      habits: [],
      habitCategories: [
        { name: 'Health', icon: 'heart' },
        { name: 'Learning', icon: 'book-open' },
        { name: 'Work', icon: 'briefcase' },
        { name: 'Routine', icon: 'clock' }
      ],
      notes: [],
      invoices: [],
      invoiceDefaults: {
        billerName: '',
        billerEmail: '',
        billerStreet: '',
        billerCity: '',
        billerState: '',
        billerZip: '',
        billerCountry: '',
        defaultCurrency: '₹',
        defaultTaxRate: 0,
        defaultNotes: '',
        onboarded: false
      },
      clients: [],
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
        invoices: parsed.invoices || [],
        clients: parsed.clients || [],
        invoiceDefaults: {
          ...defaultData.invoiceDefaults,
          ...parsed.invoiceDefaults
        },
        finance: {
          ...defaultData.finance,
          ...parsed.finance,
          transactions: parsed.finance?.transactions || [],
          subscriptions: parsed.finance?.subscriptions || [],
          accounts: parsed.finance?.accounts || defaultData.finance.accounts,
          categories: (parsed.finance?.categories || defaultData.finance.categories).map(cat => {
            if (!cat.icon) {
              let icon = 'wallet';
              if (cat.type === 'income') icon = 'credit-card';
              if (cat.name === 'Office') icon = 'briefcase';
              if (cat.name === 'Salary') icon = 'dollar-sign';
              if (cat.name === 'Software') icon = 'code';
              if (cat.name === 'Infrastructure') icon = 'server';
              if (cat.name === 'Meals') icon = 'coffee';
              if (cat.name === 'Utilities') icon = 'zap';
              if (cat.name === 'Consulting') icon = 'users';
              if (cat.name === 'Invoicing') icon = 'file-text';
              if (cat.name === 'Miscellaneous') icon = 'help-circle';
              return { ...cat, icon };
            }
            // Fix legacy icons that need renaming
            if (cat.icon === 'smile' && cat.name === 'Miscellaneous') {
              return { ...cat, icon: 'help-circle' };
            }
            if (cat.icon === 'briefcase' && cat.name === 'Salary') {
              return { ...cat, icon: 'dollar-sign' };
            }
            return cat;
          })
        },
        projects: {
          ...defaultData.projects,
          ...parsed.projects,
          projectsList: parsed.projects?.projectsList || defaultData.projects.projectsList
        },
        habitCategories: (parsed.habitCategories || defaultData.habitCategories).map(cat => {
          if (typeof cat === 'string') {
            let icon = 'smile';
            if (cat === 'Health') icon = 'heart';
            if (cat === 'Learning') icon = 'book-open';
            if (cat === 'Work') icon = 'briefcase';
            if (cat === 'Routine') icon = 'clock';
            return { name: cat, icon };
          }
          return cat;
        })
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

  // Client CRM Actions
  const [invoiceDraftPreset, setInvoiceDraftPreset] = useState(null);

  const addClient = (client) => {
    const newClient = {
      ...client,
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    setDb((prev) => ({
      ...prev,
      clients: [newClient, ...(prev.clients || [])]
    }));
    triggerToast(`Client added: ${client.name}`, 'success');
    return newClient.id;
  };

  const updateClient = (id, updatedFields) => {
    setDb((prev) => {
      const updated = (prev.clients || []).map((c) => {
        if (c.id === id) {
          return { ...c, ...updatedFields };
        }
        return c;
      });
      return { ...prev, clients: updated };
    });
    triggerToast('Client profile updated', 'success');
  };

  const deleteClient = (id) => {
    setDb((prev) => ({
      ...prev,
      clients: (prev.clients || []).filter((c) => c.id !== id)
    }));
    triggerToast('Client removed', 'info');
  };

  const triggerInvoiceForClient = (client) => {
    setInvoiceDraftPreset({
      clientName: client.company ? `${client.name} (${client.company})` : client.name,
      clientEmail: client.email || '',
      clientStreet: client.address?.street || '',
      clientCity: client.address?.city || '',
      clientState: client.address?.state || '',
      clientZip: client.address?.zip || '',
      clientCountry: client.address?.country || '',
      clientPhone: client.phone || '',
      isReceipt: client.isReceipt || false
    });
    setActiveApp('invoices');
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

  const editSubscription = (id, updatedFields) => {
    setDb((prev) => {
      const updated = (prev.finance.subscriptions || []).map((sub) => {
        if (sub.id === id) {
          return { ...sub, ...updatedFields, amount: parseFloat(updatedFields.amount) || 0 };
        }
        return sub;
      });
      return {
        ...prev,
        finance: { ...prev.finance, subscriptions: updated }
      };
    });
    triggerToast('Subscription updated', 'success');
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
  const calculateStreak = (history, frequency, specificDays, weeklyCount) => {
    let currentStreak = 0;
    let tempDate = new Date();
    
    if (frequency === 'daily') {
      for (let i = 0; i < 365; i++) {
        const checkStr = tempDate.toISOString().split('T')[0];
        if (history[checkStr]) {
          currentStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
        } else {
          if (i === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const checkYesterdayStr = yesterday.toISOString().split('T')[0];
            if (history[checkYesterdayStr]) {
              tempDate.setDate(tempDate.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }
    } else if (frequency === 'days') {
      let consecutiveScheduled = 0;
      let dateToCheck = new Date();
      
      for (let i = 0; i < 365; i++) {
        const dayOfWeek = dateToCheck.getDay();
        const isScheduled = (specificDays || []).includes(dayOfWeek);
        
        if (isScheduled) {
          const checkStr = dateToCheck.toISOString().split('T')[0];
          if (history[checkStr]) {
            consecutiveScheduled++;
          } else {
            if (consecutiveScheduled === 0) {
              // Let it pass to check previous
            } else {
              break;
            }
          }
        }
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      }
      currentStreak = consecutiveScheduled;
    } else if (frequency === 'weekly') {
      let consecutiveWeeks = 0;
      let currentWeekStart = new Date();
      const day = currentWeekStart.getDay();
      const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
      currentWeekStart.setDate(diff);
      
      const targetCount = parseInt(weeklyCount) || 3;
      for (let w = 0; w < 52; w++) {
        let completionsInWeek = 0;
        for (let d = 0; d < 7; d++) {
          const checkDate = new Date(currentWeekStart);
          checkDate.setDate(checkDate.getDate() + d);
          const checkStr = checkDate.toISOString().split('T')[0];
          if (history[checkStr]) {
            completionsInWeek++;
          }
        }
        
        if (completionsInWeek >= targetCount) {
          consecutiveWeeks++;
        } else {
          if (w === 0) {
            const today = new Date();
            const todayDay = today.getDay();
            const daysRemaining = todayDay === 0 ? 0 : 7 - todayDay;
            if (completionsInWeek + daysRemaining >= targetCount) {
              currentWeekStart.setDate(currentWeekStart.getDate() - 7);
              continue;
            }
          }
          break;
        }
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      }
      currentStreak = consecutiveWeeks;
    }
    
    return currentStreak;
  };

  const addHabit = (name, category, frequency = 'daily', weeklyCount = 3, specificDays = []) => {
    if (!name.trim()) return;
    const newHabit = {
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      name,
      category,
      frequency,
      weeklyCount: parseInt(weeklyCount) || 3,
      specificDays: specificDays || [],
      streak: 0,
      history: {},
      archived: false,
      createdAt: new Date().toISOString().split('T')[0]
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

  const editHabit = (id, fields) => {
    setDb((prev) => {
      const updated = prev.habits.map((h) => {
        if (h.id === id) {
          const newHabit = { ...h, ...fields };
          newHabit.streak = calculateStreak(newHabit.history, newHabit.frequency, newHabit.specificDays, newHabit.weeklyCount);
          return newHabit;
        }
        return h;
      });
      return { ...prev, habits: updated };
    });
    triggerToast('Habit updated', 'success');
  };

  const toggleArchiveHabit = (id) => {
    setDb((prev) => {
      const updated = prev.habits.map((h) => {
        if (h.id === id) {
          const nextArchived = !h.archived;
          setTimeout(() => triggerToast(nextArchived ? 'Habit archived' : 'Habit restored', 'success'), 100);
          return { ...h, archived: nextArchived };
        }
        return h;
      });
      return { ...prev, habits: updated };
    });
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

          const currentStreak = calculateStreak(newHistory, habit.frequency, habit.specificDays, habit.weeklyCount);
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

  // Invoices updates
  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    setDb((prev) => ({
      ...prev,
      invoices: [newInvoice, ...(prev.invoices || [])]
    }));
    triggerToast(`Created invoice: ${invoice.invoiceNumber || 'Draft'}`, 'success');
    return newInvoice.id;
  };

  const updateInvoice = (id, updatedFields) => {
    setDb((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).map((inv) => 
        inv.id === id ? { ...inv, ...updatedFields } : inv
      )
    }));
  };

  const deleteInvoice = (id) => {
    setDb((prev) => ({
      ...prev,
      invoices: (prev.invoices || []).filter((inv) => inv.id !== id)
    }));
    triggerToast('Invoice deleted', 'info');
  };

  const updateInvoiceDefaults = (updatedFields) => {
    setDb((prev) => ({
      ...prev,
      invoiceDefaults: {
        ...(prev.invoiceDefaults || {}),
        ...updatedFields
      }
    }));
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
      if (data.finance && data.projects && data.habits && data.notes) {
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

  const completeOnboarding = (username, currency, budget, monthlyTarget, yearlyTarget, accountsList) => {
    const formattedAccounts = (accountsList && accountsList.length > 0)
      ? accountsList.map((acc, idx) => ({
          id: acc.id || `acc-${Math.random().toString(36).substring(2, 9)}`,
          name: acc.name || `Account ${idx + 1}`,
          initialBalance: parseFloat(acc.initialBalance) || 0
        }))
      : [
          { id: 'acc-cash', name: 'Cash', initialBalance: 0 }
        ];

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
        yearlyTarget: parseFloat(yearlyTarget) || 0,
        accounts: formattedAccounts
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
  const addHabitCategory = (name, icon = 'smile') => {
    if (!name.trim()) return;
    setDb((prev) => {
      const list = prev.habitCategories || [];
      if (list.some(c => (typeof c === 'string' ? c.toLowerCase() : c.name.toLowerCase()) === name.trim().toLowerCase())) {
        setTimeout(() => triggerToast('Category already exists', 'warning'), 100);
        return prev;
      }
      return {
        ...prev,
        habitCategories: [...list, { name: name.trim(), icon }]
      };
    });
    triggerToast(`Added habit category: ${name}`, 'success');
  };

  const renameHabitCategory = (oldName, newName, icon = 'smile') => {
    if (!newName.trim()) return;
    setDb((prev) => {
      const list = (prev.habitCategories || []).map(c => {
        const cName = typeof c === 'string' ? c : c.name;
        if (cName === oldName) {
          return { name: newName.trim(), icon };
        }
        return c;
      });
      const habits = prev.habits.map(h => h.category === oldName ? { ...h, category: newName.trim() } : h);
      return {
        ...prev,
        habitCategories: list,
        habits
      };
    });
    triggerToast(`Updated habit category: ${newName}`, 'success');
  };

  const deleteHabitCategory = (name) => {
    setDb((prev) => {
      const list = (prev.habitCategories || []).filter(c => {
        const cName = typeof c === 'string' ? c : c.name;
        return cName !== name;
      });
      const fallback = (list[0] && (typeof list[0] === 'string' ? list[0] : list[0].name)) || 'Routine';
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
        editSubscription,
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
        editHabit,
        toggleArchiveHabit,
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
        // Invoices
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateInvoiceDefaults,
        // CRM
        addClient,
        updateClient,
        deleteClient,
        invoiceDraftPreset,
        setInvoiceDraftPreset,
        triggerInvoiceForClient,
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
