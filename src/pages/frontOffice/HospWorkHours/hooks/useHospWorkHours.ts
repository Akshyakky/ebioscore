import { useLoading } from "@/hooks/Common/useLoading";
import { HospWorkHoursDto, WorkHoursFilterDto } from "@/interfaces/FrontOffice/HospWorkHoursDt";
import { hospWorkHoursService } from "@/services/FrontOfficeServices/HospWorkHoursService";
import { useCallback, useEffect, useRef, useState } from "react";

export const useHospWorkHours = () => {
  const [workHoursList, setWorkHoursList] = useState<HospWorkHoursDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();
  const initialFetchDone = useRef(false);

  const fetchWorkHoursList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await hospWorkHoursService.getAll();
      if (result.success && result.data) {
        setWorkHoursList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch work hours");
      }
    } catch (err) {
      console.error("Error fetching work hours:", err);
      setError("An unexpected error occurred while fetching work hours");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchWorkHoursList();
      initialFetchDone.current = true;
    }
  }, [fetchWorkHoursList]);

  const getWorkHoursById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const result = await hospWorkHoursService.getById(id);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.errorMessage || "Failed to fetch work hours");
        return null;
      }
    } catch (err) {
      console.error("Error fetching work hours:", err);
      setError("An unexpected error occurred while fetching work hours");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWorkHours = useCallback(
    async (workHoursData: HospWorkHoursDto) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.saveWorkHours(workHoursData);
        if (result.success) {
          await fetchWorkHoursList();
          return result;
        } else {
          setError(result.errorMessage || "Failed to save work hours");
          return result;
        }
      } catch (err) {
        console.error("Error saving work hours:", err);
        setError("An unexpected error occurred while saving work hours");
        return { success: false, errorMessage: "Failed to save work hours" };
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkHoursList]
  );

  const deleteWorkHours = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.delete(id);
        if (result.success) {
          await fetchWorkHoursList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to delete work hours");
          return false;
        }
      } catch (err) {
        console.error("Error deleting work hours:", err);
        setError("An unexpected error occurred while deleting work hours");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkHoursList]
  );

  const updateWorkHoursStatus = useCallback(
    async (id: number, active: boolean) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.updateActiveStatus(id, active);
        if (result.success) {
          await fetchWorkHoursList();
          return true;
        } else {
          setError(result.errorMessage || "Failed to update work hours status");
          return false;
        }
      } catch (err) {
        console.error("Error updating work hours status:", err);
        setError("An unexpected error occurred while updating status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkHoursList]
  );

  const validateWorkHours = useCallback(async (workHoursData: HospWorkHoursDto) => {
    try {
      setLoading(true);
      const result = await hospWorkHoursService.validateWorkHours(workHoursData);
      return result;
    } catch (err) {
      console.error("Error validating work hours:", err);
      setError("An unexpected error occurred while validating work hours");
      return { success: false, errorMessage: "Failed to validate work hours" };
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkHoursByLanguage = useCallback(async (langType: string) => {
    try {
      setLoading(true);
      const result = await hospWorkHoursService.getWorkHoursByLanguage(langType);
      return result;
    } catch (err) {
      console.error("Error fetching work hours by language:", err);
      setError("An unexpected error occurred while fetching work hours by language");
      return { success: false, errorMessage: "Failed to fetch work hours by language" };
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkSaveWorkHours = useCallback(
    async (workHoursArray: HospWorkHoursDto[]) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.bulkSaveWorkHours(workHoursArray);
        if (result.success) {
          await fetchWorkHoursList();
        }
        return result;
      } catch (err) {
        console.error("Error bulk saving work hours:", err);
        setError("An unexpected error occurred while bulk saving work hours");
        return { success: false, errorMessage: "Failed to bulk save work hours" };
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkHoursList]
  );

  const bulkDeleteWorkHours = useCallback(
    async (ids: number[], softDelete: boolean = true) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.bulkDeleteWorkHours(ids, softDelete);
        if (result.success) {
          await fetchWorkHoursList();
        }
        return result;
      } catch (err) {
        console.error("Error bulk deleting work hours:", err);
        setError("An unexpected error occurred while bulk deleting work hours");
        return { success: false, errorMessage: "Failed to bulk delete work hours" };
      } finally {
        setLoading(false);
      }
    },
    [fetchWorkHoursList]
  );

  const getWorkHoursWithFilter = useCallback(
    async (filter: WorkHoursFilterDto, pageIndex: number = 0, pageSize: number = 10, sortBy: string = "hwrkID", ascending: boolean = true) => {
      try {
        setLoading(true);
        const result = await hospWorkHoursService.getWorkHoursWithFilter(filter, pageIndex, pageSize, sortBy, ascending);
        return result;
      } catch (err) {
        console.error("Error fetching filtered work hours:", err);
        setError("An unexpected error occurred while fetching filtered work hours");
        return { success: false, errorMessage: "Failed to fetch filtered work hours" };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    workHoursList,
    isLoading,
    error,
    fetchWorkHoursList,
    getWorkHoursById,
    saveWorkHours,
    deleteWorkHours,
    updateWorkHoursStatus,
    validateWorkHours,
    getWorkHoursByLanguage,
    bulkSaveWorkHours,
    bulkDeleteWorkHours,
    getWorkHoursWithFilter,
  };
};
