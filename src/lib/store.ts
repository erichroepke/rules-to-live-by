import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rule } from "@/types";
import { supabase, isConfigured } from "./supabase";

interface Store {
  name: string | null;
  setName: (name: string) => void;
  rules: Rule[];
  loading: boolean;
  fetchRules: () => Promise<void>;
  addRule: (text: string) => Promise<void>;
  toggleVote: (ruleId: string) => Promise<void>;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      name: null,
      setName: (name) => set({ name }),
      rules: [],
      loading: false,

      fetchRules: async () => {
        if (!isConfigured || !supabase) return;
        set({ loading: true });
        const { name } = get();

        const { data: rules } = await supabase
          .from("rules")
          .select("*")
          .order("upvotes", { ascending: false });

        if (!rules) {
          set({ loading: false });
          return;
        }

        // Check which rules user has voted on
        if (name) {
          const { data: votes } = await supabase
            .from("votes")
            .select("rule_id")
            .eq("voter", name);

          const votedIds = new Set(votes?.map((v) => v.rule_id) || []);
          const rulesWithVotes = rules.map((r) => ({
            ...r,
            has_voted: votedIds.has(r.id),
          }));
          set({ rules: rulesWithVotes, loading: false });
        } else {
          set({ rules, loading: false });
        }
      },

      addRule: async (text) => {
        if (!isConfigured || !supabase) return;
        const { name, fetchRules } = get();
        if (!name || !text.trim()) return;

        await supabase.from("rules").insert({
          text: text.trim(),
          author: name,
          upvotes: 0,
        });

        await fetchRules();
      },

      toggleVote: async (ruleId) => {
        if (!isConfigured || !supabase) return;
        const { name, rules, fetchRules } = get();
        if (!name) return;

        const rule = rules.find((r) => r.id === ruleId);
        if (!rule || rule.author === name) return;

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
            voter: name,
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
            .eq("voter", name);
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
    }),
    {
      name: "rules-storage",
      partialize: (state) => ({ name: state.name }),
    }
  )
);
