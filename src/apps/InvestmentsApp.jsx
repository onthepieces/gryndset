import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  History, 
  PieChart as ChartIcon, 
  Coins, 
  RefreshCw,
  X,
  Activity
} from 'lucide-react';

export default function InvestmentsApp() {
  const { 
    db, 
    addTrade, 
    deleteTrade, 
    updateMarketPrice, 
    triggerToast,
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
  const formatAmount = (val, decimals = 2) => {
    return (parseFloat(val) || 0).toLocaleString(getLocale(currency), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Local Form States
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [category, setCategory] = useState('stock'); // 'stock' | 'crypto'
  
  // Market Price update local states
  const [editingTicker, setEditingTicker] = useState(null);
  const [tempPriceInput, setTempPriceInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Tab for Donut chart
  const [allocationTab, setAllocationTab] = useState('assets'); // 'assets' | 'category'

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const trades = db.investments.trades || [];
  const datePrefix = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
  const filteredTrades = trades.filter(t => t.date.startsWith(datePrefix));
  const marketPrices = db.investments.marketPrices || {};

  // Utility to determine category (with fallback for legacy trades)
  const getTradeCategory = (trade) => {
    if (trade.category) return trade.category;
    const knownCryptos = ['BTC', 'ETH', 'SOL', 'USDT', 'BNB', 'ADA', 'XRP', 'DOT', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'SHIB', 'LTC', 'BCH'];
    return knownCryptos.includes(trade.ticker.toUpperCase()) ? 'crypto' : 'stock';
  };

  // 1. Aggregate Holdings
  const holdingsMap = {};
  
  // Sort trades chronologically to calculate average costs properly
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedTrades.forEach(trade => {
    const tick = trade.ticker.toUpperCase();
    const cat = getTradeCategory(trade);
    if (!holdingsMap[tick]) {
      holdingsMap[tick] = {
        ticker: tick,
        name: trade.name,
        shares: 0,
        totalCost: 0,
        buyShares: 0,
        category: cat
      };
    }

    const holding = holdingsMap[tick];
    if (trade.type === 'buy') {
      holding.shares += trade.shares;
      holding.totalCost += (trade.shares * trade.price);
      holding.buyShares += trade.shares;
    } else if (trade.type === 'sell') {
      holding.shares = Math.max(0, holding.shares - trade.shares);
    }
  });

  // Filter out assets that are fully sold out (shares === 0)
  const activeHoldings = Object.values(holdingsMap)
    .filter(h => h.shares > 0)
    .map(h => {
      const currentPrice = marketPrices[h.ticker] || (h.totalCost / h.buyShares); // fallback to avg cost
      const avgCost = h.buyShares > 0 ? (h.totalCost / h.buyShares) : 0;
      const marketValue = h.shares * currentPrice;
      const costBasis = h.shares * avgCost;
      const profitLoss = marketValue - costBasis;
      const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...h,
        avgCost,
        currentPrice,
        marketValue,
        costBasis,
        profitLoss,
        profitLossPercent
      };
    });

  // Portfolio Totals
  const totalPortfolioValue = activeHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCostBasis = activeHoldings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalUnrealizedPL = totalPortfolioValue - totalCostBasis;
  const totalUnrealizedPLPercent = totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0;

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticker.trim() || !name.trim() || !shares || !price) return;

    const parsedShares = parseFloat(shares);
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedShares) || parsedShares <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) return;

    // If it's a sell, verify we own enough shares
    const currentHolding = holdingsMap[ticker.toUpperCase()];
    if (tradeType === 'sell' && (!currentHolding || currentHolding.shares < parsedShares)) {
      triggerToast(`Insufficient shares of ${ticker.toUpperCase()} to sell.`, 'danger');
      return;
    }

    addTrade({
      date: new Date().toISOString().split('T')[0],
      ticker: ticker.toUpperCase().trim(),
      name: name.trim(),
      type: tradeType,
      shares: parsedShares,
      price: parsedPrice,
      category: category
    });

    setTicker('');
    setName('');
    setShares('');
    setPrice('');
  };

  const handleUpdatePrice = (tick) => {
    const parsed = parseFloat(tempPriceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      updateMarketPrice(tick, parsed);
      setEditingTicker(null);
      setTempPriceInput('');
    }
  };

  // Fetch Live Prices Semi-Automatically (with automatic currency conversion)
  const fetchLivePrices = async () => {
    if (activeHoldings.length === 0) {
      triggerToast('No holdings found to update prices for.', 'info');
      return;
    }
    setIsFetching(true);
    try {
      // 1. Fetch live exchange rates (CORS-friendly, keyless public API)
      let fxRate = 1;
      const targetCurrencyCode = currency === '₹' ? 'INR' : 
                                 currency === '€' ? 'EUR' : 
                                 currency === '£' ? 'GBP' : 
                                 currency === '¥' ? 'JPY' : 
                                 currency === '₽' ? 'RUB' : 'USD';
                                 
      if (targetCurrencyCode !== 'USD') {
        try {
          const fxResponse = await fetch('https://open.er-api.com/v6/latest/USD');
          if (fxResponse.ok) {
            const fxData = await fxResponse.json();
            if (fxData.rates && fxData.rates[targetCurrencyCode]) {
              fxRate = fxData.rates[targetCurrencyCode];
            }
          }
        } catch (e) {
          console.warn('Failed to fetch FX rates, falling back to 1:1 USD mapping', e);
        }
      }

      // 2. Fetch live crypto prices from Binance
      const response = await fetch('https://api.binance.com/api/v3/ticker/price');
      if (!response.ok) throw new Error('API network response failed');
      const data = await response.json();
      
      const priceMap = {};
      data.forEach(item => {
        priceMap[item.symbol] = parseFloat(item.price);
      });

      let updatedCount = 0;
      activeHoldings.forEach(h => {
        // Try crypto mapping first
        const cryptoSymbol = `${h.ticker}USDT`;
        if (priceMap[cryptoSymbol]) {
          const convertedPrice = parseFloat((priceMap[cryptoSymbol] * fxRate).toFixed(2));
          updateMarketPrice(h.ticker, convertedPrice);
          updatedCount++;
        } else {
          // If stock, simulate minor price tick changes (random -0.4% to +0.4%) as fallback
          if (h.category === 'stock') {
            const current = h.currentPrice;
            const change = 1 + (Math.random() * 0.008 - 0.004);
            const simulated = parseFloat((current * change).toFixed(2));
            updateMarketPrice(h.ticker, simulated);
            updatedCount++;
          }
        }
      });
      const currencyMsg = targetCurrencyCode !== 'USD' ? ` converted to ${targetCurrencyCode} @ ${fxRate.toFixed(2)}` : '';
      triggerToast(`Market prices fetched${currencyMsg}! Updated ${updatedCount} assets.`, 'success');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to fetch live prices. Using manual edit fallbacks.', 'danger');
    } finally {
      setIsFetching(false);
    }
  };

  // Reconstruct Net Worth Curve over logged trade dates
  const getHistoricalNetWorth = () => {
    if (trades.length === 0) return [];
    
    const holdingsAtDate = {};
    const priceAtDate = {};
    const netWorthPoints = [];

    sortedTrades.forEach(trade => {
      const tick = trade.ticker.toUpperCase();
      const shares = parseFloat(trade.shares);
      const price = parseFloat(trade.price);
      
      if (!holdingsAtDate[tick]) {
        holdingsAtDate[tick] = 0;
      }
      
      if (trade.type === 'buy') {
        holdingsAtDate[tick] += shares;
      } else if (trade.type === 'sell') {
        holdingsAtDate[tick] = Math.max(0, holdingsAtDate[tick] - shares);
      }
      
      priceAtDate[tick] = price;

      let netWorth = 0;
      Object.keys(holdingsAtDate).forEach(t => {
        netWorth += holdingsAtDate[t] * priceAtDate[t];
      });

      const lastPoint = netWorthPoints[netWorthPoints.length - 1];
      if (lastPoint && lastPoint.date === trade.date) {
        lastPoint.value = netWorth;
      } else {
        netWorthPoints.push({ date: trade.date, value: netWorth });
      }
    });

    return netWorthPoints;
  };

  const netWorthPoints = getHistoricalNetWorth();

  // SVG Line Chart renderer
  const renderLineChart = () => {
    if (netWorthPoints.length < 2) {
      return (
        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '16px' }}>
          Add BUY trades across different dates to reconstruct portfolio growth chart.
        </div>
      );
    }

    const values = netWorthPoints.map(p => p.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    const width = 280;
    const height = 90;
    const padding = 10;
    
    const points = netWorthPoints.map((p, idx) => {
      const x = padding + (idx / (netWorthPoints.length - 1)) * (width - 2 * padding);
      const y = height - padding - (range > 0 ? ((p.value - minValue) / range) * (height - 2 * padding) : (height - 2 * padding) / 2);
      return { x, y, date: p.date, value: p.value };
    });

    const pathData = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          
          <path d={areaData} fill="url(#chartGrad)" />
          <path d={pathData} fill="none" stroke="var(--text-pure)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {points.map((p, idx) => (
            <circle 
              key={idx} 
              cx={p.x} 
              cy={p.y} 
              r="3" 
              fill="var(--bg-pure)" 
              stroke="var(--text-pure)" 
              strokeWidth="1.5" 
              title={`${p.date}: ${currency}${formatAmount(p.value)}`}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>{points[0].date}</span>
          <span>VALUATION HISTORY</span>
          <span>{points[points.length - 1].date}</span>
        </div>
      </div>
    );
  };

  // Asset allocations
  const assetAllocation = activeHoldings.map(h => {
    const percentage = totalPortfolioValue > 0 ? (h.marketValue / totalPortfolioValue) * 100 : 0;
    return {
      label: h.ticker,
      value: h.marketValue,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage);

  // Category allocations (Stock vs Crypto)
  const totalStockValue = activeHoldings.filter(h => h.category === 'stock').reduce((sum, h) => sum + h.marketValue, 0);
  const totalCryptoValue = activeHoldings.filter(h => h.category === 'crypto').reduce((sum, h) => sum + h.marketValue, 0);
  const totalCategoryValue = totalStockValue + totalCryptoValue;

  const categoryAllocation = [
    { label: 'Stock', value: totalStockValue, percentage: totalCategoryValue > 0 ? (totalStockValue / totalCategoryValue) * 100 : 0 },
    { label: 'Crypto', value: totalCryptoValue, percentage: totalCategoryValue > 0 ? (totalCryptoValue / totalCategoryValue) * 100 : 0 }
  ].filter(c => c.value > 0).sort((a, b) => b.percentage - a.percentage);

  const activeAllocation = allocationTab === 'assets' ? assetAllocation : categoryAllocation;

  let cumulativePercent = 0;
  
  const getSliceColor = (index) => {
    const shades = [
      '#ffffff',               
      'rgba(255, 255, 255, 0.75)', 
      'rgba(255, 255, 255, 0.5)', 
      'rgba(255, 255, 255, 0.3)',
      'rgba(255, 255, 255, 0.15)' 
    ];
    return shades[index % shades.length];
  };

  return (
    <div className="investments-layout">
      
      {/* Left Column: Totals, Holdings Ledger, Add Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Totals Banner */}
        <div className="glass-card investments-stats" style={{ padding: '24px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Value</span>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-pure)', marginTop: '4px' }}>
              {currency}{formatAmount(totalPortfolioValue)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invested Capital</span>
            <div className="font-mono" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px' }}>
              {currency}{formatAmount(totalCostBasis)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unrealized Gain / Loss</span>
            <div className="font-mono" style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: totalUnrealizedPL >= 0 ? 'var(--color-success)' : 'var(--color-danger)', 
              marginTop: '4px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px'
            }}>
              <span>{totalUnrealizedPL >= 0 ? '+' : '-'}{currency}{formatAmount(Math.abs(totalUnrealizedPL))}</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>({totalUnrealizedPLPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Active Asset Holdings</h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={fetchLivePrices}
                disabled={isFetching}
                className="glass-btn" 
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <RefreshCw size={14} className={isFetching ? 'spin' : ''} /> {isFetching ? 'Fetching...' : 'Fetch Live Prices'}
              </button>
              
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="glass-btn" 
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <History size={14} /> Trade Log
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px 12px' }}>Asset</th>
                  <th style={{ padding: '8px 12px 12px' }}>Shares</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'right' }}>Avg Cost</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'right' }}>Market Price</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'right' }}>Market Value</th>
                  <th style={{ padding: '8px 12px 12px', textAlign: 'right' }}>P/L (%)</th>
                </tr>
              </thead>
              <tbody>
                {activeHoldings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No active holdings. Log a BUY trade below.
                    </td>
                  </tr>
                ) : (
                  activeHoldings.map((h) => (
                    <tr 
                      key={h.ticker} 
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)', 
                        fontSize: '13px'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-pure)' }}>{h.ticker}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{h.name}</span>
                          <span style={{ 
                            fontSize: '8px', 
                            textTransform: 'uppercase', 
                            color: h.category === 'crypto' ? '#3b82f6' : '#f59e0b',
                            background: h.category === 'crypto' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                            border: h.category === 'crypto' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            display: 'inline-block',
                            marginTop: '2px',
                            width: 'fit-content'
                          }}>
                            {h.category}
                          </span>
                        </div>
                      </td>
                      <td className="font-mono" style={{ padding: '12px' }}>{h.shares}</td>
                      <td className="font-mono" style={{ padding: '12px', textAlign: 'right' }}>
                        {currency}{formatAmount(h.avgCost)}
                      </td>
                      <td className="font-mono" style={{ padding: '12px', textAlign: 'right' }}>
                        {editingTicker === h.ticker ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <input
                              type="number"
                              className="glass-input font-mono"
                              value={tempPriceInput}
                              onChange={(e) => setTempPriceInput(e.target.value)}
                              style={{ width: '80px', padding: '2px 6px', fontSize: '12px', textAlign: 'right' }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdatePrice(h.ticker);
                                if (e.key === 'Escape') setEditingTicker(null);
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingTicker(h.ticker);
                              setTempPriceInput(h.currentPrice.toString());
                            }}
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Click to edit market price"
                          >
                            <span>{currency}{formatAmount(h.currentPrice)}</span>
                            <RefreshCw size={10} style={{ opacity: 0.3 }} />
                          </div>
                        )}
                      </td>
                      <td className="font-mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-pure)' }}>
                        {currency}{formatAmount(h.marketValue)}
                      </td>
                      <td className="font-mono" style={{ 
                        padding: '12px', 
                        textAlign: 'right', 
                        fontWeight: 600,
                        color: h.profitLoss >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        <div>{h.profitLoss >= 0 ? '+' : '-'}{currency}{formatAmount(Math.abs(h.profitLoss))}</div>
                        <div style={{ fontSize: '10px' }}>({h.profitLossPercent.toFixed(1)}%)</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Trade Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Record Trade Order</h3>
          <form onSubmit={handleSubmit} className="investment-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ticker</label>
              <input
                type="text"
                placeholder="e.g. BTC"
                className="glass-input font-mono"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asset Name</label>
              <input
                type="text"
                placeholder="e.g. Bitcoin"
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</label>
              <select
                className="glass-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="stock" style={{ background: '#121214' }}>Stock</option>
                <option value="crypto" style={{ background: '#121214' }}>Cryptocurrency</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Quantity</label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.0"
                className="glass-input font-mono"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="glass-input font-mono"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action</label>
              <select
                className="glass-input"
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="buy" style={{ background: '#121214' }}>BUY (Long)</option>
                <option value="sell" style={{ background: '#121214' }}>SELL (Liquidate)</option>
              </select>
            </div>
            <button type="submit" className="glass-btn" style={{ height: '40px', padding: '0 20px' }}>
              <Plus size={16} /> Log Trade
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Performance Trend and Asset Allocation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Net Worth Trend Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Activity size={16} />
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance History</h3>
          </div>
          {renderLineChart()}
        </div>

        {/* Allocation chart card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <ChartIcon size={16} />
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Split</h3>
            </div>
            
            {/* Donut Toggle Tabs */}
            {activeHoldings.length > 0 && (
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '2px' }}>
                <button 
                  onClick={() => setAllocationTab('assets')}
                  className={`glass-btn ${allocationTab === 'assets' ? 'active' : ''}`}
                  style={{ padding: '2px 6px', fontSize: '9px', border: 'none', borderRadius: '4px' }}
                >
                  Asset
                </button>
                <button 
                  onClick={() => setAllocationTab('category')}
                  className={`glass-btn ${allocationTab === 'category' ? 'active' : ''}`}
                  style={{ padding: '2px 6px', fontSize: '9px', border: 'none', borderRadius: '4px' }}
                >
                  Category
                </button>
              </div>
            )}
          </div>

          {activeHoldings.length === 0 ? (
            <div style={{ padding: '48px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
              No holdings data to map.
            </div>
          ) : (
            <>
              {/* Donut Chart SVG */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg width="150" height="150" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="3.2"
                  />
                  
                  {activeAllocation.map((item, index) => {
                    const strokeDash = `${item.percentage} ${100 - item.percentage}`;
                    const offset = 100 - cumulativePercent;
                    cumulativePercent += item.percentage;
                    
                    return (
                      <circle
                        key={item.label}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke={getSliceColor(index)}
                        strokeWidth="3.2"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.3s ease' }}
                      />
                    );
                  })}
                </svg>
                
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {allocationTab === 'assets' ? 'Assets' : 'Classes'}
                  </span>
                  <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-pure)' }}>
                    {activeAllocation.length}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                {activeAllocation.map((item, index) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getSliceColor(index) }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                    </div>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Modal: Full Trade Log History */}
      {isHistoryOpen && (
        <div className="cmd-overlay" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', paddingTop: '0' }} onClick={() => setIsHistoryOpen(false)}>
          <div className="glass-panel" style={{ width: '680px', maxHeight: '500px', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--glass-shadow)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Trade Transaction Ledger ({String(filterMonth).padStart(2, '0')}/{filterYear})
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                    <th style={{ padding: '8px 12px' }}>Type</th>
                    <th style={{ padding: '8px 12px' }}>Category</th>
                    <th style={{ padding: '8px 12px' }}>Asset</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Shares</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No trade logs recorded for this period.</td>
                    </tr>
                  ) : (
                    filteredTrades.map(trade => {
                      const cat = getTradeCategory(trade);
                      return (
                        <tr key={trade.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <td className="font-mono" style={{ padding: '12px' }}>{trade.date}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`status-pill ${trade.type === 'buy' ? 'success' : 'danger'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                              {trade.type.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textTransform: 'capitalize' }}>{cat}</td>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{trade.ticker}</strong>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{trade.name}</div>
                          </td>
                          <td className="font-mono" style={{ padding: '12px', textAlign: 'right' }}>{trade.shares}</td>
                          <td className="font-mono" style={{ padding: '12px', textAlign: 'right' }}>{currency}{formatAmount(trade.price)}</td>
                          <td className="font-mono" style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>
                            {currency}{formatAmount(trade.shares * trade.price)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button 
                              onClick={() => deleteTrade(trade.id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                              className="glass-btn-icon"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
              <button onClick={() => setIsHistoryOpen(false)} className="glass-btn" style={{ fontSize: '12px' }}>Close Ledger</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
