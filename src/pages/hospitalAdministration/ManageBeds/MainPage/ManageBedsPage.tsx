// src/pages/hospitalAdministration/ManageBeds/MainPage/ManageBedsPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Chip, Tooltip, IconButton, Stack, Badge, Menu, MenuItem, ListItemIcon, ListItemText, Avatar } from "@mui/material";
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
  Crib as CradleIcon,
  Category as CategoryIcon,
  MedicalServices as ServiceIcon,
  MoreVert as MoreVertIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
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
  isCradle?: boolean;
  associatedBedName?: string;
  associatedBedId?: number;
  cradleCount?: number; // Number of cradles associated with this bed
}

interface BedFilters {
  roomGroupId?: number;
  roomId?: number;
  departmentId?: number;
  bedStatus?: string;
  bedCategoryId?: number;
  serviceTypeId?: number;
  availability?: "all" | "available" | "occupied" | "blocked" | "maintenance";
  showCradles?: boolean;
  showBedsOnly?: boolean;
}

interface ActionMenuState {
  anchorEl: HTMLElement | null;
  bed: EnhancedWrBedDto | null;
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
  const [formMode, setFormMode] = useState<"bed" | "cradle">("bed");
  const [preselectedBedForCradle, setPreselectedBedForCradle] = useState<WrBedDto | null>(null);
  const [actionMenu, setActionMenu] = useState<ActionMenuState>({ anchorEl: null, bed: null });

  const { showErrorAlert, showSuccessAlert, showConfirmAlert } = useAlert();

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
        const allBeds = response.data;

        const enhancedBeds = allBeds.map((bed) => {
          const statusConfig = getStatusConfig(bed.bedStatusValue);
          const isCradle = !!(bed.key && bed.key > 0);

          // Find associated bed if this is a cradle
          let associatedBed = null;
          if (isCradle) {
            associatedBed = allBeds.find((b) => b.bedID === bed.key);
          }

          // Count cradles for this bed if it's a bed (not a cradle)
          let cradleCount = 0;
          if (!isCradle) {
            cradleCount = allBeds.filter((b) => b.key === bed.bedID).length;
          }

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
            isCradle: isCradle,
            associatedBedName: associatedBed?.bedName,
            associatedBedId: associatedBed?.bedID,
            cradleCount: cradleCount,
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
      // Filter by cradle/bed type
      if (filters.showCradles && !bed.isCradle) return false;
      if (filters.showBedsOnly && bed.isCradle) return false;

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
          bed.associatedBedName?.toLowerCase().includes(searchLower) ||
          (bed.isCradle && "cradle".includes(searchLower)) ||
          (!bed.isCradle && "bed".includes(searchLower));

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
    setFormMode("bed");
    setPreselectedBedForCradle(null);
    setIsFormOpen(true);
  };

  const handleAddCradle = (bed?: EnhancedWrBedDto) => {
    setSelectedBed(null);
    setFormMode("cradle");
    setPreselectedBedForCradle(bed || null);
    setIsFormOpen(true);
  };

  const handleEditBed = (bed: EnhancedWrBedDto) => {
    setSelectedBed(bed);
    setFormMode(bed.isCradle ? "cradle" : "bed");
    setPreselectedBedForCradle(null);
    setIsFormOpen(true);
  };

  const handleDeleteBed = async (bed: EnhancedWrBedDto) => {
    const itemType = bed.isCradle ? "cradle" : "bed";
    const confirmMessage = bed.isCradle
      ? `Are you sure you want to delete the cradle "${bed.bedName}"? This will remove the cradle association.`
      : `Are you sure you want to delete the bed "${bed.bedName}"? ${
          bed.cradleCount && bed.cradleCount > 0 ? `This bed has ${bed.cradleCount} associated cradle(s) that will also be affected.` : ""
        }`;

    const confirmed = await showConfirmAlert(`Delete ${itemType}`, confirmMessage);

    if (confirmed) {
      try {
        const response = await wrBedService.delete(bed.bedID);
        if (response.success) {
          showSuccessAlert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`, "success");
          fetchBeds();
        } else {
          showErrorAlert(response.errorMessage || `Failed to delete ${itemType}`, "error");
        }
      } catch (error) {
        showErrorAlert(`Failed to delete ${itemType}`, "error");
      }
    }
  };

  const handleRemoveCradleAssociation = async (bed: EnhancedWrBedDto) => {
    if (!bed.isCradle) return;

    const confirmed = await showConfirmAlert(
      "Remove Cradle Association",
      `Are you sure you want to remove the cradle association for "${bed.bedName}"? This will convert it to a regular bed.`
    );

    if (confirmed) {
      try {
        const updatedBed = {
          ...bed,
          key: undefined, // Remove the association
        };

        const response = await wrBedService.save(updatedBed);
        if (response.success) {
          showSuccessAlert("Cradle association removed successfully", "success");
          fetchBeds();
        } else {
          showErrorAlert(response.errorMessage || "Failed to remove cradle association", "error");
        }
      } catch (error) {
        showErrorAlert("Failed to remove cradle association", "error");
      }
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
        const itemType = formMode === "cradle" ? "cradle" : "bed";
        showSuccessAlert(
          selectedBed
            ? `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully`
            : `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created successfully`,
          "success"
        );
        setIsFormOpen(false);
        fetchBeds();
      } else {
        showErrorAlert(response.errorMessage || "Failed to save", "error");
      }
    } catch (error) {
      showErrorAlert("Failed to save", "error");
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
          showSuccessAlert("Status updated successfully", "success");
          setIsStatusDialogOpen(false);
          fetchBeds();
        } else {
          showErrorAlert(response.errorMessage || "Failed to update status", "error");
        }
      }
    } catch (error) {
      showErrorAlert("Failed to update status", "error");
    }
  };

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, bed: EnhancedWrBedDto) => {
    event.stopPropagation();
    setActionMenu({ anchorEl: event.currentTarget, bed });
  };

  const handleActionMenuClose = () => {
    setActionMenu({ anchorEl: null, bed: null });
  };

  // Statistics calculations
  const statistics = useMemo(() => {
    const allBeds = beds.filter((bed) => !bed.isCradle);
    const allCradles = beds.filter((bed) => bed.isCradle);
    const filteredRegularBeds = filteredBeds.filter((bed) => !bed.isCradle);
    const filteredCradles = filteredBeds.filter((bed) => bed.isCradle);

    const bedStatusCounts = Object.keys(bedStatusConfig).reduce((acc, status) => {
      acc[status] = filteredRegularBeds.filter((bed) => bed.bedStatusValue === status).length;
      return acc;
    }, {} as Record<string, number>);

    const cradleStatusCounts = Object.keys(bedStatusConfig).reduce((acc, status) => {
      acc[status] = filteredCradles.filter((bed) => bed.bedStatusValue === status).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBeds: allBeds.length,
      totalCradles: allCradles.length,
      filteredBeds: filteredRegularBeds.length,
      filteredCradles: filteredCradles.length,
      bedStatusCounts,
      cradleStatusCounts,
      bedsWithCradles: allBeds.filter((bed) => bed.cradleCount && bed.cradleCount > 0).length,
    };
  }, [beds, filteredBeds]);

  // Enhanced type column component for better visual clarity
  const TypeIndicator = ({ bed }: { bed: EnhancedWrBedDto }) => {
    if (bed.isCradle) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center">
          <Chip
            icon={<CradleIcon fontSize="small" />}
            label="Cradle"
            size="small"
            variant="filled"
            sx={{
              backgroundColor: "#9c27b0",
              color: "white",
              fontWeight: "medium",
              minWidth: "70px",
            }}
          />
        </Box>
      );
    }

    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <Stack alignItems="center" spacing={0.5}>
          <Chip
            icon={<BedIcon fontSize="small" />}
            label="Bed"
            size="small"
            variant="filled"
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: "medium",
              minWidth: "70px",
            }}
          />
          {bed.cradleCount && bed.cradleCount > 0 && (
            <Chip
              label={`+${bed.cradleCount} cradle${bed.cradleCount > 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.65rem",
                height: "16px",
                color: "#9c27b0",
                borderColor: "#9c27b0",
                backgroundColor: "transparent",
              }}
            />
          )}
        </Stack>
      </Box>
    );
  };

