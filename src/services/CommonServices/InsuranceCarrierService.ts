import { APIConfig } from "@/apiConfig";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { store } from "@/store";
import { CommonApiService } from "../CommonApiService";

// Initialize ApiServices with different base URLs
const commonApiService = new CommonApiService({ baseURL: APIConfig.commonURL });
const patientAdminApiService = new CommonApiService({
  baseURL: APIConfig.patientAdministrationURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

interface APIResponse {
  insurID: string;
  insurName: string;
}

const fetchInsuranceOptions = async (endpoint: string): Promise<DropdownOption[]> => {
  try {
    const response = await commonApiService.get<APIResponse[]>(`InsuranceCarrier/${endpoint}`, getToken());
    return response.map((item) => ({
      value: item.insurID,
      label: item.insurName,
    }));
  } catch (error) {
    console.error("Error fetching insurance options:", error);
    throw error;
  }
};

const getOPIPInsuranceByPChartID = async (pChartID: number): Promise<OperationResult<OPIPInsurancesDto[]>> => {
  return patientAdminApiService.get<OperationResult<OPIPInsurancesDto[]>>(`OPIPInsurances/GetOPIPInsuranceByPChartID/${pChartID}`, getToken());
};

const addOrUpdateOPIPInsurance = async (opipInsuranceDto: OPIPInsurancesDto): Promise<OperationResult<OPIPInsurancesDto>> => {
  return patientAdminApiService.post<OperationResult<OPIPInsurancesDto>>("OPIPInsurances/AddOrUpdateOPIPInsurance", opipInsuranceDto, getToken());
};

const hideOPIPInsurance = async (opipInsID: number): Promise<OperationResult<OPIPInsurancesDto>> => {
  return patientAdminApiService.put<OperationResult<OPIPInsurancesDto>>(`OPIPInsurances/HideOPIPInsurance/${opipInsID}`, {}, getToken());
};

export const InsuranceCarrierService = {
  fetchInsuranceOptions,
  getOPIPInsuranceByPChartID,
  addOrUpdateOPIPInsurance,
  hideOPIPInsurance,
};
