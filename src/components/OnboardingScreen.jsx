import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  Building, 
  Trash2, 
  Plus 
} from 'lucide-react';

export default function OnboardingScreen() {
  const { completeOnboarding } = useOS();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [budget, setBudget] = useState('50000');
  const [monthlyTarget, setMonthlyTarget] = useState('15000');
  const [yearlyTarget, setYearlyTarget] = useState('200000');

  // Accounts state
  const [onboardingAccounts, setOnboardingAccounts] = useState([
    { id: 'acc-cash', name: 'Cash', initialBalance: '0' }
  ]);

  // Dynamically update default targets when currency changes
  useEffect(() => {
    if (currency === '₹') {
      setBudget('50000');
      setMonthlyTarget('15000');
      setYearlyTarget('200000');
    } else {
      setBudget('2000');
      setMonthlyTarget('1500');
      setYearlyTarget('18000');
    }
  }, [currency]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    completeOnboarding(name, currency, budget, monthlyTarget, yearlyTarget, onboardingAccounts);
  };

  const handleAccountBalanceChange = (id, val) => {
    setOnboardingAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, initialBalance: val } : acc));
  };

  const handleAccountNameChange = (id, val) => {
    setOnboardingAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, name: val } : acc));
  };

  const handleAddAccount = () => {
    const newId = `acc-${Math.random().toString(36).substring(2, 9)}`;
    setOnboardingAccounts(prev => [
      ...prev,
      { id: newId, name: 'Bank Account', initialBalance: '0' }
    ]);
  };

  const handleRemoveAccount = (id) => {
    if (id === 'acc-cash') return; // Cannot delete Cash
    setOnboardingAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const isNameEmpty = name.trim() === '';

  const currencies = [
    { symbol: '₹', label: 'INR - Indian Rupee (Default)', locale: 'en-IN' },
    { symbol: '$', label: 'USD - US Dollar', locale: 'en-US' },
    { symbol: '€', label: 'EUR - Euro', locale: 'de-DE' },
    { symbol: '£', label: 'GBP - British Pound', locale: 'en-GB' },
    { symbol: '¥', label: 'JPY - Japanese Yen', locale: 'ja-JP' },
    { symbol: '₽', label: 'RUB - Russian Ruble', locale: 'ru-RU' }
  ];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container glass-panel">
        {/* Progress bar */}
        <div className="onboarding-progress-bar">
          <div 
            className="onboarding-progress-fill" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="onboarding-steps-badge">
          Step {step} of 5
        </div>

        <div className="onboarding-content-wrap">
          {step === 1 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header">
                <div className="onboarding-logo">
                  gryndset<span>// own your grind</span>
                </div>
                <h1>Welcome to your new workspace</h1>
                <p>Let's personalize your dashboard. What should we call you?</p>
              </div>

              <div className="onboarding-input-group">
                <div className="onboarding-input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    maxLength={24}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header">
                <h1>Select your currency</h1>
                <p>Choose the default currency symbol for your ledgers and trackers.</p>
              </div>

              <div className="currency-selection-grid">
                {currencies.map((curr) => (
                  <button
                    key={curr.symbol}
                    className={`currency-card glass-card ${currency === curr.symbol ? 'selected' : ''}`}
                    onClick={() => setCurrency(curr.symbol)}
                  >
                    <div className="currency-symbol-big">{curr.symbol}</div>
                    <div className="currency-label">{curr.label}</div>
                    {currency === curr.symbol && (
                      <span className="currency-check-badge">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header">
                <h1>Set financial targets</h1>
                <p>Initialize your goals. You can adjust these in settings anytime.</p>
              </div>

              <div className="targets-input-fields">
                <div className="target-input-card glass-card">
                  <div className="target-card-icon">
                    <Wallet size={18} />
                  </div>
                  <div className="target-card-inputs">
                    <label>Monthly Budget Cap</label>
                    <div className="target-numeric-wrapper">
                      <span>{currency}</span>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="target-input-card glass-card">
                  <div className="target-card-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div className="target-card-inputs">
                    <label>Monthly Savings Goal</label>
                    <div className="target-numeric-wrapper">
                      <span>{currency}</span>
                      <input
                        type="number"
                        value={monthlyTarget}
                        onChange={(e) => setMonthlyTarget(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="target-input-card glass-card">
                  <div className="target-card-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="target-card-inputs">
                    <label>Yearly Savings Milestone</label>
                    <div className="target-numeric-wrapper">
                      <span>{currency}</span>
                      <input
                        type="number"
                        value={yearlyTarget}
                        onChange={(e) => setYearlyTarget(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header">
                <h1>Set up accounts</h1>
                <p>Initialize starting balances for your cash and bank accounts.</p>
              </div>

              <div className="targets-input-fields" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', gap: '8px' }}>
                {onboardingAccounts.map((acc) => {
                  const isCash = acc.id === 'acc-cash';
                  return (
                    <div 
                      key={acc.id} 
                      className="target-input-card glass-card" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px 16px',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
                        <div className="target-card-icon" style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px' }}>
                          {isCash ? <Wallet size={16} /> : <Building size={16} />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                          {isCash ? (
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>Cash Account</span>
                          ) : (
                            <input
                              type="text"
                              value={acc.name}
                              onChange={(e) => handleAccountNameChange(acc.id, e.target.value)}
                              placeholder="Account Name"
                              className="glass-input"
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-pure)',
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '4px 8px',
                                borderRadius: '6px',
                                width: '140px',
                                height: '28px',
                                outline: 'none'
                              }}
                            />
                          )}
                          <div className="target-numeric-wrapper" style={{ marginTop: '2px' }}>
                            <span style={{ fontSize: '11px' }}>{currency}</span>
                            <input
                              type="number"
                              value={acc.initialBalance}
                              onChange={(e) => handleAccountBalanceChange(acc.id, e.target.value)}
                              placeholder="0"
                              style={{ width: '80px', height: '20px', fontSize: '12px' }}
                            />
                          </div>
                        </div>
                      </div>

                      {!isCash && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(acc.id)}
                          className="glass-btn"
                          style={{ 
                            color: 'var(--color-danger)', 
                            borderColor: 'rgba(244, 63, 94, 0.2)',
                            padding: '4px 8px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddAccount}
                className="glass-btn"
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  padding: '6px 12px',
                  width: 'fit-content',
                  alignSelf: 'center',
                  height: '32px'
                }}
              >
                <Plus size={12} /> Add Bank Account
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header text-center">
                <div className="success-badge-glow">
                  <Check size={32} />
                </div>
                <h1>You're all set!</h1>
                <p>Welcome to your local-first workspace. Own your grind.</p>
              </div>

              <div className="summary-confirm-card glass-card">
                <h3>Workspace Profile Summary</h3>
                <div className="summary-row">
                  <span>Username:</span>
                  <strong>{name}</strong>
                </div>
                <div className="summary-row">
                  <span>Currency:</span>
                  <strong>{currency}</strong>
                </div>
                <div className="summary-row">
                  <span>Monthly Budget Cap:</span>
                  <strong>{currency}{Number(budget).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Monthly Savings Target:</span>
                  <strong>{currency}{Number(monthlyTarget).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Yearly Savings Milestone:</span>
                  <strong>{currency}{Number(yearlyTarget).toLocaleString()}</strong>
                </div>
                <div className="summary-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Initialized Accounts:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%', marginTop: '2px' }}>
                    {onboardingAccounts.map(acc => (
                      <span key={acc.id} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '2px 8px' }}>
                        {acc.name}: <strong>{currency}{Number(acc.initialBalance).toLocaleString()}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="onboarding-footer-controls">
          {step > 1 && (
            <button 
              className="onboarding-back-btn glass-btn" 
              onClick={handleBack}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 5 ? (
            <button 
              className="onboarding-next-btn glass-btn accent" 
              onClick={handleNext}
              disabled={step === 1 && isNameEmpty}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              className="onboarding-finish-btn glass-btn accent glowing-button" 
              onClick={handleFinish}
            >
              Enter Dashboard <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
