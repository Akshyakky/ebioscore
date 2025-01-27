import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { post, postWithoutToken } from "../apiService";

const API_URL = `${APIConfig.authURL}`;

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

interface LogoutRequestModel {
  Token: string;
}

interface TokenValidationModel {
  Token: string;
}

interface TokenRevocationModel {
  Token: string;
}

export const AuthService = {
  generateToken: async (credentials: LoginCredentials): Promise<OperationResult<TokenResponse>> => {
    const url = `${API_URL}Generate`;
    return await postWithoutToken<TokenResponse, LoginCredentials>(url, credentials, API_URL);
  },

  logout: async (token: string): Promise<OperationResult<any>> => {
    const url = `${API_URL}Logout`;
    const data: LogoutRequestModel = { Token: token };
    return await post<any, LogoutRequestModel>(url, data, API_URL);
  },

  checkTokenExpiry: async (token: string): Promise<OperationResult<TokenExpiryCheckResponse>> => {
    const url = `${API_URL}CheckTokenExpiry`;
    const data: TokenValidationModel = { Token: token };
    return await post<TokenExpiryCheckResponse, TokenValidationModel>(url, data, API_URL);
  },

  validateToken: async (token: string): Promise<OperationResult<{ isValid: boolean; userDetails?: any }>> => {
    const url = `${API_URL}Validate`;
    const data: TokenValidationModel = { Token: token };
    return await post<{ isValid: boolean; userDetails?: any }, TokenValidationModel>(url, data, API_URL);
  },

  revokeToken: async (token: string): Promise<OperationResult<any>> => {
    const url = `${API_URL}Revoke`;
    const data: TokenRevocationModel = { Token: token };
    return await post<any, TokenRevocationModel>(url, data, API_URL);
  },
};

export default AuthService;
