"use client";

import React, { useState } from "react";
import { MessageInput } from "@/components/MessageInput";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { SourcePanel, Source } from "@/components/SourcePanel";
import { AgentStatusIndicator, AgentState } from "@/components/AgentStatusIndicator";
import { Bot, PanelRightClose, PanelRightOpen, Settings } from "lucide-react";

// Mock initial state for demonstration
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hello! I am the Adaptive Agentic RAG system. I can search through your local documents or the web to answer your questions. What would you like to know?",
  }
];

const MOCK_SOURCES: Source[] = [
  {
    id: "s1",
    title: "LLM Powered Autonomous Agents",
    url: "https://lilianweng.github.io/posts/2023-06-23-agent/",
    snippet: "Agent memory is a key component of AI systems that enables agents to store, retrieve, and utilize information across interactions...",
    relevanceScore: 0.95,
  },
  {
    id: "s2",
    title: "Prompt Engineering Guide",
    snippet: "Techniques for optimizing language models through careful prompt construction...",
    relevanceScore: 0.82,
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  // Call to FastAPI backend
  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const userQuestion = inputValue;
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: userQuestion };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsSourcePanelOpen(false);

    // Initial state
    setAgentState("retrieving");

    try {
      // Small visual delay before actual fetch so it feels responsive
      await new Promise(r => setTimeout(r, 500));
      setAgentState("thinking");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      setAgentState("generating");
      await new Promise(r => setTimeout(r, 500)); // Visual transition

      const newAiMsg: Message = {
        id: data.id,
        role: data.role,
        content: data.content,
        citations: data.citations
      };

      setMessages((prev) => [...prev, newAiMsg]);
      
      if (data.sources && data.sources.length > 0) {
        setActiveSources(data.sources);
        setIsSourcePanelOpen(true);
      } else {
        setActiveSources([]);
      }

    } catch (error) {
      console.error("Error communicating with backend:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "error",
        content: "Sorry, I couldn't connect to the backend server. Is it running on port 8000?",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setAgentState("idle");
    }
  };

  const handleCitationClick = (citationTitle: string) => {
    setIsSourcePanelOpen(true);
    // In a real app, scroll to or highlight the specific source in the panel
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Optional Left Sidebar - Simplified for layout */}
      <aside className="w-16 md:w-64 border-r border-border bg-card hidden sm:flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <span className="font-semibold hidden md:block">Agentic RAG</span>
        </div>
        <div className="flex-1 p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 hidden md:block">
            Recent Chats
          </div>
          {/* Chat history list would go here */}
        </div>
        <div className="p-4 border-t border-border mt-auto flex justify-center md:justify-start">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            <span className="hidden md:block text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 glass-panel absolute top-0 w-full z-10">
          <div className="font-medium text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Ready
          </div>
          <button 
            onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            title="Toggle Sources"
          >
            {isSourcePanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pt-16 pb-32">
          <div className="flex flex-col">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} onCitationClick={handleCitationClick} />
            ))}
            
            {/* Agent State Indicator inside chat flow */}
            {agentState !== "idle" && (
              <div className="px-4 py-4 w-full">
                <div className="max-w-3xl mx-auto pl-[3.25rem]">
                   <AgentStatusIndicator state={agentState} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            <MessageInput 
              value={inputValue} 
              onChange={setInputValue} 
              onSubmit={handleSubmit} 
              isLoading={agentState !== "idle"} 
            />
            <div className="text-center mt-3 text-xs text-muted-foreground">
              Agentic RAG can make mistakes. Consider verifying important information.
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Sources */}
      <SourcePanel 
        sources={activeSources} 
        isOpen={isSourcePanelOpen} 
        onClose={() => setIsSourcePanelOpen(false)} 
      />
    </div>
  );
}
