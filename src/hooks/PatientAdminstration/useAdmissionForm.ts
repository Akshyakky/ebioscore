// src/hooks/useAdmissionForm.ts
import { useState, useCallback, useRef, useEffect, useMemo } from "react";

import { AdmissionDto, IPAdmissionDetailsDto, IPAdmissionDto, WrBedDetailsDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AssocDiagnosisDetailDto, DiagnosisDetailDto, DiagnosisDto } from "@/interfaces/ClinicalManagement/DiagnosisDto";
import { useCompanyDetails } from "../Common/useCompanyDetails";
import { PatientHistory } from "@/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage";
import { useLoading } from "@/context/LoadingContext";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistPMHDto } from "@/interfaces/ClinicalManagement/OPIPHistPMHDto";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { OPIPHistPSHDto } from "@/interfaces/ClinicalManagement/OPIPHistPSHDto";
import { pastMedicationService } from "@/services/ClinicalManagementServices/pastMedicationService";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import { showAlert } from "@/utils/Common/showAlert";
import { diagnosisService } from "@/services/ClinicalManagementServices/diagnosisService";
import { allergyService } from "@/services/ClinicalManagementServices/allergyService";
import { HistoryState } from "@/pages/clinicalManagement/PatientHistory/PatientHistory";

interface UseAdmissionFormReturn {
  formData: AdmissionDto;
  setFormData: React.Dispatch<React.SetStateAction<AdmissionDto>>;
  primaryDiagnoses: DiagnosisDetailDto[];
  setPrimaryDiagnoses: React.Dispatch<React.SetStateAction<DiagnosisDetailDto[]>>;
  associatedDiagnoses: AssocDiagnosisDetailDto[];
  setAssociatedDiagnoses: React.Dispatch<React.SetStateAction<AssocDiagnosisDetailDto[]>>;
  handleChange: (field: keyof AdmissionDto, value: any) => void;
  handleClear: () => void;
  handleSave: () => Promise<boolean>;
  handlePatientSelect: (pChartID: number | null) => Promise<void>;
  handleBedSelect: (bed: any) => void;
  shouldClearInsuranceData: boolean;
  setShouldClearInsuranceData: React.Dispatch<React.SetStateAction<boolean>>;
  shouldClearPatientHistory: boolean;
  setShouldClearPatientHistory: React.Dispatch<React.SetStateAction<boolean>>;
  insurancePageRef: React.RefObject<any>;
  isValidated: boolean;
  // patientHistory: PatientHistory;
  updatePatientHistory: (historyData: any) => void;
}

// const getCompanyDetails = () => {
//   const { compID, compCode, compName } = useAppSelector((state: RootState) => state.auth);
//   return {
//     compID: compID || 0,
//     compCode: compCode || "",
//     compName: compName || "",
//     rActiveYN: "Y",
//     transferYN: "N",
//   };
// };

const initialFormState: AdmissionDto = {
  ipAdmissionDto: {
    admitDate: new Date(),
    admitCode: "",
    admitStatus: "ADMITTED",
    provDiagnosisYN: "N",
    insuranceYN: "N",
    dischargeAdviceYN: "N",
    deliveryCaseYN: "N",
    ...useCompanyDetails,
  } as IPAdmissionDto,
  ipAdmissionDetailsDto: {
    ...useCompanyDetails,
    bStatus: "Available",
    bStatusValue: "AVLBL",
    wCatName: "Out Patient",
  } as IPAdmissionDetailsDto,
  wrBedDetailsDto: {
    ...useCompanyDetails,
  } as WrBedDetailsDto,
};

