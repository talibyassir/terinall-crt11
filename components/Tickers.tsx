
import React, { useState, useMemo, useEffect } from 'react';
import { Star, Search, Plus, X, Check, Info, Globe, Server, Phone, Activity, Terminal } from 'lucide-react';

type Exchange = 'binance' | 'bybit' | 'okx' | 'coinbase' | 'hyperliquid' | 'blofin' | 'bitmex' | 'insilico';

interface Ticker {
  id: string;
  symbol: string;
  exchange: Exchange;
  price: number;
  change24h: number;
  vol24h: number; 
  funding?: number;
  oi?: number; 
  tags: string[];
}

interface TickersProps {
    onSymbolSelect?: (symbol: string) => void;
}

interface ExchangeDetails {
    status: 'Operational' | 'Degraded' | 'Maintenance';
    pairs: number;
    api: string;
    region: string;
    contact: string;
    website: string;
}

const EXCHANGE_DETAILS: Record<string, ExchangeDetails> = {
    binance: { status: 'Operational', pairs: 1450, api: 'v3 (Rest) / v1 (WS)', region: 'Global', contact: 'support@binance.com', website: 'binance.com' },
    bybit: { status: 'Operational', pairs: 850, api: 'v5 (Unified)', region: 'Dubai', contact: 'support@bybit.com', website: 'bybit.com' },
    okx: { status: 'Degraded', pairs: 720, api: 'v5', region: 'Seychelles', contact: 'support@okx.com', website: 'okx.com' },
    coinbase: { status: 'Operational', pairs: 450, api: 'Advanced Trade', region: 'USA', contact: 'help.coinbase.com', website: 'coinbase.com' },
    hyperliquid: { status: 'Operational', pairs: 120, api: 'L1', region: 'DeFi', contact: 'Discord', website: 'hyperliquid.xyz' },
    blofin: { status: 'Operational', pairs: 200, api: 'v1', region: 'Global', contact: 'support@blofin.com', website: 'blofin.com' },
    bitmex: { status: 'Maintenance', pairs: 150, api: 'Rest/WS', region: 'Seychelles', contact: 'support@bitmex.com', website: 'bitmex.com' },
    insilico: { status: 'Operational', pairs: 50, api: 'Proprietary', region: 'Metaverse', contact: 'admin@insilico.terminal', website: 'insilico.com' },
};

// SVG Logos for Exchanges
const ExchangeLogos: Record<string, React.ReactNode> = {
    binance: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 3L9 6L12 9L15 6L12 3ZM5 10L2 13L5 16L8 13L5 10ZM19 10L16 13L19 16L22 13L19 10ZM12 15L9 18L12 21L15 18L12 15ZM12 11L10 13L12 15L14 13L12 11Z" />
        </svg>
    ),
    bybit: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M4 4h6v16H4V4zm10 0h6v7h-6V4zm0 9h6v7h-6v-7z" />
        </svg>
    ),
    okx: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm12 0h4v4h-4v-4zM10 10h4v4h-4v-4z" />
        </svg>
    ),
    coinbase: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6-6 6z" />
        </svg>
    ),
    hyperliquid: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
        </svg>
    ),
    blofin: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M6 2h12v4l-4 4 4 4v4l-4 4H6v-4l4-4-4-4V2zm4 4v2l2 2 2-2V6h-4zm0 12v-2l2-2 2 2v2h-4z" />
        </svg>
    ),
    bitmex: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M4 12l8-8 8 8-8 8-8-8zm2 0l6 6 6-6-6-6-6 6z" />
        </svg>
    ),
    insilico: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
    ),
    any: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <circle cx="12" cy="12" r="8" />
        </svg>
    )
};

const EXCHANGES: { id: Exchange | 'any'; label: string; color: string }[] = [
    { id: 'any', label: 'Any', color: '#10b981' },
    { id: 'insilico', label: 'InSilico', color: '#26a69a' },
    { id: 'bybit', label: 'Bybit', color: '#f59e0b' },
    { id: 'hyperliquid', label: 'Hyperliquid', color: '#22d3ee' },
    { id: 'binance', label: 'Binance', color: '#fbbf24' },
    { id: 'okx', label: 'OKX', color: '#fff' },
    { id: 'coinbase', label: 'Coinbase', color: '#3b82f6' },
    { id: 'blofin', label: 'BLOFIN', color: '#f97316' },
    { id: 'bitmex', label: 'BitMEX', color: '#ef4444' },
];

