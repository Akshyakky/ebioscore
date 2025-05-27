import { useState, useEffect, useCallback } from "react";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";

export const usePatientRegistration = () => {
  const [patientList, setPatientList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const { showAlert } = useAlert();

  const fetchPatientList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await RegistrationService.searchPatientDetails("test");

      setPatientList(result.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const getPatientById = useCallback(
    async (pChartID: number) => {
      try {
        setLoading(true);
        const result = await PatientService.getPatientDetails(pChartID);
        if (result.success && result.data) {
          return result.data;
        } else {
          throw new Error(result.errorMessage || "Failed to fetch patient details");
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
        showAlert("Error", "Failed to fetch patient details", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert]
  );

  const savePatient = useCallback(
    async (patientData: any) => {
      try {
        setLoading(true);
        const result = await PatientService.savePatient(patientData);

        if (result.success) {
          showAlert("Success", "Patient saved successfully", "success");
          return true;
        } else {
          throw new Error(result.errorMessage || "Failed to save patient");
        }
      } catch (error) {
        console.error("Error saving patient:", error);
        showAlert("Error", "Failed to save patient", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert]
  );

  const deletePatient = useCallback(
    async (pChartID: number) => {
      try {
        setLoading(true);
        // Implement delete API call
        // const result = await PatientService.deletePatient(pChartID);

        showAlert("Success", "Patient deleted successfully", "success");
        return true;
      } catch (error) {
        console.error("Error deleting patient:", error);
        showAlert("Error", "Failed to delete patient", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showAlert]
  );

  useEffect(() => {
    fetchPatientList();
  }, [fetchPatientList]);

  return {
    patientList,
    isLoading,
    error,
    fetchPatientList,
    getPatientById,
    savePatient,
    deletePatient,
  };
};
