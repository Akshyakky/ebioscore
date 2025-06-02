import { useState, useCallback } from "react";
import { useBreakList } from "./useBreakList";
import { useBreakConDetails } from "./useBreakConDetails";
import { useBreakConSuspend } from "./useBreakConSuspend";
import { BreakDto, BreakConSuspendData } from "@/interfaces/FrontOffice/BreakListData";
import { useAlert } from "@/providers/AlertProvider";

/**
 * Composite hook that combines all break-related operations
 * This hook provides a unified interface for managing breaks, their details, and suspend operations
 */
export const useBreakListOperations = () => {
  const { showAlert } = useAlert();
  const breakListHook = useBreakList();
  const breakConDetailsHook = useBreakConDetails();
  const breakConSuspendHook = useBreakConSuspend();

  const [selectedBreak, setSelectedBreak] = useState<BreakDto | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const isLoading = breakListHook.isLoading || breakConDetailsHook.isLoading || breakConSuspendHook.isLoading;

  const deleteBreak = useCallback(
    async (breakItem: BreakDto) => {
      try {
        const result = await breakConDetailsHook.deleteBreakConDetail(breakItem.bCDID);
        if (result) {
          showAlert("Success", "Break deleted successfully", "success");
          await breakListHook.fetchBreakList();
          return true;
        }
        throw new Error("Failed to delete break");
      } catch (error) {
        console.error("Delete operation failed:", error);
        showAlert("Error", "Failed to delete break", "error");
        return false;
      }
    },
    [breakConDetailsHook, breakListHook, showAlert]
  );

  const suspendBreak = useCallback(
    async (breakItem: BreakDto) => {
      try {
        const suspendData = await breakConSuspendHook.getSuspendDataByBreakAndHP(breakItem.bLID, breakItem.hPLID);

        const newSuspendData: BreakConSuspendData = {
          bCSID: suspendData.length > 0 ? suspendData[0].bCSID : 0,
          bLID: breakItem.bLID,
          hPLID: breakItem.hPLID,
          bLStartDate: breakItem.bLStartDate,
          bLEndDate: breakItem.bLEndDate,
          bCSStartDate: new Date(),
          bCSEndDate: new Date(),
          rActiveYN: "Y",
          rNotes: "",
          transferYN: "N",
        };

        return newSuspendData;
      } catch (error) {
        console.error("Error preparing suspend data:", error);
        showAlert("Error", "Failed to prepare suspend data", "error");
        return null;
      }
    },
    [breakConSuspendHook, showAlert]
  );

  const resumeBreak = useCallback(
    async (breakItem: BreakDto) => {
      if (!breakItem.bCSID) {
        showAlert("Error", "No suspend record found", "error");
        return false;
      }

      const result = await breakConSuspendHook.resumeBreak(breakItem.bCSID);
      if (result.success) {
        showAlert("Success", "Break resumed successfully", "success");
        await breakListHook.fetchBreakList();
        return true;
      } else {
        showAlert("Error", "Failed to resume break", "error");
        return false;
      }
    },
    [breakConSuspendHook, breakListHook, showAlert]
  );

  const getActiveBreakList = useCallback(() => {
    return breakListHook.breakList
      .map((breakItem) => {
        if (!breakItem || !breakItem.breakList) {
          return null;
        }

        return {
          ...breakItem.breakList,
        } as BreakDto;
      })
      .filter((item) => item.rActiveYN === "Y");
  }, [breakListHook.breakList, breakConSuspendHook.breakConSuspendList]);

  return {
    breakList: getActiveBreakList(),
    selectedBreak,
    setSelectedBreak,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isSuspendDialogOpen,
    setIsSuspendDialogOpen,
    isLoading,
    error: breakListHook.error || breakConDetailsHook.error || breakConSuspendHook.error,

    fetchBreakList: breakListHook.fetchBreakList,
    saveBreak: breakListHook.saveBreak,
    deleteBreak,
    suspendBreak,
    resumeBreak,
    saveBreakConSuspend: breakConSuspendHook.saveBreakConSuspend,

    breakListHook,
    breakConDetailsHook,
    breakConSuspendHook,
  };
};
