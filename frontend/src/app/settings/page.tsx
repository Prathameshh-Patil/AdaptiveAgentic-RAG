"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save, ArrowLeft, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authApi.getMe();
      setUsername(data.username);
      setEmail(data.email || "");
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updateData: any = { username, email };
      if (password) updateData.password = password;
      
      await authApi.updateMe(updateData);
      setMessage({ type: "success", text: "Profile updated successfully." });
      setPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
      <div className="canvas-grid" />
      
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <button 
          onClick={() => router.push("/")}
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all mb-12"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Back to Workspace</span>
        </button>

        <header className="mb-16">
          <h1 className="text-6xl font-bold tracking-tighter italic mb-4">Account Settings</h1>
          <p className="text-muted-foreground text-lg font-medium tracking-tight">
            Manage your Architect profile and security preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Navigation */}
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-foreground text-background font-bold text-sm transition-all shadow-xl">
              <User className="w-4 h-4" />
              Profile Details
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-secondary/50 text-muted-foreground font-bold text-sm transition-all text-left">
              <ShieldCheck className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleUpdate}
              className="glass-panel rounded-[2.5rem] p-10 space-y-8 shadow-premium"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="architect@lyzr.ai"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Change Password (Optional)</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="haptic-button w-full bg-foreground text-background py-5 rounded-[2rem] font-bold uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Configuration
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
