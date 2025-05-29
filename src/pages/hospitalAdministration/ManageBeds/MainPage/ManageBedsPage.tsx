// src/pages/hospitalAdministration/ManageBeds/MainPage/ManageBedsPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Chip, Tooltip, IconButton, Stack, Badge } from "@mui/material";
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
  Key as KeyIcon,
  Category as CategoryIcon,
  MedicalServices as ServiceIcon,
  Crib as CradleIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { useAlert } from "@/providers/AlertProvider";
import { wrBedService, roomListService, roomGroupService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import BedFilterDialog from "../Components/BedFilterDialog";
import BedFormDialog from "../Components/BedFormDialog";
import BedStatusDialog from "../Components/BedStatusDialog";

interface EnhancedWrBedDto extends WrBedDto {
  roomName?: string;
  roomGroupName?: string;
  departmentName?: string;
  bedStatusColor?: string;
  bedStatusIcon?: React.ReactElement;
  bedStatusLabel?: string;
  bedCategoryDisplayName?: string;
  serviceTypeDisplayName?: string;
  hasCradle?: boolean;
}

interface BedFilters {
  roomGroupId?: number;
  roomId?: number;
  departmentId?: number;
  bedStatus?: string;
  bedCategoryId?: number;
  serviceTypeId?: number;
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

  // Load dropdown values for bed categories and service types (fallback for names)
  const { bedCategory = [], serviceType = [], isLoading: dropdownLoading } = useDropdownValues(["bedCategory", "serviceType"]);

  // Updated bed status configuration to match actual database values
  const bedStatusConfig = {
    OCCUP: { color: "#f44336", icon: <OccupiedIcon fontSize="small" />, label: "Occupied" },
    AVLBL: { color: "#4caf50", icon: <AvailableIcon fontSize="small" />, label: "Available" },
    BLOCK: { color: "#ff9800", icon: <BlockIcon fontSize="small" />, label: "Blocked" },
    MAINT: { color: "#9c27b0", icon: <MaintenanceIcon fontSize="small" />, label: "Maintenance" },
    RESERV: { color: "#2196f3", icon: <BedIcon fontSize="small" />, label: "Reserved" },
    OUT_PATIENT: { color: "#795548", icon: <BedIcon fontSize="small" />, label: "Out Patient" },
    IN_PATIENT: { color: "#607d8b", icon: <OccupiedIcon fontSize="small" />, label: "In Patient" },
  };

  // Fallback configuration for unknown statuses
  const getStatusConfig = (status: string) => {
    const config = bedStatusConfig[status as keyof typeof bedStatusConfig];
    if (config) {
      return config;
    }

    return {
      color: "#757575",
      icon: <BedIcon fontSize="small" />,
      label: status || "Unknown",
    };
  };

  // Helper function to get bed category name (with fallback to dropdown lookup)
  const getBedCategoryDisplayName = useCallback(
    (bed: WrBedDto): string => {
      // First try to use the stored name
      if (bed.wbCatName) {
        return bed.wbCatName;
      }

      // Fallback to dropdown lookup if no stored name
      if (bed.wbCatID) {
        const category = bedCategory.find((cat) => Number(cat.value) === bed.wbCatID);
        return category?.label || "";
      }

      return "";
    },
    [bedCategory]
  );

  // Helper function to get service type name (with fallback to dropdown lookup)
  const getServiceTypeDisplayName = useCallback(
    (bed: WrBedDto): string => {
      // First try to use the stored name
      if (bed.bchName) {
        return bed.bchName;
      }

      // Fallback to dropdown lookup if no stored name
      if (bed.bchID) {
        const service = serviceType.find((svc) => Number(svc.value) === bed.bchID);
        return service?.label || "";
      }

      return "";
    },
    [serviceType]
  );

  // Data fetching functions
  const fetchBeds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await wrBedService.getAllWithIncludes(["RoomList", "RoomList.RoomGroup"]);
      if (response.success && response.data) {
        const enhancedBeds = response.data.map((bed) => {
          const statusConfig = getStatusConfig(bed.bedStatusValue);

          return {
            ...bed,
            roomName: bed.roomList?.rName || "Unknown Room",
            roomGroupName: bed.roomList?.roomGroup?.rGrpName || "Unknown Group",
            departmentName: bed.roomList?.roomGroup?.deptName || "Unknown Department",
            bedStatusColor: statusConfig.color,
            bedStatusIcon: statusConfig.icon,
            bedStatusLabel: statusConfig.label,
            bedCategoryDisplayName: getBedCategoryDisplayName(bed),
            serviceTypeDisplayName: getServiceTypeDisplayName(bed),
            hasCradle: !!(bed.key && bed.key > 0),
          };
        });
        setBeds(enhancedBeds);
      }
    } catch (error) {
      showErrorAlert("Failed to fetch beds", "error");
    } finally {
      setLoading(false);
    }
  }, [showErrorAlert, getBedCategoryDisplayName, getServiceTypeDisplayName]);

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

  // Re-enhance beds when dropdown data loads (for fallback name resolution)
  useEffect(() => {
    if (!dropdownLoading && beds.length > 0) {
      setBeds((currentBeds) =>
        currentBeds.map((bed) => ({
          ...bed,
          bedCategoryDisplayName: getBedCategoryDisplayName(bed),
          serviceTypeDisplayName: getServiceTypeDisplayName(bed),
        }))
      );
    }
  }, [dropdownLoading, getBedCategoryDisplayName, getServiceTypeDisplayName]);

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
          bed.bedStatusValue?.toLowerCase().includes(searchLower) ||
          bed.bedStatusLabel?.toLowerCase().includes(searchLower) ||
          bed.bedCategoryDisplayName?.toLowerCase().includes(searchLower) ||
          bed.serviceTypeDisplayName?.toLowerCase().includes(searchLower) ||
          bed.key?.toString().includes(searchTerm) ||
          (bed.hasCradle && "cradle".includes(searchLower));

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

      // Filter by bed category
      if (filters.bedCategoryId && bed.wbCatID !== filters.bedCategoryId) {
        return false;
      }

      // Filter by service type
      if (filters.serviceTypeId && bed.bchID !== filters.serviceTypeId) {
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

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalBeds = filteredBeds.length;
    const bedsWithCradles = filteredBeds.filter((bed) => bed.hasCradle).length;
    const statusCounts = Object.keys(bedStatusConfig).reduce((acc, status) => {
      acc[status] = filteredBeds.filter((bed) => bed.bedStatusValue === status).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBeds,
      bedsWithCradles,
      statusCounts,
    };
  }, [filteredBeds]);

  // Grid column configuration
  const columns: Column<EnhancedWrBedDto>[] = [
    {
      key: "bedName",
      header: "Bed Name",
      visible: true,
      sortable: true,
      width: 140,
      render: (bed) => (
        <Box display="flex" alignItems="center" gap={1}>
          {bed.hasCradle ? (
            <Badge badgeContent={<CradleIcon fontSize="small" />} color="primary">
              <BedIcon fontSize="small" color="action" />
            </Badge>
          ) : (
            <BedIcon fontSize="small" color="action" />
          )}
          <Typography variant="body2" fontWeight="medium">
            {bed.bedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "key",
      header: "Cradle Key",
      visible: true,
      sortable: true,
      width: 100,
      render: (bed) => (
        <Box display="flex" alignItems="center" gap={1}>
          {bed.hasCradle ? (
            <Tooltip title="This bed has an associated cradle">
              <Chip icon={<CradleIcon fontSize="small" />} label={bed.key} size="small" color="primary" variant="outlined" />
            </Tooltip>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )}
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
      key: "bedCategoryDisplayName",
      header: "Bed Category",
      visible: true,
      sortable: true,
      width: 130,
      render: (bed) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CategoryIcon fontSize="small" color="action" />
          <Typography variant="body2">{bed.bedCategoryDisplayName || "-"}</Typography>
        </Box>
      ),
    },
    {
      key: "serviceTypeDisplayName",
      header: "Service Type",
      visible: true,
      sortable: true,
      width: 130,
      render: (bed) => (
        <Box display="flex" alignItems="center" gap={1}>
          <ServiceIcon fontSize="small" color="action" />
          <Typography variant="body2">{bed.serviceTypeDisplayName || "-"}</Typography>
        </Box>
      ),
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
            label={bed.bedStatusLabel || bed.bedStatusValue || "Unknown"}
            size="small"
            onClick={() => handleBedStatusChange(bed)}
            variant="filled"
            sx={{
              backgroundColor: bed.bedStatusColor,
              color: "white",
              cursor: "pointer",
              fontWeight: "medium",
              border: "none",
              "& .MuiChip-icon": {
                color: "white",
              },
              "&:hover": {
                opacity: 0.8,
                transform: "scale(1.02)",
                boxShadow: `0 2px 8px ${bed.bedStatusColor}40`,
              },
              transition: "all 0.2s ease-in-out",
            }}
          />
        </Tooltip>
      ),
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
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={2}>
        {/* Total Beds Card */}
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <BedIcon color="primary" />
            <Typography variant="h6" color="primary.main">
              {statistics.totalBeds}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Total Beds
          </Typography>
        </Paper>

        {/* Beds with Cradles Card */}
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <CradleIcon color="secondary" />
            <Typography variant="h6" color="secondary.main">
              {statistics.bedsWithCradles}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Beds with Cradles
          </Typography>
        </Paper>

        {/* Status Cards */}
        {Object.entries(bedStatusConfig).map(([status, config]) => {
          const count = statistics.statusCounts[status] || 0;
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
