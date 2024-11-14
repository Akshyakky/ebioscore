import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { Box, IconButton, InputAdornment, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { format } from "date-fns";

import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import FormField from "../../../../components/FormField/FormField";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { selectFilteredAdmissions, selectIsLoading, selectSearchTerm } from "@/store/features/admission/admissionSearch/admissionSelectors";
import { clearSearch, fetchCurrentAdmissions, resetAdmissionSearch, setSearchTerm } from "@/store/features/admission/admissionSearch/admissionSearchSlice";

interface AdmissionListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (admission: AdmissionDto) => void;
}

const AdmissionListSearch: React.FC<AdmissionListSearchProps> = ({ open, onClose, onSelect }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredAdmissions = useAppSelector(selectFilteredAdmissions);
  const searchTerm = useAppSelector(selectSearchTerm);
  const isLoading = useAppSelector(selectIsLoading);

  // Load admissions when dialog opens
  useEffect(() => {
    if (open) {
      void dispatch(fetchCurrentAdmissions());
      // Focus search input when dialog opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      dispatch(resetAdmissionSearch());
    }
  }, [open, dispatch]);

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchTerm(e.target.value));
    },
    [dispatch]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    dispatch(clearSearch());
    searchInputRef.current?.focus();
  }, [dispatch]);

  // Handle row selection
  const handleRowClick = useCallback(
    (admission: AdmissionDto) => {
      onSelect(admission);
      onClose();
    },
    [onSelect, onClose]
  );

  // Memoized columns configuration
  const columns = useMemo<Column<AdmissionDto>[]>(
    () => [
      {
        key: "admitCode",
        header: "Admission No",
        visible: true,
        render: (item) => item.ipAdmissionDto?.admitCode || "",
        width: 150,
        sortable: true,
      },
      {
        key: "pChartCode",
        header: "UHID",
        visible: true,
        render: (item) => item.ipAdmissionDto?.pChartCode || "",
        width: 120,
        sortable: true,
      },
      {
        key: "patientName",
        header: "Patient Name",
        visible: true,
        render: (item) => {
          const { pTitle, pfName, plName } = item.ipAdmissionDto || {};
          return [pTitle, pfName, plName].filter(Boolean).join(" ") || "";
        },
        width: 200,
        sortable: true,
      },
      {
        key: "admitDate",
        header: "Admission Date",
        visible: true,
        render: (item) => (item.ipAdmissionDto?.admitDate ? format(new Date(item.ipAdmissionDto.admitDate), "dd/MM/yyyy HH:mm") : ""),
        width: 150,
        sortable: true,
      },
      {
        key: "ward",
        header: "Ward",
        visible: true,
        render: (item) => item.wrBedDetailsDto?.rGrpName ?? "",
        width: 150,
        sortable: true,
      },
      {
        key: "bed",
        header: "Bed",
        visible: true,
        render: (item) => item.wrBedDetailsDto?.bedName ?? "",
        width: 100,
        sortable: true,
      },
      {
        key: "department",
        header: "Department",
        visible: true,
        render: (item) => item.ipAdmissionDto?.deptName ?? "",
        width: 150,
        sortable: true,
      },
    ],
    []
  );

  return (
    <GenericDialog open={open} onClose={onClose} title="Current Admissions" maxWidth="xl" fullWidth showCloseButton>
      <Box sx={{ p: 2 }}>
        <FormField
          type="text"
          label="Search"
          name="search"
          value={searchTerm}
          onChange={handleSearchChange}
          ControlID="admissionSearch"
          placeholder="Search by Admission No, UHID, Patient Name, Department, Ward or Bed"
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          InputProps={{
            inputRef: searchInputRef,
            sx: { mb: 2 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small" aria-label="clear search">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <CustomGrid
          columns={columns}
          data={filteredAdmissions}
          maxHeight="60vh"
          pagination
          pageSize={10}
          onRowClick={handleRowClick}
          searchTerm=""
          showExportCSV={false}
          showExportPDF={false}
          selectable={false}
        />
      </Box>
    </GenericDialog>
  );
};

export default React.memo(AdmissionListSearch);
