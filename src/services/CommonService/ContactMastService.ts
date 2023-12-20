// services/ContactMastService.ts
import axios from "axios";
import { APIConfig } from "../../apiConfig";

interface DropdownDto {
  label: string;
  value: string;
}

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
): Promise<DropdownDto[]> => {
  const url = `${APIConfig.commonURL}HospitalAdministration/${endpoint}?compId=${compId}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<PhyAPIResponse[]>(url, { headers });
  return response.data.map((item) => ({
    value: item.consultantID,
    label: item.consultantName,
  }));
};
const fetchRefferalPhy = async (
  token: string,
  endpoint: string,
  compId: number
): Promise<DropdownDto[]> => {
  const url = `${APIConfig.commonURL}HospitalAdministration/${endpoint}?compId=${compId}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get<RefAPIResponse[]>(url, { headers });
  return response.data.map((item) => ({
    value: item.referralId,
    label: item.referralName,
  }));
};

export const ContactMastService = {
  fetchAttendingPhysician,
  fetchRefferalPhy,
};
