'use client';

import { useState, useEffect } from 'react';
import { apiRequest, authApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, LogOut, Palette, User, Settings, Layout, Layers, Database, Compass, BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Conversation {
    id: string;
    title: string;
    created_at: string;
}

interface SidebarProps {
    onSelectConversation: (id: string) => void;
    currentConversationId: string | null;
    onNewChat: () => void;
    onToggleTheme: () => void;
}

export default function Sidebar({ onSelectConversation, currentConversationId, onNewChat, onToggleTheme }: SidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [user, setUser] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        fetchConversations();
        fetchUser();
    }, []);

    // Re-fetch user on every conversation selection to update credits
    useEffect(() => {
        if (currentConversationId) fetchUser();
    }, [currentConversationId]);

    const fetchConversations = async () => {
        try {
            const data = await apiRequest('/conversations');
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const data = await authApi.getMe();
            setUser(data);
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this chat?')) return;

        try {
            await apiRequest(`/conversations/${id}`, { method: 'DELETE' });
            setConversations(conversations.filter(c => c.id !== id));
            if (currentConversationId === id) onNewChat();
        } catch (error) {
            console.error('Failed to delete conversation', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <motion.div 
            animate={{ width: isCollapsed ? 80 : 320 }}
            className="h-screen glass-panel border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out relative z-30 shadow-2xl"
        >
            {/* Header / Logo */}
            <div className="p-8 flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Aether</span>
                    </motion.div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-3 hover:bg-secondary/50 rounded-2xl text-muted-foreground transition-all hover:scale-110 active:scale-95"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {/* New Chat Button */}
            <div className="px-6 mb-8">
                <button
                    onClick={onNewChat}
                    className="haptic-button w-full bg-foreground text-background py-4 rounded-[1.5rem] flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    {!isCollapsed && <span>New Session</span>}
                </button>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar">
                <div className="space-y-1">
                   {!isCollapsed && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mb-4 px-4">Navigation</p>}
                   
                   {/* Credits Button */}
                   <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 mb-4 group">
                       <Database className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                       {!isCollapsed && (
                           <div className="flex flex-col items-start">
                               <span className="text-[10px] uppercase tracking-widest opacity-70">Credit Balance</span>
                               <span className="text-base font-black">${user?.credits?.toFixed(2) || '20.00'}</span>
                           </div>
                       )}
                   </button>

                   <Link href="/settings">
                       <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${pathname === '/settings' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'}`}>
                           <User className="w-5 h-5" />
                           {!isCollapsed && <span>My Profile</span>}
                       </button>
                   </Link>

                   <Link href="/settings">
                       <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-muted-foreground hover:bg-secondary/30 hover:text-foreground">
                           <Settings className="w-5 h-5" />
                           {!isCollapsed && <span>System Settings</span>}
                       </button>
                   </Link>

                   <Link href="/docs">
                       <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm text-muted-foreground hover:bg-secondary/30 hover:text-foreground">
                           <BookOpen className="w-5 h-5" />
                           {!isCollapsed && <span>Documentation</span>}
                       </button>
                   </Link>
                </div>

                {/* History Section */}
                <div className="space-y-1">
                    {!isCollapsed && (
                        <div className="flex items-center justify-between mb-4 px-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">History</p>
                            <span className="text-[10px] font-bold text-primary">{conversations.length}</span>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="px-4 text-[10px] font-bold text-muted-foreground/40 animate-pulse uppercase tracking-widest">Scanning...</div>
                    ) : (
                        <AnimatePresence>
                            {conversations.slice(0, 8).map((conv) => (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => onSelectConversation(conv.id)}
                                    className={`
                                        group flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all
                                        ${currentConversationId === conv.id ? 'bg-secondary/50 text-foreground ring-1 ring-white/5' : 'hover:bg-secondary/20 text-muted-foreground'}
                                    `}
                                >
                                    <MessageSquare className={`w-4 h-4 ${currentConversationId === conv.id ? 'text-primary' : ''}`} />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1 truncate text-xs font-bold">{conv.title}</span>
                                            <button
                                                onClick={(e) => handleDelete(conv.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-6 border-t border-white/5 space-y-3 bg-background/20 backdrop-blur-sm">
                {!isCollapsed && user && (
                    <div className="flex items-center gap-3 p-3 mb-2 rounded-2xl bg-secondary/10 border border-white/5 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black truncate">{user.username}</span>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Node</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onToggleTheme}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-secondary/30 text-muted-foreground transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5"
                    >
                        <Palette className="w-4 h-4" />
                        {!isCollapsed && <span>Theme</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all font-bold text-[10px] uppercase tracking-widest border border-white/5"
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
