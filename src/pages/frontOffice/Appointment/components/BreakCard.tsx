// src/pages/frontOffice/Appointment/components/BreakCard.tsx
import { BreakDto } from "@/interfaces/FrontOffice/BreakListDto";
import { Box, Typography, useTheme } from "@mui/material";
import React from "react";

interface BreakCardProps {
  breakItem: BreakDto;
  showDetails?: boolean;
  column?: number;
  totalColumns?: number;
  onClick?: (breakItem: BreakDto) => void;
}

export const BreakCard: React.FC<BreakCardProps> = ({ breakItem, showDetails = true, column = 0, totalColumns = 1, onClick }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const widthPercentage = 100 / totalColumns;
  const leftPercentage = (column * 100) / totalColumns;

  const getBackgroundColor = () => {
    if (breakItem.status === "Suspended") {
      return isDarkMode ? "#ff5722" : "#ffccbc";
    }
    return isDarkMode ? "#795548" : "#efebe9";
  };

  const getBorderColor = () => {
    if (breakItem.status === "Suspended") {
      return "#ff5722";
    }
    return "#8d6e63";
  };

  const getTextColor = () => {
    return isDarkMode ? "#ffffff" : "#3e2723";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "rgba(255,255,255,0.7)" : "#5d4037";
  };

  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();
  const textColor = getTextColor();
  const secondaryTextColor = getSecondaryTextColor();

  const isShortBreak = breakItem.bLEndTime && breakItem.bLStartTime && new Date(breakItem.bLEndTime).getTime() - new Date(breakItem.bLStartTime).getTime() <= 30 * 60 * 1000;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(breakItem);
  };

  return (
    <Box
      sx={{
        height: "100%",
        p: isShortBreak ? 0.25 : 0.5,
        borderRadius: 1,
        cursor: "pointer",
        fontSize: isShortBreak ? "0.65rem" : "0.75rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        border: `1px solid ${borderColor}`,
        boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
        "&:hover": {
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          transform: "scale(1.02)",
          boxShadow: isDarkMode ? "0 4px 8px rgba(0,0,0,0.5)" : "0 3px 6px rgba(0,0,0,0.2)",
        },
        width: `${widthPercentage - 1}%`,
        left: `${leftPercentage}%`,
        position: "absolute",
        transition: "all 0.2s ease-in-out",
        minHeight: isShortBreak ? "18px" : "24px",
        zIndex: 10, // Lower than appointments but higher than background
        color: textColor,
        fontWeight: "500",
        opacity: breakItem.status === "Suspended" ? 0.7 : 1,
      }}
      onClick={handleClick}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        display="block"
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: isShortBreak ? 1.1 : 1.2,
          fontSize: "inherit",
          mb: isShortBreak ? 0 : 0.25,
          color: textColor,
        }}
      >
        🚫 {breakItem.bLName}
      </Typography>

      {showDetails && !isShortBreak && (
        <>
          <Typography
            variant="caption"
            display="block"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.65rem",
              lineHeight: 1.1,
              color: secondaryTextColor,
            }}
          >
            {breakItem.assignedName || "Unassigned"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              lineHeight: 1,
              color: secondaryTextColor,
            }}
          >
            {breakItem.status === "Suspended" ? "Suspended" : "Break"}
          </Typography>
        </>
      )}

      {showDetails && isShortBreak && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            lineHeight: 1,
            fontWeight: "medium",
            color: secondaryTextColor,
          }}
        >
          Break
        </Typography>
      )}
    </Box>
  );
};
