import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import styles from "./GlobalSpinner.module.css";
import { useLoading } from "@/hooks/Common/useLoading";

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
    <Box className={styles.spinnerContainer} role="alert" aria-live="assertive">
      <CircularProgress color={color} size={size} />
    </Box>
  );
};

export default GlobalSpinner;
