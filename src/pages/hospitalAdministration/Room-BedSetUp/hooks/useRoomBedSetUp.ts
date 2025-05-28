import { useState, useEffect, useCallback } from "react";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { roomGroupService, roomListService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { useAlert } from "@/providers/AlertProvider";

export const useBedSetup = () => {
  const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
  const [roomLists, setRoomLists] = useState<RoomListDto[]>([]);
  const [beds, setBeds] = useState<WrBedDto[]>([]);
  const [isLoadingRoomGroups, setIsLoadingRoomGroups] = useState(false);
  const [isLoadingRoomLists, setIsLoadingRoomLists] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const isLoading = isLoadingRoomGroups || isLoadingRoomLists || isLoadingBeds;
  const fetchRoomGroups = useCallback(async () => {
    setIsLoadingRoomGroups(true);
    setError(null);
    try {
      const response = await roomGroupService.getAll();
      if (response.success) {
        setRoomGroups(response.data || []);
        return response.data || [];
      } else {
        throw new Error(response.errorMessage || "Failed to fetch room groups");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch room groups";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return [];
    } finally {
      setIsLoadingRoomGroups(false);
    }
  }, [showAlert]);

  const fetchRoomLists = useCallback(async () => {
    setIsLoadingRoomLists(true);
    setError(null);
    try {
      const response = await roomListService.getAllWithIncludes(["RoomGroup"]);
      if (response.success) {
        setRoomLists(response.data || []);
        return response.data || [];
      } else {
        throw new Error(response.errorMessage || "Failed to fetch room lists");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch room lists";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return [];
    } finally {
      setIsLoadingRoomLists(false);
    }
  }, [showAlert]);

  const fetchBeds = useCallback(async () => {
    setIsLoadingBeds(true);
    setError(null);
    try {
      const response = await wrBedService.getAllWithIncludes(["RoomList", "RoomList.RoomGroup"]);
      if (response.success) {
        setBeds(response.data || []);
        return response.data || [];
      } else {
        throw new Error(response.errorMessage || "Failed to fetch beds");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch beds";
      setError(errorMessage);
      showAlert("Error", errorMessage, "error");
      return [];
    } finally {
      setIsLoadingBeds(false);
    }
  }, [showAlert]);

  const fetchAllData = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([fetchRoomGroups(), fetchRoomLists(), fetchBeds()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  }, [fetchRoomGroups, fetchRoomLists, fetchBeds]);

  const saveRoomGroup = useCallback(
    async (roomGroup: RoomGroupDto) => {
      try {
        const response = await roomGroupService.save(roomGroup);
        if (response.success) {
          showAlert("Success", roomGroup.rGrpID ? "Room group updated successfully" : "Room group created successfully", "success");
          await fetchRoomGroups();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to save room group");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save room group";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [fetchRoomGroups, showAlert]
  );

  const saveRoom = useCallback(
    async (room: RoomListDto) => {
      try {
        const response = await roomListService.save(room);
        if (response.success) {
          showAlert("Success", room.rlID ? "Room updated successfully" : "Room created successfully", "success");
          await fetchRoomLists();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to save room");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save room";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [fetchRoomLists, showAlert]
  );

  const saveBed = useCallback(
    async (bed: WrBedDto) => {
      try {
        const response = await wrBedService.save(bed);
        if (response.success) {
          showAlert("Success", bed.bedID ? "Bed updated successfully" : "Bed created successfully", "success");
          await fetchBeds();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to save bed");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save bed";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [fetchBeds, showAlert]
  );

  const deleteRoomGroup = useCallback(
    async (roomGroupId: number) => {
      try {
        const associatedRooms = roomLists.filter((room) => room.rgrpID === roomGroupId && room.rActiveYN === "Y");
        if (associatedRooms.length > 0) {
          showAlert("Error", "This room group cannot be deleted as it has active associated rooms. Please deactivate or delete the rooms first.", "error");
          return false;
        }
        const response = await roomGroupService.getById(roomGroupId);
        if (response.success && response.data) {
          const updatedRoomGroup = { ...response.data, rActiveYN: "N" };
          const result = await roomGroupService.save(updatedRoomGroup);
          if (result.success) {
            showAlert("Success", "Room group deactivated successfully", "success");
            await fetchRoomGroups();
            return true;
          } else {
            throw new Error(result.errorMessage || "Failed to deactivate room group");
          }
        } else {
          throw new Error("Room group not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete room group";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [roomLists, fetchRoomGroups, showAlert]
  );

  const deleteRoom = useCallback(
    async (roomId: number) => {
      try {
        const associatedBeds = beds.filter((bed) => bed.rlID === roomId && bed.rActiveYN === "Y");
        if (associatedBeds.length > 0) {
          showAlert("Error", "This room cannot be deleted as it has active associated beds. Please deactivate or delete the beds first.", "error");
          return false;
        }
        const response = await roomListService.getById(roomId);

        if (response.success && response.data) {
          const updatedRoom = { ...response.data, rActiveYN: "N" };
          const result = await roomListService.save(updatedRoom);
          if (result.success) {
            showAlert("Success", "Room deactivated successfully", "success");
            await fetchRoomLists();
            return true;
          } else {
            throw new Error(result.errorMessage || "Failed to deactivate room");
          }
        } else {
          throw new Error("Room not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete room";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [beds, fetchRoomLists, showAlert]
  );

  const deleteBed = useCallback(
    async (bedId: number) => {
      try {
        const response = await wrBedService.getById(bedId);
        if (response.success && response.data) {
          const updatedBed = { ...response.data, rActiveYN: "N" };
          const result = await wrBedService.save(updatedBed);
          if (result.success) {
            showAlert("Success", "Bed deactivated successfully", "success");
            await fetchBeds();
            return true;
          } else {
            throw new Error(result.errorMessage || "Failed to deactivate bed");
          }
        } else {
          throw new Error("Bed not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete bed";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      }
    },
    [fetchBeds, showAlert]
  );

  const getRoomGroupById = useCallback(
    async (roomGroupId: number) => {
      try {
        const response = await roomGroupService.getById(roomGroupId);

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to get room group");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get room group";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  const getRoomById = useCallback(
    async (roomId: number) => {
      try {
        const response = await roomListService.getById(roomId);

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to get room");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get room";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  const getBedById = useCallback(
    async (bedId: number) => {
      try {
        const response = await wrBedService.getById(bedId);

        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to get bed");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get bed";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  const getNextCode = useCallback(
    async (prefix: string, digits: number) => {
      try {
        if (prefix === "RG") {
          return await roomGroupService.getNextCode(prefix, digits);
        } else if (prefix === "RM") {
          return await roomListService.getNextCode(prefix, digits);
        } else if (prefix === "BD") {
          return await wrBedService.getNextCode(prefix, digits);
        }
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate code";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      }
    },
    [showAlert]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    roomGroups,
    roomLists,
    beds,
    isLoading,
    isLoadingRoomGroups,
    isLoadingRoomLists,
    isLoadingBeds,
    error,
    fetchRoomGroups,
    fetchRoomLists,
    fetchBeds,
    fetchAllData,
    saveRoomGroup,
    saveRoom,
    saveBed,
    deleteRoomGroup,
    deleteRoom,
    deleteBed,
    getRoomGroupById,
    getRoomById,
    getBedById,
    getNextCode,
  };
};

export default useBedSetup;
