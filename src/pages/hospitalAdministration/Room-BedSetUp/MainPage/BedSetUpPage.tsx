import React, { useState, useCallback, useMemo } from "react";
import { Box, Paper, Typography, Grid, Tabs, Tab, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
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
  Category as SubGroupCategoryIcon,
} from "@mui/icons-material";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import RoomGroupForm from "../Forms/RoomGroupForm";
import RoomListForm from "../Forms/RoomListForm";
import BedForm from "../Forms/WrBedsFrom";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import useBedSetup from "../hooks/useRoomBedSetUp";
import { debounce } from "@/utils/Common/debounceUtils";
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const BedSetupPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { roomGroups, roomLists, beds, isLoading, error, fetchAllData, deleteRoomGroup, deleteRoom, deleteBed, getRoomGroupById, getRoomById, getBedById } = useBedSetup();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedBeds, setExpandedBeds] = useState<Set<number>>(new Set());
  const [showRoomGroupForm, setShowRoomGroupForm] = useState(false);
  const [showRoomListForm, setShowRoomListForm] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomListDto | null>(null);
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [formViewOnly, setFormViewOnly] = useState(false);
  const [isSubGroup, setIsSubGroup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: string;
    id: number;
    name: string;
    isCradle?: boolean;
  } | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    department: "",
    roomGroup: "",
  });
  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);
  const handleRefresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      department: "",
      roomGroup: "",
    });
  }, []);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const toggleExpand = useCallback((groupId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const toggleBedExpand = useCallback((bedId: number) => {
    setExpandedBeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bedId)) {
        newSet.delete(bedId);
      } else {
        newSet.add(bedId);
      }
      return newSet;
    });
  }, []);

  const filteredRoomGroups = useMemo(() => {
    return roomGroups.filter((group) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        group.rGrpName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        group.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = filters.status === "" || (filters.status === "active" && group.rActiveYN === "Y") || (filters.status === "inactive" && group.rActiveYN === "N");
      const matchesDepartment = filters.department === "" || group.deptName === filters.department;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [roomGroups, debouncedSearchTerm, filters]);

  const filteredRooms = useMemo(() => {
    return roomLists.filter((room) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        room.rName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        room.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        room.rLocation?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = filters.status === "" || (filters.status === "active" && room.rActiveYN === "Y") || (filters.status === "inactive" && room.rActiveYN === "N");
      const matchesDepartment = filters.department === "" || room.deptName === filters.department;
      const matchesRoomGroup = filters.roomGroup === "" || room.rgrpID?.toString() === filters.roomGroup;
      return matchesSearch && matchesStatus && matchesDepartment && matchesRoomGroup;
    });
  }, [roomLists, debouncedSearchTerm, filters]);

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        bed.bedName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        bed.roomList?.rName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        bed.roomList?.roomGroup?.rGrpName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = filters.status === "" || (filters.status === "active" && bed.rActiveYN === "Y") || (filters.status === "inactive" && bed.rActiveYN === "N");
      const matchesRoomGroup = filters.roomGroup === "" || bed.roomList?.roomGroup?.rGrpID?.toString() === filters.roomGroup;
      return matchesSearch && matchesStatus && matchesRoomGroup;
    });
  }, [beds, debouncedSearchTerm, filters]);

  const roomGroupHierarchy = useMemo(() => {
    const buildHierarchy = (groups: RoomGroupDto[]) => {
      const map = new Map<number, RoomGroupDto[]>();
      const roots: RoomGroupDto[] = [];
      groups.forEach((group) => {
        const parentKey = group.key || 0;

        if (!map.has(parentKey)) {
          map.set(parentKey, []);
        }
        if (parentKey === 0) {
          roots.push({ ...group, children: [] });
        } else {
          map.get(parentKey)?.push({ ...group, children: [] });
        }
      });
      const assignChildren = (group: any) => {
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

  const bedHierarchy = useMemo(() => {
    const buildBedHierarchy = (beds: WrBedDto[]) => {
      const bedMap = new Map<number, WrBedDto[]>();
      const parentBeds: any[] = [];
      beds.forEach((bed) => {
        const isCradle = bed.key && bed.key > 0;
        if (!isCradle) {
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
          if (!bedMap.has(bed.key)) {
            bedMap.set(bed.key, []);
          }
          bedMap.get(bed.key)?.push({
            ...bed,
            children: [],
            isCradle: true,
            nestingLevel: 1,
            isParent: false,
          });
        }
      });

      parentBeds.forEach((parentBed) => {
        if (bedMap.has(parentBed.bedID)) {
          parentBed.children = bedMap.get(parentBed.bedID) || [];
        }
      });

      return parentBeds;
    };

    return buildBedHierarchy(filteredBeds);
  }, [filteredBeds]);

  const expandAll = useCallback(() => {
    const allGroupIds = new Set<number>();
    const collectIds = (groups: any[]) => {
      groups.forEach((group) => {
        if (group.children && group.children.length > 0) {
          allGroupIds.add(group.rGrpID);
          collectIds(group.children);
        }
      });
    };
    collectIds(roomGroupHierarchy);
    setExpandedGroups(allGroupIds);
  }, [roomGroupHierarchy]);

  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const expandAllBeds = useCallback(() => {
    const allBedIds = new Set<number>();
    bedHierarchy.forEach((bed) => {
      if (bed.children && bed.children.length > 0) {
        allBedIds.add(bed.bedID);
      }
    });
    setExpandedBeds(allBedIds);
  }, [bedHierarchy]);

  const collapseAllBeds = useCallback(() => {
    setExpandedBeds(new Set());
  }, []);

  const handleAddRoomGroup = useCallback((parentGroup?: RoomGroupDto) => {
    if (parentGroup) {
      setSelectedRoomGroup({
        rGrpID: 0,
        rGrpName: "",
        rGrpCode: "",
        key: parentGroup.rGrpID,
        deptName: parentGroup.deptName,
        deptID: parentGroup.deptID,
        rActiveYN: "Y",
        parentGroupName: parentGroup.rGrpName,
        parentId: parentGroup.rGrpID,
        isParent: false,
        groupYN: "Y",
        showinboYN: "Y",
        teachingYN: "N",
        transferYN: "N",
        gender: parentGroup.gender || "",
        genderValue: parentGroup.genderValue || "",
        rGrpTypeValue: parentGroup.rGrpTypeValue || "",
      } as RoomGroupDto);
      setIsSubGroup(true);
    } else {
      setSelectedRoomGroup({
        rGrpID: 0,
        rGrpName: "",
        rGrpCode: "",
        key: 0,
        deptID: 0,
        deptName: "",
        rActiveYN: "Y",
        isParent: true,
        groupYN: "Y",
        showinboYN: "Y",
        teachingYN: "N",
        transferYN: "N",
        gender: "",
        genderValue: "",
        rGrpTypeValue: "",
      } as RoomGroupDto);
      setIsSubGroup(false);
    }
    setFormViewOnly(false);
    setShowRoomGroupForm(true);
  }, []);

  const handleEditRoomGroup = useCallback(
    async (roomGroup: RoomGroupDto) => {
      debugger;
      setLoading(true);
      try {
        const data = await getRoomGroupById(roomGroup.rGrpID);
        if (data) {
          const isSubGroup = data.key !== undefined && data.key !== null && data.key > 0;
          if (isSubGroup && data.key > 0) {
            const parentGroup = await getRoomGroupById(data.key);
            if (parentGroup) {
              const enhancedData = {
                ...data,
                parentGroup: parentGroup,
                parentGroupName: parentGroup.rGrpName,
              };
              setSelectedRoomGroup(enhancedData);
            } else {
              const fallbackParent = roomGroups.find((group) => group.rGrpID === data.key);
              const enhancedData = {
                ...data,
                parentGroupName: fallbackParent?.rGrpName || "Unknown Group",
              };
              setSelectedRoomGroup(enhancedData);
            }
          } else {
            setSelectedRoomGroup(data);
          }

          setIsSubGroup(isSubGroup);
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
    },
    [getRoomGroupById, showAlert, roomGroups]
  );

  const handleViewRoomGroup = useCallback(
    async (roomGroup: RoomGroupDto) => {
      setLoading(true);
      try {
        const data = await getRoomGroupById(roomGroup.rGrpID);
        if (data) {
          const isSubGroup = data.key !== undefined && data.key !== null && data.key > 0;
          if (isSubGroup && data.key > 0) {
            const parentGroup = await getRoomGroupById(data.key);
            if (parentGroup) {
              const enhancedData = {
                ...data,
                parentGroup: parentGroup,
                parentGroupName: parentGroup.rGrpName,
              };
              setSelectedRoomGroup(enhancedData);
            } else {
              const fallbackParent = roomGroups.find((group) => group.rGrpID === data.key);
              const enhancedData = {
                ...data,
                parentGroupName: fallbackParent?.rGrpName || "Unknown Group",
              };
              setSelectedRoomGroup(enhancedData);
            }
          } else {
            setSelectedRoomGroup(data);
          }

          setIsSubGroup(isSubGroup);
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
    },
    [getRoomGroupById, showAlert, roomGroups]
  );

  const handleRoomGroupFormClose = useCallback(
    (refreshData?: boolean) => {
      setShowRoomGroupForm(false);
      setSelectedRoomGroup(null);
      setIsSubGroup(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleAddRoom = useCallback((roomGroup?: RoomGroupDto) => {
    setSelectedRoom(roomGroup ? ({ rgrpID: roomGroup.rGrpID } as RoomListDto) : null);
    setFormViewOnly(false);
    setShowRoomListForm(true);
  }, []);

  const handleEditRoom = useCallback(
    async (room: RoomListDto) => {
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
    },
    [getRoomById, showAlert]
  );

  const handleViewRoom = useCallback(
    async (room: RoomListDto) => {
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
    },
    [getRoomById, showAlert]
  );

  const handleRoomFormClose = useCallback(
    (refreshData?: boolean) => {
      setShowRoomListForm(false);
      setSelectedRoom(null);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleAddBed = useCallback(
    (room?: RoomListDto) => {
      if (room) {
        const roomGroup = roomGroups.find((rg) => rg.rGrpID === room.rgrpID);
        setSelectedBed({
          bedID: 0,
          bedName: "",
          rlID: room.rlID,
          rgrpID: room.rgrpID,
          roomGroupName: roomGroup?.rGrpName,
          rActiveYN: "Y",
          key: 0,
          roomList: {
            rName: room.rName,
            roomGroup: {
              rGrpID: roomGroup?.rGrpID || 0,
              rGrpName: roomGroup?.rGrpName || "",
              deptID: roomGroup?.deptID || 0,
              deptName: roomGroup?.deptName || "",
            },
          },
        } as WrBedDto);
      } else {
        setSelectedBed(null);
      }
      setFormViewOnly(false);
      setShowBedForm(true);
    },
    [roomGroups]
  );

  const handleAddCradle = useCallback(
    async (parentBed?: WrBedDto) => {
      if (parentBed) {
        setLoading(true);
        try {
          const bedDetails = await getBedById(parentBed.bedID);
          if (bedDetails) {
            const associatedRoom = roomLists.find((room) => room.rlID === bedDetails.rlID);
            const associatedRoomGroup = roomGroups.find((group) => group.rGrpID === bedDetails.rgrpID);

            setSelectedBed({
              bedID: 0,
              bedName: "",
              rlID: bedDetails.rlID,
              rgrpID: bedDetails.rgrpID,
              rActiveYN: "Y",
              rNotes: `Cradle under bed: ${bedDetails.bedName}`,
              key: bedDetails.bedID,
              parentBedName: bedDetails.bedName,
              parentBedId: bedDetails.bedID,
              transferYN: "N",
              blockBedYN: "N",
              bedStatusValue: "AVLBL",
              bedStatus: "Available",
              roomList: {
                rName: associatedRoom?.rName || "Unknown Room",
                roomGroup: {
                  rGrpID: associatedRoomGroup?.rGrpID || 0,
                  rGrpName: associatedRoomGroup?.rGrpName || "Unknown Group",
                  deptID: associatedRoomGroup?.deptID || 0,
                  deptName: associatedRoomGroup?.deptName || "Unknown Department",
                },
              },
            } as WrBedDto);
            setExpandedBeds((prev) => new Set([...prev, bedDetails.bedID]));
          } else {
            throw new Error("Failed to load parent bed details");
          }
        } catch (error) {
          showAlert("Error", error instanceof Error ? error.message : "Failed to load parent bed details", "error");
          return;
        } finally {
          setLoading(false);
        }
      } else {
        setSelectedBed(null);
      }
      setFormViewOnly(false);
      setShowBedForm(true);
    },
    [roomLists, roomGroups, getBedById, showAlert]
  );

  const handleEditBed = useCallback(
    async (bed: WrBedDto) => {
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
    },
    [getBedById, showAlert]
  );

  const handleViewBed = useCallback(
    async (bed: WrBedDto) => {
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
    },
    [getBedById, showAlert]
  );

  const handleBedFormClose = useCallback(
    (refreshData?: boolean) => {
      setShowBedForm(false);
      setSelectedBed(null);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleDeleteClick = useCallback((type: string, item: any) => {
    setItemToDelete({
      type,
      id: type === "roomGroup" ? item.rGrpID : type === "room" ? item.rlID : item.bedID,
      name: type === "roomGroup" ? item.rGrpName : type === "room" ? item.rName : item.bedName,
      isCradle: type === "bed" && item.key && item.key > 0,
    });
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;

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
        showAlert("Success", `${itemToDelete.type} deleted successfully`, "success");
        handleRefresh();
      } else {
        throw new Error(`Failed to delete ${itemToDelete.type}`);
      }
    } catch (error) {
      showAlert("Error", `Failed to delete ${itemToDelete.type}`, "error");
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteRoomGroup, deleteRoom, deleteBed, showAlert, handleRefresh]);

  const flattenedRoomGroups = useMemo(() => {
    const result: any[] = [];
    const flatten = (groups: any[], level = 0, parentId: number | null = null) => {
      groups.forEach((group, index) => {
        const isLast = index === groups.length - 1;
        result.push({
          ...group,
          nestingLevel: level,
          isLastChild: isLast,
          parentId,
        });

        if (expandedGroups.has(group.rGrpID) && group.children && group.children.length > 0) {
          flatten(group.children, level + 1, group.rGrpID);
        }
      });
    };

    flatten(roomGroupHierarchy);
    return result;
  }, [roomGroupHierarchy, expandedGroups]);

  const flattenedBeds = useMemo(() => {
    const result: any[] = [];
    const flatten = (beds: any[], level = 0, parentId: number | null = null) => {
      beds.forEach((bed, index) => {
        const isLast = index === beds.length - 1;
        const hasCradles = bed.children && bed.children.length > 0;
        result.push({
          ...bed,
          nestingLevel: level,
          isLastChild: isLast,
          parentId,
          hasCradles,
          cradleCount: hasCradles ? bed.children.length : 0,
        });
        if (expandedBeds.has(bed.bedID) && bed.children && bed.children.length > 0) {
          flatten(bed.children, level + 1, bed.bedID);
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
      totalRooms: roomLists.length,
      activeRooms,
      totalBeds: beds.length,
      activeBeds,
      occupiedBeds,
      availableBeds: activeBeds - occupiedBeds,
      totalCradles: cradles,
      activeCradles,
    };
  }, [roomGroups, roomLists, beds]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Room Groups</Typography>
          <Typography variant="h4" color="primary.main">
            {stats.totalRoomGroups}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.activeRoomGroups} Active
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Rooms</Typography>
          <Typography variant="h4" color="info.main">
            {stats.totalRooms}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.activeRooms} Active
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Beds</Typography>
          <Typography variant="h4" color="success.main">
            {stats.totalBeds}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.availableBeds} Available
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Cradles</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.totalCradles}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.activeCradles} Active
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const roomGroupColumns: Column<any>[] = [
    {
      key: "rGrpName",
      header: "Room Group Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 350,
      render: (row) => {
        const hasChildren = row.children && row.children.length > 0;
        const isExpanded = expandedGroups.has(row.rGrpID);
        const isParent = row.key === 0;
        return (
          <Box sx={{ display: "flex", alignItems: "center", pl: row.nestingLevel * 3 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => toggleExpand(row.rGrpID)} sx={{ mr: 1 }}>
                <ExpandMoreIcon
                  sx={{
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )}

            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <FolderSpecialIcon
                sx={{
                  mr: 1,
                  color: isParent ? "warning.main" : "info.main",
                }}
              />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: isParent ? 600 : 400 }}>
                  {row.rGrpName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.deptName || "No Department"}
                </Typography>
              </Box>
            </Box>

            <Chip size="small" color={row.rActiveYN === "Y" ? "success" : "error"} label={row.rActiveYN === "Y" ? "Active" : "Inactive"} />
          </Box>
        );
      },
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
              bgcolor: "rgba(244, 67, 54, 0.08)",
              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
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
                <SubGroupCategoryIcon fontSize="small" />
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
      width: 200,
    },
    {
      key: "roomGroupName",
      header: "Room Group",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "No Group",
    },
    {
      key: "rLocation",
      header: "Location",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string) => value || "No Department",
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
              bgcolor: "rgba(244, 67, 54, 0.08)",
              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
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
              <HotelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const bedColumns: Column<any>[] = [
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

        return (
          <Box sx={{ display: "flex", alignItems: "center", pl: row.nestingLevel * 3 }}>
            {hasCradles ? (
              <IconButton size="small" onClick={() => toggleBedExpand(row.bedID)} sx={{ mr: 1 }}>
                <ExpandMoreIcon
                  sx={{
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )}

            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <HotelIcon
                sx={{
                  mr: 1,
                  color: isCradle ? "secondary.main" : "primary.main",
                  fontSize: isCradle ? "1rem" : "1.2rem",
                }}
              />
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isCradle ? 400 : 500,
                    color: isCradle ? "secondary.main" : "text.primary",
                  }}
                >
                  {row.bedName}
                  {isCradle && <Chip size="small" label="Cradle" sx={{ ml: 1, height: 18 }} color="secondary" />}
                  {hasCradles && <Chip size="small" label={`${row.cradleCount} cradle${row.cradleCount !== 1 ? "s" : ""}`} sx={{ ml: 1, height: 18 }} color="info" />}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.roomName || row.roomList?.rName} • {row.groupName || row.roomList?.roomGroup?.rGrpName}
                </Typography>
              </Box>
            </Box>

            <Chip size="small" color={row.bedStatus === "Available" ? "success" : row.bedStatus === "Occupied" ? "error" : "default"} label={row.bedStatus || "Unknown"} />
          </Box>
        );
      },
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
          {!row.isCradle && (
            <Tooltip title={`Add Cradle to ${row.bedName}`}>
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleAddCradle(row)}
                sx={{
                  bgcolor: "rgba(156, 39, 176, 0.08)",
                  "&:hover": { bgcolor: "rgba(156, 39, 176, 0.15)" },
                }}
              >
                <HotelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading data: {error}
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
              Hospital Room & Bed Management
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
            </Stack>
          </Grid>

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
            <Tooltip title="Filter Setup Data">
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

      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
          }}
        >
          <Tab icon={<FolderSpecialIcon fontSize="small" />} iconPosition="start" label="Room Groups" />
          <Tab icon={<MeetingRoomIcon fontSize="small" />} iconPosition="start" label="Rooms" />
          <Tab icon={<HotelIcon fontSize="small" />} iconPosition="start" label="Beds" />
        </Tabs>
        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 0}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Room Groups</Typography>
            <Stack direction="row" spacing={1}>
              <SmartButton text="Expand All" icon={UnfoldMoreIcon} onClick={expandAll} color="info" variant="outlined" size="small" />
              <SmartButton text="Collapse All" icon={UnfoldLessIcon} onClick={collapseAll} color="info" variant="outlined" size="small" />
              <SmartButton text="Add Room Group" icon={AddIcon} onClick={() => handleAddRoomGroup()} color="primary" variant="contained" size="small" />
            </Stack>
          </Box>
          <CustomGrid columns={roomGroupColumns} data={flattenedRoomGroups} maxHeight="calc(100vh - 400px)" emptyStateMessage="No room groups found" loading={isLoading} />
        </Box>
        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 1}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Rooms</Typography>
            <SmartButton text="Add Room" icon={AddIcon} onClick={() => handleAddRoom()} color="primary" variant="contained" size="small" />
          </Box>
          <CustomGrid
            columns={roomListColumns}
            data={filteredRooms.map((room) => ({
              ...room,
              roomGroupName: roomGroups.find((g) => g.rGrpID === room.rgrpID)?.rGrpName || "No Group",
            }))}
            maxHeight="calc(100vh - 400px)"
            emptyStateMessage="No rooms found"
            loading={isLoading}
          />
        </Box>

        <Box sx={{ p: 2 }} role="tabpanel" hidden={activeTab !== 2}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Beds & Cradles</Typography>
            <Stack direction="row" spacing={1}>
              <SmartButton text="Expand All" icon={UnfoldMoreIcon} onClick={expandAllBeds} color="info" variant="outlined" size="small" />
              <SmartButton text="Collapse All" icon={UnfoldLessIcon} onClick={collapseAllBeds} color="info" variant="outlined" size="small" />
              <SmartButton text="Add Bed" icon={AddIcon} onClick={() => handleAddBed()} color="primary" variant="contained" size="small" />
            </Stack>
          </Box>
          <CustomGrid
            columns={bedColumns}
            data={flattenedBeds.map((bed) => ({
              ...bed,
              roomName: bed.roomList?.rName || "No Room",
              groupName: bed.roomList?.roomGroup?.rGrpName || "No Group",
            }))}
            maxHeight="calc(100vh - 400px)"
            emptyStateMessage="No beds or cradles found"
            loading={isLoading}
          />
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

      {showBedForm && <BedForm open={showBedForm} onClose={handleBedFormClose} initialData={selectedBed} viewOnly={formViewOnly} roomGroups={roomGroups} roomLists={roomLists} />}
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
    </Box>
  );
};

export default BedSetupPage;
