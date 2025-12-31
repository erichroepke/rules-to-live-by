import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rule } from "@/types";
import { supabase, isConfigured } from "./supabase";

// Generate a unique anonymous user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

interface Store {
  userId: string;
  rules: Rule[];
  loading: boolean;
  fetchRules: () => Promise<void>;
  addRule: (text: string) => Promise<void>;
  toggleVote: (ruleId: string) => Promise<void>;
  clearVotes: () => Promise<void>;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      userId: generateUserId(),
      rules: [],
      loading: false,

      fetchRules: async () => {
        if (!isConfigured || !supabase) return;
        set({ loading: true });
        const { userId } = get();

        const { data: rules } = await supabase
          .from("rules")
          .select("*")
          .order("upvotes", { ascending: false });

        if (!rules) {
          set({ loading: false });
          return;
        }

        // Check which rules user has voted on
        const { data: votes } = await supabase
          .from("votes")
          .select("rule_id")
          .eq("voter", userId);

        const votedIds = new Set(votes?.map((v) => v.rule_id) || []);
        const rulesWithVotes = rules.map((r) => ({
          ...r,
          has_voted: votedIds.has(r.id),
        }));
        set({ rules: rulesWithVotes, loading: false });
      },

      addRule: async (text) => {
        if (!isConfigured || !supabase) return;
        const { userId, fetchRules } = get();
        if (!text.trim()) return;

        await supabase.from("rules").insert({
          text: text.trim(),
          author: userId,
          upvotes: 0,
        });

        await fetchRules();
      },

      toggleVote: async (ruleId) => {
        if (!isConfigured || !supabase) return;
        const { userId, rules, fetchRules } = get();

        const rule = rules.find((r) => r.id === ruleId);
        if (!rule || rule.author === userId) return;

        const newVoteState = !rule.has_voted;
        const newUpvotes = newVoteState ? rule.upvotes + 1 : rule.upvotes - 1;

        // Immediately update UI (optimistic update) - but keep same order
        set({
          rules: rules.map((r) =>
            r.id === ruleId
              ? { ...r, has_voted: newVoteState, upvotes: newUpvotes }
              : r
          ),
        });

        // Send to database
        if (newVoteState) {
          await supabase.from("votes").insert({
            rule_id: ruleId,
            voter: userId,
          });
          await supabase
            .from("rules")
            .update({ upvotes: newUpvotes })
            .eq("id", ruleId);
        } else {
          await supabase
            .from("votes")
            .delete()
            .eq("rule_id", ruleId)
            .eq("voter", userId);
          await supabase
            .from("rules")
            .update({ upvotes: newUpvotes })
            .eq("id", ruleId);
        }

        // Wait 2 seconds, then reorder by fetching fresh data
        setTimeout(() => {
          fetchRules();
        }, 2000);
      },

      clearVotes: async () => {
        if (!isConfigured || !supabase) return;
        const { userId, rules, fetchRules } = get();

        // Get all rules the user has voted on
        const votedRules = rules.filter((r) => r.has_voted);
        if (votedRules.length === 0) return;

        // Optimistically clear all votes in UI
        set({
          rules: rules.map((r) =>
            r.has_voted
              ? { ...r, has_voted: false, upvotes: r.upvotes - 1 }
              : r
          ),
        });

        // Delete all votes from database
        for (const rule of votedRules) {
          await supabase
            .from("votes")
            .delete()
            .eq("rule_id", rule.id)
            .eq("voter", userId);
          await supabase
            .from("rules")
            .update({ upvotes: rule.upvotes - 1 })
            .eq("id", rule.id);
        }

        // Refresh
        await fetchRules();
      },
    }),
    {
      name: "rules-storage",
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);
