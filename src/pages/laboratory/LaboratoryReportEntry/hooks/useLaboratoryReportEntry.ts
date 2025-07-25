import { useLoading } from "@/hooks/Common/useLoading";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { laboratoryService } from "@/services/Laboratory/LaboratoryService";
import { useCallback, useState } from "react";

export const useLaboratoryReportEntry = () => {
  const [labRegisters, setLabRegisters] = useState<GetLabRegistersListDto[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoading();

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

  const handleServiceTypeChange = useCallback(
    (bchID: number) => {
      setSelectedServiceType(bchID);
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

  return {
    labRegisters,
    selectedServiceType,
    isLoading,
    error,
    fetchLabRegisters,
    handleServiceTypeChange,
    refreshData,
  };
};
