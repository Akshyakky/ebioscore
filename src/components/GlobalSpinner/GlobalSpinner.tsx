// GlobalSpinner.tsx
import CircularProgress from "@mui/material/CircularProgress";
import { useLoading } from "../../context/LoadingContext";
import { Box } from "@mui/material";
import styles from "./GlobalSpinner.module.css";

const GlobalSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <Box className={styles.spinnerContainer}>
      <CircularProgress />
    </Box>
  );
};

export default GlobalSpinner;
