import React, { useState, useRef, useLayoutEffect } from 'react';
import { Search, Plus, Hash, Smile, MoreVertical, ShieldCheck } from 'lucide-react';

interface Message {
    id: string;
    user: string;
    role?: 'admin' | 'mod' | 'user';
    text: string;
    time: string;
    color: string;
}

const MOCK_MESSAGES: Message[] = [
    { id: '1', user: 'ChiefMemeOfficer', role: 'admin', text: 'I had to disable the v1 servers for the good of the rest exchanges', time: '10:42', color: '#ec4899' },
    { id: '2', user: 'ChiefMemeOfficer', role: 'admin', text: 'im chatting with their team about increasing our RL', time: '10:42', color: '#ec4899' },
    { id: '3', user: 'ChiefMemeOfficer', role: 'admin', text: 'but for the time being it\'s nuked', time: '10:43', color: '#ec4899' },
    { id: '4', user: 'vbokeh', role: 'user', text: 'ok thanks for the info', time: '10:43', color: '#eab308' },
    { id: '5', user: 'vbokeh', role: 'user', text: 'what is "RL"?', time: '10:43', color: '#eab308' },
    { id: '6', user: 'vbokeh', role: 'user', text: 'I\'m gona move my 20 usdt portfolio to blofin.', time: '10:44', color: '#eab308' },
    { id: '7', user: 'vbokeh', role: 'user', text: 'so I can lose it with 150x lev instead of bitget 125, very nice', time: '10:44', color: '#eab308' },
    { id: '8', user: 'ChiefMemeOfficer', role: 'admin', text: 'rate-limit', time: '10:45', color: '#ec4899' },
    { id: '9', user: 'ChiefMemeOfficer', role: 'admin', text: 'so they deprecated their v1 servers in favour of v2', time: '10:45', color: '#ec4899' },
    { id: '10', user: 'username_1xuiu', role: 'user', text: 'stupid knife bear', time: '10:46', color: '#60a5fa' },
    { id: '11', user: 'Alexein', role: 'mod', text: 'gm', time: '10:48', color: '#3b82f6' },
    { id: '12', user: 'username_8szzd', role: 'user', text: 'is okx API on maintenance or something?, can\'t connect my account', time: '10:50', color: '#f59e0b' },
];

const Trollbox: React.FC = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAtBottom = useRef(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // User is at the bottom if distance is small
        isAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
    };

    useLayoutEffect(() => {
        if (scrollRef.current && isAtBottom.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            user: 'Guest_Trader',
            role: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: '#a8a29e'
        };
        setMessages([...messages, newMsg]);
        setInputValue('');
    };

    return (
        <div className="flex h-full bg-terminal-panel text-xs font-mono overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/4 min-w-[100px] bg-[#111217] border-r border-terminal-border flex flex-col">
                <div className="p-2 border-b border-terminal-border">
                    <div className="text-terminal-highlight font-bold mb-2 truncate">username_0tm31</div>
                    <button className="w-full flex items-center justify-center gap-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/20 rounded py-1 hover:bg-terminal-green/20 transition-colors text-[10px]">
                        <Plus size={10} /> New
                    </button>
                </div>
                
                <div className="p-2">
                    <div className="relative mb-3">
                        <input 
                            type="text" 
                            placeholder="search..." 
                            className="w-full bg-[#0b0c10] border border-terminal-border rounded py-1 pl-2 pr-6 text-[10px] focus:border-gray-500 outline-none placeholder-gray-700"
                        />
                        <Search size={10} className="absolute right-2 top-1.5 text-gray-600" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="text-gray-500 text-[10px] uppercase font-bold mb-1 px-1">Channels</div>
                            <div className="space-y-0.5">
                                {['news', 'system'].map(ch => (
                                    <div key={ch} className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer rounded">
                                        <Hash size={10} className="text-gray-600" /> {ch}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-500 text-[10px] uppercase font-bold mb-1 px-1">Groups</div>
                            <div className="space-y-0.5">
                                {['general', 'random'].map(ch => (
                                    <div 
                                        key={ch} 
                                        onClick={() => setActiveChannel(ch)}
                                        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded ${activeChannel === ch ? 'bg-terminal-highlight/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <Hash size={10} className={activeChannel === ch ? 'text-terminal-highlight' : 'text-gray-600'} /> {ch}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0b0c10]">
                {/* Channel Header */}
                <div className="h-8 border-b border-terminal-border flex items-center justify-between px-3 bg-[#16171d]">
                    <div className="font-bold text-white flex items-center gap-1">
                        <Hash size={12} className="text-gray-500" /> {activeChannel}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-terminal-green"></span>
                            <span className="text-gray-400">1,420 online</span>
                        </div>
                        <MoreVertical size={12} className="text-gray-500 cursor-pointer hover:text-white" />
                    </div>
                </div>

                {/* Messages */}
                <div 
                    className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar" 
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className="group hover:bg-white/[0.02] -mx-2 px-2 py-0.5 rounded">
                            <div className="flex items-baseline gap-2">
                                <span 
                                    className="font-bold hover:underline cursor-pointer flex items-center gap-1"
                                    style={{ color: msg.color }}
                                >
                                    {msg.user}
                                    {msg.role === 'admin' && <ShieldCheck size={10} className="text-terminal-green inline" />}
                                    {msg.role === 'mod' && <ShieldCheck size={10} className="text-blue-500 inline" />}
                                </span>
                                <span className="text-[9px] text-gray-600">{msg.time}</span>
                            </div>
                            <div className="text-gray-300 break-words leading-tight ml-0">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-2 border-t border-terminal-border bg-[#16171d]">
                    <div className="relative flex items-center bg-[#0b0c10] border border-terminal-border rounded focus-within:border-gray-600 transition-colors">
                        <button className="pl-2 pr-1 text-terminal-green hover:text-white transition-colors">
                            <Plus size={12} />
                        </button>
                        <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none outline-none text-white px-2 py-2 text-[11px] placeholder-gray-600"
                            placeholder={`Message #${activeChannel}`}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="px-2 text-gray-500 hover:text-yellow-400 transition-colors">
                            <Smile size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trollbox;