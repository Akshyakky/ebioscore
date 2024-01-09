// useCheckTokenExpiry.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/reducers";
import { LOGOUT } from "../store/userTypes"; // Import the LOGOUT action type

const useCheckTokenExpiry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tokenExpiry = useSelector(
    (state: RootState) => state.userDetails.tokenExpiry
  );

  useEffect(() => {
    let inactivityTimer: number;
    let lastActivityTime = Date.now();

    const resetInactivityTimer = () => {
      lastActivityTime = Date.now();
    };

    const checkInactivity = () => {
      const currentTime = Date.now();
      if (tokenExpiry && currentTime - lastActivityTime >= tokenExpiry) {
        dispatch({ type: LOGOUT });
        navigate("/login");
      }
    };

    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("mousedown", resetInactivityTimer);
    window.addEventListener("keypress", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);

    inactivityTimer = window.setInterval(checkInactivity, 60000); // Check every minute

    return () => {
      clearInterval(inactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("mousedown", resetInactivityTimer);
      window.removeEventListener("keypress", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);
    };
  }, [dispatch, navigate, tokenExpiry]);

  return null;
};

export default useCheckTokenExpiry;
