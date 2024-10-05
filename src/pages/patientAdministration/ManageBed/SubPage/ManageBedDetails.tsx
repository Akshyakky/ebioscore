import React, { useState, useEffect, useMemo } from "react";
import {
    Paper,
    Typography,
    Grid,
    Box,
    Divider,
    List,
    ListItem,
    Button,
    CircularProgress,
    Tooltip,
    IconButton,
    TextField,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { RoomGroupDto, RoomListDto, WrBedDto } from '../../../../interfaces/HospitalAdministration/Room-BedSetUpDto';
import CustomGrid, { Column } from '../../../../components/CustomGrid/CustomGrid';
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Hotel as BedIcon,
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { roomGroupService, roomListService, wrBedService } from '../../../../services/HospitalAdministrationServices/hospitalAdministrationService';

const ManageBedDetails: React.FC = () => {
    const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
    const [roomList, setRoomList] = useState<RoomListDto[]>([]);
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [bedsByRoom, setBedsByRoom] = useState<{ [key: number]: WrBedDto[] }>({});
    const [bedFilter, setBedFilter] = useState<string>("Show All");
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const [roomGroupHierarchy, setRoomGroupHierarchy] = useState<RoomGroupDto[]>([]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomGroupsResult, roomListResult, bedsResult] = await Promise.all([
                roomGroupService.getAll(),
                roomListService.getAll(),
                wrBedService.getAll(),
            ]);

            if (roomGroupsResult.success) {
                setRoomGroups(roomGroupsResult.data || []);
                setRoomGroupHierarchy(buildRoomGroupHierarchy(roomGroupsResult.data || []));
            }
            if (roomListResult.success) {
                setRoomList(roomListResult.data || []);
                if (bedsResult.success) {
                    const bedsByRoomMap = bedsResult.data?.reduce(
                        (acc: { [key: number]: WrBedDto[] }, bed: WrBedDto) => {
                            acc[bed.rlID] = [...(acc[bed.rlID] || []), bed];
                            return acc;
                        },
                        {} as { [key: number]: WrBedDto[] }
                    );
                    setBedsByRoom(bedsByRoomMap || {});
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const buildRoomGroupHierarchy = (groups: RoomGroupDto[]): RoomGroupDto[] => {
        const groupMap = new Map<number, RoomGroupDto & { children: RoomGroupDto[] }>();

        groups.forEach(group => {
            groupMap.set(group.rGrpID, { ...group, children: [] });
        });

        const rootGroups: RoomGroupDto[] = [];

        groups.forEach(group => {
            if (group.key === 0) {
                rootGroups.push(groupMap.get(group.rGrpID)!);
            } else {
                const parentGroup = groupMap.get(group.key);
                if (parentGroup) {
                    parentGroup.children.push(groupMap.get(group.rGrpID)!);
                }
            }
        });

        return rootGroups;
    };

    const handleRoomNameClick = (roomGroup: RoomGroupDto) => {
        setSelectedRoomGroup(roomGroup);
    };

    const toggleExpand = (groupId: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const renderRoomGroup = (item: RoomGroupDto & { children?: RoomGroupDto[] }, depth: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedGroups.has(item.rGrpID);

        return (
            <React.Fragment key={item.rGrpID}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pl: depth * 2 + 1,
                        py: 1,
                        "&:hover": { backgroundColor: "action.hover" },
                        ...(selectedRoomGroup && selectedRoomGroup.rGrpID === item.rGrpID
                            ? { backgroundColor: "action.selected", fontWeight: 'bold' }
                            : {}),
                    }}
                >
                    {hasChildren && (
                        <IconButton size="small" onClick={() => toggleExpand(item.rGrpID)}>
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    )}
                    <Box
                        onClick={() => handleRoomNameClick(item)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: "pointer",
                            flexGrow: 1,
                        }}
                    >
                        {item.key !== 0 ? (
                            <FolderOpenIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                            <FolderIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                        )}
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: item.key !== 0 ? 400 : 600,
                                color: item.key !== 0 ? 'text.secondary' : 'text.primary',
                            }}
                        >
                            {item.rGrpName}
                        </Typography>
                    </Box>
                </Box>
                {isExpanded && item.children && item.children.map(childGroup => renderRoomGroup(childGroup, depth + 1))}
            </React.Fragment>
        );
    };

    const roomGroupColumns: Column<RoomGroupDto>[] = [
        {
            key: "rGrpName",
            header: "Room Name",
            visible: true,
            render: (item) => renderRoomGroup(item as RoomGroupDto & { children?: RoomGroupDto[] }),
        },
    ];

    const getBedStyles = (bedStatus: string | undefined) => {
        const colors = {
            Occupied: theme.palette.error.main,
            Blocked: theme.palette.warning.main,
            Available: theme.palette.success.main,
        };
        return {
            backgroundColor: colors[bedStatus as keyof typeof colors] || colors.Available,
            color: "#fff",
            borderRadius: "8px",
            boxShadow: theme.shadows[2],
        };
    };

    const countBeds = (beds: WrBedDto[]) => {
        return beds.reduce(
            (acc, bed) => {
                acc[bed.bedStatus as keyof typeof acc] = (acc[bed.bedStatus as keyof typeof acc] || 0) + 1;
                acc.total++;
                return acc;
            },
            { Available: 0, Occupied: 0, Blocked: 0, total: 0 }
        );
    };

    const calculateTotalBedsForGroup = useMemo(() => {
        if (!selectedRoomGroup)
            return { Available: 0, Occupied: 0, Blocked: 0, total: 0 };

        return roomList.reduce(
            (acc, room) => {
                if (room.rgrpID !== selectedRoomGroup.rGrpID) return acc;

                const beds = bedsByRoom[room.rlID] || [];
                const counts = countBeds(beds);
                Object.keys(counts).forEach((key) => {
                    acc[key as keyof typeof acc] += counts[key as keyof typeof counts];
                });
                return acc;
            },
            { Available: 0, Occupied: 0, Blocked: 0, total: 0 }
        );
    }, [selectedRoomGroup, roomList, bedsByRoom]);

    const filteredBeds = (room: RoomListDto) => {
        const beds = bedsByRoom[room.rlID] || [];
        return beds.filter(
            (bed) =>
                (bedFilter === "Show All" || bed.bedStatus === bedFilter) &&
                (bed.bedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    room.rName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filterButtonColors: Record<string, string> = {
        Occupied: theme.palette.error.main,
        Blocked: theme.palette.warning.main,
        Available: theme.palette.success.main,
        "Show All": theme.palette.primary.main,
    };

    return (
        <Box sx={{ minHeight: "80vh", width: "100%" }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={selectedRoomGroup ? 3 : 12} lg={selectedRoomGroup ? 2 : 12}>
                    <Paper sx={{ height: "100%", p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Room Group Details
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <CustomGrid
                            columns={roomGroupColumns}
                            data={roomGroupHierarchy}
                            maxHeight="calc(100vh - 200px)"
                        />
                    </Paper>
                </Grid>

                {selectedRoomGroup && (
                    <Grid item xs={12} md={6} lg={7}>
                        <Paper elevation={0} sx={{ p: 3, height: "100%" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6">
                                    Manage Bed for {selectedRoomGroup.rGrpName}
                                </Typography>
                                <IconButton onClick={fetchData} color="primary">
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2, display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 2 }}>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                    {["Show All", "Occupied", "Available", "Blocked"].map((status) => (
                                        <Button
                                            key={status}
                                            variant={bedFilter === status ? "contained" : "outlined"}
                                            size={isMobile ? "small" : "medium"}
                                            sx={{
                                                backgroundColor: bedFilter === status ? filterButtonColors[status] : "transparent",
                                                color: bedFilter === status ? "#fff" : filterButtonColors[status],
                                                borderColor: filterButtonColors[status],
                                                flexGrow: isMobile ? 1 : 0,
                                                '&:hover': {
                                                    backgroundColor: filterButtonColors[status],
                                                    color: '#fff',
                                                },
                                            }}
                                            onClick={() => setBedFilter(status)}
                                        >
                                            {status}
                                        </Button>
                                    ))}
                                </Box>
                                <TextField
                                    size="small"
                                    placeholder="Search beds..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon />,
                                    }}
                                    fullWidth={isMobile}
                                />
                            </Box>

                            {loading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box sx={{ height: "calc(100vh - 300px)", overflowY: "auto", p: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    {roomList
                                        .filter((room) => room.rgrpID === selectedRoomGroup.rGrpID)
                                        .map((room) => (
                                            <Box key={room.rlID} sx={{ mb: 4 }}>
                                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                                    {room.rLocation} - {room.rName}
                                                </Typography>

                                                <List sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                                    {filteredBeds(room).map((bed) => (
                                                        <ListItem key={bed.bedID} sx={{ width: "auto", p: 0 }}>
                                                            <Tooltip title={`Status: ${bed.bedStatus}`}>
                                                                <Box
                                                                    sx={{
                                                                        ...getBedStyles(bed.bedStatus),
                                                                        textAlign: "center",
                                                                        width: { xs: 80, sm: 100 },
                                                                        height: { xs: 60, sm: 80 },
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                    }}
                                                                >
                                                                    <BedIcon />
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {bed.bedName}
                                                                    </Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        </ListItem>
                                                    ))}
                                                </List>

                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {Object.entries(countBeds(filteredBeds(room)))
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(" | ")}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                )}

                {selectedRoomGroup && (
                    <Grid item xs={12} md={3} lg={3}>
                        <Paper elevation={0} sx={{ p: 2, height: "100%" }}>
                            <Typography variant="h6" gutterBottom>
                                Overall Bed Summary for {selectedRoomGroup.rGrpName}
                            </Typography>

                            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                                {Object.entries(calculateTotalBedsForGroup).map(([key, value]) => (
                                    <Box
                                        key={key}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            backgroundColor: filterButtonColors[key],
                                            color: "#fff",
                                            p: 2,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="body1">{key}</Typography>
                                        <Typography variant="h6">{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default ManageBedDetails;