import axios from 'axios';
import { APIConfig } from '../../apiConfig';
import { BreakConDetailData } from '../../interfaces/frontOffice/BreakConDetailsData';



// Define the operation result interface
export interface OperationResult<T> {
  success: boolean;
  data: T;
  errorMessage?: string;
}

// Handle errors
const handleError = <T>(error: any): OperationResult<T> => {
  return {
    success: false,
    data: {} as T,
    errorMessage: error.message || 'An error occurred',
  };
};

// Service to save break condition details
const saveBreakConDetail = async (
  token: string,
  breakConDetailData: BreakConDetailData
): Promise<OperationResult<BreakConDetailData>> => {
  try {
   const url = `${APIConfig.frontOffice}BreakConDetail/SaveBreakConDetail`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post<OperationResult<BreakConDetailData>>(
      url,
      breakConDetailData,
      { headers }
    );

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || 'Failed to save break condition detail.');
      }
      return response.data;
    } else {
      throw new Error('Invalid response format received.');
    }
  } catch (error: any) {
    return handleError<BreakConDetailData>(error);
  }
};

const getAllBreakConDetails = async (token: string): Promise<OperationResult<BreakConDetailData[]>> => {
  try {
    const url = `${APIConfig.frontOffice}BreakConDetail/GetAllBreakConDetails`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.get<OperationResult<BreakConDetailData[]>>(url, { headers });

    if (response.data && response.data.success !== undefined) {
      if (!response.data.success) {
        throw new Error(response.data.errorMessage || 'Failed to fetch break condition details.');
      }
      return response.data;
    } else {
      throw new Error('Invalid response format received.');
    }
  } catch (error: any) {
    return handleError<BreakConDetailData[]>(error);
  }
};

export const BreakListConDetailsService = {
  saveBreakConDetail,
  getAllBreakConDetails
};