const INITIAL_MOCK_TICKERS: Ticker[] = [
    { id: '1', symbol: 'BTCUSDT', exchange: 'binance', price: 90589.5, change24h: -1.0, vol24h: 11980000000, funding: 0.00182, tags: ['USD-M'] },
    { id: '2', symbol: 'ETHUSDT', exchange: 'binance', price: 3007.31, change24h: -1.6, vol24h: 10870000000, funding: -0.00127, tags: ['USD-M'] },
    { id: '3', symbol: 'SOLUSDT', exchange: 'binance', price: 136.98, change24h: -2.9, vol24h: 2610000000, funding: 0.00802, oi: 1030000000, tags: ['USD-M'] },
    { id: '4', symbol: 'XRPUSDT', exchange: 'binance', price: 2.181, change24h: -2.5, vol24h: 1390000000, funding: -0.00955, tags: ['USD-M'] },
    { id: '5', symbol: 'BTCUSDT', exchange: 'bybit', price: 90606.6, change24h: -1.0, vol24h: 6100000000, funding: 0, oi: 4980000000, tags: ['linear'] },
    { id: '6', symbol: 'ETHUSDT', exchange: 'bybit', price: 3007.81, change24h: -1.6, vol24h: 3320000000, funding: -0.01329, oi: 2110000000, tags: ['linear'] },
    { id: '7', symbol: 'SOLUSDT', exchange: 'bybit', price: 136.96, change24h: -3.0, vol24h: 1270000000, funding: 0.01, oi: 743100000, tags: ['linear'] },
    { id: '8', symbol: 'ETH-USDT-SWAP', exchange: 'okx', price: 3007.39, change24h: -1.6, vol24h: 8110000000, funding: -0.00252, oi: 1740000000, tags: ['swap'] },
    { id: '9', symbol: 'BTC-USDT-SWAP', exchange: 'okx', price: 90595.5, change24h: -1.0, vol24h: 7340000000, funding: 0.00284, oi: 2250000000, tags: ['swap'] },
    { id: '10', symbol: 'SOL-USDT-SWAP', exchange: 'okx', price: 136.96, change24h: -2.9, vol24h: 1090000000, funding: 0.00569, oi: 347500000, tags: ['swap'] },
    { id: '11', symbol: 'BTCJPY', exchange: 'binance', price: 14184994, change24h: -1.2, vol24h: 3990000000, tags: ['SPOT'] },
    { id: '12', symbol: 'BTCUSDT', exchange: 'hyperliquid', price: 90623.8, change24h: -0.3, vol24h: 3060000000, funding: 0.01, oi: 2470000000, tags: ['USD-M'] },
    { id: '13', symbol: 'BTCUSDC', exchange: 'binance', price: 90622.9, change24h: -1.0, vol24h: 2980000000, funding: 0.00372, tags: ['USD-M'] },
    { id: '14', symbol: 'ETHUSDC', exchange: 'binance', price: 3008.51, change24h: -1.6, vol24h: 2930000000, funding: -0.00044, tags: ['USD-M'] },
    { id: '15', symbol: 'BTC-USDC', exchange: 'hyperliquid', price: 90602, change24h: -1.1, vol24h: 2610000000, funding: -0.00017, oi: 24800000000, tags: ['perpetuals'] },
    { id: '16', symbol: 'BTC-PERP-INTX', exchange: 'coinbase', price: 90679.8, change24h: -1.0, vol24h: 2560000000, funding: 0.0001, oi: 1200000000, tags: ['Perps'] },
    { id: '17', symbol: 'ETHUSDT', exchange: 'hyperliquid', price: 3008.59, change24h: -0.7, vol24h: 2190000000, funding: 0.0043, oi: 1750000000, tags: ['USD-M'] },
    { id: '18', symbol: 'USDCUSDT', exchange: 'binance', price: 0.9997, change24h: -0.0, vol24h: 1970000000, tags: ['SPOT'] },
    { id: '19', symbol: 'XRPJPY', exchange: 'binance', price: 341.64, change24h: -2.6, vol24h: 1660000000, tags: ['SPOT'] },
    { id: '20', symbol: 'BTCFDUSD', exchange: 'binance', price: 90950.39, change24h: -1.0, vol24h: 1580000000, tags: ['SPOT'] },
    { id: '21', symbol: 'INS-PERP', exchange: 'insilico', price: 420.69, change24h: 69.0, vol24h: 888888888, funding: 0.0420, oi: 9999999, tags: ['Index'] },
];

const STORAGE_KEY_FAVS = 'INSILICO_FAVORITES';

const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toString();
};

