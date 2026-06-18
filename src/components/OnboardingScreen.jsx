import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { ArrowRight, ArrowLeft, Check, User, Wallet, TrendingUp, Sparkles } from 'lucide-react';

export default function OnboardingScreen() {
  const { completeOnboarding } = useOS();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [budget, setBudget] = useState('50000');
  const [monthlyTarget, setMonthlyTarget] = useState('15000');
  const [yearlyTarget, setYearlyTarget] = useState('200000');

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
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    completeOnboarding(name, currency, budget, monthlyTarget, yearlyTarget);
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
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="onboarding-steps-badge">
          Step {step} of 4
        </div>

        <div className="onboarding-content-wrap">
          {step === 1 && (
            <div className="onboarding-step-view fade-in">
              <div className="onboarding-header">
                <div className="onboarding-logo">
                  gryndset<span>// workspace</span>
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
              <div className="onboarding-header text-center">
                <div className="success-badge-glow">
                  <Check size={32} />
                </div>
                <h1>You're all set!</h1>
                <p>Welcome to your local-first productivity workspace.</p>
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

          {step < 4 ? (
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
