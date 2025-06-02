import { useState, useCallback } from "react";
import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakListData";
import { breakConSuspendService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { useLoading } from "@/hooks/Common/useLoading";

const useGenericBreakConSuspend = createEntityHook<BreakConSuspendData>(breakConSuspendService, "bCSID");

export const useBreakConSuspend = () => {
  const hook = useGenericBreakConSuspend();
  const { setLoading } = useLoading();
  const [suspendData, setSuspendData] = useState<BreakConSuspendData[]>([]);

  const getSuspendDataByBreakAndHP = useCallback(
    async (bLID: number, hPLID: number | null) => {
      try {
        setLoading(true);
        const result = await breakConSuspendService.getAll();
        if (result.success && result.data) {
          const filtered = result.data.filter((item: BreakConSuspendData) => item.bLID === bLID && item.hPLID === hPLID);
          setSuspendData(filtered);
          return filtered;
        }
        return [];
      } catch (error) {
        console.error("Error fetching suspend data:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const resumeBreak = useCallback(
    async (bCSID: number) => {
      try {
        setLoading(true);
        const result = await breakConSuspendService.updateActiveStatus(bCSID, false);
        if (result.success) {
          await hook.fetchEntityList();
        }
        return result;
      } catch (error) {
        console.error("Error resuming break:", error);
        return {
          success: false,
          errorMessage: "Failed to resume break",
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, hook]
  );

  return {
    breakConSuspendList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchBreakConSuspendList: hook.fetchEntityList,
    getBreakConSuspendById: hook.getEntityById,
    saveBreakConSuspend: hook.saveEntity,
    deleteBreakConSuspend: hook.deleteEntity,
    updateBreakConSuspendStatus: hook.updateEntityStatus,

    getSuspendDataByBreakAndHP,
    resumeBreak,
    suspendData,
  };
};