const ExchangeIcon: React.FC<{ exchange: string; className?: string }> = ({ exchange, className = "w-3 h-3" }) => {
    const key = exchange.toLowerCase();
    const logo = ExchangeLogos[key] || ExchangeLogos['any'];
    const color = EXCHANGES.find(e => e.id === key)?.color || '#999';
    
    return (
        <div className={`${className} flex items-center justify-center`} style={{ color }}>
            {logo}
        </div>
    );
};

const ExchangeTooltip: React.FC<{ exchange: string; x: number; y: number }> = ({ exchange, x, y }) => {
    const details = EXCHANGE_DETAILS[exchange];
    if (!details) return null;

    return (
        <div 
            className="fixed z-[100] bg-[#16171d] border border-terminal-border/50 shadow-2xl p-3 rounded pointer-events-none animate-in fade-in duration-150"
            style={{ top: y + 15, left: x + 10 }}
        >
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <ExchangeIcon exchange={exchange} className="w-4 h-4" />
                <span className="font-bold text-gray-200 uppercase tracking-wider text-[10px]">{exchange}</span>
            </div>
            <div className="space-y-1 text-[9px] font-mono text-gray-400">
                <div className="flex justify-between gap-4">
                    <span>Status:</span>
                    <span className={details.status === 'Operational' ? 'text-terminal-green' : 'text-terminal-red'}>{details.status}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span>API:</span>
                    <span className="text-gray-300">{details.api}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span>Contact:</span>
                    <span className="text-gray-300">{details.contact}</span>
                </div>
            </div>
        </div>
    );
};

