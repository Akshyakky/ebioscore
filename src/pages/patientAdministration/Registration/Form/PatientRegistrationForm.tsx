import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save as SaveIcon, Cancel as CancelIcon, Refresh as RefreshIcon, AccountBalance as InsuranceIcon, People as NextOfKinIcon } from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { PatientSearch } from "../../CommonPage/Patient/PatientSearch/PatientSearch";

// Schema definition for comprehensive patient registration
const schema = z.object({
  // Personal Details (PatRegistersDto)
  pChartID: z.number().default(0),
  pChartCode: z.string().min(1, "Patient chart code is required"),
  pRegDate: z.date().default(new Date()),
  pTitleVal: z.string().min(1, "Title is required"),
  pTitle: z.string().default(""),
  pFName: z.string().min(1, "First name is required"),
  pMName: z.string().optional().default(""),
  pLName: z.string().min(1, "Last name is required"),

  // Age/DOB Selection
  pDobOrAgeVal: z.enum(["DOB", "AGE"]).default("DOB"),
  pDobOrAge: z.string().default(""),
  pDob: z.date().optional(),

  pGenderVal: z.string().min(1, "Gender is required"),
  pGender: z.string().default(""),
  pBldGrp: z.string().optional().default(""),
  pTypeID: z.number().min(1, "Patient type is required"),
  pTypeCode: z.string().default(""),
  pTypeName: z.string().default(""),
  pFhName: z.string().optional().default(""),
  fatherBldGrp: z.string().optional().default(""),

  // SMS and Email Send Options
  sendSMSYN: z.enum(["Y", "N"]).default("Y"),
  sendEmailYN: z.enum(["Y", "N"]).default("Y"),

  patMemID: z.number().optional().default(0),
  patMemName: z.string().optional().default(""),
  patMemDescription: z.string().optional().default(""),
  patMemSchemeExpiryDate: z.date().optional(),
  patSchemeExpiryDateYN: z.enum(["Y", "N"]).default("N"),
  patSchemeDescriptionYN: z.enum(["Y", "N"]).default("N"),
  cancelReason: z.string().optional().default(""),
  cancelYN: z.enum(["Y", "N"]).default("N"),
  deptID: z.number().optional().default(0),
  deptName: z.string().optional().default(""),
  facultyID: z.number().optional().default(0),
  faculty: z.string().optional().default(""),
  langType: z.string().optional().default(""),
  pChartCompID: z.number().optional().default(0),
  pExpiryDate: z.date().optional(),
  regTypeVal: z.string().optional().default(""),
  physicianRoom: z.string().optional().default(""),
  regType: z.string().optional().default(""),
  pPob: z.string().optional().default(""),
  patCompNameVal: z.string().optional().default(""),
  patCompName: z.string().optional().default(""),
  patDataFormYN: z.enum(["Y", "N"]).default("N"),
  intIdPsprt: z.string().optional().default(""),
  indentityType: z.string().default(""),
  indentityValue: z.string().default(""),
  patientType: z.string().default(""),

  // Contact Details (PatAddressDto)
  pAddType: z.string().default("HOME"),
  pAddMailVal: z.string().optional().default(""),
  pAddMail: z.string().optional().default(""),
  pAddSMSVal: z.string().optional().default(""),
  pAddSMS: z.string().optional().default(""),
  pAddEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  pAddStreet: z.string().optional().default(""),
  pAddStreet1: z.string().optional().default(""),
  pAddCityVal: z.string().optional().default(""),
  pAddCity: z.string().optional().default(""),
  pAddState: z.string().optional().default(""),
  pAddPostcode: z.string().optional().default(""),
  pAddCountryVal: z.string().optional().default(""),
  pAddCountry: z.string().optional().default(""),
  pAddPhone1: z.string().min(1, "Primary phone number is required"),
  pAddPhone2: z.string().optional().default(""),
  pAddPhone3: z.string().optional().default(""),
  pAddWorkPhone: z.string().optional().default(""),
  pAddActualCountryVal: z.string().optional().default(""),
  pAddActualCountry: z.string().optional().default(""),
  patAreaVal: z.string().optional().default(""),
  patArea: z.string().optional().default(""),
  patDoorNo: z.string().optional().default(""),

  // Overview Details (PatOverviewDto)
  pPhoto: z.string().optional().default(""),
  pMaritalStatus: z.string().optional().default(""),
  pReligion: z.string().optional().default(""),
  pEducation: z.string().optional().default(""),
  pOccupation: z.string().optional().default(""),
  pEmployer: z.string().optional().default(""),
  ethnicity: z.string().optional().default(""),
  pCountryOfOrigin: z.string().optional().default(""),
  pAgeNumber: z.number().default(0),
  pAgeDescriptionVal: z.string().default(""),

  // Visit Details (OpvisitDto)
  visitTypeVal: z.string().min(1, "Visit type is required"),
  visitType: z.string().default(""),
  attndPhyID: z.string().optional().default(""),
  attendingPhysicianName: z.string().optional().default(""),

  // Primary Introducing Source
  primIntroSourceID: z.string().optional().default(""),
  primIntroSourceName: z.string().optional().default(""),

  // Common fields
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional().default(""),
  transferYN: z.string().default("N"),
});

