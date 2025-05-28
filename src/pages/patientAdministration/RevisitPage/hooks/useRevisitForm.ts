import { useState, useCallback } from "react";
import { OPVisitDto, DateFilterType } from "@/interfaces/PatientAdministration/revisitFormData";
import { RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import { OperationResult } from "@/interfaces/Common/OperationResult";

interface UseRevisitReturn {
  visitList: OPVisitDto[];
  isLoading: boolean;
  error: string | null;
  fetchVisitList: (dateFilter?: DateFilterType, startDate?: Date | null, endDate?: Date | null) => Promise<void>;
  getVisitById: (opVID: number) => Promise<OPVisitDto | null>;
  saveVisit: (visitData: OPVisitDto) => Promise<OperationResult<OPVisitDto>>;
  deleteVisit: (opVID: number) => Promise<boolean>;
  cancelVisit: (opVID: number, modifiedBy: string) => Promise<boolean>;
  getWaitingPatients: (attendingPhysicianID?: number, dateFilterType?: DateFilterType, startDate?: Date, endDate?: Date) => Promise<any[]>;
  updateVisitStatus: (opVID: number, status: string) => Promise<boolean>;
}

export const useRevisit = (): UseRevisitReturn => {
  const [visitList, setVisitList] = useState<OPVisitDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchVisitList = useCallback(async (dateFilter: DateFilterType = DateFilterType.Today, startDate: Date | null = null, endDate: Date | null = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await RevisitService.getWaitingPatientDetails(undefined, dateFilter, startDate || undefined, endDate || undefined);

      if (result.success && result.data) {
        const transformedVisits: OPVisitDto[] = result.data.map((item: any) => ({
          opVID: item.opVID || 0,
          pChartID: item.pChartID || 0,
          pChartCode: item.pChartCode || "",
          pVisitDate: new Date(item.pVisitDate || new Date()),
          patOPIP: item.patOPIP || "O",
          attendingPhysicianId: item.attendingPhysicianId || 0,
          attendingPhysicianName: item.attendingPhysicianName || "",
          attendingPhysicianSpecialtyId: item.attendingPhysicianSpecialtyId || 0,
          attendingPhysicianSpecialty: item.attendingPhysicianSpecialty || "",
          primaryReferralSourceId: item.primaryReferralSourceId || 0,
          primaryReferralSourceName: item.primaryReferralSourceName || "",
          primaryPhysicianId: item.primaryPhysicianId || 0,
          primaryPhysicianName: item.primaryPhysicianName || "",
          pVisitStatus: item.pVisitStatus || "W",
          pVisitType: item.pVisitType || "P",
          pVisitTypeText: item.pVisitTypeText || "",
          rActiveYN: item.rActiveYN || "Y",
          rNotes: item.rNotes || "",
          pTypeID: item.pTypeID || 0,
          pTypeCode: item.pTypeCode || "",
          pTypeName: item.pTypeName || "",
          crossConsultation: item.crossConsultation || "N",
          deptID: item.deptID || 0,
          deptName: item.deptName || "",
          opNumber: item.opNumber || "",
          pChartCompID: item.pChartCompID || 0,
          refFacultyID: item.refFacultyID || 0,
          refFaculty: item.refFaculty || "",
          secondaryReferralSourceId: item.secondaryReferralSourceId || 0,
          secondaryReferralSourceName: item.secondaryReferralSourceName || "",
          oldPChartID: item.oldPChartID || 0,
          transferYN: item.transferYN || "N",
        }));

        setVisitList(transformedVisits);
      } else {
        setError(result.errorMessage || "Failed to fetch visits");
        setVisitList([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setVisitList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVisitById = useCallback(
    async (opVID: number): Promise<OPVisitDto | null> => {
      try {
        const existingVisit = visitList.find((visit) => visit.opVID === opVID);
        if (existingVisit) {
          return existingVisit;
        }
        return null;
      } catch (err) {
        return null;
      }
    },
    [visitList]
  );

  const saveVisit = useCallback(async (visitData: OPVisitDto): Promise<OperationResult<OPVisitDto>> => {
    try {
      const result = await RevisitService.saveOPVisits(visitData);
      if (result.success) {
        if (visitData.opVID === 0) {
          const newVisit = { ...visitData, opVID: result.data?.opVID || Date.now() };
          setVisitList((prev) => [...prev, newVisit]);
        } else {
          setVisitList((prev) => prev.map((visit) => (visit.opVID === visitData.opVID ? { ...visitData } : visit)));
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save visit";
      return {
        success: false,
        errorMessage,
        data: null,
      };
    }
  }, []);

  const deleteVisit = useCallback(async (opVID: number): Promise<boolean> => {
    try {
      const result = await RevisitService.cancelVisit(opVID, "System");
      if (result.success) {
        setVisitList((prev) => prev.filter((visit) => visit.opVID !== opVID));
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const cancelVisit = useCallback(async (opVID: number, modifiedBy: string): Promise<boolean> => {
    try {
      const result = await RevisitService.cancelVisit(opVID, modifiedBy);
      if (result.success) {
        setVisitList((prev) => prev.map((visit) => (visit.opVID === opVID ? { ...visit, pVisitStatus: "X" } : visit)));
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const getWaitingPatients = useCallback(
    async (attendingPhysicianID?: number, dateFilterType: DateFilterType = DateFilterType.Today, startDate?: Date, endDate?: Date): Promise<any[]> => {
      try {
        const result = await RevisitService.getWaitingPatientDetails(attendingPhysicianID, dateFilterType, startDate, endDate);

        if (result.success && result.data) {
          return result.data;
        }

        return [];
      } catch (err) {
        return [];
      }
    },
    []
  );

  const updateVisitStatus = useCallback(
    async (opVID: number, status: string): Promise<boolean> => {
      try {
        setVisitList((prev) => prev.map((visit) => (visit.opVID === opVID ? { ...visit, pVisitStatus: status } : visit)));
        return true;
      } catch (err) {
        fetchVisitList();
        return false;
      }
    },
    [fetchVisitList]
  );

  return {
    visitList,
    isLoading,
    error,
    fetchVisitList,
    getVisitById,
    saveVisit,
    deleteVisit,
    cancelVisit,
    getWaitingPatients,
    updateVisitStatus,
  };
};
