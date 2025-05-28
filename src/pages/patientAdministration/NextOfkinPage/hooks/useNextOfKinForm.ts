import { useState, useCallback } from "react";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { useLoading } from "@/hooks/Common/useLoading";
import { notifySuccess, notifyError, notifyWarning } from "@/utils/Common/toastManager";

interface UseNextOfKinOptions {
  pChartID?: number;
  pChartCode?: string;
  autoFetch?: boolean;
}

export const useNextOfKin = (options: UseNextOfKinOptions = {}) => {
  const { pChartID, pChartCode, autoFetch = true } = options;
  const [nokList, setNokList] = useState<PatNokDetailsDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();

  const fetchNokList = useCallback(
    async (chartID?: number) => {
      const targetChartID = chartID || pChartID;

      if (!targetChartID) {
        setError("Chart ID is required to fetch Next of Kin data");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await PatNokService.getNokDetailsByPChartID(targetChartID);

        if (response.success && response.data) {
          setNokList(response.data);
          return true;
        } else if (response.errorMessage) {
          setError(response.errorMessage);
          notifyWarning(response.errorMessage);
          return false;
        }

        return true;
      } catch (error) {
        const errorMessage = "Failed to load next of kin information";
        setError(errorMessage);
        notifyError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [pChartID]
  );

  const saveNextOfKin = useCallback(
    async (data: PatNokDetailsDto): Promise<{ success: boolean; errorMessage?: string }> => {
      try {
        setLoading(true);
        const nokData = {
          ...data,
          pChartID: data.pChartID || pChartID,
          pNokPChartCode: data.pNokPChartCode || pChartCode,
          rActiveYN: data.rActiveYN || "Y",
        };
        const response = await PatNokService.saveNokDetails(nokData);
        if (response.success) {
          const isEdit = !!data.pNokID;
          notifySuccess(isEdit ? "Next of kin updated successfully" : "Next of kin added successfully");
          await fetchNokList();
          return { success: true };
        } else {
          const errorMessage = response.errorMessage || "Failed to save next of kin information";
          notifyError(errorMessage);
          return { success: false, errorMessage };
        }
      } catch (error) {
        const errorMessage = "An error occurred while saving next of kin information";
        notifyError(errorMessage);
        return { success: false, errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [pChartID, pChartCode, fetchNokList]
  );

  const deleteNextOfKin = useCallback(
    async (nokId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const nokToUpdate = nokList.find((nok) => nok.pNokID === nokId);
        if (!nokToUpdate) {
          notifyError("Record not found");
          return false;
        }
        const updatedNok = {
          ...nokToUpdate,
          rActiveYN: "N",
        };

        const response = await PatNokService.saveNokDetails(updatedNok);

        if (response.success) {
          notifySuccess("Next of kin removed successfully");
          await fetchNokList();
          return true;
        } else {
          const errorMessage = response.errorMessage || "Failed to remove next of kin";
          notifyError(errorMessage);
          return false;
        }
      } catch (error) {
        notifyError("An error occurred while removing next of kin");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [nokList, fetchNokList]
  );

  const getActiveNokList = useCallback(() => {
    return nokList.filter((nok) => nok.rActiveYN === "Y");
  }, [nokList]);

  const getNokById = useCallback(
    (nokId: number) => {
      return nokList.find((nok) => nok.pNokID === nokId) || null;
    },
    [nokList]
  );

  const stats = useCallback(() => {
    const activeList = getActiveNokList();
    return {
      total: nokList.length,
      active: activeList.length,
      inactive: nokList.length - activeList.length,
    };
  }, [nokList, getActiveNokList]);

  return {
    nokList: getActiveNokList(),
    allNokList: nokList,
    isLoading,
    error,
    fetchNokList,
    saveNextOfKin,
    deleteNextOfKin,
    getNokById,
    stats,
  };
};
