import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const PageTitle: React.FC = () => {
  let location = useLocation();

  useEffect(() => {
    let title = "Default Title"; // Your default title
    if (location.pathname === "/login") {
      title = "Login - eBios";
    } else if (location.pathname === "/dashboard") {
      title = "Dashboard - eBios";
    }
    document.title = title;
  }, [location]);

  return null; // This component doesn't render anything
};
