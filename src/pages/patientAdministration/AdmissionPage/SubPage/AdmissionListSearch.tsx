import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Box, IconButton } from "@mui/material";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import FormField from "../../../../components/FormField/FormField";
import { useLoading } from "../../../../context/LoadingContext";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { showAlert } from "../../../../utils/Common/showAlert";
import { format } from "date-fns";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";
import ClearIcon from "@mui/icons-material/Clear";

interface AdmissionListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (admission: AdmissionDto) => void;
}

const AdmissionListSearch: React.FC<AdmissionListSearchProps> = ({ open, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([]);
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchAdmissionData = async () => {
      if (!open) return;

      try {
        setLoading(true);
        const response = await extendedAdmissionService.getCurrentAdmissions();

        if (!response.success || !response.data) {
          showAlert("Error", "Failed to fetch admissions", "error");
          return;
        }

        setAdmissions(response.data);
      } catch (error) {
        console.error("Error fetching admissions:", error);
        showAlert("Error", "An error occurred while fetching admissions", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissionData();
  }, [open, setLoading]);

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setAdmissions([]);
    }
  }, [open]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  const columns: Column<AdmissionDto>[] = [
    {
      key: "admitCode",
      header: "Admission No",
      visible: true,
      render: (item) => item.ipAdmissionDto?.admitCode || "",
      width: 150,
      sortable: true,
      filterable: true,
    },
    {
      key: "pChartCode",
      header: "UHID",
      visible: true,
      render: (item) => item.ipAdmissionDto?.pChartCode || "",
      width: 120,
      sortable: true,
      filterable: true,
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
      filterable: true,
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
  ];

  const searchAdmission = useCallback((admission: AdmissionDto, term: string): boolean => {
    if (!term) return true;

    const searchLower = term.toLowerCase().trim();

    // Extract all searchable values
    const searchValues = [
      admission.ipAdmissionDto?.admitCode || "", // Admission No
      admission.ipAdmissionDto?.pChartCode || "", // UHID
      [admission.ipAdmissionDto?.pTitle || "", admission.ipAdmissionDto?.pfName || "", admission.ipAdmissionDto?.plName || ""].join(" ").trim(), // Patient Name
      admission.wrBedDetailsDto?.rGrpName || "", // Ward
      admission.wrBedDetailsDto?.bedName || "", // Bed
      admission.ipAdmissionDto?.deptName || "", // Department
    ];

    // Check if any value includes the search term
    return searchValues.some((value) => value.toLowerCase().includes(searchLower));
  }, []);

  const filteredData = useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return admissions;

    return admissions.filter((admission) => searchAdmission(admission, trimmedSearchTerm));
  }, [admissions, searchTerm, searchAdmission]);

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Current Admissions"
      maxWidth="xl"
      fullWidth
      showCloseButton
      titleSx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
    >
      <Box sx={{ p: 2 }}>
        <FormField
          type="text"
          label="Search"
          name="search"
          value={searchTerm}
          onChange={handleSearch}
          ControlID="admissionSearch"
          placeholder="Search by Admission No, UHID, Patient Name, Department, Ward or Bed"
          size="small"
          gridProps={{ xs: 12, sm: 6, md: 4 }}
          InputProps={{
            sx: { mb: 2 },
            autoFocus: true, // Add autofocus
            // Add clear button
            endAdornment: searchTerm ? (
              <IconButton size="small" onClick={() => setSearchTerm("")} edge="end">
                <ClearIcon />
              </IconButton>
            ) : null,
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
          searchTerm={searchTerm}
          showExportCSV={false}
          showExportPDF={false}
          selectable={false}
        />
      </Box>
    </GenericDialog>
  );
};

export default React.memo(AdmissionListSearch);
