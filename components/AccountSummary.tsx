import React from 'react';
import { Wallet, PieChart, Shield, Crown } from 'lucide-react';

const AccountSummary: React.FC = () => {
    // Mock data for simulation
    const balance = 13225.42;
    const upnl = -19.39;
    const equity = balance + upnl;
    const marginUsed = 437.35;
    const marginRatio = (marginUsed / equity) * 100;

    return (
        <div className="flex flex-col h-full bg-terminal-panel p-2 font-mono text-xs overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#16171d] p-2 rounded border border-terminal-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet size={32} />
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase mb-1">Total Equity</div>
                    <div className="text-lg font-bold text-white tracking-tight">{equity.toLocaleString()} <span className="text-[10px] text-gray-600 font-normal">USDT</span></div>
                </div>
                <div className="bg-[#16171d] p-2 rounded border border-terminal-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PieChart size={32} />
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase mb-1">Unrealized PnL</div>
                    <div className={`text-lg font-bold ${upnl >= 0 ? 'text-terminal-green' : 'text-terminal-red'}`}>{upnl > 0 ? '+' : ''}{upnl} <span className="text-[10px] text-gray-600 font-normal">USDT</span></div>
                </div>
            </div>

            <div className="space-y-3 bg-[#111217] p-2 rounded border border-terminal-border/30">
                 <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Shield size={10} /> Margin Level</span>
                        <span className="text-terminal-green font-bold">Healthy</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-terminal-green" style={{ width: '3.3%' }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
                        <span>{marginRatio.toFixed(2)}% Used</span>
                        <span>Max 100%</span>
                    </div>
                 </div>

                 <div className="flex justify-between items-center py-1 border-t border-terminal-border/20 text-[10px]">
                     <span className="text-gray-400">Wallet Balance</span>
                     <span className="text-white font-mono">{balance.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-t border-terminal-border/20 text-[10px]">
                     <span className="text-gray-400">Margin Balance</span>
                     <span className="text-white font-mono">{balance.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-t border-terminal-border/20 text-[10px]">
                     <span className="text-gray-400">Maintenance Margin</span>
                     <span className="text-white font-mono">45.20</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-t border-terminal-border/20 text-[10px]">
                     <span className="text-gray-400">Bonus</span>
                     <span className="text-white font-mono">0.00</span>
                 </div>
            </div>
            
            <div className="mt-auto pt-2">
                <div className="bg-[#16171d] border border-terminal-border rounded p-2 flex items-center justify-between group hover:border-terminal-highlight/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 flex items-center justify-center text-yellow-500 border border-yellow-500/30">
                            <Crown size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-200 font-bold text-[10px] flex items-center gap-1">
                                VIP Level 1
                            </span>
                            <span className="text-gray-600 text-[9px]">Standard Tier</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-[9px] font-mono border-l border-terminal-border pl-3">
                        <div className="flex gap-2">
                            <span className="text-gray-500">Maker</span>
                            <span className="text-terminal-green">0.020%</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-500">Taker</span>
                            <span className="text-white">0.040%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSummary;