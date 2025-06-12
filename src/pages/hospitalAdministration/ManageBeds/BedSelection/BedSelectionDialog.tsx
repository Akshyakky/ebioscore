// src/components/BedSelection/BedSelectionDialog.tsx
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { CheckCircle as AvailableIcon, Bed as BedIcon, Block as BlockIcon, Build as MaintenanceIcon, Person as OccupiedIcon, Search as SearchIcon } from "@mui/icons-material";
import { Alert, Avatar, Box, Card, CardContent, Chip, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

export interface BedSelectionFilter {
  roomGroupId?: number;
  departmentId?: number;
  availableOnly?: boolean;
  excludeBedIds?: number[];
}

interface BedSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (bed: WrBedDto) => void;
  beds: WrBedDto[];
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
  title?: string;
  filters?: BedSelectionFilter;
  allowOccupied?: boolean;
  selectedBedId?: number;
  loading?: boolean;
}

const BedSelectionDialog: React.FC<BedSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  beds,
  rooms,
  roomGroups,
  title = "Select Bed",
  filters = {},
  allowOccupied = false,
  selectedBedId,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomGroup, setSelectedRoomGroup] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);

  // Reset filters when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedRoomGroup(filters.roomGroupId || 0);
      setSelectedDepartment(filters.departmentId || 0);
    }
  }, [open, filters]);

  // Bed status configuration
  const bedStatusConfig = {
    Available: {
      color: "#4caf50",
      icon: <AvailableIcon fontSize="small" />,
      selectable: true,
    },
    Occupied: {
      color: "#f44336",
      icon: <OccupiedIcon fontSize="small" />,
      selectable: allowOccupied,
    },
    Blocked: {
      color: "#ff9800",
      icon: <BlockIcon fontSize="small" />,
      selectable: false,
    },
    Maintenance: {
      color: "#9c27b0",
      icon: <MaintenanceIcon fontSize="small" />,
      selectable: false,
    },
    Reserved: {
      color: "#2196f3",
      icon: <BedIcon fontSize="small" />,
      selectable: false,
    },
  };

  // Enhanced beds with room information
  const enhancedBeds = useMemo(() => {
    return beds.map((bed) => {
      const room = rooms.find((r) => r.rlID === bed.rlID);
      const roomGroup = room ? roomGroups.find((rg) => rg.rGrpID === room.rgrpID) : null;

      return {
        ...bed,
        roomName: room?.rName || "Unknown Room",
        roomGroupName: roomGroup?.rGrpName || "Unknown Group",
        departmentName: roomGroup?.deptName || "Unknown Department",
        departmentId: roomGroup?.deptID || 0,
        statusConfig: bedStatusConfig[bed.bedStatusValue as keyof typeof bedStatusConfig] || bedStatusConfig["Available"],
      };
    });
  }, [beds, rooms, roomGroups]);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return enhancedBeds.filter((bed) => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          bed.bedName.toLowerCase().includes(searchLower) ||
          bed.roomName.toLowerCase().includes(searchLower) ||
          bed.roomGroupName.toLowerCase().includes(searchLower) ||
          bed.departmentName.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Apply room group filter
      if (selectedRoomGroup > 0) {
        const room = rooms.find((r) => r.rlID === bed.rlID);
        if (!room || room.rgrpID !== selectedRoomGroup) return false;
      }

      // Apply department filter
      if (selectedDepartment > 0) {
        if (bed.departmentId !== selectedDepartment) return false;
      }

      // Apply available only filter
      if (filters.availableOnly && bed.bedStatusValue !== "AVLBL") {
        return false;
      }

      // Exclude specific beds
      if (filters.excludeBedIds?.includes(bed.bedID)) {
        return false;
      }

      // Only show active beds
      if (bed.rActiveYN !== "Y") {
        return false;
      }

      return true;
    });
  }, [enhancedBeds, searchTerm, selectedRoomGroup, selectedDepartment, filters, rooms]);

  // Group beds by room group for better organization
  const groupedBeds = useMemo(() => {
    const groups: Record<string, typeof filteredBeds> = {};

    filteredBeds.forEach((bed) => {
      const groupKey = bed.roomGroupName;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(bed);
    });

    return groups;
  }, [filteredBeds]);

  // Handle bed selection
  const handleBedSelect = (bed: WrBedDto) => {
    const enhancedBed = enhancedBeds.find((b) => b.bedID === bed.bedID);
    if (enhancedBed?.statusConfig.selectable) {
      onSelect(bed);
    }
  };

  // Available counts
  const availableCount = filteredBeds.filter((bed) => bed.statusConfig.selectable).length;
  const totalCount = filteredBeds.length;

  return (
    <GenericDialog open={open} onClose={onClose} title={title} maxWidth="lg" fullWidth dialogContentSx={{ minHeight: "500px" }}>
      <Box sx={{ p: 2 }}>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search beds, rooms, or departments..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Group</InputLabel>
              <Select value={selectedRoomGroup} onChange={(e) => setSelectedRoomGroup(e.target.value as number)} label="Room Group">
                <MenuItem value={0}>All Room Groups</MenuItem>
                {roomGroups.map((group) => (
                  <MenuItem key={group.rGrpID} value={group.rGrpID}>
                    {group.rGrpName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value as number)} label="Department">
                <MenuItem value={0}>All Departments</MenuItem>
                {Array.from(new Map(roomGroups.filter((g) => g.deptID && g.deptName).map((g) => [g.deptID, g]))).map(([_, group]) => (
                  <MenuItem key={group.deptID} value={group.deptID}>
                    {group.deptName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {availableCount} available beds out of {totalCount} total beds
          </Typography>
          {!allowOccupied && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Only available beds can be selected. Occupied, blocked, and maintenance beds are not selectable.
            </Alert>
          )}
        </Box>

        {/* Bed Grid */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading beds...</Typography>
          </Box>
        ) : Object.keys(groupedBeds).length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No beds found matching your criteria</Typography>
          </Box>
        ) : (
          Object.entries(groupedBeds).map(([groupName, beds]) => (
            <Box key={groupName} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.main">
                {groupName}
              </Typography>

              <Grid container spacing={2}>
                {beds.map((bed) => {
                  const isSelected = bed.bedID === selectedBedId;
                  const isSelectable = bed.statusConfig.selectable;

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={bed.bedID}>
                      <Card
                        sx={{
                          cursor: isSelectable ? "pointer" : "not-allowed",
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? "primary.main" : "grey.300",
                          backgroundColor: isSelected ? "primary.50" : "white",
                          opacity: isSelectable ? 1 : 0.6,
                          "&:hover": isSelectable
                            ? {
                                borderColor: "primary.main",
                                backgroundColor: "primary.50",
                              }
                            : {},
                        }}
                        onClick={() => isSelectable && handleBedSelect(bed)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: bed.statusConfig.color,
                              }}
                            >
                              <BedIcon fontSize="small" />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {bed.bedName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {bed.roomName}
                              </Typography>
                            </Box>
                          </Box>

                          <Stack spacing={1}>
                            <Chip
                              icon={bed.statusConfig.icon}
                              label={bed.bedStatus}
                              size="small"
                              sx={{
                                backgroundColor: bed.statusConfig.color,
                                color: "white",
                              }}
                            />

                            {bed.wbCatName && (
                              <Typography variant="caption" color="text.secondary">
                                Category: {bed.wbCatName}
                              </Typography>
                            )}

                            {bed.bedRemarks && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {bed.bedRemarks}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))
        )}
      </Box>
    </GenericDialog>
  );
};

export default BedSelectionDialog;
