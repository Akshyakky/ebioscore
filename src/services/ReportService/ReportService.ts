// ReportService/ReportService.ts
import { APIConfig } from "@/apiConfig";
import { RoutineReports } from "@/interfaces/RoutineReports/RoutineReports.interface";
import axios from "axios";

// Updated to accept auGrpID as a parameter
export const fetchReports = async (auGrpID: number): Promise<RoutineReports[]> => {
  try {
    const response = await axios.get<RoutineReports[]>(`${APIConfig.commonURL}Report/GetActiveReports/${auGrpID}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
};

export const ReportService = {
  fetchReports,
};
