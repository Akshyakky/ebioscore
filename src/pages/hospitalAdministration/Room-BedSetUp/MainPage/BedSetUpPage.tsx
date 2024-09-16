import React, { useState } from "react";
import { Container, Grid } from "@mui/material";
import { RoomGroupDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import RoomGroupDetails from "../SubPage/RoomGroup/RoomGroupDetails";
import RoomListDetails from "../SubPage/RoomList/RoomListDetails";
import WrBedDetails from "../SubPage/WrBed/WrBedDetails";

const BedSetUpPage: React.FC = () => {
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isRoomComponentOpen, setIsRoomComponentOpen] = useState(false);


    const handleAddRoom = (roomGroup: RoomGroupDto) => {
        debugger
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
        <>
            <Container maxWidth={false}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <RoomGroupDetails handleAddRoom={handleAddRoom} />
                    </Grid>

                    {isRoomComponentOpen && (
                        <>
                            <Grid item xs={12} sm={12} md={4} lg={4}>
                                <RoomListDetails
                                    roomGroup={selectedRoomGroup}
                                    onRoomSelect={handleRoomSelect}
                                    onClose={closeRoomComponent}
                                />
                            </Grid>

                            {selectedRoomId && (
                                <Grid item xs={12} sm={12} md={4} lg={4}>
                                    <WrBedDetails
                                        roomId={selectedRoomId}
                                        onClose={closeRoomComponent}
                                    />
                                </Grid>
                            )}
                        </>
                    )}

                </Grid>
            </Container>
        </>
    );
};

export default BedSetUpPage;
