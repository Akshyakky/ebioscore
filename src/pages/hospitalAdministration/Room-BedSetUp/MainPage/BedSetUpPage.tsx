import React, { useState } from "react";
import { Grid, Paper, Typography, Box, Divider } from "@mui/material";
import { RoomGroupDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import RoomGroupDetails from "../SubPage/RoomGroup/RoomGroupDetails";
import RoomListDetails from "../SubPage/RoomList/RoomListDetails";
import WrBedDetails from "../SubPage/WrBed/WrBedDetails";

const BedSetUpPage: React.FC = () => {
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isRoomComponentOpen, setIsRoomComponentOpen] = useState(false);

    const handleAddRoom = (roomGroup: RoomGroupDto) => {
        setSelectedRoomGroup(roomGroup);
        setIsRoomComponentOpen(true);
    };

    const handleRoomSelect = (roomId: number) => {
        setSelectedRoomId(roomId);
    };

    const closeRoomComponent = () => {
        setIsRoomComponentOpen(false);
        setSelectedRoomGroup(null);
        setSelectedRoomId(null);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', py: 1 }}>
            <Grid container spacing={1}>
                <Grid item xs={12} md={4} lg={4}>
                    <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Room Group Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <RoomGroupDetails handleAddRoom={handleAddRoom} />
                    </Paper>
                </Grid>
                {isRoomComponentOpen && (
                    <Grid item xs={12} md={4} lg={4}>
                        <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Room List Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <RoomListDetails
                                roomGroup={selectedRoomGroup}
                                onRoomSelect={handleRoomSelect}
                                onClose={closeRoomComponent}
                            />
                        </Paper>
                    </Grid>
                )}
                {selectedRoomId && (
                    <Grid item xs={12} md={4} lg={4}>
                        <Paper elevation={3} sx={{ height: '100%', p: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Bed Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <WrBedDetails
                                roomId={selectedRoomId}
                                onClose={closeRoomComponent}
                            />
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default BedSetUpPage;