const useAdmissionForm = (): UseAdmissionFormReturn => {
  const companyDetails = useCompanyDetails();
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const [formData, setFormData] = useState<AdmissionDto>(initialFormState);
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState<DiagnosisDetailDto[]>([]);
  const [associatedDiagnoses, setAssociatedDiagnoses] = useState<AssocDiagnosisDetailDto[]>([]);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const [shouldClearPatientHistory, setShouldClearPatientHistory] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [patientHistory, setPatientHistory] = useState<PatientHistory>({
    familyHistory: [],
    socialHistory: [],
    medicalHistory: [],
    reviewOfSystem: [],
    surgicalHistory: [],
    pastMedications: {
      opipPastMedID: 0,
      opipNo: formData.ipAdmissionDto.opipNo || 0,
      opvID: 0,
      pChartID: formData.ipAdmissionDto.pChartID || 0,
      opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
      patOpip: "I",
      opipDate: new Date(),
      details: [],
      rActiveYN: "Y",
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      transferYN: "N",
      rNotes: "",
      oldPChartID: 0,
    },
    allergies: {
      opIPHistAllergyMastDto: {
        opipAlgId: 0,
        opipNo: formData.ipAdmissionDto.opipNo || 0,
        opvID: 0,
        pChartID: formData.ipAdmissionDto.pChartID || 0,
        opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
        patOpip: "I",
        opipDate: new Date(),
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "N",
        rNotes: "",
        oldPChartID: 0,
      },
      allergyDetails: [],
    },
  });
  const insurancePageRef = useRef<any>(null);
  const { setLoading } = useLoading();

  const fhService = useMemo(() => createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL"), []);
  const pmhService = useMemo(() => createEntityService<OPIPHistPMHDto>("OPIPHistPMH", "clinicalManagementURL"), []);
  const shService = useMemo(() => createEntityService<OPIPHistSHDto>("OPIPHistSH", "clinicalManagementURL"), []);
  const rosService = useMemo(() => createEntityService<OPIPHistROSDto>("OPIPHistROS", "clinicalManagementURL"), []);
  const pshService = useMemo(() => createEntityService<OPIPHistPSHDto>("OPIPHistPSH", "clinicalManagementURL"), []);
  const pastMedService = useMemo(() => pastMedicationService, []);

  const fetchAdmitCode = useCallback(async () => {
    try {
      const admitCodeResponse = await extendedAdmissionService.generateAdmitCode();
      if (admitCodeResponse.success && admitCodeResponse.data) {
        setFormData((prev) => ({
          ...prev,
          ipAdmissionDto: {
            ...prev.ipAdmissionDto,
            admitCode: admitCodeResponse.data || "",
          },
        }));
      } else {
        console.error("Failed to generate admit code:", admitCodeResponse.errorMessage);
      }
    } catch (error) {
      console.error("Error fetching admit code:", error);
    }
  }, []);

  useEffect(() => {
    fetchAdmitCode();
  }, [fetchAdmitCode]);

  const validateForm = useCallback((): boolean => {
    const { ipAdmissionDto, ipAdmissionDetailsDto, wrBedDetailsDto } = formData;
    const errors: string[] = [];

    if (!ipAdmissionDto.pChartID) errors.push("Patient must be selected");
    if (!ipAdmissionDto.attendingPhysicianId) errors.push("Attending physician is required");
    if (!wrBedDetailsDto.bedID) errors.push("Bed must be selected");
    if (!ipAdmissionDto.deptID) errors.push("Department is required");

    if (errors.length > 0) {
      showAlert("Validation Error", errors.join("\n"), "error");
      return false;
    }

    setIsValidated(true);
    return true;
  }, [formData]);

  const handleChange = useCallback((field: keyof AdmissionDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDropdownChange = useCallback((fields: (keyof AdmissionDto)[], values: any[], options: any[]) => {
    setFormData((prev) => {
      const newData = { ...prev };
      fields.forEach((field, index) => {
        newData[field] = values[index];
      });
      return newData;
    });
  }, []);

  const handleClear = useCallback(() => {
    const companyDetails = useCompanyDetails();
    setFormData((prev) => ({
      ipAdmissionDto: {
        ...initialFormState.ipAdmissionDto,
        ...companyDetails,
        admitDate: new Date(),
        admitCode: prev.ipAdmissionDto.admitCode,
      },
      ipAdmissionDetailsDto: {
        ...initialFormState.ipAdmissionDetailsDto,
        ...companyDetails,
      },
      wrBedDetailsDto: {
        ...initialFormState.wrBedDetailsDto,
        ...companyDetails,
      },
    }));
    setPrimaryDiagnoses([]);
    setAssociatedDiagnoses([]);
    setShouldClearInsuranceData(true);
    setShouldClearPatientHistory(true);
    setPatientHistory({
      familyHistory: [],
      socialHistory: [],
      medicalHistory: [],
      reviewOfSystem: [],
      surgicalHistory: [],
      pastMedications: {
        opipPastMedID: 0,
        opipNo: 0,
        opvID: 0,
        pChartID: 0,
        opipCaseNo: 0,
        patOpip: "I",
        opipDate: new Date(),
        details: [],
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "N",
        rNotes: "",
        oldPChartID: 0,
      },
      allergies: {
        opIPHistAllergyMastDto: {
          opipAlgId: 0,
          opipNo: 0,
          opvID: 0,
          pChartID: 0,
          opipCaseNo: 0,
          patOpip: "I",
          opipDate: new Date(),
          rActiveYN: "Y",
          compID: compID ?? 0,
          compCode: compCode ?? "",
          compName: compName ?? "",
          transferYN: "N",
          rNotes: "",
          oldPChartID: 0,
        },
        allergyDetails: [],
      },
    });

    setIsValidated(false);
    if (insurancePageRef.current && insurancePageRef.current.handleClear) {
      insurancePageRef.current.handleClear();
    }
    fetchAdmitCode();
  }, [compID, compCode, compName, fetchAdmitCode]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) return false;

    try {
      setLoading(true);
      formData.ipAdmissionDto.compCode = "KVG";
      formData.ipAdmissionDetailsDto.compCode = "KVG";
      formData.wrBedDetailsDto.compCode = "KVG";
      formData.ipAdmissionDto.compName = "KVG Medical College";
      formData.ipAdmissionDetailsDto.compName = "KVG Medical College";
      formData.wrBedDetailsDto.compName = "KVG Medical College";
      // Save admission first
      const admissionResult = await extendedAdmissionService.admitPatient(formData);
      if (!admissionResult.success) {
        throw new Error(admissionResult.errorMessage || "Failed to admit patient");
      }

      const admissionData = admissionResult.data;

      // Then save diagnosis if there are any diagnoses
      if (primaryDiagnoses.length > 0 || associatedDiagnoses.length > 0) {
        // Check if diagnosis already exists
        // const existingDiagnosis = await diagnosisService.checkExistingDiagnosis(
        //   admissionData.ipAdmissionDto.pChartID,
        //   admissionData.ipAdmissionDto.opipNo,
        //   admissionData.ipAdmissionDto.oPIPCaseNo
        // );

        const diagnosisDto: DiagnosisDto = {
          opipDiagId: 0, // existingDiagnosis.data?.opipDiagId || 0,
          opipNo: admissionData?.ipAdmissionDto.opipNo ?? 0,
          opvId: 0,
          pChartId: admissionData?.ipAdmissionDto.pChartID ?? 0,
          opipCaseNo: admissionData?.ipAdmissionDto.oPIPCaseNo ?? 0,
          patOpipYN: "I",
          diaDate: new Date(),
          primaryDiagnoses: primaryDiagnoses.map((diag) => ({
            opipDiagDtlId: 0,
            opipDiagId: 0, //existingDiagnosis.data?.opipDiagId || 0,
            icddId: diag.icddId,
            icddCode: diag.icddCode,
            icddName: diag.icddName,
            diagRemarks: diag.diagRemarks,
            lcddmgId: diag.lcddmgId,
            lcddmgName: diag.lcddmgName,
            lcddsgId: diag.lcddsgId,
            lcddsgName: diag.lcddsgName,
            rActiveYN: "Y",
            compID: formData.ipAdmissionDto.compID,
            compCode: formData.ipAdmissionDto.compCode,
            compName: formData.ipAdmissionDto.compName,
            transferYN: "N",
            rNotes: "",
          })),
          associatedDiagnoses: associatedDiagnoses.map((diag) => ({
            opipAssocDiagDtlId: 0,
            opipDiagDtlId: 0,
            opipDiagId: 0, //existingDiagnosis.data?.opipDiagId || 0,
            icddId: diag.icddId,
            icddCode: diag.icddCode,
            icddName: diag.icddName,
            diagRemarks: diag.diagRemarks,
            lcddmgId: diag.lcddmgId,
            lcddmgName: diag.lcddmgName,
            lcddsgId: diag.lcddsgId,
            lcddsgName: diag.lcddsgName,
            rActiveYN: "Y",
            compID: formData.ipAdmissionDto.compID,
            compCode: formData.ipAdmissionDto.compCode,
            compName: formData.ipAdmissionDto.compName,
            transferYN: "N",
            rNotes: "",
          })),
          rActiveYN: "Y",
          compID: formData.ipAdmissionDto.compID,
          compCode: formData.ipAdmissionDto.compCode,
          compName: formData.ipAdmissionDto.compName,
          transferYN: "N",
          rNotes: "",
        };

        const diagnosisResult = await diagnosisService.saveWithDetails(diagnosisDto);
        if (!diagnosisResult.success) {
          throw new Error(diagnosisResult.errorMessage || "Failed to save diagnosis");
        }
      }

      // Save insurance details using ref pattern
      if (insurancePageRef.current) {
        try {
          await insurancePageRef.current.saveInsuranceDetails(admissionData?.ipAdmissionDto.pChartID);
        } catch (error) {
          console.error("Error saving insurance details:", error);
        }
      }

      // After successful admission, save patient history using the returned OPIP numbers
      if (patientHistory) {
        const opipNo = admissionData?.ipAdmissionDto.opipNo ?? 0;
        const opipCaseNo = admissionData?.ipAdmissionDto.oPIPCaseNo ?? 0;
        const pChartID = admissionData?.ipAdmissionDto.pChartID ?? 0;

        if (patientHistory.familyHistory?.length > 0) {
          const familyHistoryData = patientHistory.familyHistory.map((item: any) => ({
            ...item,
            opipNo,
            opipCaseNo,
            pChartID,
          }));
          await fhService.bulkSave(familyHistoryData);
        }

        if (patientHistory.socialHistory?.length > 0) {
          const socialHistoryData = patientHistory.socialHistory.map((item: any) => ({
            ...item,
            opipNo,
            opipCaseNo,
            pChartID,
            patOpip: "I",
            rActiveYN: "Y",
          }));
          await shService.bulkSave(socialHistoryData);
        }

        if (patientHistory.medicalHistory?.length > 0) {
          const medicalHistoryData = patientHistory.medicalHistory.map((item: any) => ({
            ...item,
            opipNo,
            opipCaseNo,
            pChartID,
            patOpip: "I",
            rActiveYN: "Y",
          }));
          await pmhService.bulkSave(medicalHistoryData);
        }
        if (patientHistory.reviewOfSystem?.length > 0) {
          const rosData = patientHistory.reviewOfSystem.map((item: any) => ({
            ...item,
            opipNo,
            opipCaseNo,
            pChartID,
            patOpip: "I",
            rActiveYN: "Y",
          }));
          await rosService.bulkSave(rosData);
        }
        if (patientHistory.surgicalHistory?.length > 0) {
          const surgicalData = patientHistory.surgicalHistory.map((item: any) => ({
            ...item,
            opipNo,
            opipCaseNo,
            pChartID,
            patOpip: "I",
            rActiveYN: "Y",
          }));
          await pshService.bulkSave(surgicalData);
        }
        if (patientHistory.pastMedications?.details.length > 0) {
          const medicationData = {
            ...patientHistory.pastMedications,
            opipNo,
            opipCaseNo,
            pChartID,
            patOpip: "I",
            rActiveYN: "Y",
          };
          await pastMedService.createOrUpdatePastMedication(medicationData);
        }
        if (patientHistory.allergies?.allergyDetails.length > 0) {
          const allergyData = {
            opIPHistAllergyMastDto: {
              ...patientHistory.allergies.opIPHistAllergyMastDto,
              opipNo: admissionData?.ipAdmissionDto.opipNo,
              pChartID: admissionData?.ipAdmissionDto.pChartID,
              opipCaseNo: admissionData?.ipAdmissionDto.oPIPCaseNo,
            },
            allergyDetails: patientHistory.allergies.allergyDetails,
          };
          await allergyService.createOrUpdateAllergy(allergyData);
        }
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert("Error", errorMessage, "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, primaryDiagnoses, associatedDiagnoses, patientHistory, validateForm, fhService, shService, pmhService, rosService, pshService, pastMedService, allergyService]);

  const updatePatientHistory = useCallback(
    (historyData: HistoryState) => {
      if (!historyData) return;

      // Create a new object with validated arrays
      const validatedHistory: HistoryState = {
        familyHistory: historyData.familyHistory.map((item) => ({
          ...item,
          pChartID: formData.ipAdmissionDto.pChartID,
          opipNo: formData.ipAdmissionDto.opipNo || 0,
          opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
        })),
        socialHistory: historyData.socialHistory.map((item) => ({
          ...item,
          pChartID: formData.ipAdmissionDto.pChartID,
          opipNo: formData.ipAdmissionDto.opipNo || 0,
          opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
        })),
        medicalHistory: historyData.medicalHistory.map((item) => ({
          ...item,
          pChartID: formData.ipAdmissionDto.pChartID,
          opipNo: formData.ipAdmissionDto.opipNo || 0,
          opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
        })),
        reviewOfSystem:
          historyData.reviewOfSystem?.map((item) => ({
            ...item,
            pChartID: formData.ipAdmissionDto.pChartID,
            opipNo: formData.ipAdmissionDto.opipNo || 0,
            opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
          })) || [],
        surgicalHistory:
          historyData.surgicalHistory?.map((item) => ({
            ...item,
            pChartID: formData.ipAdmissionDto.pChartID,
            opipNo: formData.ipAdmissionDto.opipNo || 0,
            opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
          })) || [],
        pastMedications: {
          ...historyData.pastMedications,
          pChartID: formData.ipAdmissionDto.pChartID,
          opipNo: formData.ipAdmissionDto.opipNo || 0,
          opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: "I",
          rActiveYN: "Y",
        },
        allergies: {
          opIPHistAllergyMastDto: {
            ...historyData.allergies.opIPHistAllergyMastDto,
            pChartID: formData.ipAdmissionDto.pChartID,
            opipNo: formData.ipAdmissionDto.opipNo || 0,
            opipCaseNo: formData.ipAdmissionDto.oPIPCaseNo || 0,
          },
          allergyDetails: historyData.allergies.allergyDetails,
        },
      };
      // Update state with the validated data
      setPatientHistory((prevHistory) => ({
        ...prevHistory,
        ...validatedHistory,
      }));
    },
    [formData.ipAdmissionDto, setPatientHistory]
  );

  const handlePatientSelect = useCallback(
    async (pChartID: number | null) => {
      if (!pChartID) {
        setFormData((prev) => ({
          ...prev,
          ipAdmissionDto: {
            ...prev.ipAdmissionDto,
            pChartID: 0,
            pChartCode: "",
          },
        }));
        setPrimaryDiagnoses([]);
        setAssociatedDiagnoses([]);
        setPatientHistory({
          familyHistory: [],
          socialHistory: [],
          medicalHistory: [],
          reviewOfSystem: [],
          surgicalHistory: [],
          pastMedications: {
            opipPastMedID: 0,
            opipNo: 0,
            opvID: 0,
            pChartID: 0,
            opipCaseNo: 0,
            patOpip: "I",
            opipDate: new Date(),
            details: [],
            rActiveYN: "Y",
            compID: compID ?? 0,
            compCode: compCode ?? "",
            compName: compName ?? "",
            transferYN: "N",
            rNotes: "",
            oldPChartID: 0,
          },
          allergies: {
            opIPHistAllergyMastDto: {
              opipAlgId: 0,
              opipNo: 0,
              opvID: 0,
              pChartID: 0,
              opipCaseNo: 0,
              patOpip: "I",
              opipDate: new Date(),
              rActiveYN: "Y",
              compID: compID ?? 0,
              compCode: compCode ?? "",
              compName: compName ?? "",
              transferYN: "N",
              rNotes: "",
              oldPChartID: 0,
            },
            allergyDetails: [],
          },
        });
        return;
      }

      try {
        setLoading(true);
        const response = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

        if (!response.success) {
          throw new Error(response.errorMessage || "Failed to get patient status");
        }

        const { data } = response;

        if (data?.isAdmitted && data.admissionData) {
          const { ipAdmissionDto } = data.admissionData;
          const diagnosisResponse = await diagnosisService.getDiagnosisByPatient(ipAdmissionDto.pChartID, ipAdmissionDto.opipNo, ipAdmissionDto.oPIPCaseNo);

          if (diagnosisResponse.success && diagnosisResponse.data) {
            setPrimaryDiagnoses(diagnosisResponse.data.primaryDiagnoses || []);
            setAssociatedDiagnoses(diagnosisResponse.data.associatedDiagnoses || []);
          }

          setFormData((prev) => ({
            ...prev,
            ipAdmissionDto: {
              ...prev.ipAdmissionDto,
              ...(data.admissionData?.ipAdmissionDto || {}),
            },
            ipAdmissionDetailsDto: {
              ...prev.ipAdmissionDetailsDto,
              ...(data.admissionData?.ipAdmissionDetailsDto || {}),
            },
            wrBedDetailsDto: {
              ...prev.wrBedDetailsDto,
              ...(data.admissionData?.wrBedDetailsDto || {}),
            },
          }));
          // Fetch patient history data
          const [familyHistoryResponse, socialHistoryResponse, medicalHistoryResponse, rosHistoryResponse, surgicalHistoryResponse, pastMedicationResponse, allergyResponse] =
            await Promise.all([
              fhService.find(`pChartID=${ipAdmissionDto.pChartID} AND opipNo=${ipAdmissionDto.opipNo} AND opipCaseNo=${ipAdmissionDto.oPIPCaseNo}`),
              shService.find(`pChartID=${ipAdmissionDto.pChartID} AND opipNo=${ipAdmissionDto.opipNo} AND opipCaseNo=${ipAdmissionDto.oPIPCaseNo}`),
              pmhService.find(`pChartID=${ipAdmissionDto.pChartID} AND opipNo=${ipAdmissionDto.opipNo} AND opipCaseNo=${ipAdmissionDto.oPIPCaseNo}`),
              rosService.find(`pChartID=${ipAdmissionDto.pChartID} AND opipNo=${ipAdmissionDto.opipNo} AND opipCaseNo=${ipAdmissionDto.oPIPCaseNo}`),
              pshService.find(`pChartID=${ipAdmissionDto.pChartID} AND opipNo=${ipAdmissionDto.opipNo} AND opipCaseNo=${ipAdmissionDto.oPIPCaseNo}`),
              pastMedService.getByKeyFields(ipAdmissionDto.pChartID, ipAdmissionDto.opipNo, ipAdmissionDto.oPIPCaseNo),
              allergyService.getByKeyFields(ipAdmissionDto.pChartID, ipAdmissionDto.opipNo, ipAdmissionDto.oPIPCaseNo),
            ]);

          // Update patient history state
          const newHistoryState = {
            familyHistory: familyHistoryResponse.success ? familyHistoryResponse.data : [],
            socialHistory: socialHistoryResponse.success ? socialHistoryResponse.data : [],
            medicalHistory: medicalHistoryResponse.success ? medicalHistoryResponse.data : [],
            reviewOfSystem: rosHistoryResponse.success ? rosHistoryResponse.data : [],
            surgicalHistory: surgicalHistoryResponse.success ? surgicalHistoryResponse.data : [],
            pastMedications: pastMedicationResponse || {
              opipPastMedID: 0,
              opipNo: ipAdmissionDto.opipNo,
              opvID: 0,
              pChartID: ipAdmissionDto.pChartID,
              opipCaseNo: ipAdmissionDto.oPIPCaseNo,
              patOpip: "I",
              opipDate: new Date(),
              details: [],
              rActiveYN: "Y",
              compID: compID ?? 0,
              compCode: compCode ?? "",
              compName: compName ?? "",
              transferYN: "N",
              rNotes: "",
              oldPChartID: 0,
            },
            allergies: allergyResponse.success ? allergyResponse.data : [],
          };

          setPatientHistory(newHistoryState);
        } else if (data?.patientData && data?.patientData.patRegisters) {
          const { patRegisters, lastVisit } = data.patientData;

          setFormData((prev) => ({
            ...prev,
            ipAdmissionDto: {
              ...prev.ipAdmissionDto,
              // Basic patient identification
              pChartID: patRegisters.pChartID ?? 0,
              pChartCode: patRegisters.pChartCode ?? "",
              pTypeID: patRegisters.pTypeID ?? 0,
              pTypeName: patRegisters.pTypeName ?? "",
              admitID: 0,
              admitCode: prev.ipAdmissionDto.admitCode,
              patOPIP: "I",

              // Physician information - try LastVisit first, fallback to PatRegisters
              attendingPhysicianId: lastVisit?.attendingPhysicianId ?? patRegisters.attendingPhysicianId ?? 0,
              attendingPhysicianName: lastVisit?.attendingPhysicianName ?? patRegisters.attendingPhysicianName ?? "",
              primaryPhysicianId: lastVisit?.primaryPhysicianId ?? patRegisters.primaryPhysicianId ?? 0,
              primaryPhysicianName: lastVisit?.primaryPhysicianName ?? patRegisters.primaryPhysicianName ?? "",
              primaryReferralSourceId: lastVisit?.primaryReferralSourceId ?? patRegisters.primaryReferralSourceId ?? 0,
              primaryReferralSourceName: lastVisit?.primaryReferralSourceName ?? patRegisters.primaryReferralSourceName ?? "",
              primaryPhysicianSpecialtyId: lastVisit?.primaryPhysicianSpecialtyId ?? patRegisters.primaryPhysicianSpecialtyId ?? 0,
              primaryPhysicianSpecialty: lastVisit?.primaryPhysicianSpecialty ?? patRegisters.primaryPhysicianSpecialty ?? "",

              // Department information
              deptID: lastVisit?.deptID ?? patRegisters.deptID ?? 0,
              deptName: lastVisit?.deptName ?? patRegisters.deptName ?? "",

              // Patient personal information
              pTitle: patRegisters.pTitle ?? "",
              pfName: patRegisters.pFName ?? "",
              plName: patRegisters.pLName ?? "",
              pmName: patRegisters.pMName ?? "",

              // Default values for new admission
              ipStatus: "",
              insuranceYN: "N",
              dischargeAdviceYN: "N",
              deliveryCaseYN: "N",
              caseTypeName: "",
              oldPChartID: 0,
              visitGesy: "",
              dulId: 0,
              advisedVisitNo: 0,
              patNokID: 0,
            },
            ipAdmissionDetailsDto: {
              ...prev.ipAdmissionDetailsDto,
              pChartID: patRegisters.pChartID ?? 0,
              pChartCode: patRegisters.pChartCode ?? "",
            },
            wrBedDetailsDto: {
              ...prev.wrBedDetailsDto,
              pChartID: patRegisters.pChartID ?? 0,
              pChartCode: patRegisters.pChartCode ?? "",
              pTitle: patRegisters.pTitle ?? "",
              pfName: patRegisters.pFName ?? "",
            },
          }));
          setPatientHistory({
            familyHistory: [],
            socialHistory: [],
            medicalHistory: [],
            reviewOfSystem: [],
            surgicalHistory: [],
          });
          console.log(formData);
        }
      } catch (error) {
        console.error("Error fetching patient status:", error);
        showAlert("Error", "Failed to fetch patient status", "error");
      } finally {
        setLoading(false);
      }
    },
    [setPrimaryDiagnoses, setAssociatedDiagnoses, fhService, shService, pmhService, rosService, pshService, pastMedService, compID, compCode, compName]
  );

  const handleBedSelect = useCallback((bed: any) => {
    setFormData((prev) => ({
      ...prev,
      wrBedDetailsDto: {
        ...prev.wrBedDetailsDto,
        bedID: bed.bedID,
        bedName: bed.bedName,
        bedDeptID: bed.bedDeptID || 0,
        rlID: bed.rlID || 0,
        rName: bed.roomList?.rName || "",
        rGrpID: bed.roomList?.roomGroup?.rGrpID || 0,
        rGrpName: bed.roomList?.roomGroup?.rGrpName || "",
        isChildYN: bed.isChildYN || "N",
        isBoApplicableYN: bed.isBoApplicableYN || "N",
      },
      ipAdmissionDetailsDto: {
        ...prev.ipAdmissionDetailsDto,
        bedID: bed.bedID || 0,
        bedName: bed.bedName || "",
        wCatID: bed.wbCatID || 0,
        wCatName: bed.wbCatName || "",
        wCatCode: bed.wbCatCode || "",
        rlID: bed.rlID || 0,
        rlCode: bed.roomList?.rlCode || "",
        rName: bed.roomList?.rName || "",
        roomLocation: bed.roomLocation || "",
      },
    }));
  }, []);

  return {
    formData,
    setFormData,
    primaryDiagnoses,
    setPrimaryDiagnoses,
    associatedDiagnoses,
    setAssociatedDiagnoses,
    handleChange,
    handleClear,
    handleSave,
    handlePatientSelect,
    handleBedSelect,
    shouldClearInsuranceData,
    setShouldClearInsuranceData,
    shouldClearPatientHistory,
    setShouldClearPatientHistory,
    insurancePageRef,
    isValidated,
    updatePatientHistory,
  };
};

export default useAdmissionForm;
