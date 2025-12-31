"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { RuleCard } from "./RuleCard";
import { supabase, isConfigured } from "@/lib/supabase";

// Simple admin secret - append ?admin=rulesdaddy to URL
const ADMIN_SECRET = "rulesdaddy";

export function RuleFeed() {
  const { rules, loading, fetchRules } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for admin mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setIsAdmin(params.get("admin") === ADMIN_SECRET);
    }
  }, []);

  useEffect(() => {
    fetchRules();

    if (!isConfigured || !supabase) return;

    const channel = supabase
      .channel("rules-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rules" },
        () => fetchRules()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => fetchRules()
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [fetchRules]);

  if (!isConfigured) {
    return (
      <div className="py-24 text-center">
        <p className="text-[var(--gray-1)] text-sm">Database not configured.</p>
      </div>
    );
  }

  if (loading && rules.length === 0) {
    return (
      <div className="py-24">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="py-12 border-b border-[var(--gray-1)]/20 animate-pulse"
          >
            <div className="flex items-start gap-16">
              <div className="w-8 h-4 bg-[var(--gray-1)]/20 rounded" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-[var(--gray-1)]/20 rounded w-3/4" />
                <div className="h-6 bg-[var(--gray-1)]/20 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-24 text-center"
      >
        <p className="text-[var(--gray-1)] text-lg">No rules yet.</p>
        <p className="text-[var(--gray-1)]/60 text-sm mt-2">Be the first to share wisdom.</p>
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {rules.map((rule, index) => (
          <RuleCard key={rule.id} rule={rule} rank={index + 1} isAdmin={isAdmin} />
        ))}
      </AnimatePresence>
    </div>
  );
}
