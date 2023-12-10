import React from "react";
import { useSelector } from "react-redux";
import SideBar from "../Navigation/SideBar";
import { RootState } from "../../store/store";
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
    <>
      <div className="app-container">
        {" "}
        {/* Apply the class here */}
        {userInfo && (
          <SideBar userID={effectiveUserID} token={userInfo.token} />
        )}
        <main>{children}</main> {/* This is where the main content goes */}
        <Footer /> {/* This is your Footer component */}
      </div>
    </>
  );
};

export default MainLayout;
