// src/pages/billing/ScheduleOfChargesPage/Components/ChargeFormDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Grid, Tabs, Tab, Paper, Divider, Chip, Stack, IconButton, Alert, Accordion, AccordionSummary, AccordionDetails, SelectChangeEvent } from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save as SaveIcon, Clear as ClearIcon, Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { ChargeWithAllDetailsDto, ChargeCodeGenerationDto, BChargePackDto } from "@/interfaces/Billing/ChargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useScheduleOfCharges } from "../hooks/useScheduleOfCharges";

// Enhanced schema for charge validation
const chargeSchema = z.object({
  chargeID: z.number().default(0),
  chargeCode: z.string().min(1, "Charge code is required"),
  chargeDesc: z.string().min(1, "Charge description is required"),
  chargesHDesc: z.string().optional(),
  chargeDescLang: z.string().optional(),
  cShortName: z.string().optional(),
  bChID: z.number().optional(),
  chargeType: z.string().min(1, "Charge type is required"),
  chargeTo: z.string().min(1, "Charge to is required"),
  chargeStatus: z.string().min(1, "Charge status is required"),
  chargeBreakYN: z.enum(["Y", "N"]).default("N"),
  regServiceYN: z.enum(["Y", "N"]).optional(),
  regDefaultServiceYN: z.enum(["Y", "N"]).optional(),
  isBedServiceYN: z.enum(["Y", "N"]).optional(),
  doctorShareYN: z.enum(["Y", "N"]).default("N"),
  cNhsCode: z.string().optional(),
  cNhsEnglishName: z.string().optional(),
  chargeCost: z.number().min(0).optional(),
  serviceGroupID: z.number().optional(),

  // Related entities
  ChargeDetails: z
    .array(
      z.object({
        chDetID: z.number().default(0),
        chargeID: z.number().default(0),
        pTypeID: z.number().min(1, "Patient type is required"),
        wCatID: z.number().min(1, "Ward category is required"),
        DcValue: z.number().min(0).optional(),
        hcValue: z.number().min(0).optional(),
        chValue: z.number().min(0, "Charge value is required"),
        chargeStatus: z.string().min(1, "Status is required"),
        ChargePacks: z
          .array(
            z.object({
              chPackID: z.number().default(0),
              chargeID: z.number().default(0),
              chDetID: z.number().optional(),
              chargeRevise: z.string().min(1, "Revision is required"),
              chargeStatus: z.string().min(1, "Status is required"),
              dcValue: z.number().min(0).optional(),
              hcValue: z.number().min(0).optional(),
              chValue: z.number().min(0, "Value is required"),
              effectiveFromDate: z.date().optional(),
              effectiveToDate: z.date().optional(),
            })
          )
          .default([]),
      })
    )
    .default([]),

  DoctorShares: z
    .array(
      z.object({
        docShareID: z.number().default(0),
        chargeID: z.number().default(0),
        conID: z.number().min(1, "Doctor is required"),
        doctorShare: z.number().min(0).max(100, "Share cannot exceed 100%"),
        hospShare: z.number().min(0).max(100, "Share cannot exceed 100%"),
      })
    )
    .default([]),

  ChargeAliases: z
    .array(
      z.object({
        chAliasID: z.number().default(0),
        chargeID: z.number().default(0),
        pTypeID: z.number().min(1, "Patient type is required"),
        chargeDesc: z.string().min(1, "Description is required"),
        chargeDescLang: z.string().min(1, "Language description is required"),
      })
    )
    .default([]),

  ChargeFaculties: z
    .array(
      z.object({
        chFacID: z.number().default(0),
        chargeID: z.number().default(0),
        aSubID: z.number().min(1, "Academic subject is required"),
      })
    )
    .default([]),

  ChargePacks: z
    .array(
      z.object({
        chPackID: z.number().default(0),
        chargeID: z.number().default(0),
        chDetID: z.number().optional(),
        chargeRevise: z.string().min(1, "Revision is required"),
        chargeStatus: z.string().min(1, "Status is required"),
        dcValue: z.number().min(0).optional(),
        hcValue: z.number().min(0).optional(),
        chValue: z.number().min(0, "Value is required"),
        effectiveFromDate: z.date().optional(),
        effectiveToDate: z.date().optional(),
      })
    )
    .default([]),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`charge-tabpanel-${index}`} aria-labelledby={`charge-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface ChargeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (charge: ChargeWithAllDetailsDto) => Promise<void>;
  charge: ChargeWithAllDetailsDto | null;
}

const ChargeFormDialog: React.FC<ChargeFormDialogProps> = ({ open, onClose, onSubmit, charge }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [doctorSharesExpanded, setDoctorSharesExpanded] = useState(false);
  const [aliasesExpanded, setAliasesExpanded] = useState(false);
  const [facultiesExpanded, setFacultiesExpanded] = useState(false);
  const [packsExpanded, setPacksExpanded] = useState(false);

  const isEditMode = !!charge && charge.chargeID > 0;
  const { generateChargeCode } = useScheduleOfCharges();

  // Load dropdown values
  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
    subModules = [],
  } = useDropdownValues(["serviceType", "serviceGroup", "pic", "bedCategory", "attendingPhy", "subModules"]);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<ChargeFormData>({
    resolver: zodResolver(chargeSchema),
    mode: "onChange",
    defaultValues: {
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      chargesHDesc: "",
      chargeDescLang: "",
      cShortName: "",
      bChID: 0,
      chargeType: "",
      chargeTo: "",
      chargeStatus: "AC",
      chargeBreakYN: "N",
      regServiceYN: "N",
      regDefaultServiceYN: "N",
      isBedServiceYN: "N",
      doctorShareYN: "N",
      cNhsCode: "",
      cNhsEnglishName: "",
      chargeCost: 0,
      serviceGroupID: 0,
      ChargeDetails: [],
      DoctorShares: [],
      ChargeAliases: [],
      ChargeFaculties: [],
      ChargePacks: [],
    },
  });

  // Field arrays for dynamic sections
  const chargeDetailsArray = useFieldArray({
    control,
    name: "ChargeDetails",
  });

  const doctorSharesArray = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const facultiesArray = useFieldArray({
    control,
    name: "ChargeFaculties",
  });

  const packsArray = useFieldArray({
    control,
    name: "ChargePacks",
  });

  // Watch values
  const watchedChargeType = watch("chargeType");
  const watchedChargeTo = watch("chargeTo");
  const watchedServiceGroupID = watch("serviceGroupID");
  const watchedDoctorShareYN = watch("doctorShareYN");

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (charge) {
        reset({
          chargeID: charge.chargeID,
          chargeCode: charge.chargeCode,
          chargeDesc: charge.chargeDesc,
          chargesHDesc: charge.chargesHDesc || "",
          chargeDescLang: charge.chargeDescLang || "",
          cShortName: charge.cShortName || "",
          bChID: charge.bChID || 0,
          chargeType: charge.chargeType,
          chargeTo: charge.chargeTo,
          chargeStatus: charge.chargeStatus,
          chargeBreakYN: charge.chargeBreakYN,
          regServiceYN: charge.regServiceYN || "N",
          regDefaultServiceYN: charge.regDefaultServiceYN || "N",
          isBedServiceYN: charge.isBedServiceYN || "N",
          doctorShareYN: charge.doctorShareYN || "N",
          cNhsCode: charge.cNhsCode || "",
          cNhsEnglishName: charge.cNhsEnglishName || "",
          chargeCost: charge.chargeCost || 0,
          serviceGroupID: charge.serviceGroupID || 0,
          ChargeDetails: charge.ChargeDetails || [],
          DoctorShares: charge.DoctorShares || [],
          ChargeAliases: charge.ChargeAliases || [],
          ChargeFaculties: charge.ChargeFaculties || [],
          ChargePacks: charge.ChargePacks || [],
        });

        // Expand sections that have data
        setDetailsExpanded(charge.ChargeDetails?.length > 0);
        setDoctorSharesExpanded(charge.DoctorShares?.length > 0);
        setAliasesExpanded(charge.ChargeAliases?.length > 0);
        setFacultiesExpanded(charge.ChargeFaculties?.length > 0);
        setPacksExpanded(charge.ChargePacks?.length > 0);
      } else {
        reset();
        setTabValue(0);
        setDetailsExpanded(false);
        setDoctorSharesExpanded(false);
        setAliasesExpanded(false);
        setFacultiesExpanded(false);
        setPacksExpanded(false);
      }
    }
  }, [open, charge, reset]);

  // Generate charge code
  const handleGenerateCode = useCallback(async () => {
    if (!watchedChargeType || !watchedChargeTo) {
      return;
    }

    try {
      setIsGeneratingCode(true);
      const codeData: ChargeCodeGenerationDto = {
        ChargeType: watchedChargeType,
        ChargeTo: watchedChargeTo,
        ServiceGroupId: watchedServiceGroupID > 0 ? watchedServiceGroupID : undefined,
      };

      const newCode = await generateChargeCode(codeData);
      setValue("chargeCode", newCode, { shouldValidate: true });
    } catch (error) {
      console.error("Error generating charge code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedChargeType, watchedChargeTo, watchedServiceGroupID, generateChargeCode, setValue]);

  // Auto-generate code when type or chargeTo changes (for new charges only)
  useEffect(() => {
    if (!isEditMode && watchedChargeType && watchedChargeTo) {
      handleGenerateCode();
    }
  }, [watchedChargeType, watchedChargeTo, isEditMode, handleGenerateCode]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Form submission
  const onFormSubmit = async (data: ChargeFormData) => {
    try {
      const formattedData: ChargeWithAllDetailsDto = {
        chargeID: data.chargeID,
        chargeCode: data.chargeCode,
        chargeDesc: data.chargeDesc,
        chargesHDesc: data.chargesHDesc,
        chargeDescLang: data.chargeDescLang,
        cShortName: data.cShortName,
        chargeType: data.chargeType,
        chargeTo: data.chargeTo,
        bChID: data.bChID,
        chargeStatus: data.chargeStatus,
        chargeBreakYN: data.chargeBreakYN,
        regServiceYN: data.regServiceYN,
        regDefaultServiceYN: data.regDefaultServiceYN,
        isBedServiceYN: data.isBedServiceYN,
        doctorShareYN: data.doctorShareYN,
        cNhsCode: data.cNhsCode,
        cNhsEnglishName: data.cNhsEnglishName,
        chargeCost: data.chargeCost,
        serviceGroupID: data.serviceGroupID,
        ChargeDetails: data.ChargeDetails.map((detail) => ({
          chDetID: detail.chDetID || 0,
          chargeID: data.chargeID,
          pTypeID: detail.pTypeID || 0,
          wCatID: detail.wCatID || 0,
          DcValue: detail.DcValue,
          hcValue: detail.hcValue,
          chValue: detail.chValue || 0,
          chargeStatus: detail.chargeStatus || "AC",
          ChargePacks: [] as BChargePackDto[],
        })),
        DoctorShares: data.DoctorShares.map((share) => ({
          docShareID: share.docShareID || 0,
          chargeID: data.chargeID,
          conID: share.conID || 0,
          doctorShare: share.doctorShare || 0,
          hospShare: share.hospShare || 0,
        })),
        ChargeAliases: data.ChargeAliases.map((alias) => ({
          chAliasID: alias.chAliasID || 0,
          chargeID: data.chargeID,
          pTypeID: alias.pTypeID || 0,
          chargeDesc: alias.chargeDesc || "",
          chargeDescLang: alias.chargeDescLang || "",
        })),
        ChargeFaculties: data.ChargeFaculties.map((faculty) => ({
          chFacID: faculty.chFacID || 0,
          chargeID: data.chargeID,
          aSubID: faculty.aSubID || 0,
        })),
        ChargePacks: data.ChargePacks.map((pack) => ({
          chPackID: pack.chPackID || 0,
          chargeID: data.chargeID,
          chDetID: pack.chDetID,
          chargeRevise: pack.chargeRevise || "",
          chargeStatus: pack.chargeStatus || "AC",
          dcValue: pack.dcValue,
          hcValue: pack.hcValue,
          chValue: pack.chValue || 0,
          effectiveFromDate: pack.effectiveFromDate,
          effectiveToDate: pack.effectiveToDate,
        })),
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error("Error submitting charge:", error);
    }
  };

  const handleClear = () => {
    if (isEditMode && charge) {
      reset(charge);
    } else {
      reset();
    }
  };

  // Add new charge detail
  const addChargeDetail = () => {
    chargeDetailsArray.append({
      chDetID: 0,
      chargeID: 0,
      pTypeID: 0,
      wCatID: 0,
      DcValue: 0,
      hcValue: 0,
      chValue: 0,
      chargeStatus: "AC",
    });
    setDetailsExpanded(true);
  };

  // Add new doctor share
  const addDoctorShare = () => {
    doctorSharesArray.append({
      docShareID: 0,
      chargeID: 0,
      conID: 0,
      doctorShare: 0,
      hospShare: 0,
    });
    setDoctorSharesExpanded(true);
  };

  // Add new alias
  const addAlias = () => {
    aliasesArray.append({
      chAliasID: 0,
      chargeID: 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "",
    });
    setAliasesExpanded(true);
  };

  // Add new faculty
  const addFaculty = () => {
    facultiesArray.append({
      chFacID: 0,
      chargeID: 0,
      aSubID: 0,
    });
    setFacultiesExpanded(true);
  };

  // Add new pack
  const addPack = () => {
    packsArray.append({
      chPackID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "AC",
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
    });
    setPacksExpanded(true);
  };

  const handleBChIDChange = useCallback(
    (value: any) => {
      const selectedOption = serviceType.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("bChID", Number(value), { shouldValidate: true });
        setValue("chargeType", selectedOption.label, { shouldValidate: true });
      }
    },
    [serviceType, setValue]
  );

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Charge" : "Create Charge"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Creating..."}
        successText={isEditMode ? "Updated!" : "Created!"}
      />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Charge" : "New Charge"}
      maxWidth="xl"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ width: "100%" }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Basic Charge Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeCode"
                  control={control}
                  type="text"
                  label="Charge Code"
                  required
                  disabled={isEditMode}
                  size="small"
                  helperText={isEditMode ? "Code cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated based on type"}
                  adornment={
                    !isEditMode && (
                      <CustomButton
                        size="small"
                        variant="outlined"
                        text="Generate"
                        onClick={handleGenerateCode}
                        disabled={!watchedChargeType || !watchedChargeTo || isGeneratingCode}
                      />
                    )
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="bChID" control={control} type="select" onChange={handleBChIDChange} label="Charge Type" required size="small" options={serviceType} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="chargeTo"
                  control={control}
                  type="select"
                  label="Charge To"
                  required
                  size="small"
                  options={[
                    { value: "PAT", label: "Patient" },
                    { value: "INS", label: "Insurance" },
                    { value: "GOVT", label: "Government" },
                    { value: "CORP", label: "Corporate" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="chargeDesc" control={control} type="text" label="Charge Name" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cShortName" control={control} type="text" label="Short Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="serviceGroupID" control={control} type="select" label="Service Group" size="small" options={serviceGroup} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargeCost" control={control} type="number" label="Charge Cost" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsCode" control={control} type="text" label="Resource Code" size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="cNhsEnglishName" control={control} type="text" label="Resource Name" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="scheduleDate" control={control} type="datepicker" label="Schedule Date" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="chargesHDesc" control={control} type="textarea" label="Charge Description" size="small" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Configuration Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="doctorShareYN" control={control} type="switch" label="Enable Doctor Share" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="regServiceYN" control={control} type="switch" label="Registration Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="isBedServiceYN" control={control} type="switch" label="Bed Service" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeBreakYN" control={control} type="switch" label="Charge Break" size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <EnhancedFormField name="chargeStatus" control={control} type="switch" label="Charge Status " size="small" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Related Configurations */}
          <Stack spacing={2}>
            {/* Charge Details */}
            <Accordion expanded={detailsExpanded} onChange={() => setDetailsExpanded(!detailsExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle1">Pricing Details</Typography>
                  <Chip label={`${chargeDetailsArray.fields.length} entries`} size="small" color="primary" variant="outlined" />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addChargeDetail();
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {chargeDetailsArray.fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">Pricing Detail #{index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => chargeDetailsArray.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargeDetails.${index}.pTypeID`} control={control} type="select" label="Patient Type" required size="small" options={pic} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField
                            name={`ChargeDetails.${index}.wCatID`}
                            control={control}
                            type="select"
                            label="Ward Category"
                            required
                            size="small"
                            options={bedCategory}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <EnhancedFormField name={`ChargeDetails.${index}.chValue`} control={control} type="number" label="Charge Value" required size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <EnhancedFormField name={`ChargeDetails.${index}.DcValue`} control={control} type="number" label="DC Value" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <EnhancedFormField
                            name={`ChargeDetails.${index}.chargeStatus`}
                            control={control}
                            type="select"
                            label="Status"
                            required
                            size="small"
                            options={[
                              { value: "Y", label: "Active" },
                              { value: "N", label: "Inactive" },
                            ]}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {chargeDetailsArray.fields.length === 0 && (
                    <Alert severity="info">No pricing details configured. Click the + button to add pricing for different patient types.</Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Doctor Shares */}
            {watchedDoctorShareYN === "Y" && (
              <Accordion expanded={doctorSharesExpanded} onChange={() => setDoctorSharesExpanded(!doctorSharesExpanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Typography variant="subtitle1">Doctor Revenue Sharing</Typography>
                    <Chip label={`${doctorSharesArray.fields.length} doctors`} size="small" color="success" variant="outlined" />
                    <Box sx={{ ml: "auto" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          addDoctorShare();
                        }}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {doctorSharesArray.fields.map((field, index) => (
                      <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                          <Typography variant="subtitle2">Doctor Share #{index + 1}</Typography>
                          <IconButton size="small" color="error" onClick={() => doctorSharesArray.remove(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <EnhancedFormField name={`DoctorShares.${index}.conID`} control={control} type="select" label="Doctor" required size="small" options={attendingPhy} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <EnhancedFormField name={`DoctorShares.${index}.doctorShare`} control={control} type="number" label="Doctor Share (%)" required size="small" />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <EnhancedFormField name={`DoctorShares.${index}.hospShare`} control={control} type="number" label="Hospital Share (%)" required size="small" />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    {doctorSharesArray.fields.length === 0 && <Alert severity="info">No doctor shares configured. Click the + button to add revenue sharing with doctors.</Alert>}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Charge Aliases */}
            <Accordion expanded={aliasesExpanded} onChange={() => setAliasesExpanded(!aliasesExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle1">Charge Aliases</Typography>
                  <Chip label={`${aliasesArray.fields.length} aliases`} size="small" color="info" variant="outlined" />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addAlias();
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {aliasesArray.fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">Alias #{index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => aliasesArray.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <EnhancedFormField name={`ChargeAliases.${index}.pTypeID`} control={control} type="select" label="Patient Type" required size="small" options={pic} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <EnhancedFormField
                            name={`ChargeAliases.${index}.chargeDesc`}
                            control={control}
                            type="text"
                            label="Alias Description"
                            required
                            size="small"
                            helperText="Alternative description for this patient type"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <EnhancedFormField
                            name={`ChargeAliases.${index}.chargeDescLang`}
                            control={control}
                            type="text"
                            label="Local Language Description"
                            required
                            size="small"
                            helperText="Description in local language"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {aliasesArray.fields.length === 0 && (
                    <Alert severity="info">No charge aliases configured. Click the + button to add alternative descriptions for different patient types or languages.</Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Faculties Section */}
            <Accordion expanded={facultiesExpanded} onChange={() => setFacultiesExpanded(!facultiesExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle1">Associated Faculties</Typography>
                  <Chip label={`${facultiesArray.fields.length} faculties`} size="small" color="secondary" variant="outlined" />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addFaculty();
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {facultiesArray.fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">Faculty #{index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => facultiesArray.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 12 }}>
                          <EnhancedFormField
                            name={`ChargeFaculties.${index}.aSubID`}
                            control={control}
                            type="select"
                            label="Academic Subject/Faculty"
                            required
                            size="small"
                            options={subModules}
                            helperText="Select the academic subject or faculty this charge is associated with"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {facultiesArray.fields.length === 0 && (
                    <Alert severity="info">No faculties associated. Click the + button to associate this charge with academic subjects or faculties.</Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Charge Packs Section */}
            <Accordion expanded={packsExpanded} onChange={() => setPacksExpanded(!packsExpanded)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  <Typography variant="subtitle1">Charge Packs</Typography>
                  <Chip label={`${packsArray.fields.length} packs`} size="small" color="warning" variant="outlined" />
                  <Box sx={{ ml: "auto" }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        addPack();
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {packsArray.fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">Pack #{index + 1}</Typography>
                        <IconButton size="small" color="error" onClick={() => packsArray.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField
                            name={`ChargePacks.${index}.chargeRevise`}
                            control={control}
                            type="text"
                            label="Revision"
                            required
                            size="small"
                            helperText="Pack revision identifier"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargePacks.${index}.chValue`} control={control} type="number" label="Pack Value" required size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargePacks.${index}.effectiveFromDate`} control={control} type="datepicker" label="Effective From" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargePacks.${index}.effectiveToDate`} control={control} type="datepicker" label="Effective To" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargePacks.${index}.dcValue`} control={control} type="number" label="DC Value" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <EnhancedFormField name={`ChargePacks.${index}.hcValue`} control={control} type="number" label="HC Value" size="small" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <EnhancedFormField
                            name={`ChargePacks.${index}.chargeStatus`}
                            control={control}
                            type="select"
                            label="Status"
                            required
                            size="small"
                            options={[
                              { value: "AC", label: "Active" },
                              { value: "IN", label: "Inactive" },
                            ]}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  {packsArray.fields.length === 0 && (
                    <Alert severity="info">No charge packs configured. Click the + button to add versioned charge packages with effective dates.</Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ChargeFormDialog;
