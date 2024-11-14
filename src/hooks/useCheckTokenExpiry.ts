import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "../store/hooks";
import AuthService from "../services/AuthService/AuthService";
import { debounce } from "../utils/Common/debounceUtils";
import { selectUser } from "@/store/features/auth/selectors";

interface TokenExpiryConfig {
  retryCount?: number;
  retryDelay?: number;
  debounceDelay?: number;
}

const useCheckTokenExpiry = ({ retryCount = 3, retryDelay = 1000, debounceDelay = 300 }: TokenExpiryConfig = {}): boolean => {
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const { token, tokenExpiry } = useAppSelector(selectUser);

  // First check local token expiry
  const checkLocalExpiry = useCallback(() => {
    if (!tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  }, [tokenExpiry]);

  // Server-side token validation
  const validateTokenWithServer = useCallback(async () => {
    let retries = 0;

    const attempt = async () => {
      if (!token) {
        setIsTokenExpired(true);
        return;
      }

      try {
        const response = await AuthService.checkTokenExpiry(token);
        setIsTokenExpired(response.data?.isExpired ?? checkLocalExpiry());
      } catch (error) {
        console.error("Token validation error:", error);

        if (retries < retryCount) {
          retries++;
          return new Promise((resolve) => setTimeout(() => resolve(attempt()), retryDelay));
        } else {
          setIsTokenExpired(true); // Assume expired if max retries reached
        }
      }
    };

    return attempt();
  }, [token, retryCount, retryDelay, checkLocalExpiry]);

  // Debounced server check
  const debouncedValidateToken = useCallback(debounce(validateTokenWithServer, debounceDelay), [validateTokenWithServer, debounceDelay]);

  useEffect(() => {
    // First check local expiry
    const locallyExpired = checkLocalExpiry();

    if (locallyExpired) {
      setIsTokenExpired(true);
    } else {
      // If not locally expired, validate with server
      debouncedValidateToken();
    }

    return () => {
      debouncedValidateToken.cancel();
    };
  }, [debouncedValidateToken, checkLocalExpiry]);

  return isTokenExpired;
};

export default useCheckTokenExpiry;
