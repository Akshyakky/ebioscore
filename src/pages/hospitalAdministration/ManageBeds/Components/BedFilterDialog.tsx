// src/pages/hospitalAdministration/ManageBeds/Components/BedFilterDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Box, Typography, Grid, Divider, TextField, InputAdornment, Chip, Stack } from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";

interface BedFilters {
  roomGroupId?: number;
  roomId?: number;
  departmentId?: number;
  bedStatus?: string;
  availability?: "all" | "available" | "occupied" | "blocked" | "maintenance";
}

interface BedFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: BedFilters) => void;
  filters: BedFilters;
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

interface FilterFormData {
  roomGroupId: number;
  roomId: number;
  departmentId: number;
  bedStatus: string;
  availability: string;
}

const BedFilterDialog: React.FC<BedFilterDialogProps> = ({ open, onClose, onApply, filters, rooms, roomGroups, searchTerm, onSearchChange }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Form setup
  const { control, handleSubmit, reset, watch, setValue } = useForm<FilterFormData>({
    defaultValues: {
      roomGroupId: 0,
      roomId: 0,
      departmentId: 0,
      bedStatus: "",
      availability: "all",
    },
  });

  // Watch for room group changes to filter rooms
  const selectedRoomGroupId = watch("roomGroupId");

  // Initialize form with current filters
  useEffect(() => {
    if (open) {
      reset({
        roomGroupId: filters.roomGroupId || 0,
        roomId: filters.roomId || 0,
        departmentId: filters.departmentId || 0,
        bedStatus: filters.bedStatus || "",
        availability: filters.availability || "all",
      });
      setLocalSearchTerm(searchTerm);
    }
  }, [open, filters, searchTerm, reset]);

  // Clear room selection when room group changes
  useEffect(() => {
    if (selectedRoomGroupId) {
      setValue("roomId", 0);
    }
  }, [selectedRoomGroupId, setValue]);

  // Prepare options for dropdowns
  const roomGroupOptions = useMemo(() => {
    return roomGroups.map((group) => ({
      value: group.rGrpID,
      label: `${group.rGrpName} (${group.deptName || "No Department"})`,
    }));
  }, [roomGroups]);

  const filteredRoomOptions = useMemo(() => {
    const filteredRooms = selectedRoomGroupId ? rooms.filter((room) => room.rgrpID === selectedRoomGroupId) : rooms;

    return filteredRooms.map((room) => ({
      value: room.rlID,
      label: `${room.rName} (${room.noOfBeds} beds)`,
    }));
  }, [rooms, selectedRoomGroupId]);

  const departmentOptions = useMemo(() => {
    const departments = Array.from(
      new Map(roomGroups.filter((group) => group.deptID && group.deptName).map((group) => [group.deptID, { id: group.deptID, name: group.deptName! }])).values()
    );

    return departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    }));
  }, [roomGroups]);

  const bedStatusOptions = [
    { value: "Available", label: "Available" },
    { value: "Occupied", label: "Occupied" },
    { value: "Blocked", label: "Blocked" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Reserved", label: "Reserved" },
  ];

  const availabilityOptions = [
    { value: "all", label: "All Beds" },
    { value: "available", label: "Available Only" },
    { value: "occupied", label: "Occupied Only" },
    { value: "blocked", label: "Blocked Only" },
    { value: "maintenance", label: "Maintenance Only" },
  ];

  // Handle form submission
  const onFormSubmit = (data: FilterFormData) => {
    const newFilters: BedFilters = {};

    if (data.roomGroupId > 0) newFilters.roomGroupId = data.roomGroupId;
    if (data.roomId > 0) newFilters.roomId = data.roomId;
    if (data.departmentId > 0) newFilters.departmentId = data.departmentId;
    if (data.bedStatus) newFilters.bedStatus = data.bedStatus;
    if (data.availability !== "all") newFilters.availability = data.availability as any;

    onApply(newFilters);
    onSearchChange(localSearchTerm);
    onClose();
  };

  // Clear all filters
  const handleClearAll = () => {
    reset({
      roomGroupId: 0,
      roomId: 0,
      departmentId: 0,
      bedStatus: "",
      availability: "all",
    });
    setLocalSearchTerm("");
    onApply({});
    onSearchChange("");
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.roomGroupId) count++;
    if (filters.roomId) count++;
    if (filters.departmentId) count++;
    if (filters.bedStatus) count++;
    if (filters.availability && filters.availability !== "all") count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  // Get active filter descriptions
  const activeFilterDescriptions = useMemo(() => {
    const descriptions: string[] = [];

    if (filters.roomGroupId) {
      const group = roomGroups.find((g) => g.rGrpID === filters.roomGroupId);
      if (group) descriptions.push(`Room Group: ${group.rGrpName}`);
    }

    if (filters.roomId) {
      const room = rooms.find((r) => r.rlID === filters.roomId);
      if (room) descriptions.push(`Room: ${room.rName}`);
    }

    if (filters.departmentId) {
      const dept = roomGroups.find((g) => g.deptID === filters.departmentId);
      if (dept) descriptions.push(`Department: ${dept.deptName}`);
    }

    if (filters.bedStatus) {
      descriptions.push(`Status: ${filters.bedStatus}`);
    }

    if (filters.availability && filters.availability !== "all") {
      descriptions.push(`Availability: ${filters.availability}`);
    }

    if (searchTerm) {
      descriptions.push(`Search: "${searchTerm}"`);
    }

    return descriptions;
  }, [filters, searchTerm, roomGroups, rooms]);

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Filter Beds ${activeFiltersCount > 0 ? `(${activeFiltersCount} active)` : ""}`}
      maxWidth="md"
      fullWidth
      actions={
        <>
          <CustomButton variant="outlined" text="Clear All" onClick={handleClearAll} color="inherit" />
          <CustomButton variant="outlined" text="Cancel" onClick={onClose} />
          <CustomButton variant="contained" text="Apply Filters" onClick={handleSubmit(onFormSubmit)} />
        </>
      }
    >
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Search Section */}
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            Search
          </Typography>
          <TextField
            fullWidth
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Search by bed name, room, room group, department, or status..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: localSearchTerm && (
                <InputAdornment position="end">
                  <CustomButton variant="text" size="small" icon={ClearIcon} onClick={() => setLocalSearchTerm("")} sx={{ minWidth: "auto", p: 0.5 }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ mb: 3 }} />

          {/* Location Filters */}
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            Location Filters
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField name="roomGroupId" control={control} type="select" label="Room Group" options={roomGroupOptions} defaultText="All Room Groups" clearable />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField
                name="roomId"
                control={control}
                type="select"
                label="Room"
                options={filteredRoomOptions}
                defaultText={selectedRoomGroupId ? "All Rooms in Group" : "All Rooms"}
                clearable
                disabled={!selectedRoomGroupId && filteredRoomOptions.length === 0}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField name="departmentId" control={control} type="select" label="Department" options={departmentOptions} defaultText="All Departments" clearable />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Status Filters */}
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
            Status Filters
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField name="bedStatus" control={control} type="select" label="Bed Status" options={bedStatusOptions} defaultText="All Statuses" clearable />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <EnhancedFormField name="availability" control={control} type="select" label="Availability Filter" options={availabilityOptions} />
            </Grid>
          </Grid>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
                Active Filters ({activeFiltersCount})
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {activeFilterDescriptions.map((description, index) => (
                  <Chip key={index} label={description} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>
            </>
          )}
        </form>
      </Box>
    </GenericDialog>
  );
};

export default BedFilterDialog;
