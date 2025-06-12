import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { AppModifiedMast, AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Divider, Grid, IconButton, InputAdornment, Paper, Stack, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppModifiedFieldForm from "../Form/AppModifiedListForm";
import AppModifiedMasterForm from "../Form/AppModifiedMastForm";
import { useAppModifiedList } from "../hooks/useAppModifiedList";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const AppModifiedListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMaster, setSelectedMaster] = useState<AppModifiedMast | null>(null);
  const [selectedField, setSelectedField] = useState<AppModifyFieldDto | null>(null);
  const [selectedMasterForFields, setSelectedMasterForFields] = useState<AppModifiedMast | null>(null);
  const [isMasterFormOpen, setIsMasterFormOpen] = useState(false);
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "master" | "field"; item: AppModifiedMast | AppModifyFieldDto } | null>(null);
  const { masterList, fieldsList, isLoading, error, fetchMasterList, fetchFieldsList, deleteMaster, deleteField } = useAppModifiedList();
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");
  const [filters, setFilters] = useState<{
    status: string;
  }>({
    status: "",
  });

  useEffect(() => {
    fetchMasterList();
  }, [fetchMasterList]);

  useEffect(() => {
    if (selectedMasterForFields) {
      fetchFieldsList(selectedMasterForFields.fieldCode);
    }
  }, [selectedMasterForFields, fetchFieldsList]);

  const handleRefresh = useCallback(() => {
    if (currentTab === 0) {
      fetchMasterList();
    } else {
      if (selectedMasterForFields) {
        fetchFieldsList(selectedMasterForFields.fieldCode);
      }
    }
  }, [currentTab, fetchMasterList, fetchFieldsList, selectedMasterForFields]);

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

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const handleAddMaster = useCallback(() => {
    setSelectedMaster(null);
    setIsViewMode(false);
    setIsMasterFormOpen(true);
  }, []);

  const handleEditMaster = useCallback((master: AppModifiedMast) => {
    setSelectedMaster(master);
    setIsViewMode(false);
    setIsMasterFormOpen(true);
  }, []);

  const handleViewMaster = useCallback((master: AppModifiedMast) => {
    setSelectedMaster(master);
    setIsViewMode(true);
    setIsMasterFormOpen(true);
  }, []);

  const handleSelectMasterForFields = useCallback(
    (master: AppModifiedMast) => {
      setSelectedMasterForFields(master);
      setCurrentTab(1);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      debouncedSearch.cancel();
    },
    [debouncedSearch]
  );

  const handleAddField = useCallback(() => {
    if (!selectedMasterForFields) {
      showAlert("Warning", "Please select a List Master first", "warning");
      return;
    }
    setSelectedField(null);
    setIsViewMode(false);
    setIsFieldFormOpen(true);
  }, [selectedMasterForFields]);

  const handleEditField = useCallback((field: AppModifyFieldDto) => {
    setSelectedField(field);
    setIsViewMode(false);
    setIsFieldFormOpen(true);
  }, []);

  const handleViewField = useCallback((field: AppModifyFieldDto) => {
    setSelectedField(field);
    setIsViewMode(true);
    setIsFieldFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((type: "master" | "field", item: AppModifiedMast | AppModifyFieldDto) => {
    setDeleteTarget({ type, item });
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      let success = false;

      if (deleteTarget.type === "master") {
        success = await deleteMaster((deleteTarget.item as AppModifiedMast).fieldID);
        if (success) {
          fetchMasterList();
        }
      } else {
        success = await deleteField((deleteTarget.item as AppModifyFieldDto).amlID);
        if (success && selectedMasterForFields) {
          fetchFieldsList(selectedMasterForFields.fieldCode);
        }
      }
    } catch (error) {
      showAlert("Error", `Failed to delete ${deleteTarget.type}`, "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteMaster, deleteField, fetchMasterList, fetchFieldsList, selectedMasterForFields]);

  const handleMasterFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsMasterFormOpen(false);
      if (refreshData) {
        fetchMasterList();
      }
    },
    [fetchMasterList]
  );

  const handleFieldFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFieldFormOpen(false);
      if (refreshData && selectedMasterForFields) {
        fetchFieldsList(selectedMasterForFields.fieldCode);
      }
    },
    [fetchFieldsList, selectedMasterForFields]
  );

  const handleSearchSelect = useCallback((master: AppModifiedMast) => {
    setSelectedMasterForFields(master);
    setCurrentTab(1);
  }, []);

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

  const masterStats = useMemo(() => {
    if (!masterList.length) {
      return { total: 0, active: 0, inactive: 0 };
    }
    const active = masterList.filter((m) => m.rActiveYN === "Y").length;
    return {
      total: masterList.length,
      active,
      inactive: masterList.length - active,
    };
  }, [masterList]);

  const fieldStats = useMemo(() => {
    if (!fieldsList.length) {
      return { total: 0, active: 0, inactive: 0, defaultFields: 0, modifiableFields: 0 };
    }
    const active = fieldsList.filter((f) => f.rActiveYN === "Y").length;
    const defaultFields = fieldsList.filter((f) => f.defaultYN === "Y").length;
    const modifiableFields = fieldsList.filter((f) => f.modifyYN === "Y").length;

    return {
      total: fieldsList.length,
      active,
      inactive: fieldsList.length - active,
      defaultFields,
      modifiableFields,
    };
  }, [fieldsList]);

  const filteredMasters = useMemo(() => {
    if (!masterList.length) return [];
    return masterList.filter((master) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        master.fieldName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        master.fieldCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        master.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && master.rActiveYN === "Y") || (filters.status === "inactive" && master.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [masterList, debouncedSearchTerm, filters]);

  const filteredFields = useMemo(() => {
    if (!fieldsList.length) return [];
    return fieldsList.filter((field) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        field.amlName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        field.amlCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        field.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && field.rActiveYN === "Y") || (filters.status === "inactive" && field.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [fieldsList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        {currentTab === 0 ? (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6">Total List Masters </Typography>
              <Typography variant="h4">{masterStats.total}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6">Active</Typography>
              <Typography variant="h4" color="success.main">
                {masterStats.active}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h6">Inactive</Typography>
              <Typography variant="h4" color="error.main">
                {masterStats.inactive}
              </Typography>
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="h6">Total List Details </Typography>
              <Typography variant="h4">{fieldStats.total}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="h6">Active</Typography>
              <Typography variant="h4" color="success.main">
                {fieldStats.active}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="h6">Inactive</Typography>
              <Typography variant="h4" color="error.main">
                {fieldStats.inactive}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="h6">Default</Typography>
              <Typography variant="h4" color="info.main">
                {fieldStats.defaultFields}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Typography variant="h6">Modifiable</Typography>
              <Typography variant="h4" color="warning.main">
                {fieldStats.modifiableFields}
              </Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );

  const masterColumns: Column<AppModifiedMast>[] = [
    {
      key: "fieldCode",
      header: "Field Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "fieldName",
      header: "Field Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "auGrpID",
      header: "Module ID",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
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
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 200,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewMaster(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleEditMaster(item)}
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
            onClick={() => handleDeleteClick("master", item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <SmartButton text="List Details" onClick={() => handleSelectMasterForFields(item)} variant="outlined" size="small" color="secondary" />
        </Stack>
      ),
    },
  ];

  const fieldColumns: Column<AppModifyFieldDto>[] = [
    {
      key: "amlCode",
      header: "Field Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "amlName",
      header: "Field Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "amlField",
      header: "Category",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 170,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewField(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleEditField(item)}
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
            onClick={() => handleDeleteClick("field", item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading data: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="List Master" />
            <Tab label="List Details " />
          </Tabs>
        </Box>

        {currentTab === 1 && selectedMasterForFields && (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected List Master Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Field Code:
                  </Typography>
                  <Typography variant="body1">{selectedMasterForFields.fieldCode}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Field Name:
                  </Typography>
                  <Typography variant="body1">{selectedMasterForFields.fieldName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    size="small"
                    color={selectedMasterForFields.rActiveYN === "Y" ? "success" : "error"}
                    label={selectedMasterForFields.rActiveYN === "Y" ? "Active" : "Inactive"}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                {currentTab === 0 ? "List Master " : `List Details for: ${selectedMasterForFields?.fieldName || "Select List Master"}`}
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
                <SmartButton
                  text={currentTab === 0 ? "Add List Master" : "Add List Details"}
                  icon={AddIcon}
                  onClick={currentTab === 0 ? handleAddMaster : handleAddField}
                  color="primary"
                  variant="contained"
                  size="small"
                  disabled={currentTab === 1 && !selectedMasterForFields}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder={currentTab === 0 ? "Search List Master..." : "Search List Details ..."}
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
            <Grid size={{ xs: 12, md: 8 }}>
              <Tooltip title="Filter Data">
                <Stack direction="row" spacing={2} sx={{ pb: 1, pt: 1 }}>
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
          </Grid>

          <CustomGrid columns={masterColumns} data={filteredMasters} maxHeight="calc(100vh - 400px)" emptyStateMessage="No List Master  found" loading={isLoading} />
        </Paper>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                {currentTab === 0 ? "List Master " : `List Details for: ${selectedMasterForFields?.fieldName || "Select List Master"}`}
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
                <SmartButton
                  text={currentTab === 0 ? "Add List Master" : "Add List Details"}
                  icon={AddIcon}
                  onClick={currentTab === 0 ? handleAddMaster : handleAddField}
                  color="primary"
                  variant="contained"
                  size="small"
                  disabled={currentTab === 1 && !selectedMasterForFields}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder={currentTab === 0 ? "Search List Master..." : "Search List Details ..."}
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
            <Grid size={{ xs: 12, md: 8 }}>
              <Tooltip title="Filter Data">
                <Stack direction="row" spacing={2} sx={{ pb: 1, pt: 1 }}>
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
          </Grid>

          <CustomGrid
            columns={fieldColumns}
            data={filteredFields}
            maxHeight="calc(100vh - 400px)"
            emptyStateMessage={selectedMasterForFields ? "No List details found for this List Master" : "Please select a List Master first"}
            loading={isLoading}
          />
        </Paper>
      </TabPanel>

      {isMasterFormOpen && <AppModifiedMasterForm open={isMasterFormOpen} onClose={handleMasterFormClose} initialData={selectedMaster} viewOnly={isViewMode} />}

      {isFieldFormOpen && (
        <AppModifiedFieldForm
          open={isFieldFormOpen}
          onClose={handleFieldFormClose}
          initialData={selectedField}
          categoryCode={selectedMasterForFields?.fieldCode || ""}
          viewOnly={isViewMode}
        />
      )}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${deleteTarget?.type}?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default AppModifiedListPage;