  // Enhanced name column for better identification
  const NameDisplay = ({ bed }: { bed: EnhancedWrBedDto }) => {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: "0.75rem",
            backgroundColor: bed.isCradle ? "#9c27b0" : "#1976d2",
            color: "white",
          }}
        >
          {bed.isCradle ? <CradleIcon fontSize="small" /> : <BedIcon fontSize="small" />}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {bed.bedName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {bed.isCradle ? "Cradle Unit" : "Bed Unit"}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Enhanced association display for better clarity
  const AssociationDisplay = ({ bed }: { bed: EnhancedWrBedDto }) => {
    if (bed.isCradle && bed.associatedBedName) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "#1976d2",
              color: "white",
            }}
          >
            <BedIcon sx={{ fontSize: "12px" }} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {bed.associatedBedName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Parent Bed
            </Typography>
          </Box>
        </Box>
      );
    }

    if (!bed.isCradle && bed.cradleCount && bed.cradleCount > 0) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "#9c27b0",
              color: "white",
            }}
          >
            <CradleIcon sx={{ fontSize: "12px" }} />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {bed.cradleCount} Cradle{bed.cradleCount > 1 ? "s" : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Associated Units
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No associations
        </Typography>
      </Box>
    );
  };

  // Grid column configuration with enhanced visuals
  const columns: Column<EnhancedWrBedDto>[] = [
    {
      key: "type",
      header: "Type",
      visible: true,
      sortable: true,
      width: 100,
      render: (bed) => (
        <Tooltip
          title={bed.isCradle ? "Cradle - Associated with a bed" : bed.cradleCount && bed.cradleCount > 0 ? `Bed with ${bed.cradleCount} associated cradle(s)` : "Standard Bed"}
        >
          <Box>
            <TypeIndicator bed={bed} />
          </Box>
        </Tooltip>
      ),
    },
    {
      key: "bedName",
      header: "Name & Details",
      visible: true,
      sortable: true,
      width: 180,
      render: (bed) => <NameDisplay bed={bed} />,
    },
    {
      key: "association",
      header: "Associations",
      visible: true,
      sortable: true,
      width: 150,
      render: (bed) => <AssociationDisplay bed={bed} />,
    },
    {
      key: "roomName",
      header: "Room",
      visible: true,
      sortable: true,
      width: 130,
    },
    {
      key: "roomGroupName",
      header: "Room Group",
      visible: true,
      sortable: true,
      width: 130,
    },
    {
      key: "departmentName",
      header: "Department",
      visible: true,
      sortable: true,
      width: 130,
    },
    {
      key: "bedCategoryDisplayName",
      header: "Category",
      visible: true,
      sortable: true,
      width: 120,
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
      width: 120,
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
      width: 180,
      render: (bed) => (
        <Tooltip title={bed.bedRemarks || "No remarks"}>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 160,
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
      width: 140,
      render: (bed) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={`Edit ${bed.isCradle ? "Cradle" : "Bed"}`}>
            <IconButton size="small" onClick={() => handleEditBed(bed)} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Actions">
            <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, bed)} color="default">
              <MoreVertIcon fontSize="small" />
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
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Manage Beds & Cradles
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="outlined" icon={FilterIcon} text="Filters" onClick={() => setIsFilterDialogOpen(true)} />
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={fetchBeds} asynchronous />
          <CustomButton variant="outlined" icon={CradleIcon} text="Add Cradle" onClick={() => handleAddCradle()} color="secondary" />
          <CustomButton variant="contained" icon={AddIcon} text="Add Bed" onClick={handleAddBed} />
        </Stack>
      </Box>

      {/* Enhanced Statistics Cards */}
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={2}>
        {/* Total Beds Card */}
        <Paper sx={{ p: 2, textAlign: "center", borderLeft: "4px solid #1976d2" }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
              <BedIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" color="#1976d2" fontWeight="bold">
              {statistics.totalBeds}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            Total Beds
          </Typography>
        </Paper>

        {/* Total Cradles Card */}
        <Paper sx={{ p: 2, textAlign: "center", borderLeft: "4px solid #9c27b0" }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: "#9c27b0", width: 32, height: 32 }}>
              <CradleIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" color="#9c27b0" fontWeight="bold">
              {statistics.totalCradles}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            Total Cradles
          </Typography>
        </Paper>

        {/* Beds with Cradles Card */}
        <Paper sx={{ p: 2, textAlign: "center", borderLeft: "4px solid #ff9800" }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <Avatar sx={{ bgcolor: "#ff9800", width: 32, height: 32 }}>
              <LinkIcon fontSize="small" />
            </Avatar>
            <Typography variant="h5" color="#ff9800" fontWeight="bold">
              {statistics.bedsWithCradles}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            Beds with Cradles
          </Typography>
        </Paper>

        {/* Status Cards - Only show for filtered data */}
        {Object.entries(bedStatusConfig).map(([status, config]) => {
          const bedCount = statistics.bedStatusCounts[status] || 0;
          const cradleCount = statistics.cradleStatusCounts[status] || 0;
          const totalCount = bedCount + cradleCount;

          if (totalCount === 0) return null;

          return (
            <Paper key={status} sx={{ p: 2, textAlign: "center", borderLeft: `4px solid ${config.color}` }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <Avatar sx={{ bgcolor: config.color, width: 32, height: 32 }}>{config.icon}</Avatar>
                <Typography variant="h5" color={config.color} fontWeight="bold">
                  {totalCount}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {config.label}
              </Typography>
              {bedCount > 0 && cradleCount > 0 && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {bedCount} beds, {cradleCount} cradles
                </Typography>
              )}
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
          maxHeight="700px"
          density={density}
          onDensityChange={setDensity}
          showDensityControls
          emptyStateMessage="No beds or cradles found. Add some to get started."
          rowKeyField="bedID"
        />
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={actionMenu.anchorEl} open={Boolean(actionMenu.anchorEl)} onClose={handleActionMenuClose}>
        {actionMenu.bed && !actionMenu.bed.isCradle && (
          <MenuItem
            onClick={() => {
              handleAddCradle(actionMenu.bed!);
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <CradleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Cradle for this Bed</ListItemText>
          </MenuItem>
        )}

        {actionMenu.bed && actionMenu.bed.isCradle && (
          <MenuItem
            onClick={() => {
              handleRemoveCradleAssociation(actionMenu.bed!);
              handleActionMenuClose();
            }}
          >
            <ListItemIcon>
              <LinkOffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove Cradle Association</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleDeleteBed(actionMenu.bed!);
            handleActionMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete {actionMenu.bed?.isCradle ? "Cradle" : "Bed"}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <BedFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        bed={selectedBed}
        beds={beds}
        rooms={rooms}
        roomGroups={roomGroups}
        mode={formMode}
        preselectedBedForCradle={preselectedBedForCradle}
      />

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
