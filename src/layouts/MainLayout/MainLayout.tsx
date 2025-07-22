import { selectUser } from "@/store/features/auth/selectors";
import { useAppSelector } from "@/store/hooks";
import { ArrowUpwardSharp } from "@mui/icons-material";
import { Alert, Box, Button, Fab, Paper, Snackbar, Typography, Zoom } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbsNavigation from "../BreadcrumbsNavigations";
import Footer from "../Footer";
import SideBar from "../SideBar/SideBar";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Memoized layout components to prevent unnecessary re-renders
const MemoizedSideBar = React.memo(SideBar);
const MemoizedFooter = React.memo(Footer);
const MemoizedBreadcrumbs = React.memo(BreadcrumbsNavigation);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const userInfo = useAppSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate effective user ID for admin permissions - memoized to prevent recalculation
  const effectiveUserID = useMemo(() => {
    if (!userInfo) return -1;
    return userInfo.adminYN === "Y" ? 0 : userInfo.userID;
  }, [userInfo?.adminYN, userInfo?.userID]);

  // Memoized user token to prevent SideBar re-renders
  const userToken = useMemo(() => userInfo?.token || null, [userInfo?.token]);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Close error notification
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  // Handle expired session
  const handleReturnToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // Check if we're in the dashboard - memoized to prevent unnecessary recalculations
  const isDashboard = useMemo(() => location.pathname === "/dashboard", [location.pathname]);

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
    <Box display="flex" flexDirection="column" bgcolor="background.default" color="text.primary">
      <Box display="flex" flex={1}>
        {/* Memoized SideBar - will only re-render if userID or token changes */}
        <MemoizedSideBar userID={effectiveUserID} token={userToken} />

        <Box component="main" flexGrow={1} width="100%" p={{ xs: 2, sm: 3 }} pt={{ xs: 9, sm: 10 }} pb={3} display="flex" flexDirection="column">
          {/* Memoized Breadcrumbs navigation */}
          {!isDashboard && <MemoizedBreadcrumbs />}

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

          {/* Include Footer only for Dashboard - memoized */}
          {isDashboard && <MemoizedFooter />}

          {/* Back to top button */}
          <Zoom in={scrolled}>
            <Fab
              color="primary"
              size="small"
              aria-label="scroll back to top"
              onClick={scrollToTop}
              sx={{
                position: "fixed",
                bottom: (theme) => theme.spacing(8),
                right: (theme) => theme.spacing(2),
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
  );
};

// Export memoized component to prevent parent re-renders from affecting layout
export default React.memo(MainLayout);
