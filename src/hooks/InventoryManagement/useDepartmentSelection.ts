import { useAlert } from "@/providers/AlertProvider";
import { useCallback, useState } from "react";

interface DepartmentSelectionState {
  deptId: number;
  deptName: string;
  isDialogOpen: boolean;
  isDepartmentSelected: boolean;
}

interface UseDepartmentSelectionReturn {
  deptId: number;
  deptName: string;
  isDialogOpen: boolean;
  isDepartmentSelected: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  handleDepartmentSelect: (deptId: number, deptName: string) => void;
  requireDepartmentSelection: (callback: () => void) => void;
}

const useDepartmentSelection = (initialState?: Partial<DepartmentSelectionState>): UseDepartmentSelectionReturn => {
  const { showAlert } = useAlert();
  const [state, setState] = useState<DepartmentSelectionState>({
    deptId: initialState?.deptId || 0,
    deptName: initialState?.deptName || "",
    isDialogOpen: initialState?.isDialogOpen || false,
    isDepartmentSelected: initialState?.isDepartmentSelected || false,
  });

  const openDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isDialogOpen: true }));
  }, []);

  const closeDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isDialogOpen: false }));
  }, []);

  const handleDepartmentSelect = useCallback((deptId: number, deptName: string) => {
    setState((prev) => ({
      ...prev,
      deptId,
      deptName,
      isDepartmentSelected: true,
    }));
  }, []);

  const requireDepartmentSelection = useCallback(
    (callback: () => void) => {
      if (!state.isDepartmentSelected) {
        showAlert("Warning", "Please select a department first.", "warning");
        openDialog();
        return;
      }
      callback();
    },
    [state.isDepartmentSelected, openDialog]
  );

  return {
    deptId: state.deptId,
    deptName: state.deptName,
    isDialogOpen: state.isDialogOpen,
    isDepartmentSelected: state.isDepartmentSelected,
    openDialog,
    closeDialog,
    handleDepartmentSelect,
    requireDepartmentSelection,
  };
};

export default useDepartmentSelection;
