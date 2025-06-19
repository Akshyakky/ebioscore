import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
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
import UserListForm from "../Form/UserListForm";
import { useUserList } from "../hooks/useUserList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const adminOptions = [
  { value: "Y", label: "Super User" },
  { value: "N", label: "Regular User" },
];

const UserListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { isLoading, error, fetchUsersList, deleteUserList, userList } = useUserList();
  const { showAlert } = useAlert();

  const [filters, setFilters] = useState<{
    status: string;
    adminUser: string;
  }>({
    status: "",
    adminUser: "",
  });

  const handleRefresh = useCallback(() => {
    fetchUsersList();
  }, [fetchUsersList]);

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
    setSelectedUser(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((user: UserListDto) => {
    setSelectedUser(user);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((user: UserListDto) => {
    setSelectedUser(user);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((user: UserListDto) => {
    setSelectedUser(user);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const success = await deleteUserList(selectedUser.appID);

      if (success) {
        showAlert("Success", "User deleted successfully", "success");
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete user", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedUser, deleteUserList]);

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
      adminUser: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!userList.length) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
      };
    }

    const activeCount = userList.filter((u) => u.rActiveYN === "Y").length;
    const adminCount = userList.filter((u) => u.adminUserYN === "Y").length;

    return {
      totalUsers: userList.length,
      activeUsers: activeCount,
      inactiveUsers: userList.length - activeCount,
      adminUsers: adminCount,
    };
  }, [userList]);

  const filteredUsers = useMemo(() => {
    if (!userList.length) return [];
    return userList.filter((user) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        user.appUserName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.appCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && user.rActiveYN === "Y") || (filters.status === "inactive" && user.rActiveYN === "N");

      const matchesAdminStatus = filters.adminUser === "" || filters.adminUser === user.adminUserYN;

      return matchesSearch && matchesStatus && matchesAdminStatus;
    });
  }, [userList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Total Users</Typography>
          <Typography variant="h4">{stats.totalUsers}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeUsers}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveUsers}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Super Users</Typography>
          <Typography variant="h4" color="info.main">
            {stats.adminUsers}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<UserListDto>[] = [
    {
      key: "appCode",
      header: "Username",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "appUserName",
      header: "Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "appUcatType",
      header: "User Category",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "profileName",
      header: "Profile",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "adminUserYN",
      header: "Super User",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "info"} label={value === "Y" ? "Super User" : "Regular User"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
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
          Error loading users: {error}
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
              User Management
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
              <SmartButton text="Add User" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by username, name or notes"
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
            <Tooltip title="Filter Users">
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
                  label="User Type"
                  name="adminUser"
                  value={filters.adminUser}
                  options={adminOptions}
                  onChange={(e) => handleFilterChange("adminUser", e.target.value)}
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
        <CustomGrid columns={columns} data={filteredUsers} maxHeight="calc(100vh - 280px)" emptyStateMessage="No users found" loading={isLoading} />
      </Paper>

      {isFormOpen && <UserListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedUser} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the user "${selectedUser?.appUserName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default UserListPage;
