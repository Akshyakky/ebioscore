// useCheckTokenExpiry.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/reducers";
import { LOGOUT } from "../store/userTypes"; // Import the LOGOUT action type

const useCheckTokenExpiry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.userDetails.token);
  const tokenExpiry = useSelector(
    (state: RootState) => state.userDetails.tokenExpiry
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (tokenExpiry && currentTime >= tokenExpiry) {
        // Dispatch the logout action directly
        dispatch({ type: LOGOUT });
        // Navigate to the login page
        navigate("/login");
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token, tokenExpiry, dispatch, navigate]);

  return null;
};

export default useCheckTokenExpiry;
