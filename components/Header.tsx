
import React, { useState } from 'react';
import { 
  Terminal, Activity, Layout, Layers, Eye, EyeOff, RotateCcw, Settings, 
  Keyboard, MousePointer2, Volume2, VolumeX, Minimize2, Radiation, Rocket, 
  Menu, Plus, Check, Monitor, Search
} from 'lucide-react';
import { ConnectionStatus } from '../types';

interface HeaderProps {
  status: ConnectionStatus;
  btcPrice: number;
  panels: Record<string, boolean>;
  togglePanel: (key: string) => void;
  onResetLayout: () => void;
  onOpenSettings: (tab?: string) => void;
  currentSymbol: string;
  onSearch: (symbol: string) => void;
  designerMode: boolean;
  setDesignerMode: (v: boolean) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  onNukeOrders: () => void;
  onNukePositions: () => void;
}

const ToolbarButton: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    active?: boolean; 
    onClick?: () => void;
    color?: string;
    danger?: boolean;
}> = ({ icon, label, active, onClick, color, danger }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center px-3 h-full border-r border-terminal-border/20 transition-all group relative overflow-hidden ${active ? 'bg-white/5' : 'hover:bg-white/5'}`}
    >
        <div className={`mb-1 transition-transform group-hover:scale-110 ${active ? 'text-terminal-highlight' : danger ? color : 'text-gray-400 group-hover:text-white'}`}>
            {icon}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-terminal-highlight' : 'text-gray-600 group-hover:text-gray-400'}`}>
            {label}
        </span>
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terminal-highlight"></div>}
    </button>
);

const Header: React.FC<HeaderProps> = ({ 
    status, panels, togglePanel, onResetLayout, onOpenSettings,
    currentSymbol, onSearch,
    designerMode, setDesignerMode, privacyMode, setPrivacyMode,
    onNukeOrders, onNukePositions
}) => {
  const panelConfig = [
    { key: 'tickers', label: 'TICKERS' },
    { key: 'orderBook', label: 'OB' },
    { key: 'chart', label: 'CHART' },
    { key: 'tradingView', label: 'TV' }, 
    { key: 'heatmap', label: 'MAP' },
    { key: 'depthChart', label: 'DEPTH' },
    { key: 'dom', label: 'DOM' },
    { key: 'aggr', label: 'AGGR' },
    { key: 'positions', label: 'POS' },
    { key: 'trades', label: 'TRADES' },
    { key: 'trollbox', label: 'CHAT' },
    { key: 'account', label: 'ACCT' },
    { key: 'ai', label: 'AI' },
    { key: 'orderEntry', label: 'ENTRY' },
    { key: 'exchange', label: 'INFO' },
    { key: 'orderFlow', label: 'FLOW' }
  ];

  return (
    <div className="flex flex-col bg-[#0b0c10] border-b border-terminal-border flex-shrink-0 z-50">
        
        {/* TOP ROW: Tabs, Search & Views */}
        <div className="h-8 flex items-center justify-between bg-black px-2 border-b border-gray-900 select-none">
            <div className="flex items-center">
                <div className="flex items-center space-x-2 text-terminal-green font-bold mr-6">
                    <Terminal size={12} />
                    <span className="text-[10px] tracking-widest hidden md:inline">INSILICO</span>
                </div>

                <div className="flex items-center space-x-1 mr-4">
                    <button className="flex items-center gap-2 px-3 py-1 bg-[#16171d] text-gray-200 text-[10px] font-bold rounded-t border-t border-x border-gray-800 relative top-[1px]">
                        Main
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1 text-gray-500 hover:text-gray-300 text-[10px] font-bold transition-colors">
                        CDF
                    </button>
                    {/* NEW BUTTON triggers Symbol Selector */}
                    <button 
                        onClick={() => onSearch('')}
                        className="flex items-center gap-1 px-2 py-0.5 text-terminal-green hover:text-white text-[10px] font-bold transition-colors"
                    >
                        <Plus size={10} /> NEW
                    </button>
                </div>

                {/* SEARCH BAR (Read-only trigger) */}
                <div 
                    onClick={() => onSearch('')}
                    className="flex items-center bg-[#111217] border border-gray-800 rounded-sm px-2 py-0.5 hover:border-terminal-highlight/50 transition-colors w-32 md:w-48 mr-4 group cursor-pointer"
                >
                    <Search size={10} className="text-gray-600 group-hover:text-terminal-highlight mr-2" />
                    <span className="text-[10px] text-white font-mono uppercase truncate">{currentSymbol}</span>
                </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade-right">
                {panelConfig.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => togglePanel(key)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all border ${
                            panels[key] 
                            ? 'text-terminal-highlight border-terminal-highlight/30 bg-terminal-highlight/5' 
                            : 'text-gray-600 border-transparent hover:text-gray-400'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-800 ml-2">
                <div className="flex items-center space-x-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-terminal-green animate-pulse' : 'bg-terminal-red'}`}></div>
                    <span className="text-[9px] text-gray-500 font-mono hidden sm:inline">{status === ConnectionStatus.CONNECTED ? '9ms' : 'OFF'}</span>
                </div>
                <Menu size={14} className="text-gray-500 hover:text-white cursor-pointer" />
            </div>
        </div>

        {/* BOTTOM ROW: Toolbar */}
        <div className="h-11 flex items-center bg-[#111217] border-b border-terminal-border overflow-x-auto no-scrollbar">
            <ToolbarButton 
                icon={<div className="border border-current rounded px-0.5 text-[9px] font-mono">K</div>} 
                label="HOTKEYS" 
            />
            <ToolbarButton 
                icon={privacyMode ? <EyeOff size={16} /> : <Eye size={16} />} 
                label="PRIVACY" 
                active={privacyMode}
                onClick={() => setPrivacyMode(!privacyMode)}
            />
            <ToolbarButton 
                icon={<MousePointer2 size={16} />} 
                label="DESIGNER" 
                active={designerMode}
                onClick={() => setDesignerMode(!designerMode)}
            />
            <ToolbarButton icon={<Volume2 size={16} />} label="SOUND" />
            <ToolbarButton icon={<Minimize2 size={16} />} label="REDUCE" />
            <ToolbarButton icon={<Layers size={16} />} label="LAYOUTS" onClick={() => onOpenSettings('layouts')} />
            <ToolbarButton icon={<Radiation size={16} />} label="ORDERS" danger color="text-yellow-500" onClick={onNukeOrders} />
            <ToolbarButton icon={<Radiation size={16} />} label="POSITIONS" danger color="text-[#ef4444]" onClick={onNukePositions} />
            <ToolbarButton icon={<Settings size={16} />} label="SETTINGS" onClick={() => onOpenSettings('general')} />
            <ToolbarButton icon={<Rocket size={16} />} label="ON MULTI" />
            <div className="flex-1"></div>
        </div>
    </div>
  );
};

export default Header;
