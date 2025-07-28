import { useLoading } from "@/hooks/Common/useLoading";
import { GetLabRegistersListDto, InvStatusResponseDto, SampleStatusUpdateRequestDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { laboratoryService } from "@/services/Laboratory/LaboratoryService";
import { useCallback, useState } from "react";

export const useLaboratoryReportEntry = () => {
  const [labRegisters, setLabRegisters] = useState<GetLabRegistersListDto[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [investigationStatuses, setInvestigationStatuses] = useState<InvStatusResponseDto[]>([]);
  const [selectedLabRegNo, setSelectedLabRegNo] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { isLoading, setLoading } = useLoading();
  const [updateLoading, setUpdateLoading] = useState(false);
  const fetchLabRegisters = useCallback(
    async (bchID: number) => {
      if (!bchID || bchID === 0) {
        setLabRegisters([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await laboratoryService.getLabRegisters(bchID);
        if (result.success && result.data) {
          setLabRegisters(result.data);
        } else {
          setError(result.errorMessage || "Failed to fetch lab registers");
          setLabRegisters([]);
        }
      } catch (err) {
        console.error("Error fetching lab registers:", err);
        setError("An unexpected error occurred while fetching lab registers");
        setLabRegisters([]);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const fetchInvestigationStatus = useCallback(
    async (labRegNo: number) => {
      if (!selectedServiceType || selectedServiceType === 0) {
        setError("Service type not selected");
        return;
      }

      setStatusLoading(true);
      setError(null);
      setSelectedLabRegNo(labRegNo);

      try {
        const result = await laboratoryService.getInvestigationsStatus(labRegNo, selectedServiceType);
        if (result.success && result.data) {
          setInvestigationStatuses(result.data);
        } else {
          setError(result.errorMessage || "Failed to fetch investigation status");
          setInvestigationStatuses([]);
        }
      } catch (err) {
        console.error("Error fetching investigation status:", err);
        setError("An unexpected error occurred while fetching investigation status");
        setInvestigationStatuses([]);
      } finally {
        setStatusLoading(false);
      }
    },
    [selectedServiceType]
  );

  const handleServiceTypeChange = useCallback(
    (bchID: number) => {
      setSelectedServiceType(bchID);
      setInvestigationStatuses([]);
      setSelectedLabRegNo(null);
      if (bchID > 0) {
        fetchLabRegisters(bchID);
      } else {
        setLabRegisters([]);
      }
    },
    [fetchLabRegisters]
  );

  const refreshData = useCallback(() => {
    if (selectedServiceType > 0) {
      fetchLabRegisters(selectedServiceType);
    }
  }, [selectedServiceType, fetchLabRegisters]);

  const clearInvestigationStatus = useCallback(() => {
    setInvestigationStatuses([]);
    setSelectedLabRegNo(null);
  }, []);
  const updateSampleStatus = useCallback(
    async (updates: SampleStatusUpdateRequestDto[]) => {
      setUpdateLoading(true);
      setError(null);

      try {
        const result = await laboratoryService.updateSampleCollectionStatus(updates);
        if (result.success) {
          // Refresh the current data after successful update
          if (selectedServiceType > 0) {
            await fetchLabRegisters(selectedServiceType);
          }
          // If investigation status dialog is open, refresh that too
          if (selectedLabRegNo) {
            await fetchInvestigationStatus(selectedLabRegNo);
          }
          return { success: true, message: "Sample status updated successfully" };
        } else {
          setError(result.errorMessage || "Failed to update sample status");
          return { success: false, message: result.errorMessage || "Failed to update sample status" };
        }
      } catch (err) {
        console.error("Error updating sample status:", err);
        setError("An unexpected error occurred while updating sample status");
        return { success: false, message: "An unexpected error occurred" };
      } finally {
        setUpdateLoading(false);
      }
    },
    [selectedServiceType, selectedLabRegNo, fetchLabRegisters, fetchInvestigationStatus]
  );
  return {
    labRegisters,
    selectedServiceType,
    isLoading,
    error,
    investigationStatuses,
    selectedLabRegNo,
    statusLoading,
    fetchLabRegisters,
    fetchInvestigationStatus,
    handleServiceTypeChange,
    refreshData,
    clearInvestigationStatus,
    updateLoading,
    updateSampleStatus,
  };
};
