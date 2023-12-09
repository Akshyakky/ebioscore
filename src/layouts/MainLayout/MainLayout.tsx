import React from "react";
import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import Navigation from "../../components/Navigation/Navigation";
import { RootState } from "../../store/store";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  debugger;
  const userInfo = useSelector((state: RootState) => state.userDetails);

  return (
    <>
      <div>
        {userInfo && (
          <Navigation userID={userInfo.userID} token={userInfo.token} />
        )}
        <main>{children}</main>
        <div className="footer">
          <Container>
            <p>Your Footer Content</p>
          </Container>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
