"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Database, Cpu, Sparkles } from "lucide-react";

export type AgentState = "idle" | "retrieving" | "thinking" | "generating" | "searching";

interface AgentStatusIndicatorProps {
  state: AgentState;
}

export function AgentStatusIndicator({ state }: AgentStatusIndicatorProps) {
  if (state === "idle") return null;

  const stateConfig = {
    retrieving: {
      icon: <Database className="w-4 h-4" />,
      text: "Scanning Vector Store",
      glow: "bg-primary/20",
    },
    searching: {
      icon: <Search className="w-4 h-4" />,
      text: "Browsing Knowledge Base",
      glow: "bg-primary/20",
    },
    thinking: {
      icon: <Cpu className="w-4 h-4" />,
      text: "Synthesizing Context",
      glow: "bg-primary/20",
    },
    generating: {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Crafting Response",
      glow: "bg-primary/20",
    },
  };

  const config = stateConfig[state] || stateConfig.thinking;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 py-4"
    >
      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-secondary border border-white/5 shadow-premium">
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-2xl ${config.glow} blur-md`}
        />
        <div className="relative z-10 text-foreground">{config.icon}</div>
      </div>
      
      <div className="flex flex-col">
        <motion.span 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/80"
        >
          {config.text}
        </motion.span>
      </div>
    </motion.div>
  );
}
