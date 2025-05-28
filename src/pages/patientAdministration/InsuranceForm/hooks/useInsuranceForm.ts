// Fixed useInsuranceManagement.ts - Ensures proper date handling to prevent React rendering errors

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

  // Helper function to safely convert date values
  const safeDateConversion = (dateValue: any): Date => {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? new Date() : dateValue;
    }

    if (typeof dateValue === "string" || typeof dateValue === "number") {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? new Date() : date;
    }

    return new Date();
  };

  // Helper function to format insurance data safely
  const formatInsuranceData = (insurance: any): OPIPInsurancesDto => {
    return {
      ...insurance,
      // Ensure critical fields have default values
      ID: insurance.ID || 0,
      oPIPInsID: insurance.oPIPInsID || 0,
      pChartID: insurance.pChartID || 0,
      insurID: insurance.insurID || 0,
      insurName: insurance.insurName || "",
      policyNumber: insurance.policyNumber || "",
      relationVal: insurance.relationVal || "",
      rActiveYN: insurance.rActiveYN || "Y",

      // CRITICAL FIX: Properly handle date fields to prevent React rendering errors
      policyStartDt: safeDateConversion(insurance.policyStartDt),
      policyEndDt: safeDateConversion(insurance.policyEndDt),

      // Ensure string fields are properly initialized
      policyHolder: insurance.policyHolder || "",
      groupNumber: insurance.groupNumber || "",
      guarantor: insurance.guarantor || "",
      relation: insurance.relation || "",
      address1: insurance.address1 || "",
      address2: insurance.address2 || "",
      phone1: insurance.phone1 || "",
      phone2: insurance.phone2 || "",
      rNotes: insurance.rNotes || "",
      insurStatusCode: insurance.insurStatusCode || "",
      insurStatusName: insurance.insurStatusName || "",
      pChartCode: insurance.pChartCode || "",
      pChartCompID: insurance.pChartCompID || 0,
      referenceNo: insurance.referenceNo || "",
      transferYN: insurance.transferYN || "N",
      coveredVal: insurance.coveredVal || "",
      coveredFor: insurance.coveredFor || "",
      insurCode: insurance.insurCode || "",
    };
  };

  // Fetch insurance list by patient chart ID
  const fetchInsuranceList = useCallback(async (pChartID: number) => {
    if (!pChartID) {
      setInsuranceList([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);

      if (response.success && response.data) {
        const formattedData = response.data.map((insurance: any) => formatInsuranceData(insurance));

        setInsuranceList(formattedData);
      } else {
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

        // CRITICAL FIX: Format the data before sending to API
        const formattedData = formatInsuranceData(insuranceData);

        const response = await InsuranceCarrierService.addOrUpdateOPIPInsurance(formattedData);

        if (response.success) {
          // Refresh the list after successful save
          if (formattedData.pChartID) {
            await fetchInsuranceList(formattedData.pChartID);
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

        const response = await InsuranceCarrierService.hideOPIPInsurance(insuranceId);

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
    setInsuranceList((prev) => {
      const maxId = prev.reduce((max, item) => Math.max(max, item.ID || 0), 0);

      // CRITICAL FIX: Format the new insurance record properly
      const newInsurance = formatInsuranceData({
        ...insurance,
        ID: maxId + 1,
      });

      const updatedList = [...prev, newInsurance];
      return updatedList;
    });
  }, []);

  // Update insurance record in local state
  const updateInsuranceInList = useCallback((insurance: OPIPInsurancesDto) => {
    setInsuranceList((prev) => {
      const updatedList = prev.map((item) => {
        const isMatch = (item.oPIPInsID && item.oPIPInsID === insurance.oPIPInsID) || (item.ID && item.ID === insurance.ID);

        if (isMatch) {
          // CRITICAL FIX: Format the updated insurance record properly
          return formatInsuranceData(insurance);
        }
        return item;
      });

      return updatedList;
    });
  }, []);

  // Remove insurance record from local state
  const removeInsuranceFromList = useCallback((insuranceId: number) => {
    setInsuranceList((prev) => {
      const updatedList = prev.filter((item) => item.oPIPInsID !== insuranceId && item.ID !== insuranceId);
      return updatedList;
    });
  }, []);

  // Clear insurance list
  const clearInsuranceList = useCallback(() => {
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

        if (unsavedRecords.length > 0) {
          const saveOperations = unsavedRecords.map((insurance) => {
            // CRITICAL FIX: Format each record before saving
            const insuranceData = formatInsuranceData({ ...insurance, pChartID });
            return InsuranceCarrierService.addOrUpdateOPIPInsurance(insuranceData);
          });

          const results = await Promise.all(saveOperations);

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
