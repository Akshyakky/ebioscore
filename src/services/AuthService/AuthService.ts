// src/services/AuthService.ts
import axios, { AxiosError } from "axios";
import { APIConfig } from "../../apiConfig";

const API_URL = `${APIConfig.authURL}`; // Base URL for your API

interface TokenResponse {
  token: string;
  user: {
    ErrorMessage?: string;
    userID: number;
    userName: string;
    conID: number;
    adminYN: string;
    physicianYN: string;
    errorMessage?: string;
    compID: number | null;
    token: string;
  };
}

interface LoginCredentials {
  UserName: string;
  Password: string;
}

interface TokenExpiryCheckResponse {
  isExpired: boolean;
}

export const AuthService = {
  generateToken: async (
    credentials: LoginCredentials
  ): Promise<TokenResponse> => {
    try {
      const response = await axios.post(`${API_URL}Generate`, credentials);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError; // Type assertion here

      if (axios.isAxiosError(axiosError)) {
        if (axiosError.response) {
          console.error(
            "There was a problem with the request:",
            axiosError.response.data
          );
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
        } else {
          console.error("Error setting up the request:", axiosError.message);
        }
      } else {
        console.error("An unexpected error occurred:", axiosError);
      }
      throw axiosError;
    }
  },
  logout: async (token: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}Logout`, { token });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError; // Type assertion

      // Error handling similar to generateToken method
      if (axios.isAxiosError(axiosError)) {
        if (axiosError.response) {
          console.error(
            "There was a problem with the request:",
            axiosError.response.data
          );
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
        } else {
          console.error("Error setting up the request:", axiosError.message);
        }
      } else {
        console.error("An unexpected error occurred:", axiosError);
      }
      throw axiosError;
    }
  },
  checkTokenExpiry: async (
    token: string
  ): Promise<TokenExpiryCheckResponse> => {
    try {
      const response = await axios.post(`${API_URL}CheckTokenExpiry`, {
        Token: token,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError; // Type assertion

      // Error handling similar to other methods
      if (axios.isAxiosError(axiosError)) {
        if (axiosError.response && axiosError.response.status === 401) {
          return { isExpired: true }; // Token is expired
        }
        if (axiosError.response) {
          console.error(
            "There was a problem with the request:",
            axiosError.response.data
          );
        } else if (axiosError.request) {
          console.error("No response received:", axiosError.request);
        } else {
          console.error("Error setting up the request:", axiosError.message);
        }
      } else {
        console.error("An unexpected error occurred:", axiosError);
      }
      throw axiosError;
    }
  },
  // ... other authentication related methods
};

export default AuthService;
