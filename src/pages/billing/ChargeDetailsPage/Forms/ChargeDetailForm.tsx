import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChargeDetailsDto, BChargeDto, BChargeDetailsDto, BChargeAliasDto, BChargeFacultyDto, BChargePackDto, BDoctorSharePerShare } from "@/interfaces/Billing/BChargeDetails";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel, Refresh, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useChargeDetails } from "../hooks/useChargeDetails";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface ChargeDetailsFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: ChargeDetailsDto | null;
  viewOnly?: boolean;
}

// Define validation schema for charge info
const chargeInfoSchema = z.object({
  chargeID: z.number(),
  chargeCode: z.string().nonempty("Charge code is required"),
  chargeDesc: z.string().nonempty("Charge description is required"),
  chargeDescLang: z.string().optional(),
  cShortName: z.string().nonempty("Short name is required"),
  chargeType: z.string().nonempty("Charge type is required"),
  sGrpID: z.number(),
  chargeTo: z.string().nonempty("Charge to is required"),
  chargeStatus: z.string().nonempty("Status is required"),
  chargeBreakYN: z.string(),
  bChID: z.number(),
  rActiveYN: z.string(),
  regServiceYN: z.string(),
  doctorShareYN: z.string(),
  cNhsCode: z.string().optional().nullable(),
  cNhsEnglishName: z.string().optional().nullable(),
  regDefaultServiceYN: z.string().optional(),
  isBedServiceYN: z.string().optional(),
  chargeCost: z.string().optional(),
  scheduleDate: z.date().optional().nullable(),
  DcValue: z.number().optional(),
  hcValue: z.number().optional(),
  chValue: z.number().optional(),
  transferYN: z.string().optional(),
  rNotes: z.string().optional().nullable(),
});

