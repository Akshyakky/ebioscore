import React, { useState } from "react";
import { Box, Container, Grid } from "@mui/material";
import { RoomGroupDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import RoomGroupDetails from "../SubPage/RoomGroup/RoomGroupDetails";
import RoomListDetails from "../SubPage/RoomList/RoomListDetails"; // Import RoomListDetails

const BedSetUpPage: React.FC = () => {
    const [, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<RoomGroupDto | undefined>(undefined);

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleSelect = (data: RoomGroupDto) => {
        setSelectedData(data);
    };

    return (
        <>
            <Container maxWidth={false}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={4} lg={4} >
                        <RoomGroupDetails editData={selectedData} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} >
                        <RoomListDetails />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} >

                    </Grid>
                </Grid>


            </Container>
        </>
    );
};

export default BedSetUpPage;
