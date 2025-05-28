import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { debounce } from "@/utils/Common/debounceUtils";
import { useNextOfKin } from "../hooks/useNextOfKinForm";
import NextOfKinForm from "../NextOfKinForm/NextOfKinForm";

interface NextOfKinManagerProps {
  pChartID: number;
  pChartCode: string;
  title?: string;
  showStats?: boolean;
  maxHeight?: string;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableActions?: boolean;
  viewOnly?: boolean;
  onNokChange?: (nokList: PatNokDetailsDto[]) => void;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const NextOfKinManager: React.FC<NextOfKinManagerProps> = ({
  pChartID,
  pChartCode,
  title = "Next of Kin Information",
  showStats = false,
  maxHeight = "calc(100vh - 280px)",
  enableSearch = true,
  enableFilters = true,
  enableActions = true,
  viewOnly = false,
  onNokChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");
  const { nokList, isLoading, error, fetchNokList, saveNextOfKin, deleteNextOfKin, stats } = useNextOfKin({
    pChartID,
    pChartCode,
    autoFetch: true,
  });

  const [filters, setFilters] = useState<{
    status: string;
  }>({
    status: "",
  });

  useEffect(() => {
    if (pChartID) {
      fetchNokList(pChartID);
    }
  }, [pChartID, fetchNokList]);

  useEffect(() => {
    if (onNokChange) {
      onNokChange(nokList);
    }
  }, [nokList, onNokChange]);

  const handleRefresh = useCallback(() => {
    fetchNokList(pChartID);
  }, [fetchNokList, pChartID]);

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleAddNew = useCallback(() => {
    if (viewOnly) return;
    setSelectedNok(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, [viewOnly]);

  const handleEdit = useCallback(
    (nok: PatNokDetailsDto) => {
      setSelectedNok(nok);
      setIsViewMode(viewOnly);
      setIsFormOpen(true);
    },
    [viewOnly]
  );

  const handleView = useCallback((nok: PatNokDetailsDto) => {
    setSelectedNok(nok);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (nok: PatNokDetailsDto) => {
      if (viewOnly) return;
      setSelectedNok(nok);
      setIsDeleteConfirmOpen(true);
    },
    [viewOnly]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedNok) return;

    const success = await deleteNextOfKin(selectedNok.pNokID);
    if (success) {
      setIsDeleteConfirmOpen(false);
      setSelectedNok(null);
    }
  }, [selectedNok, deleteNextOfKin]);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedNok(null);
    setIsViewMode(false);
  }, []);

  const handleSave = useCallback(
    async (data: PatNokDetailsDto) => {
      const result = await saveNextOfKin(data);
      if (result.success) {
        handleFormClose();
      }
    },
    [saveNextOfKin, handleFormClose]
  );

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
    });
  }, []);

  const filteredNokList = useMemo(() => {
    if (!nokList.length) return [];

    return nokList.filter((nok) => {
      const fullName = `${nok.pNokFName || ""} ${nok.pNokMName || ""} ${nok.pNokLName || ""}`.trim().toLowerCase();
      const matchesSearch =
        debouncedSearchTerm === "" ||
        fullName.includes(debouncedSearchTerm.toLowerCase()) ||
        nok.pNokRelName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        nok.pAddPhone1?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        nok.pNokTitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && nok.rActiveYN === "Y") || (filters.status === "inactive" && nok.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [nokList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => {
    const currentStats = stats();
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6">Total Records</Typography>
            <Typography variant="h4">{currentStats.total}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6">Active</Typography>
            <Typography variant="h4" color="success.main">
              {currentStats.active}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6">Inactive</Typography>
            <Typography variant="h4" color="error.main">
              {currentStats.inactive}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const columns: Column<PatNokDetailsDto>[] = [
    {
      key: "pNokTitle",
      header: "Title",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
      formatter: (value: string) => value || "-",
    },
    {
      key: "fullName",
      header: "Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      render: (item) => {
        const fullName = `${item.pNokFName || ""} ${item.pNokMName || ""} ${item.pNokLName || ""}`.trim();
        return <Typography variant="body2">{fullName}</Typography>;
      },
    },
    {
      key: "pNokRelName",
      header: "Relationship",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pNokDob",
      header: "Date of Birth",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      render: (item) => <Typography variant="body2">{item.pNokDob ? formatDt(item.pNokDob) : "-"}</Typography>,
    },
    {
      key: "pAddPhone1",
      header: "Phone",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: string) => value || "-",
    },
    {
      key: "address",
      header: "Address",
      visible: true,
      sortable: false,
      filterable: false,
      width: 250,
      render: (item) => {
        const addressParts = [item.pNokDoorNo, item.pNokStreet, item.pNokArea, item.pNokCity, item.pNokState, item.pNokPostcode, item.pNokCountry].filter(Boolean);

        return (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {addressParts.length > 0 ? addressParts.join(", ") : "-"}
          </Typography>
        );
      },
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 120 : gridDensity === "medium" ? 100 : 80,
      formatter: (value: string) => (
        <Chip size={gridDensity === "large" ? "medium" : "small"} color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />
      ),
    },
  ];

  if (enableActions) {
    columns.push({
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 150,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {!viewOnly && (
            <>
              <IconButton
                size="small"
                color="info"
                onClick={() => handleEdit(item)}
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(item)}
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Stack>
      ),
    });
  }

  if (!pChartID) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body1" color="error">
          Patient information is required to manage next of kin details.
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading next of kin information: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {title}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton
                text="Refresh"
                icon={RefreshIcon}
                onClick={handleRefresh}
                color="info"
                variant="outlined"
                size="small"
                disabled={isLoading}
                loadingText="Refreshing..."
                asynchronous={true}
                showLoadingIndicator={true}
              />
              {!viewOnly && <SmartButton text="Add Next of Kin" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />}
            </Stack>
          </Grid>

          {enableSearch && (
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search by name, relationship, or phone"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}

          {enableFilters && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Tooltip title="Filter Next of Kin Records">
                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <DropdownSelect
                    label="Status"
                    name="status"
                    value={filters.status}
                    options={statusOptions}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    size="small"
                    defaultText="All Status"
                  />

                  <Box display="flex" alignItems="center" gap={1}>
                    {Object.values(filters).some(Boolean) && (
                      <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                    )}
                  </Box>
                </Stack>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid
          columns={columns}
          data={filteredNokList}
          maxHeight={maxHeight}
          emptyStateMessage="No next of kin records found"
          loading={isLoading}
          pagination={filteredNokList.length > 10}
          pageSize={10}
          showExportCSV={true}
          showExportPDF={true}
          rowKeyField="pNokID"
        />
      </Paper>

      {isFormOpen && (
        <GenericDialog
          open={isFormOpen}
          onClose={handleFormClose}
          title={isViewMode ? "View Next of Kin Details" : selectedNok ? `Edit Next of Kin - ${selectedNok.pNokFName} ${selectedNok.pNokLName}` : "Add New Next of Kin"}
          maxWidth="lg"
          fullWidth
          showCloseButton
          disableBackdropClick={!isViewMode}
          disableEscapeKeyDown={!isViewMode}
        >
          <NextOfKinForm onSave={handleSave} onCancel={handleFormClose} initialData={selectedNok} pChartID={pChartID} pChartCode={pChartCode} viewOnly={isViewMode} />
        </GenericDialog>
      )}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedNok?.pNokFName} ${selectedNok?.pNokLName}" from next of kin records?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </Box>
  );
};

export default NextOfKinManager;
