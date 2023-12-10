import axios from "axios";
import { APIConfig } from "../apiConfig";

const dashBoardURL = `${APIConfig.dashBoardURL}`;

const fetchCount = async (
  endpoint: string,
  dateRange: { fromDate: string; toDate: string },
  token: string
) => {
  try {    
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(`${dashBoardURL}${endpoint}`, {
      headers,
      params: dateRange,
    });
    return { count: response.data, unauthorized: false, error: false };
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.status === 401
    ) {
      // Unauthorized
      return { count: 0, unauthorized: true, error: false };
    } else {
      // Other errors
      return { count: 0, unauthorized: false, error: true };
    }
  }
};

export const DashBoardService = {
  fetchCount,
};
