// Design tokens and theme constants for PaymentGuard

export const THEME = {
  // Primary Gradients
  gradients: {
    primary: "from-cyan-400 via-blue-400 to-purple-400",
    dark: "from-slate-900 via-blue-900 to-slate-900",
    success: "from-emerald-400 to-teal-400",
    danger: "from-red-400 to-pink-400",
    warning: "from-amber-400 to-orange-400",
  },

  // Core Colors
  colors: {
    bg: {
      primary: "#0f172a",      // slate-900
      secondary: "#1e293b",    // slate-800
      tertiary: "#334155",     // slate-700
    },
    accent: {
      cyan: "#22d3ee",         // cyan-400
      blue: "#3b82f6",         // blue-500
      purple: "#a855f7",       // purple-500
    },
    status: {
      success: "#10b981",      // emerald-500
      warning: "#f59e0b",      // amber-500
      error: "#ef4444",        // red-500
      info: "#06b6d4",         // cyan-500
    },
  },

  // Shadows
  shadows: {
    sm: "0 4px 6px rgba(0, 0, 0, 0.1), 0 0 20px rgba(34, 211, 238, 0.1)",
    md: "0 10px 25px rgba(0, 0, 0, 0.2), 0 0 30px rgba(34, 211, 238, 0.15)",
    lg: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(34, 211, 238, 0.2)",
    glow: "0 0 30px rgba(34, 211, 238, 0.5), inset 0 0 20px rgba(34, 211, 238, 0.1)",
  },

  // Border Radius
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
  },

  // Animation Durations
  animation: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
};
