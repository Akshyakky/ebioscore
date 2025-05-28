import React, { useState, useEffect, useCallback, useMemo, useImperativeHandle } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment, Chip, Paper } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Refresh as RefreshIcon, AccountBalance as InsuranceIcon, People as NextOfKinIcon, CheckCircle, Cancel } from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { PatientSearch } from "../../CommonPage/Patient/PatientSearch/PatientSearch";
import { PatientRegistrationDto, PatRegistersDto, PatAddressDto, PatOverviewDto, OpvisitDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";

// Create conditional schema based on form mode
const createSchema = (mode: "create" | "edit" | "view") => {
  const isCreateMode = mode === "create";

  return z.object({
    // Patient Registration Fields
    pChartID: z.number().default(0),
    pChartCode: z.string().min(1, "Patient chart code is required"),
    pRegDate: z.date().default(new Date()),
    pTitleVal: z.string().min(1, "Title is required"),
    pTitle: z.string().default(""),
    pFName: z.string().min(1, "First name is required"),
    pMName: z.string().optional().default(""),
    pLName: z.string().min(1, "Last name is required"),

    // Age/DOB Selection
    pDobOrAgeVal: z.enum(["D", "A"]).default("D"),
    pDob: z.date().optional(),

    pAgeNumber: z.number().min(0).max(150).optional().default(0),
    pAgeDescriptionVal: z.string().optional().default(""),

    pGenderVal: z.string().min(1, "Gender is required"),
    pGender: z.string().default(""),
    pBldGrp: z.string().optional().default(""),
    pFhName: z.string().optional().default(""),
    fatherBldGrp: z.string().optional().default(""),
    pMaritalStatus: z.string().optional().default(""),

    // Patient Type and Membership - Payment Information (Always Required)
    pTypeID: z.number().min(1, "Payment source is required"),
    pTypeCode: z.string().default(""),
    pTypeName: z.string().default(""),
    patMemID: z.number().optional().default(0),
    patMemName: z.string().optional().default(""),
    patMemDescription: z.string().optional().default(""),
    patMemSchemeExpiryDate: z.date().optional(),

    // Contact Information
    pAddPhone1: z.string().min(1, "Primary phone number is required"),
    pAddPhone2: z.string().optional().default(""),
    pAddPhone3: z.string().optional().default(""),
    pAddEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
    pAddWorkPhone: z.string().optional().default(""),

    // SMS and Email Preferences
    sendSMSYN: z.enum(["Y", "N"]).default("Y"),
    sendEmailYN: z.enum(["Y", "N"]).default("Y"),

    // Address Information
    pAddID: z.number().default(0),
    patDoorNo: z.string().optional().default(""),
    pAddStreet: z.string().optional().default(""),
    pAddStreet1: z.string().optional().default(""),
    patAreaVal: z.string().optional().default(""),
    patArea: z.string().optional().default(""),
    pAddCityVal: z.string().optional().default(""),
    pAddCity: z.string().optional().default(""),
    pAddState: z.string().optional().default(""),
    pAddPostcode: z.string().optional().default(""),
    pAddCountryVal: z.string().optional().default(""),
    pAddCountry: z.string().optional().default(""),

    // Visit Information - Conditional validation based on mode
    visitTypeVal: isCreateMode ? z.string().min(1, "Visit type is required") : z.string().optional().default("N"),
    visitType: z.string().default(""),
    deptID: z.number().optional().default(0),
    deptName: z.string().optional().default(""),
    attndPhyID: z.string().optional().default(""),
    attendingPhysicianName: z.string().optional().default(""),
    primIntroSourceID: z.string().optional().default(""),
    primIntroSourceName: z.string().optional().default(""),

    // Additional Information
    patOverID: z.number().default(0),
    pOccupation: z.string().optional().default(""),
    pEmployer: z.string().optional().default(""),
    pEducation: z.string().optional().default(""),
    pReligion: z.string().optional().default(""),
    ethnicity: z.string().optional().default(""),
    pCountryOfOrigin: z.string().optional().default(""),

    // System Fields
    rActiveYN: z.enum(["Y", "N"]).default("Y"),
    rNotes: z.string().optional().default(""),
    transferYN: z.enum(["Y", "N"]).default("N"),
    cancelYN: z.enum(["Y", "N"]).default("N"),
    patSchemeExpiryDateYN: z.enum(["Y", "N"]).default("N"),
    patSchemeDescriptionYN: z.enum(["Y", "N"]).default("N"),
    patDataFormYN: z.enum(["Y", "N"]).default("N"),

    // Identity Information
    intIdPsprt: z.string().optional().default(""),
    indentityType: z.string().default(""),
    indentityValue: z.string().default(""),
    patientType: z.string().default(""),
  });
};

type PatientFormData = z.infer<ReturnType<typeof createSchema>>;

interface PatientRegistrationFormProps {
  mode?: "create" | "edit" | "view";
  initialData?: PatientRegistrationDto | null;
  onSave?: (data: PatientRegistrationDto) => Promise<boolean>;
  onClose?: () => void;
}

const PatientRegistrationForm = React.forwardRef<any, PatientRegistrationFormProps>(({ mode = "create", initialData = null, onSave, onClose }, ref) => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const serverDate = useServerDate();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [savedPChartID, setSavedPChartID] = useState<number>(0);
  const [patientClearTrigger] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Load dropdown values
  const dropdownValues = useDropdownValues([
    "title",
    "gender",
    "bloodGroup",
    "maritalStatus",
    "nationality",
    "area",
    "city",
    "country",
    "company",
    "department",
    "membershipScheme",
    "pic",
    "ageUnit",
    "state",
    "primaryIntroducingSource",
    "attendingPhy",
  ]);

  // Create schema based on current mode
  const schema = useMemo(() => createSchema(mode), [mode]);

  // Default form values
  const defaultValues: PatientFormData = useMemo(
    () => ({
      pChartID: 0,
      pChartCode: "",
      pRegDate: serverDate,
      pTitleVal: "",
      pTitle: "",
      pFName: "",
      pMName: "",
      pLName: "",
      pDobOrAgeVal: "D",
      pDob: serverDate,
      pAgeNumber: 0,
      pAgeDescriptionVal: "",
      pGenderVal: "",
      pGender: "",
      pBldGrp: "",
      pFhName: "",
      fatherBldGrp: "",
      pMaritalStatus: "",
      pTypeID: 0,
      pTypeCode: "",
      pTypeName: "",
      patMemID: 0,
      patMemName: "",
      patMemDescription: "",
      patMemSchemeExpiryDate: undefined,
      pAddPhone1: "",
      pAddPhone2: "",
      pAddPhone3: "",
      pAddEmail: "",
      pAddWorkPhone: "",
      sendSMSYN: "Y",
      sendEmailYN: "Y",
      patDoorNo: "",
      pAddStreet: "",
      pAddStreet1: "",
      patAreaVal: "",
      patArea: "",
      pAddCityVal: "",
      pAddCity: "",
      pAddState: "",
      pAddPostcode: "",
      pAddCountryVal: "",
      pAddCountry: "",
      visitTypeVal: isCreateMode ? "N" : "N",
      visitType: isCreateMode ? "None" : "None",
      deptID: 0,
      deptName: "",
      attndPhyID: "",
      attendingPhysicianName: "",
      primIntroSourceID: "",
      primIntroSourceName: "",
      pOccupation: "",
      pEmployer: "",
      pEducation: "",
      pReligion: "",
      ethnicity: "",
      pCountryOfOrigin: "",
      rActiveYN: "Y",
      rNotes: "",
      transferYN: "N",
      cancelYN: "N",
      patSchemeExpiryDateYN: "N",
      patSchemeDescriptionYN: "N",
      patDataFormYN: "N",
      intIdPsprt: "",
      indentityType: "",
      indentityValue: "",
      patientType: "",
    }),
    [serverDate, isCreateMode]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<PatientFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedMembership = watch("patMemID");
  const watchedDobOrAge = watch("pDobOrAgeVal");
  const watchedVisitType = watch("visitTypeVal");
  const watchedDob = watch("pDob");
  const watchedAgeNumber = watch("pAgeNumber");
  const watchedAgeUnit = watch("pAgeDescriptionVal");
  const watchedSendSMS = watch("sendSMSYN");
  const watchedSendEmail = watch("sendEmailYN");

  // Age calculation utilities
  const calculateAgeFromDob = useCallback(
    (dob: Date, referenceDate: Date = serverDate) => {
      const diffTime = referenceDate.getTime() - dob.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { ageNumber: 0, ageUnit: "Y" }; // Future date
      }

      const years = Math.floor(diffDays / 365.25);
      const months = Math.floor(diffDays / 30.44);
      const days = diffDays;

      // Determine the most appropriate unit
      if (years >= 2) {
        return { ageNumber: years, ageUnit: "Y" }; // Years
      } else if (months >= 2) {
        return { ageNumber: months, ageUnit: "M" }; // Months
      } else {
        return { ageNumber: days, ageUnit: "D" }; // Days
      }
    },
    [serverDate]
  );

  const calculateDobFromAge = useCallback(
    (ageNumber: number, ageUnit: string, referenceDate: Date = serverDate) => {
      if (!ageNumber || ageNumber <= 0) {
        return referenceDate;
      }

      const dobDate = new Date(referenceDate);

      switch (ageUnit) {
        case "Y": // Years
          dobDate.setFullYear(dobDate.getFullYear() - ageNumber);
          break;
        case "M": // Months
          dobDate.setMonth(dobDate.getMonth() - ageNumber);
          break;
        case "D": // Days
          dobDate.setDate(dobDate.getDate() - ageNumber);
          break;
        default:
          // Default to years if unit is not recognized
          dobDate.setFullYear(dobDate.getFullYear() - ageNumber);
      }

      return dobDate;
    },
    [serverDate]
  );

  // Effect to calculate age when DOB changes
  useEffect(() => {
    if (watchedDobOrAge === "D" && watchedDob && !isCalculating) {
      setIsCalculating(true);
      try {
        const calculatedAge = calculateAgeFromDob(watchedDob);
        setValue("pAgeNumber", calculatedAge.ageNumber, { shouldDirty: false });
        setValue("pAgeDescriptionVal", calculatedAge.ageUnit, { shouldDirty: false });
      } catch (error) {
        console.error("Error calculating age from DOB:", error);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [watchedDob, watchedDobOrAge, isCalculating, calculateAgeFromDob, setValue]);

  // Effect to calculate DOB when age changes
  useEffect(() => {
    if (watchedDobOrAge === "A" && watchedAgeNumber && watchedAgeUnit && !isCalculating) {
      setIsCalculating(true);
      try {
        const calculatedDob = calculateDobFromAge(watchedAgeNumber, watchedAgeUnit);
        setValue("pDob", calculatedDob, { shouldDirty: false });
      } catch (error) {
        console.error("Error calculating DOB from age:", error);
      } finally {
        setIsCalculating(false);
      }
    }
  }, [watchedAgeNumber, watchedAgeUnit, watchedDobOrAge, isCalculating, calculateDobFromAge, setValue]);

  // Transform PatientRegistrationDto to form data
  const transformToFormData = useCallback(
    (dto: PatientRegistrationDto): PatientFormData => {
      return {
        // Patient Registration Fields
        pChartID: dto.patRegisters.pChartID,
        pChartCode: dto.patRegisters.pChartCode,
        pRegDate: new Date(dto.patRegisters.pRegDate),
        pTitleVal: dto.patRegisters.pTitleVal || "",
        pTitle: dto.patRegisters.pTitle || "",
        pFName: dto.patRegisters.pFName || "",
        pMName: dto.patRegisters.pMName || "",
        pLName: dto.patRegisters.pLName || "",
        pDobOrAgeVal: dto.patRegisters.pDobOrAgeVal as "D" | "A",
        pDob: dto.patRegisters.pDob ? new Date(dto.patRegisters.pDob) : serverDate,
        pAgeNumber: dto.patOverview.pAgeNumber || 0,
        pAgeDescriptionVal: dto.patOverview.pAgeDescriptionVal || "",
        pGenderVal: dto.patRegisters.pGenderVal || "",
        pGender: dto.patRegisters.pGender || "",
        pBldGrp: dto.patRegisters.pBldGrp || "",
        pFhName: dto.patRegisters.pFhName || "",
        fatherBldGrp: dto.patRegisters.fatherBldGrp || "",
        pMaritalStatus: dto.patOverview.pMaritalStatus || "",

        // Patient Type and Membership
        pTypeID: dto.patRegisters.pTypeID || 0,
        pTypeCode: dto.patRegisters.pTypeCode || "",
        pTypeName: dto.patRegisters.pTypeName || "",
        patMemID: dto.patRegisters.patMemID || 0,
        patMemName: dto.patRegisters.patMemName || "",
        patMemDescription: dto.patRegisters.patMemDescription || "",
        patMemSchemeExpiryDate: dto.patRegisters.patMemSchemeExpiryDate ? new Date(dto.patRegisters.patMemSchemeExpiryDate) : undefined,

        // Contact Information
        pAddID: dto.patAddress.pAddID,
        pAddPhone1: dto.patAddress.pAddPhone1 || "",
        pAddPhone2: dto.patAddress.pAddPhone2 || "",
        pAddPhone3: dto.patAddress.pAddPhone3 || "",
        pAddEmail: dto.patAddress.pAddEmail || "",
        pAddWorkPhone: dto.patAddress.pAddWorkPhone || "",
        sendSMSYN: dto.patAddress.pAddSMSVal === "Y" ? "Y" : "N",
        sendEmailYN: dto.patAddress.pAddMailVal === "Y" ? "Y" : "N",

        // Address Information
        patDoorNo: dto.patAddress.patDoorNo || "",
        pAddStreet: dto.patAddress.pAddStreet || "",
        pAddStreet1: dto.patAddress.pAddStreet1 || "",
        patAreaVal: dto.patAddress.patAreaVal || "",
        patArea: dto.patAddress.patArea || "",
        pAddCityVal: dto.patAddress.pAddCityVal || "",
        pAddCity: dto.patAddress.pAddCity || "",
        pAddState: dto.patAddress.pAddState || "",
        pAddPostcode: dto.patAddress.pAddPostcode || "",
        pAddCountryVal: dto.patAddress.pAddCountryVal || "",
        pAddCountry: dto.patAddress.pAddCountry || "",

        // Visit Information
        visitTypeVal: dto.opvisits?.visitTypeVal || "N",
        visitType: dto.opvisits?.visitType || "None",
        deptID: dto.patRegisters.deptID || 0,
        deptName: dto.patRegisters.deptName || "",
        attndPhyID: "",
        attendingPhysicianName: "",
        primIntroSourceID: "",
        primIntroSourceName: "",

        // Additional Information
        patOverID: dto.patOverview.patOverID,
        pOccupation: dto.patOverview.pOccupation || "",
        pEmployer: dto.patOverview.pEmployer || "",
        pEducation: dto.patOverview.pEducation || "",
        pReligion: dto.patOverview.pReligion || "",
        ethnicity: dto.patOverview.ethnicity || "",
        pCountryOfOrigin: dto.patOverview.pCountryOfOrigin || "",

        // System Fields
        rActiveYN: (dto.patRegisters.rActiveYN || "Y") as "Y" | "N",
        rNotes: dto.patRegisters.rNotes || "",
        transferYN: (dto.patRegisters.transferYN || "N") as "Y" | "N",
        cancelYN: (dto.patRegisters.cancelYN || "N") as "Y" | "N",
        patSchemeExpiryDateYN: (dto.patRegisters.patSchemeExpiryDateYN || "N") as "Y" | "N",
        patSchemeDescriptionYN: (dto.patRegisters.patSchemeDescriptionYN || "N") as "Y" | "N",
        patDataFormYN: (dto.patRegisters.patDataFormYN || "N") as "Y" | "N",
        intIdPsprt: dto.patRegisters.intIdPsprt || "",
        indentityType: dto.patRegisters.indentityType || "",
        indentityValue: dto.patRegisters.indentityValue || "",
        patientType: dto.patRegisters.patientType || "",
      };
    },
    [serverDate]
  );

  // Transform form data to PatientRegistrationDto
  const transformToDto = useCallback(
    (formData: PatientFormData): PatientRegistrationDto => {
      const patRegisters: PatRegistersDto = {
        pChartID: formData.pChartID,
        pChartCode: formData.pChartCode,
        pRegDate: formData.pRegDate,
        pTitleVal: formData.pTitleVal,
        pTitle: formData.pTitle,
        pFName: formData.pFName,
        pMName: formData.pMName,
        pLName: formData.pLName,
        pDobOrAgeVal: formData.pDobOrAgeVal,
        pDobOrAge: formData.pDobOrAgeVal,
        pDob: formData.pDob || serverDate,
        pGenderVal: formData.pGenderVal,
        pGender: formData.pGender,
        pBldGrp: formData.pBldGrp,
        pTypeID: formData.pTypeID,
        pTypeCode: formData.pTypeCode,
        pTypeName: formData.pTypeName,
        pFhName: formData.pFhName,
        fatherBldGrp: formData.fatherBldGrp,
        patMemID: formData.patMemID,
        patMemName: formData.patMemName,
        patMemDescription: formData.patMemDescription,
        patMemSchemeExpiryDate: formData.patMemSchemeExpiryDate || serverDate,
        patSchemeExpiryDateYN: formData.patSchemeExpiryDateYN,
        patSchemeDescriptionYN: formData.patSchemeDescriptionYN,
        cancelReason: "",
        cancelYN: formData.cancelYN,
        deptID: formData.deptID,
        deptName: formData.deptName,
        facultyID: 0,
        faculty: "",
        langType: "",
        pChartCompID: 0,
        pExpiryDate: undefined,
        regTypeVal: "",
        physicianRoom: "",
        regType: "",
        pPob: "",
        patCompNameVal: "",
        patCompName: "",
        patDataFormYN: formData.patDataFormYN,
        intIdPsprt: formData.intIdPsprt,
        indentityType: formData.indentityType,
        indentityValue: formData.indentityValue,
        patientType: formData.patientType,
        rActiveYN: formData.rActiveYN,
        rNotes: formData.rNotes,
        transferYN: formData.transferYN,
        rCreatedDate: new Date(),
        rModifiedDate: new Date(),
        rCreatedBy: "",
        rModifiedBy: "",
      };

      const patAddress: PatAddressDto = {
        pAddID: formData.pAddID,
        pChartID: formData.pChartID,
        pChartCode: formData.pChartCode,
        pAddType: "HOME",
        pAddMailVal: formData.sendEmailYN,
        pAddMail: formData.sendEmailYN,
        pAddSMSVal: formData.sendSMSYN,
        pAddSMS: formData.sendSMSYN,
        pAddEmail: formData.pAddEmail,
        pAddStreet: formData.pAddStreet,
        pAddStreet1: formData.pAddStreet1,
        pAddCityVal: formData.pAddCityVal,
        pAddCity: formData.pAddCity,
        pAddState: formData.pAddState,
        pAddPostcode: formData.pAddPostcode,
        pAddCountryVal: formData.pAddCountryVal,
        pAddCountry: formData.pAddCountry,
        pAddPhone1: formData.pAddPhone1,
        pAddPhone2: formData.pAddPhone2,
        pAddPhone3: formData.pAddPhone3,
        pAddWorkPhone: formData.pAddWorkPhone,
        pAddActualCountryVal: formData.pAddCountryVal,
        pAddActualCountry: formData.pAddCountry,
        patAreaVal: formData.patAreaVal,
        patArea: formData.patArea,
        patDoorNo: formData.patDoorNo,
      };

      const patOverview: PatOverviewDto = {
        patOverID: formData.patOverID,
        pChartID: formData.pChartID,
        pChartCode: formData.pChartCode,
        pPhoto: "",
        pMaritalStatus: formData.pMaritalStatus,
        pReligion: formData.pReligion,
        pEducation: formData.pEducation,
        pOccupation: formData.pOccupation,
        pEmployer: formData.pEmployer,
        ethnicity: formData.ethnicity,
        pCountryOfOrigin: formData.pCountryOfOrigin,
        pAgeNumber: formData.pAgeNumber,
        pAgeDescriptionVal: formData.pAgeDescriptionVal,
      };

      const opvisits: OpvisitDto = {
        visitTypeVal: formData.visitTypeVal || "N",
        visitType: formData.visitType || "None",
      };

      return {
        patRegisters,
        patAddress,
        patOverview,
        opvisits,
      };
    },
    [serverDate]
  );

  // Initialize form when component mounts or initialData changes
  useEffect(() => {
    if (isCreateMode) {
      generatePatientCode();
    }
  }, [isCreateMode]);

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      const formData = transformToFormData(initialData);
      reset(formData);
      setSavedPChartID(initialData.patRegisters.pChartID);
    } else if (isCreateMode) {
      reset(defaultValues);
      generatePatientCode();
      setSavedPChartID(0);
    }
  }, [initialData, isEditMode, isViewMode, reset, transformToFormData, isCreateMode, defaultValues]);

  // Generate new patient code
  const generatePatientCode = async () => {
    try {
      setIsGeneratingCode(true);
      const latestUHID = await RegistrationService.getLatestUHID("GetLatestUHID");
      if (latestUHID) {
        setValue("pChartCode", latestUHID, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      console.error("Error generating patient code:", error);
      showAlert("Warning", "Failed to generate patient code", "warning");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Dropdown change handlers
  const handleTitleChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.title?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("pTitleVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pTitle", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.title, setValue]
  );

  const handleGenderChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.gender?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("pGenderVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pGender", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.gender, setValue]
  );

  const handleVisitTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValue("visitTypeVal", value, { shouldValidate: true, shouldDirty: true });

      // Clear dependent fields
      setValue("deptID", 0, { shouldDirty: true });
      setValue("deptName", "", { shouldDirty: true });
      setValue("attndPhyID", "", { shouldDirty: true });
      setValue("attendingPhysicianName", "", { shouldDirty: true });

      const labels = { P: "Physician", H: "Hospital", N: "None" };
      setValue("visitType", labels[value as keyof typeof labels] || "", { shouldDirty: true });
    },
    [setValue]
  );

  const handleDepartmentChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.department?.find((option) => Number(option.value) === Number(value));

      if (selectedOption) {
        setValue("deptID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("deptName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.department, setValue]
  );

  const handleAttendingPhysicianChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.attendingPhy?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("attndPhyID", value, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.attendingPhy, setValue]
  );

  const handlePICChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.pic?.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("pTypeID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("pTypeName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
        setValue("pTypeCode", selectedOption.value?.toString() || "", { shouldDirty: true });
      }
    },
    [dropdownValues.pic, setValue]
  );

  const handlePrimaryIntroSourceChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.primaryIntroducingSource?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("primIntroSourceID", value.toString(), { shouldValidate: true, shouldDirty: true });
        setValue("primIntroSourceName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.primaryIntroducingSource, setValue]
  );

  const handleMembershipChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.membershipScheme?.find((option) => Number(option.value) === Number(value));

      if (selectedOption) {
        setValue("patMemID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("patMemName", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      } else {
        // Clear membership when no selection
        setValue("patMemID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("patMemName", "", { shouldDirty: true });
      }
    },
    [dropdownValues.membershipScheme, setValue]
  );

  const handleStateChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.state?.find((option) => option.value === value);
      if (selectedOption) {
        setValue("pAddState", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue("pAddState", value, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.state, setValue]
  );

  // Patient search handler for edit mode
  const handlePatientSelect = useCallback(
    (patient: PatientSearchResult | null) => {
      if (patient && isEditMode) {
        // Load patient data would be handled by parent component
        // This is just for UI feedback
        setValue("pChartID", patient.pChartID, { shouldDirty: true });
        setValue("pChartCode", patient.pChartCode, { shouldDirty: true });
        setSavedPChartID(patient.pChartID);
      }
    },
    [isEditMode, setValue]
  );

  // Form submission
  const onSubmit = async (data: PatientFormData) => {
    if (isViewMode) return;
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const dto = transformToDto(data);

      let success = false;
      if (onSave) {
        success = await onSave(dto);
      }

      if (success) {
        if (isCreateMode) {
          const newDefaults = { ...defaultValues };
          reset(newDefaults);
          generatePatientCode();
          setSavedPChartID(0);
        }
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isCreateMode ? "register" : "update"} patient`;
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Internal form reset logic
  const performReset = useCallback(() => {
    const resetData = initialData && (isEditMode || isViewMode) ? transformToFormData(initialData) : defaultValues;
    reset(resetData);
    setFormError(null);

    if (isCreateMode) {
      setSavedPChartID(0);
      generatePatientCode();
    }
  }, [initialData, isEditMode, isViewMode, isCreateMode, defaultValues, reset, transformToFormData]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleSubmit: () => handleSubmit(onSubmit)(), // Trigger form submission
    handleReset: () => {
      if (isDirty) {
        setShowResetConfirmation(true);
      } else {
        performReset();
      }
    },
    isDirty,
    isValid,
    isSaving,
  }));

  const handleResetConfirm = useCallback(() => {
    performReset();
    setShowResetConfirmation(false);
  }, [performReset]);

  const handleResetCancel = useCallback(() => {
    setShowResetConfirmation(false);
  }, []);

  const isHospitalVisit = watchedVisitType === "H";
  const isPhysicianVisit = watchedVisitType === "P";
  const isNoneVisit = watchedVisitType === "N";

  // Helper function to get membership scheme display name
  const getMembershipDisplayName = () => {
    if (!watchedMembership || watchedMembership === 0) {
      return "No Membership Selected";
    }
    const selected = dropdownValues.membershipScheme?.find((option) => Number(option.value) === watchedMembership);
    return selected?.label || "Unknown Membership";
  };

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Patient Search for Edit Mode - Compact */}
      {isEditMode && !savedPChartID && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Search Patient
          </Typography>
          <PatientSearch
            onPatientSelect={handlePatientSelect}
            clearTrigger={patientClearTrigger}
            label="Search Patient to Edit"
            placeholder="Enter patient name, chart code, or phone number"
          />
        </Paper>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {formError && (
          <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        {/* Header Controls - Compact Layout */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box display="flex" gap={1} flexWrap="wrap">
              {/* Next of Kin */}
              {/* Patient Insurance */}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Status:
              </Typography>
              <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" disabled={isViewMode} />
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.5}>
          {/* Personal & Contact Information - Combined Section */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                Personal & Contact Information
              </Typography>

              <Grid container spacing={1.5}>
                {/* Row 1 - Basic Identity */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField
                    name="pChartCode"
                    control={control}
                    label="Chart Code"
                    type="text"
                    required
                    disabled={!isCreateMode}
                    size="small"
                    fullWidth
                    InputProps={{
                      endAdornment: isCreateMode ? (
                        <InputAdornment position="end">
                          {isGeneratingCode ? (
                            <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                              Gen...
                            </Typography>
                          ) : (
                            <SmartButton
                              icon={RefreshIcon}
                              variant="text"
                              size="small"
                              onClick={generatePatientCode}
                              tooltip="Generate new code"
                              sx={{ minWidth: "unset", p: 0.5 }}
                            />
                          )}
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pRegDate" control={control} label="Reg. Date" type="datepicker" required size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormField
                    name="pTitleVal"
                    control={control}
                    label="Title"
                    type="select"
                    required
                    size="small"
                    fullWidth
                    options={dropdownValues.title || []}
                    onChange={handleTitleChange}
                    disabled={isViewMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormField
                    name="pGenderVal"
                    control={control}
                    label="Gender"
                    type="select"
                    required
                    size="small"
                    fullWidth
                    options={dropdownValues.gender || []}
                    onChange={handleGenderChange}
                    disabled={isViewMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormField
                    name="pBldGrp"
                    control={control}
                    label="Blood Group"
                    type="select"
                    size="small"
                    fullWidth
                    options={dropdownValues.bloodGroup || []}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* Row 2 - Names */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pFName" control={control} label="First Name" type="text" required size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pMName" control={control} label="Middle Name" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pLName" control={control} label="Last Name" type="text" required size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pFhName" control={control} label="Father's Name" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>

                {/* Row 3 - Age/DOB Section */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField
                    name="pDobOrAgeVal"
                    control={control}
                    label="Age/DOB"
                    type="radio"
                    required
                    options={[
                      { value: "D", label: "DOB" },
                      { value: "A", label: "Age" },
                    ]}
                    disabled={isViewMode}
                    row
                  />
                </Grid>
                {watchedDobOrAge === "D" ? (
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormField name="pDob" control={control} label="Date of Birth" type="datepicker" required size="small" fullWidth disabled={isViewMode} />
                  </Grid>
                ) : (
                  <>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <FormField
                        name="pAgeNumber"
                        control={control}
                        label="Age"
                        type="number"
                        required
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 150 }}
                        disabled={isViewMode}
                        helperText={
                          watchedDob ? (
                            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                              Calculated DOB: {watchedDob.toLocaleDateString()}
                            </Typography>
                          ) : (
                            ""
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }}>
                      <FormField
                        name="pAgeDescriptionVal"
                        control={control}
                        label="Unit"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.ageUnit || []}
                        disabled={isViewMode}
                      />
                    </Grid>
                  </>
                )}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField
                    name="pMaritalStatus"
                    control={control}
                    label="Marital Status"
                    type="select"
                    size="small"
                    fullWidth
                    options={dropdownValues.maritalStatus || []}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* Row 4 - Contact Information */}
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pAddPhone1" control={control} label="Primary Phone" type="tel" required size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pAddPhone2" control={control} label="Secondary Phone" type="tel" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pAddEmail" control={control} label="Email Address" type="email" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box display="flex" gap={1} alignItems="center" sx={{ height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <FormField name="sendSMSYN" control={control} label="" type="switch" size="small" disabled={isViewMode} />
                      <Typography variant="caption">SMS</Typography>
                      <Chip
                        icon={watchedSendSMS === "Y" ? <CheckCircle sx={{ fontSize: "12px !important" }} /> : <Cancel sx={{ fontSize: "12px !important" }} />}
                        label={watchedSendSMS === "Y" ? "On" : "Off"}
                        color={watchedSendSMS === "Y" ? "success" : "default"}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: "20px" }}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <FormField name="sendEmailYN" control={control} label="" type="switch" size="small" disabled={isViewMode} />
                      <Typography variant="caption">Email</Typography>
                      <Chip
                        icon={watchedSendEmail === "Y" ? <CheckCircle sx={{ fontSize: "12px !important" }} /> : <Cancel sx={{ fontSize: "12px !important" }} />}
                        label={watchedSendEmail === "Y" ? "On" : "Off"}
                        color={watchedSendEmail === "Y" ? "success" : "default"}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: "20px" }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Address Information - Compact */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Address Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormField name="patDoorNo" control={control} label="Door No." type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField name="pAddStreet" control={control} label="Street" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="patAreaVal" control={control} label="Area" type="select" size="small" fullWidth options={dropdownValues.area || []} disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pAddCityVal" control={control} label="City" type="select" size="small" fullWidth options={dropdownValues.city || []} disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField
                    name="pAddState"
                    control={control}
                    label="State"
                    type="select"
                    size="small"
                    fullWidth
                    options={dropdownValues.state || []}
                    onChange={handleStateChange}
                    disabled={isViewMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField name="pAddPostcode" control={control} label="Postal Code" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormField
                    name="pAddCountryVal"
                    control={control}
                    label="Country"
                    type="select"
                    size="small"
                    fullWidth
                    options={dropdownValues.country || []}
                    disabled={isViewMode}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Visit Details - Only for Create Mode - More Compact */}
          {isCreateMode && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Visit Configuration
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField
                      name="visitTypeVal"
                      control={control}
                      label="Visit Type"
                      type="radio"
                      required
                      options={[
                        { value: "P", label: "Physician" },
                        { value: "H", label: "Hospital" },
                        { value: "N", label: "None" },
                      ]}
                      onChange={handleVisitTypeChange}
                      disabled={isViewMode}
                      row
                    />
                  </Grid>
                  {isHospitalVisit && (
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormField
                        name="deptID"
                        control={control}
                        label="Department"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.department || []}
                        onChange={handleDepartmentChange}
                        disabled={isViewMode}
                      />
                    </Grid>
                  )}
                  {isPhysicianVisit && (
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormField
                        name="attndPhyID"
                        control={control}
                        label="Attending Physician"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.attendingPhy || []}
                        onChange={handleAttendingPhysicianChange}
                        disabled={isViewMode}
                      />
                    </Grid>
                  )}
                  {!isNoneVisit && (
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormField
                        name="primIntroSourceID"
                        control={control}
                        label="Intro. Source"
                        type="select"
                        size="small"
                        fullWidth
                        options={dropdownValues.primaryIntroducingSource || []}
                        onChange={handlePrimaryIntroSourceChange}
                        disabled={isViewMode}
                      />
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Payment & Membership - Combined */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Payment & Membership
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField
                    name="pTypeID"
                    control={control}
                    label="Payment Source"
                    type="select"
                    required
                    size="small"
                    fullWidth
                    options={dropdownValues.pic || []}
                    onChange={handlePICChange}
                    disabled={isViewMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField
                    name="patMemID"
                    control={control}
                    label="Membership Scheme"
                    type="select"
                    size="small"
                    fullWidth
                    options={[{ value: "0", label: "No Membership" }, ...(dropdownValues.membershipScheme || [])]}
                    onChange={handleMembershipChange}
                    disabled={isViewMode}
                  />
                </Grid>
                {watchedMembership && watchedMembership > 0 && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormField name="patMemSchemeExpiryDate" control={control} label="Scheme Expiry" type="datepicker" size="small" fullWidth disabled={isViewMode} />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={getMembershipDisplayName()} color={watchedMembership && watchedMembership > 0 ? "primary" : "default"} size="small" variant="outlined" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Additional Information - Compact */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Additional Information
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField name="pOccupation" control={control} label="Occupation" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField name="pEmployer" control={control} label="Employer" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField name="pEducation" control={control} label="Education" type="text" size="small" fullWidth disabled={isViewMode} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormField
                    name="rNotes"
                    control={control}
                    label="Notes"
                    type="textarea"
                    size="small"
                    fullWidth
                    rows={2}
                    placeholder="Additional notes about the patient"
                    disabled={isViewMode}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />
    </Box>
  );
});

export default PatientRegistrationForm;
