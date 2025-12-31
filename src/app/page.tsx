"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddRuleForm } from "@/components/AddRuleForm";
import { RuleFeed } from "@/components/RuleFeed";
import { ExportModal } from "@/components/ExportModal";
import { useStore } from "@/lib/store";

const galleryTransition = {
  duration: 1.2,
  ease: [0.19, 1, 0.22, 1] as const,
};

// Detect Instagram/Facebook in-app browser
const isInAppBrowser = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /Instagram|FBAN|FBAV/i.test(ua);
};

export default function Home() {
  const [showExport, setShowExport] = useState(false);
  const [showInAppWarning, setShowInAppWarning] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { rules } = useStore();
  const favoriteCount = rules.filter((r) => r.has_voted).length;

  useEffect(() => {
    setShowInAppWarning(isInAppBrowser());
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText("https://rules-to-live-by.netlify.app");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative">
      {/* Instagram/Facebook in-app browser warning */}
      <AnimatePresence>
        {showInAppWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-3"
          >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-center sm:text-left">
                For the best experience, open in Safari or Chrome
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLink}
                  className="px-4 py-1.5 bg-black text-white text-xs uppercase tracking-wider rounded hover:bg-black/80 transition-colors"
                >
                  {linkCopied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => setShowInAppWarning(false)}
                  className="p-1.5 hover:bg-black/10 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 md:px-16">
        {/* Hero section - huge type, massive whitespace */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...galleryTransition, delay: 0.1 }}
          className="pt-32 pb-12 md:pt-48 md:pb-32"
        >
          <h1 className="text-[10vw] sm:text-[10vw] md:text-[8vw] font-semibold text-white leading-[1] tracking-display">
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
          className="pb-12 md:pb-32 border-t border-[var(--gray-1)]/20 pt-8 md:pt-16"
        >
          <AddRuleForm />
        </motion.section>

        {/* Rules feed */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...galleryTransition, delay: 0.5 }}
        >
          <div className="flex items-baseline justify-between mb-8 md:mb-16 border-t border-[var(--gray-1)]/20 pt-8 md:pt-16">
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
            2025
          </span>
        </div>
      </footer>

      {/* Sticky Export Footer - appears when user has favorites */}
      <AnimatePresence>
        {favoriteCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={galleryTransition}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-t border-white/10"
          >
            <div className="max-w-5xl mx-auto px-8 md:px-16 py-4 flex items-center justify-between">
              <span className="text-sm text-[var(--gray-1)]">
                <span className="text-white">{favoriteCount}</span>/10 selected
              </span>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white text-black text-xs uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}
