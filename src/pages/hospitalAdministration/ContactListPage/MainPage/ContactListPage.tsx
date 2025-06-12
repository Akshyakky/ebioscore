import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
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
import ContactListForm from "../Form/ContactListForm";
import { useContactList } from "../hooks/useContactListForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ContactListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<ContactMastData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");
  const { contactList, isLoading, error, fetchContactList, deleteContact } = useContactList();

  const [filters, setFilters] = useState<{
    status: string;
    category: string;
    employee: string;
    referral: string;
  }>({
    status: "",
    category: "",
    employee: "",
    referral: "",
  });

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchContactList();
  }, [fetchContactList]);

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
    setSelectedContact(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((contact: ContactMastData) => {
    setSelectedContact(contact);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((contact: ContactMastData) => {
    setSelectedContact(contact);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((contact: ContactMastData) => {
    setSelectedContact(contact);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedContact) return;

    try {
      const success = await deleteContact(selectedContact.conID);

      if (success) {
        showAlert("Success", "Contact deleted successfully", "success");
      } else {
        throw new Error("Failed to delete contact");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete contact", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedContact, deleteContact]);

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
      category: "",
      employee: "",
      referral: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!contactList.length) {
      return {
        totalContacts: 0,
        activeContacts: 0,
        inactiveContacts: 0,
        physicians: 0,
        employees: 0,
        referrals: 0,
      };
    }

    const activeCount = contactList.filter((c) => c.rActiveYN === "Y").length;
    const physicianCount = contactList.filter((c) => c.conCat === "PHY").length;
    const employeeCount = contactList.filter((c) => c.isEmployeeYN === "Y").length;
    const referralCount = contactList.filter((c) => c.isRefferalYN === "Y").length;

    return {
      totalContacts: contactList.length,
      activeContacts: activeCount,
      inactiveContacts: contactList.length - activeCount,
      physicians: physicianCount,
      employees: employeeCount,
      referrals: referralCount,
    };
  }, [contactList]);

  const filteredContacts = useMemo(() => {
    if (!contactList.length) return [];
    return contactList.filter((contact) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        contact.conFName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.conLName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.conCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        contact.conSSNID?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && contact.rActiveYN === "Y") || (filters.status === "inactive" && contact.rActiveYN === "N");
      const matchesCategory = filters.category === "" || contact.conCat === filters.category;
      const matchesEmployee =
        filters.employee === "" || (filters.employee === "yes" && contact.isEmployeeYN === "Y") || (filters.employee === "no" && contact.isEmployeeYN === "N");
      const matchesReferral =
        filters.referral === "" || (filters.referral === "yes" && contact.isRefferalYN === "Y") || (filters.referral === "no" && contact.isRefferalYN === "N");
      return matchesSearch && matchesStatus && matchesCategory && matchesEmployee && matchesReferral;
    });
  }, [contactList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Contacts</Typography>
          <Typography variant="h4">{stats.totalContacts}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeContacts}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveContacts}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Physicians</Typography>
          <Typography variant="h4" color="info.main">
            {stats.physicians}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Employees</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.employees}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Referrals</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.referrals}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<ContactMastData>[] = [
    {
      key: "conCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "conFName",
      header: "First Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value?.toUpperCase() || "-",
    },
    {
      key: "conLName",
      header: "Last Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value?.toUpperCase() || "-",
    },
    {
      key: "conCat",
      header: "Category",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => {
        const categoryMap: { [key: string]: string } = {
          PHY: "Physician",
          SUP: "Supplier",
          MAN: "Manufacturer",
          EMP: "Employee",
          PAT: "Patient",
        };
        return categoryMap[value] || value || "-";
      },
    },
    {
      key: "conGender",
      header: "Gender",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => value || "-",
    },
    {
      key: "isEmployeeYN",
      header: "Employee",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "isRefferalYN",
      header: "Referral",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
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
          Error loading contacts: {error}
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
              Contact List Management
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
              <SmartButton text="Add Contact" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by name, code, or ID"
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
            <Tooltip title="Filter Contacts">
              <Stack direction="row" spacing={2} sx={{ pt: 1, pb: 1 }}>
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
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredContacts} maxHeight="calc(100vh - 280px)" emptyStateMessage="No contacts found" loading={isLoading} />
      </Paper>

      {isFormOpen && <ContactListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedContact} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the contact "${selectedContact?.conFName} ${selectedContact?.conLName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ContactListPage;
