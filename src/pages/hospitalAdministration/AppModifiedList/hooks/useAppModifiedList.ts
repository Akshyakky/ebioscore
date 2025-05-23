import { useState, useCallback } from "react";
import { AppModifiedMast, AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { appModifiedListService, appModifiedMastService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/hooks/Common/useLoading";

export const useAppModifiedList = () => {
  const { setLoading } = useLoading();
  const [masterList, setMasterList] = useState<AppModifiedMast[]>([]);
  const [fieldsList, setFieldsList] = useState<AppModifyFieldDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await appModifiedMastService.getAll();
      if (response && response.data) {
        const validItems = response.data.filter((item: AppModifiedMast) => item.rActiveYN === "Y");
        setMasterList(validItems);
        return validItems;
      }
      return [];
    } catch (error) {
      const errorMessage = "Failed to load master list";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMasterById = useCallback(async (id: number): Promise<AppModifiedMast | null> => {
    try {
      const response = await appModifiedMastService.getById(id);
      if (response && typeof response === "object" && "data" in response) {
        return response.data as AppModifiedMast;
      }
    } catch (error) {
      showAlert("Error", "Failed to fetch master details", "error");
      return null;
    }
  }, []);

  const saveMaster = useCallback(
    async (data: AppModifiedMast) => {
      setLoading(true);
      try {
        const response = await appModifiedMastService.save(data);
        if (response) {
          const message = data.fieldID ? "Category updated successfully" : "Category created successfully";
          showAlert("Success", message, "success");
          return { success: true, data: response };
        } else {
          throw new Error("Failed to save category");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save category";
        showAlert("Error", errorMessage, "error");
        return { success: false, errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const deleteMaster = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      try {
        const master = await getMasterById(id);
        if (master) {
          const updatedMaster = { ...master, rActiveYN: "N" as const };
          const response = await appModifiedMastService.save(updatedMaster);
          if (response) {
            showAlert("Success", "Category deactivated successfully", "success");
            return true;
          }
        }
        return false;
      } catch (error) {
        showAlert("Error", "Failed to deactivate category", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, getMasterById]
  );

  const updateMasterStatus = useCallback(async (id: number, status: boolean): Promise<boolean> => {
    try {
      const response = await appModifiedMastService.updateActiveStatus(id, status);
      return response.success;
    } catch (error) {
      return false;
    }
  }, []);

  const fetchFieldsList = useCallback(async (fieldCode?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await appModifiedListService.getAll();
      const fieldsData = response.data || response;

      if (Array.isArray(fieldsData)) {
        let filteredFields = fieldsData.filter((field) => field.rActiveYN === "Y");

        if (fieldCode) {
          filteredFields = filteredFields.filter((field) => field.amlField.toUpperCase() === fieldCode.toUpperCase());
        }

        setFieldsList(filteredFields);
        return filteredFields;
      }
      return [];
    } catch (error) {
      const errorMessage = "Failed to load fields list";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFieldById = useCallback(async (id: number): Promise<AppModifyFieldDto | null> => {
    try {
      const response = await appModifiedListService.getById(id);
      if (response && typeof response === "object" && "data" in response) {
        return response.data as AppModifyFieldDto;
      }
    } catch (error) {
      showAlert("Error", "Failed to fetch field details", "error");
      return null;
    }
  }, []);

  const saveField = useCallback(
    async (data: AppModifyFieldDto) => {
      setLoading(true);
      try {
        const response = await appModifiedListService.save(data);
        if (response) {
          const message = data.amlID ? "Field updated successfully" : "Field created successfully";
          showAlert("Success", message, "success");
          return { success: true, data: response };
        } else {
          throw new Error("Failed to save field");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save field";
        showAlert("Error", errorMessage, "error");
        return { success: false, errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const deleteField = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true);
      try {
        const field = await getFieldById(id);
        if (field) {
          const updatedField = { ...field, rActiveYN: "N" as const };
          const response = await appModifiedListService.save(updatedField);
          if (response) {
            showAlert("Success", "Field deactivated successfully", "success");
            return true;
          }
        }
        return false;
      } catch (error) {
        showAlert("Error", "Failed to deactivate field", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, getFieldById]
  );

  const updateFieldStatus = useCallback(async (id: number, status: boolean): Promise<boolean> => {
    try {
      const response = await appModifiedListService.updateActiveStatus(id, status);
      return response.success;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    masterList,
    fieldsList,
    isLoading,
    error,

    fetchMasterList,
    getMasterById,
    saveMaster,
    deleteMaster,
    updateMasterStatus,

    fetchFieldsList,
    getFieldById,
    saveField,
    deleteField,
    updateFieldStatus,
  };
};
