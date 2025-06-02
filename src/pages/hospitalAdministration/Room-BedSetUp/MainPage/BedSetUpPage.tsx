import React, { useState, useCallback, useMemo } from "react";
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
  LinearProgress,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
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
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Info as InfoIcon,
  Circle as CircleIcon,
  FilterAltOutlined as FilterAltOutlinedIcon,
} from "@mui/icons-material";

import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
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

const EnhancedBedSetupPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { roomGroups, roomLists, beds, isLoading, error, fetchAllData, deleteRoomGroup, deleteRoom, deleteBed, getRoomGroupById, getRoomById, getBedById } = useBedSetup();

  // Base state
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    roomGroup: "",
  });

  // Form states
  const [showRoomGroupForm, setShowRoomGroupForm] = useState(false);
  const [showRoomListForm, setShowRoomListForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomGroup, setSelectedRoomGroup] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [formViewOnly, setFormViewOnly] = useState(false);

  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // UI states
  const [showStats, setShowStats] = useState(true);
  const [showTrends, setShowTrends] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedBeds, setExpandedBeds] = useState(new Set()); // New state for bed hierarchy
  const [gridDensity, setGridDensity] = useState("medium");
  const [isSubGroup, setIsSubGroup] = useState(false);
  const [trendView, setTrendView] = useState("occupancy");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  // Basic handlers
  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchAllData().finally(() => setLoading(false));
  }, [fetchAllData, setLoading]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterChange = (field, value) => {
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

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  // Room group expansion handlers
  const toggleExpand = (groupId) => {
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

  const expandAll = () => {
    const allGroupIds = new Set();
    const collectIds = (groups) => {
      groups.forEach((group) => {
        if (group.children && group.children.length > 0) {
          allGroupIds.add(group.rGrpID);
          collectIds(group.children);
        }
      });
    };
    collectIds(roomGroupHierarchy);
    setExpandedGroups(allGroupIds);
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Bed expansion handlers
  const toggleBedExpand = (bedId) => {
    setExpandedBeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bedId)) {
        newSet.delete(bedId);
      } else {
        newSet.add(bedId);
      }
      return newSet;
    });
  };

  const expandAllBeds = () => {
    const allBedIds = new Set();
    bedHierarchy.forEach((bed) => {
      if (bed.children && bed.children.length > 0) {
        allBedIds.add(bed.bedID);
      }
    });
    setExpandedBeds(allBedIds);
  };

  const collapseAllBeds = () => {
    setExpandedBeds(new Set());
  };

  // Room Group handlers
  const handleAddRoomGroup = (parentGroup?: RoomGroupDto) => {
    if (parentGroup) {
      setSelectedRoomGroup({
        rGrpID: 0,
        rGrpName: "",
        key: parentGroup.rGrpID,
        deptName: parentGroup.deptName,
        rActiveYN: "Y",
        parentGroupName: parentGroup.rGrpName,
        parentId: parentGroup.rGrpID,
        isParent: false,
      });
      setIsSubGroup(true);

      setExpandedGroups((prev) => {
        const newSet = new Set(prev);
        newSet.add(parentGroup.rGrpID);
        return newSet;
      });
    } else {
      setSelectedRoomGroup(null);
      setIsSubGroup(false);
    }
    setFormViewOnly(false);
    setShowRoomGroupForm(true);
  };

  const handleEditRoomGroup = async (roomGroup) => {
    setLoading(true);
    try {
      const data = await getRoomGroupById(roomGroup.rGrpID);
      if (data) {
        setSelectedRoomGroup(data);
        setIsSubGroup(data.key !== 0);
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

  const handleViewRoomGroup = async (roomGroup) => {
    setLoading(true);
    try {
      const data = await getRoomGroupById(roomGroup.rGrpID);
      if (data) {
        setSelectedRoomGroup(data);
        setIsSubGroup(data.key !== 0);
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

  const handleRoomGroupFormClose = (refreshData) => {
    setShowRoomGroupForm(false);
    setSelectedRoomGroup(null);
    setIsSubGroup(false);
    if (refreshData) {
      if (selectedRoomGroup?.key && selectedRoomGroup.key !== 0) {
        setExpandedGroups((prev) => {
          const newSet = new Set(prev);
          newSet.add(selectedRoomGroup.key);
          return newSet;
        });
      }
      handleRefresh();
    }
  };

  // Room handlers
  const handleAddRoom = (roomGroup?: RoomGroupDto) => {
    setSelectedRoom(roomGroup ? { rgrpID: roomGroup.rGrpID } : null);
    setFormViewOnly(false);
    setShowRoomListForm(true);
  };

  const handleEditRoom = async (room) => {
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

  const handleViewRoom = async (room) => {
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

  const handleRoomFormClose = (refreshData) => {
    setShowRoomListForm(false);
    setSelectedRoom(null);
    if (refreshData) {
      handleRefresh();
    }
  };

  // Bed handlers
  const handleAddBed = (room?: RoomListDto) => {
    if (room) {
      const roomGroup = roomGroups.find((rg) => rg.rGrpID === room.rgrpID);
      setSelectedBed({
        rlID: room.rlID,
        rgrpID: room.rgrpID,
        roomGroupName: roomGroup?.rGrpName,
      });
    } else {
      setSelectedBed(null);
    }
    setFormViewOnly(false);
    setShowBedForm(true);
  };

  // Enhanced cradle handler
  const handleAddCradle = (parentBed?: WrBedDto) => {
    if (parentBed) {
      const associatedRoom = roomLists.find((room) => room.rlID === parentBed.rlID);
      const associatedRoomGroup = roomGroups.find((group) => group.rGrpID === parentBed.rgrpID);

      setSelectedBed({
        bedID: 0,
        bedName: "",
        rlID: parentBed.rlID,
        rgrpID: parentBed.rgrpID,
        rActiveYN: "Y",
        rNotes: `Cradle under bed: ${parentBed.bedName}`,
        bchID: parentBed.bchID || null,
        bchName: parentBed.bchName || "",
        bedRemarks: "",
        blockBedYN: "N",
        key: parentBed.bedID,
        transferYN: "N",
        wbCatID: parentBed.wbCatID || null,
        wbCatName: parentBed.wbCatName || "",
        bedStatusValue: "AVLBL",
        bedStatus: "Available",
        roomList: {
          rName: associatedRoom?.rName || "",
          roomGroup: associatedRoomGroup
            ? {
                rGrpID: associatedRoomGroup.rGrpID,
                rGrpName: associatedRoomGroup.rGrpName,
              }
            : undefined,
        },
        parentBedName: parentBed.bedName,
        parentBedId: parentBed.bedID,
      });

      // Auto-expand the parent bed to show the new cradle will be added
      setExpandedBeds((prev) => {
        const newSet = new Set(prev);
        newSet.add(parentBed.bedID);
        return newSet;
      });
    } else {
      setSelectedBed(null);
    }
    setFormViewOnly(false);
    setShowBedForm(true);
  };

  const handleEditBed = async (bed) => {
    setLoading(true);
    try {
      const data = await getBedById(bed.bedID);
      if (data) {
        const enrichedBedData = { ...data };

        // Handle room list information
        if (!enrichedBedData.roomList && enrichedBedData.rlID) {
          const associatedRoom = roomLists.find((room) => room.rlID === enrichedBedData.rlID);
          if (associatedRoom) {
            enrichedBedData.roomList = {
              rName: associatedRoom.rName,
              roomGroup: associatedRoom.roomGroup
                ? {
                    rGrpID: associatedRoom.rgrpID,
                    rGrpName: associatedRoom.roomGroup.rGrpName,
                    deptID: associatedRoom.deptID,
                    deptName: associatedRoom.deptName,
                  }
                : undefined,
            };
            if (!enrichedBedData.rgrpID && associatedRoom.rgrpID) {
              enrichedBedData.rgrpID = associatedRoom.rgrpID;
            }
          }
        }

        // Handle room group information
        if (!enrichedBedData.roomList?.roomGroup && enrichedBedData.rgrpID) {
          const associatedRoomGroup = roomGroups.find((group) => group.rGrpID === enrichedBedData.rgrpID);
          if (associatedRoomGroup) {
            if (!enrichedBedData.roomList) {
              enrichedBedData.roomList = {
                rName: "",
                roomGroup: undefined,
              };
            }
            enrichedBedData.roomList.roomGroup = {
              rGrpID: associatedRoomGroup.rGrpID,
              rGrpName: associatedRoomGroup.rGrpName,
              deptID: associatedRoomGroup.deptID,
              deptName: associatedRoomGroup.deptName,
            };
          }
        }

        // Handle parent bed information for cradles
        if (enrichedBedData.key && enrichedBedData.key > 0) {
          const parentBed = beds.find((b) => b.bedID === enrichedBedData.key);
          if (parentBed) {
            enrichedBedData.parentBedName = parentBed.bedName;
            enrichedBedData.parentBedId = parentBed.bedID;
          }
        }

        setSelectedBed(enrichedBedData);
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

  const handleViewBed = async (bed) => {
    setLoading(true);
    try {
      const data = await getBedById(bed.bedID);
      if (data) {
        const enrichedBedData = { ...data };

        // Handle room list information
        if (!enrichedBedData.roomList && enrichedBedData.rlID) {
          const associatedRoom = roomLists.find((room) => room.rlID === enrichedBedData.rlID);
          if (associatedRoom) {
            enrichedBedData.roomList = {
              rName: associatedRoom.rName,
              roomGroup: associatedRoom.roomGroup
                ? {
                    rGrpID: associatedRoom.rgrpID,
                    rGrpName: associatedRoom.roomGroup.rGrpName,
                    deptID: associatedRoom.deptID,
                    deptName: associatedRoom.deptName,
                  }
                : undefined,
            };
            if (!enrichedBedData.rgrpID && associatedRoom.rgrpID) {
              enrichedBedData.rgrpID = associatedRoom.rgrpID;
            }
          }
        }

        // Handle room group information
        if (!enrichedBedData.roomList?.roomGroup && enrichedBedData.rgrpID) {
          const associatedRoomGroup = roomGroups.find((group) => group.rGrpID === enrichedBedData.rgrpID);
          if (associatedRoomGroup) {
            if (!enrichedBedData.roomList) {
              enrichedBedData.roomList = {
                rName: "",
                roomGroup: undefined,
              };
            }
            enrichedBedData.roomList.roomGroup = {
              rGrpID: associatedRoomGroup.rGrpID,
              rGrpName: associatedRoomGroup.rGrpName,
              deptID: associatedRoomGroup.deptID,
              deptName: associatedRoomGroup.deptName,
            };
          }
        }

        // Handle parent bed information for cradles
        if (enrichedBedData.key && enrichedBedData.key > 0) {
          const parentBed = beds.find((b) => b.bedID === enrichedBedData.key);
          if (parentBed) {
            enrichedBedData.parentBedName = parentBed.bedName;
            enrichedBedData.parentBedId = parentBed.bedID;
          }
        }

        setSelectedBed(enrichedBedData);
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

  const handleBedFormClose = (refreshData) => {
    setShowBedForm(false);
    setSelectedBed(null);
    if (refreshData) {
      handleRefresh();
    }
  };

  // Delete handlers
  const handleDeleteClick = (type, item) => {
    setItemToDelete({
      type,
      id: type === "roomGroup" ? item.rGrpID : type === "room" ? item.rlID : item.bedID,
      name: type === "roomGroup" ? item.rGrpName : type === "room" ? item.rName : item.bedName,
      isCradle: type === "bed" && item.key && item.key > 0,
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

  // Filter handlers
  const handleTrendViewChange = (event, newView) => {
    if (newView !== null) {
      setTrendView(newView);
    }
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Data processing
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

  // Room group hierarchy
  const roomGroupHierarchy = useMemo(() => {
    const buildHierarchy = (groups) => {
      const map = new Map();
      const roots = [];

      groups.forEach((group) => {
        if (!map.has(group.key)) {
          map.set(group.key, []);
        }

        if (group.key !== 0) {
          map.get(group.key).push({ ...group, children: [] });
        }

        if (group.key === 0) {
          roots.push({ ...group, children: [] });
        }
      });

      const assignChildren = (group) => {
        if (map.has(group.rGrpID)) {
          group.children = map.get(group.rGrpID) || [];
          group.children.forEach(assignChildren);
        }
      };

      roots.forEach(assignChildren);
      return roots;
    };

    return buildHierarchy(filteredRoomGroups);
  }, [filteredRoomGroups]);

  // Enhanced bed hierarchy
  const bedHierarchy = useMemo(() => {
    const buildBedHierarchy = (beds) => {
      const bedMap = new Map();
      const parentBeds = [];

      // First, separate parent beds and cradles
      beds.forEach((bed) => {
        const isCradle = bed.key && bed.key > 0;

        if (!isCradle) {
          // This is a parent bed
          if (!bedMap.has(bed.bedID)) {
            bedMap.set(bed.bedID, []);
          }
          parentBeds.push({
            ...bed,
            children: [],
            isCradle: false,
            nestingLevel: 0,
            isParent: true,
          });
        } else {
          // This is a cradle
          if (!bedMap.has(bed.key)) {
            bedMap.set(bed.key, []);
          }
          bedMap.get(bed.key).push({
            ...bed,
            children: [],
            isCradle: true,
            nestingLevel: 1,
            isParent: false,
          });
        }
      });

      // Assign cradles to their parent beds
      parentBeds.forEach((parentBed) => {
        if (bedMap.has(parentBed.bedID)) {
          parentBed.children = bedMap.get(parentBed.bedID) || [];
        }
      });

      return parentBeds;
    };

    return buildBedHierarchy(filteredBeds);
  }, [filteredBeds]);

  const flattenedRoomGroups = useMemo(() => {
    const result = [];

    const flatten = (groups, level = 0, parentId = null, isLastInBranch = []) => {
      groups.forEach((group, index) => {
        const isLast = index === groups.length - 1;
        const currentIsLastInBranch = [...isLastInBranch, isLast];

        result.push({
          ...group,
          nestingLevel: level,
          isLastChild: isLast,
          isLastInBranch: currentIsLastInBranch,
          parentId,
        });

        if (expandedGroups.has(group.rGrpID) && group.children && group.children.length > 0) {
          flatten(group.children, level + 1, group.rGrpID, currentIsLastInBranch);
        }
      });
    };

    flatten(roomGroupHierarchy);
    return result;
  }, [roomGroupHierarchy, expandedGroups]);

  // Enhanced flattened beds with hierarchy
  const flattenedBeds = useMemo(() => {
    const result = [];

    const flatten = (beds, level = 0, parentId = null, isLastInBranch = []) => {
      beds.forEach((bed, index) => {
        const isLast = index === beds.length - 1;
        const currentIsLastInBranch = [...isLastInBranch, isLast];
        const hasCradles = bed.children && bed.children.length > 0;

        result.push({
          ...bed,
          nestingLevel: level,
          isLastChild: isLast,
          isLastInBranch: currentIsLastInBranch,
          parentId,
          hasCradles,
          cradleCount: hasCradles ? bed.children.length : 0,
        });

        if (expandedBeds.has(bed.bedID) && bed.children && bed.children.length > 0) {
          flatten(bed.children, level + 1, bed.bedID, currentIsLastInBranch);
        }
      });
    };

    flatten(bedHierarchy);
    return result;
  }, [bedHierarchy, expandedBeds]);

  const stats = useMemo(() => {
    const activeRoomGroups = roomGroups.filter((g) => g.rActiveYN === "Y").length;
    const activeRooms = roomLists.filter((r) => r.rActiveYN === "Y").length;
    const activeBeds = beds.filter((b) => b.rActiveYN === "Y").length;
    const occupiedBeds = beds.filter((b) => b.rActiveYN === "Y" && b.bedStatus === "Occupied").length;
    const cradles = beds.filter((b) => b.key && b.key > 0).length;
    const activeCradles = beds.filter((b) => b.key && b.key > 0 && b.rActiveYN === "Y").length;

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
      totalCradles: cradles,
      activeCradles,
      inactiveCradles: cradles - activeCradles,
      trends: {
        occupancy: [65, 70, 68, 72, 75, 73, 77],
        availability: [35, 30, 32, 28, 25, 27, 23],
      },
    };
  }, [roomGroups, roomLists, beds]);

  const processedRoomGroups = useMemo(() => {
    return flattenedRoomGroups.map((group) => ({
      ...group,
      children: undefined,
    }));
  }, [flattenedRoomGroups]);

  const processedRooms = useMemo(() => {
    return filteredRooms.map((room) => ({
      ...room,
      roomGroupName: room.roomGroup?.rGrpName || "No Group",
      roomGroup: undefined,
    }));
  }, [filteredRooms]);

  const processedBeds = useMemo(() => {
    return flattenedBeds.map((bed) => ({
      ...bed,
      roomName: bed.roomList?.rName || "No Room",
      groupName: bed.roomList?.roomGroup?.rGrpName || "No Group",
      parentBedName: bed.isCradle ? bedHierarchy.find((parent) => parent.bedID === bed.key)?.bedName || "Unknown" : undefined,
      roomList: undefined,
    }));
  }, [flattenedBeds, bedHierarchy]);

  const bedFormRoomGroups = useMemo(() => {
    return roomGroups;
  }, [roomGroups]);

  const bedFormRoomLists = useMemo(() => {
    return roomLists;
  }, [roomLists]);

  // Column definitions
  const roomGroupColumns = [
    {
      key: "rGrpName",
      header: "Room Group Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      render: (row) => {
        const hasChildren = row.children && row.children.length > 0;
        const isExpanded = expandedGroups.has(row.rGrpID);
        const isParent = row.key === 0;

        const TreeLines = () => {
          if (row.nestingLevel === 0) return null;

          return (
            <>
              {row.isLastInBranch?.slice(0, -1).map((isLast, i) =>
                isLast ? null : (
                  <Box
                    key={`vline-${i}`}
                    sx={{
                      position: "absolute",
                      left: 16 + i * 24,
                      top: 0,
                      bottom: 0,
                      width: 1.5,
                      bgcolor: "rgba(0, 0, 0, 0.08)",
                      zIndex: 1,
                    }}
                  />
                )
              )}

              <Box
                sx={{
                  position: "absolute",
                  left: 16 + (row.nestingLevel - 1) * 24,
                  width: 16,
                  height: 1.5,
                  top: "50%",
                  bgcolor: "rgba(0, 0, 0, 0.08)",
                  zIndex: 1,
                }}
              />
            </>
          );
        };

        return (
          <Box
            onClick={() => hasChildren && toggleExpand(row.rGrpID)}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              pl: row.nestingLevel ? row.nestingLevel * 2 : 0,
              py: 1,
              position: "relative",
              borderRadius: 1,
              cursor: hasChildren ? "pointer" : "default",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            {row.nestingLevel > 0 && <TreeLines />}

            <Box sx={{ display: "flex", alignItems: "center", ml: 1, position: "relative", zIndex: 2 }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(row.rGrpID);
                  }}
                  sx={{
                    transition: "all 0.2s ease",
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    color: isExpanded ? "primary.main" : "text.secondary",
                    p: 0.5,
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              ) : (
                <Box sx={{ width: 28 }} />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isParent ? "rgba(255, 152, 0, 0.1)" : "rgba(3, 169, 244, 0.1)",
                borderRadius: "50%",
                p: 0.8,
                mr: 1.5,
                border: "1px solid",
                borderColor: isParent ? "rgba(255, 152, 0, 0.5)" : "rgba(3, 169, 244, 0.5)",
                transition: "all 0.2s ease",
                position: "relative",
                zIndex: 2,
              }}
            >
              <FolderSpecialIcon
                fontSize="small"
                sx={{
                  color: isParent ? "warning.main" : "info.main",
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", zIndex: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isParent ? 500 : 400,
                    color: isParent ? "text.primary" : "text.secondary",
                    transition: "color 0.2s ease",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {row.rGrpName}
                </Typography>

                {hasChildren && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      ml: 1,
                      color: "text.disabled",
                      fontSize: "0.7rem",
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 1,
                    }}
                  >
                    {row.children.length}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {row.deptName || "No Department"}
                </Typography>

                {!isParent && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: 1,
                      bgcolor: "rgba(3, 169, 244, 0.08)",
                      px: 0.5,
                      py: 0.1,
                      borderRadius: 1,
                    }}
                  >
                    <SubdirectoryArrowRightIcon
                      sx={{
                        fontSize: "0.8rem",
                        color: "info.main",
                        mr: 0.5,
                        opacity: 0.7,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "info.main",
                        fontStyle: "italic",
                        fontSize: "0.7rem",
                      }}
                    >
                      {row.parentGroupName || "Subgroup"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Chip
              size="small"
              color={row.rActiveYN === "Y" ? "success" : "error"}
              label={row.rActiveYN === "Y" ? "Active" : "Inactive"}
              sx={{
                height: 20,
                ml: 1,
                position: "relative",
                zIndex: 2,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: "0.7rem",
                },
              }}
            />
          </Box>
        );
      },
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
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 300,
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
              <span>
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
                    <SubdirectoryArrowRightIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  const roomListColumns = [
    {
      key: "rName",
      header: "Room Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "roomGroupName",
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

  // Enhanced bed columns with hierarchical tree structure
  const bedColumns = [
    {
      key: "bedName",
      header: "Bed/Cradle Hierarchy",
      visible: true,
      sortable: true,
      filterable: true,
      width: 350,
      render: (row) => {
        const isCradle = row.isCradle;
        const hasCradles = row.hasCradles;
        const isExpanded = expandedBeds.has(row.bedID);

        const TreeLines = () => {
          if (row.nestingLevel === 0) return null;

          return (
            <>
              {row.isLastInBranch?.slice(0, -1).map((isLast, i) =>
                isLast ? null : (
                  <Box
                    key={`vline-${i}`}
                    sx={{
                      position: "absolute",
                      left: 16 + i * 24,
                      top: 0,
                      bottom: 0,
                      width: 1.5,
                      bgcolor: "rgba(156, 39, 176, 0.12)",
                      zIndex: 1,
                    }}
                  />
                )
              )}

              <Box
                sx={{
                  position: "absolute",
                  left: 16 + (row.nestingLevel - 1) * 24,
                  width: 16,
                  height: 1.5,
                  top: "50%",
                  bgcolor: "rgba(156, 39, 176, 0.12)",
                  zIndex: 1,
                }}
              />
            </>
          );
        };

        return (
          <Box
            onClick={() => hasCradles && toggleBedExpand(row.bedID)}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              pl: row.nestingLevel ? row.nestingLevel * 3 : 0,
              py: 1.5,
              position: "relative",
              borderRadius: 1,
              cursor: hasCradles ? "pointer" : "default",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: isCradle ? "rgba(156, 39, 176, 0.04)" : "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            {row.nestingLevel > 0 && <TreeLines />}

            {/* Expand/Collapse Button */}
            <Box sx={{ display: "flex", alignItems: "center", ml: 1, position: "relative", zIndex: 2 }}>
              {hasCradles ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBedExpand(row.bedID);
                  }}
                  sx={{
                    transition: "all 0.2s ease",
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    color: isExpanded ? "primary.main" : "text.secondary",
                    p: 0.5,
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              ) : (
                <Box sx={{ width: 28 }} />
              )}
            </Box>

            {/* Icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isCradle ? "rgba(156, 39, 176, 0.1)" : "rgba(25, 118, 210, 0.1)",
                borderRadius: "50%",
                p: 1,
                mr: 1.5,
                border: "1px solid",
                borderColor: isCradle ? "rgba(156, 39, 176, 0.3)" : "rgba(25, 118, 210, 0.3)",
                transition: "all 0.2s ease",
                position: "relative",
                zIndex: 2,
              }}
            >
              {isCradle ? (
                <Badge
                  color="secondary"
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "secondary.main",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                    },
                  }}
                >
                  <HotelIcon
                    fontSize="small"
                    sx={{
                      color: "secondary.main",
                      fontSize: "1rem",
                    }}
                  />
                </Badge>
              ) : (
                <HotelIcon
                  fontSize="small"
                  sx={{
                    color: "primary.main",
                    fontSize: "1.1rem",
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", zIndex: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isCradle ? 500 : 600,
                    color: isCradle ? "secondary.main" : "text.primary",
                    transition: "color 0.2s ease",
                    "&:hover": {
                      color: isCradle ? "secondary.dark" : "primary.main",
                    },
                  }}
                >
                  {row.bedName}
                </Typography>

                {hasCradles && (
                  <Chip
                    size="small"
                    label={`${row.cradleCount} cradle${row.cradleCount !== 1 ? "s" : ""}`}
                    sx={{
                      ml: 1,
                      height: 20,
                      bgcolor: "rgba(156, 39, 176, 0.1)",
                      color: "secondary.main",
                      "& .MuiChip-label": {
                        px: 1,
                        fontSize: "0.7rem",
                        fontWeight: 500,
                      },
                    }}
                  />
                )}

                {isCradle && (
                  <Chip
                    size="small"
                    label="Cradle"
                    sx={{
                      ml: 1,
                      height: 18,
                      bgcolor: "rgba(156, 39, 176, 0.15)",
                      color: "secondary.main",
                      "& .MuiChip-label": {
                        px: 0.8,
                        fontSize: "0.65rem",
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
              </Box>

              {/* Secondary information */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {row.roomName} • {row.groupName}
                </Typography>

                {isCradle && row.parentBedName && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: 1,
                      bgcolor: "rgba(156, 39, 176, 0.08)",
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                    }}
                  >
                    <SubdirectoryArrowRightIcon
                      sx={{
                        fontSize: "0.7rem",
                        color: "secondary.main",
                        mr: 0.5,
                        opacity: 0.8,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "secondary.main",
                        fontSize: "0.65rem",
                        fontWeight: 500,
                      }}
                    >
                      Under: {row.parentBedName}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Status indicator */}
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Chip
                size="small"
                color={row.bedStatus === "Available" ? "success" : row.bedStatus === "Occupied" ? "error" : "default"}
                label={row.bedStatus || "Unknown"}
                sx={{
                  height: 22,
                  "& .MuiChip-label": {
                    px: 1,
                    fontSize: "0.7rem",
                    fontWeight: 500,
                  },
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      key: "roomName",
      header: "Room",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "groupName",
      header: "Room Group",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "rActiveYN",
      header: "Active",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value) => (
        <Chip
          size="small"
          color={value === "Y" ? "success" : "error"}
          label={value === "Y" ? "Yes" : "No"}
          sx={{
            height: 22,
            "& .MuiChip-label": {
              fontSize: "0.7rem",
              fontWeight: 500,
            },
          }}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 220,
      render: (row) => {
        const isCradle = row.isCradle;

        return (
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
                bgcolor: "rgba(244, 67, 54, 0.08)",
                "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            {!isCradle && (
              <Tooltip title={`Add Cradle to ${row.bedName}`}>
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleAddCradle(row)}
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
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  // Render functions
  const renderHeader = () => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", borderRadius: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ mr: 2, color: "primary.main" }}>
            <DashboardIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
              Hospital Room & Bed Management
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<ExpandLessIcon />} onClick={() => setShowStats(!showStats)} sx={{ height: 32 }}>
            {showStats ? "Hide Statistics" : "Show Statistics"}
          </Button>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isLoading} sx={{ height: 32 }}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outlined" size="small" color="primary" startIcon={<SettingsIcon />} sx={{ height: 32 }}>
            Settings
          </Button>
        </Stack>
      </Box>
    </Paper>
  );

  const renderDashboard = () => (
    <Box sx={{ mb: 2, display: showStats ? "block" : "none" }}>
      <Paper sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <DashboardIcon sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 500 }}>
              Room-Bed Setup Statistics
            </Typography>
            <Chip label="Real-time" size="small" color="primary" variant="outlined" sx={{ ml: 1, height: 20, "& .MuiChip-label": { px: 1, fontSize: "0.7rem" } }} />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Room Groups Stats */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "primary.50",
                      color: "primary.main",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <FolderSpecialIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" color="primary.main">
                    Room Groups
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stats.totalRoomGroups}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Active:</Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      {stats.activeRoomGroups}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.activeRoomGroups / Math.max(1, stats.totalRoomGroups)) * 100}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Rooms Stats */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "secondary.50",
                      color: "secondary.main",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <MeetingRoomIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" color="secondary.main">
                    Rooms
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stats.totalRooms}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Active:</Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      {stats.activeRooms}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(stats.activeRooms / Math.max(1, stats.totalRooms)) * 100} color="success" sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Beds Stats */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "success.50",
                      color: "success.main",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <HotelIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" color="success.main">
                    Beds
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stats.totalBeds}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Available:</Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      {stats.availableBeds}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(stats.availableBeds / Math.max(1, stats.activeBeds)) * 100} color="success" sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Cradles Stats */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "secondary.50",
                      color: "secondary.main",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
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
                  </Box>
                  <Typography variant="subtitle1" color="secondary.main">
                    Cradles
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Total:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stats.totalCradles}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">Active:</Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      {stats.activeCradles}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(stats.activeCradles / Math.max(1, stats.totalCradles)) * 100} color="success" sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const renderSearch = () => (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.paper", borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
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

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button size="small" startIcon={<FilterAltOutlinedIcon />} onClick={handleFilterMenuOpen} sx={{ textTransform: "none" }}>
              Filter
            </Button>
            <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterMenuClose}>
              <MenuItem>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  Status
                </Typography>
              </MenuItem>
            </Menu>

            {Object.values(filters).some(Boolean) && (
              <Chip
                label={`Filters (${Object.values(filters).filter(Boolean).length})`}
                onDelete={handleClearFilters}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
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
      {renderHeader()}
      {renderDashboard()}
      {renderSearch()}

      <Paper sx={{ bgcolor: "background.paper", borderRadius: 1, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minHeight: 48,
              fontWeight: 500,
            },
          }}
        >
          <Tab icon={<FolderSpecialIcon fontSize="small" />} iconPosition="start" label="Room Groups" id="tab-0" aria-controls="tabpanel-0" />
          <Tab icon={<MeetingRoomIcon fontSize="small" />} iconPosition="start" label="Rooms" id="tab-1" aria-controls="tabpanel-1" />
          <Tab icon={<HotelIcon fontSize="small" />} iconPosition="start" label="Beds" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 1 }}>
                Groups and Subgroups
              </Typography>
              <Chip label={`Total: ${filteredRoomGroups.length}`} size="small" color="primary" variant="outlined" />
            </Box>
            <Stack direction="row" spacing={1}>
              <SmartButton text="Expand All" icon={UnfoldMoreIcon} onClick={expandAll} color="info" variant="outlined" size="small" />
              <SmartButton text="Collapse All" icon={UnfoldLessIcon} onClick={collapseAll} color="info" variant="outlined" size="small" />
              <SmartButton text="Add Room Group" icon={AddIcon} onClick={() => handleAddRoomGroup()} color="primary" variant="contained" size="small" />
            </Stack>
          </Box>
          <CustomGrid columns={roomGroupColumns} data={processedRoomGroups} maxHeight="calc(100vh - 400px)" emptyStateMessage="No room groups found" loading={isLoading} />
        </Box>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 1 }}>
                Hospital Rooms
              </Typography>
              <Chip label={`Total: ${filteredRooms.length}`} size="small" color="primary" variant="outlined" />
            </Box>
            <SmartButton text="Add Room" icon={AddIcon} onClick={() => handleAddRoom()} color="primary" variant="contained" size="small" />
          </Box>
          <CustomGrid columns={roomListColumns} data={processedRooms} maxHeight="calc(100vh - 400px)" emptyStateMessage="No rooms found" loading={isLoading} />
        </Box>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Bed & Cradle Hierarchy
              </Typography>
              <Chip label={`Beds: ${bedHierarchy.length}`} size="small" color="primary" variant="outlined" />
              <Chip label={`Cradles: ${flattenedBeds.filter((bed) => bed.isCradle).length}`} size="small" color="secondary" variant="outlined" />
              <Chip label={`Total: ${flattenedBeds.length}`} size="small" color="info" variant="filled" />
            </Box>
            <Stack direction="row" spacing={1}>
              <SmartButton text="Expand All" icon={UnfoldMoreIcon} onClick={expandAllBeds} color="info" variant="outlined" size="small" />
              <SmartButton text="Collapse All" icon={UnfoldLessIcon} onClick={collapseAllBeds} color="info" variant="outlined" size="small" />
              <SmartButton text="Add Bed" icon={AddIcon} onClick={() => handleAddBed()} color="primary" variant="contained" size="small" />
            </Stack>
          </Box>
          <CustomGrid columns={bedColumns} data={processedBeds} maxHeight="calc(100vh - 400px)" emptyStateMessage="No beds or cradles found" loading={isLoading} />
        </Box>
      </Paper>

      {showRoomGroupForm && (
        <RoomGroupForm open={showRoomGroupForm} onClose={handleRoomGroupFormClose} initialData={selectedRoomGroup} viewOnly={formViewOnly} isSubGroup={isSubGroup} />
      )}

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
        <BedForm open={showBedForm} onClose={handleBedFormClose} initialData={selectedBed} viewOnly={formViewOnly} roomGroups={bedFormRoomGroups} roomLists={bedFormRoomLists} />
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
                  : itemToDelete.isCradle
                  ? `cradle "${itemToDelete.name}"`
                  : `bed "${itemToDelete.name}"`
              }?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />

      <Box sx={{ position: "fixed", bottom: 20, right: 20 }}>
        <Tooltip title="Back to top">
          <IconButton
            color="primary"
            sx={{
              bgcolor: "white",
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.50" },
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default EnhancedBedSetupPage;