type PatientRegistrationFormData = z.infer<typeof schema>;

interface PatientRegistrationFormProps {
  mode?: "create" | "edit" | "view";
  initialData?: PatientRegistrationFormData | null;
  onSave?: (data: PatientRegistrationFormData) => Promise<boolean>;
  onClose?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({ mode = "create", initialData = null, onSave, onClose }) => {
  const { setLoading } = useLoading();
  const { showAlert, showErrorAlert } = useAlert();
  const serverDate = useServerDate();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [savedPChartID, setSavedPChartID] = useState<number>(0);
  const [showNextOfKin, setShowNextOfKin] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);

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
    "department",
    "primaryIntroducingSource",
    "attendingPhy",
  ]);

  const defaultValues: PatientRegistrationFormData = {
    pChartID: 0,
    pChartCode: "",
    pRegDate: serverDate,
    pTitleVal: "",
    pTitle: "",
    pFName: "",
    pMName: "",
    pLName: "",
    pDobOrAgeVal: "DOB",
    pDobOrAge: "",
    pDob: serverDate,
    pGenderVal: "",
    pGender: "",
    pBldGrp: "",
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    pFhName: "",
    fatherBldGrp: "",
    patMemID: 0,
    patMemName: "",
    patMemDescription: "",
    patMemSchemeExpiryDate: undefined,
    patSchemeExpiryDateYN: "N",
    patSchemeDescriptionYN: "N",
    cancelReason: "",
    cancelYN: "N",
    deptID: 0,
    deptName: "",
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
    patDataFormYN: "N",
    intIdPsprt: "",
    indentityType: "",
    indentityValue: "",
    patientType: "",
    pAddType: "HOME",
    pAddMailVal: "",
    pAddMail: "",
    pAddSMSVal: "",
    pAddSMS: "",
    pAddEmail: "",
    pAddStreet: "",
    pAddStreet1: "",
    pAddCityVal: "",
    pAddCity: "",
    pAddState: "",
    pAddPostcode: "",
    pAddCountryVal: "",
    pAddCountry: "",
    pAddPhone1: "",
    pAddPhone2: "",
    pAddPhone3: "",
    pAddWorkPhone: "",
    pAddActualCountryVal: "",
    pAddActualCountry: "",
    patAreaVal: "",
    patArea: "",
    patDoorNo: "",
    pPhoto: "",
    pMaritalStatus: "",
    pReligion: "",
    pEducation: "",
    pOccupation: "",
    pEmployer: "",
    ethnicity: "",
    pCountryOfOrigin: "",
    pAgeNumber: 0,
    pAgeDescriptionVal: "",
    visitTypeVal: "",
    visitType: "",
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<PatientRegistrationFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const watchedMembership = watch("patMemID");
  const watchedDobOrAge = watch("pDobOrAgeVal");
  const watchedVisitType = watch("visitTypeVal");

  useEffect(() => {
    if (isCreateMode) {
      generatePatientCode();
    }
  }, [isCreateMode]);

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      reset(initialData);
      setSavedPChartID(initialData.pChartID);
    }
  }, [initialData, isEditMode, isViewMode, reset]);

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

  // Handle dropdown changes
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

      // Clear dependent fields when visit type changes
      setValue("deptID", 0, { shouldDirty: true });
      setValue("deptName", "", { shouldDirty: true });
      setValue("attndPhyID", "", { shouldDirty: true });
      setValue("attendingPhysicianName", "", { shouldDirty: true });

      // Set visit type label
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

  const handlePrimaryIntroSourceChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.primaryIntroducingSource?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("primIntroSourceID", value, { shouldValidate: true, shouldDirty: true });
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
      }
    },
    [dropdownValues.membershipScheme, setValue]
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

  const handleAreaChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.area?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("patAreaVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("patArea", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.area, setValue]
  );

  const handleCityChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.city?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("pAddCityVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pAddCity", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.city, setValue]
  );

  const handleStateChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.state?.find((option) => option.value === value);

      if (selectedOption) {
        //setValue("pAddStateVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pAddState", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.state, setValue]
  );

  const handleCountryChange = useCallback(
    (event: any) => {
      const value = event?.target?.value || event?.value || event;
      const selectedOption = dropdownValues.country?.find((option) => option.value === value);

      if (selectedOption) {
        setValue("pAddCountryVal", value, { shouldValidate: true, shouldDirty: true });
        setValue("pAddCountry", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [dropdownValues.country, setValue]
  );

  const handlePatientSelect = useCallback(
    (patient: any) => {
      if (patient && isEditMode) {
        // Mock loading patient data - replace with actual service call
        const mockPatientData = {
          ...defaultValues,
          pChartID: patient.pChartID,
          pChartCode: patient.pChartCode,
          pFName: patient.fullName?.split(" ")[0] || "",
          pLName: patient.fullName?.split(" ").slice(1).join(" ") || "",
          // Add other fields as needed
        };

        reset(mockPatientData);
        setSavedPChartID(patient.pChartID);
      }
    },
    [isEditMode, reset, defaultValues]
  );

  // Form submission
  const onSubmit = async (data: PatientRegistrationFormData) => {
    if (isViewMode) return;
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);
      let success = false;
      if (onSave) {
        success = await onSave(data);
      }

      if (success) {
        showAlert("Success", "Patient " + (isCreateMode ? "registered" : "updated") + " successfully", "success");
        if (isCreateMode) {
          // Reset form for new entry
          const newDefaults = { ...defaultValues };
          reset(newDefaults);
          generatePatientCode();
        }
      } else {
        showErrorAlert("Error", "Failed to " + (isCreateMode ? "register" : "update") + " patient");
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

  // Form reset
  const performReset = () => {
    const resetData = initialData || defaultValues;
    reset(resetData);
    setFormError(null);

    if (isCreateMode) {
      setSavedPChartID(0);
      generatePatientCode();
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  // Calculate age from DOB or DOB from age
  const calculateAge = (dob: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getFormTitle = () => {
    switch (mode) {
      case "create":
        return "Patient Registration";
      case "edit":
        return "Edit Patient Details";
      case "view":
        return "View Patient Details";
      default:
        return "Patient Registration";
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {getFormTitle()}
      </Typography>

      {/* Patient Search for Edit Mode */}
      {isEditMode && !savedPChartID && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Patient
            </Typography>
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              clearTrigger={patientClearTrigger}
              label="Search Patient to Edit"
              placeholder="Enter patient name, chart code, or phone number"
            />
          </CardContent>
        </Card>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Status and Action Controls */}
          <Grid size={{ sm: 12 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
              <Box display="flex" gap={1}>
                <SmartButton text="Manage Next of Kin" icon={NextOfKinIcon} onClick={() => setShowNextOfKin(true)} variant="outlined" size="small" disabled={savedPChartID === 0} />
                <SmartButton text="Manage Insurance" icon={InsuranceIcon} onClick={() => setShowInsurance(true)} variant="outlined" size="small" disabled={savedPChartID === 0} />
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" disabled={isViewMode} />
              </Box>
            </Box>
          </Grid>

          {/* Personal Details */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name="pChartCode"
                      control={control}
                      label="Patient Chart Code"
                      type="text"
                      required
                      disabled={!isCreateMode}
                      size="small"
                      fullWidth
                      InputProps={{
                        endAdornment: isCreateMode ? (
                          <InputAdornment position="end">
                            {isGeneratingCode ? (
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="caption" sx={{ mr: 1 }}>
                                  Generating...
                                </Typography>
                              </Box>
                            ) : (
                              <SmartButton icon={RefreshIcon} variant="text" size="small" onClick={generatePatientCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                            )}
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pRegDate" control={control} label="Registration Date" type="datepicker" required size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
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

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pFName" control={control} label="First Name" type="text" required size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pMName" control={control} label="Middle Name" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pLName" control={control} label="Last Name" type="text" required size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
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

                  {/* Age/DOB Selection */}
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name="ageOrDobType"
                      control={control}
                      label="Age/DOB Selection"
                      type="radio"
                      required
                      options={[
                        { value: "DOB", label: "Date of Birth" },
                        { value: "AGE", label: "Age" },
                      ]}
                      disabled={isViewMode}
                      row
                    />
                  </Grid>

                  {watchedDobOrAge === "DOB" ? (
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField name="pDob" control={control} label="Date of Birth" type="datepicker" required size="small" fullWidth disabled={isViewMode} />
                    </Grid>
                  ) : (
                    <>
                      <Grid size={{ sm: 12, md: 2 }}>
                        <FormField
                          name="ageNumber"
                          control={control}
                          label="Age"
                          type="number"
                          required
                          size="small"
                          fullWidth
                          inputProps={{ min: 0, max: 150 }}
                          disabled={isViewMode}
                        />
                      </Grid>
                      <Grid size={{ sm: 12, md: 2 }}>
                        <FormField
                          name="ageUnit"
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

                  <Grid size={{ sm: 12, md: 4 }}>
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

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="pFhName" control={control} label="Father's Name" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Details */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pAddPhone1" control={control} label="Primary Phone" type="tel" required size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pAddPhone2" control={control} label="Secondary Phone" type="tel" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pAddEmail" control={control} label="Email Address" type="email" size="small" fullWidth disabled={isViewMode} />
                  </Grid>
                  {/* SMS and Email Send Options */}
                  <Grid size={{ sm: 12, md: 6 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormField name="sendSMSYN" control={control} label="Send SMS" type="switch" size="small" disabled={isViewMode} />
                      <Typography variant="body2" color="text.secondary">
                        Allow SMS notifications
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormField name="sendEmailYN" control={control} label="Send Email" type="switch" size="small" disabled={isViewMode} />
                      <Typography variant="body2" color="text.secondary">
                        Allow Email notifications
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="patDoorNo" control={control} label="Door Number" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pAddStreet" control={control} label="Street" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name="patAreaVal"
                      control={control}
                      label="Area"
                      type="select"
                      size="small"
                      fullWidth
                      options={dropdownValues.area || []}
                      onChange={handleAreaChange}
                      disabled={isViewMode}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name="pAddCityVal"
                      control={control}
                      label="City"
                      type="select"
                      size="small"
                      fullWidth
                      options={dropdownValues.city || []}
                      onChange={handleCityChange}
                      disabled={isViewMode}
                    />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
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

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField name="pAddPostcode" control={control} label="Postal Code" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 4 }}>
                    <FormField
                      name="pAddCountryVal"
                      control={control}
                      label="Country"
                      type="select"
                      size="small"
                      fullWidth
                      options={dropdownValues.country || []}
                      onChange={handleCountryChange}
                      disabled={isViewMode}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Visit Details & Payment Information */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visit Details & Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
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
                    />
                  </Grid>

                  {/* Conditional Department Dropdown for Hospital Visit */}
                  {watchedVisitType === "H" && (
                    <Grid size={{ sm: 12, md: 6 }}>
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

                  {/* Conditional Attending Physician Dropdown for Physician Visit */}
                  {watchedVisitType === "P" && (
                    <Grid size={{ sm: 12, md: 6 }}>
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

                  <Grid size={{ sm: 12, md: 6 }}>
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
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Membership Scheme */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Membership Scheme
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField
                      name="patMemID"
                      control={control}
                      label="Membership Scheme"
                      type="select"
                      size="small"
                      fullWidth
                      options={dropdownValues.membershipScheme || []}
                      onChange={handleMembershipChange}
                      disabled={isViewMode}
                    />
                  </Grid>

                  {watchedMembership && watchedMembership > 0 && (
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="patMemSchemeExpiryDate" control={control} label="Scheme Expiry Date" type="datepicker" size="small" fullWidth disabled={isViewMode} />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          <Grid size={{ sm: 12 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="pOccupation" control={control} label="Occupation" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12, md: 6 }}>
                    <FormField name="pEmployer" control={control} label="Employer" type="text" size="small" fullWidth disabled={isViewMode} />
                  </Grid>

                  <Grid size={{ sm: 12 }}>
                    <FormField
                      name="rNotes"
                      control={control}
                      label="Notes"
                      type="textarea"
                      size="small"
                      fullWidth
                      rows={3}
                      placeholder="Enter any additional notes about this patient"
                      disabled={isViewMode}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ sm: 12 }}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              {onClose && <SmartButton text="Close" onClick={onClose} variant="outlined" color="inherit" />}

              {!isViewMode && (
                <>
                  <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || (!isDirty && !formError)} />
                  <SmartButton
                    text={isCreateMode ? "Register Patient" : "Update Patient"}
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    color="primary"
                    icon={SaveIcon}
                    asynchronous={true}
                    showLoadingIndicator={true}
                    loadingText={isCreateMode ? "Registering..." : "Updating..."}
                    successText={isCreateMode ? "Registered!" : "Updated!"}
                    disabled={isSaving || !isValid}
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Reset Confirmation Dialog */}
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
};

export default PatientRegistrationForm;
