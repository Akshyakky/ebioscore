// src/layouts/CompactLayout/hooks/useResponsiveDensity.ts
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { RESPONSIVE_DENSITY_MAP } from "../Themes/compactThemeConstants";

export const useResponsiveDensity = (initialDensity: "compact" | "standard" | "comfortable" = "standard") => {
  const theme = useTheme();
  const [manualDensity, setManualDensity] = useState<"compact" | "standard" | "comfortable" | null>(null);

  // Breakpoint detection
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  // Determine current breakpoint
  const currentBreakpoint = useMemo(() => {
    if (isXs) return "xs";
    if (isSm) return "sm";
    if (isMd) return "md";
    if (isLg) return "lg";
    if (isXl) return "xl";
    return "lg"; // fallback
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Calculate effective density
  const effectiveDensity = useMemo(() => {
    // Manual override takes precedence
    if (manualDensity) return manualDensity;

    // Use responsive mapping
    return RESPONSIVE_DENSITY_MAP[currentBreakpoint as keyof typeof RESPONSIVE_DENSITY_MAP];
  }, [manualDensity, currentBreakpoint]);

  // Auto-adjust for very small screens
  useEffect(() => {
    if (isXs && manualDensity !== "compact") {
      // Don't override if user explicitly set compact mode
      if (manualDensity === null) {
        // Auto-enable compact for xs screens
      }
    }
  }, [isXs, manualDensity]);

  const setDensity = (density: "compact" | "standard" | "comfortable") => {
    setManualDensity(density);
  };

  const resetDensity = () => {
    setManualDensity(null);
  };

  const isAutomatic = manualDensity === null;

  return {
    density: effectiveDensity,
    setDensity,
    resetDensity,
    isAutomatic,
    currentBreakpoint,
    manualDensity,
  };
};
