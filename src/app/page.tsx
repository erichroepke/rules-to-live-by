"use client";

import { motion } from "framer-motion";
import { NameModal } from "@/components/NameModal";
import { AddRuleForm } from "@/components/AddRuleForm";
import { RuleFeed } from "@/components/RuleFeed";

const galleryTransition = {
  duration: 1.2,
  ease: [0.19, 1, 0.22, 1] as const,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Super subtle B&W background - Everest panorama (fixed, no repeat) */}
      <div
        style={{
          position: "fixed",
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
          backgroundAttachment: "fixed",
          filter: "grayscale(100%)",
          opacity: 0.12,
        }}
      />

      <NameModal />

      <main className="relative z-10 max-w-5xl mx-auto px-8 md:px-16">
        {/* Hero section - huge type, massive whitespace */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...galleryTransition, delay: 0.1 }}
          className="pt-32 pb-24 md:pt-48 md:pb-32"
        >
          <h1 className="text-[14vw] sm:text-[10vw] md:text-[8vw] font-semibold text-white leading-[0.85] tracking-display">
            Wisdom
          </h1>
          <p className="mt-8 text-[var(--gray-1)] text-lg md:text-xl max-w-lg">
            Life rules from the crew. Read, reflect, upvote what resonates with you.
          </p>
        </motion.section>

        {/* Add rule form */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...galleryTransition, delay: 0.3 }}
          className="pb-24 md:pb-32 border-t border-[var(--gray-1)]/20 pt-16"
        >
          <AddRuleForm />
        </motion.section>

        {/* Rules feed */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...galleryTransition, delay: 0.5 }}
        >
          <div className="flex items-baseline justify-between mb-16 border-t border-[var(--gray-1)]/20 pt-16">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
              All Rules
            </h2>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
              By upvotes
            </span>
          </div>
          <RuleFeed />
        </motion.section>
      </main>

      {/* Footer - minimal */}
      <footer className="mt-48 border-t border-[var(--gray-1)]/20">
        <div className="max-w-5xl mx-auto px-8 md:px-16 py-16 flex justify-between items-center">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
            Rules to Live By
          </span>
          <span className="text-xs text-[var(--gray-1)]">
            2024
          </span>
        </div>
      </footer>
    </div>
  );
}
