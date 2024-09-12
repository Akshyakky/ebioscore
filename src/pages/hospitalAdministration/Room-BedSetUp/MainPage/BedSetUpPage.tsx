import React, { useState } from "react";
import { Container, Grid } from "@mui/material";
import { RoomGroupDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import RoomGroupDetails from "../SubPage/RoomGroup/RoomGroupDetails";
import RoomListDetails from "../SubPage/RoomList/RoomListDetails";

const BedSetUpPage: React.FC = () => {
    // State to manage selected room group and whether RoomListDetails should be open
    const [selectedRoomGroup, setSelectedRoomGroup] = useState<RoomGroupDto | null>(null);
    const [isRoomComponentOpen, setIsRoomComponentOpen] = useState(false);

    // Handle Add Room button click
    const handleAddRoom = (roomGroup: RoomGroupDto) => {
        setSelectedRoomGroup(roomGroup);
        setIsRoomComponentOpen(true);
    };

    // Handle closing the RoomListDetails component
    const closeRoomComponent = () => {
        setIsRoomComponentOpen(false);
        setSelectedRoomGroup(null);
    };

    return (
        <>
            <Container maxWidth={false}>
                <Grid container spacing={2}>
                    {/* RoomGroupDetails Component */}
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <RoomGroupDetails handleAddRoom={handleAddRoom} />
                    </Grid>

                    {/* Conditionally render RoomListDetails based on state */}
                    {isRoomComponentOpen && (
                        <Grid item xs={12} sm={12} md={4} lg={4}>
                            <RoomListDetails
                                roomGroup={selectedRoomGroup} // Pass the selected room group data
                                onClose={closeRoomComponent}  // Pass the close handler
                            />
                        </Grid>
                    )}

                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        {/* Additional content can go here if needed */}
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default BedSetUpPage;
