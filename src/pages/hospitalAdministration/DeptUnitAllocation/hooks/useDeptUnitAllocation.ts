import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { DeptUnitAllocationDto } from "@/interfaces/HospitalAdministration/DeptUnitAllocationDto";
import { deptUnitAllocationService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

const useGenericDeptUnitAllocation = createEntityHook<DeptUnitAllocationDto>(deptUnitAllocationService, "dUAID");

export const useDeptUnitAllocation = () => {
  const hook = useGenericDeptUnitAllocation();

  const checkScheduleConflict = (newAllocation: Partial<DeptUnitAllocationDto>, existingAllocations: DeptUnitAllocationDto[]): { hasConflict: boolean; message?: string } => {
    // Ensure uASTIME and uAETIME are Date objects
    if (!newAllocation.uASTIME || !newAllocation.uAETIME) {
      return { hasConflict: true, message: "Start or end time is missing" };
    }

    const newStartMinutes = newAllocation.uASTIME.getHours() * 60 + newAllocation.uASTIME.getMinutes();
    const newEndMinutes = newAllocation.uAETIME.getHours() * 60 + newAllocation.uAETIME.getMinutes();

    const activeAllocations = existingAllocations.filter((allocation) => allocation.dUAID !== newAllocation.dUAID && allocation.rActiveYN === "Y");

    for (const allocation of activeAllocations) {
      const existingStartMinutes = allocation.uASTIME.getHours() * 60 + allocation.uASTIME.getMinutes();
      const existingEndMinutes = allocation.uAETIME.getHours() * 60 + allocation.uAETIME.getMinutes();

      if (allocation.facultyID === newAllocation.facultyID) {
        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          const daysOverlap = checkDaysOverlap(newAllocation, allocation);
          const occurrencesOverlap = checkOccurrencesOverlap(newAllocation, allocation);

          if (daysOverlap && occurrencesOverlap) {
            return {
              hasConflict: true,
              message: `Faculty ${allocation.facultyName} already has an allocation from ${allocation.uASTIME.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })} to ${allocation.uAETIME.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} on overlapping days/occurrences.`,
            };
          }
        }
      }

      if (allocation.roomID === newAllocation.roomID && newAllocation.roomID && newAllocation.roomID > 0) {
        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          const daysOverlap = checkDaysOverlap(newAllocation, allocation);
          const occurrencesOverlap = checkOccurrencesOverlap(newAllocation, allocation);

          if (daysOverlap && occurrencesOverlap) {
            return {
              hasConflict: true,
              message: `Room ${allocation.roomName} is already booked from ${allocation.uASTIME.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })} to ${allocation.uAETIME.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} on overlapping days/occurrences.`,
            };
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const checkDaysOverlap = (allocation1: Partial<DeptUnitAllocationDto>, allocation2: DeptUnitAllocationDto): boolean => {
    if (allocation1.allDaysYN === "Y" || allocation2.allDaysYN === "Y") {
      return true;
    }

    const days = ["sunYN", "monYN", "tueYN", "wedYN", "thuYN", "friYN", "satYN"] as const;
    return days.some((day) => allocation1[day] === "Y" && allocation2[day] === "Y");
  };

  const checkOccurrencesOverlap = (allocation1: Partial<DeptUnitAllocationDto>, allocation2: DeptUnitAllocationDto): boolean => {
    if (allocation1.occuranceAllYN === "Y" || allocation2.occuranceAllYN === "Y") {
      return true;
    }

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
