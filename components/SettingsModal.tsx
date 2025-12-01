import React, { useState } from 'react';
import { 
  Settings, Key, Layout, List, Activity, Bell, DollarSign, Cpu, Grid, Smartphone, 
  X, Check, Play, Plus, Download, Save 
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'accounts', label: 'Accounts', icon: Key },
  { id: 'layouts', label: 'Layouts', icon: Layout },
  { id: 'orders', label: 'Orders', icon: List },
  { id: 'chart', label: 'Chart', icon: Activity },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'position', label: 'Position', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: Cpu },
  { id: 'dom', label: 'DOM', icon: Grid },
  { id: '2fa', label: '2FA', icon: Smartphone },
];

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-terminal-green' : 'bg-gray-600'
    }`}
  >
    <div 
      className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform duration-200 ease-in-out ${
        checked ? 'left-6' : 'left-1'
      }`} 
    />
  </button>
);

const ColorPicker: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2 border-b border-terminal-border/30 border-dashed">
        <span className="text-xs font-mono font-bold text-gray-200">{label}</span>
        <div className="flex items-center gap-2">
            <button className="text-[10px] text-gray-500 hover:text-white font-mono uppercase">Reset</button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: value }}></div>
                <div className="bg-[#111217] border border-gray-600 rounded px-2 py-1 text-xs font-mono text-gray-300 min-w-[80px]">
                    {value}
                </div>
            </div>
        </div>
    </div>
);

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode; rightElement?: React.ReactNode }> = ({ title, description, children, rightElement }) => (
  <div className="py-3 border-b border-terminal-border/30 border-dashed flex items-start justify-between group">
    <div className="flex-1 pr-4">
      <h3 className="text-xs font-bold text-gray-200 mb-0.5">{title}</h3>
      {description && <p className="text-[10px] text-gray-500 leading-tight">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
    <div className="pt-0.5">
      {rightElement}
    </div>
  </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

  // Mock states for UI demonstration
  const [generalState, setGeneralState] = useState({
      nuke: false, utc: false, hideValues: false, favorites: true, trollbox: false, theme: false, hideOrderForm: false, quickOrderForm: true
  });
  const [ordersState, setOrdersState] = useState({
      fatFinger: 0, dualInput: true, quickPct: false, hlChase: false, autoTp: false
  });
  const [chartState, setChartState] = useState({
      alignOrders: true, alignPositions: false, liquidation: false, hideReverse: false
  });
  const [perfState, setPerfState] = useState({
      buffered: true, autoRefresh: true, disableRefresh: true
  });
  const [domState, setDomState] = useState({
      bigBoy: true, invert: false, retainStops: false
  });

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-1">
             <Section title="Nuke: hide" description="Hides the nuke buttons from the navbar." rightElement={
                 <Toggle checked={generalState.nuke} onChange={() => setGeneralState({...generalState, nuke: !generalState.nuke})} />
             }> </Section>
             <Section title="UTC timezone" description="Shows chart, orders etc. with a UTC datetime instead of your local." rightElement={
                 <Toggle checked={generalState.utc} onChange={() => setGeneralState({...generalState, utc: !generalState.utc})} />
             }> </Section>
             <Section title="Hide values and sizes everywhere" description="Obscures your sizes and absolute PnL from the Chart, Positions, Orders and side panel. Useful for screenshots and sharing." rightElement={
                 <Toggle checked={generalState.hideValues} onChange={() => setGeneralState({...generalState, hideValues: !generalState.hideValues})} />
             }> </Section>
             <Section title="Show favorite tickers on the page header" rightElement={
                 <Toggle checked={generalState.favorites} onChange={() => setGeneralState({...generalState, favorites: !generalState.favorites})} />
             }> </Section>
             <Section title="Disable Trollbox" description="Removes the Trollbox pop-up tab from your display completely" rightElement={
                 <Toggle checked={generalState.trollbox} onChange={() => setGeneralState({...generalState, trollbox: !generalState.trollbox})} />
             }> </Section>
             <Section title="Synchronise light/dark theme to your system" description="Switches light and dark mode automatically according to your computer's settings" rightElement={
                 <Toggle checked={generalState.theme} onChange={() => setGeneralState({...generalState, theme: !generalState.theme})} />
             }> </Section>
             <Section title="Hide order form" description="Removes the fixed left-hand order form from the UI" rightElement={
                 <Toggle checked={generalState.hideOrderForm} onChange={() => setGeneralState({...generalState, hideOrderForm: !generalState.hideOrderForm})} />
             }> </Section>
             <Section title="Quickly hide/show the order form" description="Enables a floating button on the left side of the order form for quick access" rightElement={
                 <Toggle checked={generalState.quickOrderForm} onChange={() => setGeneralState({...generalState, quickOrderForm: !generalState.quickOrderForm})} />
             }> </Section>
          </div>
        );
      case 'accounts':
          return (
              <div className="space-y-4">
                  <Section title="Auto connect all accounts" description="If enabled, all accounts will be automatically connected when the application is active" rightElement={
                      <Toggle checked={false} onChange={() => {}} />
                  }> </Section>
                  
                  <div className="flex border-b border-terminal-border/50">
                      <button className="px-4 py-2 text-xs font-bold text-terminal-green border-b-2 border-terminal-green">ACCOUNTS</button>
                      <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-300">SYNC</button>
                  </div>

                  <button className="w-full py-2 bg-[#2a2b30] hover:bg-[#3a3b40] text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2">
                      <Plus size={14} /> Add Account
                  </button>

                  <div className="min-h-[200px] border-t border-terminal-border/30 mt-4">
                      <div className="grid grid-cols-4 text-[10px] text-gray-500 font-bold uppercase py-2">
                          <span className="col-span-1">Local Accounts</span>
                          <span className="col-span-1">Name</span>
                          <span className="col-span-1 text-center">Sub</span>
                          <span className="col-span-1 text-right">Available</span>
                      </div>
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                          You either have no accounts or all accounts are synced up
                      </div>
                  </div>
              </div>
          );
      case 'layouts':
          return (
              <div className="space-y-4">
                   <div className="flex border-b border-terminal-border/50">
                      <button className="px-4 py-2 text-xs font-bold text-terminal-green border-b-2 border-terminal-green">YOUR LAYOUTS</button>
                      <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-300">OFFICIAL LAYOUTS</button>
                  </div>

                  <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-[#2a2b30] hover:bg-[#3a3b40] text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2">
                          <Save size={14} /> Save layout
                      </button>
                      <button className="flex-1 py-2 bg-[#2a2b30] hover:bg-[#3a3b40] text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2">
                          <Download size={14} /> Import
                      </button>
                  </div>

                   <div className="min-h-[200px] border-t border-terminal-border/30 mt-4">
                      <div className="grid grid-cols-3 text-[10px] text-gray-500 font-bold uppercase py-2">
                          <span>Name</span>
                          <span className="text-center">Mode</span>
                          <span className="text-right">Type</span>
                      </div>
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                          No layouts yet. Click above to add or import a new layout.
                      </div>
                  </div>
              </div>
          );
      case 'orders':
          return (
              <div className="space-y-1">
                   <Section title="Fat Finger Protection" description="Maximum order in USD. Enter zero to disable." rightElement={
                       <input type="number" value={ordersState.fatFinger} onChange={(e) => setOrdersState({...ordersState, fatFinger: parseInt(e.target.value)})} className="bg-[#0b0c10] border border-gray-600 rounded px-2 py-1 text-right text-xs text-white w-20" />
                   }> </Section>
                   
                   <div className="py-3 border-b border-terminal-border/30 border-dashed">
                       <h3 className="text-xs font-bold text-gray-200 mb-2">Exclude Fat Finger for order types</h3>
                       <p className="text-[10px] text-gray-500 mb-2">Ignore fat finger protection for these order types</p>
                       <div className="flex flex-wrap gap-4">
                           {['Market', 'Limit', 'Stop', 'Chase', 'Scale', 'Swarm', 'Twap'].map(type => (
                               <div key={type} className="flex flex-col items-center gap-1">
                                   <Toggle checked={false} onChange={() => {}} />
                                   <span className="text-[9px] text-gray-400 uppercase">{type}</span>
                               </div>
                           ))}
                       </div>
                   </div>

                   <Section title="Size: enable dual input controls" description="Use either the base or quote to size your orders" rightElement={
                       <Toggle checked={ordersState.dualInput} onChange={() => setOrdersState({...ordersState, dualInput: !ordersState.dualInput})} />
                   }> </Section>
                   <Section title="Size: show quick percentage buttons for input" rightElement={
                       <Toggle checked={ordersState.quickPct} onChange={() => setOrdersState({...ordersState, quickPct: !ordersState.quickPct})} />
                   }> </Section>
                   <Section title="Hyperliquid chase server fills" description="This setting uses more of your available rate-limit to reduce potential network delays" rightElement={
                       <Toggle checked={ordersState.hlChase} onChange={() => setOrdersState({...ordersState, hlChase: !ordersState.hlChase})} />
                   }> </Section>
                   <Section title="Enable AutoTP" description="Control via Button in Header. AutoTP automatically places multiple scale reduce-only orders when a position is opened." rightElement={
                       <Toggle checked={ordersState.autoTp} onChange={() => setOrdersState({...ordersState, autoTp: !ordersState.autoTp})} />
                   }> </Section>
              </div>
          );
      case 'chart':
          return (
              <div className="space-y-1">
                   <Section title="Align orders to the right" description="Order labels are displayed to the right-hand side of the chart." rightElement={
                       <Toggle checked={chartState.alignOrders} onChange={() => setChartState({...chartState, alignOrders: !chartState.alignOrders})} />
                   }> </Section>
                   <Section title="Align positions to the right" description="Position labels are displayed to the right-hand side of the chart." rightElement={
                       <Toggle checked={chartState.alignPositions} onChange={() => setChartState({...chartState, alignPositions: !chartState.alignPositions})} />
                   }> </Section>
                   <Section title="Plot liquidation" description="Show the open position(s) liquidation price on chart as an orange line" rightElement={
                       <Toggle checked={chartState.liquidation} onChange={() => setChartState({...chartState, liquidation: !chartState.liquidation})} />
                   }> </Section>
                   <Section title="Hide the reverse position button" description="Hide the reverse position button on the chart for open positions" rightElement={
                       <Toggle checked={chartState.hideReverse} onChange={() => setChartState({...chartState, hideReverse: !chartState.hideReverse})} />
                   }> </Section>

                   <div className="mt-4 pt-2">
                       <ColorPicker label="Color candle body up" value="#00E997" onChange={() => {}} />
                       <ColorPicker label="Color candle wick up" value="#00E997" onChange={() => {}} />
                       <ColorPicker label="Color candle body down" value="#CB3855" onChange={() => {}} />
                       <ColorPicker label="Color candle wick down" value="#CB3855" onChange={() => {}} />
                   </div>
              </div>
          );
      case 'notifications':
          return (
              <div className="space-y-1">
                   <Section title="Pop-up notification location" description="Where to show the notifications on screen" rightElement={
                       <select className="bg-[#0b0c10] border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 w-32">
                           <option>top-right</option>
                           <option>bottom-right</option>
                           <option>top-left</option>
                           <option>bottom-left</option>
                       </select>
                   }> </Section>
                   <Section title="Enable system wide notifications" description="Receive notification through your device directly, even when not focused" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Notification Sounds" description="Play a sound on certain notifications e.g. limit fill" rightElement={
                       <Toggle checked={true} onChange={() => {}} />
                   }> </Section>
                   <Section title="Fill sound" description="Played when an order is filled" rightElement={
                       <div className="flex gap-2">
                           <button className="p-1 bg-terminal-green text-black rounded"><Play size={12} fill="currentColor" /></button>
                           <select className="bg-[#0b0c10] border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 w-32">
                               <option>default</option>
                           </select>
                       </div>
                   }> </Section>
                   <Section title="Suppress Notifications" description="Suppress display of visual notification confirmations" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Suppress Price-Bounds Pause Notifications" description="Supress display of pause notifications during price-bounds algorithms" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Click notifications to focus on symbol" description="When clicking a notification, the components will switch to the symbol" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
              </div>
          );
       case 'position':
          return (
               <div className="space-y-1">
                   <Section title="Simplified PnL information" description="Hide calculated unrealized PnL figures and display only if in profit or loss" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Denial mode" description="Completely remove unrealized and realized pnl from the position metrics" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Nuke Account Positions" description="Adds a nuke button on the positions panel when an account is selected" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   <Section title="Reduce-only mode" description="Enable system-wide reduce-only mode" rightElement={
                       <Toggle checked={true} onChange={() => {}} />
                   }> </Section>
                   <Section title="Nuke Locked positions" description="Locked positions will be nuked" rightElement={
                       <Toggle checked={false} onChange={() => {}} />
                   }> </Section>
                   
                   <div className="py-3 border-b border-terminal-border/30 border-dashed">
                       <h3 className="text-xs font-bold text-gray-200 mb-2">Quick Close Buttons</h3>
                       <p className="text-[10px] text-gray-500 mb-2">Template position sizes which can be used to fast input position sizes. Max 4 custom buttons.</p>
                       <div className="flex gap-2">
                           {['25', '33', '50', '75'].map(val => (
                               <div key={val} className="relative">
                                   <input type="number" defaultValue={val} className="bg-[#0b0c10] border border-gray-600 rounded px-2 py-1 text-center text-xs text-white w-14" />
                                   <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center">
                                       <div className="text-[8px] text-gray-500 hover:text-white cursor-pointer">▲</div>
                                       <div className="text-[8px] text-gray-500 hover:text-white cursor-pointer">▼</div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
          );
       case 'performance':
           return (
               <div className="space-y-1">
                   <Section title="Buffered Updates" description="UI performance tweak. Processes updates in batches." rightElement={
                       <Toggle checked={perfState.buffered} onChange={() => setPerfState({...perfState, buffered: !perfState.buffered})} />
                   }> </Section>
                   <Section title="Automatic Refresh Rate" description="Terminal will automatically adjust the refresh rate during heavy activity." rightElement={
                       <Toggle checked={perfState.autoRefresh} onChange={() => setPerfState({...perfState, autoRefresh: !perfState.autoRefresh})} />
                   }> </Section>
                   <Section title="Refresh Rate" description="Manually configuration refresh rate for orderbook, chart, etc." rightElement={
                        <select className="bg-[#0b0c10] border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 w-32">
                           <option>fast</option>
                           <option>medium</option>
                           <option>slow</option>
                       </select>
                   }> </Section>
                   <Section title="Disable all Refresh Rate Management" description="Hides the Fast/Slow/Med/Auto knob from the UI and permanently selects 'Fast' mode" rightElement={
                       <Toggle checked={perfState.disableRefresh} onChange={() => setPerfState({...perfState, disableRefresh: !perfState.disableRefresh})} />
                   }> </Section>
               </div>
           );
       case 'dom':
           return (
               <div className="space-y-1">
                   <Section title="Big Boy Lot Size Input Mode" description="Use Lots and Multiplier concept to input order sizes." rightElement={
                       <Toggle checked={domState.bigBoy} onChange={() => setDomState({...domState, bigBoy: !domState.bigBoy})} />
                   }> </Section>
                   <Section title="Invert Y-axis" description="Swap the direction when scrolling the price line with the mousewheel" rightElement={
                       <Toggle checked={domState.invert} onChange={() => setDomState({...domState, invert: !domState.invert})} />
                   }> </Section>
                   <Section title="Retain Stops on CXL" description="Only cancel Limit orders when pressing 'CXL A', 'CXL B' buttons" rightElement={
                       <Toggle checked={domState.retainStops} onChange={() => setDomState({...domState, retainStops: !domState.retainStops})} />
                   }> </Section>
               </div>
           );
       case '2fa':
           return (
               <div className="h-full flex flex-col items-center justify-center space-y-6 text-center pt-10">
                   <p className="text-xs text-gray-300 max-w-sm leading-relaxed font-mono">
                       <span className="font-bold">NOTE:</span> We do not process 2FA resets. If you lose your 2FA code, <span className="underline cursor-pointer hover:text-white">we cannot recover your account</span>
                   </p>
                   <button className="px-6 py-3 bg-terminal-green text-black font-bold text-sm rounded hover:bg-terminal-highlight hover:text-white transition-colors">
                       Enable Two-Factor Authentication
                   </button>
               </div>
           );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#16171d] w-[800px] h-[550px] rounded shadow-2xl flex overflow-hidden border border-terminal-border">
        {/* Sidebar */}
        <div className="w-48 bg-[#111217] flex flex-col border-r border-terminal-border">
          <div className="p-4 border-b border-terminal-border/50">
             <div className="text-xs text-gray-500 font-mono">Settings <span className="text-white font-bold">{TABS.find(t => t.id === activeTab)?.label}</span></div>
          </div>
          <div className="flex-1 py-2 overflow-y-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-terminal-green bg-terminal-green/5 border-l-2 border-terminal-green'
                      : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-[#16171d]">
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar relative">
            {renderContent()}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-3 border-t border-terminal-border bg-[#111217] flex justify-end gap-2">
            <button 
                onClick={() => {
                    // Logic to save would go here
                    onClose();
                }}
                className="px-6 py-1.5 bg-terminal-green text-black text-xs font-bold rounded hover:bg-white transition-colors"
            >
                SAVE
            </button>
            <button 
                onClick={onClose}
                className="px-6 py-1.5 bg-[#2a2b30] text-gray-300 text-xs font-bold rounded hover:bg-[#3a3b40] transition-colors"
            >
                CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
