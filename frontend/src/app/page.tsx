"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageInput } from "@/components/MessageInput";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { SourcePanel, Source } from "@/components/SourcePanel";
import { AgentStatusIndicator, AgentState } from "@/components/AgentStatusIndicator";
import Sidebar from "@/components/Sidebar";
import { apiRequest, authApi } from "@/lib/api";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const handleCitationClick = (citationId: string) => {
    setHighlightedSourceId(citationId);
    setIsSourcePanelOpen(true);
  };
  const [theme, setTheme] = useState<"ink-wash" | "stone-path">("ink-wash");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      fetchUser();
      // Initialize with a fresh greeting if no conversation selected
      setMessages([{
        id: "welcome",
        role: "ai",
        content: "Welcome back. I am your premium Agentic RAG assistant. How can I help you today?"
      }]);
    }
  }, [router]);

  // Theme Sync
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    setAgentState("thinking");
    try {
      const data = await apiRequest(`/conversations/${id}/messages`);
      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        sources: msg.sources
      }));
      setMessages(formattedMessages);
      
      // Open source panel if last message has sources
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      if (lastMsg && lastMsg.role === "ai" && lastMsg.sources && lastMsg.sources.length > 0) {
        setActiveSources(lastMsg.sources);
        setIsSourcePanelOpen(true);
      } else {
        setIsSourcePanelOpen(false);
      }
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setAgentState("idle");
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([{
      id: "welcome-" + Date.now(),
      role: "ai",
      content: "Started a new session. Ask me anything."
    }]);
    setIsSourcePanelOpen(false);
    setActiveSources([]);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const userQuestion = inputValue;
    const tempId = Date.now().toString();
    const newUserMsg: Message = { id: tempId, role: "user", content: userQuestion };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setAgentState("thinking");

    try {
      const data = await apiRequest("/chat", {
        method: "POST",
        body: JSON.stringify({ 
          question: userQuestion,
          conversationId: currentConversationId 
        }),
      });

      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      setAgentState("generating");
      await new Promise(r => setTimeout(r, 300));

      const newAiMsg: Message = {
        id: data.id,
        role: data.role,
        content: data.content,
        citations: data.citations,
        sources: data.sources
      };

      setMessages((prev) => [...prev, newAiMsg]);
      
      if (data.sources && data.sources.length > 0) {
        setActiveSources(data.sources);
        setIsSourcePanelOpen(true);
      }
      
      // Update credits
      fetchUser();
    } catch (error) {
      console.error("Error communicating with backend:", error);
      const errorMsg: Message = {
        id: "err-" + Date.now(),
        role: "error",
        content: "Something went wrong. Please check your connection.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAgentState("idle");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <div className="canvas-grid" />
      <Sidebar 
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onToggleTheme={() => setTheme(prev => prev === "ink-wash" ? "stone-path" : "ink-wash")}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 glass-panel sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter uppercase italic bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">Aether</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-bold tracking-widest uppercase border border-violet-500/20">Pro</span>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className={`w-2.5 h-2.5 rounded-full ${agentState === 'idle' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
            <span className="font-bold tracking-widest text-[10px] uppercase text-muted-foreground/80">
              {currentConversationId ? "Active Node" : "Quantum Session"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Compute:</span>
              <span className="text-xs font-bold text-emerald-500">${user?.credits?.toFixed(2) || '20.00'}</span>
            </div>
            <button 
              onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
              className="p-3 hover:bg-secondary/50 rounded-2xl text-muted-foreground transition-all hover:scale-105 active:scale-95"
            >
              {isSourcePanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-10 pb-64 px-6 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            {!currentConversationId && messages.length <= 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center pt-20 pb-10 text-center"
              >
                <h1 className="text-7xl font-bold tracking-tighter mb-4 italic bg-gradient-to-br from-violet-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Aether</h1>
                <p className="text-muted-foreground text-lg tracking-tight font-medium max-w-lg mx-auto">
                  The Quantum Intelligence Layer for Advanced Operations
                </p>
                
                <div className="mt-12 flex gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                   <span>Connect with</span>
                   <div className="flex gap-4 grayscale opacity-50">
                      {/* Placeholder logos */}
                      <span>Gmail</span>
                      <span>Slack</span>
                      <span>Notion</span>
                      <span>GitHub</span>
                   </div>
                   <span>And many more</span>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ChatMessage 
                    message={msg} 
                    onCitationClick={handleCitationClick} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {agentState !== "idle" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pl-[3.5rem]"
              >
                <AgentStatusIndicator state={agentState} />
              </motion.div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-20 pb-12 px-10">
          <div className="max-w-4xl mx-auto">
            <MessageInput 
              value={inputValue} 
              onChange={setInputValue} 
              onSubmit={handleSubmit} 
              isLoading={agentState !== "idle"} 
            />
            <p className="text-center mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30 font-bold">
              Architect Intelligence System v2.1
            </p>
          </div>
        </div>
      </main>

      <SourcePanel 
        sources={activeSources} 
        isOpen={isSourcePanelOpen} 
        onClose={() => setIsSourcePanelOpen(false)} 
        highlightedId={highlightedSourceId}
      />
    </div>
  );
}
