import { useLoading } from "@/hooks/Common/useLoading";
import { DateFilterType, FilterDto } from "@/interfaces/Common/FilterDto";
import { IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { useAlert } from "@/providers/AlertProvider";
import { indentMastService, indentService } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { useCallback, useRef, useState } from "react";

interface UseIndentProductState {
  indentList: IndentMastDto[];
  currentIndent: IndentSaveRequestDto | null;
  loading: boolean;
  error: string | null;
  totalRecords: number;
  currentPage: number;
}

interface UseIndentProductReturn extends UseIndentProductState {
  fetchIndentList: (filters?: Partial<FilterDto>) => Promise<void>;
  getIndentById: (id: number) => Promise<void>;
  saveIndent: (indentData: IndentSaveRequestDto) => Promise<boolean>;
  deleteIndent: (id: number) => Promise<boolean>;
  updateIndentStatus: (id: number, status: boolean) => Promise<boolean>;
  clearCurrentIndent: () => void;
  refreshIndentList: () => Promise<void>;
}

export const useIndentProduct = (): UseIndentProductReturn => {
  const [state, setState] = useState<UseIndentProductState>({
    indentList: [],
    currentIndent: null,
    loading: false,
    error: null,
    totalRecords: 0,
    currentPage: 1,
  });

  const { showAlert } = useAlert();
  const { setLoading } = useLoading();
  const lastFilters = useRef<Partial<FilterDto>>({});

  const updateState = useCallback((updates: Partial<UseIndentProductState>) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: unknown, operation: string) => {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${operation}`;
      console.error(`Indent operation error (${operation}):`, error);

      updateState({
        error: errorMessage,
        loading: false,
      });

      showAlert("Error", errorMessage, "error");
      return errorMessage;
    },
    [updateState, showAlert]
  );

  const fetchIndentList = useCallback(
    async (filters: Partial<FilterDto> = {}) => {
      try {
        updateState({ loading: true, error: null });
        setLoading(true);

        const defaultFilters: FilterDto = {
          dateFilter: DateFilterType.ThisMonth,
          pageIndex: 1,
          pageSize: 50,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
          statusFilter: "",
          ...filters,
        };

        lastFilters.current = defaultFilters;

        const response = await indentService.getAllIndents(defaultFilters);

        if (response.success && response.data) {
          updateState({
            indentList: response.data.items || [],
            totalRecords: response.data.totalCount || 0,
            currentPage: defaultFilters.pageIndex,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(response.errorMessage || "Failed to fetch indent list");
        }
      } catch (error) {
        handleError(error, "fetch indent list");
      } finally {
        setLoading(false);
      }
    },
    [updateState]
  );

  const getIndentById = useCallback(
    async (id: number) => {
      try {
        updateState({ loading: true, error: null });
        setLoading(true);

        const response = await indentService.getIndentById(id);

        if (response.success && response.data) {
          updateState({
            currentIndent: response.data,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(response.errorMessage || "Failed to fetch indent details");
        }
      } catch (error) {
        handleError(error, "fetch indent details");
      } finally {
        setLoading(false);
      }
    },
    [updateState]
  );

  const saveIndent = useCallback(
    async (indentData: IndentSaveRequestDto): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });
        setLoading(true);

        const response = await indentService.saveIndent(indentData);

        if (response.success) {
          updateState({ loading: false, error: null });
          await refreshIndentList();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to save indent");
        }
      } catch (error) {
        handleError(error, "save indent");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [updateState]
  );

  const deleteIndent = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });
        setLoading(true);

        const response = await indentMastService.delete(id);

        if (response.success) {
          updateState({ loading: false, error: null });
          await refreshIndentList();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete indent");
        }
      } catch (error) {
        handleError(error, "delete indent");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [updateState]
  );

  const updateIndentStatus = useCallback(
    async (id: number, status: boolean): Promise<boolean> => {
      try {
        updateState({ loading: true, error: null });
        setLoading(true);

        const response = await indentMastService.updateActiveStatus(id, status);

        if (response.success) {
          updateState({ loading: false, error: null });
          await refreshIndentList();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to update indent status");
        }
      } catch (error) {
        handleError(error, "update indent status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [updateState]
  );

  const clearCurrentIndent = useCallback(() => {
    updateState({ currentIndent: null });
  }, [updateState]);

  const refreshIndentList = useCallback(async () => {
    await fetchIndentList(lastFilters.current);
  }, [fetchIndentList]);

  return {
    ...state,
    fetchIndentList,
    getIndentById,
    saveIndent,
    deleteIndent,
    updateIndentStatus,
    clearCurrentIndent,
    refreshIndentList,
  };
};
