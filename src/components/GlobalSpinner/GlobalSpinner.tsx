import { useLoading } from "@/hooks/Common/useLoading";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState } from "react";

interface GlobalSpinnerProps {
  delay?: number;
  color?: "primary" | "secondary" | "inherit";
  size?: number;
}

const GlobalSpinner: React.FC<GlobalSpinnerProps> = ({ delay = 300, color = "primary", size = 40 }) => {
  const { isLoading } = useLoading();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => setShouldRender(true), delay);
    } else {
      setShouldRender(false);
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  if (!shouldRender) return null;

  return (
    <Box role="alert" aria-live="assertive">
      <CircularProgress color={color} size={size} />
    </Box>
  );
};

export default GlobalSpinner;
