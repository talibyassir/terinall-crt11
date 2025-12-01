import React, { useState } from 'react';
import { X, Maximize2, GripHorizontal, Settings, Minimize2, Check } from 'lucide-react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  rightContent?: React.ReactNode;
  // React Grid Layout props
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
  // Enhanced features
  onMaximize?: () => void;
  isMaximized?: boolean;
  settingsContent?: React.ReactNode; // Content to show in settings mode
}

export const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(({ 
  title, 
  children, 
  onClose, 
  className = '', 
  rightContent, 
  style, 
  onMouseDown, 
  onMouseUp, 
  onTouchEnd,
  onMaximize,
  isMaximized,
  settingsContent
}, ref) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div 
        ref={ref}
        style={style}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        className={`flex flex-col bg-terminal-panel border border-terminal-border rounded-sm shadow-lg overflow-hidden ${className} ${isMaximized ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#16171d] border-b border-terminal-border select-none h-7 flex-shrink-0 group">
        
        {/* Drag Handle (Only active if not maximized) */}
        <div className={`flex items-center space-x-2 text-gray-500 hover:text-gray-300 transition-colors ${!isMaximized ? 'cursor-grab active:cursor-grabbing drag-handle' : ''}`}>
          <GripHorizontal size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{title}</span>
        </div>
        
        <div className="flex items-center space-x-2">
           {rightContent}
           
           <div className="flex items-center space-x-2 pl-2 border-l border-terminal-border/30 ml-2">
             
             {/* Settings Toggle */}
             {settingsContent && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                    className={`transition-colors ${showSettings ? 'text-terminal-highlight' : 'text-gray-600 hover:text-white'}`}
                >
                    <Settings size={10} />
                </button>
             )}

             {/* Maximize/Minimize Toggle */}
             {onMaximize && (
                <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="text-gray-600 hover:text-white transition-colors">
                    {isMaximized ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                </button>
             )}

             {/* Close Button */}
             {onClose && (
                <X size={12} className="text-gray-600 hover:text-terminal-red cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); onClose(); }} />
             )}
           </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col bg-terminal-bg/50 overflow-hidden">
        {showSettings && settingsContent ? (
            <div className="absolute inset-0 bg-[#0b0c10]/95 z-20 p-4 flex flex-col animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-4 border-b border-terminal-border pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Configuration</span>
                    <button onClick={() => setShowSettings(false)} className="text-terminal-highlight text-xs hover:text-white flex items-center gap-1">
                        <Check size={10} /> Done
                    </button>
                </div>
                <div className="flex-1 overflow-auto">
                    {settingsContent}
                </div>
            </div>
        ) : null}
        
        {children}
      </div>
    </div>
  );
});

export default Widget;