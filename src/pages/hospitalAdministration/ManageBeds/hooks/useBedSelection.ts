// src/hooks/useBedSelection.ts
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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

  // FIXED: Use ref to store filters to prevent dependency issues
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const [state, setState] = useState<BedSelectionState>({
    beds: [],
    rooms: [],
    roomGroups: [],
    loading: false,
    error: null,
    selectedBed: null,
  });

  // FIXED: Memoize the filter criteria to ensure stable dependencies
  const filterCriteria = useMemo(() => {
    return {
      availableOnly: filters.availableOnly || false,
      departmentIds: filters.departmentIds || [],
      roomGroupIds: filters.roomGroupIds || [],
      excludeBedIds: filters.excludeBedIds || [],
    };
  }, [filters.availableOnly, filters.departmentIds?.length, filters.roomGroupIds?.length, filters.excludeBedIds?.length]);

  // FIXED: Apply filters to beds data using a separate function
  const applyFilters = useCallback((beds: WrBedDto[], rooms: RoomListDto[], roomGroups: RoomGroupDto[]) => {
    let filteredBeds = [...beds];
    const currentFilters = filtersRef.current;

    // Apply availableOnly filter
    if (currentFilters.availableOnly) {
      filteredBeds = filteredBeds.filter((bed) => bed.bedStatusValue === "AVLBL" && bed.rActiveYN === "Y");
    }

    // Apply department filter
    if (currentFilters.departmentIds && currentFilters.departmentIds.length > 0) {
      filteredBeds = filteredBeds.filter((bed) => {
        const room = rooms.find((r) => r.rlID === bed.rlID);
        const roomGroup = room ? roomGroups.find((rg) => rg.rGrpID === room.rgrpID) : null;
        return roomGroup && currentFilters.departmentIds!.includes(roomGroup.deptID);
      });
    }

    // Apply room group filter
    if (currentFilters.roomGroupIds && currentFilters.roomGroupIds.length > 0) {
      filteredBeds = filteredBeds.filter((bed) => {
        const room = rooms.find((r) => r.rlID === bed.rlID);
        return room && currentFilters.roomGroupIds!.includes(room.rgrpID);
      });
    }

    // Apply exclude beds filter
    if (currentFilters.excludeBedIds && currentFilters.excludeBedIds.length > 0) {
      filteredBeds = filteredBeds.filter((bed) => !currentFilters.excludeBedIds!.includes(bed.bedID));
    }

    return filteredBeds;
  }, []); // No dependencies to prevent recreation

  // FIXED: Load all required data without filters dependency
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

      const allBeds = bedsResponse.data || [];
      const rooms = roomsResponse.data || [];
      const roomGroups = roomGroupsResponse.data || [];

      // Apply filters to the beds
      const filteredBeds = applyFilters(allBeds, rooms, roomGroups);

      setState((prev) => ({
        ...prev,
        beds: filteredBeds,
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
  }, [showErrorAlert, applyFilters]); // Removed filters dependency

  // FIXED: Re-apply filters when filter criteria changes without reloading data
  useEffect(() => {
    if (state.rooms.length > 0 && state.roomGroups.length > 0) {
      // Re-fetch all beds and apply new filters
      loadData();
    }
  }, [filterCriteria.availableOnly, filterCriteria.departmentIds.length, filterCriteria.roomGroupIds.length, filterCriteria.excludeBedIds.length]);

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
    return state.beds.filter((bed) => bed.bedStatusValue === "AVLBL" && bed.rActiveYN === "Y").length;
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

  // FIXED: Load data on mount if autoLoad is enabled, with stable dependency
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad]); // Removed loadData dependency to prevent infinite loops

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
