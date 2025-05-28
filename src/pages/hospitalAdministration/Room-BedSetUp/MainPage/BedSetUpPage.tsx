import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Stack,
  Badge,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  FolderSpecial as FolderSpecialIcon,
  MeetingRoom as MeetingRoomIcon,
  Hotel as HotelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import RoomGroupForm from "../Forms/RoomGroupForm";
import RoomListForm from "../Forms/RoomListForm";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import BedForm from "../Forms/WrBedsFrom";
import useBedSetup from "../hooks/useRoomBedSetUp";
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EnhancedBedSetupPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { roomGroups, roomLists, beds, isLoading, error, fetchAllData, deleteRoomGroup, deleteRoom, deleteBed, getRoomGroupById, getRoomById, getBedById } = useBedSetup();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    roomGroup: "",
  });

  const [showRoomGroupForm, setShowRoomGroupForm] = useState(false);
  const [showRoomListForm, setShowRoomListForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomListDto | null>(null);
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [formViewOnly, setFormViewOnly] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "roomGroup" | "room" | "bed"; id: number; name: string } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchAllData().finally(() => setLoading(false));
  }, [fetchAllData, setLoading]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
  };
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      department: "",
      roomGroup: "",
    });
  };
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const toggleExpand = (groupId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };
  const handleAddRoomGroup = (parentGroup?: RoomGroupDto) => {
    setSelectedRoomGroup(parentGroup ? { ...parentGroup, isParent: true } : null);
    setFormViewOnly(false);
    setShowRoomGroupForm(true);
  };

  const handleEditRoomGroup = async (roomGroup: RoomGroupDto) => {
    setLoading(true);
    try {
      const data = await getRoomGroupById(roomGroup.rGrpID);
      if (data) {
        setSelectedRoomGroup(data);
        setFormViewOnly(false);
        setShowRoomGroupForm(true);
      } else {
        throw new Error("Failed to load room group details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load room group details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoomGroup = async (roomGroup: RoomGroupDto) => {
    setLoading(true);
    try {
      const data = await getRoomGroupById(roomGroup.rGrpID);
      if (data) {
        setSelectedRoomGroup(data);
        setFormViewOnly(true);
        setShowRoomGroupForm(true);
      } else {
        throw new Error("Failed to load room group details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load room group details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomGroupFormClose = (refreshData?: boolean) => {
    setShowRoomGroupForm(false);
    setSelectedRoomGroup(null);
    if (refreshData) {
      handleRefresh();
    }
  };

  const handleAddRoom = (roomGroup?: RoomGroupDto) => {
    setSelectedRoom(roomGroup ? ({ rgrpID: roomGroup.rGrpID } as RoomListDto) : null);
    setFormViewOnly(false);
    setShowRoomListForm(true);
  };

  const handleEditRoom = async (room: RoomListDto) => {
    setLoading(true);
    try {
      const data = await getRoomById(room.rlID);
      if (data) {
        setSelectedRoom(data);
        setFormViewOnly(false);
        setShowRoomListForm(true);
      } else {
        throw new Error("Failed to load room details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load room details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoom = async (room: RoomListDto) => {
    setLoading(true);
    try {
      const data = await getRoomById(room.rlID);
      if (data) {
        setSelectedRoom(data);
        setFormViewOnly(true);
        setShowRoomListForm(true);
      } else {
        throw new Error("Failed to load room details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load room details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomFormClose = (refreshData?: boolean) => {
    setShowRoomListForm(false);
    setSelectedRoom(null);
    if (refreshData) {
      handleRefresh();
    }
  };
  const handleAddBed = (room?: RoomListDto) => {
    if (room) {
      const roomGroup = roomGroups.find((rg) => rg.rGrpID === room.rgrpID);
      setSelectedBed({
        rlID: room.rlID,
        rgrpID: room.rgrpID,
        roomGroupName: roomGroup?.rGrpName,
      } as unknown as WrBedDto);
    } else {
      setSelectedBed(null);
    }
    setFormViewOnly(false);
    setShowBedForm(true);
  };

  const handleEditBed = async (bed: WrBedDto) => {
    setLoading(true);
    try {
      const data = await getBedById(bed.bedID);
      if (data) {
        setSelectedBed(data);
        setFormViewOnly(false);
        setShowBedForm(true);
      } else {
        throw new Error("Failed to load bed details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load bed details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBed = async (bed: WrBedDto) => {
    setLoading(true);
    try {
      const data = await getBedById(bed.bedID);
      if (data) {
        setSelectedBed(data);
        setFormViewOnly(true);
        setShowBedForm(true);
      } else {
        throw new Error("Failed to load bed details");
      }
    } catch (error) {
      showAlert("Error", error instanceof Error ? error.message : "Failed to load bed details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBedFormClose = (refreshData?: boolean) => {
    setShowBedForm(false);
    setSelectedBed(null);
    if (refreshData) {
      handleRefresh();
    }
  };
  const handleDeleteClick = (type: "roomGroup" | "room" | "bed", item: any) => {
    setItemToDelete({
      type,
      id: type === "roomGroup" ? item.rGrpID : type === "room" ? item.rlID : item.bedID,
      name: type === "roomGroup" ? item.rGrpName : type === "room" ? item.rName : item.bedName,
    });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      let success = false;

      switch (itemToDelete.type) {
        case "roomGroup":
          success = await deleteRoomGroup(itemToDelete.id);
          break;
        case "room":
          success = await deleteRoom(itemToDelete.id);
          break;
        case "bed":
          success = await deleteBed(itemToDelete.id);
          break;
      }

      if (success) {
        handleRefresh();
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  // Filtered data based on search and filters
  const filteredRoomGroups = useMemo(() => {
    return roomGroups.filter((group) => {
      const matchesSearch =
        searchTerm === "" || group.rGrpName.toLowerCase().includes(searchTerm.toLowerCase()) || (group.deptName && group.deptName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status === "" || (filters.status === "active" && group.rActiveYN === "Y") || (filters.status === "inactive" && group.rActiveYN === "N");

      const matchesDepartment = filters.department === "" || group.deptName === filters.department;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [roomGroups, searchTerm, filters]);

  const filteredRooms = useMemo(() => {
    return roomLists.filter((room) => {
      const matchesSearch =
        searchTerm === "" ||
        room.rName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.deptName && room.deptName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (room.rLocation && room.rLocation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status === "" || (filters.status === "active" && room.rActiveYN === "Y") || (filters.status === "inactive" && room.rActiveYN === "N");

      const matchesDepartment = filters.department === "" || room.deptName === filters.department;

      const matchesRoomGroup = filters.roomGroup === "" || room.rgrpID.toString() === filters.roomGroup;

      return matchesSearch && matchesStatus && matchesDepartment && matchesRoomGroup;
    });
  }, [roomLists, searchTerm, filters]);

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const matchesSearch =
        searchTerm === "" ||
        bed.bedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bed.roomList?.rName && bed.roomList.rName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bed.roomList?.roomGroup?.rGrpName && bed.roomList.roomGroup.rGrpName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status === "" || (filters.status === "active" && bed.rActiveYN === "Y") || (filters.status === "inactive" && bed.rActiveYN === "N");

      const matchesRoomGroup = filters.roomGroup === "" || bed.roomList?.roomGroup?.rGrpID.toString() === filters.roomGroup;

      return matchesSearch && matchesStatus && matchesRoomGroup;
    });
  }, [beds, searchTerm, filters]);

  // Room Group hierarchical data preparation
  const roomGroupHierarchy = useMemo(() => {
    const buildHierarchy = (groups: RoomGroupDto[]) => {
      const map = new Map<number, RoomGroupDto[]>();
      const roots: RoomGroupDto[] = [];

      groups.forEach((group) => {
        if (group.key === 0) {
          roots.push({ ...group, children: [] });
        } else {
          if (!map.has(group.key)) {
            map.set(group.key, []);
          }
          map.get(group.key)!.push({ ...group, children: [] });
        }
      });

      // Assign children to parent nodes
      roots.forEach((root) => {
        const children = map.get(root.rGrpID) || [];
        root.children = children;
      });

      return roots;
    };

    return buildHierarchy(filteredRoomGroups);
  }, [filteredRoomGroups]);

  // Prepare data for display in hierarchical format
  const flattenedRoomGroups = useMemo(() => {
    const result: RoomGroupDto[] = [];

    const flatten = (groups: RoomGroupDto[], level = 0) => {
      groups.forEach((group) => {
        // Add the group with its nesting level
        result.push({
          ...group,
          nestingLevel: level,
        });

        // If expanded, add its children
        if (expandedGroups.has(group.rGrpID) && group.children && group.children.length > 0) {
          flatten(group.children, level + 1);
        }
      });
    };

    flatten(roomGroupHierarchy);
    return result;
  }, [roomGroupHierarchy, expandedGroups]);

  // Stats calculations
  const stats = useMemo(() => {
    const activeRoomGroups = roomGroups.filter((g) => g.rActiveYN === "Y").length;
    const activeRooms = roomLists.filter((r) => r.rActiveYN === "Y").length;
    const activeBeds = beds.filter((b) => b.rActiveYN === "Y").length;
    const occupiedBeds = beds.filter((b) => b.rActiveYN === "Y" && b.bedStatus === "Occupied").length;

    return {
      totalRoomGroups: roomGroups.length,
      activeRoomGroups,
      inactiveRoomGroups: roomGroups.length - activeRoomGroups,
      totalRooms: roomLists.length,
      activeRooms,
      inactiveRooms: roomLists.length - activeRooms,
      totalBeds: beds.length,
      activeBeds,
      inactiveBeds: beds.length - activeBeds,
      occupiedBeds,
      availableBeds: activeBeds - occupiedBeds,
    };
  }, [roomGroups, roomLists, beds]);

  // Create safer processed data to avoid object rendering issues
  const processedRoomGroups = useMemo(() => {
    return flattenedRoomGroups.map((group) => ({
      ...group,
      // Convert any potential object properties to strings
      children: undefined, // Remove children array to avoid rendering issues
    }));
  }, [flattenedRoomGroups]);

  const processedRooms = useMemo(() => {
    return filteredRooms.map((room) => ({
      ...room,
      // Replace the roomGroup object with a string property
      roomGroupName: room.roomGroup?.rGrpName || "No Group",
      roomGroup: undefined, // Remove the original object
    }));
  }, [filteredRooms]);

  const processedBeds = useMemo(() => {
    return filteredBeds.map((bed) => ({
      ...bed,
      // Replace the nested objects with string properties
      roomName: bed.roomList?.rName || "No Room",
      groupName: bed.roomList?.roomGroup?.rGrpName || "No Group",
      roomList: undefined, // Remove the original object
    }));
  }, [filteredBeds]);

  // Column definitions for grids
  const roomGroupColumns: Column<RoomGroupDto>[] = [
    {
      key: "rGrpName",
      header: "Room Group Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      render: (row, rowIndex, columnIndex) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            pl: row.nestingLevel ? row.nestingLevel * 4 : 0,
          }}
        >
          {row.children && row.children.length > 0 && (
            <IconButton size="small" onClick={() => toggleExpand(row.rGrpID)}>
              {expandedGroups.has(row.rGrpID) ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
          <FolderSpecialIcon
            sx={{
              mr: 1,
              color: row.key === 0 ? "warning.main" : "info.main",
            }}
          />
          <Typography variant="body2">{row.rGrpName}</Typography>
        </Box>
      ),
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value) => value || "No Department",
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 250,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewRoomGroup(row)}
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
            onClick={() => handleEditRoomGroup(row)}
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
            onClick={() => handleDeleteClick("roomGroup", row)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          {row.key === 0 && (
            <Tooltip title="Add Sub Group">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleAddRoomGroup(row)}
                sx={{
                  bgcolor: "rgba(156, 39, 176, 0.08)",
                  "&:hover": { bgcolor: "rgba(156, 39, 176, 0.15)" },
                }}
              >
                <Badge
                  color="secondary"
                  badgeContent="+"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <FolderSpecialIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const roomListColumns: Column<any>[] = [
    {
      key: "rName",
      header: "Room Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "roomGroupName", // Using the string property instead of the object
      header: "Room Group",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "rLocation",
      header: "Location",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value) => value || "No Department",
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 220,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewRoom(row)}
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
            onClick={() => handleEditRoom(row)}
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
            onClick={() => handleDeleteClick("room", row)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Tooltip title="Add Bed to this Room">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleAddBed(row)}
              sx={{
                bgcolor: "rgba(156, 39, 176, 0.08)",
                "&:hover": { bgcolor: "rgba(156, 39, 176, 0.15)" },
              }}
            >
              <Badge
                color="secondary"
                badgeContent="+"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <HotelIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const bedColumns: Column<any>[] = [
    {
      key: "bedName",
      header: "Bed Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "roomName", // Using the string property instead of the object
      header: "Room",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "groupName", // Using the string property instead of the object
      header: "Room Group",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "bedStatus",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value) => <Chip size="small" color={value === "Available" ? "success" : value === "Occupied" ? "error" : "default"} label={value || "Unknown"} />,
    },
    {
      key: "rActiveYN",
      header: "Active",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 170,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewBed(row)}
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
            onClick={() => handleEditBed(row)}
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
            onClick={() => handleDeleteClick("bed", row)}
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

  // Stats dashboard renderer
  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", boxShadow: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Dashboard Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid size={{ sm: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <FolderSpecialIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Room Groups
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Total:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {stats.totalRoomGroups}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Active:</Typography>
                <Typography variant="body1" color="success.main">
                  {stats.activeRoomGroups}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Inactive:</Typography>
                <Typography variant="body1" color="error.main">
                  {stats.inactiveRoomGroups}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ sm: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <MeetingRoomIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Rooms
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Total:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {stats.totalRooms}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Active:</Typography>
                <Typography variant="body1" color="success.main">
                  {stats.activeRooms}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Inactive:</Typography>
                <Typography variant="body1" color="error.main">
                  {stats.inactiveRooms}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ sm: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                <HotelIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Beds
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Total:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {stats.totalBeds}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Available:</Typography>
                <Typography variant="body1" color="success.main">
                  {stats.availableBeds}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Occupied:</Typography>
                <Typography variant="body1" color="warning.main">
                  {stats.occupiedBeds}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );

  // Search and filter controls renderer
  const renderSearchAndFilter = () => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", boxShadow: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ sm: 12, md: 6 }}>
          <TextField
            fullWidth
            placeholder="Search rooms, beds, or groups..."
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
          <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "stretch" : "center"}>
            <DropdownSelect
              label="Status"
              name="status"
              value={filters.status}
              options={statusOptions}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              size="small"
              defaultText="All Status"
            />

            {Object.values(filters).some(Boolean) && (
              <Chip label={`Filters (${Object.values(filters).filter(Boolean).length})`} onDelete={handleClearFilters} size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" icon={RefreshIcon} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ sm: 12, md: 6 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Hospital Room & Bed Management
            </Typography>
          </Grid>
          <Grid size={{ sm: 12, md: 6 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Stack direction="row" spacing={1}>
              <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
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
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {showStats && renderStatsDashboard()}
      {renderSearchAndFilter()}
      <Paper sx={{ bgcolor: "background.paper", boxShadow: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<FolderSpecialIcon />} iconPosition="start" label="Room Groups" id="tab-0" aria-controls="tabpanel-0" />
          <Tab icon={<MeetingRoomIcon />} iconPosition="start" label="Rooms" id="tab-1" aria-controls="tabpanel-1" />
          <Tab icon={<HotelIcon />} iconPosition="start" label="Beds" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <SmartButton text="Add Room Group" icon={AddIcon} onClick={() => handleAddRoomGroup()} color="primary" variant="contained" size="small" />
          </Box>
          <CustomGrid columns={roomGroupColumns} data={processedRoomGroups} maxHeight="calc(100vh - 400px)" emptyStateMessage="No room groups found" loading={isLoading} />
        </Box>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <SmartButton text="Add Room" icon={AddIcon} onClick={() => handleAddRoom()} color="primary" variant="contained" size="small" />
          </Box>
          <CustomGrid columns={roomListColumns} data={processedRooms} maxHeight="calc(100vh - 400px)" emptyStateMessage="No rooms found" loading={isLoading} />
        </Box>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <SmartButton text="Add Bed" icon={AddIcon} onClick={() => handleAddBed()} color="primary" variant="contained" size="small" />
          </Box>
          <CustomGrid columns={bedColumns} data={processedBeds} maxHeight="calc(100vh - 400px)" emptyStateMessage="No beds found" loading={isLoading} />
        </Box>
      </Paper>
      {showRoomGroupForm && <RoomGroupForm open={showRoomGroupForm} onClose={handleRoomGroupFormClose} initialData={selectedRoomGroup} viewOnly={formViewOnly} />}
      {showRoomListForm && (
        <RoomListForm
          open={showRoomListForm}
          onClose={handleRoomFormClose}
          initialData={selectedRoom}
          viewOnly={formViewOnly}
          roomGroups={roomGroups.filter((g) => g.rActiveYN === "Y")}
        />
      )}

      {showBedForm && (
        <BedForm
          open={showBedForm}
          onClose={handleBedFormClose}
          initialData={selectedBed}
          viewOnly={formViewOnly}
          roomGroups={roomGroups.filter((g) => g.rActiveYN === "Y")}
          roomLists={roomLists.filter((r) => r.rActiveYN === "Y")}
        />
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={
          itemToDelete
            ? `Are you sure you want to delete ${
                itemToDelete.type === "roomGroup"
                  ? `room group "${itemToDelete.name}"`
                  : itemToDelete.type === "room"
                  ? `room "${itemToDelete.name}"`
                  : `bed "${itemToDelete.name}"`
              }?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default EnhancedBedSetupPage;
