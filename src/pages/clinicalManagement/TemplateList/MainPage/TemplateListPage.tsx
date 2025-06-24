import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { TemplateMastDto } from "@/interfaces/ClinicalManagement/TemplateDto";
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
import { Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TemplateListForm from "../Form/TemplateListForm";
import { useTemplateMast } from "../hooks/useTemplateList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const displayOptions = [
  { value: "all", label: "All Users" },
  { value: "me", label: "Only Me" },
  { value: "custom", label: "Specific Users" },
];

const typeOptions = [
  { value: "clinical", label: "Clinical" },
  { value: "administrative", label: "Administrative" },
  { value: "report", label: "Report" },
  { value: "other", label: "Other" },
];

const TemplateListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMastDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { templateList, isLoading, error, fetchTemplateList, deleteTemplate } = useTemplateMast();

  const [filters, setFilters] = useState<{
    status: string;
    display: string;
    type: string;
  }>({
    status: "",
    display: "",
    type: "",
  });

  const handleRefresh = useCallback(() => {
    fetchTemplateList();
  }, [fetchTemplateList]);

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
    setSelectedTemplate(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((template: TemplateMastDto) => {
    setSelectedTemplate(template);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((template: TemplateMastDto) => {
    setSelectedTemplate(template);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((template: TemplateMastDto) => {
    setSelectedTemplate(template);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTemplate) return;

    try {
      const success = await deleteTemplate(selectedTemplate.templateID);

      if (success) {
        showAlert("Success", "Template deleted successfully", "success");
      } else {
        throw new Error("Failed to delete template");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete template", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedTemplate, deleteTemplate]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
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
      display: "",
      type: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!templateList.length) {
      return {
        totalTemplates: 0,
        activeTemplates: 0,
        inactiveTemplates: 0,
        allUsersTemplates: 0,
        privateTemplates: 0,
        customTemplates: 0,
      };
    }

    const activeCount = templateList.filter((t) => t.rActiveYN === "Y").length;
    const allUsersCount = templateList.filter((t) => t.displayAllUsers === "Y").length;
    const privateCount = templateList.filter((t) => t.displayAllUsers === "N").length;
    const customCount = templateList.filter((t) => t.displayAllUsers === "C").length;

    return {
      totalTemplates: templateList.length,
      activeTemplates: activeCount,
      inactiveTemplates: templateList.length - activeCount,
      allUsersTemplates: allUsersCount,
      privateTemplates: privateCount,
      customTemplates: customCount,
    };
  }, [templateList]);

  // Apply filters to the list
  const filteredTemplates = useMemo(() => {
    if (!templateList.length) return [];

    return templateList.filter((template) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        template.templateName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        template.templateCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        template.templateDescription?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        template.templateType?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        template.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && template.rActiveYN === "Y") || (filters.status === "inactive" && template.rActiveYN === "N");

      const matchesDisplay =
        filters.display === "" ||
        (filters.display === "all" && template.displayAllUsers === "Y") ||
        (filters.display === "me" && template.displayAllUsers === "N") ||
        (filters.display === "custom" && template.displayAllUsers === "C");

      const matchesType = filters.type === "" || template.templateType?.toLowerCase() === filters.type.toLowerCase();

      return matchesSearch && matchesStatus && matchesDisplay && matchesType;
    });
  }, [templateList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Templates</Typography>
          <Typography variant="h4">{stats.totalTemplates}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeTemplates}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveTemplates}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">All Users</Typography>
          <Typography variant="h4" color="info.main">
            {stats.allUsersTemplates}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Private</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.privateTemplates}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Custom</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.customTemplates}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const getDisplayLabel = (value: string) => {
    switch (value) {
      case "Y":
        return "All Users";
      case "N":
        return "Only Me";
      case "C":
        return "Specific Users";
      default:
        return "-";
    }
  };

  const getDisplayColor = (value: string): "success" | "warning" | "info" => {
    switch (value) {
      case "Y":
        return "success";
      case "N":
        return "warning";
      case "C":
        return "info";
      default:
        return "info";
    }
  };

  const columns: Column<TemplateMastDto>[] = [
    {
      key: "templateCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "templateName",
      header: "Template Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "templateType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "templateDescription",
      header: "Description",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      formatter: (value: any) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
    },
    {
      key: "displayAllUsers",
      header: "Visibility",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => <Chip size="small" color={getDisplayColor(value)} label={getDisplayLabel(value)} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (value: any) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
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
            onClick={() => handleView(item)}
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
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading templates: {error}
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
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Template List
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
              <SmartButton text="Add Template" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name, type, or description"
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
            <Tooltip title="Filter Templates">
              <Stack direction="row" spacing={2}>
                <DropdownSelect
                  label="Status"
                  name="status"
                  value={filters.status}
                  options={statusOptions}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  size="small"
                  defaultText="All Status"
                />

                <DropdownSelect
                  label="Visibility"
                  name="display"
                  value={filters.display}
                  options={displayOptions}
                  onChange={(e) => handleFilterChange("display", e.target.value)}
                  size="small"
                  defaultText="All Visibility"
                />

                <DropdownSelect
                  label="Type"
                  name="type"
                  value={filters.type}
                  options={typeOptions}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.display || filters.type) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredTemplates} maxHeight="calc(100vh - 280px)" emptyStateMessage="No templates found" loading={isLoading} />
      </Paper>

      {isFormOpen && <TemplateListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedTemplate} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the template "${selectedTemplate?.templateName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default TemplateListPage;
