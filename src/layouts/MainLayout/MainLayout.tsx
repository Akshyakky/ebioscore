import React from "react";
import { Box, useTheme, Fab, Tooltip } from "@mui/material";
import { selectUser } from "@/store/features/auth/selectors";
import { useAppSelector } from "@/store/hooks";
import SideBar from "../SideBar/SideBar";
import Footer from "../Footer";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const userInfo = useAppSelector(selectUser);
  const navigate = useNavigate();

  // Calculate effective user ID for admin permissions
  const effectiveUserID = React.useMemo(() => {
    if (!userInfo) return -1;
    return userInfo.adminYN === "Y" ? 0 : userInfo.userID;
  }, [userInfo]);

  if (!userInfo || !userInfo.token) {
    return null; // or return a loading state / error component
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        {userInfo && <SideBar userID={effectiveUserID} token={userInfo.token} />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            p: 3,
            pt: 10,
            pb: 3,
            backgroundColor: theme.palette.background.default,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
              p: 3,
              minHeight: "calc(100vh - 180px)", // Account for header and footer
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
