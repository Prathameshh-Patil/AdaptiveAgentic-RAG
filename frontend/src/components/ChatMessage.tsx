import React from "react";
import { User, Sparkles, AlertCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type MessageRole = "user" | "ai" | "system" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  citations?: string[];
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
        "flex w-full px-4 py-6 text-sm",
        isUser ? "bg-background" : "bg-card/50 border-y border-border/50",
        isError && "bg-red-500/10 border-y border-red-500/20"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4 w-full">
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
            isUser
              ? "bg-secondary border-border text-foreground"
              : isError
              ? "bg-red-500/20 border-red-500/30 text-red-400"
              : "bg-primary/20 border-primary/30 text-primary"
          )}
        >
          {isUser ? (
            <User className="w-5 h-5" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1 leading-relaxed">
          <div className={cn("prose prose-invert max-w-none text-foreground/90", 
            isError && "text-red-400"
          )}>
            {/* Simple content renderer - in a real app, use react-markdown */}
            {message.content.split('\n').map((line, i) => (
               <p key={i} className="mb-2 last:mb-0">{line}</p>
            ))}
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.citations.map((citation, i) => (
                <button
                  key={i}
                  onClick={() => onCitationClick?.(citation)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                >
                  <span className="text-primary font-mono opacity-80">[{i + 1}]</span>
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
