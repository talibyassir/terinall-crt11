
import React, { useState, useMemo } from 'react';
import { Search, X, Star, Globe, Activity } from 'lucide-react';

interface SymbolItem {
    symbol: string;
    description: string;
    exchange: string;
    type: string;
    leverage?: number;
}

interface SymbolSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (symbol: string) => void;
}

const ExchangeLogos: Record<string, React.ReactNode> = {
    binance: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#F0B90B]">
            <path d="M12 3L9 6L12 9L15 6L12 3ZM5 10L2 13L5 16L8 13L5 10ZM19 10L16 13L19 16L22 13L19 10ZM12 15L9 18L12 21L15 18L12 15ZM12 11L10 13L12 15L14 13L12 11Z" />
        </svg>
    ),
    bybit: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
            <path d="M4 4h6v16H4V4zm10 0h6v7h-6V4zm0 9h6v7h-6v-7z" />
        </svg>
    ),
    okx: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
            <path d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm12 0h4v4h-4v-4zM10 10h4v4h-4v-4z" />
        </svg>
    ),
    coinbase: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#0052FF]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6-6 6z" />
        </svg>
    ),
    hyperliquid: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#00D1C6]">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
        </svg>
    ),
    blofin: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-orange-500">
            <path d="M6 2h12v4l-4 4 4 4v4l-4 4H6v-4l4-4-4-4V2zm4 4v2l2 2 2-2V6h-4zm0 12v-2l2-2 2 2v2h-4z" />
        </svg>
    ),
    bitmex: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#EB3B2E]">
            <path d="M4 12l8-8 8 8-8 8-8-8zm2 0l6 6 6-6-6-6-6 6z" />
        </svg>
    ),
    any: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-400">
            <circle cx="12" cy="12" r="8" />
        </svg>
    )
};

const MOCK_SYMBOLS: SymbolItem[] = [
    { symbol: 'BTC', description: 'USD', exchange: 'binance', type: 'Futures (USD Perp)', leverage: 125 },
    { symbol: 'ETH', description: 'USDT', exchange: 'binance', type: 'Futures (USD Perp)', leverage: 100 },
    { symbol: 'SOL', description: 'USDT', exchange: 'bybit', type: 'Futures (USD Perp)', leverage: 50 },
    { symbol: 'BTC', description: 'USD', exchange: 'coinbase', type: 'Spot' },
    { symbol: 'ETH', description: 'USD', exchange: 'hyperliquid', type: 'Futures (USD Perp)', leverage: 50 },
    { symbol: 'AVAX', description: 'USDT', exchange: 'binance', type: 'Futures (USD Perp)', leverage: 20 },
    { symbol: 'DOGE', description: 'USDT', exchange: 'okx', type: 'Futures (USD Perp)', leverage: 20 },
    { symbol: '1000PEPE', description: 'USDT', exchange: 'binance', type: 'Futures (USD Perp)', leverage: 50 },
    { symbol: 'WIF', description: 'USDT', exchange: 'bybit', type: 'Futures (USD Perp)', leverage: 25 },
    { symbol: 'LINK', description: 'USDT', exchange: 'binance', type: 'Spot' },
    { symbol: 'XRP', description: 'USDT', exchange: 'bitmex', type: 'Futures (COIN Perp)', leverage: 100 },
];

