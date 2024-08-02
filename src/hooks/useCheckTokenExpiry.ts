// src/hooks/useCheckTokenExpiry.ts
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/reducers";
import AuthService from "../services/AuthService/AuthService";

const useCheckTokenExpiry = (retryCount = 3): boolean => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const token = useSelector((state: RootState) => state.userDetails.token);

  useEffect(() => {
    let isMounted = true;
    let retries = 0;

    const checkExpiry = async () => {
      if (token && isMounted) {
        try {
          const response = await AuthService.checkTokenExpiry(token);
          if (isMounted) {
            setIsTokenExpired(response.isExpired);
          }
        } catch (error) {
          if (isMounted && retries < retryCount) {
            retries++;
            checkExpiry();
          } else if (isMounted) {
            setIsTokenExpired(true); // Assume expired if max retries reached
          }
        }
      }
    };

    checkExpiry();

    return () => {
      isMounted = false;
    };
  }, [token, retryCount]);

  return isTokenExpired;
};

export default useCheckTokenExpiry;
