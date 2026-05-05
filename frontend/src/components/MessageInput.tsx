"use client";

import React, { useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function MessageInput({ value, onChange, onSubmit, isLoading }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative flex items-end w-full max-w-3xl mx-auto bg-card border border-border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
      {/* Optional: File Upload Button */}
      <button 
        type="button"
        className="p-3 text-muted-foreground hover:text-foreground transition-colors rounded-l-xl"
        title="Attach file (Context for RAG)"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message the Agentic RAG system..."
        className="flex-1 max-h-[200px] min-h-[44px] py-3 px-2 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
        rows={1}
      />

      <button
        onClick={() => {
          if (value.trim() && !isLoading) onSubmit();
        }}
        disabled={!value.trim() || isLoading}
        className={cn(
          "p-2 m-2 rounded-lg flex items-center justify-center transition-all",
          value.trim() && !isLoading
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
