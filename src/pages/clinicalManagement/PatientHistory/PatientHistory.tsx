// src/pages/clinicalManagement/PatientHistory/PatientHistory.tsx

import { AllergyDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistPMHDto } from "@/interfaces/ClinicalManagement/OPIPHistPMHDto";
import { OPIPHistPSHDto } from "@/interfaces/ClinicalManagement/OPIPHistPSHDto";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { allergyService } from "@/services/ClinicalManagementServices/allergyService";
import { pastMedicationService } from "@/services/ClinicalManagementServices/pastMedicationService";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { TabPanel } from "./TabPanel";
import FamilyHistory from "./FamilyHistory/FamilyHistory";
import SocialHistory from "./PastSocialHistory/SocialHistory";
import MedicalHistory from "./PastMedicalHistory/MedicalHistory";
import PastMedication from "./PastMedicationHistory/PastMedication";
import ReviewOfSystem from "./PastReviewOfSystem/ReviewOfSystem";
import SurgicalHistory from "./PastSurgicalHistory/SurgicalHistory";
import AllergyHistory from "./Allergies/AllergyHistory";
import { useLoading } from "@/hooks/Common/useLoading";

export interface HistoryState {
  familyHistory: OPIPHistFHDto[];
  socialHistory: OPIPHistSHDto[];
  medicalHistory: OPIPHistPMHDto[];
  reviewOfSystem: OPIPHistROSDto[];
  surgicalHistory: OPIPHistPSHDto[];
  pastMedications: PastMedicationDto;
  allergies: AllergyDto;
}
interface PatientHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  shouldClear?: boolean;
  onHistoryChange?: (history: HistoryState) => void;
}
export const PatientHistory: React.FC<PatientHistoryProps> = ({ pChartID, opipNo, opipCaseNo, shouldClear = false, onHistoryChange }) => {
  const [tabValue, setTabValue] = useState(0);
  const [historyState, setHistoryState] = useState<HistoryState>({
    familyHistory: [],
    socialHistory: [],
    medicalHistory: [],
    reviewOfSystem: [],
    surgicalHistory: [],
    pastMedications: {
      opipPastMedID: 0,
      opipNo,
      opvID: 0,
      pChartID,
      opipCaseNo,
      patOpip: "I",
      opipDate: new Date(),
      details: [],
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      oldPChartID: 0,
    },
    allergies: {
      opIPHistAllergyMastDto: {
        opipAlgId: 0,
        opipNo,
        opvID: 0,
        pChartID,
        opipCaseNo,
        patOpip: "I",
        opipDate: new Date(),
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
        oldPChartID: 0,
      },
      allergyDetails: [],
    },
  });
  const getDefaultAllergyState = (pChartID: number, opipNo: number, opipCaseNo: number) => ({
    opIPHistAllergyMastDto: {
      opipAlgId: 0,
      opipNo,
      opvID: 0,
      pChartID,
      opipCaseNo,
      patOpip: "I",
      opipDate: new Date(),
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
      oldPChartID: 0,
    },
    allergyDetails: [],
  });
  const { setLoading } = useLoading();
  const fhService = createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL");
  const shService = createEntityService<OPIPHistSHDto>("OPIPHistSH", "clinicalManagementURL");
  const pmhService = createEntityService<OPIPHistPMHDto>("OPIPHistPMH", "clinicalManagementURL");
  const rosService = createEntityService<OPIPHistROSDto>("OPIPHistROS", "clinicalManagementURL");
  const pshService = createEntityService<OPIPHistPSHDto>("OPIPHistPSH", "clinicalManagementURL");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFamilyHistoryChange = useCallback(
    (newHistory: OPIPHistFHDto[]) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          familyHistory: newHistory.map((item) => ({
            ...item,
            pChartID,
            opipNo,
            opipCaseNo,
          })),
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange, historyState]
  );

  const handleSocialHistoryChange = useCallback(
    (newHistory: OPIPHistSHDto[]) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          socialHistory: newHistory.map((item) => ({
            ...item,
            pChartID,
            opipNo,
            opipCaseNo,
          })),
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  const handleMedicalHistoryChange = useCallback(
    (newHistory: OPIPHistPMHDto[]) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          medicalHistory: newHistory.map((item) => ({
            ...item,
            pChartID,
            opipNo,
            opipCaseNo,
          })),
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  const handleReviewOfSystemChange = useCallback(
    (newHistory: OPIPHistROSDto[]) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          reviewOfSystem: newHistory.map((item) => ({
            ...item,
            pChartID,
            opipNo,
            opipCaseNo,
          })),
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  const handleSurgicalHistoryChange = useCallback(
    (newHistory: OPIPHistPSHDto[]) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          surgicalHistory: newHistory.map((item) => ({
            ...item,
            pChartID,
            opipNo,
            opipCaseNo,
          })),
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  const handlePastMedicationChange = useCallback(
    (newMedication: PastMedicationDto) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          pastMedications: {
            ...newMedication,
            pChartID,
            opipNo,
            opipCaseNo,
          },
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  const handleAllergyChange = useCallback(
    (newAllergy: AllergyDto) => {
      setHistoryState((prev) => {
        const updated = {
          ...prev,
          allergies: {
            opIPHistAllergyMastDto: {
              ...newAllergy.opIPHistAllergyMastDto,
              pChartID,
              opipNo,
              opipCaseNo,
            },
            allergyDetails: newAllergy.allergyDetails,
          },
        };
        onHistoryChange?.(updated);
        return updated;
      });
    },
    [pChartID, opipNo, opipCaseNo, onHistoryChange]
  );

  useEffect(() => {
    if (shouldClear) {
      setHistoryState({
        familyHistory: [],
        socialHistory: [],
        medicalHistory: [],
        reviewOfSystem: [],
        surgicalHistory: [],
        pastMedications: {
          opipPastMedID: 0,
          opipNo,
          opvID: 0,
          pChartID,
          opipCaseNo,
          patOpip: "I",
          opipDate: new Date(),
          details: [],
          rActiveYN: "Y",
          rNotes: "",
          oldPChartID: 0,
          transferYN: "N",
        },
        allergies: {
          opIPHistAllergyMastDto: {
            opipAlgId: 0,
            opipNo,
            opvID: 0,
            pChartID,
            opipCaseNo,
            patOpip: "I",
            opipDate: new Date(),
            rActiveYN: "Y",
            transferYN: "N",
            rNotes: "",
            oldPChartID: 0,
          },
          allergyDetails: [],
        },
      });
      onHistoryChange?.(historyState);
      return;
    }

    const fetchHistoryData = async () => {
      if (!pChartID || !opipNo || !opipCaseNo) return;

      setLoading(true);
      try {
        const query = `pChartID=${pChartID} AND opipNo=${opipNo} AND opipCaseNo=${opipCaseNo}`;
        const [familyResponse, socialResponse, medicalResponse, rosResponse, surgicalResponse, pastMedicationResponse, allergyResponse] = await Promise.all([
          fhService.find(query),
          shService.find(query),
          pmhService.find(query),
          rosService.find(query),
          pshService.find(query),
          pastMedicationService.getByKeyFields(pChartID, opipNo, opipCaseNo),
          allergyService.getByKeyFields(pChartID, opipNo, opipCaseNo),
        ]);

        const defaultAllergyState = getDefaultAllergyState(pChartID, opipNo, opipCaseNo);

        const newHistoryState: HistoryState = {
          familyHistory: familyResponse.success && familyResponse.data ? familyResponse.data : [],
          socialHistory: socialResponse.success && socialResponse.data ? socialResponse.data : [],
          medicalHistory: medicalResponse.success && medicalResponse.data ? medicalResponse.data : [],
          reviewOfSystem: rosResponse.success && rosResponse.data ? rosResponse.data : [],
          surgicalHistory: surgicalResponse.success && surgicalResponse.data ? surgicalResponse.data : [],
          pastMedications: pastMedicationResponse || {
            opipPastMedID: 0,
            opipNo,
            opvID: 0,
            pChartID,
            opipCaseNo,
            patOpip: "I",
            opipDate: new Date(),
            details: [],
            rActiveYN: "Y",
            transferYN: "N",
            rNotes: "",
            oldPChartID: 0,
          },
          allergies: allergyResponse.success && allergyResponse.data ? allergyResponse.data : defaultAllergyState,
        };

        setHistoryState(newHistoryState);
        onHistoryChange?.(newHistoryState);
      } catch (error) {
        console.error("Error fetching history data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [pChartID, opipNo, opipCaseNo, shouldClear, onHistoryChange]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient history tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Family History" />
            <Tab label="Social History" />
            <Tab label="Past Medical History" />
            <Tab label="Past Medications" />
            <Tab label="Review of Systems" />
            <Tab label="Surgical History" />
            <Tab label="Allergy History" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <FamilyHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.familyHistory} onHistoryChange={handleFamilyHistoryChange} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SocialHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.socialHistory} onHistoryChange={handleSocialHistoryChange} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <MedicalHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.medicalHistory} onHistoryChange={handleMedicalHistoryChange} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <PastMedication
            pChartID={pChartID}
            opipNo={opipNo}
            opipCaseNo={opipCaseNo}
            medicationData={historyState.pastMedications}
            onMedicationChange={handlePastMedicationChange}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <ReviewOfSystem pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.reviewOfSystem} onHistoryChange={handleReviewOfSystemChange} />
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <SurgicalHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.surgicalHistory} onHistoryChange={handleSurgicalHistoryChange} />
        </TabPanel>
        <TabPanel value={tabValue} index={6}>
          <AllergyHistory pChartID={pChartID} opipNo={opipNo} opipCaseNo={opipCaseNo} historyList={historyState.allergies} onHistoryChange={handleAllergyChange} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientHistory;
