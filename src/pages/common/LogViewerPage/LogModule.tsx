import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import LogViewer from "./LogViewer";

/**
 * Application Log Module
 *
 * This component provides a complete log viewing experience, integrated with the
 * loading provider to handle loading states during API calls.
 */
const LogModule: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={2}
        sx={{
          p: 0,
          borderRadius: "8px",
          overflow: "hidden",
          height: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 3,
            py: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="h1">
            System Logs
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <LogViewer />
        </Box>
      </Paper>
    </Box>
  );
};

export default LogModule;
