import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Trash2, 
  Plus, 
  Lightbulb, 
  AlertTriangle,
  Target,
  Edit2,
  Calendar,
  X,
  Wallet,
  Coffee,
  Briefcase,
  Code,
  Server,
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
  Coins,
  ChevronDown
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

const getBrandDomain = (name) => {
  const cleanName = name.toLowerCase().trim();
  
  // Map common subscription names and synonyms to their official domains
  const brandKeywords = [
    { keywords: ['netflix'], domain: 'netflix.com' },
    { keywords: ['spotify'], domain: 'spotify.com' },
    { keywords: ['youtube', 'yt premium', 'yt music'], domain: 'youtube.com' },
    { keywords: ['github', 'gh copilot'], domain: 'github.com' },
    { keywords: ['chatgpt', 'openai', 'gpt-4', 'chat gpt'], domain: 'openai.com' },
    { keywords: ['adobe', 'creative cloud', 'photoshop', 'illustrator', 'premiere', 'adobe cc', 'cc'], domain: 'adobe.com' },
    { keywords: ['figma'], domain: 'figma.com' },
    { keywords: ['zoom'], domain: 'zoom.us' },
    { keywords: ['notion'], domain: 'notion.so' },
    { keywords: ['slack'], domain: 'slack.com' },
    { keywords: ['google', 'gsuite', 'g-suite', 'gcp', 'youtube premium', 'youtube music', 'gmail', 'drive'], domain: 'google.com' },
    { keywords: ['apple', 'icloud', 'apple music', 'apple tv', 'arcade', 'one'], domain: 'apple.com' },
    { keywords: ['microsoft', 'office 365', 'm365', 'outlook', 'azure', 'ms office', 'onedrive'], domain: 'microsoft.com' },
    { keywords: ['amazon', 'prime', 'aws', 'audible', 'kindle'], domain: 'amazon.com' },
    { keywords: ['disney'], domain: 'disneyplus.com' },
    { keywords: ['hulu'], domain: 'hulu.com' },
    { keywords: ['hbo', 'max'], domain: 'hbomax.com' },
    { keywords: ['canva'], domain: 'canva.com' },
    { keywords: ['vercel'], domain: 'vercel.com' },
    { keywords: ['netlify'], domain: 'netlify.com' },
    { keywords: ['heroku'], domain: 'heroku.com' },
    { keywords: ['digitalocean', 'digital ocean'], domain: 'digitalocean.com' },
    { keywords: ['dropbox'], domain: 'dropbox.com' },
    { keywords: ['linkedin', 'sales navigator'], domain: 'linkedin.com' },
    { keywords: ['cursor'], domain: 'cursor.sh' },
    { keywords: ['midjourney'], domain: 'midjourney.com' },
    { keywords: ['linear'], domain: 'linear.app' },
    { keywords: ['loom'], domain: 'loom.com' },
    { keywords: ['stripe'], domain: 'stripe.com' },
    { keywords: ['shopify'], domain: 'shopify.com' },
    { keywords: ['cloudflare'], domain: 'cloudflare.com' },
    { keywords: ['playstation', 'ps plus', 'psn', 'ps5'], domain: 'playstation.com' },
    { keywords: ['xbox', 'game pass', 'gamepass'], domain: 'xbox.com' },
    { keywords: ['nintendo', 'switch online'], domain: 'nintendo.com' },
    { keywords: ['steam'], domain: 'steampowered.com' }
  ];

  const matchedBrand = brandKeywords.find(brand => {
    return brand.keywords.some(keyword => {
      if (keyword.length <= 3) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(cleanName);
      }
      return cleanName.includes(keyword);
    });
  });
  
  return matchedBrand ? matchedBrand.domain : null;
};