const ExchangeDetailModal: React.FC<{ exchange: string; onClose: () => void }> = ({ exchange, onClose }) => {
    const details = EXCHANGE_DETAILS[exchange];
    if (!details) return null;

    return (
        <div className="absolute inset-0 bg-[#0b0c10]/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#16171d] border border-terminal-border rounded-sm w-64 shadow-2xl relative overflow-hidden">
                <div className={`h-1 w-full ${details.status === 'Operational' ? 'bg-terminal-green' : 'bg-terminal-red'}`}></div>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                    <X size={14} />
                </button>
                
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/10 shadow-lg bg-[#0b0c10]`}>
                            <ExchangeIcon exchange={exchange} className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold uppercase tracking-wider text-sm">{exchange}</h3>
                            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                <Globe size={8} /> {details.website}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 font-mono text-[10px]">
                        <div className="flex justify-between items-center border-b border-terminal-border/20 pb-1">
                            <span className="text-gray-500 flex items-center gap-1"><Activity size={10} /> Status</span>
                            <span className={`${details.status === 'Operational' ? 'text-terminal-green' : 'text-terminal-red'} font-bold`}>{details.status}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-terminal-border/20 pb-1">
                            <span className="text-gray-500 flex items-center gap-1"><Server size={10} /> API</span>
                            <span className="text-gray-300">{details.api}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-terminal-border/20 pb-1">
                            <span className="text-gray-500 flex items-center gap-1"><Globe size={10} /> Region</span>
                            <span className="text-gray-300">{details.region}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-terminal-border/20 pb-1">
                            <span className="text-gray-500 flex items-center gap-1"><Activity size={10} /> Pairs</span>
                            <span className="text-gray-300">{details.pairs}+</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 flex items-center gap-1"><Phone size={10} /> Contact</span>
                            <span className="text-terminal-highlight truncate max-w-[100px] cursor-pointer hover:underline">{details.contact}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Tickers: React.FC<TickersProps> = ({ onSymbolSelect }) => {
  const [tickers, setTickers] = useState<Ticker[]>(INITIAL_MOCK_TICKERS);
  const [filterExchange, setFilterExchange] = useState<Exchange | 'any'>('any');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Ticker>('vol24h');
  const [sortDesc, setSortDesc] = useState(true);

  // Favorites logic
  const [favorites, setFavorites] = useState<Set<string>>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY_FAVS);
          if (saved) {
              return new Set(JSON.parse(saved));
          }
          return new Set(['1', '2', '3']);
      } catch {
          return new Set();
      }
  });
  const [showFavorites, setShowFavorites] = useState(false);

  // Add Symbol Logic
  const [isAdding, setIsAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  // Exchange Modal Logic
  const [selectedExchangeDetails, setSelectedExchangeDetails] = useState<string | null>(null);

  // Tooltip Logic
  const [tooltip, setTooltip] = useState<{ exchange: string; x: number; y: number } | null>(null);

  // Persist favorites
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Simulate real-time funding rate updates
  useEffect(() => {
    const interval = setInterval(() => {
        setTickers(prev => prev.map(t => {
            if (t.funding !== undefined) {
                const flux = (Math.random() - 0.5) * 0.00005;
                const newFunding = t.funding + flux;
                return { ...t, funding: parseFloat(newFunding.toFixed(5)) };
            }
            return t;
        }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredTickers = useMemo(() => {
    return tickers.filter(t => {
        if (showFavorites && !favorites.has(t.id)) return false;
        if (filterExchange !== 'any' && t.exchange !== filterExchange) return false;
        if (search && !t.symbol.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    }).sort((a, b) => {
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortDesc ? valB - valA : valA - valB;
        }
        return 0;
    });
  }, [tickers, filterExchange, search, sortField, sortDesc, showFavorites, favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const handleAddTicker = () => {
      if (!newSymbol.trim()) return;
      const cleanSymbol = newSymbol.toUpperCase().trim();
      
      const newTicker: Ticker = {
          id: `custom-${Date.now()}`,
          symbol: cleanSymbol,
          exchange: 'binance',
          price: Math.random() * 5000 + 100,
          change24h: (Math.random() - 0.5) * 10,
          vol24h: Math.random() * 10000000,
          funding: 0.001,
          tags: ['Custom'],
      };

      setTickers(prev => [newTicker, ...prev]);
      setNewSymbol('');
      setIsAdding(false);
  };

  const handleRowClick = (symbol: string) => {
      let cleanSymbol = symbol;
      if (symbol.includes('-')) cleanSymbol = symbol.replace(/-/g, '');
      if (symbol.includes('_')) cleanSymbol = symbol.split('_')[0] + 'USDT'; 

      if (onSymbolSelect) {
          onSymbolSelect(cleanSymbol);
      }
  };

  const handleTooltipEnter = (e: React.MouseEvent, exchange: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate position relative to viewport
      setTooltip({ exchange, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] font-mono text-[10px] select-none relative">
      {selectedExchangeDetails && (
          <ExchangeDetailModal 
            exchange={selectedExchangeDetails} 
            onClose={() => setSelectedExchangeDetails(null)} 
          />
      )}

      {tooltip && (
          <ExchangeTooltip exchange={tooltip.exchange} x={tooltip.x} y={tooltip.y} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-x-2 gap-y-2 p-2 border-b border-terminal-border/30">
        <button 
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border border-transparent hover:border-terminal-border/50 ${showFavorites ? 'text-yellow-400 font-bold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Star size={10} fill={showFavorites ? "currentColor" : "none"} />
            Favs
        </button>

        {EXCHANGES.map(ex => (
            <div 
                key={ex.id}
                className={`flex items-center rounded border transition-all overflow-hidden ${filterExchange === ex.id ? 'bg-white/5 border-terminal-border/50' : 'border-transparent hover:bg-white/5'}`}
                onMouseEnter={(e) => ex.id !== 'any' && handleTooltipEnter(e, ex.id)}
                onMouseLeave={() => setTooltip(null)}
            >
                {/* Icon triggers Filter */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setFilterExchange(ex.id);
                    }}
                    className={`pl-1.5 pr-1 py-0.5 flex items-center justify-center transition-opacity hover:opacity-80`}
                >
                    <ExchangeIcon exchange={ex.id} className="w-3 h-3" />
                </button>
                {/* Label triggers Modal (as requested) */}
                <button 
                    onClick={() => {
                        if (ex.id !== 'any') setSelectedExchangeDetails(ex.id);
                    }}
                    className={`pr-1.5 pl-0.5 py-0.5 font-bold transition-colors ${filterExchange === ex.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    style={{ color: filterExchange === ex.id ? ex.color : undefined }}
                >
                    {ex.label}
                </button>
            </div>
        ))}
      </div>

      {/* Search / Add Bar */}
      <div className="px-2 py-1.5 border-b border-terminal-border/30">
          {isAdding ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                   <input 
                        type="text" 
                        placeholder="Symbol (e.g. DOGE)" 
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTicker()}
                        autoFocus
                        className="flex-1 bg-terminal-highlight/10 border border-terminal-highlight rounded outline-none text-white px-2 py-0.5 font-bold uppercase placeholder-gray-500"
                   />
                   <button onClick={handleAddTicker} className="p-0.5 bg-terminal-green text-black rounded hover:bg-white transition-colors"><Check size={12} /></button>
                   <button onClick={() => setIsAdding(false)} className="p-0.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"><X size={12} /></button>
              </div>
          ) : (
              <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="search..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-terminal-green placeholder-terminal-green/50 font-bold pl-0"
                        />
                        <Search size={10} className="absolute right-0 top-1 text-terminal-green/50" />
                  </div>
                  <button 
                    onClick={() => setIsAdding(true)} 
                    title="Add custom ticker"
                    className="text-gray-500 hover:text-terminal-highlight transition-colors"
                  >
                      <Plus size={12} />
                  </button>
              </div>
          )}
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-2 py-1.5 text-gray-500 border-b border-terminal-border/30 font-bold uppercase tracking-wider bg-[#16171d]">
          <div className="col-span-4 pl-4 cursor-pointer hover:text-white" onClick={() => { setSortField('symbol'); setSortDesc(!sortDesc); }}>Symbol</div>
          <div className="col-span-2 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('price'); setSortDesc(!sortDesc); }}>Price</div>
          <div className="col-span-2 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('change24h'); setSortDesc(!sortDesc); }}>24h %</div>
          <div className="col-span-2 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('funding'); setSortDesc(!sortDesc); }}>Funding</div>
          <div className="col-span-1 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('oi'); setSortDesc(!sortDesc); }}>OI</div>
          <div className="col-span-1 text-right cursor-pointer hover:text-white" onClick={() => { setSortField('vol24h'); setSortDesc(!sortDesc); }}>24h vol</div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredTickers.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleRowClick(t.symbol)}
                className="grid grid-cols-12 gap-2 px-2 py-1.5 items-center hover:bg-white/5 border-b border-terminal-border/10 group cursor-pointer"
              >
                  {/* Symbol Column */}
                  <div className="col-span-4 flex items-center gap-2 overflow-hidden">
                      <div onClick={(e) => toggleFavorite(e, t.id)} className="cursor-pointer">
                        <Star size={10} className={`${favorites.has(t.id) ? 'text-yellow-400' : 'text-gray-700'} hover:text-yellow-200 transition-colors`} fill={favorites.has(t.id) ? "currentColor" : "none"} />
                      </div>
                      
                      {/* Icon opens details */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedExchangeDetails(t.exchange); }} 
                        className="cursor-pointer hover:scale-110 transition-transform"
                        onMouseEnter={(e) => handleTooltipEnter(e, t.exchange)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                          <ExchangeIcon exchange={t.exchange} />
                      </div>

                      <div className="flex items-center gap-1 truncate">
                        <span className="text-gray-200 font-bold text-[11px] truncate">{t.symbol}</span>
                        {t.tags.map(tag => (
                            <span 
                                key={tag} 
                                className={`px-1 rounded-[2px] text-[8px] font-bold uppercase leading-tight
                                    ${tag === 'USD-M' || tag === 'USDT' || tag === 'COIN-M' ? 'bg-[#10b981]/20 text-[#10b981]' : 
                                      tag === 'SPOT' ? 'bg-[#22d3ee]/20 text-[#22d3ee]' : 
                                      tag === 'linear' ? 'bg-transparent border border-gray-600 text-[#10b981]' : 
                                      tag === 'swap' ? 'bg-[#10b981]/20 text-[#10b981]' :
                                      'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                      </div>
                  </div>

                  {/* Price */}
                  <div className={`col-span-2 text-right font-mono text-[11px] ${t.change24h >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {t.price < 100 ? t.price.toLocaleString(undefined, {minimumFractionDigits: 4}) : t.price.toLocaleString()}
                  </div>

                  {/* 24h Change */}
                  <div className={`col-span-2 text-right font-mono ${t.change24h >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {t.change24h > 0 ? '+' : ''}{t.change24h}%
                  </div>

                  {/* Funding */}
                  <div className={`col-span-2 text-right font-mono ${t.funding && t.funding > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                      {t.funding !== undefined ? `${t.funding.toFixed(5)}%` : ''}
                  </div>
                  
                  {/* OI */}
                  <div className="col-span-1 text-right text-gray-400 font-mono">
                      {t.oi ? formatNumber(t.oi) : ''}
                  </div>

                   {/* Vol */}
                   <div className="col-span-1 text-right text-gray-300 font-mono">
                      {formatNumber(t.vol24h)}
                  </div>
              </div>
          ))}
          {filteredTickers.length === 0 && (
              <div className="text-center py-10 text-gray-600 italic">
                  {showFavorites ? "No favorites yet. Click the star icon to add." : "No tickers found."}
              </div>
          )}
      </div>
    </div>
  );
};

export default Tickers;
