import React, { useState, lazy, Suspense, useEffect } from "react";
import { Grid, Paper, Typography, Divider } from "@mui/material";
import { RoomGroupDto, RoomListDto, WrBedDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import Loader from "../../../../components/Loader/SkeletonLoader";
import { roomGroupService, roomListService, wrBedService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";

const RoomGroupDetails = lazy(() => import("../SubPage/RoomGroup/RoomGroupDetails"));
const RoomListDetails = lazy(() => import("../SubPage/RoomList/RoomListDetails"));
const WrBedDetails = lazy(() => import("../SubPage/WrBed/WrBedDetails"));

const BedSetUpPage: React.FC = () => {
    const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
    const [roomLists, setRoomLists] = useState<RoomListDto[]>([]);
    const [beds, setBeds] = useState<WrBedDto[]>([]);

    useEffect(() => {
        fetchRoomGroups();
        fetchRoomLists();
        fetchBeds();
    }, []);

    const fetchRoomGroups = async () => {
        const response = await roomGroupService.getAll();
        if (response.success) {
            setRoomGroups(response.data.filter((group: RoomGroupDto) => group.rActiveYN === "Y"));
        }
    };

    const fetchRoomLists = async () => {

        const response = await roomListService.getAll();
        if (response.success && response.data) {
            setRoomLists(response.data);
        }
    };

    const fetchBeds = async () => {

        const response = await wrBedService.getAll();
        if (response.success && response.data) {
            setBeds(response.data);
        }
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={4} lg={4}>
                <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Room Group Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Suspense fallback={<Loader type="skeleton" count={3} />}>
                        <RoomGroupDetails roomGroups={roomGroups} />
                    </Suspense>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
                <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Room List Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Suspense fallback={<Loader type="skeleton" count={3} />}>
                        <RoomListDetails roomLists={roomLists} />
                    </Suspense>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
                <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Bed Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Suspense fallback={<Loader type="skeleton" count={3} />}>
                        <WrBedDetails beds={beds} />
                    </Suspense>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default BedSetUpPage;