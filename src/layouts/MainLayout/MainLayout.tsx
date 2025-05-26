import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Fab, Tooltip, Paper, Typography, Button, Alert, Snackbar, Zoom, useMediaQuery, useTheme } from "@mui/material";
import { selectUser } from "@/store/features/auth/selectors";
import { useAppSelector } from "@/store/hooks";
import SideBar from "../SideBar/SideBar";
import Footer from "../Footer";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate, useLocation } from "react-router-dom";
import BreadcrumbsNavigation from "../BreadcrumbsNavigations";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const userInfo = useAppSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [scrolled, setScrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate effective user ID for admin permissions
  const effectiveUserID = useMemo(() => {
    if (!userInfo) return -1;
    return userInfo.adminYN === "Y" ? 0 : userInfo.userID;
  }, [userInfo]);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Handle scroll events to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close error notification
  const handleCloseError = () => {
    setError(null);
  };

  // Handle expired session
  const handleReturnToLogin = () => {
    navigate("/login");
  };

  // Check if we're in the dashboard
  const isDashboard = location.pathname === "/dashboard";

  // Show login page or error state when not authenticated
  if (!userInfo || !userInfo.token) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 400,
            width: "90%",
            textAlign: "center",
          }}
        >
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
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="background.default" color="text.primary">
      <Box display="flex" flex={1}>
        {userInfo && <SideBar userID={effectiveUserID} token={userInfo.token} />}
        <Box component="main" flexGrow={1} width="100%" p={{ xs: 2, sm: 3 }} pt={{ xs: 9, sm: 10 }} pb={3} display="flex" flexDirection="column">
          {/* Breadcrumbs navigation */}
          {!isDashboard && <BreadcrumbsNavigation />}

          {/* Main content area */}
          <Box
            bgcolor={isDashboard ? "transparent" : "background.paper"}
            borderRadius={isDashboard ? 0 : 1}
            boxShadow={isDashboard ? "none" : 1}
            p={isDashboard ? 0 : { xs: 2, sm: 3 }}
            minHeight="calc(100vh - 300px)"
            display="flex"
            flexDirection="column"
            position="relative"
            flex={1}
          >
            {children}
          </Box>

          {/* Include Footer only for Dashboard */}
          {isDashboard && <Footer />}

          {/* Back to top button */}
          <Zoom in={scrolled}>
            <Fab
              color="primary"
              size="small"
              aria-label="scroll back to top"
              onClick={scrollToTop}
              sx={{
                position: "fixed",
                bottom: theme.spacing(8),
                right: theme.spacing(2),
              }}
            >
              <ArrowUpwardIcon />
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
  );
};

export default React.memo(MainLayout);
