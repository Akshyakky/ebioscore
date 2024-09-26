import React, { useState, useEffect, useMemo } from 'react';
import {
    Paper, Typography, Grid, Box, Divider, List, ListItem, Button,
    CircularProgress, Tooltip, IconButton, TextField, useTheme, useMediaQuery
} from "@mui/material";
import { RoomGroupDto, RoomListDto, WrBedDto } from '../../../../interfaces/HospitalAdministration/Room-BedSetUpDto';
import CustomGrid, { Column } from '../../../../components/CustomGrid/CustomGrid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import BedIcon from '@mui/icons-material/Hotel';
import { roomGroupService, roomListService, wrBedService } from '../../../../services/HospitalAdministrationServices/hospitalAdministrationService';

const ManageBedDetails: React.FC = () => {
    const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
    const [roomList, setRoomList] = useState<RoomListDto[]>([]);
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [bedsByRoom, setBedsByRoom] = useState<{ [key: number]: WrBedDto[] }>({});
    const [bedFilter, setBedFilter] = useState<string>('Show All');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    type BedStatus = 'Occupied' | 'Blocked' | 'Available' | 'Show All';

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

            if (roomGroupsResult.success) setRoomGroups(roomGroupsResult.data || []);
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

    const handleRoomNameClick = (roomGroup: RoomGroupDto) => {
        setSelectedRoomGroup(roomGroup);
    };

    const roomGroupColumns: Column<RoomGroupDto>[] = [
        {
            key: 'rGrpName',
            header: 'Room Name',
            visible: true,
            render: (item) => (
                <Typography
                    variant="body1"
                    onClick={() => handleRoomNameClick(item)}
                    sx={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                        color: selectedRoomGroup && selectedRoomGroup.rGrpID === item.rGrpID ? 'primary.main' : 'inherit',
                        backgroundColor: selectedRoomGroup && selectedRoomGroup.rGrpID === item.rGrpID ? '#f0f0f0' : 'transparent',
                        padding: '4px 8px',
                        borderRadius: '4px'
                    }}
                >
                    {item.rGrpName}
                </Typography>
            ),
        },
    ];

    const getBedStyles = (bedStatus: string | undefined) => {
        const colors = {
            Occupied: "#FF6F61",
            Blocked: "#ff9800",
            Available: "#4caf50",
            total: "#3f51b5"
        };
        return { backgroundColor: colors[bedStatus as keyof typeof colors] || colors.Available, color: "#fff", borderRadius: "8px", boxShadow: '0 2px 8px rgba(0,0,0,0.2)' };
    };

    const countBeds = (beds: WrBedDto[]) => {
        return beds.reduce((acc, bed) => {
            acc[bed.bedStatus as keyof typeof acc] = (acc[bed.bedStatus as keyof typeof acc] || 0) + 1;
            acc.total++;
            return acc;
        }, { Available: 0, Occupied: 0, Blocked: 0, total: 0 });
    };

    const calculateTotalBedsForGroup = useMemo(() => {
        if (!selectedRoomGroup) return { Available: 0, Occupied: 0, Blocked: 0, total: 0 };

        return roomList.reduce((acc, room) => {
            if (room.rgrpID !== selectedRoomGroup.rGrpID) return acc;

            const beds = bedsByRoom[room.rlID] || [];
            const counts = countBeds(beds);
            Object.keys(counts).forEach(key => {
                acc[key as keyof typeof acc] += counts[key as keyof typeof counts];
            });
            return acc;
        }, { Available: 0, Occupied: 0, Blocked: 0, total: 0 });
    }, [selectedRoomGroup, roomList, bedsByRoom]);

    const filteredBeds = (room: RoomListDto) => {
        const beds = bedsByRoom[room.rlID] || [];
        return beds.filter(bed =>
            (bedFilter === 'Show All' || bed.bedStatus === bedFilter) &&
            (bed.bedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.rName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const filterButtonColors: Record<BedStatus, string> = {
        Occupied: "#FF6F61",
        Blocked: "#ff9800",
        Available: "#4caf50",
        'Show All': "#3f51b5"
    };

    const pieChartData = useMemo(() => {
        const { Available, Occupied, Blocked } = calculateTotalBedsForGroup;
        const total = Available + Occupied + Blocked;
        return [
            { name: 'Available', value: Available, color: '#4caf50', percentage: (Available / total) * 100 },
            { name: 'Occupied', value: Occupied, color: '#FF6F61', percentage: (Occupied / total) * 100 },
            { name: 'Blocked', value: Blocked, color: '#ff9800', percentage: (Blocked / total) * 100 },
        ];
    }, [calculateTotalBedsForGroup]);

    return (
        <Box sx={{ minHeight: '80vh', width: '100%' }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={selectedRoomGroup ? 3 : 12} lg={selectedRoomGroup ? 2 : 12}>
                    <Paper sx={{ height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ p: 2 }}>Room Group Details</Typography>
                        <Divider />
                        <CustomGrid columns={roomGroupColumns} data={roomGroups} />
                    </Paper>
                </Grid>

                {selectedRoomGroup && (
                    <Grid item xs={12} md={6} lg={7}>
                        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.paper', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Manage Bed for {selectedRoomGroup.rGrpName}
                                </Typography>
                                <IconButton onClick={fetchData} color="primary">
                                    <RefreshIcon />
                                </IconButton>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {['Show All', 'Occupied', 'Available', 'Blocked'].map(status => (
                                        <Button
                                            key={status}
                                            variant="contained"
                                            size={isMobile ? 'small' : 'medium'}
                                            sx={{
                                                backgroundColor: bedFilter === status ? filterButtonColors[status as BedStatus] : 'transparent',
                                                color: bedFilter === status ? '#fff' : '#000',
                                                border: `1px solid ${filterButtonColors[status as BedStatus]}`,
                                                flexGrow: isMobile ? 1 : 0
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
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box sx={{ height: 'calc(100vh - 300px)', overflowY: 'auto', p: 2, border: '1px solid #ccc' }}>
                                    {roomList
                                        .filter(room => room.rgrpID === selectedRoomGroup.rGrpID)
                                        .map((room) => (
                                            <Box key={room.rlID} sx={{ mb: 4 }}>
                                                <Typography variant="body1" gutterBottom fontWeight="bold">
                                                    {room.rLocation} - {room.rName}
                                                </Typography>

                                                <List sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                    {filteredBeds(room).map((bed) => (
                                                        <ListItem key={bed.bedID} sx={{ width: 'auto', mr: 2, mb: 2 }}>
                                                            <Tooltip title={`Status: ${bed.bedStatus}`}>
                                                                <Box sx={{
                                                                    ...getBedStyles(bed.bedStatus),

                                                                    textAlign: 'center',
                                                                    minWidth: '100px',
                                                                    minHeight: '80px',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <BedIcon />
                                                                    <Typography variant="body2" fontWeight={600}>{bed.bedName}</Typography>
                                                                </Box>
                                                            </Tooltip>
                                                        </ListItem>
                                                    ))}
                                                </List>

                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {Object.entries(countBeds(filteredBeds(room))).map(([key, value]) => `${key}: ${value}`).join(' | ')}
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
                        <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.paper', height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Overall Bed Summary for {selectedRoomGroup.rGrpName}
                            </Typography>

                            <Box sx={{ height: 200, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {pieChartData.map((data, index) => (
                                    <Box key={data.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box
                                            sx={{
                                                width: `${data.percentage}%`,
                                                height: 20,
                                                backgroundColor: data.color,
                                                mr: 1,
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {data.name}: {data.value} ({data.percentage.toFixed(1)}%)
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
                                {Object.entries(calculateTotalBedsForGroup).map(([key, value]) => (
                                    <Box key={key} sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: getBedStyles(key).backgroundColor,
                                        padding: '8px',
                                        width: isMobile ? '70px' : '80px',
                                        height: isMobile ? '60px' : '70px',
                                    }}>
                                        <Typography variant="h6" fontWeight="bold" color="#FFF">{value}</Typography>
                                        <Typography variant="caption" fontWeight="500" color="inherit">{key}</Typography>
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