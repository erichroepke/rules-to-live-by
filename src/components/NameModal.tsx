"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

// Slow, gallery-like easing
const galleryTransition = {
  duration: 1.2,
  ease: [0.19, 1, 0.22, 1] as const,
};

export function NameModal() {
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const { name, setName } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (name || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setName(input.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Super subtle B&W background - Everest panorama (fixed, no repeat) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: "url(/bg-optimized.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          filter: "grayscale(100%)",
          opacity: 0.12,
        }}
      />

      {/* Main content - centered with massive whitespace */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="max-w-4xl w-full">
          {/* Huge display typography */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...galleryTransition, delay: 0.2 }}
            className="text-[12vw] sm:text-[10vw] md:text-[8vw] font-semibold text-white leading-[0.85] tracking-display mb-16"
          >
            Rules
            <br />
            to Live By
          </motion.h1>

          {/* Subtle tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...galleryTransition, delay: 0.5 }}
            className="text-[var(--gray-1)] text-lg md:text-xl max-w-md mb-24"
          >
            A collection of wisdom.
            <br />
            Upvote what resonates.
          </motion.p>

          {/* Name input - minimal, underlined */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...galleryTransition, delay: 0.7 }}
            className="max-w-sm"
          >
            <label className="block text-[var(--gray-1)] text-xs uppercase tracking-[0.2em] mb-6">
              Your name
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter to begin"
              autoFocus
              className="w-full bg-transparent border-b border-[var(--gray-1)] hover:border-white focus:border-white px-0 py-4 text-2xl md:text-3xl text-white placeholder:text-[var(--gray-1)] focus:outline-none transition-colors duration-700"
            />

            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.4 }}
              className="mt-12 flex items-center gap-4 text-white text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <span>Continue</span>
              <svg
                className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </motion.form>
        </div>
      </div>

      {/* Bottom corner text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 right-8 text-[var(--gray-1)] text-xs uppercase tracking-[0.2em]"
      >
        No account required
      </motion.div>
    </motion.div>
  );
}
