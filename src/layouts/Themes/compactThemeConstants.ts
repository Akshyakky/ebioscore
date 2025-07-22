// Compact Layout Constants
export const COMPACT_CONSTANTS = {
  drawer: {
    miniWidth: 48,
    compactWidth: 240,
    standardWidth: 280,
    comfortableWidth: 320,
  },
  appbar: {
    compactHeight: 48,
    standardHeight: 56,
    comfortableHeight: 64,
  },
  spacing: {
    compact: 4,
    standard: 8,
    comfortable: 12,
  },
  components: {
    table: {
      compact: {
        headerHeight: 36,
        rowHeight: 32,
        paginationHeight: 40,
        cellPadding: "6px 8px",
        fontSize: "0.75rem",
      },
      standard: {
        headerHeight: 44,
        rowHeight: 40,
        paginationHeight: 52,
        cellPadding: "8px 12px",
        fontSize: "0.875rem",
      },
      comfortable: {
        headerHeight: 52,
        rowHeight: 48,
        paginationHeight: 60,
        cellPadding: "12px 16px",
        fontSize: "0.95rem",
      },
    },
    dataGrid: {
      compact: {
        headerHeight: 36,
        rowHeight: 32,
        cellPadding: "4px 6px",
        editCellPadding: "2px 4px",
        fontSize: "0.75rem",
        headerFontSize: "0.75rem",
      },
      standard: {
        headerHeight: 44,
        rowHeight: 40,
        cellPadding: "6px 8px",
        editCellPadding: "4px 6px",
        fontSize: "0.875rem",
        headerFontSize: "0.875rem",
      },
      comfortable: {
        headerHeight: 52,
        rowHeight: 48,
        cellPadding: "8px 12px",
        editCellPadding: "6px 8px",
        fontSize: "0.95rem",
        headerFontSize: "0.95rem",
      },
    },
    button: {
      compact: {
        smallHeight: 24,
        mediumHeight: 28,
        largeHeight: 32,
        fontSize: "0.75rem",
      },
      standard: {
        smallHeight: 28,
        mediumHeight: 32,
        largeHeight: 36,
        fontSize: "0.875rem",
      },
      comfortable: {
        smallHeight: 32,
        mediumHeight: 36,
        largeHeight: 40,
        fontSize: "0.95rem",
      },
    },
    dialog: {
      compact: {
        spacing: 12,
        titleHeight: 36,
        footerHeight: 40,
      },
      standard: {
        spacing: 16,
        titleHeight: 40,
        footerHeight: 48,
      },
      comfortable: {
        spacing: 20,
        titleHeight: 48,
        footerHeight: 56,
      },
    },
  },
  typography: {
    compact: {
      h1: "1.75rem",
      h2: "1.5rem",
      h3: "1.25rem",
      h4: "1.125rem",
      h5: "1rem",
      h6: "0.875rem",
      body1: "0.8rem",
      body2: "0.75rem",
      caption: "0.65rem",
    },
    standard: {
      h1: "2.25rem",
      h2: "1.875rem",
      h3: "1.5rem",
      h4: "1.25rem",
      h5: "1.125rem",
      h6: "1rem",
      body1: "0.875rem",
      body2: "0.8rem",
      caption: "0.75rem",
    },
    comfortable: {
      h1: "2.5rem",
      h2: "2rem",
      h3: "1.75rem",
      h4: "1.5rem",
      h5: "1.25rem",
      h6: "1.125rem",
      body1: "0.95rem",
      body2: "0.875rem",
      caption: "0.8rem",
    },
  },
};

// Breakpoint-based density mapping
export const RESPONSIVE_DENSITY_MAP = {
  xs: "compact" as const, // Mobile phones (< 600px)
  sm: "compact" as const, // Small tablets (600px - 960px)
  md: "standard" as const, // Tablets/Small laptops (960px - 1280px)
  lg: "standard" as const, // Laptops (1280px - 1920px)
  xl: "comfortable" as const, // Large screens (> 1920px)
};

// Adaptive spacing based on density and breakpoint
export const getAdaptiveSpacing = (density: "compact" | "standard" | "comfortable", breakpoint: "xs" | "sm" | "md" | "lg" | "xl") => {
  const baseSpacing = COMPACT_CONSTANTS.spacing[density];

  // Reduce spacing on smaller screens regardless of density setting
  if (breakpoint === "xs") return Math.max(baseSpacing * 0.5, 4);
  if (breakpoint === "sm") return Math.max(baseSpacing * 0.75, 6);

  return baseSpacing;
};

// Density-aware component sizing utilities
export const getDensityConfig = (density: "compact" | "standard" | "comfortable", component: keyof typeof COMPACT_CONSTANTS.components) => {
  return COMPACT_CONSTANTS.components[component][density];
};

export default COMPACT_CONSTANTS;
