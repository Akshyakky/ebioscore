import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { store } from "@/store";

const apiService = new CommonApiService({ baseURL: APIConfig.dashBoardURL });

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

interface DateRange {
  fromDate: string;
  toDate: string;
}

interface FetchCountResult {
  count: number;
  unauthorized: boolean;
  error: boolean;
}

const fetchCount = async (endpoint: string, dateRange: DateRange): Promise<FetchCountResult> => {
  try {
    const response = await apiService.get<number>(endpoint, getToken(), dateRange);
    return { count: response, unauthorized: false, error: false };
  } catch (error) {
    if (error instanceof Error && error.message.includes("401")) {
      // Unauthorized
      return { count: 0, unauthorized: true, error: false };
    } else {
      // Other errors
      console.error(`Error fetching count for ${endpoint}:`, error);
      return { count: 0, unauthorized: false, error: true };
    }
  }
};

export const DashBoardService = {
  fetchCount,
};
