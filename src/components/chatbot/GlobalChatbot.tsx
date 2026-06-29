"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, RefreshCw } from "lucide-react";
import { usePathname } from "next/navigation";

type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: number;
};

export default function GlobalChatbot() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);
  
  // Manage conversational context for multi-turn flows (e.g., Horoscope checker)
  const [chatContext, setChatContext] = useState<{ step?: string; sign?: string; lang?: string } | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);
  const [adminSuggestions, setAdminSuggestions] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role || "GUEST";
  
  const initChat = () => {
    setMessages([
      {
        id: "welcome-1",
        sender: "bot",
        text: `Hello! I'm your AstroGuru Virtual Assistant. I can help you navigate the platform and use our features. How can I help you today?`,
        timestamp: Date.now()
      }
    ]);
    setChatContext(null);
    setDynamicSuggestions(null);
    setFeedbackMode(false);
  };

  // Initialize with welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      initChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    fetch("/api/chat/suggestions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAdminSuggestions(data);
      })
      .catch(console.error);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  const defaultSuggestions = role === "ASTROLOGER" 
    ? [...adminSuggestions, "Check Horoscope", "Complete My Profile", "Update Pricing", "Manage Availability"]
    : [...adminSuggestions, "Check Horoscope", "Read Tarot Cards", "Register as an Astrologer", "Find an Astrologer", "Give Feedback"];

  const suggestions = dynamicSuggestions || defaultSuggestions;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      if (feedbackMode) {
        // Handle Feedback Submission
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: text, currentPage: pathname })
        });
        
        if (res.ok) {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: "Thank you! Your feedback has been submitted successfully.", timestamp: Date.now() }]);
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: "Failed to submit feedback. Please try again.", timestamp: Date.now() }]);
        }
        setFeedbackMode(false);
      } else {
        // Normal Chat
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, role, context: chatContext })
        });

        const data = await res.json();
        
        if (data.action === "FEEDBACK_PROMPT") {
          setFeedbackMode(true);
          setDynamicSuggestions(null);
        } else if (data.context) {
          setChatContext(data.context);
          setDynamicSuggestions(data.suggestions || null);
        } else {
          setChatContext(null);
          setDynamicSuggestions(null);
        }

        setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: data.reply || "I encountered an error. Please try again.", timestamp: Date.now() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: "bot", text: "I'm having trouble connecting to my servers right now.", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(ts));
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-bhagva to-orange-600 rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center text-white z-[9999] ${isOpen ? 'hidden' : 'flex'}`}
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-bhagva opacity-30"></span>
        <MessageSquare className="w-6 h-6 relative z-10" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-[calc(100vw-3rem)] md:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col border border-ink/10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-cream px-5 py-4 flex items-center justify-between border-b border-ink/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bhagva/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-bhagva" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-ink">AstroGuru AI</h3>
                  <p className="text-xs text-ink-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={initChat} title="Reset Chat" className="p-2 text-ink-muted hover:bg-black/5 hover:text-bhagva rounded-full transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close Chat" className="p-2 text-ink-muted hover:bg-black/5 hover:text-bhagva rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-cream/30">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col w-full ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`flex max-w-[85%] gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.sender === "user" ? "bg-ink/10" : "bg-bhagva/10"}`}>
                      {msg.sender === "user" ? <User className="w-4 h-4 text-ink/70" /> : <Bot className="w-4 h-4 text-bhagva" />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === "user" 
                        ? "bg-bhagva text-white rounded-tr-sm" 
                        : "bg-white border border-ink/10 text-ink rounded-tl-sm shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] text-ink-muted mt-1 px-11 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-2 flex-row max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-bhagva/10 flex items-center justify-center mt-1 shrink-0">
                      <Bot className="w-4 h-4 text-bhagva" />
                    </div>
                    <div className="px-4 py-3 bg-white border border-ink/10 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-ink/30 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions & Input */}
            <div className="p-4 bg-white border-t border-ink/5 shrink-0">
              {!feedbackMode && suggestions.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none snap-x">
                  {suggestions.map((sug, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="snap-start shrink-0 px-3 py-1.5 bg-cream text-ink text-xs font-medium rounded-full border border-ink/10 hover:border-bhagva hover:text-bhagva transition-colors whitespace-nowrap"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={feedbackMode ? "Type your feedback..." : "Ask me anything..."}
                  className="flex-1 bg-cream border border-ink/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-bhagva/50 focus:ring-1 focus:ring-bhagva/50 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-bhagva text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
