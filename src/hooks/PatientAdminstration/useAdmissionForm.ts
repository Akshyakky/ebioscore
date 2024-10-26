// src/hooks/useAdmissionForm.ts
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { IcdDetailDto } from "../../interfaces/ClinicalManagement/IcdDetailDto";
import { extendedAdmissionService } from "../../services/PatientAdministrationServices/patientAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";
import { AdmissionDto, IPAdmissionDetailsDto, IPAdmissionDto, WrBedDetailsDto } from "../../interfaces/PatientAdministration/AdmissionDto";
import { useLoading } from "../../context/LoadingContext";
import { store } from "../../store/store";
import { PatientHistory } from "../../pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage";
import { allergyService } from "../../services/ClinicalManagementServices/allergyService";
import { createEntityService } from "../../utils/Common/serviceFactory";
import { OPIPHistFHDto } from "../../interfaces/ClinicalManagement/OPIPHistFHDto";
import { OPIPHistPMHDto } from "../../interfaces/ClinicalManagement/OPIPHistPMHDto";
import { OPIPHistPSHDto } from "../../interfaces/ClinicalManagement/OPIPHistPSHDto";
import { OPIPHistROSDto } from "../../interfaces/ClinicalManagement/OPIPHistROSDto";
import { OPIPHistSHDto } from "../../interfaces/ClinicalManagement/OPIPHistSHDto";
import { PastMedicationDetailDto, PastMedicationDto } from "../../interfaces/ClinicalManagement/PastMedicationDto";
import { AssocDiagnosisDetailDto, DiagnosisDetailDto, DiagnosisDto } from "../../interfaces/ClinicalManagement/DiagnosisDto";
import { diagnosisService } from "../../services/ClinicalManagementServices/diagnosisService";

const getCompanyDetails = () => {
  const { compID, compCode, compName } = store.getState().userDetails;
  return {
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    rActiveYN: "Y",
    transferYN: "N",
  };
};

const initialFormState: AdmissionDto = {
  ipAdmissionDto: {
    admitDate: new Date(),
    admitCode: "",
    admitStatus: "ADMITTED",
    provDiagnosisYN: "N",
    insuranceYN: "N",
    dischargeAdviceYN: "N",
    deliveryCaseYN: "N",
    ...getCompanyDetails(),
  } as IPAdmissionDto,
  ipAdmissionDetailsDto: {
    ...getCompanyDetails(),
    bStatus: "Available",
    bStatusValue: "AVLBL",
    wCatName: "Out Patient",
  } as IPAdmissionDetailsDto,
  wrBedDetailsDto: {
    ...getCompanyDetails(),
  } as WrBedDetailsDto,
};

