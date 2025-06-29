import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { Alert, Box } from "@mui/material";
import React from "react";

interface GenericHistoryListProps<T> {
  admission: any;
  historyList: T[];
  isLoading: boolean;
  error: string | null;
  fetchHistoryList: () => Promise<void>;
  onAddNew: () => void;
  onEdit: (item: T) => void;
  onView: (item: T) => void;
  onDelete: (item: T) => void;
  title: string;
  icon: React.ReactNode;
  columns: Column<T>[];
  idField: keyof T;
  dateField: keyof T;
  descField: keyof T;
  notesField: keyof T;
  activeField: keyof T;
  isMedication: boolean;
}

export const GenericHistoryList = <T extends Record<string, any>>({
  admission,
  historyList,
  isLoading,
  error,
  fetchHistoryList,
  onAddNew,
  title,
  columns,
  idField,
  dateField,
  activeField,
  isMedication = false,
}: GenericHistoryListProps<T>) => {
  const patientHistories = React.useMemo(() => {
    if (!admission) return [];
    if (isMedication) {
      return historyList;
    } else {
      return historyList
        .filter((history) => history.pChartID === admission.ipAdmissionDto.pChartID && history[activeField] === "Y")
        .sort((a, b) => new Date(b[dateField]).getTime() - new Date(a[dateField]).getTime());
    }
  }, [historyList, admission, activeField, dateField]);
  console.log("historyList props:", historyList);

  return (
    <>
      {/* Action buttons */}
      <Box display="flex" justifyContent="flex-end" gap={1} mb={2}>
        <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={fetchHistoryList} asynchronous size="small" />
        <CustomButton variant="contained" icon={AddIcon} text={`Add ${title}`} onClick={onAddNew} color="success" size="small" />
      </Box>

      {/* History List */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {patientHistories.length === 0 && !isLoading ? (
        <Alert severity="info">
          No {title.toLowerCase()} records found for this patient. Click "Add {title}" to create one.
        </Alert>
      ) : (
        <CustomGrid
          columns={columns}
          data={patientHistories}
          loading={isLoading}
          maxHeight="400px"
          emptyStateMessage={`No ${title.toLowerCase()} records found`}
          rowKeyField={idField as string}
          showDensityControls={false}
        />
      )}
    </>
  );
};
