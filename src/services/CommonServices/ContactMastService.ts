import axios from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/common/DropdownOption";
import { OperationResult } from "../../interfaces/common/OperationResult";

interface PhyAPIResponse {
  consultantID: string;
  consultantName: string;
}

interface RefAPIResponse {
  referralId: string;
  referralName: string;
}

const fetchAttendingPhysician = async (
  token: string,
  endpoint: string,
  compId: number
): Promise<DropdownOption[]> => {
  const url = `${APIConfig.commonURL}HospitalAdministration/${endpoint}?compId=${compId}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<OperationResult<PhyAPIResponse[]>>(url, {
    headers,
  });

  if (response.data.success) {
    const data = response.data.data ?? [];
    return data.map((item) => ({
      value: item.consultantID,
      label: item.consultantName,
    }));
  } else {
    throw new Error(response.data.errorMessage || "Unknown error occurred");
  }
};

const fetchRefferalPhy = async (
  token: string,
  endpoint: string,
  compId: number
): Promise<DropdownOption[]> => {
  const url = `${APIConfig.commonURL}HospitalAdministration/${endpoint}?compId=${compId}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<OperationResult<RefAPIResponse[]>>(url, {
    headers,
  });

  if (response.data.success) {
    const data = response.data.data ?? [];
    return data.map((item) => ({
      value: item.referralId,
      label: item.referralName,
    }));
  } else {
    throw new Error(response.data.errorMessage || "Unknown error occurred");
  }
};

const fetchAvailableAttendingPhysicians = async (
  token: string,
  pChartID: number
): Promise<DropdownOption[]> => {
  const url = `${APIConfig.commonURL}HospitalAdministration/GetAvailableConsultantsForPatientToday?pChartID=${pChartID}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<OperationResult<PhyAPIResponse[]>>(url, {
    headers,
  });

  if (response.data.success) {
    const data = response.data.data ?? [];
    return data.map((item) => ({
      value: item.consultantID,
      label: item.consultantName,
    }));
  } else {
    throw new Error(response.data.errorMessage || "Unknown error occurred");
  }
};

export const ContactMastService = {
  fetchAttendingPhysician,
  fetchRefferalPhy,
  fetchAvailableAttendingPhysicians,
};
