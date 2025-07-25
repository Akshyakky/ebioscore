import { useLoading } from "@/hooks/Common/useLoading";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

interface GlobalSpinnerProps {
  /**
   * Custom loading message to display below the spinner
   */
  message?: string;
  /**
   * Size of the spinner - can be a number (pixels) or 'small' | 'medium' | 'large'
   */
  size?: number | "small" | "medium" | "large";
  /**
   * Color of the spinner
   */
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  /**
   * Custom z-index for the backdrop
   */
  zIndex?: number;
  /**
   * Whether to show the loading message
   */
  showMessage?: boolean;
}

/**
 * GlobalSpinner - A full-screen loading spinner component
 *
 * This component automatically shows/hides based on the global loading state
 * managed by the useLoading hook. It provides a backdrop overlay with a
 * centered loading spinner and optional message.
 *
 * Features:
 * - Integrates with global loading state
 * - Customizable spinner size, color, and message
 * - Accessible with proper ARIA labels
 * - Prevents user interaction during loading
 * - Responsive design
 */
const GlobalSpinner: React.FC<GlobalSpinnerProps> = ({ message = "Loading...", size = 60, color = "primary", zIndex = 9999, showMessage = true }) => {
  const { isLoading } = useLoading();

  // Don't render anything if not loading
  if (!isLoading) {
    return null;
  }

  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: "#fff",
        zIndex: zIndex,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      // Prevent clicks from closing the backdrop
      onClick={(e) => e.preventDefault()}
      // Add accessibility attributes
      aria-labelledby="global-spinner-message"
      aria-describedby="global-spinner-description"
      role="progressbar"
      aria-live="polite"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(4px)",
          minWidth: 200,
          textAlign: "center",
        }}
      >
        <CircularProgress size={size} color={color} thickness={4} aria-label="Loading indicator" />

        {showMessage && message && (
          <Typography
            id="global-spinner-message"
            variant="h6"
            component="div"
            sx={{
              color: "white",
              fontWeight: 500,
              fontSize: "1.1rem",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            {message}
          </Typography>
        )}

        {/* Hidden description for screen readers */}
        <Typography id="global-spinner-description" sx={{ position: "absolute", left: "-10000px" }} aria-hidden="true">
          Please wait while the application is loading
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalSpinner;
