import { useState, useEffect, useRef } from "react";
import { useChatStore } from "./useChatStore";
import useAuthStore from "../../store/useAuthStore";

const ChatPanel = () => {
    const { messages, sendMessage, subscribeToChat } = useChatStore();
    const { user } = useAuthStore();
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef(null);

    // ✅ Sync chat on mount and cleanup
    useEffect(() => {
        const cleanup = subscribeToChat();
        return cleanup;
    }, [subscribeToChat]);

    // ✅ Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        const userData = {
            name: user?.name || "Anonymous",
            color: user?.color || "#ff9249"
        };

        sendMessage(inputValue, userData);
        setInputValue("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#131317] border-l border-[#ffffff05] selection:bg-[#ff924933]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#ffffff05] flex items-center justify-between bg-[#131317]">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#acaab0]">Project Chat</h2>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#4caf50] animate-pulse"></div>
                   <span className="text-[9px] font-bold text-[#4caf50] uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col gap-6"
            >
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 px-8">
                         <div className="text-3xl mb-4">💬</div>
                         <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">The channel is quiet.<br />Initiate contact.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.user.name === user?.name;
                        return (
                            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] font-black tracking-tight" style={{ color: msg.user.color }}>
                                        {msg.user.name}
                                    </span>
                                    <span className="text-[9px] font-bold text-[#acaab0] opacity-40 uppercase">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words shadow-lg transition-all hover:scale-[1.01] ${
                                    isMe 
                                    ? 'bg-[#ff92490d] text-[#ff9249] border border-[#ff924922] rounded-tr-none marker:text-[#ff9249]' 
                                    : 'bg-[#19191e] text-[#fcf8fe] border border-[#ffffff05] rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-[#131317] border-t border-[#ffffff05]">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a transmission..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-11 bg-[#0e0e12] border border-[#ffffff08] rounded-xl px-4 text-[13px] text-[#fcf8fe] placeholder-[#acaab044] focus:outline-none focus:border-[#ff924944] focus:ring-1 focus:ring-[#ff924922] transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim()}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            inputValue.trim() 
                            ? 'bg-[#ff9249] text-[#0e0e12] shadow-[0_0_15px_rgba(255,146,73,0.3)] hover:scale-105 active:scale-95' 
                            : 'bg-[#19191e] text-[#acaab044] cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
                <div className="mt-3 flex justify-between px-1">
                    <span className="text-[8px] font-black tracking-widest text-[#acaab044] uppercase">Protocol: encrypted</span>
                    <span className="text-[8px] font-black tracking-widest text-[#acaab044] uppercase">Shift + Enter for multiline</span>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
