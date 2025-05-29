// src/hooks/useBedSelection.ts
import { useState, useCallback, useEffect } from "react";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { wrBedService, roomListService, roomGroupService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { useAlert } from "@/providers/AlertProvider";

export interface UseBedSelectionOptions {
  autoLoad?: boolean;
  filters?: {
    availableOnly?: boolean;
    departmentIds?: number[];
    roomGroupIds?: number[];
    excludeBedIds?: number[];
  };
}

export interface BedSelectionState {
  beds: WrBedDto[];
  rooms: RoomListDto[];
  roomGroups: RoomGroupDto[];
  loading: boolean;
  error: string | null;
  selectedBed: WrBedDto | null;
}

export const useBedSelection = (options: UseBedSelectionOptions = {}) => {
  const { autoLoad = true, filters = {} } = options;
  const { showErrorAlert } = useAlert();

  const [state, setState] = useState<BedSelectionState>({
    beds: [],
    rooms: [],
    roomGroups: [],
    loading: false,
    error: null,
    selectedBed: null,
  });

  // Load all required data
  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [bedsResponse, roomsResponse, roomGroupsResponse] = await Promise.all([
        wrBedService.getAllWithIncludes(["RoomList", "RoomList.RoomGroup"]),
        roomListService.getAllWithIncludes(["RoomGroup"]),
        roomGroupService.getAll(),
      ]);

      if (!bedsResponse.success) {
        throw new Error(bedsResponse.errorMessage || "Failed to load beds");
      }

      if (!roomsResponse.success) {
        throw new Error(roomsResponse.errorMessage || "Failed to load rooms");
      }

      if (!roomGroupsResponse.success) {
        throw new Error(roomGroupsResponse.errorMessage || "Failed to load room groups");
      }

      let beds = bedsResponse.data || [];
      const rooms = roomsResponse.data || [];
      const roomGroups = roomGroupsResponse.data || [];

      // Apply filters
      if (filters.availableOnly) {
        beds = beds.filter((bed) => bed.bedStatusValue === "Available" && bed.rActiveYN === "Y");
      }

      if (filters.departmentIds && filters.departmentIds.length > 0) {
        beds = beds.filter((bed) => {
          const room = rooms.find((r) => r.rlID === bed.rlID);
          const roomGroup = room ? roomGroups.find((rg) => rg.rGrpID === room.rgrpID) : null;
          return roomGroup && filters.departmentIds!.includes(roomGroup.deptID);
        });
      }

      if (filters.roomGroupIds && filters.roomGroupIds.length > 0) {
        beds = beds.filter((bed) => {
          const room = rooms.find((r) => r.rlID === bed.rlID);
          return room && filters.roomGroupIds!.includes(room.rgrpID);
        });
      }

      if (filters.excludeBedIds && filters.excludeBedIds.length > 0) {
        beds = beds.filter((bed) => !filters.excludeBedIds!.includes(bed.bedID));
      }

      setState((prev) => ({
        ...prev,
        beds,
        rooms,
        roomGroups,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      showErrorAlert(errorMessage, "error");
    }
  }, [filters, showErrorAlert]);

  // Select a bed
  const selectBed = useCallback((bed: WrBedDto | null) => {
    setState((prev) => ({
      ...prev,
      selectedBed: bed,
    }));
  }, []);

  // Find bed by ID
  const findBedById = useCallback(
    (bedId: number): WrBedDto | null => {
      return state.beds.find((bed) => bed.bedID === bedId) || null;
    },
    [state.beds]
  );

  // Get available beds count
  const getAvailableBedsCount = useCallback((): number => {
    return state.beds.filter((bed) => bed.bedStatusValue === "Available" && bed.rActiveYN === "Y").length;
  }, [state.beds]);

  // Get beds by room
  const getBedsByRoom = useCallback(
    (roomId: number): WrBedDto[] => {
      return state.beds.filter((bed) => bed.rlID === roomId);
    },
    [state.beds]
  );

  // Get beds by room group
  const getBedsByRoomGroup = useCallback(
    (roomGroupId: number): WrBedDto[] => {
      return state.beds.filter((bed) => {
        const room = state.rooms.find((r) => r.rlID === bed.rlID);
        return room && room.rgrpID === roomGroupId;
      });
    },
    [state.beds, state.rooms]
  );

  // Load data on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    ...state,
    loadData,
    selectBed,
    findBedById,
    getAvailableBedsCount,
    getBedsByRoom,
    getBedsByRoomGroup,
    refresh: loadData,
  };
};
