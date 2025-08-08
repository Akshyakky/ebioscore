import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useMemo } from "react";

export interface LabStatistics {
  totalRegisters: number;
  pendingSamples: number;
  collectedSamples: number;
  completedResults: number;
  approvedResults: number;
  totalInvestigations: number;
  opPatients: number;
  ipPatients: number;
}

export const useLabStatistics = (labRegisters: GetLabRegistersListDto[]): LabStatistics => {
  return useMemo(() => {
    if (!labRegisters.length) {
      return {
        totalRegisters: 0,
        pendingSamples: 0,
        collectedSamples: 0,
        completedResults: 0,
        approvedResults: 0,
        totalInvestigations: 0,
        opPatients: 0,
        ipPatients: 0,
      };
    }

    return {
      totalRegisters: labRegisters.length,
      pendingSamples: labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSamplePendingCount, 0),
      collectedSamples: labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSampleCollectedCount, 0),
      completedResults: labRegisters.reduce((sum, reg) => sum + (reg.labRegister.invResultCompletedCount || 0), 0),
      approvedResults: labRegisters.reduce((sum, reg) => sum + (reg.labRegister.invResultApprovedCount || 0), 0),
      totalInvestigations: labRegisters.reduce((sum, reg) => sum + reg.labRegister.investigationCount, 0),
      opPatients: labRegisters.filter((reg) => reg.labRegister.patientStatus === "OP").length,
      ipPatients: labRegisters.filter((reg) => reg.labRegister.patientStatus.startsWith("IP")).length,
    };
  }, [labRegisters]);
};
