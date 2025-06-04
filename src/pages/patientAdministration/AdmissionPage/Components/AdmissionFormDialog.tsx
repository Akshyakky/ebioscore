// src/pages/patientAdministration/AdmissionPage/Components/AdmissionFormDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Typography, Paper, Chip, Avatar, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Person as PatientIcon,
  Hotel as BedIcon,
  People as PeopleIcon,
  AccountBalance as InsuranceIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import BedSelectionDialog from "@/pages/hospitalAdministration/ManageBeds/BedSelection/BedSelectionDialog";
import NokAttendantSelection from "./NokAttendantSelection";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto, IPAdmissionDto, IPAdmissionDetailsDto, WrBedDetailsDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useBedSelection } from "@/pages/hospitalAdministration/ManageBeds/hooks/useBedSelection";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import InsuranceSelectionForAdmission from "./InsuranceSelectionForAdmission";

// Enhanced schema with insurance fields
const admissionSchema = z
  .object({
    pChartID: z.number().min(1, "Patient is required"),
    pChartCode: z.string().min(1, "Patient chart code is required"),
    admitCode: z.string().min(1, "Admission code is required"),
    admitDate: z.date().default(new Date()),
    caseTypeCode: z.string().min(1, "Case type is required"),
    caseTypeName: z.string().default(""),
    admissionType: z.string().min(1, "Admission type is required"),
    rNotes: z.string().min(1, "Reason for admission is required"),
    attendingPhysicianId: z.coerce.number().min(1, "Attending physician is required"),
    attendingPhysicianName: z.string().default(""),
    primaryPhysicianId: z.number().optional(),
    primaryPhysicianName: z.string().optional().default(""),
    primaryReferralSourceId: z.number().optional(),
    primaryReferralSourceName: z.string().optional().default(""),
    deptID: z.number().min(1, "Department is required"),
    deptName: z.string().default(""),
    dulId: z.number().min(1, "Unit is required"),
    unitName: z.string().default(""),
    bedID: z.number().min(1, "Bed assignment is required"),
    bedName: z.string().default(""),
    rlID: z.number().min(1, "Room is required"),
    rName: z.string().default(""),
    wCatID: z.number().optional(),
    wCatName: z.string().optional().default(""),
    pTypeID: z.number().min(1, "PIC is required"),
    pTypeName: z.string().default(""),
    insuranceYN: z.enum(["Y", "N"]).default("N"),
    deliveryCaseYN: z.enum(["Y", "N"]).default("N"),
    provDiagnosisYN: z.enum(["Y", "N"]).default("N"),
    dischargeAdviceYN: z.enum(["Y", "N"]).default("N"),
    nurseIns: z.string().optional().default(""),
    clerkIns: z.string().optional().default(""),
    patientIns: z.string().optional().default(""),
    advisedVisitNo: z.number().default(1),
    visitGesy: z.string().optional().default(""),
    // Patient name fields
    pTitle: z.string().default(""),
    pfName: z.string().default(""),
    plName: z.string().default(""),
    pmName: z.string().default(""),
    // NOK/Attendant fields
    patNokID: z.number().optional().default(0),
    attendantName: z.string().optional().default(""),
    attendantRelation: z.string().optional().default(""),
    attendantPhone: z.string().optional().default(""),
    // Insurance fields
    opipInsID: z.number().optional().default(0),
    selectedInsuranceDetails: z
      .object({
        oPIPInsID: z.number(),
        insurID: z.number(),
        insurName: z.string(),
        policyNumber: z.string(),
        policyHolder: z.string(),
        groupNumber: z.string().optional(),
        relationVal: z.string(),
        relation: z.string().optional(),
        policyStartDt: z.date(),
        policyEndDt: z.date(),
        rActiveYN: z.string(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // If insurance is required and selected, ensure insurance details are provided
      if (data.insuranceYN === "Y" && data.opipInsID === 0) {
        return false;
      }
      return true;
    },
    {
      message: "Insurance selection is required when insurance coverage is enabled",
      path: ["opipInsID"],
    }
  );

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface AdmissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (admission: AdmissionDto) => Promise<void>;
  patient: PatientSearchResult | null;
  existingAdmission?: any;
}

const AdmissionFormDialog: React.FC<AdmissionFormDialogProps> = ({ open, onClose, onSubmit, patient, existingAdmission }) => {
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [bedDataLoaded, setBedDataLoaded] = useState(false);
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<OPIPInsurancesDto | null>(null);
  const [nokAccordionExpanded, setNokAccordionExpanded] = useState(false);
  const [insuranceAccordionExpanded, setInsuranceAccordionExpanded] = useState(false);

  const isEditMode = !!existingAdmission;
  const serverDate = useServerDate();

  // Load dropdown values
  const {
    caseType = [],
    admissionType = [],
    attendingPhy = [],
    primaryIntroducingSource = [],
    department = [],
    unit = [],
    pic = [],
    bedCategory = [],
  } = useDropdownValues(["caseType", "admissionType", "attendingPhy", "primaryIntroducingSource", "department", "unit", "pic", "bedCategory"]);

  // Load bed data
  const {
    beds,
    rooms,
    roomGroups,
    loading: bedLoading,
  } = useBedSelection({
    filters: { availableOnly: !isEditMode },
  });

  // Track when bed data has finished loading
  useEffect(() => {
    if (!bedLoading && beds.length >= 0) {
      setBedDataLoaded(true);
    }
  }, [bedLoading, beds]);

  // Form setup with default values including insurance fields
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    mode: "onChange",
    defaultValues: {
      pChartID: 0,
      pChartCode: "",
      admitCode: "",
      admitDate: serverDate,
      caseTypeCode: "",
      caseTypeName: "",
      admissionType: "",
      rNotes: "",
      attendingPhysicianId: 0,
      attendingPhysicianName: "",
      primaryPhysicianId: 0,
      primaryPhysicianName: "",
      primaryReferralSourceId: 0,
      primaryReferralSourceName: "",
      deptID: 0,
      deptName: "",
      dulId: 0,
      unitName: "",
      bedID: 0,
      bedName: "",
      rlID: 0,
      rName: "",
      wCatID: 0,
      wCatName: "",
      pTypeID: 0,
      pTypeName: "",
      insuranceYN: "N",
      deliveryCaseYN: "N",
      provDiagnosisYN: "N",
      dischargeAdviceYN: "N",
      nurseIns: "",
      clerkIns: "",
      patientIns: "",
      advisedVisitNo: 0,
      visitGesy: "",
      pTitle: "",
      pfName: "",
      plName: "",
      pmName: "",
      patNokID: 0,
      attendantName: "",
      attendantRelation: "",
      attendantPhone: "",
      opipInsID: 0,
      selectedInsuranceDetails: undefined,
    },
  });

  // Watch form values
  const watchedDeptID = watch("deptID");
  const watchedDulId = watch("dulId");
  const watchedBedID = watch("bedID");
  const watchedInsuranceYN = watch("insuranceYN");

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && !isInitialized) {
      initializeForm();
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
      setBedDataLoaded(false);
      setSelectedBed(null);
      setSelectedNok(null);
      setSelectedInsurance(null);
      setPatientData(null);
    }
  }, [open, patient, existingAdmission, isInitialized]);

  // Re-populate bed selection when bed data becomes available in edit mode
  useEffect(() => {
    if (isEditMode && existingAdmission && bedDataLoaded && !selectedBed) {
      populateBedSelection();
    }
  }, [isEditMode, existingAdmission, bedDataLoaded, selectedBed, beds]);

  // Auto-expand insurance accordion when insurance is required
  useEffect(() => {
    if (watchedInsuranceYN === "Y") {
      setInsuranceAccordionExpanded(true);
    }
  }, [watchedInsuranceYN]);

  // Function to handle bed selection population
  const populateBedSelection = useCallback(() => {
    if (!existingAdmission || !bedDataLoaded) return;

    const details = existingAdmission.ipAdmissionDetailsDto;
    if (details?.bedID) {
      const currentBed = beds.find((bed) => bed.bedID === details.bedID);
      if (currentBed) {
        setSelectedBed(currentBed);
      } else {
        // Create placeholder bed for edit mode
        const placeholderBed: WrBedDto = {
          bedID: details.bedID,
          bedName: details.bedName,
          rlID: details.rlID,
          roomList: {
            rlID: details.rlID,
            rName: details.rName,
            roomGroup: existingAdmission.wrBedDetailsDto.rGrpID
              ? {
                  rGrpID: existingAdmission.wrBedDetailsDto.rGrpID,
                  rGrpName: existingAdmission.wrBedDetailsDto.rGrpName || "",
                  deptID: existingAdmission.ipAdmissionDto.deptID,
                  deptName: existingAdmission.ipAdmissionDto.deptName,
                }
              : undefined,
          },
          wbCatID: details.wCatID,
          wbCatName: details.wCatName,
          bedStatus: existingAdmission.wrBedDetailsDto.bedStatusValue || "OCCUP",
          bedAvailable: false,
          rActiveYN: "Y",
          key: details.bedID.toString(),
        } as WrBedDto;

        setSelectedBed(placeholderBed);
      }
    }
  }, [existingAdmission, bedDataLoaded, beds, selectedBed]);

  // Initialize form with either new admission or existing admission data
  const initializeForm = useCallback(async () => {
    if (isEditMode && existingAdmission) {
      await populateFormWithExistingData();
    } else if (patient) {
      await loadPatientDataAndSetupNewAdmission();
    }
  }, [isEditMode, existingAdmission, patient]);

  // Populate form with existing admission data for editing
  const populateFormWithExistingData = useCallback(async () => {
    if (!existingAdmission) return;

    const admission = existingAdmission.ipAdmissionDto;
    const details = existingAdmission.ipAdmissionDetailsDto;
    const bedDetails = existingAdmission.wrBedDetailsDto;

    // Populate form with existing data including insurance fields
    reset({
      pChartID: admission.pChartID,
      pChartCode: admission.pChartCode,
      admitCode: admission.admitCode,
      admitDate: new Date(admission.admitDate),
      caseTypeCode: admission.caseTypeCode,
      caseTypeName: admission.caseTypeName,
      admissionType: details.admissionType || "",
      rNotes: admission.acReason || "",
      attendingPhysicianId: admission.attendingPhysicianId || 0,
      attendingPhysicianName: admission.attendingPhysicianName || "",
      primaryPhysicianId: admission.primaryPhysicianId || 0,
      primaryPhysicianName: admission.primaryPhysicianName || "",
      primaryReferralSourceId: admission.primaryReferralSourceId || 0,
      primaryReferralSourceName: admission.primaryReferralSourceName || "",
      deptID: admission.deptID || 0,
      deptName: admission.deptName,
      dulId: admission.dulId,
      unitName: "",
      bedID: details.bedID,
      bedName: details.bedName,
      rlID: details.rlID,
      rName: details.rName,
      wCatID: details.wCatID || 0,
      wCatName: details.wCatName || "",
      pTypeID: admission.pTypeID,
      pTypeName: admission.pTypeName,
      insuranceYN: admission.insuranceYN,
      deliveryCaseYN: admission.deliveryCaseYN,
      provDiagnosisYN: admission.provDiagnosisYN || "N",
      dischargeAdviceYN: admission.dischargeAdviceYN,
      nurseIns: admission.nurseIns || "",
      clerkIns: admission.clerkIns || "",
      patientIns: admission.patientIns || "",
      advisedVisitNo: admission.advisedVisitNo,
      visitGesy: admission.visitGesy || "",
      pTitle: admission.pTitle,
      pfName: admission.pfName,
      plName: admission.plName,
      pmName: admission.pmName,
      // NOK fields
      patNokID: admission.patNokID || 0,
      attendantName: "",
      attendantRelation: "",
      attendantPhone: "",
      // Insurance fields
      opipInsID: admission.opipInsID || 0,
      selectedInsuranceDetails: undefined,
    });

    // Load patient data for display
    try {
      const statusResult = await extendedAdmissionService.getPatientAdmissionStatus(admission.pChartID);
      if (statusResult.success && statusResult.data?.patientData) {
        setPatientData(statusResult.data.patientData.patRegisters);
      }
    } catch (error) {
      console.error("Error loading patient data in edit mode:", error);
    }
  }, [existingAdmission, reset]);

  // Load patient data and setup new admission
  const loadPatientDataAndSetupNewAdmission = useCallback(async () => {
    if (!patient) return;

    try {
      const statusResult = await extendedAdmissionService.getPatientAdmissionStatus(patient.pChartID);
      if (statusResult.success && statusResult.data?.patientData) {
        const patRegister = statusResult.data.patientData.patRegisters;
        setPatientData(patRegister);

        reset({
          pChartID: patient.pChartID,
          pChartCode: patient.pChartCode,
          admitDate: serverDate,
          pTitle: patRegister.pTitle || "",
          pfName: patRegister.pFName || "",
          plName: patRegister.pLName || "",
          pmName: patRegister.pMName || "",
          caseTypeCode: "",
          caseTypeName: "",
          admissionType: "",
          rNotes: "",
          attendingPhysicianId: 0,
          attendingPhysicianName: "",
          primaryPhysicianId: 0,
          primaryPhysicianName: "",
          primaryReferralSourceId: 0,
          primaryReferralSourceName: "",
          deptID: 0,
          deptName: "",
          dulId: 0,
          unitName: "",
          bedID: 0,
          bedName: "",
          rlID: 0,
          rName: "",
          wCatID: 0,
          wCatName: "",
          pTypeID: 0,
          pTypeName: "",
          insuranceYN: "N",
          deliveryCaseYN: "N",
          provDiagnosisYN: "N",
          dischargeAdviceYN: "N",
          nurseIns: "",
          clerkIns: "",
          patientIns: "",
          advisedVisitNo: 1,
          visitGesy: "",
          patNokID: 0,
          attendantName: "",
          attendantRelation: "",
          attendantPhone: "",
          opipInsID: 0,
          selectedInsuranceDetails: undefined,
        });
        await generateAdmissionCode();
      }
    } catch (error) {
      console.error("Error setting up new admission:", error);
    }
  }, [patient, serverDate, reset]);

  const generateAdmissionCode = useCallback(async () => {
    if (isEditMode) return;

    try {
      setIsGeneratingCode(true);
      const result = await extendedAdmissionService.generateAdmitCode();
      if (result.success && result.data) {
        setValue("admitCode", result.data, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error generating admission code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isEditMode, setValue]);

  // Handle NOK selection
  const handleNokSelect = useCallback(
    (nokDetails: PatNokDetailsDto | null) => {
      setSelectedNok(nokDetails);

      if (nokDetails) {
        const attendantName = `${nokDetails.pNokFName} ${nokDetails.pNokMName || ""} ${nokDetails.pNokLName}`.trim();

        setValue("patNokID", nokDetails.pNokID, { shouldValidate: true });
        setValue("attendantName", attendantName, { shouldValidate: true });
        setValue("attendantRelation", nokDetails.pNokRelName || "", { shouldValidate: true });
        setValue("attendantPhone", nokDetails.pAddPhone1 || "", { shouldValidate: true });
      } else {
        setValue("patNokID", 0, { shouldValidate: true });
        setValue("attendantName", "", { shouldValidate: true });
        setValue("attendantRelation", "", { shouldValidate: true });
        setValue("attendantPhone", "", { shouldValidate: true });
      }
    },
    [setValue]
  );

  // Handle insurance selection
  const handleInsuranceSelect = useCallback(
    (insuranceDetails: OPIPInsurancesDto | null) => {
      setSelectedInsurance(insuranceDetails);

      if (insuranceDetails) {
        setValue("opipInsID", insuranceDetails.oPIPInsID, { shouldValidate: true });
        setValue(
          "selectedInsuranceDetails",
          {
            oPIPInsID: insuranceDetails.oPIPInsID,
            insurID: insuranceDetails.insurID,
            insurName: insuranceDetails.insurName,
            policyNumber: insuranceDetails.policyNumber || "",
            policyHolder: insuranceDetails.policyHolder || "",
            groupNumber: insuranceDetails.groupNumber || "",
            relationVal: insuranceDetails.relationVal,
            relation: insuranceDetails.relation || "",
            policyStartDt: new Date(insuranceDetails.policyStartDt),
            policyEndDt: new Date(insuranceDetails.policyEndDt),
            rActiveYN: insuranceDetails.rActiveYN,
          },
          { shouldValidate: true }
        );
      } else {
        setValue("opipInsID", 0, { shouldValidate: true });
        setValue("selectedInsuranceDetails", undefined, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleBedSelect = useCallback(
    (bed: WrBedDto) => {
      setSelectedBed(bed);
      setValue("bedID", bed.bedID, { shouldValidate: true });
      setValue("bedName", bed.bedName, { shouldValidate: true });
      setValue("rlID", bed.rlID, { shouldValidate: true });
      setValue("rName", bed.roomList?.rName || "", { shouldValidate: true });
      setValue("wCatID", bed.wbCatID || 0, { shouldValidate: true });
      setValue("wCatName", bed.wbCatName || "", { shouldValidate: true });

      if (bed.roomList?.roomGroup) {
        setValue("deptID", bed.roomList.roomGroup.deptID || 0, { shouldValidate: true });
        setValue("deptName", bed.roomList.roomGroup.deptName || "", { shouldValidate: true });
      }

      setIsBedSelectionOpen(false);
    },
    [setValue]
  );

  // Other event handlers (keeping existing implementations)
  const handleCaseTypeChange = useCallback(
    (value: any) => {
      const selectedOption = caseType.find((option) => option.value === value);
      if (selectedOption) {
        setValue("caseTypeCode", selectedOption.value as string, { shouldValidate: true });
        setValue("caseTypeName", selectedOption.label, { shouldValidate: true });
      }
    },
    [caseType, setValue]
  );

  const handleDepartmentChange = useCallback(
    (value: any) => {
      const selectedOption = department.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("deptID", Number(value), { shouldValidate: true });
        setValue("deptName", selectedOption.label, { shouldValidate: true });
        setValue("dulId", 0, { shouldValidate: true });
        setValue("unitName", "", { shouldValidate: true });
      }
    },
    [department, setValue]
  );

  const handleUnitChange = useCallback(
    (value: any) => {
      const selectedOption = unit.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("dulId", Number(value), { shouldValidate: true });
        setValue("unitName", selectedOption.label, { shouldValidate: true });
      }
    },
    [unit, setValue]
  );

  const handleAttendingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("attendingPhysicianId", Number(value.value.split("-")[0]), { shouldValidate: true });
        setValue("attendingPhysicianName", selectedOption.label, { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  const handlePICChange = useCallback(
    (value: any) => {
      const selectedOption = pic.find((option) => Number(option.value) === Number(value.value));
      if (selectedOption) {
        setValue("pTypeID", Number(selectedOption.value), { shouldValidate: true });
        setValue("pTypeName", selectedOption.label, { shouldValidate: true });
      }
    },
    [pic, setValue]
  );

  // Handle insurance toggle
  const handleInsuranceToggle = useCallback(
    (checked: boolean) => {
      setValue("insuranceYN", checked ? "Y" : "N", { shouldValidate: true });
      if (!checked) {
        // Clear insurance selection when disabled
        setSelectedInsurance(null);
        setValue("opipInsID", 0, { shouldValidate: true });
        setValue("selectedInsuranceDetails", undefined, { shouldValidate: true });
        setInsuranceAccordionExpanded(false);
      }
    },
    [setValue]
  );

  // Form submission with insurance data
  const onFormSubmit = async (data: AdmissionFormData) => {
    try {
      const ipAdmissionDto: IPAdmissionDto = {
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        admitCode: data.admitCode,
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        oPIPCaseNo: 0,
        opipNo: 0,
        patOPIP: "I",
        admitDate: data.admitDate,
        admitStatus: "ADMITTED",
        provDiagnosisYN: data.provDiagnosisYN,
        insuranceYN: data.insuranceYN,
        opipInsID: data.opipInsID || 0, // Include selected insurance ID
        ipStatus: "ADMITTED",
        dischargeAdviceYN: data.dischargeAdviceYN,
        nurseIns: data.nurseIns,
        clerkIns: data.clerkIns,
        pTitle: data.pTitle,
        patientIns: data.patientIns,
        acApprovedBy: existingAdmission?.ipAdmissionDto?.acApprovedBy || "",
        acApprovedId: existingAdmission?.ipAdmissionDto?.acApprovedId || 0,
        acReason: data.rNotes,
        caseTypeCode: data.caseTypeCode,
        caseTypeName: data.caseTypeName,
        deliveryCaseYN: data.deliveryCaseYN,
        deptID: data.deptID,
        deptName: data.deptName,
        pChartCompId: existingAdmission?.ipAdmissionDto?.pChartCompId || 0,
        pfName: data.pfName,
        plName: data.plName,
        pmName: data.pmName,
        oldPChartID: existingAdmission?.ipAdmissionDto?.oldPChartID || 0,
        visitGesy: data.visitGesy || "",
        dulId: data.dulId,
        advisedVisitNo: data.advisedVisitNo,
        pTypeID: data.pTypeID,
        pTypeName: data.pTypeName,
        // Include NOK data
        patNokID: data.patNokID || 0,
        attendingPhysicianId: data.attendingPhysicianId,
        attendingPhysicianName: data.attendingPhysicianName,
        primaryPhysicianId: data.primaryPhysicianId,
        primaryPhysicianName: data.primaryPhysicianName,
        primaryReferralSourceId: data.primaryReferralSourceId,
        primaryReferralSourceName: data.primaryReferralSourceName,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };

      const ipAdmissionDetailsDto: IPAdmissionDetailsDto = {
        adID: existingAdmission?.ipAdmissionDetailsDto?.adID || 0,
        pChartID: data.pChartID,
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        wCatID: data.wCatID || 0,
        wCatCode: "",
        wCatName: data.wCatName || "",
        wNameID: 0,
        wNameCode: "",
        wName: "",
        rlID: data.rlID,
        rlCode: "",
        rName: data.rName,
        bedID: data.bedID,
        bedName: data.bedName,
        bStatus: "OCCUPIED",
        transFromDate: data.admitDate,
        transToDate: undefined,
        plannedProc: "",
        admissionType: data.admissionType,
        patientStatus: "ADMITTED",
        advPhyID: data.attendingPhysicianId,
        advPhyName: data.attendingPhysicianName,
        treatPhyID: data.attendingPhysicianId,
        treatPhyName: data.attendingPhysicianName,
        facID: 0,
        facName: "",
        bStatusValue: "OCCUP",
        patientStatusValue: "ADMITTED",
        admitCode: data.admitCode,
        pChartCode: data.pChartCode,
        pChartIDCompID: existingAdmission?.ipAdmissionDetailsDto?.pChartIDCompID || 0,
        roomLocation: data.rName,
        treatingPhySpecialty: "",
        treatingSpecialtyID: 0,
        oldPChartID: existingAdmission?.ipAdmissionDetailsDto?.oldPChartID || 0,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };

      const wrBedDetailsDto: WrBedDetailsDto = {
        bedDetID: existingAdmission?.wrBedDetailsDto?.bedDetID || 0,
        bedID: data.bedID,
        bedName: data.bedName,
        bedStatusValue: "OCCUP",
        bedDeptID: data.deptID,
        rlID: data.rlID,
        rName: data.rName,
        rGrpID: selectedBed?.roomList?.roomGroup?.rGrpID || existingAdmission?.wrBedDetailsDto?.rGrpID || 0,
        rGrpName: selectedBed?.roomList?.roomGroup?.rGrpName || existingAdmission?.wrBedDetailsDto?.rGrpName || "",
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        pTitle: data.pTitle,
        pfName: data.pfName,
        patDeptID: data.deptID,
        adID: existingAdmission?.ipAdmissionDetailsDto?.adID || 0,
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        admitDate: data.admitDate,
        tin: existingAdmission?.wrBedDetailsDto?.tin || data.admitDate,
        tout: undefined,
        dischgID: 0,
        dischgDate: undefined,
        transactionType: isEditMode ? "UPDATE" : "ADMISSION",
        isChildYN: existingAdmission?.wrBedDetailsDto?.isChildYN || "N",
        isBoApplicableYN: existingAdmission?.wrBedDetailsDto?.isBoApplicableYN || "N",
        oldPChartID: existingAdmission?.wrBedDetailsDto?.oldPChartID || 0,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };

      const admissionDto: AdmissionDto = {
        ipAdmissionDto,
        ipAdmissionDetailsDto,
        wrBedDetailsDto,
      };

      await onSubmit(admissionDto);
    } catch (error) {
      console.error("Error submitting admission:", error);
      throw error;
    }
  };

  const handleClear = () => {
    if (isEditMode) {
      populateFormWithExistingData();
      if (bedDataLoaded) {
        populateBedSelection();
      }
    } else {
      reset();
      setSelectedBed(null);
      setSelectedNok(null);
      setSelectedInsurance(null);
      setPatientData(null);
    }
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Admission" : "Admit Patient"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Admitting..."}
        successText={isEditMode ? "Updated!" : "Admitted!"}
      />
    </>
  );

  const patientDisplayName = useMemo(() => {
    if (isEditMode && existingAdmission) {
      const admission = existingAdmission.ipAdmissionDto;
      return [admission.pTitle, admission.pfName, admission.pmName, admission.plName].filter(Boolean).join(" ");
    }

    if (patientData) {
      return [patientData.pTitle, patientData.pFName, patientData.pMName, patientData.pLName].filter(Boolean).join(" ");
    }

    // Fallback to patient prop
    return patient?.fullName || "Patient Information";
  }, [isEditMode, existingAdmission, patientData, patient]);

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={isEditMode ? "Edit Admission" : "New Patient Admission"}
        maxWidth="xl"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={dialogActions}
      >
        <Box sx={{ p: 1.5 }}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={1.5}>
              {/* Patient Information Header */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 1.5, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
                      <PatientIcon fontSize="small" />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {patientDisplayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        UHID: {patient?.pChartCode || existingAdmission?.ipAdmissionDto?.pChartCode}
                        {isEditMode && (
                          <>
                            {" | "} Admission: {existingAdmission?.ipAdmissionDto?.admitCode}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Admission Details - Single Row */}
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="admitCode"
                  control={control}
                  type="text"
                  label="Admission Code"
                  required
                  disabled
                  size="small"
                  helperText={isEditMode ? "Admission code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="admitDate" control={control} type="datetimepicker" label="Admission Date & Time" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="caseTypeCode" control={control} type="select" label="Case Type" required size="small" options={caseType} onChange={handleCaseTypeChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="admissionType" control={control} type="select" label="Admission Type" required size="small" options={admissionType} />
              </Grid>

              {/* Payment and Reason - Single Row */}
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="pTypeID" control={control} type="select" label="Payment Source" required size="small" options={pic} onChange={handlePICChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <EnhancedFormField
                  name="rNotes"
                  control={control}
                  type="textarea"
                  label="Reason for Admission"
                  required
                  size="small"
                  rows={2}
                  placeholder="Describe the reason for admission..."
                />
              </Grid>

              {/* Department and Medical Team - Two Rows Compact */}
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="deptID" control={control} type="select" label="Department" required size="small" options={department} onChange={handleDepartmentChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="dulId"
                  control={control}
                  type="select"
                  label="Unit"
                  required
                  size="small"
                  options={unit}
                  onChange={handleUnitChange}
                  disabled={!watchedDeptID}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="attendingPhysicianName"
                  control={control}
                  type="select"
                  label="Attending Physician"
                  required
                  size="small"
                  options={attendingPhy}
                  onChange={handleAttendingPhysicianChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="primaryReferralSourceId" control={control} type="select" label="Referral Source" size="small" options={primaryIntroducingSource} />
              </Grid>

              {/* Bed Assignment */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 1.5, backgroundColor: "grey.50", borderRadius: 1, border: "1px solid", borderColor: "grey.300" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BedIcon fontSize="small" />
                      Bed Assignment
                    </Typography>
                    <CustomButton variant="outlined" text="Select Bed" size="small" onClick={() => setIsBedSelectionOpen(true)} disabled={isSubmitting} />
                  </Box>
                  {selectedBed ? (
                    <Chip
                      icon={<BedIcon />}
                      label={`${selectedBed.bedName} (${selectedBed.roomList?.rName || "Unknown Room"})`}
                      color="primary"
                      size="small"
                      onDelete={() => {
                        setSelectedBed(null);
                        setValue("bedID", 0);
                        setValue("bedName", "");
                        setValue("rlID", 0);
                        setValue("rName", "");
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {bedLoading ? "Loading bed data..." : "No bed selected"}
                    </Typography>
                  )}
                  {errors.bedID && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block" }}>
                      {errors.bedID.message}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Additional Options - Single Row */}
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="deliveryCaseYN" control={control} type="switch" label="Delivery Case" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="provDiagnosisYN" control={control} type="switch" label="Provisional Diagnosis" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="dischargeAdviceYN" control={control} type="switch" label="Discharge Advice" size="small" />
              </Grid>

              {/* Instructions - Single Row */}
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="nurseIns" control={control} type="textarea" label="Nurse Instructions" size="small" rows={2} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="clerkIns" control={control} type="textarea" label="Clerk Instructions" size="small" rows={2} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="patientIns" control={control} type="textarea" label="Patient Instructions" size="small" rows={2} />
              </Grid>
              {/* Patient Attendant/NOK Section */}
              <Grid size={{ xs: 12 }}>
                <Accordion expanded={nokAccordionExpanded} onChange={() => setNokAccordionExpanded(!nokAccordionExpanded)} sx={{ border: "1px solid", borderColor: "grey.300" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" />
                      <Typography variant="subtitle2">Patient Attendant Selection</Typography>
                      {selectedNok && (
                        <Chip size="small" label={`${selectedNok.pNokFName} ${selectedNok.pNokLName} (${selectedNok.pNokRelName})`} color="primary" variant="outlined" />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {patient && (
                      <NokAttendantSelection pChartID={patient.pChartID} patientName={patientDisplayName} selectedNokID={selectedNok?.pNokID} onNokSelect={handleNokSelect} />
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Insurance Section */}
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={insuranceAccordionExpanded}
                  onChange={() => setInsuranceAccordionExpanded(!insuranceAccordionExpanded)}
                  sx={{ border: "1px solid", borderColor: "grey.300" }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InsuranceIcon fontSize="small" />
                      <Typography variant="subtitle2">Insurance Coverage</Typography>
                      {selectedInsurance && <Chip size="small" label={`${selectedInsurance.insurName} - ${selectedInsurance.policyNumber}`} color="success" variant="outlined" />}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <EnhancedFormField name="insuranceYN" control={control} type="switch" label="Patient has insurance coverage" size="small" onChange={handleInsuranceToggle} />
                    </Box>

                    {watchedInsuranceYN === "Y" && patient && (
                      <InsuranceSelectionForAdmission
                        pChartID={patient.pChartID}
                        patientName={patientDisplayName}
                        selectedInsuranceID={selectedInsurance?.oPIPInsID}
                        onInsuranceSelect={handleInsuranceSelect}
                      />
                    )}

                    {errors.opipInsID && (
                      <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                        {errors.opipInsID.message}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </form>
        </Box>
      </GenericDialog>

      {/* Bed Selection Dialog */}
      <BedSelectionDialog
        open={isBedSelectionOpen}
        onClose={() => setIsBedSelectionOpen(false)}
        onSelect={handleBedSelect}
        beds={beds}
        rooms={rooms}
        roomGroups={roomGroups}
        title="Select Bed for Admission"
        filters={{ availableOnly: !isEditMode }}
        allowOccupied={isEditMode}
      />
    </>
  );
};

export default AdmissionFormDialog;
