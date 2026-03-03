interface GCLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animate?: boolean;
}

const sizeMap = {
  sm: { logo: 32, text: "text-lg", sub: "text-[9px]", font: "text-[10px]" },
  md: { logo: 44, text: "text-xl", sub: "text-[10px]", font: "text-[11px]" },
  lg: { logo: 64, text: "text-3xl", sub: "text-xs", font: "text-sm" },
  xl: { logo: 96, text: "text-5xl", sub: "text-sm", font: "text-base" },
};

export default function GCLogo({ size = "md", showText = true, animate = true }: GCLogoProps) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo Mark */}
      <div className="relative flex-shrink-0" style={{ width: s.logo, height: s.logo }}>
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 ${animate ? "animate-pulse" : ""}`}
          style={{ filter: "blur(6px)", opacity: 0.6 }}
        />
        {/* Main badge */}
        <div
          className="relative w-full h-full rounded-xl bg-gradient-to-br from-violet-700 via-purple-700 to-pink-700 flex items-center justify-center shadow-xl border border-purple-400/30"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          {/* Inner shine */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/15 to-transparent" />

          {/* GC Text */}
          <div className="relative flex items-baseline gap-[1px]">
            <span
              className="font-black text-white leading-none"
              style={{
                fontSize: s.logo * 0.40,
                textShadow: "0 1px 4px rgba(0,0,0,0.5), 0 0 12px rgba(196,132,252,0.8)",
                letterSpacing: "-0.02em",
              }}
            >
              G
            </span>
            <span
              className="font-black leading-none"
              style={{
                fontSize: s.logo * 0.40,
                color: "#f9a8d4",
                textShadow: "0 1px 4px rgba(0,0,0,0.5), 0 0 12px rgba(249,168,212,0.8)",
                letterSpacing: "-0.02em",
              }}
            >
              C
            </span>
          </div>

          {/* Corner star accent */}
          <div
            className="absolute top-1 right-1 text-yellow-300"
            style={{ fontSize: s.logo * 0.15, opacity: 0.9, lineHeight: 1 }}
          >
            ★
          </div>
        </div>

        {/* Bottom reflection */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-purple-500/30"
          style={{ width: s.logo * 0.7, height: 4, filter: "blur(4px)" }}
        />
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-black tracking-tight ${s.text} bg-gradient-to-r from-violet-300 via-purple-200 to-pink-300 bg-clip-text text-transparent`}
            style={{ textShadow: "none", letterSpacing: "-0.02em" }}
          >
            Game Club
          </span>
          <span className={`${s.sub} font-semibold text-purple-400/80 tracking-widest uppercase`}>
            Arcade Portal
          </span>
        </div>
      )}
    </div>
  );
}
