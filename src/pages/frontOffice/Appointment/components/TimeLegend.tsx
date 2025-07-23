import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import React from "react";

export const TimeLegend: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const getLegendItemStyles = (type: "future" | "elapsed" | "outside" | "current") => {
    const baseStyles = {
      future: {
        backgroundColor: "transparent",
        border: isDarkMode ? `1px solid ${theme.palette.grey[600]}` : "1px solid #ddd",
        width: 16,
        height: 16,
      },
      elapsed: {
        backgroundColor: isDarkMode ? theme.palette.grey[700] : "#e8e8e8",
        border: isDarkMode ? `1px solid ${theme.palette.grey[500]}` : "1px solid #ddd",
        width: 16,
        height: 16,
      },
      outside: {
        backgroundColor: isDarkMode ? theme.palette.grey[800] : "#f5f5f5",
        border: isDarkMode ? `1px solid ${theme.palette.grey[600]}` : "1px solid #ddd",
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

  const getLegendTextColor = () => {
    return isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary;
  };

  return (
    <Paper
      sx={{
        p: 1,
        mb: 1,
        backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
        border: isDarkMode ? `1px solid ${theme.palette.grey[700]}` : "1px solid #e0e0e0",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          mb: 0.5,
          display: "block",
          color: getLegendTextColor(),
          fontWeight: isDarkMode ? "500" : "normal",
        }}
      >
        Time Slot Legend:
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={getLegendItemStyles("future")} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.primary,
            }}
          >
            Future
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={getLegendItemStyles("elapsed")} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.primary,
            }}
          >
            Elapsed
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={getLegendItemStyles("outside")} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.primary,
            }}
          >
            Outside Hours
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={getLegendItemStyles("current")} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.primary,
            }}
          >
            Current Time
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
