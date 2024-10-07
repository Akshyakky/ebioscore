import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Typography,
    Box,
    Tooltip,
    TextField,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { RoomGroupDto, RoomListDto, WrBedDto } from '../../../../interfaces/HospitalAdministration/Room-BedSetUpDto';
import CustomTreeView, { TreeNodeType } from "../../../../components/TreeView/CustomTreeView";
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Hotel as BedIcon,
} from '@mui/icons-material';
import { roomGroupService, roomListService, wrBedService } from '../../../../services/HospitalAdministrationServices/hospitalAdministrationService';
import { useLoading } from "../../../../context/LoadingContext";
import CustomButton from "../../../../components/Button/CustomButton";
import useDebounce from "../../../../hooks/Common/useDebounce";

interface ManageBedDetailsProps {
    onBedSelect?: (bed: WrBedDto) => void;
    isSelectionMode?: boolean;
}

const ManageBedDetails: React.FC<ManageBedDetailsProps> = ({ onBedSelect, isSelectionMode = false }) => {
    const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
    const [roomList, setRoomList] = useState<RoomListDto[]>([]);
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [bedsByRoom, setBedsByRoom] = useState<{ [key: number]: WrBedDto[] }>({});
    const [bedFilter, setBedFilter] = useState<string>("Show All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { isLoading, setLoading } = useLoading();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        fetchRoomGroups();
    }, []);

    useEffect(() => {
        if (selectedRoomGroup) {
            fetchRoomsAndBeds(selectedRoomGroup.rGrpID);
        }
    }, [selectedRoomGroup]);

    const fetchRoomGroups = async () => {
        setLoading(true);
        try {
            const result = await roomGroupService.getAll();
            if (result.success) {
                setRoomGroups(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching room groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomsAndBeds = async (roomGroupId: number) => {
        setLoading(true);
        try {
            const [roomListResult, bedsResult] = await Promise.all([
                roomListService.find(`rgrpID == ${roomGroupId}`),
                wrBedService.find(`RoomList.rgrpID == ${roomGroupId}`)
            ]);

            if (roomListResult.success) {
                setRoomList(roomListResult.data || []);
            }
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
        } catch (error) {
            console.error("Error fetching rooms and beds:", error);
        } finally {
            setLoading(false);
        }
    };

    const roomGroupHierarchy = useMemo(() => {
        const buildHierarchy = (groups: RoomGroupDto[]): TreeNodeType[] => {
            const groupMap = new Map<number, TreeNodeType>();

            groups.forEach(group => {
                groupMap.set(group.rGrpID, {
                    id: group.rGrpID.toString(),
                    name: group.rGrpName,
                    children: [],
                    originalData: group
                });
            });

            const rootGroups: TreeNodeType[] = [];

            groups.forEach(group => {
                const treeNode = groupMap.get(group.rGrpID);
                if (treeNode) {
                    if (group.key === 0) {
                        rootGroups.push(treeNode);
                    } else {
                        const parentNode = groupMap.get(group.key);
                        if (parentNode && Array.isArray(parentNode.children)) {
                            parentNode.children.push(treeNode);
                        }
                    }
                }
            });

            return rootGroups;
        };

        return buildHierarchy(roomGroups);
    }, [roomGroups]);

    const handleRoomGroupSelect = useCallback((node: TreeNodeType) => {
        setSelectedRoomGroup(node.originalData as RoomGroupDto);
    }, []);

    const getBedStyles = useCallback((bedStatus: string | undefined) => {
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
    }, [theme]);

    const countBeds = useCallback((beds: WrBedDto[]) => {
        return beds.reduce(
            (acc, bed) => {
                acc[bed.bedStatus as keyof typeof acc] = (acc[bed.bedStatus as keyof typeof acc] || 0) + 1;
                acc.total++;
                return acc;
            },
            { Available: 0, Occupied: 0, Blocked: 0, total: 0 }
        );
    }, []);

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
    }, [selectedRoomGroup, roomList, bedsByRoom, countBeds]);

    const filteredBeds = useCallback((room: RoomListDto) => {
        const beds = bedsByRoom[room.rlID] || [];
        return beds.filter(
            (bed) =>
                (bedFilter === "Show All" || bed.bedStatus === bedFilter) &&
                (bed.bedName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    room.rName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        ).map(bed => ({
            ...bed,
            roomList: {
                rName: room.rName,
                roomGroup: {
                    rGrpID: room.rgrpID,
                    rGrpName: room.roomGroup?.rGrpName || ""
                }
            }
        }));
    }, [bedsByRoom, bedFilter, debouncedSearchTerm]);

    const filterButtonColors = useMemo(() => ({
        Occupied: theme.palette.error.main,
        Blocked: theme.palette.warning.main,
        Available: theme.palette.success.main,
        "Show All": theme.palette.primary.main,
    }), [theme]);

    const handleBedClick = (bed: WrBedDto) => {
        if (isSelectionMode && onBedSelect && bed.bedStatus === 'Available') {
            onBedSelect(bed);
        }
    };

    return (
        <Box sx={{ height: "calc(100vh - 64px)", display: "flex" }}>
            {/* Left Sidebar */}
            <Box sx={{ width: 250, borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    Room Group Details
                </Typography>
                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                    <CustomTreeView
                        data={roomGroupHierarchy}
                        onNodeSelect={handleRoomGroupSelect}
                    />
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {selectedRoomGroup && (
                    <>
                        {/* Fixed Header */}
                        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6">
                                    Manage Bed for {selectedRoomGroup.rGrpName}
                                </Typography>
                                <CustomButton
                                    variant="outlined"
                                    text="Refresh"
                                    onClick={() => fetchRoomsAndBeds(selectedRoomGroup.rGrpID)}
                                    icon={RefreshIcon}
                                />
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    {["Show All", "Occupied", "Available", "Blocked"].map((status) => (
                                        <CustomButton
                                            key={status}
                                            variant={bedFilter === status ? "contained" : "outlined"}
                                            size="small"
                                            text={status}
                                            onClick={() => setBedFilter(status)}
                                            sx={{
                                                backgroundColor: bedFilter === status ? filterButtonColors[status as keyof typeof filterButtonColors] : "transparent",
                                                color: bedFilter === status ? "#fff" : filterButtonColors[status as keyof typeof filterButtonColors],
                                                borderColor: filterButtonColors[status as keyof typeof filterButtonColors],
                                                '&:hover': {
                                                    backgroundColor: filterButtonColors[status as keyof typeof filterButtonColors],
                                                    color: '#fff',
                                                },
                                            }}
                                        />
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
                                />
                            </Box>
                        </Box>

                        {/* Scrollable Content */}
                        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                            {!isLoading && roomList
                                .filter((room) => room.rgrpID === selectedRoomGroup.rGrpID)
                                .map((room) => (
                                    <Box key={room.rlID} sx={{ mb: 4 }}>
                                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                            {room.rLocation} - {room.rName}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                            {filteredBeds(room).map((bed) => (
                                                <Tooltip key={bed.bedID} title={`Status: ${bed.bedStatus}`}>
                                                    <Box
                                                        onClick={() => handleBedClick(bed)}
                                                        sx={{
                                                            ...getBedStyles(bed.bedStatus),
                                                            width: 100,
                                                            height: 80,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            borderRadius: 1,
                                                            cursor: isSelectionMode && bed.bedStatus === 'Available' ? 'pointer' : 'default',
                                                            '&:hover': isSelectionMode && bed.bedStatus === 'Available' ? {
                                                                opacity: 0.8,
                                                                boxShadow: theme.shadows[4],
                                                            } : {},
                                                        }}
                                                    >
                                                        <BedIcon />
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {bed.bedName}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            ))}
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {Object.entries(countBeds(filteredBeds(room)))
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(" | ")}
                                        </Typography>
                                    </Box>
                                ))}
                        </Box>
                    </>
                )}
            </Box>

            {/* Right Sidebar */}
            {selectedRoomGroup && (
                <Box sx={{ width: 250, borderLeft: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        Overall Bed Summary
                    </Typography>
                    <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {Object.entries(calculateTotalBedsForGroup).map(([key, value]) => (
                                <Box
                                    key={key}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backgroundColor: filterButtonColors[key as keyof typeof filterButtonColors],
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
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ManageBedDetails;