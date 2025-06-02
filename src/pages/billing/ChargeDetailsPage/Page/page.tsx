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
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { useChargeDetails } from "../hooks/useChargeDetails";
import ChargeDetailsForm from "../Forms/ChargeDetailForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const chargeTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "consultation", label: "Consultation" },
  { value: "procedure", label: "Procedure" },
  { value: "lab", label: "Laboratory" },
  { value: "radiology", label: "Radiology" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "service", label: "Service" },
];

const ChargeDetailsPages: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedCharge, setSelectedCharge] = useState<ChargeDetailsDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");

  const { chargeDetailsList, isLoading, error, fetchChargeDetailsList, deleteChargeDetails, getChargeDetailsById } = useChargeDetails();

  const [filters, setFilters] = useState<{
    status: string;
    chargeType: string;
    chargeBreak: string;
    doctorShare: string;
  }>({
    status: "",
    chargeType: "",
    chargeBreak: "",
    doctorShare: "",
  });

  // Fetch charge details on initial load
  useEffect(() => {
    fetchChargeDetailsList();
  }, [fetchChargeDetailsList]);

  const handleRefresh = useCallback(() => {
    fetchChargeDetailsList();
  }, [fetchChargeDetailsList]);

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
    setSelectedCharge(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    async (charge: ChargeDetailsDto) => {
      try {
        // Make sure chargeID exists before trying to use it
        const chargeId = charge?.ChargeInfo?.chargeID;
        if (!chargeId) {
          showAlert("Error", "Invalid charge ID", "error");
          return;
        }

        // Fetch complete charge details by ID before opening the form
        const fullChargeDetails = await getChargeDetailsById(chargeId);

        if (fullChargeDetails) {
          setSelectedCharge(fullChargeDetails);
          setIsViewMode(false);
          setIsFormOpen(true);
        } else {
          showAlert("Error", "Failed to fetch charge details", "error");
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch charge details", "error");
      }
    },
    [getChargeDetailsById, showAlert]
  );

  const handleView = useCallback(
    async (charge: ChargeDetailsDto) => {
      try {
        // Make sure chargeID exists before trying to use it
        const chargeId = charge?.ChargeInfo?.chargeID;
        if (!chargeId) {
          showAlert("Error", "Invalid charge ID", "error");
          return;
        }

        // Fetch complete charge details by ID before opening the form
        const fullChargeDetails = await getChargeDetailsById(chargeId);

        if (fullChargeDetails) {
          setSelectedCharge(fullChargeDetails);
          setIsViewMode(true);
          setIsFormOpen(true);
        } else {
          showAlert("Error", "Failed to fetch charge details", "error");
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch charge details", "error");
      }
    },
    [getChargeDetailsById, showAlert]
  );

  const handleDeleteClick = useCallback((charge: ChargeDetailsDto) => {
    setSelectedCharge(charge);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCharge || !selectedCharge.ChargeInfo || !selectedCharge.ChargeInfo.chargeID) {
      showAlert("Error", "Invalid charge selection", "error");
      setIsDeleteConfirmOpen(false);
      return;
    }

    try {
      const success = await deleteChargeDetails(selectedCharge.ChargeInfo.chargeID);

      if (success) {
        showAlert("Success", "Charge details deleted successfully", "success");
      } else {
        throw new Error("Failed to delete charge details");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete charge details", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedCharge, deleteChargeDetails, showAlert]);

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
      chargeType: "",
      chargeBreak: "",
      doctorShare: "",
    });
  }, []);

  const stats = useMemo(() => {
    const defaultStats = {
      totalCharges: 0,
      activeCharges: 0,
      inactiveCharges: 0,
      consultations: 0,
      procedures: 0,
      laboratory: 0,
      radiology: 0,
      pharmacy: 0,
      services: 0,
    };

    if (!chargeDetailsList || !chargeDetailsList.length) {
      return defaultStats;
    }

    // Count only valid records with ChargeInfo
    const validCharges = chargeDetailsList.filter((charge) => charge?.ChargeInfo);

    const activeCount = validCharges.filter((c) => c.ChargeInfo?.rActiveYN === "Y").length;
    const consultationCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "CONS").length;
    const procedureCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "PROC").length;
    const labCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "LAB").length;
    const radioCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "RAD").length;
    const pharmCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "PHAR").length;
    const serviceCount = validCharges.filter((c) => c.ChargeInfo?.chargeType === "SERV").length;

    return {
      totalCharges: validCharges.length,
      activeCharges: activeCount,
      inactiveCharges: validCharges.length - activeCount,
      consultations: consultationCount,
      procedures: procedureCount,
      laboratory: labCount,
      radiology: radioCount,
      pharmacy: pharmCount,
      services: serviceCount,
    };
  }, [chargeDetailsList]);

  const filteredCharges = useMemo(() => {
    if (!chargeDetailsList || !chargeDetailsList.length) return [];

    return chargeDetailsList.filter((charge) => {
      // Skip invalid records
      if (!charge || !charge.ChargeInfo) return false;

      const chargeInfo = charge.ChargeInfo;

      // Search filter
      const matchesSearch =
        debouncedSearchTerm === "" ||
        chargeInfo.chargeCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        chargeInfo.chargeDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        chargeInfo.cShortName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        chargeInfo.cNhsCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "" || (filters.status === "active" && chargeInfo.rActiveYN === "Y") || (filters.status === "inactive" && chargeInfo.rActiveYN === "N");

      // Charge type filter
      const matchesChargeType =
        filters.chargeType === "" ||
        filters.chargeType === "all" ||
        (filters.chargeType === "consultation" && chargeInfo.chargeType === "CONS") ||
        (filters.chargeType === "procedure" && chargeInfo.chargeType === "PROC") ||
        (filters.chargeType === "lab" && chargeInfo.chargeType === "LAB") ||
        (filters.chargeType === "radiology" && chargeInfo.chargeType === "RAD") ||
        (filters.chargeType === "pharmacy" && chargeInfo.chargeType === "PHAR") ||
        (filters.chargeType === "service" && chargeInfo.chargeType === "SERV");

      // Charge break filter
      const matchesChargeBreak =
        filters.chargeBreak === "" || (filters.chargeBreak === "yes" && chargeInfo.chargeBreakYN === "Y") || (filters.chargeBreak === "no" && chargeInfo.chargeBreakYN === "N");

      // Doctor share filter
      const matchesDoctorShare =
        filters.doctorShare === "" || (filters.doctorShare === "yes" && chargeInfo.doctorShareYN === "Y") || (filters.doctorShare === "no" && chargeInfo.doctorShareYN === "N");

      return matchesSearch && matchesStatus && matchesChargeType && matchesChargeBreak && matchesDoctorShare;
    });
  }, [chargeDetailsList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 3 }}>
          <Typography variant="h6">Total Charges</Typography>
          <Typography variant="h4">{stats.totalCharges}</Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 3 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeCharges}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 3 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveCharges}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 3 }}>
          <Typography variant="h6">Types Distribution</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Consultations: ${stats.consultations}`} color="primary" />
            <Chip size="small" label={`Procedures: ${stats.procedures}`} color="secondary" />
            <Chip size="small" label={`Lab: ${stats.laboratory}`} color="info" />
            <Chip size="small" label={`Radiology: ${stats.radiology}`} color="warning" />
            <Chip size="small" label={`Pharmacy: ${stats.pharmacy}`} color="success" />
            <Chip size="small" label={`Services: ${stats.services}`} color="default" />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<ChargeDetailsDto>[] = [
    {
      key: "chargeCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (_, row) => row?.ChargeInfo?.chargeCode || "-",
    },
    {
      key: "chargeDesc",
      header: "Description",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (_, row) => row?.ChargeInfo?.chargeDesc || "-",
    },
    {
      key: "shortName",
      header: "Short Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (_, row) => row?.ChargeInfo?.cShortName || "-",
    },
    {
      key: "chargeType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (_, row) => {
        if (!row?.ChargeInfo) return <Chip size="small" color="default" label="Unknown" />;

        const type = row.ChargeInfo.chargeType;
        let color: "primary" | "secondary" | "info" | "warning" | "success" | "default" = "default";
        let label = type || "Unknown";

        switch (type) {
          case "CONS":
            color = "primary";
            label = "Consultation";
            break;
          case "PROC":
            color = "secondary";
            label = "Procedure";
            break;
          case "LAB":
            color = "info";
            label = "Laboratory";
            break;
          case "RAD":
            color = "warning";
            label = "Radiology";
            break;
          case "PHAR":
            color = "success";
            label = "Pharmacy";
            break;
          case "SERV":
            color = "default";
            label = "Service";
            break;
        }

        return <Chip size="small" color={color} label={label} />;
      },
    },
    {
      key: "chargeTo",
      header: "Charge To",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (_, row) => row?.ChargeInfo?.chargeTo || "-",
    },
    {
      key: "chargeBreak",
      header: "Break",
      visible: true,
      sortable: true,
      filterable: true,
      width: 110,
      formatter: (_, row) => {
        if (!row?.ChargeInfo) return <Chip size="small" color="default" label="Unknown" />;
        return <Chip size="small" color={row.ChargeInfo.chargeBreakYN === "Y" ? "info" : "default"} label={row.ChargeInfo.chargeBreakYN === "Y" ? "Yes" : "No"} />;
      },
    },
    {
      key: "doctorShare",
      header: "Doctor Share",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (_, row) => {
        if (!row?.ChargeInfo) return <Chip size="small" color="default" label="Unknown" />;
        return <Chip size="small" color={row.ChargeInfo.doctorShareYN === "Y" ? "secondary" : "default"} label={row.ChargeInfo.doctorShareYN === "Y" ? "Yes" : "No"} />;
      },
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 120 : gridDensity === "medium" ? 100 : 80,
      formatter: (_, row) => {
        if (!row?.ChargeInfo) return <Chip size="small" color="default" label="Unknown" />;
        return (
          <Chip
            size={gridDensity === "large" ? "medium" : "small"}
            color={row.ChargeInfo.rActiveYN === "Y" ? "success" : "error"}
            label={row.ChargeInfo.rActiveYN === "Y" ? "Active" : "Inactive"}
          />
        );
      },
    },
    {
      key: "details",
      header: "Details",
      visible: true,
      sortable: true,
      filterable: false,
      width: 110,
      formatter: (_, row) => {
        if (!row) return <Chip size="small" label="No data" />;

        const detailsCount = row.ChargeDetails?.length || 0;
        const aliasesCount = row.ChargeAliases?.length || 0;

        return (
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`${detailsCount} detail${detailsCount !== 1 ? "s" : ""}`} />
            <Chip size="small" label={`${aliasesCount} alias${aliasesCount !== 1 ? "es" : ""}`} />
          </Stack>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 170,
      render: (item) => {
        // Skip rendering actions if item is invalid
        if (!item || !item.ChargeInfo) {
          return null;
        }

        return (
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
        );
      },
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading charge details: {error}
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
          <Grid size={{ sm: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Charge Details List
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
              <SmartButton text="Add Charge" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
          <Grid size={{ sm: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by code, description or NHS code"
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
          <Grid size={{ sm: 12, md: 6 }}>
            <Tooltip title="Filter Charges">
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

                <DropdownSelect
                  label="Charge Type"
                  name="chargeType"
                  value={filters.chargeType}
                  options={chargeTypeOptions}
                  onChange={(e) => handleFilterChange("chargeType", e.target.value)}
                  size="small"
                  defaultText="All Types"
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
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid
          columns={columns}
          data={filteredCharges}
          maxHeight="calc(100vh - 280px)"
          emptyStateMessage="No charge details found"
          loading={isLoading}
          density={gridDensity}
          onDensityChange={setGridDensity}
          showDensityControls
        />
      </Paper>

      {isFormOpen && <ChargeDetailsForm open={isFormOpen} onClose={handleFormClose} initialData={selectedCharge} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the charge "${selectedCharge?.ChargeInfo?.chargeDesc || "selected"}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ChargeDetailsPages;
