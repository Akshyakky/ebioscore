import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { DeptUnitAllocationDto } from "@/interfaces/HospitalAdministration/DeptUnitAllocationDto";
import { deptUnitAllocationService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

const useGenericDeptUnitAllocation = createEntityHook<DeptUnitAllocationDto>(deptUnitAllocationService, "dUAID");

export const useDeptUnitAllocation = () => {
  const hook = useGenericDeptUnitAllocation();

  // Validation functions for schedule conflicts
  const checkScheduleConflict = (newAllocation: Partial<DeptUnitAllocationDto>, existingAllocations: DeptUnitAllocationDto[]): { hasConflict: boolean; message?: string } => {
    const parseTime = (timeStr: string) => {
      const date = new Date(timeStr);
      return date.getHours() * 60 + date.getMinutes();
    };

    const newStartMinutes = parseTime(newAllocation.uASTIME!);
    const newEndMinutes = parseTime(newAllocation.uAETIME!);

    // Get active allocations excluding current one if editing
    const activeAllocations = existingAllocations.filter((allocation) => allocation.dUAID !== newAllocation.dUAID && allocation.rActiveYN === "Y");

    for (const allocation of activeAllocations) {
      const existingStartMinutes = parseTime(allocation.uASTIME);
      const existingEndMinutes = parseTime(allocation.uAETIME);

      // Check if same faculty
      if (allocation.facultyID === newAllocation.facultyID) {
        // Check time overlap
        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          // Check if days overlap
          const daysOverlap = checkDaysOverlap(newAllocation, allocation);

          // Check if occurrences overlap
          const occurrencesOverlap = checkOccurrencesOverlap(newAllocation, allocation);

          if (daysOverlap && occurrencesOverlap) {
            return {
              hasConflict: true,
              message: `Faculty ${allocation.facultyName} already has an allocation from ${allocation.uASTIME} to ${allocation.uAETIME} on overlapping days/occurrences.`,
            };
          }
        }
      }

      // Check if same room
      if (allocation.roomID === newAllocation.roomID && newAllocation.roomID > 0) {
        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          const daysOverlap = checkDaysOverlap(newAllocation, allocation);
          const occurrencesOverlap = checkOccurrencesOverlap(newAllocation, allocation);

          if (daysOverlap && occurrencesOverlap) {
            return {
              hasConflict: true,
              message: `Room ${allocation.roomName} is already booked from ${allocation.uASTIME} to ${allocation.uAETIME} on overlapping days/occurrences.`,
            };
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const checkDaysOverlap = (allocation1: Partial<DeptUnitAllocationDto>, allocation2: DeptUnitAllocationDto): boolean => {
    // If either has all days, they overlap
    if (allocation1.allDaysYN === "Y" || allocation2.allDaysYN === "Y") {
      return true;
    }

    // Check individual days
    const days = ["sunYN", "monYN", "tueYN", "wedYN", "thuYN", "friYN", "satYN"] as const;
    return days.some((day) => allocation1[day] === "Y" && allocation2[day] === "Y");
  };

  const checkOccurrencesOverlap = (allocation1: Partial<DeptUnitAllocationDto>, allocation2: DeptUnitAllocationDto): boolean => {
    // If either has all occurrences, they overlap
    if (allocation1.occuranceAllYN === "Y" || allocation2.occuranceAllYN === "Y") {
      return true;
    }

    // Check individual occurrences
    const occurrences = ["occurance1YN", "occurance2YN", "occurance3YN", "occurance4YN", "occurance5YN"] as const;
    return occurrences.some((occ) => allocation1[occ] === "Y" && allocation2[occ] === "Y");
  };

  return {
    allocationList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchAllocationList: hook.fetchEntityList,
    getAllocationById: hook.getEntityById,
    saveAllocation: hook.saveEntity,
    deleteAllocation: hook.deleteEntity,
    updateAllocationStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
    checkScheduleConflict,
  };
};
