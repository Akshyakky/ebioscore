// src/hooks/patient/PatientAdministration/usePatientDemographics.ts
import { useState, useEffect, useCallback } from "react";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { PatientDemographicsData } from "../../../interfaces/PatientAdministration/Patient/PatientDemographics.interface";

interface UsePatientDemographicsProps {
  pChartID?: number | null;
  autoFetch?: boolean;
}

interface UsePatientDemographicsResult {
  demographics: PatientDemographicsData | null;
  isLoading: boolean;
  error: string | null;
  fetchDemographics: (id?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing patient demographics data
 * @param pChartID - Patient chart ID
 * @param autoFetch - Whether to automatically fetch data when pChartID changes
 */
export const usePatientDemographics = ({ pChartID = null, autoFetch = true }: UsePatientDemographicsProps = {}): UsePatientDemographicsResult => {
  const [demographics, setDemographics] = useState<PatientDemographicsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(pChartID);

  const fetchDemographics = useCallback(
    async (id?: number) => {
      const chartId = id || currentPatientId;

      if (!chartId) {
        setDemographics(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await RegistrationService.PatientDemoGraph(chartId);

        if (result.success && result.data) {
          setDemographics(result.data);
        } else {
          setError(result.errorMessage || "Failed to fetch patient demographics");
          setDemographics(null);
        }
      } catch (error) {
        console.error("Error fetching patient demographics:", error);
        setError("An error occurred while fetching patient demographics");
        setDemographics(null);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPatientId]
  );

  // Fetch demographics when patient ID changes
  useEffect(() => {
    if (pChartID !== currentPatientId) {
      setCurrentPatientId(pChartID);
    }

    if (autoFetch && pChartID) {
      fetchDemographics(pChartID);
    }
  }, [pChartID, autoFetch, currentPatientId, fetchDemographics]);

  const refresh = useCallback(async () => {
    await fetchDemographics();
  }, [fetchDemographics]);

  return {
    demographics,
    isLoading,
    error,
    fetchDemographics,
    refresh,
  };
};
