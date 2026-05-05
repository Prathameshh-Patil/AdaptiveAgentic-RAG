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
      icon: <Database className="w-4 h-4 text-cyan-400" />,
      text: "Retrieving documents",
      color: "bg-cyan-500/20",
      border: "border-cyan-500/30",
    },
    searching: {
      icon: <Search className="w-4 h-4 text-blue-400" />,
      text: "Searching the web",
      color: "bg-blue-500/20",
      border: "border-blue-500/30",
    },
    thinking: {
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      text: "Analyzing context",
      color: "bg-purple-500/20",
      border: "border-purple-500/30",
    },
    generating: {
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      text: "Generating response",
      color: "bg-emerald-500/20",
      border: "border-emerald-500/30",
    },
  };

  const config = stateConfig[state];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 py-2 px-1 mb-4"
    >
      <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${config.color} ${config.border} border`}>
        {/* Subtle pulsing background glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inset-0 rounded-full ${config.color} blur-sm`}
        />
        <div className="relative z-10">{config.icon}</div>
      </div>
      
      <div className="flex flex-col">
        <motion.span 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-foreground"
        >
          {config.text}
        </motion.span>
      </div>
    </motion.div>
  );
}
