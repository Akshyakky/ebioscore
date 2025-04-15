import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { CommonApiService } from "../CommonApiService";

const API_URL = `${APIConfig.authURL}`;
const apiService = new CommonApiService({ baseURL: API_URL });

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
    compCode: string;
    compName: string;
    token: string;
  };
  success: boolean;
}

interface LoginCredentials {
  UserName: string;
  Password: string;
  CompanyID: number;
  CompanyCode: string;
  CompanyName: string;
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

interface TokenValidationResponse {
  isValid: boolean;
  userDetails?: any;
}

export const AuthService = {
  generateToken: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const url = `Generate`;
    const result = await apiService.post<OperationResult<TokenResponse>>(url, credentials);
    return result as unknown as TokenResponse;
  },

  logout: async (token: string): Promise<OperationResult<any>> => {
    const url = `Logout`;
    const data: LogoutRequestModel = { Token: token };
    return await apiService.post<OperationResult<any>>(url, data, token);
  },

  checkTokenExpiry: async (token: string): Promise<OperationResult<TokenExpiryCheckResponse>> => {
    const url = `CheckTokenExpiry`;
    const data: TokenValidationModel = { Token: token };
    return await apiService.post<OperationResult<TokenExpiryCheckResponse>>(url, data, token);
  },

  validateToken: async (token: string): Promise<OperationResult<TokenValidationResponse>> => {
    const url = `Validate`;
    const data: TokenValidationModel = { Token: token };
    return await apiService.post<OperationResult<TokenValidationResponse>>(url, data, token);
  },

  revokeToken: async (token: string): Promise<OperationResult<any>> => {
    const url = `Revoke`;
    const data: TokenRevocationModel = { Token: token };
    return await apiService.post<OperationResult<any>>(url, data, token);
  },
};

export default AuthService;
