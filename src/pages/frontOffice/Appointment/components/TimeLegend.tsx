// src/frontOffice/components/TimeLegend.tsx
import { Box, Paper, Stack, Typography } from "@mui/material";
import React from "react";

export const TimeLegend: React.FC = () => {
  return (
    <Paper sx={{ p: 1, mb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mb: 0.5, display: "block" }}>
        Time Slot Legend:
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: "transparent", border: "1px solid #ddd" }} />
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Future
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: "#e8e8e8", border: "1px solid #ddd" }} />
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Elapsed
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: "#f5f5f5", border: "1px solid #ddd" }} />
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Outside Hours
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 2, backgroundColor: "red" }} />
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            Current Time
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
