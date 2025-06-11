import { useState, useCallback, useRef, useEffect } from "react";
import { useLoading } from "@/hooks/Common/useLoading";
import { InvestigationListDto } from "@/interfaces/Laboratory/InvestigationListDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

export const useInvestigationList = () => {
  const [investigationList, setInvestigationList] = useState<InvestigationListDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchInvestigationList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await investigationlistService.getAll();
      if (result.success && result.data) {
        setInvestigationList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch investigations");
      }
    } catch (err) {
      console.error("Error fetching investigations:", err);
      setError("An unexpected error occurred while fetching investigations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchInvestigationList();
      initialFetchDone.current = true;
    }
  }, [fetchInvestigationList]);

  const getInvestigationById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await investigationlistService.getById(id);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to fetch investigation");
        return null;
      }
    } catch (err) {
      console.error("Error fetching investigation:", err);
      setError("An unexpected error occurred while fetching investigation");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvestigation = useCallback(
    async (investigationData: InvestigationListDto) => {
      try {
        setLoading(true);
        return await investigationlistService.save(investigationData);
      } catch (err) {
        console.error("Error saving investigation:", err);
        setError("An unexpected error occurred while saving investigation");
        return { success: false, errorMessage: "Failed to save investigation" };
      } finally {
        setLoading(false);
      }
    },
    [fetchInvestigationList]
  );

  const deleteInvestigation = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await investigationlistService.delete(id);
        if (result.success) {
          await fetchInvestigationList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete investigation");
          return false;
        }
      } catch (err) {
        console.error("Error deleting investigation:", err);
        setError("An unexpected error occurred while deleting investigation");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchInvestigationList]
  );

  const updateInvestigationStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await investigationlistService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchInvestigationList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update investigation status");
          return false;
        }
      } catch (err) {
        console.error("Error updating investigation status:", err);
        setError("An unexpected error occurred while updating status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchInvestigationList]
  );

  const getNextCode = useCallback(async (prefix: string = "INV", padLength: number = 6) => {
    try {
      setLoading(true);
      const { lInvMastService } = await import("@/services/Laboratory/LaboratoryService");
      const result = await lInvMastService.getNextCode(prefix, padLength);
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
    investigationList,
    isLoading,
    error,
    fetchInvestigationList,
    getInvestigationById,
    saveInvestigation,
    deleteInvestigation,
    updateInvestigationStatus,
    getNextCode,
  };
};
