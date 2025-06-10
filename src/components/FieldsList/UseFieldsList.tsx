import { useEffect, useState, useCallback, useMemo } from "react";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { DropdownOption } from "../FormField/FormField";
import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";

interface FieldsListState {
  fieldsList: Record<string, DropdownOption[]>;
  defaultFields: Record<string, string>;
  isFetched: boolean;
  error: string | null;
}

interface UseFieldsListResult {
  fieldsList: Record<string, DropdownOption[]>;
  defaultFields: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  refreshFields: () => Promise<void>;
}

const useFieldsList = (fieldNames: string[]): UseFieldsListResult => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [state, setState] = useState<FieldsListState>({
    fieldsList: {},
    defaultFields: {},
    isFetched: false,
    error: null,
  });

  // Memoize normalized field names to prevent unnecessary recalculations
  const normalizedFieldNames = useMemo(() => fieldNames.map((name) => name.toLowerCase()), [fieldNames]);

  // Process fields data into options and defaults
  const processFieldsData = useCallback(
    (fieldsData: AppModifyFieldDto[]) => {
      const fieldOptions: Record<string, DropdownOption[]> = {};
      const defaultValues: Record<string, string> = {};

      normalizedFieldNames.forEach((fieldName) => {
        const filteredFields = fieldsData
          .filter((field) => field.amlField?.toLowerCase() === fieldName && field.rActiveYN === "Y")
          .map((field) => ({
            value: field.amlID.toString(),
            label: field.amlName,
            defaultYN: field.defaultYN,
            code: field.amlCode,
            field: field.amlField,
            active: field.rActiveYN,
          }));

        if (filteredFields.length > 0) {
          fieldOptions[fieldName] = filteredFields;
          const defaultField = filteredFields.find((field) => field.defaultYN === "Y");
          if (defaultField) {
            defaultValues[fieldName] = defaultField.value;
          }
        }
      });

      return { fieldOptions, defaultValues };
    },
    [normalizedFieldNames]
  );

  // Fetch fields data from the API
  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appModifiedListService.getAll();
      const fieldsData = response.data || response;

      if (!fieldsData || !Array.isArray(fieldsData) || fieldsData.length === 0) {
        throw new Error("No fields data available");
      }

      const { fieldOptions, defaultValues } = processFieldsData(fieldsData);

      setState((prev) => ({
        ...prev,
        fieldsList: fieldOptions,
        defaultFields: defaultValues,
        isFetched: true,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load fields";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isFetched: true,
      }));
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [processFieldsData]);

  // Refresh fields data manually
  const refreshFields = useCallback(async () => {
    setState((prev) => ({ ...prev, isFetched: false }));
    await fetchFields();
  }, [fetchFields]);

  // Initial fetch effect
  useEffect(() => {
    if (!state.isFetched) {
      fetchFields();
    }
  }, [state.isFetched, fetchFields]);

  return {
    fieldsList: state.fieldsList,
    defaultFields: state.defaultFields,
    isLoading: !state.isFetched,
    error: state.error,
    refreshFields,
  };
};

export default useFieldsList;
