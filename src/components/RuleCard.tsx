"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Rule } from "@/types";
import { useStore } from "@/lib/store";

interface Props {
  rule: Rule;
  rank: number;
}

// Buttery smooth spring config
const smoothSpring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
  mass: 1,
};

export function RuleCard({ rule, rank }: Props) {
  const { userId, toggleVote } = useStore();
  const [justVoted, setJustVoted] = useState(false);
  const isOwnRule = rule.author === userId;
  const canVote = !isOwnRule;

  // Determine glow class based on rank
  const getGlowClass = () => {
    if (rank === 1) return "glow-gold breathing";
    if (rank === 2) return "glow-silver";
    if (rank === 3) return "glow-bronze";
    return "";
  };

  const handleVote = () => {
    if (!canVote) return;

    // Trigger the boom animation
    setJustVoted(true);
    toggleVote(rule.id);

    // Reset animation state after it completes
    setTimeout(() => setJustVoted(false), 800);
  };

  return (
    <motion.article
      layout
      layoutId={rule.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: smoothSpring,
        opacity: { duration: 0.4 },
        y: { duration: 0.4 },
      }}
      style={{ willChange: "transform" }}
      className={`group py-12 border-b border-[var(--gray-1)]/20 last:border-b-0 ${rank === 1 ? "breathing" : ""}`}
    >
      {/* Rule number */}
      <div className="flex items-start gap-8 md:gap-16">
        <motion.span
          layout
          transition={smoothSpring}
          className={`text-xs tabular-nums pt-2 w-8 shrink-0 ${rank <= 3 ? "text-white" : "text-[var(--gray-1)]"}`}
        >
          {String(rank).padStart(2, "0")}
        </motion.span>

        <div className="flex-1">
          {/* Rule text - variable size based on rank */}
          <p className={`text-white leading-relaxed mb-8 ${rank === 1 ? "text-2xl md:text-3xl" : rank <= 3 ? "text-xl md:text-2xl" : "text-xl md:text-2xl"}`}>
            {rule.text}
          </p>

          {/* Meta row - author hidden for anonymous voting */}
          <div className="flex items-center justify-end">
            <motion.button
              onClick={handleVote}
              disabled={!canVote}
              whileHover={canVote ? { scale: 1.08 } : {}}
              whileTap={canVote ? { scale: 0.92 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`
                relative flex items-center gap-3 px-4 py-2 rounded-full overflow-visible
                text-xs uppercase tracking-[0.15em]
                transition-colors duration-300
                ${rule.has_voted
                  ? "bg-white text-black"
                  : "border border-[var(--gray-1)]/40 text-[var(--gray-1)] hover:border-white hover:text-white"
                }
                ${!canVote ? "opacity-40 cursor-default" : "cursor-pointer"}
              `}
            >
              {/* Expanding ring effect on vote */}
              <AnimatePresence>
                {justVoted && rule.has_voted && (
                  <>
                    {/* Inner burst */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                      className="absolute inset-0 rounded-full bg-white pointer-events-none"
                      style={{ willChange: "transform, opacity" }}
                    />
                    {/* Outer ring */}
                    <motion.div
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                      className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
                      style={{ willChange: "transform, opacity" }}
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Vote count with pop animation */}
              <motion.span
                key={rule.upvotes}
                initial={{ scale: 1.5, opacity: 0, y: -5 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative z-10 tabular-nums"
              >
                {rule.upvotes}
              </motion.span>

              {/* Heart with bounce and wiggle */}
              <motion.div
                animate={
                  justVoted && rule.has_voted
                    ? {
                        scale: [1, 1.8, 0.9, 1.3, 1],
                        rotate: [0, -15, 15, -8, 0],
                      }
                    : justVoted && !rule.has_voted
                    ? {
                        scale: [1, 0.6, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  ease: [0.19, 1, 0.22, 1],
                  times: [0, 0.2, 0.5, 0.8, 1],
                }}
                className="relative z-10"
                style={{ willChange: "transform" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill={rule.has_voted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </motion.div>

              {/* Floating hearts on vote */}
              <AnimatePresence>
                {justVoted && rule.has_voted && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
                        animate={{
                          opacity: 0,
                          y: -40 - i * 15,
                          x: (i - 1) * 20,
                          scale: 0.3,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: "easeOut",
                        }}
                        className="absolute top-0 right-2 text-black pointer-events-none"
                        style={{ willChange: "transform, opacity" }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
