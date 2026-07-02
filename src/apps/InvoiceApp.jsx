import React, { useState, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Building, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Check, 
  Clock, 
  AlertTriangle, 
  Eye, 
  ArrowLeft,
  Settings,
  X
} from 'lucide-react';

// Reusable local GlassSelect component
const GlassSelect = ({ value, onChange, options, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', display: 'inline-block', fontSize: '10px' }}>▼</span>
        </div>
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

export default function InvoiceApp() {
  const { 
    db, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice, 
    updateInvoiceDefaults,
    addTransaction,
    triggerToast,
    invoiceDraftPreset,
    setInvoiceDraftPreset
  } = useOS();

  const invoices = db.invoices || [];
  const systemCurrency = db.settings?.currency || '₹';
  const accounts = db.finance?.accounts || [];
  const invoiceDefaults = db.invoiceDefaults || { onboarded: false };

  // Active state
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice');
  
  // Finance integration modal state
  const [showFinancePrompt, setShowFinancePrompt] = useState(false);
  const [promptInvoiceId, setPromptInvoiceId] = useState(null);
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');

  // Form State
  const [formState, setFormState] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientEmail: '',
    clientStreet: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientCountry: '',
    billerName: '',
    billerEmail: '',
    billerStreet: '',
    billerCity: '',
    billerState: '',
    billerZip: '',
    billerCountry: '',
    items: [{ description: '', rate: '', quantity: '' }],
    taxRate: 0,
    discountRate: 0,
    currency: systemCurrency,
    status: 'Draft',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer'
  });

  // Settings Modal state
  const [settingsForm, setSettingsForm] = useState({
    billerName: '',
    billerEmail: '',
    billerStreet: '',
    billerCity: '',
    billerState: '',
    billerZip: '',
    billerCountry: '',
    defaultCurrency: systemCurrency,
    defaultTaxRate: 0,
    defaultNotes: ''
  });

  const selectedInvoice = invoices.find(inv => inv.id === selectedId);
  const processedPresetRef = React.useRef(null);

  // Handle CRM Preset deep link routing
  useEffect(() => {
    if (invoiceDraftPreset && processedPresetRef.current !== invoiceDraftPreset) {
      processedPresetRef.current = invoiceDraftPreset;
      const nextNum = invoices.length > 0 
        ? 'INV-' + (parseInt(invoices[0].invoiceNumber.replace('INV-', '')) + 1).toString().padStart(3, '0')
        : 'INV-001';

      const defaults = db.invoiceDefaults || {};
      
      const newForm = {
        invoiceNumber: nextNum,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientName: invoiceDraftPreset.clientName || '',
        clientEmail: invoiceDraftPreset.clientEmail || '',
        clientStreet: invoiceDraftPreset.clientStreet || '',
        clientCity: invoiceDraftPreset.clientCity || '',
        clientState: invoiceDraftPreset.clientState || '',
        clientZip: invoiceDraftPreset.clientZip || '',
        clientCountry: invoiceDraftPreset.clientCountry || '',
        billerName: defaults.billerName || db.settings?.username || 'Freelancer',
        billerEmail: defaults.billerEmail || '',
        billerStreet: defaults.billerStreet || '',
        billerCity: defaults.billerCity || '',
        billerState: defaults.billerState || '',
        billerZip: defaults.billerZip || '',
        billerCountry: defaults.billerCountry || '',
        items: [{ description: '', rate: '', quantity: '' }],
        taxRate: defaults.defaultTaxRate || 0,
        discountRate: 0,
        currency: defaults.defaultCurrency || systemCurrency,
        status: invoiceDraftPreset.isReceipt ? 'Paid' : 'Draft',
        notes: defaults.defaultNotes || '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer'
      };

      const id = addInvoice(newForm);
      setSelectedId(id);
      setIsEditing(true);

      if (invoiceDraftPreset.isReceipt) {
        setActiveTab('receipt');
      } else {
        setActiveTab('invoice');
      }

      setInvoiceDraftPreset(null);
    }
  }, [invoiceDraftPreset, invoices, db.invoiceDefaults, db.settings, systemCurrency, addInvoice]);

  // Sync settings form with DB defaults
  useEffect(() => {
    setSettingsForm({
      billerName: invoiceDefaults.billerName || db.settings?.username || '',
      billerEmail: invoiceDefaults.billerEmail || '',
      billerStreet: invoiceDefaults.billerStreet || '',
      billerCity: invoiceDefaults.billerCity || '',
      billerState: invoiceDefaults.billerState || '',
      billerZip: invoiceDefaults.billerZip || '',
      billerCountry: invoiceDefaults.billerCountry || '',
      defaultCurrency: invoiceDefaults.defaultCurrency || systemCurrency,
      defaultTaxRate: invoiceDefaults.defaultTaxRate || 0,
      defaultNotes: invoiceDefaults.defaultNotes || ''
    });
  }, [invoiceDefaults, db.settings]);

  // Sync form with selected invoice
  useEffect(() => {
    if (selectedInvoice) {
      setFormState({
        invoiceNumber: selectedInvoice.invoiceNumber || '',
        issueDate: selectedInvoice.issueDate || '',
        dueDate: selectedInvoice.dueDate || '',
        clientName: selectedInvoice.clientName || '',
        clientEmail: selectedInvoice.clientEmail || '',
        clientStreet: selectedInvoice.clientStreet || '',
        clientCity: selectedInvoice.clientCity || '',
        clientState: selectedInvoice.clientState || '',
        clientZip: selectedInvoice.clientZip || '',
        clientCountry: selectedInvoice.clientCountry || '',
        billerName: selectedInvoice.billerName || '',
        billerEmail: selectedInvoice.billerEmail || '',
        billerStreet: selectedInvoice.billerStreet || '',
        billerCity: selectedInvoice.billerCity || '',
        billerState: selectedInvoice.billerState || '',
        billerZip: selectedInvoice.billerZip || '',
        billerCountry: selectedInvoice.billerCountry || '',
        items: selectedInvoice.items || [{ description: '', rate: '', quantity: '' }],
        taxRate: selectedInvoice.taxRate || 0,
        discountRate: selectedInvoice.discountRate || 0,
        currency: selectedInvoice.currency || systemCurrency,
        status: selectedInvoice.status || 'Draft',
        notes: selectedInvoice.notes || '',
        paymentDate: selectedInvoice.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: selectedInvoice.paymentMethod || 'Bank Transfer'
      });
    }
  }, [selectedId, selectedInvoice, systemCurrency]);

  // Reset tab if status changes away from Paid
  useEffect(() => {
    if (formState.status !== 'Paid') {
      setActiveTab('invoice');
    }
  }, [formState.status]);

  // Trigger Onboarding modal if not onboarded yet
  useEffect(() => {
    if (invoiceDefaults.onboarded === false) {
      setIsSettingsOpen(true);
    }
  }, [invoiceDefaults.onboarded]);

  // Helper formatting
  const formatAmount = (num) => {
    return (parseFloat(num) || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculations
  const getSubtotal = (items) => {
    return items.reduce((sum, item) => sum + ((parseFloat(item.rate) || 0) * (parseFloat(item.quantity) || 0)), 0);
  };

  const getGrandTotal = (items, tax, discount) => {
    const sub = getSubtotal(items);
    const taxVal = sub * ((parseFloat(tax) || 0) / 100);
    const discVal = sub * ((parseFloat(discount) || 0) / 100);
    return sub + taxVal - discVal;
  };

  const activeSubtotal = getSubtotal(formState.items);
  const activeGrandTotal = getGrandTotal(formState.items, formState.taxRate, formState.discountRate);

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Outstanding dues calculated dynamically by invoice currencies
  const outstandingList = invoices.filter(inv => inv.status !== 'Paid');
  const outstandingSummary = outstandingList.reduce((acc, inv) => {
    const invCurrency = inv.currency || systemCurrency;
    const invTotal = getGrandTotal(inv.items || [], inv.taxRate || 0, inv.discountRate || 0);
    acc[invCurrency] = (acc[invCurrency] || 0) + invTotal;
    return acc;
  }, {});

  // Actions
  const handleCreateNew = () => {
    const nextNum = invoices.length > 0 
      ? 'INV-' + (parseInt(invoices[0].invoiceNumber.replace('INV-', '')) + 1).toString().padStart(3, '0')
      : 'INV-001';

    const defaults = db.invoiceDefaults || {};

    const newForm = {
      invoiceNumber: nextNum,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: '',
      clientEmail: '',
      clientStreet: '',
      clientCity: '',
      clientState: '',
      clientZip: '',
      clientCountry: '',
      billerName: defaults.billerName || db.settings?.username || 'Freelancer',
      billerEmail: defaults.billerEmail || '',
      billerStreet: defaults.billerStreet || '',
      billerCity: defaults.billerCity || '',
      billerState: defaults.billerState || '',
      billerZip: defaults.billerZip || '',
      billerCountry: defaults.billerCountry || '',
      items: [{ description: '', rate: '', quantity: '' }],
      taxRate: defaults.defaultTaxRate || 0,
      discountRate: 0,
      currency: defaults.defaultCurrency || systemCurrency,
      status: 'Draft',
      notes: defaults.defaultNotes || '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer'
    };
    
    const id = addInvoice(newForm);
    setSelectedId(id);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!formState.invoiceNumber.trim()) {
      triggerToast('Invoice number is required', 'warning');
      return;
    }
    
    const wasPaid = selectedInvoice?.status === 'Paid';
    const isNowPaid = formState.status === 'Paid';

    updateInvoice(selectedId, formState);
    triggerToast('Invoice saved successfully', 'success');
    setIsEditing(false);

    if (isNowPaid && !wasPaid) {
      setPromptInvoiceId(selectedId);
      setShowFinancePrompt(true);
    }
  };

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    updateInvoiceDefaults({
      ...settingsForm,
      onboarded: true
    });
    triggerToast('Invoice defaults updated', 'success');
    setIsSettingsOpen(false);
  };

  const handleCancelOnboarding = () => {
    updateInvoiceDefaults({ onboarded: true });
    setIsSettingsOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      if (selectedId === id) {
        setSelectedId(null);
        setIsEditing(false);
      }
    }
  };

  // Finance Integration Logger
  const handleLogToFinance = () => {
    const targetInv = invoices.find(i => i.id === promptInvoiceId);
    if (!targetInv) return;

    const amt = getGrandTotal(targetInv.items, targetInv.taxRate, targetInv.discountRate);
    addTransaction({
      description: `Payment for Invoice ${targetInv.invoiceNumber} (${targetInv.clientName})`,
      amount: amt,
      category: 'Invoicing',
      accountId: targetAccountId,
      type: 'income',
      status: 'received',
      date: new Date().toISOString().split('T')[0]
    });

    setShowFinancePrompt(false);
    setPromptInvoiceId(null);
  };

  // Dynamic Form Handlers
  const handleItemChange = (index, field, val) => {
    const updatedItems = [...formState.items];
    updatedItems[index][field] = val;
    setFormState({ ...formState, items: updatedItems });
  };

  const addItemRow = () => {
    setFormState({
      ...formState,
      items: [...formState.items, { description: '', rate: '', quantity: '' }]
    });
  };

  const removeItemRow = (index) => {
    if (formState.items.length === 1) return;
    const updatedItems = formState.items.filter((_, i) => i !== index);
    setFormState({ ...formState, items: updatedItems });
  };

  const triggerPrint = () => {
    window.print();
  };

  // Status Badge Styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', color: '#34d399' };
      case 'Sent':
        return { bg: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
      case 'Overdue':
        return { bg: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' };
    }
  };

  // Address Formatter
  const renderAddress = (street, city, state, zip, country) => {
    const lines = [];
    if (street) lines.push(street);
    const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` - ${zip}` : '');
    if (cityStateZip) lines.push(cityStateZip);
    if (country) lines.push(country);
    return lines.map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>);
  };

  const popularCurrencies = [
    { code: '₹', name: 'INR (₹)' },
    { code: '$', name: 'USD / CAD ($)' },
    { code: '€', name: 'Euro (€)' },
    { code: '£', name: 'GBP (£)' },
    { code: '¥', name: 'JPY / CNY (¥)' }
  ];

  return (
    <div className="invoice-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100%', overflow: 'hidden' }}>
      
      {/* 1. App Sidebar - Invoice List */}
      <aside className="invoice-sidebar" style={{ borderRight: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        
        {/* Header / New Invoice / Settings */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCreateNew} className="glass-btn active" style={{ flexGrow: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '36px' }}>
              <Plus size={14} /> New Invoice
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="glass-btn" 
              style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              title="Invoice Defaults Settings"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search invoices..."
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', height: '34px', fontSize: '12px' }}
            />
          </div>

          {/* Status Filters */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="glass-btn"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  background: statusFilter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderColor: statusFilter === f ? 'var(--text-muted)' : 'var(--border-subtle)',
                  color: statusFilter === f ? 'var(--text-pure)' : 'var(--text-secondary)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredInvoices.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No invoices found.
            </div>
          ) : (
            filteredInvoices.map(inv => {
              const invCurrency = inv.currency || systemCurrency;
              const itemTotal = getGrandTotal(inv.items || [], inv.taxRate || 0, inv.discountRate || 0);
              const statusColors = getStatusStyle(inv.status);
              const isSelected = inv.id === selectedId;

              return (
                <div
                  key={inv.id}
                  onClick={() => {
                    setSelectedId(inv.id);
                    setIsEditing(false);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--border-subtle)' : 'transparent',
                    marginBottom: '4px',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: isSelected ? 'var(--text-pure)' : 'var(--text-primary)' }}>
                      {inv.invoiceNumber}
                    </strong>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      ...statusColors
                    }}>
                      {inv.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{inv.clientName || 'Unnamed Client'}</span>
                    <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {invCurrency}{formatAmount(itemTotal)}
                    </span>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Due: {inv.dueDate || 'N/A'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer - Outstanding Dues by Currency */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '9px', fontWeight: 600, letterSpacing: '0.5px' }}>Outstanding Balance</span>
          {Object.keys(outstandingSummary).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>No outstanding dues.</div>
          ) : (
            Object.entries(outstandingSummary).map(([curr, amt]) => (
              <div key={curr} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dues ({curr}):</span>
                <strong className="font-mono" style={{ color: 'var(--color-warning)' }}>{curr}{formatAmount(amt)}</strong>
              </div>
            ))
          )}
        </div>

      </aside>

      {/* 2. Main Workspace */}
      <main style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {!selectedId ? (
          /* Empty State Dashboard */
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-pure)', marginBottom: '8px' }}>Freelancer Invoice Desk</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                Create professional PDF invoices, calculate totals, track outstanding client dues, and auto-log received payments into your ledger.
              </p>
            </div>
            <button onClick={handleCreateNew} className="glass-btn active" style={{ fontSize: '13px', padding: '8px 24px', height: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} /> Create Your First Invoice
            </button>
          </div>
        ) : (
          /* Active Invoice Workspace */
          <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
            
            {/* Style Injector for Native PDF Printing */}
            <style>{`
              @media print {
                /* Hide everything except the preview A4 sheet */
                .os-dock,
                .os-workspace > header,
                .os-footer,
                .invoice-sidebar,
                .invoice-editor-panel,
                .invoice-action-bar,
                .cmd-overlay {
                  display: none !important;
                }
                .os-workspace {
                  padding: 0 !important;
                  margin: 0 !important;
                  background: #fff !important;
                }
                .os-content {
                  padding: 0 !important;
                  margin: 0 !important;
                }
                .invoice-layout {
                  display: block !important;
                  grid-template-columns: 1fr !important;
                  height: auto !important;
                  overflow: visible !important;
                  background: #fff !important;
                }
                main {
                  height: auto !important;
                  overflow: visible !important;
                  background: #fff !important;
                }
                .invoice-preview-container {
                  padding: 0 !important;
                  margin: 0 !important;
                  height: auto !important;
                  overflow: visible !important;
                  background: #fff !important;
                }
                .invoice-preview-sheet {
                  width: 100% !important;
                  max-width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  background: #fff !important;
                  color: #000 !important;
                }
                .invoice-preview-sheet * {
                  color: #000 !important;
                  border-color: #e5e7eb !important;
                }
                .print-hidden {
                  display: none !important;
                }
              }
            `}</style>

            {/* Split Panel: Left Editor */}
            {isEditing ? (
              <div className="invoice-editor-panel" style={{ width: '440px', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Editor Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-pure)' }}>Edit Invoice Details</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setIsEditing(false)} className="glass-btn" style={{ fontSize: '11px', padding: '4px 10px' }}>Cancel</button>
                      <button type="submit" className="glass-btn active" style={{ fontSize: '11px', padding: '4px 10px' }}>Save</button>
                    </div>
                  </div>

                  {/* Scrollable Form Fields */}
                  <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Invoice Meta */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Invoice ID</label>
                        <input
                          type="text"
                          className="glass-input"
                          value={formState.invoiceNumber}
                          onChange={(e) => setFormState({ ...formState, invoiceNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                        <GlassSelect
                          value={formState.status}
                          onChange={(val) => setFormState({ ...formState, status: val })}
                          options={[
                            { value: 'Draft', label: 'Draft', icon: <Clock size={12} /> },
                            { value: 'Sent', label: 'Sent', icon: <Building size={12} /> },
                            { value: 'Paid', label: 'Paid', icon: <Check size={12} style={{ color: '#34d399' }} /> },
                            { value: 'Overdue', label: 'Overdue', icon: <AlertTriangle size={12} style={{ color: '#f87171' }} /> }
                          ]}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Issue Date</label>
                        <input
                          type="date"
                          className="glass-input font-mono"
                          value={formState.issueDate}
                          onChange={(e) => setFormState({ ...formState, issueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Due Date</label>
                        <input
                          type="date"
                          className="glass-input font-mono"
                          value={formState.dueDate}
                          onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Invoice Currency</label>
                      <GlassSelect
                        value={formState.currency}
                        onChange={(val) => setFormState({ ...formState, currency: val })}
                        options={popularCurrencies.map(c => ({
                          value: c.code,
                          label: c.name,
                          icon: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.code}</span>
                        }))}
                      />
                    </div>

                    {/* Biller Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Your Information</span>
                      <input
                        type="text"
                        placeholder="Your Company/Name"
                        className="glass-input"
                        value={formState.billerName}
                        onChange={(e) => setFormState({ ...formState, billerName: e.target.value })}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="glass-input"
                        value={formState.billerEmail}
                        onChange={(e) => setFormState({ ...formState, billerEmail: e.target.value })}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Street Address"
                          className="glass-input"
                          value={formState.billerStreet}
                          onChange={(e) => setFormState({ ...formState, billerStreet: e.target.value })}
                          style={{ fontSize: '12px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="City"
                            className="glass-input"
                            value={formState.billerCity}
                            onChange={(e) => setFormState({ ...formState, billerCity: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="State"
                            className="glass-input"
                            value={formState.billerState}
                            onChange={(e) => setFormState({ ...formState, billerState: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="ZIP / Pin Code"
                            className="glass-input"
                            value={formState.billerZip}
                            onChange={(e) => setFormState({ ...formState, billerZip: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            className="glass-input"
                            value={formState.billerCountry}
                            onChange={(e) => setFormState({ ...formState, billerCountry: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Client Information</span>

                      {/* CRM client dropdown autofill */}
                      {db.clients && db.clients.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Autofill from CRM</label>
                          <GlassSelect
                            value=""
                            onChange={(val) => {
                              if (!val) return;
                              const client = db.clients.find(c => c.id === val);
                              if (client) {
                                setFormState(prev => ({
                                  ...prev,
                                  clientName: client.company ? `${client.name} (${client.company})` : client.name,
                                  clientEmail: client.email || '',
                                  clientStreet: client.address?.street || '',
                                  clientCity: client.address?.city || '',
                                  clientState: client.address?.state || '',
                                  clientZip: client.address?.zip || '',
                                  clientCountry: client.address?.country || ''
                                }));
                              }
                            }}
                            options={[
                              { value: '', label: 'Choose CRM Client...', icon: <User size={14} style={{ color: 'var(--text-secondary)' }} /> },
                              ...db.clients.map(c => ({
                                value: c.id,
                                label: c.company ? `${c.name} - ${c.company}` : c.name,
                                icon: <User size={14} />
                              }))
                            ]}
                          />
                        </div>
                      )}

                      <input
                        type="text"
                        placeholder="Client Name/Company"
                        className="glass-input"
                        value={formState.clientName}
                        onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Client Email"
                        className="glass-input"
                        value={formState.clientEmail}
                        onChange={(e) => setFormState({ ...formState, clientEmail: e.target.value })}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Street Address"
                          className="glass-input"
                          value={formState.clientStreet}
                          onChange={(e) => setFormState({ ...formState, clientStreet: e.target.value })}
                          style={{ fontSize: '12px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="City"
                            className="glass-input"
                            value={formState.clientCity}
                            onChange={(e) => setFormState({ ...formState, clientCity: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="State"
                            className="glass-input"
                            value={formState.clientState}
                            onChange={(e) => setFormState({ ...formState, clientState: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="ZIP / Pin Code"
                            className="glass-input"
                            value={formState.clientZip}
                            onChange={(e) => setFormState({ ...formState, clientZip: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Country"
                            className="glass-input"
                            value={formState.clientCountry}
                            onChange={(e) => setFormState({ ...formState, clientCountry: e.target.value })}
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Line Items</span>
                        <button type="button" onClick={addItemRow} className="glass-btn" style={{ fontSize: '10px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Plus size={10} /> Add Item
                        </button>
                      </div>

                      {formState.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <input
                            type="text"
                            placeholder="Description"
                            className="glass-input"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            style={{ flexGrow: 1, fontSize: '12px' }}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Rate"
                            className="glass-input font-mono"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                            style={{ width: '70px', fontSize: '12px', textAlign: 'right' }}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            className="glass-input font-mono"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            style={{ width: '50px', fontSize: '12px', textAlign: 'center' }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="glass-btn-icon"
                            style={{ color: 'var(--text-muted)', marginTop: '8px', opacity: formState.items.length === 1 ? 0.3 : 1 }}
                            disabled={formState.items.length === 1}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Tax & Discount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tax %</label>
                        <input
                          type="number"
                          className="glass-input font-mono"
                          value={formState.taxRate}
                          onChange={(e) => setFormState({ ...formState, taxRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Discount %</label>
                        <input
                          type="number"
                          className="glass-input font-mono"
                          value={formState.discountRate}
                          onChange={(e) => setFormState({ ...formState, discountRate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {/* Receipt Details (only visible if status is Paid) */}
                    {formState.status === 'Paid' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Receipt Details</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment Date</label>
                            <input
                              type="date"
                              className="glass-input font-mono"
                              value={formState.paymentDate}
                              onChange={(e) => setFormState({ ...formState, paymentDate: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment Method</label>
                            <GlassSelect
                              value={formState.paymentMethod}
                              onChange={(val) => setFormState({ ...formState, paymentMethod: val })}
                              options={[
                                { value: 'Bank Transfer', label: 'Bank Transfer' },
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Credit Card', label: 'Credit Card' },
                                { value: 'PayPal', label: 'PayPal' },
                                { value: 'UPI', label: 'UPI' },
                                { value: 'Other', label: 'Other' }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Terms / Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment Terms / Notes</label>
                      <textarea
                        placeholder="Payment details or special terms..."
                        className="glass-input"
                        value={formState.notes}
                        onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                        style={{ minHeight: '60px', fontSize: '11px', lineHeight: '1.4' }}
                      />
                    </div>

                  </div>
                </form>
              </div>
            ) : null}

            {/* Split Panel: Right Live Preview Sheet */}
            <div className="invoice-preview-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              
              {/* Action Bar */}
              <div className="invoice-action-bar" style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {formState.status === 'Paid' ? (
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '2px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('invoice')}
                        className="glass-btn"
                        style={{
                          fontSize: '11px',
                          padding: '4px 12px',
                          border: 'none',
                          background: activeTab === 'invoice' ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: activeTab === 'invoice' ? 'var(--text-pure)' : 'var(--text-secondary)',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Invoice
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('receipt')}
                        className="glass-btn"
                        style={{
                          fontSize: '11px',
                          padding: '4px 12px',
                          border: 'none',
                          background: activeTab === 'receipt' ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: activeTab === 'receipt' ? 'var(--text-pure)' : 'var(--text-secondary)',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        Receipt
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-pure)' }}>{formState.invoiceNumber}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        ...getStatusStyle(formState.status)
                      }}>
                        {formState.status}
                      </span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="glass-btn" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Settings size={13} /> Edit Details
                    </button>
                  )}
                  <button onClick={triggerPrint} className="glass-btn active" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={13} /> Print / Save PDF
                  </button>
                  <button onClick={() => handleDelete(selectedId)} className="glass-btn" style={{ fontSize: '12px', color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Scrollable sheet canvas (white paper mockup) */}
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '40px 20px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center' }}>
                <div className="invoice-preview-sheet" style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '740px',
                  minHeight: '840px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                  padding: '50px',
                  color: '#1f2937',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  
                  {/* Paid Stamp Watermark */}
                  {formState.status === 'Paid' && (
                    <div style={{
                      position: 'absolute',
                      top: '40px',
                      right: '180px',
                      border: '3px solid #10b981',
                      color: '#10b981',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      transform: 'rotate(-10deg)',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      opacity: 0.85
                    }}>
                      Paid
                    </div>
                  )}

                  {/* 1. Sheet Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div>
                      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                        {formState.billerName || 'YOUR NAME'}
                      </h1>
                      <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: '1.4' }}>
                        {formState.billerEmail && <span>{formState.billerEmail}</span>}
                        {renderAddress(
                          formState.billerStreet,
                          formState.billerCity,
                          formState.billerState,
                          formState.billerZip,
                          formState.billerCountry
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 6px 0', letterSpacing: '1px' }}>
                        {activeTab === 'receipt' ? 'RECEIPT' : 'INVOICE'}
                      </h2>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>
                        # {activeTab === 'receipt' ? `REC-${formState.invoiceNumber.replace('INV-', '')}` : (formState.invoiceNumber || 'DRAFT')}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0 0 30px 0' }} />

                  {/* 2. Addresses & Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '40px', marginBottom: '40px', fontSize: '12px', lineHeight: '1.4' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Billed To</span>
                      <strong style={{ fontSize: '14px', color: '#111827', display: 'block', marginBottom: '4px' }}>{formState.clientName || 'CLIENT NAME'}</strong>
                      <div style={{ color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {formState.clientEmail && <span>{formState.clientEmail}</span>}
                        {renderAddress(
                          formState.clientStreet,
                          formState.clientCity,
                          formState.clientState,
                          formState.clientZip,
                          formState.clientCountry
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Date Issued:</span>
                        <strong style={{ color: '#111827' }}>{formState.issueDate || 'N/A'}</strong>
                      </div>
                      {activeTab === 'receipt' ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Payment Date:</span>
                            <strong style={{ color: '#111827' }}>{formState.paymentDate || 'N/A'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#6b7280' }}>Payment Method:</span>
                            <strong style={{ color: '#111827' }}>{formState.paymentMethod || 'N/A'}</strong>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Due Date:</span>
                          <strong style={{ color: '#111827' }}>{formState.dueDate || 'N/A'}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>
                          {activeTab === 'receipt' ? 'Amount Paid' : 'Amount Due'} ({formState.currency}):
                        </span>
                        <strong style={{ color: '#111827', fontSize: '14px' }}>{formState.currency}{formatAmount(activeGrandTotal)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 3. Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '40px', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #111827' }}>
                        <th style={{ padding: '8px 0', fontWeight: 700, color: '#111827' }}>Description</th>
                        <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#111827', width: '100px' }}>Rate</th>
                        <th style={{ padding: '8px 0', textAlign: 'center', fontWeight: 700, color: '#111827', width: '70px' }}>Quantity</th>
                        <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#111827', width: '120px' }}>
                          {activeTab === 'receipt' ? 'Amount Paid' : 'Amount'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formState.items.map((item, idx) => {
                        const amt = (parseFloat(item.rate) || 0) * (parseFloat(item.quantity) || 0);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px 0', color: '#1f2937', fontWeight: 500 }}>{item.description || 'Item Description'}</td>
                            <td className="font-mono" style={{ padding: '12px 0', textAlign: 'right', color: '#4b5563' }}>{formState.currency}{formatAmount(item.rate)}</td>
                            <td className="font-mono" style={{ padding: '12px 0', textAlign: 'center', color: '#4b5563' }}>{item.quantity || 0}</td>
                            <td className="font-mono" style={{ padding: '12px 0', textAlign: 'right', color: '#111827', fontWeight: 600 }}>{formState.currency}{formatAmount(amt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* 4. Totals Block */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', gap: '40px', fontSize: '12px' }}>
                    
                    {/* Notes & Terms */}
                    <div style={{ flexGrow: 1, maxWidth: '380px' }}>
                      {formState.notes && (
                        <>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Notes / Payment Terms</span>
                          <p style={{ color: '#4b5563', margin: 0, lineHeight: '1.5', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{formState.notes}</p>
                        </>
                      )}
                    </div>

                    {/* Calculations Summary */}
                    <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Subtotal:</span>
                        <span className="font-mono" style={{ color: '#1f2937' }}>{formState.currency}{formatAmount(activeSubtotal)}</span>
                      </div>
                      
                      {formState.taxRate > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Tax ({formState.taxRate}%):</span>
                          <span className="font-mono" style={{ color: '#1f2937' }}>{formState.currency}{formatAmount(activeSubtotal * (formState.taxRate / 100))}</span>
                        </div>
                      )}

                      {formState.discountRate > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#6b7280' }}>Discount ({formState.discountRate}%):</span>
                          <span className="font-mono" style={{ color: '#1f2937' }}>-{formState.currency}{formatAmount(activeSubtotal * (formState.discountRate / 100))}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '10px', fontSize: '14px' }}>
                        <strong style={{ color: '#111827' }}>{activeTab === 'receipt' ? 'Total Paid:' : 'Total:'}</strong>
                        <strong className="font-mono" style={{ color: activeTab === 'receipt' ? '#10b981' : '#111827' }}>
                          {formState.currency}{formatAmount(activeGrandTotal)}
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Finance Integration Confirmation Modal */}
      {showFinancePrompt && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-panel" style={{ width: '420px', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <Check size={18} />
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Payment Received!</h3>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              This invoice is now marked as <strong>Paid</strong>. Would you like to automatically record this payment as an Income transaction in the Finance App?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Select Destination Account</label>
              <GlassSelect
                value={targetAccountId}
                onChange={setTargetAccountId}
                options={accounts.map(acc => ({
                  value: acc.id,
                  label: acc.name,
                  icon: <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  setShowFinancePrompt(false);
                  setPromptInvoiceId(null);
                }}
                className="glass-btn"
                style={{ flexGrow: 1, fontSize: '12px' }}
              >
                No, Skip
              </button>
              <button
                onClick={handleLogToFinance}
                className="glass-btn active"
                style={{ flexGrow: 1, fontSize: '12px' }}
              >
                Yes, Log Income
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defaults & Onboarding Settings Modal */}
      {isSettingsOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div className="glass-panel" style={{ width: '560px', maxHeight: '90%', overflowY: 'auto', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-pure)' }}>
                <Settings size={18} />
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
                  {invoiceDefaults.onboarded === false ? 'Set Up Invoice Defaults (Onboarding)' : 'Invoice Generator Defaults'}
                </h3>
              </div>
              {invoiceDefaults.onboarded !== false && (
                <button onClick={() => setIsSettingsOpen(false)} className="glass-btn-icon" style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Set up your profile details, standard billing currency, and payment terms to automatically populate every new invoice draft you create.
            </p>

            <form onSubmit={handleSaveDefaults} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Biller defaults */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Freelancer / Biller Profile</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Biller Name / Company"
                    className="glass-input"
                    value={settingsForm.billerName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerName: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Biller Email"
                    className="glass-input"
                    value={settingsForm.billerEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerEmail: e.target.value })}
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Street Address"
                  className="glass-input"
                  value={settingsForm.billerStreet}
                  onChange={(e) => setSettingsForm({ ...settingsForm, billerStreet: e.target.value })}
                  style={{ fontSize: '12px' }}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    className="glass-input"
                    value={settingsForm.billerCity}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerCity: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="glass-input"
                    value={settingsForm.billerState}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerState: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="ZIP / Pin Code"
                    className="glass-input"
                    value={settingsForm.billerZip}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerZip: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    className="glass-input"
                    value={settingsForm.billerCountry}
                    onChange={(e) => setSettingsForm({ ...settingsForm, billerCountry: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Preferences defaults */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Invoice Preferences</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Default Currency</label>
                    <GlassSelect
                      value={settingsForm.defaultCurrency}
                      onChange={(val) => setSettingsForm({ ...settingsForm, defaultCurrency: val })}
                      options={popularCurrencies.map(c => ({
                        value: c.code,
                        label: c.name,
                        icon: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.code}</span>
                      }))}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Default Tax %</label>
                    <input
                      type="number"
                      className="glass-input font-mono"
                      value={settingsForm.defaultTaxRate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                      style={{ height: '38px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Default Payment Terms / Notes</label>
                  <textarea
                    placeholder="Bank details, wire instructions, etc."
                    className="glass-input"
                    value={settingsForm.defaultNotes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultNotes: e.target.value })}
                    style={{ minHeight: '60px', fontSize: '11px', lineHeight: '1.4' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {invoiceDefaults.onboarded === false && (
                  <button
                    type="button"
                    onClick={handleCancelOnboarding}
                    className="glass-btn"
                    style={{ flexGrow: 1, fontSize: '12px' }}
                  >
                    Set Up Later
                  </button>
                )}
                <button
                  type="submit"
                  className="glass-btn active"
                  style={{ flexGrow: 1, fontSize: '12px' }}
                >
                  Save Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
