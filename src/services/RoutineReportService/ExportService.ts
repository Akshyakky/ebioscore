import { CommonApiService } from "../CommonApiService";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";
import { saveAs } from "file-saver";
import axios from "axios";

const apiService = new CommonApiService({
  baseURL: `${APIConfig.routineReportURL}RegistrationReport`,
});

// Function to get the token from the store
const getToken = () => store.getState().userDetails.token!;

interface CriteriaRequest {
  reportId: number;
  fromDate: string;
  toDate: string;
  selectedCompanies: string[];
}

const generatePDF = async (criteria: CriteriaRequest): Promise<void> => {
  try {
    const response = await axios.post(
      `${apiService["baseURL"]}/GeneratePDF`,
      criteria,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    saveAs(blob, `report-${criteria.reportId}.pdf`);
  } catch (error) {
    console.error("Error during PDF generation:", error);
    throw error;
  }
};

const exportToExcel = async (criteria: CriteriaRequest): Promise<void> => {
  try {
    const response = await axios.post(
      `${apiService["baseURL"]}/ExportToExcel`,
      criteria,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `report-${criteria.reportId}.xlsx`);
  } catch (error) {
    console.error("Error during Excel export:", error);
    throw error;
  }
};

const generatePDFForView = async (
  criteria: CriteriaRequest
): Promise<string> => {
  try {
    const response = await axios.post(
      `${apiService["baseURL"]}/GeneratePDF`,
      criteria,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Error during PDF generation for view:", error);
    throw error;
  }
};

export const ExportService = {
  exportToExcel,
  generatePDF,
  generatePDFForView,
};
