import axios, { AxiosResponse } from "axios";
import { APIConfig } from "../../apiConfig";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { handleError } from "./HandlerError";
import { OPIPInsurancesDto } from "../../interfaces/PatientAdministration/InsuranceDetails";

interface APIResponse {
  insurID: string;
  insurName: string;
}

const fetchInsuranceOptions = async (
  token: string,
  endpoint: string
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.commonURL}InsuranceCarrier/${endpoint}`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get<APIResponse[]>(url, { headers });
    return response.data.map((item) => ({
      value: item.insurID,
      label: item.insurName,
    }));
  } catch (error) {
    console.error("Error fetching insurance options:", error);
    throw error;
  }
};

export const getOPIPInsuranceByPChartID = async (
  token: string,
  pChartID: number
): Promise<OperationResult<OPIPInsurancesDto[]>> => {
  try {
    const response: AxiosResponse<OperationResult<OPIPInsurancesDto[]>> = await axios.get(
      `${APIConfig.patientAdministrationURL}OPIPInsurances/GetOPIPInsuranceByPChartID/${pChartID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addOrUpdateOPIPInsurance = async (
  token: string,
  opipInsuranceDto: OPIPInsurancesDto
): Promise<OperationResult<OPIPInsurancesDto>> => {
  try {
    const response: AxiosResponse<OperationResult<OPIPInsurancesDto>> = await axios.post(
      `${APIConfig.patientAdministrationURL}OPIPInsurances/AddOrUpdateOPIPInsurance`,
      opipInsuranceDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const hideOPIPInsurance = async (
  token: string,
  opipInsID: number
): Promise<OperationResult<OPIPInsurancesDto>> => {
  try {
    const response: AxiosResponse<OperationResult<OPIPInsurancesDto>> = await axios.put(
      `${APIConfig.patientAdministrationURL}OPIPInsurances/HideOPIPInsurance/${opipInsID}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const InsuranceCarrierService = {
  fetchInsuranceOptions,
  getOPIPInsuranceByPChartID,
  addOrUpdateOPIPInsurance,
  hideOPIPInsurance,
};
