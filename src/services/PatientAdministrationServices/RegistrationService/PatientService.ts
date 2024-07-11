import axios, { AxiosResponse } from "axios";
import { PatientRegistrationDto } from "../../../interfaces/PatientAdministration/PatientFormData";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { APIConfig } from "../../../apiConfig";
import { handleError } from "../../CommonServices/HandlerError";

export const savePatient = async (
  token: string,
  patientRegistrationDto: PatientRegistrationDto
): Promise<OperationResult<number>> => {
  try {
    const response: AxiosResponse<OperationResult<number>> = await axios.post(
      `${APIConfig.patientAdministrationURL}Patient/Registration`,
      patientRegistrationDto,
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

export const getPatientDetails = async (
  token: string,
  pChartID: number
): Promise<OperationResult<PatientRegistrationDto>> => {
  try {
    const response: AxiosResponse<OperationResult<PatientRegistrationDto>> =
      await axios.get(
        `${APIConfig.patientAdministrationURL}Patient/GetPatientDetails/${pChartID}`,
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



export const PatientService = { savePatient, getPatientDetails };
