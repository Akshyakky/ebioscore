import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { Box, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import { investigationDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/FormField/FormField";

interface InvestigationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (investigation: investigationDto) => void;
  onEdit?: (investigation: investigationDto) => void;
}

const InvestigationListSearch: React.FC<InvestigationListSearchProps> = ({ open, onClose, onSelect, onEdit }) => {
  const [investigations, setInvestigations] = React.useState<investigationDto[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchInvestigations = async () => {
    setIsLoading(true);
    try {
      debugger;
      const result = await investigationlistService.getAll();
      console.log("Raw API Response:", result);

      if (result.success && result.data) {
        // Data is already in the correct format, use it directly
        setInvestigations(result.data);
        console.log("Set Investigations:", result.data);
      }
    } catch (error) {
      console.error("Error fetching investigations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchInvestigations();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  }, []);

  const handleRowClick = useCallback(
    (investigation: investigationDto) => {
      onSelect(investigation);
      onClose();
    },
    [onSelect, onClose]
  );

  const columns = useMemo<Column<investigationDto>[]>(
    () => [
      {
        key: "invCode",
        header: "Investigation Code",
        visible: true,
        render: (item) => item.lInvMastDto?.invCode || "",
        width: 150,
        sortable: true,
      },
      {
        key: "invName",
        header: "Name",
        visible: true,
        render: (item) => item.lInvMastDto?.invName || "",
        width: 200,
        sortable: true,
      },
      {
        key: "invShortName",
        header: "Short Name",
        visible: true,
        render: (item) => item.lInvMastDto?.invShortName || "",
        width: 150,
        sortable: true,
      },
      {
        key: "invType",
        header: "Type",
        visible: true,
        render: (item) => item.lInvMastDto?.invType || "",
        width: 150,
        sortable: true,
      },
      {
        key: "deptName",
        header: "Department",
        visible: true,
        render: (item) => item.lInvMastDto?.deptName || "",
        width: 150,
        sortable: true,
      },
      {
        key: "methods",
        header: "Methods",
        visible: true,
        render: (item) => item.lInvMastDto?.methods || "",
        width: 150,
        sortable: true,
      },
      {
        key: "status",
        header: "Status",
        visible: true,
        render: (item) => (item.lInvMastDto?.rActiveYN === "Y" ? "Active" : "Inactive"),
        width: 100,
        sortable: true,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(item);
              }}
              color="primary"
              title="Edit Investigation"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [onEdit]
  );

  return (
    <GenericDialog open={open} onClose={onClose} title="Investigation Search List" maxWidth="xl" fullWidth showCloseButton>
      <Box sx={{ p: 2 }}>
        <FormField
          type="text"
          label="Search"
          name="search"
          value={searchTerm}
          onChange={handleSearchChange}
          ControlID="investigationSearch"
          placeholder="Search by Investigation Code, Name, Type, Department"
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
          data={investigations}
          maxHeight="60vh"
          pagination
          pageSize={10}
          onRowClick={handleRowClick}
          searchTerm={searchTerm}
          showExportCSV={false}
          showExportPDF={false}
          selectable={false}
          loading={isLoading}
        />
      </Box>
    </GenericDialog>
  );
};

export default React.memo(InvestigationListSearch);
