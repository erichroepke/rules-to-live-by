"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const galleryTransition = {
  duration: 0.6,
  ease: [0.19, 1, 0.22, 1] as const,
};

export function ExportModal({ isOpen, onClose }: Props) {
  const { rules, clearVotes } = useStore();
  const [generating, setGenerating] = useState(false);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get only the rules the user has voted for
  const favoriteRules = rules.filter((r) => r.has_voted);

  // Generate iPhone wallpaper using Canvas
  const generateWallpaper = async () => {
    setGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // iPhone dimensions (1170 x 2532 for iPhone 14 Pro)
    const width = 1170;
    const height = 2532;
    canvas.width = width;
    canvas.height = height;

    // Load background image
    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";

    bgImage.onload = () => {
      // Fill with pure black
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Draw Everest background - subtle but present
      ctx.filter = "grayscale(100%)";
      ctx.globalAlpha = 0.3;

      // Cover the canvas with the image
      const scale = Math.max(width / bgImage.width, height / bgImage.height);
      const imgX = (width - bgImage.width * scale) / 2;
      const imgY = (height - bgImage.height * scale) / 2;
      ctx.drawImage(bgImage, imgX, imgY, bgImage.width * scale, bgImage.height * scale);

      // Reset filters
      ctx.filter = "none";
      ctx.globalAlpha = 1;

      // Dark overlay for text legibility
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, width, height);

      // === PREMIUM EDITORIAL DESIGN ===
      const marginX = 120;
      const maxRules = Math.min(favoriteRules.length, 10);

      // iPhone safe zones
      const safeTop = 320;
      const safeBottom = 200;
      const contentHeight = height - safeTop - safeBottom;

      // Typography scale based on rule count
      const fontSize = maxRules <= 5 ? 42 : maxRules <= 7 ? 36 : 30;
      const lineHeight = Math.round(fontSize * 1.45);
      const ruleSpacing = maxRules <= 5 ? 60 : maxRules <= 7 ? 45 : 35;

      // First pass: measure all rules to calculate total height
      const ruleData: { lines: string[]; height: number }[] = [];
      const textWidth = width - marginX * 2;

      for (let i = 0; i < maxRules; i++) {
        const rule = favoriteRules[i];
        ctx.font = `300 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;

        const words = rule.text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          if (ctx.measureText(testLine).width > textWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const ruleHeight = lines.length * lineHeight;
        ruleData.push({ lines, height: ruleHeight });
      }

      const totalContentHeight = ruleData.reduce((sum, r) => sum + r.height + ruleSpacing, 0) - ruleSpacing;
      let y = safeTop + Math.max(40, (contentHeight - totalContentHeight) / 2);

      // Draw each rule
      for (let i = 0; i < maxRules; i++) {
        const { lines } = ruleData[i];

        // Draw each line of text
        ctx.font = `300 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "left";

        for (let j = 0; j < lines.length; j++) {
          const lineY = y + j * lineHeight;

          // Number only on first line, right-aligned in left margin
          if (j === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.font = `300 ${fontSize * 0.5}px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = "right";
            ctx.fillText(String(i + 1).padStart(2, "0"), marginX - 25, lineY);
          }

          // Rule text
          ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
          ctx.font = `300 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(lines[j], marginX, lineY);
        }

        y += ruleData[i].height + ruleSpacing;
      }

      // Minimal footer branding
      ctx.font = "300 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.textAlign = "center";
      ctx.fillText("RULES TO LIVE BY", width / 2, height - 120);
      ctx.font = "300 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("2025", width / 2, height - 90);

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setWallpaperUrl(url);
          setGenerating(false);
        }
      }, "image/png");
    };

    bgImage.src = "/bg-optimized.jpg";
  };

  // Copy rules as text
  const copyAsText = () => {
    const text = favoriteRules
      .map((r, i) => `${i + 1}. ${r.text}`)
      .join("\n\n");

    const fullText = `RULES TO LIVE BY - 2025\n\n${text}\n\n---\nrulestolive.by`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Native share if available
  const nativeShare = async () => {
    const text = favoriteRules
      .map((r, i) => `${i + 1}. ${r.text}`)
      .join("\n\n");

    const fullText = `RULES TO LIVE BY - 2025\n\n${text}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rules to Live By",
          text: fullText,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  // Download wallpaper
  const downloadWallpaper = () => {
    if (!wallpaperUrl) return;

    const link = document.createElement("a");
    link.href = wallpaperUrl;
    link.download = "rules-to-live-by-2025.png";
    link.click();
  };

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (wallpaperUrl) {
        URL.revokeObjectURL(wallpaperUrl);
      }
    };
  }, [wallpaperUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={galleryTransition}
          className="bg-black border border-white/10 max-w-lg w-full max-h-[85vh] overflow-y-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Export Your Rules</h2>
              <button
                onClick={onClose}
                className="text-[var(--gray-1)] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[var(--gray-1)] text-sm">
              {favoriteRules.length} rule{favoriteRules.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {favoriteRules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--gray-1)]">Heart some rules first to export them.</p>
              </div>
            ) : (
              <>
                {/* iPhone Wallpaper */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
                    iPhone Wallpaper
                  </h3>

                  {!wallpaperUrl ? (
                    <button
                      onClick={generateWallpaper}
                      disabled={generating}
                      className="w-full py-4 border border-white/20 hover:border-white text-white text-sm uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
                    >
                      {generating ? "Generating..." : "Generate Wallpaper"}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Preview */}
                      <div className="relative aspect-[9/19.5] max-h-[300px] mx-auto overflow-hidden border border-white/10 rounded-[20px]">
                        <img
                          src={wallpaperUrl}
                          alt="Wallpaper preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <button
                        onClick={downloadWallpaper}
                        className="w-full py-4 bg-white text-black text-sm uppercase tracking-[0.15em] hover:bg-white/90 transition-colors"
                      >
                        Download Wallpaper
                      </button>

                      <button
                        onClick={() => setWallpaperUrl(null)}
                        className="w-full py-2 text-[var(--gray-1)] text-xs uppercase tracking-[0.15em] hover:text-white transition-colors"
                      >
                        Generate New
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Copy as Text */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
                    Copy as Text
                  </h3>
                  <button
                    onClick={copyAsText}
                    className="w-full py-4 border border-white/20 hover:border-white text-white text-sm uppercase tracking-[0.15em] transition-colors"
                  >
                    {copied ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>

                {/* Native Share (if available) */}
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <>
                    <div className="border-t border-white/10" />
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)]">
                        Share
                      </h3>
                      <button
                        onClick={nativeShare}
                        className="w-full py-4 border border-white/20 hover:border-white text-white text-sm uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share via Messages, Email, etc.
                      </button>
                    </div>
                  </>
                )}

                {/* Preview of selected rules */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--gray-1)] mb-4">
                    Your Selected Rules
                  </h3>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto">
                    {favoriteRules.map((rule, i) => (
                      <div key={rule.id} className="flex gap-4 text-sm">
                        <span className="text-[var(--gray-1)] tabular-nums shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-white">{rule.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Over */}
                <div className="border-t border-white/10 pt-6">
                  <button
                    onClick={() => {
                      clearVotes();
                      setWallpaperUrl(null);
                      onClose();
                    }}
                    className="w-full py-3 text-[var(--gray-1)] text-xs uppercase tracking-[0.15em] hover:text-white transition-colors"
                  >
                    Clear Selection and Start Over
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Hidden canvas for generation */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
