import { useState, lazy, Suspense, useEffect } from "react";
import { Grid, Paper, Typography, Divider } from "@mui/material";
import Loader from "../../../../components/Loader/SkeletonLoader";
import { roomGroupService, roomListService, wrBedService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { useLoading } from "../../../../context/LoadingContext";
import React from "react";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";

const RoomGroupDetails = lazy(() => import("../SubPage/RoomGroup/RoomGroupDetails"));
const RoomListDetails = lazy(() => import("../SubPage/RoomList/RoomListDetails"));
const WrBedDetails = lazy(() => import("../SubPage/WrBed/WrBedDetails"));

const BedSetUpPage: React.FC = () => {
  const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
  const [roomLists, setRoomLists] = useState<RoomListDto[]>([]);
  const [beds, setBeds] = useState<WrBedDto[]>([]);
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRoomGroups(), fetchRoomLists(), fetchBeds()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchRoomGroups = async () => {
    const response = await roomGroupService.getAll();
    if (response.success) {
      setRoomGroups(response.data.filter((group: RoomGroupDto) => group.rActiveYN === "Y"));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRoomGroups(), fetchRoomLists(), fetchBeds()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchRoomLists = async () => {
    try {
      const response = await roomListService.getAllWithIncludes(["RoomGroup"]);
      if (response.success && response.data) {
        setRoomLists(response.data);
      } else {
        setRoomLists([]);
      }
    } catch (error) {
      setRoomLists([]);
    }
  };
  const fetchBeds = async () => {
    setLoading(true);
    try {
      const response = await wrBedService.getAllWithIncludes(["RoomList", "RoomList.RoomGroup"]);
      if (response.success && response.data) {
        setBeds(response.data);
      } else {
        setBeds([]);
      }
    } catch (error) {
      setBeds([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={4} lg={4}>
        <Paper elevation={3} sx={{ height: "100%", p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Room Group Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Suspense fallback={<Loader type="skeleton" count={3} />}>
            <RoomGroupDetails roomGroups={roomGroups} fetchRoomGroups={fetchRoomGroups} />
          </Suspense>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper elevation={3} sx={{ height: "100%", p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Room List Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Suspense fallback={<Loader type="skeleton" count={3} />}>
            <RoomListDetails roomLists={roomLists} fetchRoomLists={fetchRoomLists} updatedRoomGroups={roomGroups} />
          </Suspense>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} lg={4}>
        <Paper elevation={3} sx={{ height: "100%", p: 1 }}>
          <Typography variant="h6" gutterBottom>
            Bed Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Suspense fallback={<Loader type="skeleton" count={3} />}>
            <WrBedDetails beds={beds} roomGroups={roomGroups} roomLists={roomLists} fetchBeds={fetchBeds} />
          </Suspense>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default BedSetUpPage;
