import React from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import SideBar from "../SideBar/SideBar";
import Footer from "../Footer";
import { RootState } from "../../store/reducers";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const effectiveUserID = userInfo
    ? userInfo.adminYN === "Y"
      ? 0
      : userInfo.userID
    : -1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {userInfo && (
          <SideBar userID={effectiveUserID} token={userInfo.token} />
        )}
        <Box component="main" sx={{ flexGrow: 1, width: '100%', p: 2, pt: 10, pb: 3 }}>
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;