import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { PatientDemoGraph } from "../../../interfaces/PatientAdministration/patientDemoGraph";
import { handleError } from "../../CommonServices/HandlerError";

export const getPatientDemographicsByPChartID = async (
  token: string,
  pChartID: number
): Promise<OperationResult<PatientDemoGraph>> => {
  const url = `${APIConfig.patientAdministrationURL}PatientDemoGraph/GetPatientDemographics/${pChartID}`;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.get(url, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const savePatientDemographics = async (
  token: string,
  patientDetails: PatientDemoGraph
): Promise<OperationResult<boolean>> => {
  const url = `${APIConfig.patientAdministrationURL}PatientDemoGraph/SavePatientDemographics`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(url, patientDetails, { headers });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

export const PatientDemoGraphService = {
  getPatientDemographicsByPChartID,
  savePatientDemographics,
};
