// src/hooks/PatientAdministration/useInsuranceManagement.ts
import { useState, useCallback } from "react";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";

export const useInsuranceManagement = () => {
  const [insuranceList, setInsuranceList] = useState<OPIPInsurancesDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  // Fetch insurance list by patient chart ID
  const fetchInsuranceList = useCallback(async (pChartID: number) => {
    if (!pChartID) {
      setInsuranceList([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching insurance list for pChartID:", pChartID);

      const response = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);

      console.log("Insurance fetch response:", response);

      if (response.success && response.data) {
        const formattedData = response.data.map((insurance) => ({
          ...insurance,
          policyStartDt: insurance.policyStartDt ? new Date(insurance.policyStartDt) : new Date(),
          policyEndDt: insurance.policyEndDt ? new Date(insurance.policyEndDt) : new Date(),
        }));

        console.log("Formatted insurance data:", formattedData);
        setInsuranceList(formattedData);
      } else {
        console.log("No insurance data found or API error");
        setInsuranceList([]);
      }
    } catch (error) {
      console.error("Error fetching insurance list:", error);
      setError("Failed to fetch insurance records");
      setInsuranceList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save insurance record
  const saveInsurance = useCallback(
    async (insuranceData: OPIPInsurancesDto) => {
      try {
        setLoading(true);

        console.log("Saving insurance data:", insuranceData);

        const response = await InsuranceCarrierService.addOrUpdateOPIPInsurance(insuranceData);

        console.log("Save insurance response:", response);

        if (response.success) {
          // Refresh the list after successful save
          if (insuranceData.pChartID) {
            await fetchInsuranceList(insuranceData.pChartID);
          }
          return { success: true, data: response.data };
        } else {
          throw new Error(response.errorMessage || "Failed to save insurance record");
        }
      } catch (error) {
        console.error("Error saving insurance:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to save insurance record";
        return { success: false, errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchInsuranceList]
  );

  // Delete insurance record
  const deleteInsurance = useCallback(
    async (insuranceId: number, pChartID: number) => {
      try {
        setLoading(true);

        console.log("Deleting insurance ID:", insuranceId);

        const response = await InsuranceCarrierService.hideOPIPInsurance(insuranceId);

        console.log("Delete insurance response:", response);

        if (response.success) {
          // Refresh the list after successful delete
          await fetchInsuranceList(pChartID);
          return true;
        } else {
          throw new Error("Failed to delete insurance record");
        }
      } catch (error) {
        console.error("Error deleting insurance:", error);
        showAlert("Error", "Failed to delete insurance record", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchInsuranceList]
  );

  // Add insurance record to local state (for unsaved records)
  const addInsuranceToList = useCallback((insurance: OPIPInsurancesDto) => {
    console.log("Adding insurance to list:", insurance);

    setInsuranceList((prev) => {
      const maxId = prev.reduce((max, item) => Math.max(max, item.ID || 0), 0);
      const newInsurance = {
        ...insurance,
        ID: maxId + 1,
        // Ensure dates are properly formatted
        policyStartDt: insurance.policyStartDt instanceof Date ? insurance.policyStartDt : new Date(insurance.policyStartDt),
        policyEndDt: insurance.policyEndDt instanceof Date ? insurance.policyEndDt : new Date(insurance.policyEndDt),
      };

      const updatedList = [...prev, newInsurance];
      console.log("Updated insurance list after add:", updatedList);
      return updatedList;
    });
  }, []);

  // Update insurance record in local state
  const updateInsuranceInList = useCallback((insurance: OPIPInsurancesDto) => {
    console.log("Updating insurance in list:", insurance);

    setInsuranceList((prev) => {
      const updatedList = prev.map((item) => {
        const isMatch = (item.oPIPInsID && item.oPIPInsID === insurance.oPIPInsID) || (item.ID && item.ID === insurance.ID);

        if (isMatch) {
          return {
            ...insurance,
            // Ensure dates are properly formatted
            policyStartDt: insurance.policyStartDt instanceof Date ? insurance.policyStartDt : new Date(insurance.policyStartDt),
            policyEndDt: insurance.policyEndDt instanceof Date ? insurance.policyEndDt : new Date(insurance.policyEndDt),
          };
        }
        return item;
      });

      console.log("Updated insurance list after update:", updatedList);
      return updatedList;
    });
  }, []);

  // Remove insurance record from local state
  const removeInsuranceFromList = useCallback((insuranceId: number) => {
    console.log("Removing insurance from list with ID:", insuranceId);

    setInsuranceList((prev) => {
      const updatedList = prev.filter((item) => item.oPIPInsID !== insuranceId && item.ID !== insuranceId);
      console.log("Updated insurance list after remove:", updatedList);
      return updatedList;
    });
  }, []);

  // Clear insurance list
  const clearInsuranceList = useCallback(() => {
    console.log("Clearing insurance list");
    setInsuranceList([]);
    setError(null);
  }, []);

  // Save all insurance records (bulk save)
  const saveAllInsurance = useCallback(
    async (pChartID: number) => {
      if (!insuranceList.length) return { success: true };

      try {
        setLoading(true);

        // Filter for new/unsaved records (those without oPIPInsID)
        const unsavedRecords = insuranceList.filter((insurance) => !insurance.oPIPInsID);

        console.log("Saving all insurance records:", unsavedRecords);

        if (unsavedRecords.length > 0) {
          const saveOperations = unsavedRecords.map((insurance) => {
            const insuranceData = { ...insurance, pChartID };
            return InsuranceCarrierService.addOrUpdateOPIPInsurance(insuranceData);
          });

          const results = await Promise.all(saveOperations);

          console.log("Bulk save results:", results);

          // Check if all operations succeeded
          const allSucceeded = results.every((result) => result.success);

          if (!allSucceeded) {
            throw new Error("Some insurance records failed to save");
          }

          // Refresh the list after bulk save
          await fetchInsuranceList(pChartID);
        }

        return { success: true };
      } catch (error) {
        console.error("Error saving insurance records:", error);
        return { success: false, errorMessage: "Failed to save insurance records" };
      } finally {
        setLoading(false);
      }
    },
    [insuranceList, setLoading, fetchInsuranceList]
  );

  return {
    insuranceList,
    isLoading,
    error,
    fetchInsuranceList,
    saveInsurance,
    deleteInsurance,
    addInsuranceToList,
    updateInsuranceInList,
    removeInsuranceFromList,
    clearInsuranceList,
    saveAllInsurance,
  };
};
