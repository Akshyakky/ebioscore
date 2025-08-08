import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { debounce } from "@/utils/Common/debounceUtils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

interface FilterFormData {
  serviceType: string;
  sampleStatus: string;
  patientStatus: string;
  reportStatus: string;
  serviceGroup: string;
}

export const useLabFilters = (labRegisters: GetLabRegistersListDto[], selectedServiceType: number | null) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const {
    control,
    watch,
    setValue,
    reset: resetFilters,
  } = useForm<FilterFormData>({
    defaultValues: {
      serviceType: "",
      sampleStatus: "all",
      patientStatus: "all",
      reportStatus: "all",
      serviceGroup: "all",
    },
  });

  const filters = watch();

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleClearFilters = useCallback(() => {
    resetFilters({
      serviceType: selectedServiceType?.toString() || "",
      sampleStatus: "all",
      patientStatus: "all",
      reportStatus: "all",
      serviceGroup: "all",
    });
  }, [resetFilters, selectedServiceType]);

  const filteredRegisters = useMemo(() => {
    if (!labRegisters.length) return [];

    return labRegisters.filter((register) => {
      const reg = register.labRegister;

      const matchesSearch =
        debouncedSearchTerm === "" ||
        reg.labRegNo.toString().includes(debouncedSearchTerm) ||
        reg.patientFullName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reg.patientUHID?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reg.referralDoctor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesSampleStatus = filters.sampleStatus === "all" || reg.sampleStatus?.toLowerCase().includes(filters.sampleStatus.toLowerCase());

      const matchesPatientStatus =
        filters.patientStatus === "all" || (filters.patientStatus === "op" && reg.patientStatus === "OP") || (filters.patientStatus === "ip" && reg.patientStatus.startsWith("IP"));

      const matchesReportStatus =
        filters.reportStatus === "all" ||
        (filters.reportStatus === "pending" && reg.sampleStatus === "Pending") ||
        (filters.reportStatus === "partial" && (reg.sampleStatus === "Partially Collected" || reg.sampleStatus === "Partially Completed")) ||
        (filters.reportStatus === "completed" && reg.sampleStatus === "Completed") ||
        (filters.reportStatus === "approved" && (reg.sampleStatus === "Approved" || reg.sampleStatus === "Partially Approved"));

      const matchesServiceGroup = filters.serviceGroup === "all" || (reg.serviceGroups && reg.serviceGroups.some((sg) => sg.serviceGroupId.toString() === filters.serviceGroup));

      return matchesSearch && matchesSampleStatus && matchesPatientStatus && matchesReportStatus && matchesServiceGroup;
    });
  }, [labRegisters, debouncedSearchTerm, filters]);

  return {
    searchTerm,
    debouncedSearchTerm,
    filters,
    control,
    setValue,
    filteredRegisters,
    handleSearchChange,
    handleClearSearch,
    handleClearFilters,
  };
};
