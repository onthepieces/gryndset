import React, { useState, useMemo } from 'react';
import { useOS } from '../context/OSContext';
import { 
  Search, 
  Plus, 
  Users, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  X, 
  ExternalLink,
  ChevronDown,
  Building,
  ArrowUpRight,
  Receipt
} from 'lucide-react';

// local GlassSelect for status toggle
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
    <div ref={containerRef} style={{ position: 'relative', width: 'fit-content', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px 12px',
          fontSize: '12px',
          height: '32px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedOption?.icon}
          <span>{selectedOption?.label}</span>
        </span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            background: 'rgba(18, 18, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '4px',
            zIndex: 100,
            width: '120px'
          }}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
                color: opt.value === value ? 'var(--text-pure)' : 'var(--text-primary)',
                background: opt.value === value ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CRMApp() {
  const { 
    db, 
    addClient, 
    updateClient, 
    deleteClient, 
    triggerInvoiceForClient,
    setActiveApp
  } = useOS();

  const clients = db.clients || [];
  const invoices = db.invoices || [];
  const systemCurrency = db.settings?.currency || '₹';

  // State variables
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formState, setFormState] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'active',
    notes: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  // Set default selection
  const activeClientId = selectedId || (filteredClients[0]?.id || null);
  const selectedClient = clients.find(c => c.id === activeClientId);

  // Client Invoices & Receipts Math
  const clientInvoices = useMemo(() => {
    if (!selectedClient) return [];
    const cName = selectedClient.name.toLowerCase();
    const cComp = selectedClient.company ? selectedClient.company.toLowerCase() : '';
    return invoices.filter(inv => {
      const invClient = inv.clientName ? inv.clientName.toLowerCase() : '';
      return invClient.includes(cName) || (cComp && invClient.includes(cComp));
    });
  }, [selectedClient, invoices]);

  // Calculate invoice amount totals
  const getInvoiceTotal = (inv) => {
    const items = inv.items || [];
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0), 0);
    const tax = subtotal * ((parseFloat(inv.taxRate) || 0) / 100);
    const discount = subtotal * ((parseFloat(inv.discountRate) || 0) / 100);
    return subtotal + tax - discount;
  };

  const clientStats = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let outstanding = 0;

    clientInvoices.forEach(inv => {
      const total = getInvoiceTotal(inv);
      if (inv.status === 'Paid') {
        paid += total;
        billed += total;
      } else if (inv.status !== 'Draft') {
        outstanding += total;
        billed += total;
      } else {
        // drafts not billed yet, or optionally can be counted
      }
    });

    return { billed, paid, outstanding };
  }, [clientInvoices]);

  // Open modal for add client
  const handleOpenAdd = () => {
    setFormState({
      name: '',
      company: '',
      email: '',
      phone: '',
      status: 'active',
      notes: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal for edit client
  const handleOpenEdit = (client) => {
    setFormState({
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
      notes: client.notes || '',
      street: client.address?.street || '',
      city: client.address?.city || '',
      state: client.address?.state || '',
      zip: client.address?.zip || '',
      country: client.address?.country || ''
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle modal form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    const payload = {
      name: formState.name.trim(),
      company: formState.company.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      status: formState.status,
      notes: formState.notes.trim(),
      address: {
        street: formState.street.trim(),
        city: formState.city.trim(),
        state: formState.state.trim(),
        zip: formState.zip.trim(),
        country: formState.country.trim()
      }
    };

    if (modalMode === 'add') {
      const newId = addClient(payload);
      setSelectedId(newId);
    } else {
      updateClient(activeClientId, payload);
    }

    setIsModalOpen(false);
  };

  // Handle delete client
  const handleDeleteClient = (id, name) => {
    if (confirm(`Are you sure you want to delete client "${name}"?`)) {
      deleteClient(id);
      setSelectedId(null);
    }
  };

  // Client list helper styles
  const getStatusClass = (status) => {
    if (status === 'active') return 'success';
    if (status === 'lead') return 'info';
    return 'warning';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
      
      {/* Left panel: Clients List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Users size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clients ({clients.length})</h3>
          </div>
          <button onClick={handleOpenAdd} className="glass-btn accent" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={12} /> New Client
          </button>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 10px', alignItems: 'center', gap: '8px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '12px', color: '#fff' }}
          />
          {searchQuery && <X size={12} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')} />}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Active', 'Lead', 'Inactive'].map((filt) => (
            <button 
              key={filt} 
              onClick={() => setStatusFilter(filt)}
              className={`glass-btn ${statusFilter === filt ? 'active' : ''}`}
              style={{ fontSize: '10px', padding: '3px 8px', flexGrow: 1 }}
            >
              {filt}
            </button>
          ))}
        </div>

        {/* Clients List container */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No clients found.
            </div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = client.id === activeClientId;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedId(client.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--text-pure)' : 'var(--text-primary)' }}>{client.name}</span>
                    <span className={`status-pill ${getStatusClass(client.status)}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                      {client.status}
                    </span>
                  </div>
                  {client.company && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{client.company}</span>
                  )}
                  {client.email && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.email}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Selected Client Detail profile */}
      <div style={{ height: '100%', overflowY: 'auto' }}>
        {selectedClient ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header info card */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <User size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-pure)' }}>{selectedClient.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    {selectedClient.company && (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {selectedClient.company}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status toggles & actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GlassSelect
                  value={selectedClient.status}
                  onChange={(newStatus) => updateClient(selectedClient.id, { status: newStatus })}
                  options={[
                    { value: 'active', label: 'Active', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} /> },
                    { value: 'lead', label: 'Lead', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-info)' }} /> },
                    { value: 'inactive', label: 'Inactive', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)' }} /> }
                  ]}
                />
                
                <button onClick={() => handleOpenEdit(selectedClient)} className="glass-btn" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <Edit3 size={13} /> Edit Profile
                </button>

                <button onClick={() => handleDeleteClient(selectedClient.id, selectedClient.name)} className="glass-btn" style={{ padding: '6px 10px', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>

            {/* Profile Grid: Contact Details & Stats side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
              
              {/* Contact Details Card */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: 0 }}>
                  Contact Information
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedClient.email && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Mail size={14} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EMAIL</span>
                        <a href={`mailto:${selectedClient.email}`} style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none' }} className="hover-link">
                          {selectedClient.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedClient.phone && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Phone size={14} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PHONE</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{selectedClient.phone}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--text-secondary)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BILLING ADDRESS</span>
                      {selectedClient.address?.street ? (
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                          <div>{selectedClient.address.street}</div>
                          <div>
                            {selectedClient.address.city && `${selectedClient.address.city}, `}
                            {selectedClient.address.state && `${selectedClient.address.state} `}
                            {selectedClient.address.zip}
                          </div>
                          {selectedClient.address.country && <div>{selectedClient.address.country}</div>}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No address listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CLIENT NOTES</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {selectedClient.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Financial Stats Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  
                  {/* Stats Card: Billed */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Billed</span>
                    <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-pure)' }}>
                      {systemCurrency}{clientStats.billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Stats Card: Paid */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Paid</span>
                    <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)' }}>
                      {systemCurrency}{clientStats.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Stats Card: Outstanding */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Outstanding</span>
                    <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: clientStats.outstanding > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
                      {systemCurrency}{clientStats.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                </div>

                {/* Quick App Integrations Bar */}
                <div className="glass-card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginRight: 'auto' }}>CRM ACTIONS:</span>
                  
                  <button 
                    onClick={() => triggerInvoiceForClient(selectedClient)} 
                    className="glass-btn active"
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={14} /> New Invoice
                  </button>

                  <button 
                    onClick={() => triggerInvoiceForClient({ ...selectedClient, isReceipt: true })} 
                    className="glass-btn active"
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Receipt size={14} /> New Receipt
                  </button>
                  
                  {selectedClient.email && (
                    <a 
                      href={`mailto:${selectedClient.email}`}
                      className="glass-btn"
                      style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Mail size={14} /> Email Client
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Invoices List table for this client */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Invoices & Receipts ({clientInvoices.length})</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Double-click to open in Invoice app</span>
              </div>

              {clientInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  No Invoices or Receipts registered for this client.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 12px', fontWeight: 500 }}>ID</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500 }}>Date</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500 }}>Due Date</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500, textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500, textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientInvoices.map(inv => {
                        const total = getInvoiceTotal(inv);
                        return (
                          <tr 
                            key={inv.id}
                            onDoubleClick={() => {
                              // Deep link to invoices
                              setActiveApp('invoices');
                              // Let the invoice app know to select this ID
                              // In InvoiceApp, it syncs state, we can write selector or triggerToast. For now, navigating to invoices is great!
                            }}
                            className="table-row-hover"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }}
                          >
                            <td className="font-mono" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-pure)' }}>{inv.invoiceNumber}</td>
                            <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{inv.issueDate}</td>
                            <td className="font-mono" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                            <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{systemCurrency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span className={`status-pill ${inv.status === 'Paid' ? 'success' : (inv.status === 'Draft' ? 'warning' : 'danger')}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', minHeight: '300px' }}>
            <Users size={48} style={{ color: 'var(--text-secondary)' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-pure)', marginBottom: '4px' }}>Client Relations Manager</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto', lineHeight: '1.4' }}>
                Select a client from the list or add a new profile to track billing history and statistics.
              </p>
            </div>
            <button onClick={handleOpenAdd} className="glass-btn accent" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <Plus size={14} /> New Client Profile
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal overlay */}
      {isModalOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel" style={{ width: '480px', maxWidth: '95%', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modalMode === 'add' ? <Plus size={16} /> : <Edit3 size={16} />}
                {modalMode === 'add' ? 'Add Client Profile' : 'Edit Client Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client Name</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. John Doe"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Company</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Acme Corp"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="john@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone Number</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="+91 99999 99999"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Status input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label>
                <GlassSelect
                  value={formState.status}
                  onChange={(val) => setFormState({ ...formState, status: val })}
                  options={[
                    { value: 'active', label: 'Active Client', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} /> },
                    { value: 'lead', label: 'Lead Prospect', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-info)' }} /> },
                    { value: 'inactive', label: 'Inactive', icon: <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)' }} /> }
                  ]}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Billing Address Sub-Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-pure)', textTransform: 'uppercase' }}>Billing Address</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Street Address"
                    value={formState.street}
                    onChange={(e) => setFormState({ ...formState, street: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="City"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="State / Province"
                    value={formState.state}
                    onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="ZIP / Pin Code"
                    value={formState.zip}
                    onChange={(e) => setFormState({ ...formState, zip: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Country"
                    value={formState.country}
                    onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Internal Notes</label>
                <textarea
                  className="glass-input"
                  placeholder="Billing schedule, retainer contracts, general notes..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  style={{ height: '70px', resize: 'none', fontSize: '12px', padding: '8px' }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="glass-btn" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="glass-btn active" style={{ flexGrow: 1 }}>
                  {modalMode === 'add' ? 'Save Client' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
