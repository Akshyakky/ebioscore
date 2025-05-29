// src/pages/hospitalAdministration/ManageBeds/MainPage/ManageBedsPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Chip, Tooltip, IconButton, Stack } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bed as BedIcon,
  Block as BlockIcon,
  CheckCircle as AvailableIcon,
  Person as OccupiedIcon,
  Build as MaintenanceIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { useAlert } from "@/providers/AlertProvider";
import { wrBedService, roomListService, roomGroupService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import BedFilterDialog from "../Components/BedFilterDialog";
import BedFormDialog from "../Components/BedFormDialog";
import BedStatusDialog from "../Components/BedStatusDialog";
interface EnhancedWrBedDto extends WrBedDto {
  roomName?: string;
  roomGroupName?: string;
  departmentName?: string;
  bedStatusColor?: string;
  bedStatusIcon?: React.ReactElement;
}

interface BedFilters {
  roomGroupId?: number;
  roomId?: number;
  departmentId?: number;
  bedStatus?: string;
  availability?: "all" | "available" | "occupied" | "blocked" | "maintenance";
}

const ManageBedsPage: React.FC = () => {
  // State management
  const [beds, setBeds] = useState<EnhancedWrBedDto[]>([]);
  const [rooms, setRooms] = useState<RoomListDto[]>([]);
  const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBed, setSelectedBed] = useState<EnhancedWrBedDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BedFilters>({});
  const [density, setDensity] = useState<"small" | "medium" | "large">("medium");

  const { showErrorAlert, showSuccessAlert } = useAlert();

  // Bed status configuration
  const bedStatusConfig = {
    Available: { color: "#4caf50", icon: <AvailableIcon fontSize="small" />, label: "Available" },
    Occupied: { color: "#f44336", icon: <OccupiedIcon fontSize="small" />, label: "Occupied" },
    Blocked: { color: "#ff9800", icon: <BlockIcon fontSize="small" />, label: "Blocked" },
    Maintenance: { color: "#9c27b0", icon: <MaintenanceIcon fontSize="small" />, label: "Maintenance" },
    Reserved: { color: "#2196f3", icon: <BedIcon fontSize="small" />, label: "Reserved" },
  };

  // Data fetching functions
  const fetchBeds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await wrBedService.getAllWithIncludes(["RoomList", "RoomList.RoomGroup"]);
      if (response.success && response.data) {
        const enhancedBeds = response.data.map((bed) => ({
          ...bed,
          roomName: bed.roomList?.rName || "Unknown Room",
          roomGroupName: bed.roomList?.roomGroup?.rGrpName || "Unknown Group",
          departmentName: bed.roomList?.roomGroup?.deptName || "Unknown Department",
          bedStatusColor: bedStatusConfig[bed.bedStatusValue as keyof typeof bedStatusConfig]?.color || "#757575",
          bedStatusIcon: bedStatusConfig[bed.bedStatusValue as keyof typeof bedStatusConfig]?.icon || <BedIcon fontSize="small" />,
        }));
        setBeds(enhancedBeds);
      }
    } catch (error) {
      showErrorAlert("Failed to fetch beds", "error");
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await roomListService.getAllWithIncludes(["RoomGroup"]);
      if (response.success && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  }, []);

  const fetchRoomGroups = useCallback(async () => {
    try {
      const response = await roomGroupService.getAll();
      if (response.success && response.data) {
        setRoomGroups(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch room groups:", error);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchBeds();
    fetchRooms();
    fetchRoomGroups();
  }, [fetchBeds, fetchRooms, fetchRoomGroups]);

  // Filtered data based on search term and filters
  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          bed.bedName.toLowerCase().includes(searchLower) ||
          bed.roomName?.toLowerCase().includes(searchLower) ||
          bed.roomGroupName?.toLowerCase().includes(searchLower) ||
          bed.departmentName?.toLowerCase().includes(searchLower) ||
          bed.bedStatusValue?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Filter by room group
      if (filters.roomGroupId && bed.roomList?.roomGroup.rGrpID !== filters.roomGroupId) {
        return false;
      }

      // Filter by room
      if (filters.roomId && bed.rlID !== filters.roomId) {
        return false;
      }

      // Filter by bed status
      if (filters.bedStatus && bed.bedStatusValue !== filters.bedStatus) {
        return false;
      }

      // Filter by availability
      if (filters.availability && filters.availability !== "all") {
        const availability = bed.bedStatusValue?.toLowerCase();
        if (filters.availability !== availability) {
          return false;
        }
      }

      return true;
    });
  }, [beds, searchTerm, filters]);

  // Event handlers
  const handleAddBed = () => {
    setSelectedBed(null);
    setIsFormOpen(true);
  };

  const handleEditBed = (bed: EnhancedWrBedDto) => {
    setSelectedBed(bed);
    setIsFormOpen(true);
  };

  const handleDeleteBed = async (bed: EnhancedWrBedDto) => {
    try {
      const response = await wrBedService.delete(bed.bedID);
      if (response.success) {
        showSuccessAlert("Bed deleted successfully", "success");
        fetchBeds();
      } else {
        showErrorAlert(response.errorMessage || "Failed to delete bed", "error");
      }
    } catch (error) {
      showErrorAlert("Failed to delete bed", "error");
    }
  };

  const handleBedStatusChange = (bed: EnhancedWrBedDto) => {
    setSelectedBed(bed);
    setIsStatusDialogOpen(true);
  };

  const handleFormSubmit = async (bedData: Partial<WrBedDto>) => {
    try {
      const response = await wrBedService.save(bedData as WrBedDto);
      if (response.success) {
        showSuccessAlert(selectedBed ? "Bed updated successfully" : "Bed created successfully", "success");
        setIsFormOpen(false);
        fetchBeds();
      } else {
        showErrorAlert(response.errorMessage || "Failed to save bed", "error");
      }
    } catch (error) {
      showErrorAlert("Failed to save bed", "error");
    }
  };

  const handleStatusUpdate = async (bedId: number, status: string, remarks?: string) => {
    try {
      const bedToUpdate = beds.find((b) => b.bedID === bedId);
      if (bedToUpdate) {
        const updatedBed = {
          ...bedToUpdate,
          bedStatusValue: status,
          bedRemarks: remarks || bedToUpdate.bedRemarks,
        };

        const response = await wrBedService.save(updatedBed);
        if (response.success) {
          showSuccessAlert("Bed status updated successfully", "success");
          setIsStatusDialogOpen(false);
          fetchBeds();
        } else {
          showErrorAlert(response.errorMessage || "Failed to update bed status", "error");
        }
      }
    } catch (error) {
      showErrorAlert("Failed to update bed status", "error");
    }
  };

  // Grid column configuration
  const columns: Column<EnhancedWrBedDto>[] = [
    {
      key: "bedName",
      header: "Bed Name",
      visible: true,
      sortable: true,
      width: 120,
      render: (bed) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BedIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {bed.bedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "roomName",
      header: "Room",
      visible: true,
      sortable: true,
      width: 150,
    },
    {
      key: "roomGroupName",
      header: "Room Group",
      visible: true,
      sortable: true,
      width: 150,
    },
    {
      key: "departmentName",
      header: "Department",
      visible: true,
      sortable: true,
      width: 150,
    },
    {
      key: "bedStatusValue",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (bed) => (
        <Tooltip title={`Click to change status`}>
          <Chip
            icon={bed.bedStatusIcon}
            label={bed.bedStatusValue || "Unknown"}
            size="small"
            onClick={() => handleBedStatusChange(bed)}
            sx={{
              backgroundColor: bed.bedStatusColor,
              color: "white",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          />
        </Tooltip>
      ),
    },
    {
      key: "wbCatName",
      header: "Category",
      visible: true,
      sortable: true,
      width: 120,
    },
    {
      key: "bedRemarks",
      header: "Remarks",
      visible: true,
      width: 200,
      render: (bed) => (
        <Tooltip title={bed.bedRemarks || "No remarks"}>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {bed.bedRemarks || "-"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      key: "rActiveYN",
      header: "Active",
      visible: true,
      width: 80,
      render: (bed) => <Chip label={bed.rActiveYN === "Y" ? "Yes" : "No"} size="small" color={bed.rActiveYN === "Y" ? "success" : "default"} variant="outlined" />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 120,
      render: (bed) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Bed">
            <IconButton size="small" onClick={() => handleEditBed(bed)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Bed">
            <IconButton size="small" onClick={() => handleDeleteBed(bed)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Beds
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="outlined" icon={FilterIcon} text="Filters" onClick={() => setIsFilterDialogOpen(true)} />
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={fetchBeds} asynchronous />
          <CustomButton variant="contained" icon={AddIcon} text="Add Bed" onClick={handleAddBed} />
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={3}>
        {Object.entries(bedStatusConfig).map(([status, config]) => {
          const count = filteredBeds.filter((bed) => bed.bedStatusValue === status).length;
          return (
            <Paper key={status} sx={{ p: 2, textAlign: "center" }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                {config.icon}
                <Typography variant="h6" color={config.color}>
                  {count}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {config.label}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Data Grid */}
      <Paper sx={{ p: 2 }}>
        <CustomGrid
          columns={columns}
          data={filteredBeds}
          loading={loading}
          searchTerm={searchTerm}
          onRowClick={handleEditBed}
          maxHeight="600px"
          density={density}
          onDensityChange={setDensity}
          showDensityControls
          emptyStateMessage="No beds found. Add some beds to get started."
          rowKeyField="bedID"
        />
      </Paper>

      {/* Dialogs */}
      <BedFormDialog open={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} bed={selectedBed} rooms={rooms} roomGroups={roomGroups} />

      <BedStatusDialog
        open={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onSubmit={handleStatusUpdate}
        bed={selectedBed}
        statusOptions={Object.keys(bedStatusConfig)}
      />

      <BedFilterDialog
        open={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApply={setFilters}
        filters={filters}
        rooms={rooms}
        roomGroups={roomGroups}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </Box>
  );
};

export default ManageBedsPage;
