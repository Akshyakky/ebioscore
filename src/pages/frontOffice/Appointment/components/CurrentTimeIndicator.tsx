// src/frontOffice/components/CurrentTimeIndicator.tsx
import { Box } from "@mui/material";
import React from "react";

interface CurrentTimeIndicatorProps {
  date: Date;
  height: number;
  timeSlots: Array<{ time: string; hour: number; minute: number }>;
  currentTime: Date;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({ date, height, timeSlots, currentTime }) => {
  const isToday = date.toDateString() === new Date().toDateString();
  if (!isToday) return null;

  const topPosition = ((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * (timeSlots.length * height);

  return (
    <Box
      style={{
        position: "absolute",
        width: "100%",
        height: "2px",
        backgroundColor: "red",
        top: `${topPosition}px`,
        zIndex: 2,
      }}
    >
      <Box
        style={{
          position: "absolute",
          left: -6,
          top: -3,
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "red",
        }}
      />
    </Box>
  );
};
