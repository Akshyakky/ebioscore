import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/reducers";
import AuthService from "../services/AuthService/AuthService";
import { debounce } from "../utils/Common/debounceUtils";

const useCheckTokenExpiry = (
  retryCount = 3,
  retryDelay = 1000,
  debounceDelay = 300
): boolean => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const token = useSelector((state: RootState) => state.userDetails.token);

  const checkExpiry = useCallback(async () => {
    let retries = 0;
    const attempt = async () => {
      if (token) {
        try {
          const response = await AuthService.checkTokenExpiry(token);
          if (response.data) {
            setIsTokenExpired(response.data.isExpired);
          }
        } catch (error) {
          if (retries < retryCount) {
            retries++;
            setTimeout(attempt, retryDelay);
          } else {
            setIsTokenExpired(true); // Assume expired if max retries reached
          }
        }
      }
    };
    attempt();
  }, [token, retryCount, retryDelay]);

  const debouncedCheckExpiry = useCallback(
    debounce(checkExpiry, debounceDelay),
    [checkExpiry, debounceDelay]
  );

  useEffect(() => {
    debouncedCheckExpiry();
    return () => {
      debouncedCheckExpiry.cancel();
    };
  }, [debouncedCheckExpiry]);

  return isTokenExpired;
};

export default useCheckTokenExpiry;
