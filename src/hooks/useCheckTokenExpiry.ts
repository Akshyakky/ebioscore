// src/hooks/useCheckTokenExpiry.ts
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/reducers";
import AuthService from "../services/AuthService/AuthService";

const useCheckTokenExpiry = (): boolean => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const token = useSelector((state: RootState) => state.userDetails.token);

  useEffect(() => {
    let isMounted = true;

    const checkExpiry = async () => {
      if (token) {
        const response = await AuthService.checkTokenExpiry(token);
        if (isMounted) {
          setIsTokenExpired(response.isExpired);
        }
      }
    };

    checkExpiry();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return isTokenExpired;
};

export default useCheckTokenExpiry;
