import React from "react";
import { User, Sparkles, AlertCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Source } from "./SourcePanel";

export type MessageRole = "user" | "ai" | "system" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  citations?: string[];
  sources?: Source[];
  isComplete?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onCitationClick?: (citationId: string) => void;
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={cn(
        "flex w-full px-6 py-10 transition-colors",
        isUser ? "bg-transparent" : "glass-panel shadow-premium my-4 rounded-3xl",
        isError && "bg-destructive/5 border border-destructive/10"
      )}
    >
      <div className="max-w-4xl mx-auto flex gap-6 w-full">
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-transform hover:scale-110",
            isUser
              ? "bg-secondary border-white/5 text-foreground"
              : isError
              ? "bg-destructive/20 border-destructive/30 text-destructive"
              : "bg-foreground text-background"
          )}
        >
          {isUser ? (
            <User className="w-6 h-6" />
          ) : isError ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Sparkles className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1 leading-relaxed">
          <div className={cn("text-base font-medium tracking-tight text-foreground/90 whitespace-pre-wrap", 
            isError && "text-destructive"
          )}>
            {message.content}
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground w-full mb-1 font-bold">Sources Derived:</span>
              {message.citations.map((citation, i) => (
                <button
                  key={i}
                  onClick={() => onCitationClick?.(citation)}
                  className="haptic-button inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary border border-white/5 transition-all shadow-sm"
                >
                  <span className="text-primary font-bold">[{i + 1}]</span>
                  {citation}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
