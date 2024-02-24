//RoutineReportService/ExportService.ts
import axios from "axios";
import { saveAs } from "file-saver"; // Make sure to import saveAs
import { APIConfig } from "../../apiConfig";

interface CriteriaRequest {
  reportId: number;
  fromDate: string;
  toDate: string;
  selectedCompanies: string[];
  token: string;
}
const API_BASE_URL = `${APIConfig.routineReportURL}RegistrationReport`;
export const generatePDF = async (criteria: CriteriaRequest): Promise<void> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/GeneratePDF`,
      {
        reportId: criteria.reportId,
        fromDate: criteria.fromDate,
        toDate: criteria.toDate,
        selectedCompanies: criteria.selectedCompanies,
      },
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${criteria.token}`,
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

export const exportToExcel = async (
  criteria: CriteriaRequest
): Promise<void> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ExportToExcel`,
      {
        reportId: criteria.reportId,
        fromDate: criteria.fromDate,
        toDate: criteria.toDate,
        selectedCompanies: criteria.selectedCompanies,
      },
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${criteria.token}`,
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

export const generatePDFForView = async (criteria: CriteriaRequest): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/GeneratePDF`,
      {
        reportId: criteria.reportId,
        fromDate: criteria.fromDate,
        toDate: criteria.toDate,
        selectedCompanies: criteria.selectedCompanies,
      },
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${criteria.token}`,
        },
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return url; // Return the URL instead of saving the file
  } catch (error) {
    console.error("Error during PDF generation:", error);
    throw error;
  }
};

export const ExportService = {
  exportToExcel,
  generatePDF,
  generatePDFForView
};