const useAdmissionForm = () => {
  const [formData, setFormData] = useState<AdmissionDto>(initialFormState);
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState<DiagnosisDetailDto[]>([]);
  const [associatedDiagnoses, setAssociatedDiagnoses] = useState<AssocDiagnosisDetailDto[]>([]);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const [shouldClearPatientHistory, setShouldClearPatientHistory] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const insurancePageRef = useRef<any>(null);
  const { setLoading } = useLoading();
  const [patientHistory, setPatientHistory] = useState<PatientHistory>({});
  const fhService = useMemo(() => createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL"), []);
  const pmhService = useMemo(() => createEntityService<OPIPHistPMHDto>("OPIPHistPMH", "clinicalManagementURL"), []);
  const pshService = useMemo(() => createEntityService<OPIPHistPSHDto>("OPIPHistPSH", "clinicalManagementURL"), []);
  const rosService = useMemo(() => createEntityService<OPIPHistROSDto>("OPIPHistROS", "clinicalManagementURL"), []);
  const shService = useMemo(() => createEntityService<OPIPHistSHDto>("OPIPHistSH", "clinicalManagementURL"), []);
  const pastMedicationService = useMemo(() => createEntityService<PastMedicationDto>("OPIPHistMedication", "clinicalManagementURL"), []);

  const fetchAdmitCode = useCallback(async () => {
    try {
      const admitCodeResponse = await extendedAdmissionService.generateAdmitCode();
      if (admitCodeResponse.success && admitCodeResponse.data) {
        setFormData((prev) => ({
          ...prev,
          ipAdmissionDto: {
            ...prev.ipAdmissionDto,
            admitCode: admitCodeResponse.data,
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
    const companyDetails = getCompanyDetails();
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
    setPatientHistory({});
    setIsValidated(false);
    if (insurancePageRef.current && insurancePageRef.current.handleClear) {
      insurancePageRef.current.handleClear();
    }
    fetchAdmitCode();
  }, [fetchAdmitCode]);

  const savePatientHistory = async (admissionData: any) => {
    try {
      const { pChartID, opipNo, opipCaseNo } = admissionData;
      const historyPromises = [];

      if (patientHistory.familyHistory) {
        const fhData = {
          ...patientHistory.familyHistory,
          pChartID,
          opipNo,
          opipCaseNo,
          patOpip: "I",
          rActiveYN: "Y",
          opvID: 0,
        };
        historyPromises.push(fhService.save(fhData));
      }

      if (patientHistory.pastMedicalHistory) {
        const pmhData = {
          ...patientHistory.pastMedicalHistory,
          pChartID,
          opipNo,
          opipCaseNo,
          patOpip: "I",
          rActiveYN: "Y",
          opvID: 0,
        };
        historyPromises.push(pmhService.save(pmhData));
      }

      if (patientHistory.pastSurgicalHistory) {
        const pshData = {
          ...patientHistory.pastSurgicalHistory,
          pChartID,
          opipNo,
          opipCaseNo,
          patOpip: "I",
          rActiveYN: "Y",
          opvID: 0,
        };
        historyPromises.push(pshService.save(pshData));
      }

      if (patientHistory.reviewOfSystem) {
        const rosData = {
          ...patientHistory.reviewOfSystem,
          pChartID,
          opipNo,
          opipCaseNo,
          patOpip: "I",
          rActiveYN: "Y",
          opvID: 0,
        };
        historyPromises.push(rosService.save(rosData));
      }

      if (patientHistory.socialHistory) {
        const shData = {
          ...patientHistory.socialHistory,
          pChartID,
          opipNo,
          opipCaseNo,
          patOpip: "I",
          rActiveYN: "Y",
          opvID: 0,
        };
        historyPromises.push(shService.save(shData));
      }

      if (patientHistory.allergies?.length) {
        const allergyData = {
          pchartId: pChartID,
          opipNo,
          opipCaseNo,
          allergyDetails: patientHistory.allergies,
          rActiveYN: "Y",
        };
        historyPromises.push(allergyService.save(allergyData));
      }

      if (patientHistory.pastMedication?.length) {
        const medicationData: PastMedicationDto = {
          opipPastMedID: 0,
          opipNo: opipNo,
          pChartID: pChartID,
          opvID: 0,
          opipCaseNo: opipCaseNo,
          patOpip: "I",
          opipDate: new Date(),
          details: patientHistory.pastMedication.map(
            (med: any): PastMedicationDetailDto => ({
              opipPastMedDtlID: 0,
              opipPastMedID: 0,
              mfID: med.mfID || 0,
              mfName: med.mfName || "",
              mGenID: med.mGenID || 0,
              mGenCode: med.mGenCode || "",
              mGenName: med.mGenName || "",
              mlID: med.mlID || 0,
              medText: med.medText || "",
              mdID: med.mdID || 0,
              mdName: med.mdName || "",
              mFrqID: med.mFrqID || 0,
              mFrqName: med.mFrqName || "",
              mInsID: med.mInsID || 0,
              mInsName: med.mInsName || "",
              fromDate: med.fromDate || new Date(),
              toDate: med.toDate || new Date(),
              rActiveYN: "Y",
              compID: formData.ipAdmissionDto.compID,
              compCode: formData.ipAdmissionDto.compCode,
              compName: formData.ipAdmissionDto.compName,
              transferYN: "N",
              rNotes: med.rNotes || "",
            })
          ),
          rActiveYN: "Y",
          compID: formData.ipAdmissionDto.compID,
          compCode: formData.ipAdmissionDto.compCode,
          compName: formData.ipAdmissionDto.compName,
          transferYN: "N",
          rNotes: "",
        };
        historyPromises.push(pastMedicationService.save(medicationData));
      }

      await Promise.all(historyPromises);
      return true;
    } catch (error) {
      console.error("Error saving patient history:", error);
      throw error;
    }
  };

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) return false;

    try {
      setLoading(true);

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
      await savePatientHistory({
        pChartID: admissionResult.data?.ipAdmissionDto.pChartID,
        opipNo: admissionResult.data?.ipAdmissionDto.opipNo,
        opipCaseNo: admissionResult.data?.ipAdmissionDto.oPIPCaseNo,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert("Error", errorMessage, "error");
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, primaryDiagnoses, associatedDiagnoses, validateForm, handleClear]);

  const updatePatientHistory = useCallback((historyData: any) => {
    setPatientHistory((prev) => ({
      ...prev,
      [historyData.type]: historyData.data,
    }));
  }, []);

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
          console.log(formData);
        }
      } catch (error) {
        console.error("Error fetching patient status:", error);
        showAlert("Error", "Failed to fetch patient status", "error");
      } finally {
        setLoading(false);
      }
    },
    [setPrimaryDiagnoses, setAssociatedDiagnoses]
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
    handleDropdownChange,
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
    patientHistory,
    updatePatientHistory,
  };
};

export default useAdmissionForm;
