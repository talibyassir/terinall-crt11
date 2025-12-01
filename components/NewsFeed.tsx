import React from 'react';
import { Rss, ExternalLink } from 'lucide-react';

const NEWS_ITEMS = [
    { time: '10:42', source: 'CoinTelegraph', title: 'BTC breaks $57k resistance level amid heavy institutional buying', sentiment: 'bull' },
    { time: '10:38', source: 'Twitter', title: 'Whale Alert: 10,000 ETH moved to Binance', sentiment: 'bear' },
    { time: '10:15', source: 'System', title: 'Funding rate updated: 0.0100%', sentiment: 'neutral' },
    { time: '09:55', source: 'Bloomberg', title: 'SEC delays decision on Ethereum ETF', sentiment: 'bear' },
    { time: '09:30', source: 'Reuters', title: 'US Inflation data lower than expected', sentiment: 'bull' },
    { time: '09:12', source: 'Glassnode', title: 'Bitcoin exchange outflows hit 3-month high', sentiment: 'bull' },
    { time: '08:45', source: 'Coindesk', title: 'New regulatory framework proposed for stablecoins in EU', sentiment: 'neutral' },
];

const NewsFeed: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-terminal-panel font-mono text-[10px] overflow-hidden">
            <div className="flex items-center px-2 py-1.5 border-b border-terminal-border bg-[#16171d] text-gray-500 justify-between">
                <span>Latest Headlines</span>
                <Rss size={10} />
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-1 space-y-1">
                {NEWS_ITEMS.map((news, i) => (
                    <div key={i} className="p-2 bg-[#111217] border border-terminal-border/30 rounded hover:border-terminal-border transition-colors cursor-pointer group">
                        <div className="flex justify-between text-gray-500 mb-1">
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${news.sentiment === 'bull' ? 'bg-terminal-green' : news.sentiment === 'bear' ? 'bg-terminal-red' : 'bg-gray-400'}`}></span>
                                <span className="font-bold text-[9px] uppercase">{news.source}</span>
                            </div>
                            <span className="text-[9px]">{news.time}</span>
                        </div>
                        <div className="text-gray-300 group-hover:text-white leading-tight">
                            {news.title}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;