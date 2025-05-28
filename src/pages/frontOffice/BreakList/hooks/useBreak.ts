import { useState, useCallback } from "react";
import { BreakConSuspendData, BreakListDto } from "@/interfaces/FrontOffice/BreakListData";
import { breakService, breakConSuspendService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { useAlert } from "@/providers/AlertProvider";

export const useBreak = () => {
  const [breakList, setBreakList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const fetchBreakList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await breakService.getAll();
      if (result.success && result.data) {
        setBreakList(result.data);
      } else {
        setError("Failed to load break list");
      }
    } catch (err) {
      setError("Error fetching break list");
      showAlert("Error", "Failed to load break list", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const saveBreak = useCallback(
    async (breakData: BreakListDto) => {
      setIsLoading(true);
      try {
        const result = await breakService.save(breakData);
        if (result.success && result.data) {
          setBreakList((prev) => (breakData.bLID ? prev.map((item) => (item.bLID === breakData.bLID ? result.data : item)) : [...prev, result.data]));
          return result;
        }
        return { success: false, errorMessage: "Failed to save break" };
      } catch (err) {
        showAlert("Error", "Failed to save break", "error");
        return { success: false, errorMessage: "Error saving break" };
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const deleteBreak = useCallback(
    async (bLID: number) => {
      setIsLoading(true);
      try {
        const result = await breakService.delete(bLID);
        if (result.success) {
          setBreakList((prev) => prev.filter((item) => item.bLID !== bLID));
          return true;
        }
        return false;
      } catch (err) {
        showAlert("Error", "Failed to delete break", "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const suspendBreak = useCallback(
    async (suspendData: BreakConSuspendData) => {
      setIsLoading(true);
      try {
        const result = await breakConSuspendService.save(suspendData);
        if (result.success && result.data) {
          setBreakList((prev) => prev.map((item) => (item.bLID === suspendData.bLID ? { ...item, rActiveYN: "N", bCSID: result.data.bCSID } : item)));
          return result;
        }
        return { success: false, errorMessage: "Failed to suspend break" };
      } catch (err) {
        showAlert("Error", "Failed to suspend break", "error");
        return { success: false, errorMessage: "Error suspending break" };
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const resumeBreak = useCallback(
    async (bCSID: number, bLID: number) => {
      setIsLoading(true);
      try {
        const result = await breakConSuspendService.updateActiveStatus(bCSID, true);
        if (result.success) {
          setBreakList((prev) => prev.map((item) => (item.bLID === bLID ? { ...item, rActiveYN: "Y", bCSID: undefined } : item)));
          return true;
        }
        return false;
      } catch (err) {
        showAlert("Error", "Failed to resume break", "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  return {
    breakList,
    isLoading,
    error,
    fetchBreakList,
    saveBreak,
    deleteBreak,
    suspendBreak,
    resumeBreak,
  };
};
