import { useState, useCallback, useRef, useEffect } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { BreakListDto } from "@/interfaces/FrontOffice/BreakListData";
import { breakService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

export const useBreakList = () => {
  const [breakList, setBreakList] = useState<BreakListDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchBreakList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await breakService.getAll();
      if (result.success && result.data) {
        const validatedData = result.data.map((item: any) => ({
          breakList: item.breakList || item,
          breakConDetails: Array.isArray(item.breakConDetails) ? item.breakConDetails : [],
        }));
        setBreakList(validatedData);
      } else {
        setError(result.errorMessage || "Failed to fetch breaks");
      }
    } catch (err) {
      console.error("Error fetching breaks:", err);
      setError("An unexpected error occurred while fetching breaks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchBreakList();
      initialFetchDone.current = true;
    }
  }, [fetchBreakList]);

  const getBreakById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await breakService.getById(id);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to fetch break");
        return null;
      }
    } catch (err) {
      console.error("Error fetching break:", err);
      setError("An unexpected error occurred while fetching break");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveBreak = useCallback(
    async (breakData: BreakListDto) => {
      try {
        setLoading(true);
        return await breakService.save(breakData);
      } catch (err) {
        console.error("Error saving break:", err);
        setError("An unexpected error occurred while saving break");
        return { success: false, errorMessage: "Failed to save break" };
      } finally {
        setLoading(false);
      }
    },
    [fetchBreakList]
  );

  const deleteBreak = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await breakService.delete(id);
        if (result.success) {
          await fetchBreakList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete break");
          return false;
        }
      } catch (err) {
        console.error("Error deleting break:", err);
        setError("An unexpected error occurred while deleting break");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchBreakList]
  );

  const updateBreakStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await breakService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchBreakList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update break status");
          return false;
        }
      } catch (err) {
        console.error("Error updating break status:", err);
        setError("An unexpected error occurred while updating status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchBreakList]
  );

  const getNextCode = useCallback(async (prefix: string = "BRK", padLength: number = 3) => {
    try {
      setLoading(true);
      const result = await breakService.getNextCode(prefix, padLength);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to generate next code");
        return null;
      }
    } catch (err) {
      console.error("Error generating next code:", err);
      setError("An unexpected error occurred while generating code");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    breakList,
    isLoading,
    error,
    fetchBreakList,
    getBreakById,
    saveBreak,
    deleteBreak,
    updateBreakStatus,
    getNextCode,
  };
};
