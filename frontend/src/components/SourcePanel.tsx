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

export function SourcePanel({ sources, isOpen, onClose, highlightedId }: { 
  sources: Source[]; 
  isOpen: boolean; 
  onClose: () => void;
  highlightedId?: string | null;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (highlightedId && scrollRef.current) {
      const element = document.getElementById(`source-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 400 }}
          exit={{ opacity: 0, x: 20, width: 0 }}
          className="h-full border-l border-white/5 glass-panel overflow-hidden flex flex-col flex-shrink-0 z-20 shadow-2xl transition-all"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-background/20">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
              <DatabaseIcon />
              Source Derivation
              <span className="bg-foreground text-background text-[10px] px-2 py-0.5 rounded-full font-bold">
                {sources.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/50 rounded-2xl text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-background/10">
            {sources.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No Knowledge Blocks Found</p>
              </div>
            ) : (
              sources.map((source, index) => (
                <motion.div
                  id={`source-${source.id}`}
                  key={source.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    borderColor: highlightedId === source.id ? 'var(--foreground)' : 'transparent',
                    backgroundColor: highlightedId === source.id ? 'color-mix(in srgb, var(--foreground) 5%, transparent)' : 'transparent'
                  }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative rounded-[2rem] p-6 border-2 transition-all group cursor-pointer
                    ${highlightedId === source.id ? 'shadow-2xl' : 'hover:bg-secondary/20 border-white/5'}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${source.url ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {source.url ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xs font-bold text-foreground truncate max-w-[180px]">
                          {source.title}
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Knowledge Chunk</span>
                      </div>
                    </div>
                    {source.relevanceScore && (
                      <div className="text-right">
                         <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-xl border border-emerald-400/10">
                          {(source.relevanceScore * 100).toFixed(0)}% Match
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                    {source.snippet}
                  </p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="h-px flex-1 bg-white/5 mr-4" />
                    <button className="haptic-button text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all">
                      Details <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {highlightedId === source.id && (
                    <motion.div 
                      layoutId="highlight"
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-foreground rounded-full"
                    />
                  )}
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
