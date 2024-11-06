import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Box, IconButton, CircularProgress, InputAdornment } from "@mui/material";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import FormField from "../../../../components/FormField/FormField";
import { useLoading } from "../../../../context/LoadingContext";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { showAlert } from "../../../../utils/Common/showAlert";
import { format } from "date-fns";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

interface AdmissionListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (admission: AdmissionDto) => void;
}

const AdmissionListSearch: React.FC<AdmissionListSearchProps> = ({ open, onClose, onSelect }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setLoading } = useLoading();

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset on dialog close
  useEffect(() => {
    if (!open) {
      setLocalSearchTerm("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      // Focus search input when dialog opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Fetch admissions
  useEffect(() => {
    const fetchAdmissions = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const response = await extendedAdmissionService.getCurrentAdmissions();
        if (!response.success || !response.data) {
          throw new Error("Failed to fetch admissions");
        }
        setAdmissions(response.data);
      } catch (error) {
        console.error("Error fetching admissions:", error);
        showAlert("Error", "Failed to fetch admissions data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, [open, setLoading]);

  // Search handler with performance optimization
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Optimized search function
  const getFilteredData = useCallback((data: AdmissionDto[], searchTerm: string) => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase().trim();
    return data.filter((admission) => {
      const ipAdmission = admission.ipAdmissionDto;
      const bedDetails = admission.wrBedDetailsDto;

      const searchFields = [
        ipAdmission?.admitCode,
        ipAdmission?.pChartCode,
        ipAdmission?.pfName,
        ipAdmission?.plName,
        ipAdmission?.pTitle,
        ipAdmission?.deptName,
        bedDetails?.rGrpName,
        bedDetails?.bedName,
      ];

      return searchFields.some((field) => field?.toLowerCase().includes(searchLower));
    });
  }, []);

  // Memoized filtered data
  const filteredData = useMemo(() => getFilteredData(admissions, localSearchTerm), [admissions, localSearchTerm, getFilteredData]);

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
          value={localSearchTerm}
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
            endAdornment: localSearchTerm && (
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
          data={filteredData}
          maxHeight="60vh"
          pagination
          pageSize={10}
          onRowClick={(item) => {
            onSelect(item);
            onClose();
          }}
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
