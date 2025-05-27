import { useState, useEffect, useCallback } from "react";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { roomGroupService, roomListService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { useAlert } from "@/providers/AlertProvider";

/**
 * Custom hook for managing Room-Bed Setup data and operations
 *
 * This hook centralizes all data fetching, manipulation, and state management
 * for the Room-Bed Setup module, providing a clean API for components to use.
 */
export const useBedSetup = () => {
  // Data states
  const [roomGroups, setRoomGroups] = useState<RoomGroupDto[]>([]);
  const [roomLists, setRoomLists] = useState<RoomListDto[]>([]);
  const [beds, setBeds] = useState<WrBedDto[]>([]);

  // Loading and error states
  const [isLoadingRoomGroups, setIsLoadingRoomGroups] = useState(false);
  const [isLoadingRoomLists, setIsLoadingRoomLists] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showAlert } = useAlert();

  // Combined loading state
  const isLoading = isLoadingRoomGroups || isLoadingRoomLists || isLoadingBeds;

  /**
   * Fetch all room groups
   */
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

  /**
   * Fetch all room lists with their room group information
   */
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

  /**
   * Fetch all beds with their room and room group information
   */
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

  /**
   * Fetch all data at once
   */
  const fetchAllData = useCallback(async () => {
    setError(null);

    try {
      await Promise.all([fetchRoomGroups(), fetchRoomLists(), fetchBeds()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    }
  }, [fetchRoomGroups, fetchRoomLists, fetchBeds]);

  /**
   * Save a room group
   */
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

  /**
   * Save a room
   */
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

  /**
   * Save a bed
   */
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

  /**
   * Delete (deactivate) a room group
   */
  const deleteRoomGroup = useCallback(
    async (roomGroupId: number) => {
      try {
        // First, check if there are active rooms associated with this group
        const associatedRooms = roomLists.filter((room) => room.rgrpID === roomGroupId && room.rActiveYN === "Y");

        if (associatedRooms.length > 0) {
          showAlert("Error", "This room group cannot be deleted as it has active associated rooms. Please deactivate or delete the rooms first.", "error");
          return false;
        }

        // Get the room group
        const response = await roomGroupService.getById(roomGroupId);

        if (response.success && response.data) {
          // Deactivate instead of hard delete
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

  /**
   * Delete (deactivate) a room
   */
  const deleteRoom = useCallback(
    async (roomId: number) => {
      try {
        // First, check if there are active beds associated with this room
        const associatedBeds = beds.filter((bed) => bed.rlID === roomId && bed.rActiveYN === "Y");

        if (associatedBeds.length > 0) {
          showAlert("Error", "This room cannot be deleted as it has active associated beds. Please deactivate or delete the beds first.", "error");
          return false;
        }

        // Get the room
        const response = await roomListService.getById(roomId);

        if (response.success && response.data) {
          // Deactivate instead of hard delete
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

  /**
   * Delete (deactivate) a bed
   */
  const deleteBed = useCallback(
    async (bedId: number) => {
      try {
        // Get the bed
        const response = await wrBedService.getById(bedId);

        if (response.success && response.data) {
          // Deactivate instead of hard delete
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

  /**
   * Get a room group by ID
   */
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

  /**
   * Get a room by ID
   */
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

  /**
   * Get a bed by ID
   */
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

  /**
   * Get the next code for a given entity
   */
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

  // Load initial data when the hook is first used
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Return all the data and functions
  return {
    // Data
    roomGroups,
    roomLists,
    beds,

    // Status
    isLoading,
    isLoadingRoomGroups,
    isLoadingRoomLists,
    isLoadingBeds,
    error,

    // Fetch functions
    fetchRoomGroups,
    fetchRoomLists,
    fetchBeds,
    fetchAllData,

    // CRUD functions
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
