// src/layouts/CompactLayout/MainLayout.tsx
import { selectUser } from "@/store/features/auth/selectors";
import { useAppSelector } from "@/store/hooks";
import { ArrowUpwardSharp } from "@mui/icons-material";
import { Alert, Box, Button, Fab, Paper, Snackbar, Typography, Zoom, useMediaQuery, useTheme } from "@mui/material";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbsNavigation from "../BreadcrumbsNavigations";
import SideBar from "../SideBar/SideBar";

// Density Context for application-wide density control
interface DensityContextType {
  density: "comfortable" | "standard" | "compact";
  setDensity: (density: "comfortable" | "standard" | "compact") => void;
  isCompactMode: boolean;
  toggleCompactMode: () => void;
}

const DensityContext = createContext<DensityContextType>({
  density: "compact",
  setDensity: () => {},
  isCompactMode: false,
  toggleCompactMode: () => {},
});

export const useDensity = () => useContext(DensityContext);

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const userInfo = useAppSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [density, setDensity] = useState<"comfortable" | "standard" | "compact">("compact");
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Responsive breakpoints
  const isExtraSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const isMedium = useMediaQuery(theme.breakpoints.down("lg"));

  // Auto-enable compact mode on smaller screens
  React.useEffect(() => {
    if (isExtraSmall && !isCompactMode) {
      setIsCompactMode(true);
      setDensity("compact");
    }
  }, [isExtraSmall, isCompactMode]);

  // Calculate effective user ID
  const effectiveUserID = useMemo(() => {
    if (!userInfo) return -1;
    return userInfo.adminYN === "Y" ? 0 : userInfo.userID;
  }, [userInfo?.adminYN, userInfo?.userID]);

  const userToken = useMemo(() => userInfo?.token || null, [userInfo?.token]);

  // Compact mode toggle
  const toggleCompactMode = useCallback(() => {
    setIsCompactMode((prev) => {
      const newCompactMode = !prev;
      if (newCompactMode) {
        setDensity("compact");
      } else {
        setDensity("standard");
      }
      return newCompactMode;
    });
  }, []);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  const handleReturnToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const isDashboard = useMemo(() => location.pathname === "/dashboard", [location.pathname]);

  // Density context value
  const densityContextValue = useMemo(
    () => ({
      density,
      setDensity,
      isCompactMode,
      toggleCompactMode,
    }),
    [density, isCompactMode, toggleCompactMode]
  );

  // Calculate dynamic spacing based on density and screen size
  const getSpacing = useCallback(() => {
    if (isCompactMode || density === "compact") {
      return isExtraSmall ? 1 : 1.5;
    }
    if (density === "comfortable") {
      return isExtraSmall ? 2 : 3;
    }
    return isExtraSmall ? 1.5 : 2;
  }, [density, isCompactMode, isExtraSmall]);

  const spacing = getSpacing();

  if (!userInfo || !userInfo.token) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "90%", textAlign: "center" }}>
          <Typography variant="h5" component="h1" gutterBottom color="primary">
            Session Expired
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Your session has expired or you are not logged in. Please return to the login page.
          </Typography>
          <Button variant="contained" color="primary" size="large" onClick={handleReturnToLogin} fullWidth sx={{ mt: 2 }}>
            Return to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <DensityContext.Provider value={densityContextValue}>
      <Box display="flex" flexDirection="column" bgcolor="background.default" color="text.primary">
        <Box display="flex" flex={1}>
          {/* Compact Sidebar */}
          <SideBar userID={effectiveUserID} token={userToken} isCompactMode={isCompactMode} density={density} />

          <Box
            component="main"
            flexGrow={1}
            width="100%"
            p={spacing}
            pt={{ xs: isCompactMode ? 8 : 9, sm: isCompactMode ? 9 : 10 }}
            pb={spacing}
            display="flex"
            flexDirection="column"
          >
            {/* Density Control Toolbar */}
            {!isDashboard && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={spacing} flexWrap="wrap" gap={1}>
                <Box flex={1}>
                  <BreadcrumbsNavigation />
                </Box>

                {/* <Box display="flex" gap={1} alignItems="center">
                  <ToggleButtonGroup
                    value={density}
                    exclusive
                    onChange={(_, newDensity) => newDensity && setDensity(newDensity)}
                    size="small"
                    sx={{ display: { xs: "none", sm: "flex" } }}
                  >
                    <ToggleButton value="comfortable" aria-label="comfortable density">
                      <Tooltip title="Comfortable">
                        <ViewComfy fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="standard" aria-label="standard density">
                      <Tooltip title="Standard">
                        <DensityMedium fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="compact" aria-label="compact density">
                      <Tooltip title="Compact">
                        <DensitySmall fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box> */}
              </Box>
            )}

            {/* Main content area with dynamic spacing */}
            <Box
              bgcolor={isDashboard ? "transparent" : "background.paper"}
              borderRadius={isDashboard ? 0 : 1}
              boxShadow={isDashboard ? "none" : 1}
              p={isDashboard ? 0 : spacing}
              minHeight="calc(100vh - 200px)"
              display="flex"
              flexDirection="column"
              position="relative"
              flex={1}
              sx={{
                transition: theme.transitions.create(["padding"], {
                  duration: theme.transitions.duration.short,
                }),
              }}
            >
              {children}
            </Box>

            {/* Back to top button - smaller in compact mode */}
            <Zoom in={scrolled}>
              <Fab
                color="primary"
                size={isCompactMode ? "small" : "medium"}
                aria-label="scroll back to top"
                onClick={scrollToTop}
                sx={{
                  position: "fixed",
                  bottom: (theme) => theme.spacing(isCompactMode ? 6 : 8),
                  right: (theme) => theme.spacing(isCompactMode ? 1.5 : 2),
                  transition: theme.transitions.create(["bottom", "right"], {
                    duration: theme.transitions.duration.short,
                  }),
                }}
              >
                <ArrowUpwardSharp />
              </Fab>
            </Zoom>
          </Box>
        </Box>

        {/* Error notification */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={handleCloseError} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DensityContext.Provider>
  );
};

export default React.memo(MainLayout);
