import { useState, useEffect, useCallback } from "react";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";

// Define the interface for patient list display data
export interface PatientListData {
  pChartID: number;
  pChartCode: string;
  fullName: string;
  pGender: string;
  pAddPhone1: string;
  pAddEmail: string;
  visitType: string;
  rActiveYN: string;
  pRegDate: Date;
  pTitleVal: string;
  pTitle: string;
  pFName: string;
  pMName: string;
  pLName: string;
  pDob: Date;
  patMemName: string;
  pTypeName: string;
  deptName: string;
  attendingPhysicianName: string;
}

export const usePatientRegistration = () => {
  const [patientList, setPatientList] = useState<PatientListData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const { showAlert } = useAlert();

  // Transform PatientRegistrationDto to PatientListData for display
  const transformPatientData = (dto: PatientRegistrationDto): PatientListData => {
    const fullName = `${dto.patRegisters.pFName || ""} ${dto.patRegisters.pMName || ""} ${dto.patRegisters.pLName || ""}`.trim();

    return {
      pChartID: dto.patRegisters.pChartID,
      pChartCode: dto.patRegisters.pChartCode,
      fullName,
      pGender: dto.patRegisters.pGender || "",
      pAddPhone1: dto.patAddress.pAddPhone1 || "",
      pAddEmail: dto.patAddress.pAddEmail || "",
      visitType: dto.opvisits?.visitType || "",
      rActiveYN: dto.patRegisters.rActiveYN || "Y",
      pRegDate: dto.patRegisters.pRegDate,
      pTitleVal: dto.patRegisters.pTitleVal || "",
      pTitle: dto.patRegisters.pTitle || "",
      pFName: dto.patRegisters.pFName || "",
      pMName: dto.patRegisters.pMName || "",
      pLName: dto.patRegisters.pLName || "",
      pDob: dto.patRegisters.pDob,
      patMemName: dto.patRegisters.patMemName || "",
      pTypeName: dto.patRegisters.pTypeName || "",
      deptName: dto.patRegisters.deptName || "",
      attendingPhysicianName: dto.lastVisit?.attendingPhysicianName || "",
    };
  };

  // Fetch patient list with search functionality
  const fetchPatientList = useCallback(async (searchQuery: string = "") => {
    try {
      setLoading(true);
      setError(null);

      // Use search query if provided, otherwise get all patients
      const query = searchQuery.trim() || ""; // Remove hardcoded "test"
      const result = await RegistrationService.searchPatientDetails(query);

      if (result.success && result.data) {
        const transformedData = result.data.map(transformPatientData);
        setPatientList(transformedData);
      } else {
        setError(result.errorMessage || "Failed to fetch patients");
        setPatientList([]);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to fetch patients");
      setPatientList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get patient by ID - returns full PatientRegistrationDto
  const getPatientById = useCallback(
    async (pChartID: number): Promise<PatientRegistrationDto | null> => {
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
    [, showAlert]
  );

  // Save patient (create or update)
  const savePatient = useCallback(
    async (patientData: PatientRegistrationDto): Promise<boolean> => {
      try {
        setLoading(true);

        // Ensure proper data structure
        const formattedData: PatientRegistrationDto = {
          patRegisters: {
            ...patientData.patRegisters,
            rActiveYN: patientData.patRegisters.rActiveYN || "Y",
            transferYN: patientData.patRegisters.transferYN || "N",
            cancelYN: patientData.patRegisters.cancelYN || "N",
            patSchemeExpiryDateYN: patientData.patRegisters.patSchemeExpiryDateYN || "N",
            patSchemeDescriptionYN: patientData.patRegisters.patSchemeDescriptionYN || "N",
            patDataFormYN: patientData.patRegisters.patDataFormYN || "N",
          },
          patAddress: {
            ...patientData.patAddress,
            pChartID: patientData.patRegisters.pChartID,
            pChartCode: patientData.patRegisters.pChartCode,
          },
          patOverview: {
            ...patientData.patOverview,
            pChartID: patientData.patRegisters.pChartID,
            pChartCode: patientData.patRegisters.pChartCode,
          },
          opvisits: {
            ...patientData.opvisits,
          },
          lastVisit: patientData.lastVisit,
        };

        const result = await PatientService.savePatient(formattedData);

        if (result.success) {
          showAlert("Success", "Patient saved successfully", "success");
          // Refresh the patient list
          await fetchPatientList();
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
    [, showAlert, fetchPatientList]
  );

  // Update patient active status (soft delete)
  const updatePatientStatus = useCallback(
    async (pChartID: number, isActive: boolean): Promise<boolean> => {
      try {
        setLoading(true);

        // Get current patient data
        const currentData = await getPatientById(pChartID);
        if (!currentData) {
          throw new Error("Patient data not found");
        }

        // Update only the active status
        const updatedData: PatientRegistrationDto = {
          ...currentData,
          patRegisters: {
            ...currentData.patRegisters,
            rActiveYN: isActive ? "Y" : "N",
          },
        };

        const result = await PatientService.savePatient(updatedData);

        if (result.success) {
          showAlert("Success", `Patient ${isActive ? "activated" : "deactivated"} successfully`, "success");
          // Refresh the patient list
          await fetchPatientList();
          return true;
        } else {
          throw new Error(result.errorMessage || "Failed to update patient status");
        }
      } catch (error) {
        console.error("Error updating patient status:", error);
        showAlert("Error", "Failed to update patient status", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [, showAlert, fetchPatientList, getPatientById]
  );

  // Delete patient (soft delete by setting active status to N)
  const deletePatient = useCallback(
    async (pChartID: number): Promise<boolean> => {
      return updatePatientStatus(pChartID, false);
    },
    [updatePatientStatus]
  );

  // Search patients with debouncing support
  const searchPatients = useCallback(
    async (searchTerm: string): Promise<void> => {
      await fetchPatientList(searchTerm);
    },
    [fetchPatientList]
  );

  // Initialize with empty search on mount
  useEffect(() => {
    fetchPatientList("");
  }, [fetchPatientList]);

  return {
    patientList,
    isLoading,
    error,
    fetchPatientList,
    getPatientById,
    savePatient,
    deletePatient,
    updatePatientStatus,
    searchPatients,
  };
};