// Define validation schema for charge details
const chargeDetailsSchema = z.object({
  chDetID: z.number(),
  chargeID: z.number(),
  pTypeID: z.number(),
  wCatID: z.number(),
  dcValue: z.number().optional(),
  hcValue: z.number().optional(),
  chValue: z.number(),
  chargeStatus: z.string(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

// Define validation schema for charge aliases
const chargeAliasSchema = z.object({
  chaliasID: z.number(),
  chargeID: z.number(),
  pTypeID: z.number(),
  chargeDesc: z.string().nonempty("Alias description is required"),
  chargeDescLang: z.string(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

// Define validation schema for charge faculties
const chargeFacultySchema = z.object({
  bchfID: z.number(),
  chargeID: z.number(),
  aSubID: z.number(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

// Define validation schema for charge pack details
const chargePackSchema = z.object({
  pkDetID: z.number(),
  chDetID: z.number(),
  chargeID: z.number(),
  chargeRevise: z.string(),
  chargeStatus: z.string(),
  DcValue: z.number(),
  hcValue: z.number(),
  chValue: z.number(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

// Define validation schema for doctor share
const doctorShareSchema = z.object({
  docShareID: z.number(),
  chargeID: z.number(),
  conID: z.number(),
  doctorShare: z.number(),
  hospShare: z.number(),
  rActiveYN: z.string(),
  transferYN: z.string(),
  rNotes: z.string().optional().nullable(),
});

// Complete schema
const schema = z.object({
  chargeInfo: chargeInfoSchema,
  chargeDetails: z.array(chargeDetailsSchema).min(1, "At least one charge detail is required"),
  chargeAliases: z.array(chargeAliasSchema),
  chargeFaculties: z.array(chargeFacultySchema),
  chargePackages: z.array(chargePackSchema).optional(),
  doctorSharePerShare: z.array(doctorShareSchema).optional(),
});

type ChargeDetailsFormData = z.infer<typeof schema>;

// Tab interface for the form
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`charge-tabpanel-${index}`} aria-labelledby={`charge-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

const ChargeDetailsForm: React.FC<ChargeDetailsFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { generateChargeCode, saveChargeDetails } = useChargeDetails();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const isAddMode = !initialData;

  // Get dropdown values for form fields
  const dropdownValues = useDropdownValues(["service", "speciality", "bedCategory", "pic", "serviceType"]);

  // Default values for the form
  const defaultValues: ChargeDetailsFormData = {
    chargeInfo: {
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      chargeDescLang: "",
      cShortName: "",
      chargeType: "",
      sGrpID: 0,
      chargeTo: "Both",
      chargeStatus: "ON",
      chargeBreakYN: "N",
      bChID: 0,
      rActiveYN: "Y",
      regServiceYN: "N",
      doctorShareYN: "N",
      cNhsCode: "",
      cNhsEnglishName: "",
      regDefaultServiceYN: "N",
      isBedServiceYN: "N",
      chargeCost: "0",
      scheduleDate: new Date(),
      DcValue: 0,
      hcValue: 0,
      chValue: 0,
      transferYN: "N",
      rNotes: "",
    },
    chargeDetails: [
      {
        chDetID: 0,
        chargeID: 0,
        pTypeID: 0,
        wCatID: 0,
        dcValue: 0,
        hcValue: 0,
        chValue: 0,
        chargeStatus: "N",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      },
    ],
    chargeAliases: [
      {
        chaliasID: 0,
        chargeID: 0,
        pTypeID: 0,
        chargeDesc: "",
        chargeDescLang: "",
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      },
    ],
    chargeFaculties: [
      {
        bchfID: 0,
        chargeID: 0,
        aSubID: 0,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      },
    ],
    chargePackages: [],
    doctorSharePerShare: [],
  };

  const methods = useForm<ChargeDetailsFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isValid, errors },
  } = methods;

  // Field arrays for the nested collections
  const {
    fields: chargeDetailsFields,
    append: appendChargeDetail,
    remove: removeChargeDetail,
  } = useFieldArray({
    control,
    name: "chargeDetails",
  });

  const {
    fields: chargeAliasesFields,
    append: appendChargeAlias,
    remove: removeChargeAlias,
  } = useFieldArray({
    control,
    name: "chargeAliases",
  });

  const {
    fields: chargeFacultiesFields,
    append: appendChargeFaculty,
    remove: removeChargeFaculty,
  } = useFieldArray({
    control,
    name: "chargeFaculties",
  });

  const {
    fields: chargePackagesFields,
    append: appendChargePackage,
    remove: removeChargePackage,
  } = useFieldArray({
    control,
    name: "chargePackages",
  });

  const {
    fields: doctorSharePerShareFields,
    append: appendDoctorShare,
    remove: removeDoctorShare,
  } = useFieldArray({
    control,
    name: "doctorSharePerShare",
  });

  // Watch charge break and doctor share values to control conditional rendering
  const chargeBreakYN = watch("chargeInfo.chargeBreakYN");
  const doctorShareYN = watch("chargeInfo.doctorShareYN");

  // Generate charge code
  const generateCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const code = await generateChargeCode();
      if (code) {
        setValue("chargeInfo.chargeCode", code, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate charge code", "warning");
      }
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Convert API data to form data structure
  const mapApiToFormData = (apiData: ChargeDetailsDto): ChargeDetailsFormData => {
    return {
      chargeInfo: {
        ...apiData.chargeInfo,
        sGrpID: apiData.chargeInfo?.sGrpID || 0,
        chargeID: apiData.chargeInfo?.chargeID || 0,
        bChID: apiData.chargeInfo?.bChID || 0,
        chargeBreakYN: apiData.chargeInfo?.chargeBreakYN || "N",
        doctorShareYN: apiData.chargeInfo?.doctorShareYN || "N",
        regServiceYN: apiData.chargeInfo?.regServiceYN || "N",
        regDefaultServiceYN: apiData.chargeInfo?.regDefaultServiceYN || "N",
        isBedServiceYN: apiData.chargeInfo?.isBedServiceYN || "N",
        rActiveYN: apiData.chargeInfo?.rActiveYN || "Y",
        transferYN: apiData.chargeInfo?.transferYN || "N",
        chargeTo: apiData.chargeInfo?.chargeTo || "Both",
        chargeStatus: apiData.chargeInfo?.chargeStatus || "ON",
      },
      chargeDetails: apiData.chargeDetails || defaultValues.chargeDetails,
      chargeAliases: apiData.chargeAliases || defaultValues.chargeAliases,
      chargeFaculties: apiData.chargeFaculties || defaultValues.chargeFaculties,
      chargePackages: apiData.chargePackages || [],
      doctorSharePerShare: apiData.doctorSharePerShare || [],
    };
  };

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      // Ensure the data structure is valid before setting it
      if (initialData.chargeInfo) {
        reset(mapApiToFormData(initialData));
      } else {
        // If the data structure is invalid, show an error and use default values
        showAlert("Warning", "The charge data structure is invalid. Using default values.", "warning");
        reset(defaultValues);
      }
    } else {
      reset(defaultValues);
      generateCode();
    }
  }, [initialData, reset, showAlert]);

  // Form submission handler
  const onSubmit = async (data: ChargeDetailsFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      // Format the data for API submission
      const requestData: ChargeDetailsDto = {
        chargeInfo: {
          ...data.chargeInfo,
          chargeID: data.chargeInfo.chargeID ?? 0,
          chargeCode: data.chargeInfo.chargeCode ?? "", // Ensure it's a string
          chargeDesc: data.chargeInfo.chargeDesc ?? "", // Ensure it's a string
          chargeDescLang: data.chargeInfo.chargeDescLang ?? "", // Use nullish coalescing for optional string
          cShortName: data.chargeInfo.cShortName ?? "",
          chargeType: data.chargeInfo.chargeType ?? "",
          sGrpID: data.chargeInfo.sGrpID ?? 0,
          chargeTo: data.chargeInfo.chargeTo ?? "Both",
          chargeStatus: data.chargeInfo.chargeStatus ?? "ON",
          chargeBreakYN: data.chargeInfo.chargeBreakYN ?? "N",
          bChID: data.chargeInfo.bChID ?? 0,
          rActiveYN: data.chargeInfo.rActiveYN ?? "Y", // Ensure it's explicitly 'Y' or 'N'
          regServiceYN: data.chargeInfo.regServiceYN ?? "N",
          doctorShareYN: data.chargeInfo.doctorShareYN ?? "N",
          cNhsCode: data.chargeInfo.cNhsCode ?? null,
          cNhsEnglishName: data.chargeInfo.cNhsEnglishName ?? null,
          regDefaultServiceYN: data.chargeInfo.regDefaultServiceYN ?? "N",
          isBedServiceYN: data.chargeInfo.isBedServiceYN ?? "N",
          chargeCost: data.chargeInfo.chargeCost ?? "0",
          scheduleDate: data.chargeInfo.scheduleDate instanceof Date ? data.chargeInfo.scheduleDate : data.chargeInfo.scheduleDate ? new Date(data.chargeInfo.scheduleDate) : null,
          DcValue: data.chargeInfo.DcValue ?? 0,
          hcValue: data.chargeInfo.hcValue ?? 0,
          chValue: data.chargeInfo.chValue ?? 0,
          transferYN: data.chargeInfo.transferYN ?? "N",
          rNotes: data.chargeInfo.rNotes ?? null,
        },
        chargeDetails: data.chargeDetails.map((detail) => ({
          ...detail,
          chargeID: detail.chargeID ?? data.chargeInfo.chargeID ?? 0,
          chDetID: detail.chDetID ?? 0,
          pTypeID: detail.pTypeID ?? 0,
          wCatID: detail.wCatID ?? 0,
          chValue: detail.chValue ?? 0, // Required in schema
          chargeStatus: detail.chargeStatus ?? "N", // Required in schema
          rActiveYN: detail.rActiveYN ?? "Y", // FIX: Explicitly provide a default if it's undefined
          transferYN: detail.transferYN ?? "N",
          rNotes: detail.rNotes ?? null,
        })),
        chargeAliases: data.chargeAliases.map((alias) => ({
          ...alias,
          chargeID: alias.chargeID ?? data.chargeInfo.chargeID ?? 0,
          chaliasID: alias.chaliasID ?? 0,
          pTypeID: alias.pTypeID ?? 0,
          chargeDesc: alias.chargeDesc ?? "", // Required in schema
          chargeDescLang: alias.chargeDescLang ?? "", // Required in schema, but optional in BChargeDto. Consider its usage.
          rActiveYN: alias.rActiveYN ?? "Y", // FIX: Explicitly provide a default if it's undefined
          transferYN: alias.transferYN ?? "N",
          rNotes: alias.rNotes ?? null,
        })),
        chargeFaculties: data.chargeFaculties?.map((faculty) => ({
          ...faculty,
          chargeID: faculty.chargeID ?? data.chargeInfo.chargeID ?? 0,
          bchfID: faculty.bchfID ?? 0,
          aSubID: faculty.aSubID ?? 0, // Required in schema
          rActiveYN: faculty.rActiveYN ?? "Y", // FIX: Explicitly provide a default if it's undefined
          transferYN: faculty.transferYN ?? "N",
          rNotes: faculty.rNotes ?? null,
        })),
        chargePackages: data.chargePackages?.map((pkg) => ({
          ...pkg,
          chargeID: pkg.chargeID ?? data.chargeInfo.chargeID ?? 0,
          pkDetID: pkg.pkDetID ?? 0,
          chDetID: pkg.chDetID ?? 0,
          chargeRevise: pkg.chargeRevise ?? "", // Required in schema
          chargeStatus: pkg.chargeStatus ?? "Y", // Required in schema
          DcValue: pkg.DcValue ?? 0, // Required in schema
          hcValue: pkg.hcValue ?? 0, // Required in schema
          chValue: pkg.chValue ?? 0, // Required in schema
          rActiveYN: pkg.rActiveYN ?? "Y", // FIX: Explicitly provide a default if it's undefined
          transferYN: pkg.transferYN ?? "N",
          rNotes: pkg.rNotes ?? null,
        })),
        doctorSharePerShare: data.doctorSharePerShare?.map((share) => ({
          ...share,
          chargeID: share.chargeID ?? data.chargeInfo.chargeID ?? 0,
          docShareID: share.docShareID ?? 0,
          conID: share.conID ?? 0, // Required in schema
          doctorShare: share.doctorShare ?? 0, // Required in schema
          hospShare: share.hospShare ?? 0, // Required in schema
          rActiveYN: share.rActiveYN ?? "Y", // FIX: Explicitly provide a default if it's undefined
          transferYN: share.transferYN ?? "N",
          rNotes: share.rNotes ?? null,
        })),
      };

      const response = await saveChargeDetails(requestData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Charge details created successfully" : "Charge details updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save charge details");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save charge details";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Reset form handler
  const performReset = () => {
    if (initialData && initialData.chargeInfo) {
      reset(mapApiToFormData(initialData));
    } else {
      reset(defaultValues);
      generateCode();
    }
    setFormError(null);
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

  // Cancel form handler
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelCancel = () => {
    setShowCancelConfirmation(false);
  };

  // Add new items to arrays
  const handleAddChargeDetail = () => {
    appendChargeDetail({
      chDetID: 0,
      chargeID: 0,
      pTypeID: 0,
      wCatID: 0,
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
      chargeStatus: "N",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleAddChargeAlias = () => {
    appendChargeAlias({
      chaliasID: 0,
      chargeID: 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleAddChargeFaculty = () => {
    appendChargeFaculty({
      bchfID: 0,
      chargeID: 0,
      aSubID: 0,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleAddChargePackage = () => {
    appendChargePackage({
      pkDetID: 0,
      chDetID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "Y",
      DcValue: 0,
      hcValue: 0,
      chValue: 0,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleAddDoctorShare = () => {
    appendDoctorShare({
      docShareID: 0,
      chargeID: 0,
      conID: 0,
      doctorShare: 0,
      hospShare: 0,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleRefreshCode = () => {
    if (isAddMode) {
      generateCode();
    }
  };

  const dialogTitle = viewOnly ? "View Charge Details" : isAddMode ? "Create New Charge" : `Edit Charge - ${initialData?.chargeInfo?.chargeDesc || "Unknown"}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Charge" : "Update Charge"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={isAddMode ? "Creating..." : "Updating..."}
          successText={isAddMode ? "Created!" : "Updated!"}
          disabled={isSaving || !isValid}
        />
      </Box>
    </Box>
  );

  // Create array of picTypes and bedCategories for dropdowns
  const picOptions = dropdownValues.pic?.map((item) => ({ value: item.value, label: item.label })) || [];
  const bedCategoryOptions = dropdownValues.bedCategory?.map((item) => ({ value: item.value, label: item.label })) || [];
  const serviceGroupOptions = dropdownValues.service?.map((item) => ({ value: item.value, label: item.label })) || [];
  const specialityOptions = dropdownValues.speciality?.map((item) => ({ value: item.value, label: item.label })) || [];

  return (
    <FormProvider {...methods}>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={dialogTitle}
        maxWidth="lg"
        fullWidth
        showCloseButton
        disableBackdropClick={!viewOnly && (isDirty || isSaving)}
        disableEscapeKeyDown={!viewOnly && (isDirty || isSaving)}
        actions={dialogActions}
      >
        <Box component="form" noValidate sx={{ p: 1 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Show form errors in development */}
          {process.env.NODE_ENV === "development" && Object.keys(errors).length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Form Validation Errors:</Typography>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>{JSON.stringify(errors, null, 2)}</pre>
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="chargeInfo.rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
                <FormField name="chargeInfo.isBedServiceYN" control={control} label="Is Bed Service" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="charge details tabs" variant="scrollable" scrollButtons="auto">
                <Tab label="Basic Information" id="charge-tab-0" aria-controls="charge-tabpanel-0" />
                <Tab label="Charge Details" id="charge-tab-1" aria-controls="charge-tabpanel-1" />
                <Tab label="Aliases" id="charge-tab-2" aria-controls="charge-tabpanel-2" />
                <Tab label="Faculties" id="charge-tab-3" aria-controls="charge-tabpanel-3" />
                {chargeBreakYN === "Y" && <Tab label="Pack Details" id="charge-tab-4" aria-controls="charge-tabpanel-4" />}
                {doctorShareYN === "Y" && <Tab label="Doctor Share" id="charge-tab-5" aria-controls="charge-tabpanel-5" />}
              </Tabs>

              {/* Basic Information Tab */}
              <TabPanel value={tabValue} index={0}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Charge Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="chargeInfo.chargeCode"
                          control={control}
                          label="Charge Code"
                          type="text"
                          required
                          disabled={viewOnly || !isAddMode}
                          size="small"
                          fullWidth
                          InputProps={{
                            endAdornment:
                              isAddMode && !viewOnly ? (
                                <InputAdornment position="end">
                                  {isGeneratingCode ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <SmartButton icon={Refresh} variant="text" size="small" onClick={handleRefreshCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                                  )}
                                </InputAdornment>
                              ) : null,
                          }}
                        />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="chargeInfo.chargeDesc" control={control} label="Charge Description" type="text" required disabled={viewOnly} size="small" fullWidth />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="chargeInfo.cShortName" control={control} label="Short Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="chargeInfo.chargeType"
                          control={control}
                          label="Charge Type"
                          type="select"
                          required
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          options={[
                            { value: "CONS", label: "Consultation" },
                            { value: "PROC", label: "Procedure" },
                            { value: "LAB", label: "Laboratory" },
                            { value: "RAD", label: "Radiology" },
                            { value: "PHAR", label: "Pharmacy" },
                            { value: "SERV", label: "Service" },
                          ]}
                        />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="chargeInfo.sGrpID"
                          control={control}
                          label="Service Group"
                          type="select"
                          required
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          options={serviceGroupOptions}
                        />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="chargeInfo.chargeTo"
                          control={control}
                          label="Charge To"
                          type="select"
                          required
                          disabled={viewOnly}
                          size="small"
                          fullWidth
                          options={[
                            { value: "Both", label: "Both" },
                            { value: "Doctor", label: "Doctor" },
                            { value: "Hospital", label: "Hospital" },
                          ]}
                        />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="chargeInfo.cNhsCode" control={control} label="NHS Code" type="text" disabled={viewOnly} size="small" fullWidth />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="chargeInfo.cNhsEnglishName" control={control} label="NHS English Name" type="text" disabled={viewOnly} size="small" fullWidth />
                      </Grid>

                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField name="chargeInfo.chargeCost" control={control} label="Charge Cost" type="text" disabled={viewOnly} size="small" fullWidth />
                      </Grid>
                    </Grid>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Charge Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField name="chargeInfo.chargeBreakYN" control={control} label="Allow Break" type="switch" disabled={viewOnly || doctorShareYN === "Y"} size="small" />
                      </Grid>

                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField name="chargeInfo.regServiceYN" control={control} label="Registration Service" type="switch" disabled={viewOnly} size="small" />
                      </Grid>

                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField name="chargeInfo.regDefaultServiceYN" control={control} label="Default Registration Service" type="switch" disabled={viewOnly} size="small" />
                      </Grid>

                      <Grid size={{ sm: 12, md: 3 }}>
                        <FormField name="chargeInfo.doctorShareYN" control={control} label="Doctor Share" type="switch" disabled={viewOnly || chargeBreakYN === "Y"} size="small" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Charge Details Tab */}
              <TabPanel value={tabValue} index={1}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Charge Details</Typography>
                      {!viewOnly && <SmartButton text="Add Detail" icon={AddIcon} onClick={handleAddChargeDetail} variant="contained" color="primary" size="small" />}
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Patient Type</TableCell>
                            <TableCell>Ward Category</TableCell>
                            <TableCell>DC Value</TableCell>
                            <TableCell>HC Value</TableCell>
                            <TableCell>CH Value</TableCell>
                            <TableCell>Status</TableCell>
                            {!viewOnly && <TableCell>Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {chargeDetailsFields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <FormField
                                  name={`chargeDetails.${index}.pTypeID`}
                                  control={control}
                                  type="select"
                                  disabled={viewOnly}
                                  size="small"
                                  fullWidth
                                  options={picOptions}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  name={`chargeDetails.${index}.wCatID`}
                                  control={control}
                                  type="select"
                                  disabled={viewOnly}
                                  size="small"
                                  fullWidth
                                  options={bedCategoryOptions}
                                />
                              </TableCell>
                              <TableCell>
                                <FormField name={`chargeDetails.${index}.dcValue`} control={control} type="number" disabled={viewOnly} size="small" fullWidth />
                              </TableCell>
                              <TableCell>
                                <FormField name={`chargeDetails.${index}.hcValue`} control={control} type="number" disabled={viewOnly} size="small" fullWidth />
                              </TableCell>
                              <TableCell>
                                <FormField name={`chargeDetails.${index}.chValue`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                              </TableCell>
                              <TableCell>
                                <FormField
                                  name={`chargeDetails.${index}.chargeStatus`}
                                  control={control}
                                  type="select"
                                  disabled={viewOnly}
                                  size="small"
                                  fullWidth
                                  options={[
                                    { value: "Y", label: "Active" },
                                    { value: "N", label: "Inactive" },
                                  ]}
                                />
                              </TableCell>
                              {!viewOnly && (
                                <TableCell>
                                  <IconButton size="small" color="error" onClick={() => removeChargeDetail(index)} disabled={chargeDetailsFields.length <= 1}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Aliases Tab */}
              <TabPanel value={tabValue} index={2}>
                {/* <ChargeAlias chargeID={watch("chargeInfo.chargeID")} viewOnly={viewOnly} /> */}
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Charge Aliases</Typography>
                      {!viewOnly && <SmartButton text="Add Alias" icon={AddIcon} onClick={handleAddChargeAlias} variant="contained" color="primary" size="small" />}
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Patient Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Language Description</TableCell>
                            <TableCell>Status</TableCell>
                            {!viewOnly && <TableCell>Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {chargeAliasesFields.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={viewOnly ? 4 : 5} align="center">
                                <Typography variant="body2" color="textSecondary">
                                  No aliases added
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            chargeAliasesFields.map((field, index) => (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <FormField
                                    name={`chargeAliases.${index}.pTypeID`}
                                    control={control}
                                    type="select"
                                    disabled={viewOnly}
                                    size="small"
                                    fullWidth
                                    options={picOptions}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField name={`chargeAliases.${index}.chargeDesc`} control={control} type="text" required disabled={viewOnly} size="small" fullWidth />
                                </TableCell>
                                <TableCell>
                                  <FormField name={`chargeAliases.${index}.chargeDescLang`} control={control} type="text" disabled={viewOnly} size="small" fullWidth />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`chargeAliases.${index}.rActiveYN`}
                                    control={control}
                                    type="select"
                                    disabled={viewOnly}
                                    size="small"
                                    fullWidth
                                    options={[
                                      { value: "Y", label: "Active" },
                                      { value: "N", label: "Inactive" },
                                    ]}
                                  />
                                </TableCell>
                                {!viewOnly && (
                                  <TableCell>
                                    <IconButton size="small" color="error" onClick={() => removeChargeAlias(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Faculties Tab */}
              <TabPanel value={tabValue} index={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Charge Faculties</Typography>
                      {!viewOnly && <SmartButton text="Add Faculty" icon={AddIcon} onClick={handleAddChargeFaculty} variant="contained" color="primary" size="small" />}
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Faculty</TableCell>
                            <TableCell>Status</TableCell>
                            {!viewOnly && <TableCell>Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {chargeFacultiesFields.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={viewOnly ? 2 : 3} align="center">
                                <Typography variant="body2" color="textSecondary">
                                  No faculties added
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            chargeFacultiesFields.map((field, index) => (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <FormField
                                    name={`chargeFaculties.${index}.aSubID`}
                                    control={control}
                                    type="select"
                                    required
                                    disabled={viewOnly}
                                    size="small"
                                    fullWidth
                                    options={specialityOptions}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`chargeFaculties.${index}.rActiveYN`}
                                    control={control}
                                    type="select"
                                    disabled={viewOnly}
                                    size="small"
                                    fullWidth
                                    options={[
                                      { value: "Y", label: "Active" },
                                      { value: "N", label: "Inactive" },
                                    ]}
                                  />
                                </TableCell>
                                {!viewOnly && (
                                  <TableCell>
                                    <IconButton size="small" color="error" onClick={() => removeChargeFaculty(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Pack Details Tab (conditional) */}
              {chargeBreakYN === "Y" && (
                <TabPanel value={tabValue} index={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Charge Pack Details</Typography>
                        {!viewOnly && <SmartButton text="Add Pack Detail" icon={AddIcon} onClick={handleAddChargePackage} variant="contained" color="primary" size="small" />}
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Detail ID</TableCell>
                              <TableCell>Revision</TableCell>
                              <TableCell>DC Value</TableCell>
                              <TableCell>HC Value</TableCell>
                              <TableCell>CH Value</TableCell>
                              <TableCell>Status</TableCell>
                              {!viewOnly && <TableCell>Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {chargePackagesFields.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={viewOnly ? 6 : 7} align="center">
                                  <Typography variant="body2" color="textSecondary">
                                    No pack details added
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              chargePackagesFields.map((field, index) => (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField name={`chargePackages.${index}.chDetID`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField name={`chargePackages.${index}.chargeRevise`} control={control} type="text" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField name={`chargePackages.${index}.DcValue`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField name={`chargePackages.${index}.hcValue`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField name={`chargePackages.${index}.chValue`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      name={`chargePackages.${index}.chargeStatus`}
                                      control={control}
                                      type="select"
                                      disabled={viewOnly}
                                      size="small"
                                      fullWidth
                                      options={[
                                        { value: "Y", label: "Active" },
                                        { value: "N", label: "Inactive" },
                                      ]}
                                    />
                                  </TableCell>
                                  {!viewOnly && (
                                    <TableCell>
                                      <IconButton size="small" color="error" onClick={() => removeChargePackage(index)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </TabPanel>
              )}

              {/* Doctor Share Tab (conditional) */}
              {doctorShareYN === "Y" && (
                <TabPanel value={tabValue} index={5}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Doctor Share Details</Typography>
                        {!viewOnly && <SmartButton text="Add Doctor Share" icon={AddIcon} onClick={handleAddDoctorShare} variant="contained" color="primary" size="small" />}
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Doctor ID</TableCell>
                              <TableCell>Doctor Share %</TableCell>
                              <TableCell>Hospital Share %</TableCell>
                              <TableCell>Status</TableCell>
                              {!viewOnly && <TableCell>Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {doctorSharePerShareFields.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={viewOnly ? 4 : 5} align="center">
                                  <Typography variant="body2" color="textSecondary">
                                    No doctor shares added
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              doctorSharePerShareFields.map((field, index) => (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField name={`doctorSharePerShare.${index}.conID`} control={control} type="number" required disabled={viewOnly} size="small" fullWidth />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      name={`doctorSharePerShare.${index}.doctorShare`}
                                      control={control}
                                      type="number"
                                      required
                                      disabled={viewOnly}
                                      size="small"
                                      fullWidth
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      name={`doctorSharePerShare.${index}.hospShare`}
                                      control={control}
                                      type="number"
                                      required
                                      disabled={viewOnly}
                                      size="small"
                                      fullWidth
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      name={`doctorSharePerShare.${index}.rActiveYN`}
                                      control={control}
                                      type="select"
                                      disabled={viewOnly}
                                      size="small"
                                      fullWidth
                                      options={[
                                        { value: "Y", label: "Active" },
                                        { value: "N", label: "Inactive" },
                                      ]}
                                    />
                                  </TableCell>
                                  {!viewOnly && (
                                    <TableCell>
                                      <IconButton size="small" color="error" onClick={() => removeDoctorShare(index)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

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

      <ConfirmationDialog
        open={showCancelConfirmation}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />
    </FormProvider>
  );
};

export default ChargeDetailsForm;
