import axios, { AxiosResponse } from "axios";
import { PatNokDetailsDto } from "../../../interfaces/PatientAdministration/PatNokDetailsDto";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { APIConfig } from "../../../apiConfig";
import { handleError } from "../../CommonServices/HandlerError";

export const getNokDetailsByPChartID = async (
  token: string,
  pChartID: number
): Promise<OperationResult<PatNokDetailsDto[]>> => {
  try {
    const response: AxiosResponse<OperationResult<PatNokDetailsDto[]>> = await axios.get(
      `${APIConfig.patientAdministrationURL}PatNok/GetNokDetailsByPChartID/${pChartID}`,
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

export const saveNokDetails = async (
  token: string,
  patNokDetailsDto: PatNokDetailsDto
): Promise<OperationResult<PatNokDetailsDto>> => {
  try {
    const response: AxiosResponse<OperationResult<PatNokDetailsDto>> = await axios.post(
      `${APIConfig.patientAdministrationURL}PatNok/SaveNokDetails`,
      patNokDetailsDto,
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

export const PatNokService = { getNokDetailsByPChartID, saveNokDetails };
