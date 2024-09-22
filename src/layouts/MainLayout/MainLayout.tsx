import React from "react";
import { useSelector } from "react-redux";
import { Box, useTheme } from "@mui/material";
import SideBar from "../SideBar/SideBar";
import Footer from "../Footer";
import { RootState } from "../../store/reducers";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const effectiveUserID = userInfo
    ? userInfo.adminYN === "Y"
      ? 0
      : userInfo.userID
    : -1;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {userInfo && (
          <SideBar userID={effectiveUserID} token={userInfo.token} />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            p: 3,
            pt: 10,
            pb: 3,
            backgroundColor: theme.palette.background.default,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Box sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            p: 3,
          }}>
            {children}
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;