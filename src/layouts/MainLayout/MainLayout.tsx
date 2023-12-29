import React from "react";
import { useSelector } from "react-redux";
import SideBar from "../SideBar/SideBar";
import { RootState } from "../../store/reducers";
import Footer from "../Footer";

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
    <div className="app-container">
      {userInfo && (
        <div className="sidebar">
          <SideBar userID={effectiveUserID} token={userInfo.token} />
        </div>
      )}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
