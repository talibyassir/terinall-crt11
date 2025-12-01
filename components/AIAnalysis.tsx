import React, { useState, useLayoutEffect, useRef } from 'react';
import { Send, Zap, AlertTriangle, Cpu } from 'lucide-react';
import { getMarketAnalysis } from '../services/geminiService';

interface LogMessage {
  id: string;
  sender: 'SYS' | 'USR' | 'AI';
  text: string;
  time: string;
}

const AIAnalysis: React.FC<{ btcPrice: number }> = ({ btcPrice }) => {
  const [logs, setLogs] = useState<LogMessage[]>([
    { id: '1', sender: 'SYS', text: 'OMNIMIND NETWORK ONLINE.', time: new Date().toLocaleTimeString() },
    { id: '2', sender: 'AI', text: 'Market turbulence detected. Volatility index spiking. Monitoring order flow.', time: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      isAtBottom.current = scrollHeight - scrollTop - clientHeight < 30;
  };

  useLayoutEffect(() => {
    if (scrollRef.current && isAtBottom.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [logs]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: LogMessage = {
      id: Date.now().toString(),
      sender: 'USR',
      text: input,
      time: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = `BTC Price: ${btcPrice}. Trend: Bearish divergence on 5m. Heavy sell wall at 57k.`;
    const response = await getMarketAnalysis(userMsg.text, context);

    const aiMsg: LogMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'AI',
      text: response || 'NO DATA.',
      time: new Date().toLocaleTimeString()
    };
    
    setLogs(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-terminal-panel relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-0 w-32 h-32 bg-terminal-highlight/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      <div 
        className="flex-1 overflow-y-auto p-2 space-y-2 z-10 font-mono text-[10px] no-scrollbar" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {logs.map((log) => (
          <div key={log.id} className={`flex ${log.sender === 'USR' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] ${log.sender === 'USR' ? 'bg-terminal-border/30 border border-terminal-border/50 text-white' : 'bg-transparent'} p-1.5 rounded-sm`}>
              <span className={`mr-2 font-bold text-[9px] ${
                log.sender === 'SYS' ? 'text-yellow-500' : 
                log.sender === 'AI' ? 'text-terminal-highlight' : 'text-gray-500'
              }`}>
                {log.sender === 'AI' ? <Cpu size={8} className="inline mr-1" /> : ''}
                [{log.sender}]
              </span>
              <span className="text-gray-300 leading-relaxed">{log.text}</span>
            </div>
          </div>
        ))}
        {loading && <div className="text-terminal-highlight animate-pulse text-[9px] pl-1">> Analyzing blockchain data...</div>}
      </div>

      <div className="p-2 border-t border-terminal-border z-10 bg-[#111217]">
        <div className="flex items-center bg-[#0b0c10] border border-terminal-border rounded-sm px-2 focus-within:border-terminal-highlight/50 transition-colors">
            <Zap size={10} className="text-gray-500 mr-2" />
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Query market data..."
                className="bg-transparent border-none outline-none text-xs text-white flex-1 py-1.5 font-mono placeholder-gray-700"
            />
            <button onClick={handleSend} disabled={loading} className="text-terminal-highlight hover:text-white transition-colors">
                <Send size={10} />
            </button>
        </div>
        <div className="flex justify-between items-center mt-1.5 px-0.5">
             <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-[9px] text-red-400 bg-red-900/10 px-1 py-0.5 rounded">
                    <AlertTriangle size={8} />
                    <span>RISK: HIGH</span>
                </div>
                <div className="flex items-center space-x-1">
                    <div className={`w-1 h-1 rounded-full ${loading ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></div>
                    <span className="text-[8px] text-gray-600 font-bold uppercase">{loading ? 'PROCESSING' : 'SYSTEM IDLE'}</span>
                </div>
             </div>
             <div className="text-[8px] text-gray-700 font-mono">v2.5.0-flash</div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;