const getAccountDomain = (name) => {
  const cleanName = name.toLowerCase().trim();
  
  if (cleanName.includes('cash')) {
    return 'local:cash';
  }

  const brandKeywords = [
    // Indian Banks (Matched first so bank logos take precedence over card networks)
    { keywords: ['hdfc'], domain: 'hdfcbank.com' },
    { keywords: ['icici'], domain: 'icicibank.com' },
    { keywords: ['sbi', 'state bank of india', 'state bank'], domain: 'sbi.co.in' },
    { keywords: ['kotak'], domain: 'kotak.com' },
    { keywords: ['axis'], domain: 'axisbank.com' },
    { keywords: ['bank of baroda', 'baroda', 'bob'], domain: 'bankofbaroda.in' },
    { keywords: ['pnb', 'punjab national'], domain: 'pnbindia.in' },
    { keywords: ['yes bank', 'yesbank'], domain: 'yesbank.in' },
    { keywords: ['idfc'], domain: 'idfcfirstbank.com' },
    { keywords: ['indusind'], domain: 'indusind.com' },
    { keywords: ['canara'], domain: 'canarabank.com' },
    { keywords: ['union bank'], domain: 'unionbankofindia.co.in' },
    { keywords: ['federal bank'], domain: 'federalbank.co.in' },
    { keywords: ['bandhan'], domain: 'bandhanbank.com' },

    // Global Banks
    { keywords: ['chase'], domain: 'chase.com' },
    { keywords: ['wells fargo', 'wellsfargo'], domain: 'wellsfargo.com' },
    { keywords: ['bank of america', 'boa', 'bankofamerica'], domain: 'bankofamerica.com' },
    { keywords: ['citi', 'citibank'], domain: 'citi.com' },
    { keywords: ['hsbc'], domain: 'hsbc.com' },
    { keywords: ['barclays'], domain: 'barclays.co.uk' },
    { keywords: ['revolut'], domain: 'revolut.com' },
    { keywords: ['paypal', 'pay pal'], domain: 'paypal.com' },
    { keywords: ['capital one', 'capitalone'], domain: 'capitalone.com' },
    { keywords: ['fidelity'], domain: 'fidelity.com' },
    { keywords: ['schwab'], domain: 'schwab.com' },
    { keywords: ['monzo'], domain: 'monzo.com' },
    { keywords: ['n26'], domain: 'n26.com' },

    // Card Networks & Payment Providers (Matched last)
    { keywords: ['visa'], domain: 'visa.com' },
    { keywords: ['mastercard', 'master card'], domain: 'mastercard.com' },
    { keywords: ['amex', 'american express'], domain: 'americanexpress.com' },
    { keywords: ['discover'], domain: 'discover.com' },
    { keywords: ['apple card', 'apple pay', 'applepay'], domain: 'apple.com' },
    { keywords: ['google pay', 'gpay'], domain: 'google.com' }
  ];

  const matchedBrand = brandKeywords.find(brand => {
    return brand.keywords.some(keyword => {
      // Bypass word boundary for 'sbi' because it is highly specific and rare as a substring
      if (keyword.length <= 3 && keyword !== 'sbi') {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(cleanName);
      }
      return cleanName.includes(keyword);
    });
  });
  
  return matchedBrand ? matchedBrand.domain : null;
};

const SmartLogo = ({ domain, alt, onError }) => {
  const [retryStage, setRetryStage] = useState(0); // 0: Clearbit, 1: Google, 2: DuckDuckGo

  const srcMap = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];

  const handleError = () => {
    if (retryStage < srcMap.length - 1) {
      setRetryStage(prev => prev + 1);
    } else {
      onError();
    }
  };

  return (
    <img 
      src={srcMap[retryStage]} 
      alt={alt} 
      style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'contain' }}
      onError={handleError}
    />
  );
};

const SubscriptionItem = ({ sub, currency, formatAmount, deleteSubscription, handleStartEditSub }) => {
  const [imgError, setImgError] = useState(false);
  const domain = imgError ? null : getBrandDomain(sub.name);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {domain ? (
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0 }}>
            <SmartLogo domain={domain} alt={sub.name} onError={() => setImgError(true)} />
          </div>
        ) : (
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
            {sub.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ color: 'var(--text-pure)' }}>{sub.name}</strong>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
            Renews on the {sub.renewalDay}th ({sub.category})
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {currency}{formatAmount(sub.amount)}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => handleStartEditSub(sub)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            className="glass-btn-icon"
            title="Edit Subscription"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={() => deleteSubscription(sub.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            className="glass-btn-icon"
            title="Cancel Subscription tracking"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountSummaryItem = ({ acc, bal, currency, formatAmount }) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 12px', 
        borderRadius: '8px', 
        background: 'rgba(255,255,255,0.01)', 
        border: '1px solid var(--border-subtle)',
        fontSize: '13px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AccountLogo name={acc.name} />
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{acc.name}</span>
      </div>
      <span className="font-mono" style={{ 
        fontWeight: 600, 
        color: bal >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
      }}>
        {bal < 0 ? '-' : ''}{currency}{formatAmount(Math.abs(bal))}
      </span>
    </div>
  );
};

const ManageAccountItem = ({ acc, bal, currency, formatAmount, onEdit, onDelete }) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 12px', 
        borderRadius: '8px', 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid var(--border-subtle)', 
        fontSize: '12px' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AccountLogo name={acc.name} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ color: 'var(--text-pure)', fontSize: '13px' }}>{acc.name}</strong>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            <span>Initial: <span className="font-mono">{currency}{formatAmount(acc.initialBalance)}</span></span>
            <span>•</span>
            <span>Current: <span className="font-mono" style={{ color: bal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{bal < 0 ? '-' : ''}{currency}{formatAmount(Math.abs(bal))}</span></span>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '6px' }}>
        <button 
          type="button"
          onClick={onEdit}
          className="glass-btn-icon"
          style={{ color: 'var(--text-muted)' }}
          title="Edit Account"
        >
          <Edit2 size={12} />
        </button>
        <button 
          type="button"
          onClick={onDelete}
          className="glass-btn-icon"
          style={{ color: 'var(--text-muted)' }}
          title="Delete Account"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

