// src/hooks/PatientAdminstration/patient/usePatientDemographics.ts
import { useState, useEffect, useCallback } from "react";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { PatientDemographicDetails } from "@/interfaces/PatientAdministration/registrationFormData";

interface UsePatientDemographicsProps {
  pChartID?: number | null;
  autoFetch?: boolean;
}

interface UsePatientDemographicsResult {
  demographics: PatientDemographicDetails | null;
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
  const [demographics, setDemographics] = useState<PatientDemographicDetails | null>(null);
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

  // Effect to handle changes to pChartID including when it becomes null
  useEffect(() => {
    // When pChartID changes, update currentPatientId
    setCurrentPatientId(pChartID);

    // Explicitly clear demographics when pChartID is null or undefined
    if (pChartID === null || pChartID === undefined) {
      setDemographics(null);
      setError(null);
      return;
    }

    // Fetch demographics when pChartID is valid and autoFetch is true
    if (autoFetch && pChartID) {
      fetchDemographics(pChartID);
    }
  }, [pChartID, autoFetch, fetchDemographics]);

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