const SymbolSelector: React.FC<SymbolSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [activeExchange, setActiveExchange] = useState('All');

    const filteredSymbols = useMemo(() => {
        return MOCK_MESSAGES.filter(item => {
            const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase());
            const matchesTab = activeTab === 'All' || 
                               (activeTab === 'Spot' && item.type === 'Spot') ||
                               (activeTab === 'Futures (USD Perp)' && item.type.includes('USD Perp'));
            const matchesExchange = activeExchange === 'All' || item.exchange === activeExchange;
            
            return matchesSearch && matchesTab && matchesExchange;
        });
    }, [search, activeTab, activeExchange]);

    // Use internal mock messages or the defined MOCK_SYMBOLS
    // Re-assigning for clarity inside the component logic
    const data = MOCK_SYMBOLS.filter(item => {
        const matchesSearch = item.symbol.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'All' || 
                           (activeTab === 'Spot' && item.type === 'Spot') ||
                           (activeTab === 'Futures' && item.type.includes('Futures'));
        const matchesExchange = activeExchange === 'All' || item.exchange === activeExchange;
        return matchesSearch && matchesTab && matchesExchange;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-[800px] bg-[#0e0f13] border border-gray-800 rounded-sm shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#16171d] border-b border-gray-800">
                    <div className="text-xs font-mono text-gray-400">Chart | <span className="text-white font-bold">Find a symbol</span></div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Find a symbol" 
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0b0c10] border border-gray-700 text-white text-sm py-2 pl-9 pr-4 focus:border-blue-500 outline-none rounded-sm placeholder-gray-600 font-mono"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 pb-2 flex flex-col gap-2">
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {['All', 'My Favourites', 'Spot', 'Futures (USD Perp)', 'Futures (COIN Perp)', 'Popular'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab === 'Futures (USD Perp)' || tab === 'Futures (COIN Perp)' ? 'Futures' : tab)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-sm whitespace-nowrap transition-colors border ${
                                    (tab.includes('Futures') && activeTab === 'Futures') || activeTab === tab
                                    ? 'bg-[#2962ff] border-[#2962ff] text-white' 
                                    : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Exchanges */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar items-center py-1">
                        <button 
                            onClick={() => setActiveExchange('All')}
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded-sm border ${activeExchange === 'All' ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                        >
                            All
                        </button>
                        {Object.keys(ExchangeLogos).filter(k => k !== 'any').map(ex => (
                            <button
                                key={ex}
                                onClick={() => setActiveExchange(ex)}
                                className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all ${
                                    activeExchange === ex 
                                    ? 'bg-white/10 border-white/30 scale-110' 
                                    : 'bg-[#111217] border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                                }`}
                                title={ex}
                            >
                                <div className="w-3.5 h-3.5">
                                    {ExchangeLogos[ex]}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Header */}
                <div className="grid grid-cols-12 px-4 py-2 text-[9px] font-bold text-gray-600 uppercase border-b border-gray-800 bg-[#111217]">
                    <div className="col-span-3">Symbol</div>
                    <div className="col-span-2 text-right">Description</div>
                    <div className="col-span-4 pl-8">Exchange</div>
                    <div className="col-span-3 text-right">Type</div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0b0c10]">
                    {data.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => {
                                onSelect(`${item.symbol}${item.description}`);
                                onClose();
                            }}
                            className="grid grid-cols-12 px-4 py-2 text-[11px] items-center border-b border-gray-800/50 hover:bg-[#16171d] cursor-pointer group transition-colors"
                        >
                            <div className="col-span-3 flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                    {item.symbol[0]}
                                </div>
                                <span className="font-bold text-white">{item.symbol}</span>
                            </div>
                            <div className="col-span-2 text-right text-gray-500 font-mono">
                                {item.description}
                            </div>
                            <div className="col-span-4 pl-8 flex items-center gap-2">
                                <div className="w-4 h-4">
                                    {ExchangeLogos[item.exchange] || ExchangeLogos['any']}
                                </div>
                                <span className="uppercase text-gray-400 font-bold text-[9px] group-hover:text-white transition-colors">{item.exchange}</span>
                            </div>
                            <div className="col-span-3 text-right flex items-center justify-end gap-2">
                                <span className="text-gray-500">{item.type}</span>
                                {item.leverage && (
                                    <span className="bg-yellow-500/10 text-yellow-500 px-1 rounded text-[8px] border border-yellow-500/20">
                                        {item.leverage}x
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="p-8 text-center text-gray-600 text-xs italic">
                            No symbols found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Placeholder for missing MOCK_MESSAGES reference in the useMemo above, logic updated to use MOCK_SYMBOLS
const MOCK_MESSAGES: any[] = []; 

export default SymbolSelector;
