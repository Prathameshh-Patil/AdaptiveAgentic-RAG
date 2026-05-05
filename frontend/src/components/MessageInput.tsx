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
    <div className="relative flex items-end w-full max-w-4xl mx-auto command-bar rounded-[2.5rem] p-3 transition-all">
      <button 
        type="button"
        className="haptic-button p-5 text-muted-foreground hover:text-foreground transition-all rounded-[2rem] hover:bg-secondary/50 flex items-center justify-center"
      >
        <Paperclip className="w-6 h-6" />
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Build me a knowledge base Perplexity app..."
        className="flex-1 max-h-[200px] min-h-[64px] py-5 px-4 bg-transparent border-none resize-none focus:outline-none text-lg font-medium text-foreground placeholder:text-muted-foreground/40"
        rows={1}
      />

      <div className="flex gap-2 p-1">
        <button className="haptic-button p-4 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>
        <button
          onClick={() => {
            if (value.trim() && !isLoading) onSubmit();
          }}
          disabled={!value.trim() || isLoading}
          className={cn(
            "haptic-button p-4 rounded-full flex items-center justify-center transition-all shadow-lg",
            value.trim() && !isLoading
              ? "bg-foreground text-background"
              : "bg-muted/50 text-muted-foreground cursor-not-allowed"
          )}
        >
          <Send className={cn("w-6 h-6", isLoading && "animate-pulse")} />
        </button>
      </div>
    </div>
  );
}
