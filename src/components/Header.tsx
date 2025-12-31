"use client";

export function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* Gradient fade - content fades away as it approaches header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{ position: "relative", zIndex: 10 }}
        className="max-w-5xl mx-auto px-8 md:px-16 h-20 flex items-center"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-white">
          Rules to Live By
        </span>
      </div>
    </header>
  );
}
