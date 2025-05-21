import { useState, useEffect, useCallback, useRef } from "react";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { reasonListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { useLoading } from "@/hooks/Common/useLoading";

export const useReasonList = () => {
  const [reasonList, setReasonList] = useState<ReasonListData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchReasonList = useCallback(async () => {
    if (setLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await reasonListService.getAll();
      if (result.success && result.data) {
        setReasonList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch reasons");
      }
    } catch (err) {
      console.error("Error fetching reasons:", err);
      setError("An unexpected error occurred while fetching reasons");
    } finally {
      if (setLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchReasonList();
      initialFetchDone.current = true;
    }
  }, [fetchReasonList]);

  const getReasonById = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await reasonListService.getById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to fetch reason");
          return null;
        }
      } catch (err) {
        console.error("Error fetching reason:", err);
        setError("An unexpected error occurred while fetching reason");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const createReason = useCallback(
    async (reason: ReasonListData) => {
      try {
        setLoading(true);
        const result = await reasonListService.save(reason);
        if (result.success) {
          await fetchReasonList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to create reason");
          return false;
        }
      } catch (err) {
        console.error("Error creating reason:", err);
        setError("An unexpected error occurred while creating reason");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchReasonList, setLoading]
  );

  const updateReason = useCallback(
    async (reason: ReasonListData) => {
      try {
        setLoading(true);
        const result = await reasonListService.save(reason);
        if (result.success) {
          await fetchReasonList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update reason");
          return false;
        }
      } catch (err) {
        console.error("Error updating reason:", err);
        setError("An unexpected error occurred while updating reason");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchReasonList, setLoading]
  );

  const deleteReason = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await reasonListService.delete(id);
        if (result.success) {
          await fetchReasonList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete reason");
          return false;
        }
      } catch (err) {
        console.error("Error deleting reason:", err);
        setError("An unexpected error occurred while deleting reason");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchReasonList, setLoading]
  );

  const updateReasonStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await reasonListService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchReasonList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update reason status");
          return false;
        }
      } catch (err) {
        console.error("Error updating reason status:", err);
        setError("An unexpected error occurred while updating reason status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchReasonList, setLoading]
  );

  const getNextCode = useCallback(
    async (prefix: string = "RES", padLength: number = 3) => {
      try {
        setLoading(true);
        const result = await reasonListService.getNextCode(prefix, padLength);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.errorMessage || "Failed to generate next reason code");
          return null;
        }
      } catch (err) {
        console.error("Error generating next reason code:", err);
        setError("An unexpected error occurred while generating reason code");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );
  return {
    reasonList,
    isLoading,
    error,
    fetchReasonList,
    getReasonById,
    createReason,
    updateReason,
    deleteReason,
    updateReasonStatus,
    getNextCode,
  };
};
