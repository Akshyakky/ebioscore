// src\pages\inventoryManagement\CommonPage\BatchSelectionDialog\useBatchSelection.tsx
import { BillProductsDto } from "@/interfaces/Billing/BillingDto";
import { useAlert } from "@/providers/AlertProvider";
import { useCallback, useState } from "react";

interface BatchSelectionState {
  isDialogOpen: boolean;
  availableBatches: BillProductsDto[];
  selectedBatch: BillProductsDto | null;
  isLoading: boolean;
}

interface UseBatchSelectionReturn {
  isDialogOpen: boolean;
  availableBatches: BillProductsDto[];
  selectedBatch: BillProductsDto | null;
  isLoading: boolean;
  openDialog: (batches: BillProductsDto[]) => void;
  closeDialog: () => void;
  handleBatchSelect: (batch: BillProductsDto) => void;
  clearSelection: () => void;
}

const useBatchSelection = (): UseBatchSelectionReturn => {
  const { showAlert } = useAlert();
  const [state, setState] = useState<BatchSelectionState>({
    isDialogOpen: false,
    availableBatches: [],
    selectedBatch: null,
    isLoading: false,
  });

  const openDialog = useCallback(
    (batches: BillProductsDto[]) => {
      if (!batches || batches.length === 0) {
        showAlert("Warning", "No batches available for this product", "warning");
        return;
      }

      setState((prev) => ({
        ...prev,
        availableBatches: batches,
        isDialogOpen: true,
        selectedBatch: null,
      }));
    },
    [showAlert]
  );

  const closeDialog = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDialogOpen: false,
      selectedBatch: null,
      availableBatches: [],
    }));
  }, []);

  const handleBatchSelect = useCallback((batch: BillProductsDto) => {
    setState((prev) => ({
      ...prev,
      selectedBatch: batch,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedBatch: null,
    }));
  }, []);

  return {
    isDialogOpen: state.isDialogOpen,
    availableBatches: state.availableBatches,
    selectedBatch: state.selectedBatch,
    isLoading: state.isLoading,
    openDialog,
    closeDialog,
    handleBatchSelect,
    clearSelection,
  };
};

export default useBatchSelection;
