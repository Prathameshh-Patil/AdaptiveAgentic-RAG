"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link as LinkIcon, ChevronRight, X } from "lucide-react";

export interface Source {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  relevanceScore?: number;
}

interface SourcePanelProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

export function SourcePanel({ sources, isOpen, onClose }: SourcePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 320 }}
          exit={{ opacity: 0, x: 20, width: 0 }}
          className="h-full border-l border-border glass-panel overflow-hidden flex flex-col flex-shrink-0"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <DatabaseIcon />
              Retrieved Sources
              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                {sources.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sources.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground mt-10">
                No sources retrieved yet.
              </div>
            ) : (
              sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 max-w-[85%]">
                      {source.url ? (
                        <LinkIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {source.title}
                      </h3>
                    </div>
                    {source.relevanceScore && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        {(source.relevanceScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {source.snippet}
                  </p>
                  
                  <div className="mt-3 flex justify-end">
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      View details <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DatabaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
