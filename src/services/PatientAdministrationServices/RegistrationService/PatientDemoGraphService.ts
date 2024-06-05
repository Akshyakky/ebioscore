// PatientDemoGraphService.ts
import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/common/OperationResult";
import { PatientDemoGraph } from "../../../interfaces/patientAdministration/patientDemoGraph";

export const getPatientDemographicsByPChartID = async (
  token: string,
  pChartID: number
): Promise<OperationResult<PatientDemoGraph>> => {
  const url = `${APIConfig.patientAdministrationURL}PatientDemoGraph/GetPatientDemographics/${pChartID}`;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await axios.get(url, {
      headers,
    });
    return {
      success: true,
      data: response.data as PatientDemoGraph,
    };
  } catch (error) {
    console.error(`Error fetching patient demographics: ${error}`);
    throw error;
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
    const response = await axios.post(url, patientDetails, {
      headers,
    });
    return {
      success: true,
      data: response.data as boolean,
    };
  } catch (error) {
    console.error(`Error saving patient demographics: ${error}`);
    throw error;
  }
};

export const PatientDemoGraphService = {
  getPatientDemographicsByPChartID,
  savePatientDemographics,
  // ... other exported functions
};
