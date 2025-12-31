"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function AddRuleForm() {
  const [text, setText] = useState("");
  const { name, addRule } = useStore();

  if (!name) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addRule(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-xs uppercase tracking-[0.2em] text-[var(--gray-1)] mb-8">
        Share a rule
      </label>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 300) + "px";
        }}
        placeholder="Write a rule to live by..."
        rows={2}
        className="w-full bg-transparent border-b border-[var(--gray-1)]/40 hover:border-[var(--gray-1)] focus:border-white px-0 py-4 text-xl md:text-2xl text-white placeholder:text-[var(--gray-1)]/60 focus:outline-none transition-colors duration-700 resize-none"
      />

      {text.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex items-center justify-end"
        >
          <motion.button
            type="submit"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-white text-xs uppercase tracking-[0.2em] group"
          >
            <span>Add</span>
            <svg
              className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </form>
  );
}
