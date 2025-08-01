import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import React from "react";

export const TimeLegend: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const LegendItem = ({ type, label }: { type: "future" | "elapsed" | "outside" | "current"; label: string }) => {
    const getLegendItemStyles = () => {
      const baseStyles = {
        future: {
          backgroundColor: "transparent",
          border: `1px solid ${isDarkMode ? theme.palette.grey[600] : theme.palette.divider}`,
          width: 16,
          height: 16,
        },
        elapsed: {
          backgroundColor: isDarkMode ? theme.palette.grey[700] : "#e8e8e8",
          border: `1px solid ${isDarkMode ? theme.palette.grey[500] : theme.palette.divider}`,
          width: 16,
          height: 16,
        },
        outside: {
          backgroundColor: isDarkMode ? theme.palette.grey[800] : "#f5f5f5",
          border: `1px solid ${isDarkMode ? theme.palette.grey[600] : theme.palette.divider}`,
          width: 16,
          height: 16,
        },
        current: {
          backgroundColor: isDarkMode ? "#ff4444" : "red",
          width: 16,
          height: 2,
        },
      };

      return baseStyles[type];
    };

    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box style={getLegendItemStyles()} />
        <Typography variant="caption" color="text.primary" style={{ fontSize: "0.7rem" }}>
          {label}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      variant="outlined"
      style={{
        padding: 8,
        marginBottom: 8,
        backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
        border: `1px solid ${isDarkMode ? theme.palette.grey[700] : theme.palette.divider}`,
      }}
    >
      <Typography
        variant="caption"
        color={isDarkMode ? theme.palette.text.primary : "text.secondary"}
        fontWeight={isDarkMode ? 500 : "normal"}
        display="block"
        marginBottom={0.5}
        style={{ fontSize: "0.7rem" }}
      >
        Time Slot Legend:
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <LegendItem type="future" label="Future" />
        <LegendItem type="elapsed" label="Elapsed" />
        <LegendItem type="outside" label="Outside Hours" />
        <LegendItem type="current" label="Current Time" />
      </Stack>
    </Paper>
  );
};