const AccountLogo = ({ name }) => {
  const [imgError, setImgError] = useState(false);
  const domain = imgError ? null : getAccountDomain(name);

  if (domain === 'local:cash') {
    return (
      <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)', color: '#34d399', flexShrink: 0 }}>
        <Coins size={10} />
      </div>
    );
  }

  if (domain) {
    return (
      <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0 }}>
        <SmartLogo domain={domain} alt={name} onError={() => setImgError(true)} />
      </div>
    );
  }

  return (
    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
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

export default function FinanceApp() {
  const { 
    db, 
    addTransaction, 
    deleteTransaction, 
    toggleTransactionStatus,
    editTransaction,
    addSubscription,
    editSubscription,
    deleteSubscription,
    filterMonth,
    filterYear,
    addFinanceCategory,
    deleteFinanceCategory,
    addAccount,
    editAccount,
    deleteAccount,
    triggerToast
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
  const formatAmount = (val, decimals = 2) => {
    return (parseFloat(val) || 0).toLocaleString(getLocale(currency), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  const datePrefix = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;

  const accounts = db.finance.accounts || [];

  const dbCategories = db.finance.categories || [];
  const incomeCategories = dbCategories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = dbCategories.filter(c => c.type === 'expense').map(c => c.name);

  // Calculate account balances dynamically
  const calculateAccountBalances = () => {
    const balanceMap = {};
    accounts.forEach(acc => {
      balanceMap[acc.id] = acc.initialBalance;
    });

    const allTx = db.finance.transactions || [];
    allTx.forEach(t => {
      const accId = t.accountId || 'acc-bank';
      if (!(accId in balanceMap)) {
        balanceMap[accId] = 0;
      }
      if (t.type === 'income' && t.status === 'received') {
        balanceMap[accId] += t.amount;
      } else if (t.type === 'expense' && t.status === 'paid') {
        balanceMap[accId] -= t.amount;
      }
    });

    return balanceMap;
  };
  const accountBalances = calculateAccountBalances();

  // Get category icon helper
  const getFinanceCatIcon = (catName, type) => {
    const cat = dbCategories.find(c => c.name === catName && c.type === type);
    if (cat && cat.icon && FINANCE_ICON_MAP[cat.icon]) {
      return FINANCE_ICON_MAP[cat.icon];
    }
    return type === 'income' ? <CreditCard size={14} /> : <Wallet size={14} />;
  };

  // 1. Transaction Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState('expense');
  const [status, setStatus] = useState('paid');
  const [txDate, setTxDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('wallet');

  React.useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  React.useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === filterYear && (today.getMonth() + 1) === filterMonth) {
      setTxDate(today.toISOString().split('T')[0]);
    } else {
      setTxDate(`${filterYear}-${String(filterMonth).padStart(2, '0')}-01`);
    }
  }, [filterMonth, filterYear]);

  const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

  // 2. Transaction Editing Modal State
  const [editingTx, setEditingTx] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCat, setEditCat] = useState('General');
  const [editType, setEditType] = useState('expense');
  const [editStatus, setEditStatus] = useState('paid');
  const [editDate, setEditDate] = useState('');
  const [editAccountId, setEditAccountId] = useState('');

  const editAvailableCategories = editType === 'income' ? incomeCategories : expenseCategories;

  // 4. Accounts Management Modal State
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);
  const [editingAccountItem, setEditingAccountItem] = useState(null);
  const [accName, setAccName] = useState('');
  const [accInitial, setAccInitial] = useState('');
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [transferAccountId, setTransferAccountId] = useState('');

  // 3. Subscription Form State
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCategory, setSubCategory] = useState('Software');
  const [subRenewalDay, setSubRenewalDay] = useState('1');

  // Subscription Editing State
  const [editingSub, setEditingSub] = useState(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubAmount, setEditSubAmount] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('Software');
  const [editSubRenewalDay, setEditSubRenewalDay] = useState('1');

  // Add Category Type State
  const [newCatType, setNewCatType] = useState('expense');

  const transactions = db.finance.transactions || [];
  const subscriptions = db.finance.subscriptions || [];

  // Filter transactions by selected month & year
  const filteredTransactions = transactions.filter(t => t.date.startsWith(datePrefix));
  
  // 4. Math calculations (computed on filtered transactions)
  const income = filteredTransactions
    .filter(t => t.type === 'income' && t.status === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDues = filteredTransactions
    .filter(t => t.status === 'due')
    .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : -t.amount), 0);

  const netBalance = income - expenses;

  // Retrieve targets from database settings
  const isINR = currency === '₹';
  const monthlyBudget = db.finance.budget || (isINR ? 50000 : 2000);
  const monthlyTarget = db.finance.monthlyTarget || (isINR ? 15000 : 1500);
  const yearlyTarget = db.finance.yearlyTarget || (isINR ? 200000 : 18000);

  // Percentages progress
  const budgetProgress = (expenses / monthlyBudget) * 100;
  const monthlyTargetProgress = monthlyTarget > 0 ? (netBalance / monthlyTarget) * 100 : 0;

  // Calculate annual metrics based on full year
  const yearlyTransactions = transactions.filter(t => t.date.startsWith(String(filterYear)));
  const yearlyIncome = yearlyTransactions
    .filter(t => t.type === 'income' && t.status === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
  const yearlyExpenses = yearlyTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const yearlyNetBalance = yearlyIncome - yearlyExpenses;
  const annualProgress = yearlyTarget > 0 ? (yearlyNetBalance / yearlyTarget) * 100 : 0;

  // Total subscription costs
  const totalSubCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  // Category breakdown for expenses
  const categoryExpenses = {};
  filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  Object.keys(categoryExpenses).forEach(cat => {
    if (categoryExpenses[cat] > topCategoryAmount) {
      topCategoryAmount = categoryExpenses[cat];
      topCategoryName = cat;
    }
  });

  const topCategoryPercent = expenses > 0 ? ((topCategoryAmount / expenses) * 100).toFixed(0) : 0;

  // Form Submissions
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Determine initial status based on type
    let finalStatus = status;
    if (type === 'income' && status === 'paid') finalStatus = 'received';
    if (type === 'expense' && status === 'received') finalStatus = 'paid';

    addTransaction({
      date: txDate || new Date().toISOString().split('T')[0],
      description: description.trim(),
      category,
      amount: parsedAmount,
      type,
      status: finalStatus,
      accountId: accountId || (accounts[0]?.id || 'acc-bank')
    });

    setDescription('');
    setAmount('');
    const firstCat = (db.finance.categories || []).find(c => c.type === type)?.name || 'General';
    setCategory(firstCat);
  };

  const handleStartEdit = (t) => {
    setEditingTx(t);
    setEditDesc(t.description);
    setEditAmount(t.amount.toString());
    setEditCat(t.category);
    setEditType(t.type);
    setEditStatus(t.status);
    setEditDate(t.date || new Date().toISOString().split('T')[0]);
    setEditAccountId(t.accountId || 'acc-bank');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editDesc.trim() || !editAmount || !editingTx) return;
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Correct status mismatch on type change
    let finalStatus = editStatus;
    if (editType === 'income' && editStatus === 'paid') finalStatus = 'received';
    if (editType === 'expense' && editStatus === 'received') finalStatus = 'paid';

    editTransaction(editingTx.id, {
      date: editDate,
      description: editDesc.trim(),
      amount: parsedAmount,
      category: editCat,
      type: editType,
      status: finalStatus,
      accountId: editAccountId
    });

    setEditingTx(null);
  };

  const handleAddSub = (e) => {
    e.preventDefault();
    if (!subName.trim() || !subAmount) return;

    const parsedAmount = parseFloat(subAmount);
    const parsedDay = parseInt(subRenewalDay);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) return;

    addSubscription({
      name: subName.trim(),
      amount: parsedAmount,
      category: subCategory,
      renewalDay: parsedDay
    });

    setSubName('');
    setSubAmount('');
    setSubRenewalDay('1');
    setIsAddingSub(false);
  };

  const handleStartEditSub = (sub) => {
    setEditingSub(sub);
    setEditSubName(sub.name);
    setEditSubAmount(sub.amount.toString());
    setEditSubCategory(sub.category || 'Software');
    setEditSubRenewalDay(sub.renewalDay.toString());
  };

  const handleSaveEditSub = (e) => {
    e.preventDefault();
    if (!editSubName.trim() || !editSubAmount || !editingSub) return;
    
    const parsedAmount = parseFloat(editSubAmount);
    const parsedDay = parseInt(editSubRenewalDay);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) return;

    editSubscription(editingSub.id, {
      name: editSubName.trim(),
      amount: parsedAmount,
      category: editSubCategory,
      renewalDay: parsedDay
    });

    setEditingSub(null);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!accName.trim()) return;
    const initial = parseFloat(accInitial) || 0;
    addAccount(accName.trim(), initial);
    setAccName('');
    setAccInitial('');
  };

  const handleStartEditAccount = (acc) => {
    setEditingAccountItem(acc);
    setAccName(acc.name);
    setAccInitial(acc.initialBalance.toString());
  };

  const handleSaveEditAccount = (e) => {
    e.preventDefault();
    if (!editingAccountItem || !accName.trim()) return;
    const initial = parseFloat(accInitial) || 0;
    editAccount(editingAccountItem.id, accName.trim(), initial);
    setEditingAccountItem(null);
    setAccName('');
    setAccInitial('');
  };

  const handleCancelEditAccount = () => {
    setEditingAccountItem(null);
    setAccName('');
    setAccInitial('');
  };

  const handleStartDeleteAccount = (acc) => {
    if (accounts.length <= 1) {
      triggerToast('Cannot delete the only remaining account. At least one account must exist.', 'warning');
      return;
    }
    setAccountToDelete(acc);
    const eligibleAccounts = accounts.filter(a => a.id !== acc.id);
    if (eligibleAccounts.length > 0) {
      setTransferAccountId(eligibleAccounts[0].id);
    } else {
      setTransferAccountId('');
    }
  };

  // Dynamic categories list is loaded from global OS context

  return (
    <div className="finance-layout">
      
      {/* Left Column: Stats, Add Form, Ledger */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Stats Grid */}
        <div className="finance-stats">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <TrendingUp size={14} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Income Received</span>
            </div>
            <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)' }}>
              +{currency}{formatAmount(income)}
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <TrendingDown size={14} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paid Expenses</span>
            </div>
            <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
              -{currency}{formatAmount(expenses)}
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Clock size={14} />
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding Dues</span>
            </div>
            <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: pendingDues > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
              {pendingDues < 0 ? '-' : ''}{currency}{formatAmount(Math.abs(pendingDues))}
            </div>
          </div>
        </div>

        {/* Row: Financial Insights & Subscriptions side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Smart Advisor Insights Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Lightbulb size={16} style={{ color: 'var(--color-warning)' }} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Insights</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Condition 1: Deficit Warning */}
              {netBalance < 0 && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--color-danger-bg)', 
                  border: '1px solid var(--color-danger-border)',
                  display: 'flex',
                  gap: '8px',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontWeight: 600, fontSize: '12px' }}>
                    <AlertTriangle size={14} />
                    <span>Deficit Warning</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    Your paid expenses exceed income by <strong className="font-mono">{currency}{formatAmount(Math.abs(netBalance))}</strong>. Pause discretionary purchases and review upcoming unpaid dues to restore balance.
                  </p>
                </div>
              )}

              {/* Condition 2: Surplus Advice */}
              {netBalance > 0 && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--color-success-bg)', 
                  border: '1px solid var(--color-success-border)',
                  display: 'flex',
                  gap: '8px',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '12px' }}>
                    <TrendingUp size={14} />
                    <span>Surplus Opportunity</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    Great work! You have a surplus of <strong className="font-mono">{currency}{formatAmount(netBalance)}</strong>. We recommend allocating <strong className="font-mono">{currency}{formatAmount(netBalance * 0.5)} (50%)</strong> to savings to build compounding assets.
                  </p>
                </div>
              )}

              {/* Top Category Spending Alert */}
              {topCategoryAmount > 0 && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '6px',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Spending Sector Alert
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    Your highest expense category is <strong>{topCategoryName}</strong> at <strong className="font-mono">{currency}{formatAmount(topCategoryAmount)}</strong> ({topCategoryPercent}% of total spends). Consider trimming subscription lines or consulting audits.
                  </p>
                </div>
              )}

              {/* Budget limit alert */}
              {expenses > monthlyBudget && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--color-danger-bg)', 
                  border: '1px solid var(--color-danger-border)',
                  display: 'flex',
                  gap: '6px',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-danger)', textTransform: 'uppercase' }}>
                    Limit Exceeded
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    You have exceeded your monthly budget cap of <strong className="font-mono">{currency}{formatAmount(monthlyBudget, 0)}</strong> by <strong className="font-mono">{currency}{formatAmount(expenses - monthlyBudget)}</strong>. Restrict non-essential expenses immediately.
                  </p>
                </div>
              )}

              {/* General Advice */}
              {transactions.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                  Log transactions to generate customized spending analysis and insights.
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Calendar size={15} />
                <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscriptions</h3>
              </div>
              <button 
                onClick={() => setIsAddingSub(!isAddingSub)} 
                className="glass-btn" 
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                {isAddingSub ? 'Cancel' : 'Add'}
              </button>
            </div>

            {/* Add Subscription Dropdown Form */}
            {isAddingSub && (
              <form onSubmit={handleAddSub} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sub Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix"
                    className="glass-input"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    style={{ padding: '6px 8px', fontSize: '12px' }}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cost ({currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                      className="glass-input font-mono"
                      value={subAmount}
                      onChange={(e) => setSubAmount(e.target.value)}
                      style={{ padding: '6px 8px', fontSize: '12px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Renewal Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      className="glass-input font-mono"
                      value={subRenewalDay}
                      onChange={(e) => setSubRenewalDay(e.target.value)}
                      style={{ padding: '6px 8px', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                  <GlassSelect
                    value={subCategory}
                    onChange={setSubCategory}
                    options={expenseCategories.map(cat => ({
                      value: cat,
                      label: cat,
                      icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{getFinanceCatIcon(cat, 'expense')}</span>
                    }))}
                  />
                </div>
                <button type="submit" className="glass-btn" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
                  Save Subscription
                </button>
              </form>
            )}

            {/* Subscriptions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {subscriptions.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  No active subscriptions.
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <SubscriptionItem
                    key={sub.id}
                    sub={sub}
                    currency={currency}
                    formatAmount={formatAmount}
                    deleteSubscription={deleteSubscription}
                    handleStartEditSub={handleStartEditSub}
                  />
                ))
              )}
            </div>

            {subscriptions.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Total Commits:</span>
                <strong className="font-mono" style={{ color: 'var(--text-pure)' }}>
                  {currency}{formatAmount(totalSubCost)}/mo
                </strong>
              </div>
            )}
          </div>

        </div>

        {/* Ledger Table */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            Transaction Ledger
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px 12px' }}>Date</th>
                  <th style={{ padding: '8px 12px 12px' }}>Description</th>
                  <th style={{ padding: '8px 12px 12px' }}>Category</th>
                  <th style={{ padding: '8px 12px 12px' }}>Account</th>
                  <th style={{ padding: '8px 12px 12px' }}>Type</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No transactions found. Log one below.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr 
                      key={t.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)', 
                        fontSize: '13px',
                        color: t.status === 'due' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <td className="font-mono" style={{ padding: '12px' }}>{t.date}</td>
                      <td style={{ padding: '12px', fontWeight: 500, color: t.status === 'due' ? 'var(--text-pure)' : 'inherit' }}>{t.description}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.04)', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {getFinanceCatIcon(t.category, t.type)}
                          {t.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          background: 'rgba(255, 255, 255, 0.04)', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          {accounts.find(a => a.id === t.accountId)?.name || 'Bank Account'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{t.type}</td>
                      <td className="font-mono" style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        fontWeight: 600,
                        color: t.type === 'income' ? 'var(--color-success)' : 'var(--text-primary)'
                      }}>
                        {t.type === 'income' ? '+' : '-'}{currency}{formatAmount(t.amount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleTransactionStatus(t.id)}
                          className={`status-pill ${t.type === 'income' ? (t.status === 'due' ? 'info' : 'success') : (t.status === 'paid' ? 'danger' : 'warning')}`}
                          style={{ border: '1px solid transparent', cursor: 'pointer', outline: 'none' }}
                          title="Click to toggle status"
                        >
                          {t.status}
                        </button>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleStartEdit(t)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            className="glass-btn-icon"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            className="glass-btn-icon"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Log Transaction</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account</label>
              <GlassSelect
                value={accountId || (accounts[0]?.id || 'acc-bank')}
                onChange={setAccountId}
                options={accounts.map(acc => ({
                  value: acc.id,
                  label: acc.name,
                  icon: <AccountLogo name={acc.name} />,
                  extra: (
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {((accountBalances[acc.id] || 0) < 0 ? '-' : '') + currency + formatAmount(Math.abs(accountBalances[acc.id] || 0))}
                    </span>
                  )
                }))}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type & Status</label>
              <GlassSelect
                value={`${type}-${status}`}
                onChange={(val) => {
                  const [newType, newStatus] = val.split('-');
                  setType(newType);
                  setStatus(newStatus);
                  const firstCat = (db.finance.categories || []).find(c => c.type === newType)?.name || 'General';
                  setCategory(firstCat);
                }}
                options={[
                  { value: 'expense-paid', label: 'Expense (Paid)', icon: <TrendingDown size={12} style={{ color: 'var(--text-primary)' }} /> },
                  { value: 'expense-due', label: 'Expense (Due)', icon: <Clock size={12} style={{ color: 'var(--color-warning)' }} /> },
                  { value: 'income-received', label: 'Income (Received)', icon: <TrendingUp size={12} style={{ color: 'var(--color-success)' }} /> },
                  { value: 'income-due', label: 'Income (Due)', icon: <Clock size={12} style={{ color: 'var(--color-warning)' }} /> }
                ]}
              />
            </div>
            <button type="submit" className="glass-btn" style={{ height: '40px', padding: '0 20px' }}>
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Financial Targets, Subscriptions, insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Accounts Summary Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Wallet size={15} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accounts Summary</h3>
            </div>
            <button 
              onClick={() => setIsManageAccountsOpen(true)} 
              className="glass-btn" 
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {accounts.map(acc => {
              const bal = accountBalances[acc.id] || 0;
              return (
                <AccountSummaryItem 
                  key={acc.id}
                  acc={acc}
                  bal={bal}
                  currency={currency}
                  formatAmount={formatAmount}
                />
              );
            })}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              borderTop: '1px solid var(--border-subtle)', 
              paddingTop: '12px', 
              marginTop: '6px',
              fontSize: '13px', 
              color: 'var(--text-secondary)' 
            }}>
              <span>Net Balance:</span>
              <strong className="font-mono" style={{ 
                color: Object.values(accountBalances).reduce((sum, b) => sum + b, 0) >= 0 ? 'var(--text-pure)' : 'var(--color-danger)' 
              }}>
                {Object.values(accountBalances).reduce((sum, b) => sum + b, 0) < 0 ? '-' : ''}
                {currency}
                {formatAmount(Math.abs(Object.values(accountBalances).reduce((sum, b) => sum + b, 0)))}
              </strong>
            </div>
          </div>
        </div>

        {/* Targets & Goals Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Target size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Goal Objectives
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Monthly Budget */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Budget Cap</span>
                <span className="font-mono" style={{ color: 'var(--text-pure)' }}>
                  {currency}{formatAmount(expenses, 0)} / {currency}{formatAmount(monthlyBudget, 0)}
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(budgetProgress, 100)}%`, 
                  height: '100%', 
                  background: budgetProgress > 100 ? 'var(--color-danger)' : 'var(--text-pure)', 
                  borderRadius: '3px',
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Budget utilized</span>
                <span>{budgetProgress.toFixed(0)}%</span>
              </div>
            </div>

            {/* Monthly Target */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Savings Target</span>
                <span className="font-mono" style={{ color: 'var(--text-pure)' }}>
                  {currency}{formatAmount(netBalance, 0)} / {currency}{formatAmount(monthlyTarget, 0)}
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(0, Math.min(monthlyTargetProgress, 100))}%`, 
                  height: '100%', 
                  background: 'var(--color-success)', 
                  borderRadius: '3px',
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Target progress</span>
                <span>{monthlyTargetProgress.toFixed(0)}%</span>
              </div>
            </div>

            {/* Yearly Target */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Yearly Savings Target</span>
                <span className="font-mono" style={{ color: 'var(--text-pure)' }}>
                  {currency}{formatAmount(yearlyNetBalance, 0)} / {currency}{formatAmount(yearlyTarget, 0)}
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(0, Math.min(annualProgress, 100))}%`, 
                  height: '100%', 
                  background: 'rgba(255, 255, 255, 0.4)', 
                  borderRadius: '3px',
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Yearly progress</span>
                <span>{annualProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>



        {/* Ledger Categories Management */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Edit2 size={15} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ledger Categories</h3>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            const nameInput = e.target.elements.catName;
            const typeInput = e.target.elements.catType;
            if (nameInput.value.trim()) {
              addFinanceCategory(nameInput.value.trim(), typeInput.value, newCatIcon);
              nameInput.value = '';
              setNewCatIcon(typeInput.value === 'income' ? 'credit-card' : 'wallet');
            }
          }} style={{ display: 'flex', gap: '8px', flexDirection: 'column', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                name="catName"
                placeholder="Category Name..."
                className="glass-input"
                style={{ padding: '6px 8px', fontSize: '12px', flexGrow: 1, height: '38px' }}
                required
              />
              <GlassSelect
                value={newCatType}
                onChange={(val) => {
                  setNewCatType(val);
                  setNewCatIcon(val === 'income' ? 'credit-card' : 'wallet');
                }}
                options={[
                  { value: 'expense', label: 'Expense', icon: <TrendingDown size={12} /> },
                  { value: 'income', label: 'Income', icon: <TrendingUp size={12} /> }
                ]}
                style={{ width: '110px' }}
              />
            </div>
            
            {/* Icon Selector Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Select Icon</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {Object.keys(FINANCE_ICON_MAP).map(iconKey => (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => setNewCatIcon(iconKey)}
                    className={`glass-btn-icon ${newCatIcon === iconKey ? 'active' : ''}`}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: newCatIcon === iconKey ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                    title={iconKey}
                  >
                    {React.cloneElement(FINANCE_ICON_MAP[iconKey], { size: 11 })}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="glass-btn" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
              Add Category
            </button>
          </form>

          {/* Categories Lists */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '180px', overflowY: 'auto', fontSize: '12px' }}>
            {/* Income Categories */}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px' }}>Income</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {db.finance.categories?.filter(c => c.type === 'income').map(c => (
                  <div key={`inc-${c.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>{getFinanceCatIcon(c.name, 'income')}</span>
                      <span>{c.name}</span>
                    </div>
                    {c.name !== 'General' && (
                      <button 
                        type="button"
                        onClick={() => deleteFinanceCategory(c.name, 'income')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px' }}>Expense</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {db.finance.categories?.filter(c => c.type === 'expense').map(c => (
                  <div key={`exp-${c.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>{getFinanceCatIcon(c.name, 'expense')}</span>
                      <span>{c.name}</span>
                    </div>
                    {c.name !== 'General' && (
                      <button 
                        type="button"
                        onClick={() => deleteFinanceCategory(c.name, 'expense')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>



      {/* Edit Transaction Modal Overlay */}
      {editingTx && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 0 }} onClick={() => setEditingTx(null)}>
          <div className="glass-panel" style={{ width: '420px', maxWidth: '90%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>Edit Transaction Ledger</h3>
              <button onClick={() => setEditingTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Description</label>
                <input
                  type="text"
                  className="glass-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="glass-input font-mono"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</label>
                  <input
                    type="date"
                    className="glass-input font-mono"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                <GlassSelect
                  value={editCat}
                  onChange={setEditCat}
                  options={editAvailableCategories.map(cat => ({
                    value: cat,
                    label: cat,
                    icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{getFinanceCatIcon(cat, editType)}</span>
                  }))}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account</label>
                <GlassSelect
                  value={editAccountId}
                  onChange={setEditAccountId}
                  options={accounts.map(acc => ({
                    value: acc.id,
                    label: acc.name,
                    icon: <AccountLogo name={acc.name} />,
                    extra: (
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {((accountBalances[acc.id] || 0) < 0 ? '-' : '') + currency + formatAmount(Math.abs(accountBalances[acc.id] || 0))}
                      </span>
                    )
                  }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Type</label>
                  <GlassSelect
                    value={editType}
                    onChange={(val) => {
                      setEditType(val);
                      const firstCat = (db.finance.categories || []).find(c => c.type === val)?.name || 'General';
                      setEditCat(firstCat);
                      setEditStatus(val === 'income' ? 'received' : 'paid');
                    }}
                    options={[
                      { value: 'expense', label: 'Expense', icon: <TrendingDown size={12} /> },
                      { value: 'income', label: 'Income', icon: <TrendingUp size={12} /> }
                    ]}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                  <GlassSelect
                    value={editStatus}
                    onChange={setEditStatus}
                    options={editType === 'expense' ? [
                      { value: 'paid', label: 'Paid', icon: <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} /> },
                      { value: 'due', label: 'Due', icon: <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)' }} /> }
                    ] : [
                      { value: 'received', label: 'Received', icon: <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} /> },
                      { value: 'due', label: 'Due', icon: <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)' }} /> }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="glass-btn" style={{ flexGrow: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingTx(null)} className="glass-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Accounts Modal Overlay */}
      {isManageAccountsOpen && (
        <div 
          className="cmd-overlay" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 0 }} 
          onClick={() => {
            setIsManageAccountsOpen(false);
            setEditingAccountItem(null);
            setAccountToDelete(null);
            setAccName('');
            setAccInitial('');
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '500px', 
              maxWidth: '90%', 
              borderRadius: '14px', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              boxShadow: 'var(--glass-shadow)',
              maxHeight: '85vh',
              overflowY: 'auto'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Manage Accounts</h3>
              <button 
                onClick={() => {
                  setIsManageAccountsOpen(false);
                  setEditingAccountItem(null);
                  setAccountToDelete(null);
                  setAccName('');
                  setAccInitial('');
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {accountToDelete ? (
              /* Delete Safety Guard view */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--color-danger-bg)', 
                  border: '1px solid var(--color-danger-border)',
                  display: 'flex',
                  gap: '8px',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontWeight: 600, fontSize: '13px' }}>
                    <AlertTriangle size={15} />
                    <span>Delete Safety Safeguard</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    You are deleting the account <strong>{accountToDelete.name}</strong>. 
                    All historically associated ledger transactions will be transferred to the account selected below to maintain data integrity.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Transfer Transactions to</label>
                  <GlassSelect
                    value={transferAccountId}
                    onChange={setTransferAccountId}
                    options={accounts.filter(a => a.id !== accountToDelete.id).map(acc => ({
                      value: acc.id,
                      label: acc.name,
                      icon: <AccountLogo name={acc.name} />,
                      extra: (
                        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {((accountBalances[acc.id] || 0) < 0 ? '-' : '') + currency + formatAmount(Math.abs(accountBalances[acc.id] || 0))}
                        </span>
                      )
                    }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!transferAccountId) {
                        triggerToast('Please select a transfer destination', 'warning');
                        return;
                      }
                      deleteAccount(accountToDelete.id, transferAccountId);
                      setAccountToDelete(null);
                      setTransferAccountId('');
                    }}
                    className="glass-btn"
                    style={{ 
                      flexGrow: 1, 
                      background: 'rgba(244, 63, 94, 0.15)', 
                      borderColor: 'var(--color-danger-border)',
                      color: 'var(--color-danger)'
                    }}
                  >
                    Confirm Deletion & Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountToDelete(null);
                      setTransferAccountId('');
                    }}
                    className="glass-btn"
                    style={{ flexGrow: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Regular Accounts list & Create/Edit panel */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Create/Edit Form */}
                <form 
                  onSubmit={editingAccountItem ? handleSaveEditAccount : handleCreateAccount} 
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'rgba(0,0,0,0.1)' }}
                >
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>
                    {editingAccountItem ? `Edit Account: ${editingAccountItem.name}` : 'Create New Account'}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Credit Card"
                        className="glass-input"
                        value={accName}
                        onChange={(e) => setAccName(e.target.value)}
                        required
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Initial Bal ({currency})</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="glass-input font-mono"
                        value={accInitial}
                        onChange={(e) => setAccInitial(e.target.value)}
                        required
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="submit" className="glass-btn" style={{ flexGrow: 1, fontSize: '12px', padding: '6px' }}>
                      {editingAccountItem ? 'Save Changes' : 'Create Account'}
                    </button>
                    {editingAccountItem && (
                      <button 
                        type="button" 
                        onClick={handleCancelEditAccount} 
                        className="glass-btn" 
                        style={{ fontSize: '12px', padding: '6px' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0' }} />

                {/* Accounts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Active Accounts
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                      {accounts.map(acc => {
                        const bal = accountBalances[acc.id] || 0;
                        return (
                          <ManageAccountItem
                            key={acc.id}
                            acc={acc}
                            bal={bal}
                            currency={currency}
                            formatAmount={formatAmount}
                            onEdit={() => handleStartEditAccount(acc)}
                            onDelete={() => handleStartDeleteAccount(acc)}
                          />
                        );
                      })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Subscription Modal Overlay */}
      {editingSub && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 0 }} onClick={() => setEditingSub(null)}>
          <div className="glass-panel" style={{ width: '420px', maxWidth: '90%', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px' }}>Edit Subscription</h3>
              <button onClick={() => setEditingSub(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveEditSub} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sub Name</label>
                <input
                  type="text"
                  className="glass-input"
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cost ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    className="glass-input font-mono"
                    value={editSubAmount}
                    onChange={(e) => setEditSubAmount(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Renewal Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="glass-input font-mono"
                    value={editSubRenewalDay}
                    onChange={(e) => setEditSubRenewalDay(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
                <GlassSelect
                  value={editSubCategory}
                  onChange={setEditSubCategory}
                  options={expenseCategories.map(cat => ({
                    value: cat,
                    label: cat,
                    icon: <span style={{ display: 'flex', color: 'var(--text-secondary)' }}>{getFinanceCatIcon(cat, 'expense')}</span>
                  }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingSub(null)} className="glass-btn" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="glass-btn active" style={{ flexGrow: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
