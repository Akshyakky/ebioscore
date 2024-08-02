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
    compID: number;
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
      handleAxiosError(error);
      throw error;
    }
  },
  logout: async (token: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}Logout`, { token });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
      throw error;
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

      if (axios.isAxiosError(axiosError)) {
        if (axiosError.response && axiosError.response.status === 401) {
          return { isExpired: true }; // Token is expired
        }
        handleAxiosError(axiosError);
      } else {
        console.error("An unexpected error occurred:", axiosError);
      }
      throw axiosError;
    }
  },
  // ... other authentication related methods
};

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error(
        "There was a problem with the request:",
        error.response.data
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }
  } else {
    console.error("An unexpected error occurred:", error);
  }
};

export default AuthService;
