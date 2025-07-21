import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { useAlert } from "@/providers/AlertProvider";
import { useCallback, useState } from "react";
import { useHospWorkHours } from "./useHospWorkHours";

/**
 * Composite hook that combines work hours operations and UI state management
 * This hook provides a unified interface for managing hospital work hours
 */
export const useHospWorkHoursOperations = () => {
  const { showAlert } = useAlert();
  const workHoursHook = useHospWorkHours();

  const [selectedWorkHours, setSelectedWorkHours] = useState<HospWorkHoursDto | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteWorkHours = useCallback(
    async (workHours: HospWorkHoursDto) => {
      try {
        const result = await workHoursHook.deleteWorkHours(workHours.hwrkID);
        if (result) {
          showAlert("Success", "Work hours deleted successfully", "success");
          await workHoursHook.fetchWorkHoursList();
          return true;
        }
        throw new Error("Failed to delete work hours");
      } catch (error) {
        console.error("Delete operation failed:", error);
        showAlert("Error", "Failed to delete work hours", "error");
        return false;
      }
    },
    [workHoursHook, showAlert]
  );

  const bulkDeleteWorkHours = useCallback(
    async (ids: number[], softDelete: boolean = true) => {
      try {
        const result = await workHoursHook.bulkDeleteWorkHours(ids, softDelete);
        if (result.success) {
          showAlert("Success", `${ids.length} work hours records deleted successfully`, "success");
          await workHoursHook.fetchWorkHoursList();
          return true;
        }
        throw new Error(result.errorMessage || "Failed to bulk delete work hours");
      } catch (error) {
        console.error("Bulk delete operation failed:", error);
        showAlert("Error", "Failed to delete selected work hours", "error");
        return false;
      }
    },
    [workHoursHook, showAlert]
  );

  const toggleWorkHoursStatus = useCallback(
    async (workHours: HospWorkHoursDto) => {
      try {
        const newStatus = workHours.rActiveYN === "Y" ? false : true;
        const result = await workHoursHook.updateWorkHoursStatus(workHours.hwrkID, newStatus);
        if (result) {
          const statusText = newStatus ? "activated" : "deactivated";
          showAlert("Success", `Work hours ${statusText} successfully`, "success");
          await workHoursHook.fetchWorkHoursList();
          return true;
        }
        throw new Error("Failed to update work hours status");
      } catch (error) {
        console.error("Status update failed:", error);
        showAlert("Error", "Failed to update work hours status", "error");
        return false;
      }
    },
    [workHoursHook, showAlert]
  );

  const validateAndSaveWorkHours = useCallback(
    async (workHoursData: HospWorkHoursDto) => {
      try {
        // First validate the data
        const validationResult = await workHoursHook.validateWorkHours(workHoursData);
        if (!validationResult.success) {
          showAlert("Validation Error", validationResult.errorMessage || "Work hours data is invalid", "error");
          return { success: false, errorMessage: validationResult.errorMessage };
        }

        // Check for overlaps
        // const overlapResult = await workHoursHook.validateOverlap(workHoursData);
        // if (overlapResult.success && overlapResult.data === true) {
        //   showAlert("Overlap Detected", "The specified time range overlaps with existing work hours", "warning");
        //   return { success: false, errorMessage: "Time overlap detected" };
        // }

        // Save the data
        const saveResult = await workHoursHook.saveWorkHours(workHoursData);
        if (saveResult.success) {
          const actionText = workHoursData.hwrkID ? "updated" : "created";
          showAlert("Success", `Work hours ${actionText} successfully`, "success");
          await workHoursHook.fetchWorkHoursList();
          return saveResult;
        }

        throw new Error(saveResult.errorMessage || "Failed to save work hours");
      } catch (error) {
        console.error("Save operation failed:", error);
        showAlert("Error", "Failed to save work hours", "error");
        return { success: false, errorMessage: "Failed to save work hours" };
      }
    },
    [workHoursHook, showAlert]
  );

  const checkWorkHoursExist = useCallback(
    async (langType: string, dayDesc: string) => {
      try {
        const result = await workHoursHook.getWorkHoursByLanguage(langType);
        if (result.success && result.data) {
          const exists = result.data.some((wh) => wh.daysDesc === dayDesc && wh.rActiveYN === "Y");
          return exists;
        }
        return false;
      } catch (error) {
        console.error("Error checking work hours existence:", error);
        return false;
      }
    },
    [workHoursHook]
  );

  const duplicateWorkHours = useCallback(
    async (sourceWorkHours: HospWorkHoursDto, targetDays: string[]) => {
      try {
        const duplicateRecords: HospWorkHoursDto[] = targetDays.map((day) => ({
          ...sourceWorkHours,
          hwrkID: 0, // Reset ID for new record
          daysDesc: day,
          rNotes: `Duplicated from ${sourceWorkHours.daysDesc}`,
        }));

        const result = await workHoursHook.bulkSaveWorkHours(duplicateRecords);
        if (result.success) {
          showAlert("Success", `Work hours duplicated to ${targetDays.length} days successfully`, "success");
          await workHoursHook.fetchWorkHoursList();
          return true;
        }
        throw new Error(result.errorMessage || "Failed to duplicate work hours");
      } catch (error) {
        console.error("Duplicate operation failed:", error);
        showAlert("Error", "Failed to duplicate work hours", "error");
        return false;
      }
    },
    [workHoursHook, showAlert]
  );

  const getActiveWorkHoursList = useCallback(() => {
    return workHoursHook.workHoursList.filter((wh) => wh.rActiveYN === "Y");
  }, [workHoursHook.workHoursList]);

  const getInactiveWorkHoursList = useCallback(() => {
    return workHoursHook.workHoursList.filter((wh) => wh.rActiveYN === "N");
  }, [workHoursHook.workHoursList]);

  const getHolidayWorkHoursList = useCallback(() => {
    return workHoursHook.workHoursList.filter((wh) => wh.wkHoliday === "Y");
  }, [workHoursHook.workHoursList]);

  const getWorkHoursByLanguage = useCallback(
    (langType: string) => {
      return workHoursHook.workHoursList.filter((wh) => wh.langType === langType);
    },
    [workHoursHook.workHoursList]
  );

  const getWorkHoursByDay = useCallback(
    (dayDesc: string) => {
      return workHoursHook.workHoursList.filter((wh) => wh.daysDesc === dayDesc);
    },
    [workHoursHook.workHoursList]
  );

  return {
    // Base data and operations
    workHoursList: workHoursHook.workHoursList,
    isLoading: workHoursHook.isLoading,
    error: workHoursHook.error,
    fetchWorkHoursList: workHoursHook.fetchWorkHoursList,

    // UI state management
    selectedWorkHours,
    setSelectedWorkHours,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    selectedIds,
    setSelectedIds,

    // Enhanced operations
    deleteWorkHours,
    bulkDeleteWorkHours,
    toggleWorkHoursStatus,
    validateAndSaveWorkHours,
    checkWorkHoursExist,
    duplicateWorkHours,

    // Filtered data accessors
    getActiveWorkHoursList,
    getInactiveWorkHoursList,
    getHolidayWorkHoursList,
    getWorkHoursByLanguage,
    getWorkHoursByDay,

    // Direct access to hook functions
    workHoursHook,
  };
};
