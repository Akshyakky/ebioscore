import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Grid, Paper, Divider, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save as SaveIcon, Clear as ClearIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { ChargeWithAllDetailsDto, ChargeCodeGenerationDto } from "@/interfaces/Billing/ChargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useScheduleOfCharges } from "../hooks/useScheduleOfCharges";
import PriceDetailsComponent from "./PriceDetailsComponent";
import DoctorSharesComponent from "./DoctorSharesComponent";
import ChargeAliasesComponent from "./ChargeAliasesComponent";
import AssociatedFacultiesComponent from "./AssociatedFacultiesComponent";
import ChargePacksComponent from "./ChargePacksComponent";

const chargeSchema = z.object({
  chargeID: z.number().default(0),
  chargeCode: z.string().min(1, "Charge code is required"),
  chargeDesc: z.string().min(1, "Charge description is required"),
  chargesHDesc: z.string().optional().nullable(),
  chargeDescLang: z.string().optional().nullable(),
  cShortName: z.string().optional().nullable(),
  bChID: z.number().nullable().optional(),
  chargeType: z.string().min(1, "Charge type is required"),
  chargeTo: z.string().min(1, "Charge to is required"),
  chargeStatus: z.string().default("AC"),
  chargeBreakYN: z.enum(["Y", "N"]).default("N"),
  regServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  regDefaultServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  isBedServiceYN: z.enum(["Y", "N"]).optional().default("N"),
  doctorShareYN: z.enum(["Y", "N"]).default("N"),
  cNhsCode: z.string().optional().nullable(),
  cNhsEnglishName: z.string().optional().nullable(),
  chargeCost: z.number().optional().nullable(),
  serviceGroupID: z.number().optional().nullable(),
  ChargeDetails: z.array(z.any()).optional().default([]),
  DoctorShares: z.array(z.any()).optional().default([]),
  ChargeAliases: z.array(z.any()).optional().default([]),
  ChargeFaculties: z.array(z.any()).optional().default([]),
  ChargePacks: z.array(z.any()).optional().default([]),
});

type ChargeFormData = z.infer<typeof chargeSchema>;

interface PricingGridItem {
  id: string;
  picId: number;
  picName: string;
  selected: boolean;
  wardCategories: {
    [key: string]: {
      drAmt: number;
      hospAmt: number;
      totAmt: number;
    };
  };
}

interface ChargeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (charge: ChargeWithAllDetailsDto) => Promise<void>;
  charge: ChargeWithAllDetailsDto | null;
}

const ChargeFormDialog: React.FC<ChargeFormDialogProps> = ({ open, onClose, onSubmit, charge }) => {
  const [, setTabValue] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [doctorSharesExpanded, setDoctorSharesExpanded] = useState(false);
  const [aliasesExpanded, setAliasesExpanded] = useState(false);
  const [facultiesExpanded, setFacultiesExpanded] = useState(false);
  const [packsExpanded, setPacksExpanded] = useState(false);
  const [formDebug, setFormDebug] = useState({ isValid: false, isDirty: false });
  const [pricingGridData, setPricingGridData] = useState<PricingGridItem[]>([]);
  const isEditMode = !!charge && charge.chargeID > 0;
  const { generateChargeCode } = useScheduleOfCharges();

  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
    subModules = [],
  } = useDropdownValues(["serviceType", "serviceGroup", "pic", "bedCategory", "attendingPhy", "subModules"]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
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
      bChID: null,
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
      serviceGroupID: null,
      ChargeDetails: [],
      DoctorShares: [],
      ChargeAliases: [],
      ChargeFaculties: [],
      ChargePacks: [],
    },
  });

  useEffect(() => {
    setFormDebug({ isValid, isDirty });
    if (process.env.NODE_ENV === "development") {
      // console log for debugging if needed
    }
  }, [isValid, isDirty, errors]);

  const watchedBChID = watch("bChID");
  const watchedChargeTo = watch("chargeTo");
  const watchedServiceGroupID = watch("serviceGroupID");
  const watchedDoctorShareYN = watch("doctorShareYN");

  const wardCategories = useMemo(
    () => [
      { id: 1, name: "OPD", color: "#4caf50" },
      { id: 2, name: "GENERAL WARD", color: "#f44336" },
      { id: 3, name: "SEMI SPECIAL", color: "#00bcd4" },
      { id: 4, name: "SPECIAL WARD AC", color: "#3f51b5" },
      { id: 5, name: "SPECIAL ROOM", color: "#4caf50" },
    ],
    []
  );

  useEffect(() => {
    if (open) {
      if (charge) {
        reset({
          chargeID: charge.chargeID || 0,
          chargeCode: charge.chargeCode || "",
          chargeDesc: charge.chargeDesc || "",
          chargesHDesc: charge.chargesHDesc || "",
          chargeDescLang: charge.chargeDescLang || "",
          cShortName: charge.cShortName || "",
          bChID: charge.bChID || null,
          chargeType: charge.chargeType || "",
          chargeTo: charge.chargeTo || "",
          chargeStatus: charge.chargeStatus || "AC",
          chargeBreakYN: charge.chargeBreakYN || "N",
          regServiceYN: charge.regServiceYN || "N",
          regDefaultServiceYN: charge.regDefaultServiceYN || "N",
          isBedServiceYN: charge.isBedServiceYN || "N",
          doctorShareYN: charge.doctorShareYN || "N",
          cNhsCode: charge.cNhsCode || "",
          cNhsEnglishName: charge.cNhsEnglishName || "",
          chargeCost: charge.chargeCost || 0,
          serviceGroupID: charge.serviceGroupID || null,
          ChargeDetails: charge.ChargeDetails || [],
          DoctorShares: charge.DoctorShares || [],
          ChargeAliases: charge.ChargeAliases || [],
          ChargeFaculties: charge.ChargeFaculties || [],
          ChargePacks: charge.ChargePacks || [],
        });
        initializeGridData(charge.ChargeDetails);
        setDetailsExpanded(charge.ChargeDetails?.length > 0);
        setDoctorSharesExpanded(charge.DoctorShares?.length > 0);
        setAliasesExpanded(charge.ChargeAliases?.length > 0);
        setFacultiesExpanded(charge.ChargeFaculties?.length > 0);
        setPacksExpanded(charge.ChargePacks?.length > 0);
      } else {
        reset({
          chargeID: 0,
          chargeCode: "",
          chargeDesc: "",
          chargesHDesc: "",
          chargeDescLang: "",
          cShortName: "",
          bChID: null,
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
          serviceGroupID: null,
          ChargeDetails: [],
          DoctorShares: [],
          ChargeAliases: [],
          ChargeFaculties: [],
          ChargePacks: [],
        });
        setTabValue(0);
        setDetailsExpanded(false);
        setDoctorSharesExpanded(false);
        setAliasesExpanded(false);
        setFacultiesExpanded(false);
        setPacksExpanded(false);
        initializeGridData([]);
      }
    }
  }, [open, charge, reset, trigger]);

  const initializeGridData = (chargeDetails: any[] = []) => {
    const patientGroups: Record<number, any[]> = {};
    if (chargeDetails && chargeDetails.length > 0) {
      chargeDetails.forEach((detail) => {
        if (!patientGroups[detail.pTypeID]) {
          patientGroups[detail.pTypeID] = [];
        }
        patientGroups[detail.pTypeID].push(detail);
      });
    }
    const gridData: PricingGridItem[] = [];
    const patientTypes = Object.keys(patientGroups).length > 0 ? Object.keys(patientGroups).map(Number) : pic.slice(0, 5).map((p) => Number(p.value));
    patientTypes.forEach((patientTypeId) => {
      const patientType = pic.find((p) => Number(p.value) === patientTypeId);
      const details = patientGroups[patientTypeId] || [];
      const wardCategoriesData: Record<string, any> = {};
      wardCategories.forEach((wc) => {
        wardCategoriesData[wc.name] = {
          drAmt: 0,
          hospAmt: 0,
          totAmt: 0,
        };
      });
      details.forEach((detail) => {
        const wardCategory = bedCategory.find((wc) => Number(wc.value) === detail.wCatID);
        const wcName = wardCategory?.label || getWardCategoryById(detail.wCatID);
        if (wcName) {
          wardCategoriesData[wcName] = {
            drAmt: detail.DcValue || 0,
            hospAmt: detail.hcValue || 0,
            totAmt: detail.chValue || 0,
          };
        }
      });

      gridData.push({
        id: `pic-${patientTypeId}`,
        picId: patientTypeId,
        picName: patientType?.label || `Patient Type ${patientTypeId}`,
        selected: false,
        wardCategories: wardCategoriesData,
      });
    });

    setPricingGridData(gridData);
  };

  const getWardCategoryById = (id: number): string => {
    const category = wardCategories.find((wc) => wc.id === id);
    if (category) return category.name;
    const bedCat = bedCategory.find((bc) => Number(bc.value) === id);
    return (bedCat?.label as string) || `Ward Category ${id}`;
  };

  const getWardCategoryIdByName = (name: string): number => {
    const category = wardCategories.find((wc) => wc.name === name);
    if (category) return category.id;

    const bedCat = bedCategory.find((bc) => bc.label === name);
    return bedCat ? Number(bedCat.value) : 0;
  };

  const updateChargeDetailsFromGrid = useCallback(() => {
    const chargeDetailsArray = [];

    for (const row of pricingGridData) {
      for (const [wcName, values] of Object.entries(row.wardCategories)) {
        if (values.drAmt === 0 && values.hospAmt === 0 && values.totAmt === 0) {
          continue;
        }
        const wcId = getWardCategoryIdByName(wcName);
        if (wcId) {
          chargeDetailsArray.push({
            chDetID: 0,
            chargeID: 0,
            pTypeID: row.picId,
            wCatID: wcId,
            DcValue: values.drAmt,
            hcValue: values.hospAmt,
            chValue: values.totAmt,
            chargeStatus: "AC",
            ChargePacks: [],
          });
        }
      }
    }

    setValue("ChargeDetails", chargeDetailsArray, { shouldValidate: true });
  }, [pricingGridData, setValue, getWardCategoryIdByName]);

  const handleGenerateCode = useCallback(async () => {
    if (!watchedBChID || !watchedChargeTo) {
      return;
    }
    try {
      setIsGeneratingCode(true);
      const selectedOption = serviceType.find((option) => Number(option.value) === Number(watchedBChID));
      const chargeTypeLabel = selectedOption?.label || "";
      const codeData: ChargeCodeGenerationDto = {
        ChargeType: chargeTypeLabel,
        ChargeTo: watchedChargeTo,
        ServiceGroupId: watchedServiceGroupID > 0 ? watchedServiceGroupID : undefined,
      };
      const newCode = await generateChargeCode(codeData);
      setValue("chargeCode", newCode, { shouldValidate: true, shouldDirty: true });
      if (selectedOption) {
        setValue("chargeType", selectedOption.label, { shouldValidate: true, shouldDirty: true });
      }
      trigger();
    } catch (error) {
      // Error handling would go here
    } finally {
      setIsGeneratingCode(false);
    }
  }, [watchedBChID, watchedChargeTo, watchedServiceGroupID, generateChargeCode, setValue, serviceType, trigger]);

  useEffect(() => {
    if (!isEditMode && watchedBChID && watchedChargeTo) {
      handleGenerateCode();
    }
  }, [watchedBChID, watchedChargeTo, isEditMode, handleGenerateCode]);

  const handleBChIDChange = useCallback(
    (value: any) => {
      const selectedOption = serviceType.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("bChID", Number(value), { shouldValidate: true, shouldDirty: true });
        setValue("chargeType", selectedOption.label, { shouldValidate: true, shouldDirty: true });
        trigger();
      }
    },
    [serviceType, setValue, trigger]
  );

  const onFormSubmit = async (data: ChargeFormData) => {
    try {
      updateChargeDetailsFromGrid();
      const formattedData: ChargeWithAllDetailsDto = {
        chargeID: data.chargeID || 0,
        chargeCode: data.chargeCode,
        chargeDesc: data.chargeDesc,
        chargesHDesc: data.chargesHDesc || "",
        chargeDescLang: data.chargeDescLang || "",
        cShortName: data.cShortName || "",
        chargeType: data.chargeType,
        chargeTo: data.chargeTo,
        bChID: data.bChID || 0,
        chargeStatus: data.chargeStatus || "AC",
        chargeBreakYN: data.chargeBreakYN || "N",
        regServiceYN: data.regServiceYN || "N",
        regDefaultServiceYN: data.regDefaultServiceYN || "N",
        isBedServiceYN: data.isBedServiceYN || "N",
        doctorShareYN: data.doctorShareYN || "N",
        cNhsCode: data.cNhsCode || "",
        cNhsEnglishName: data.cNhsEnglishName || "",
        chargeCost: data.chargeCost || 0,
        serviceGroupID: data.serviceGroupID || 0,
        ChargeDetails:
          data.ChargeDetails?.map((detail) => ({
            chDetID: detail.chDetID || 0,
            chargeID: data.chargeID || 0,
            pTypeID: detail.pTypeID,
            wCatID: detail.wCatID,
            DcValue: detail.DcValue || 0,
            hcValue: detail.hcValue || 0,
            chValue: detail.chValue,
            chargeStatus: detail.chargeStatus || "AC",
            ChargePacks: (detail.ChargePacks || []).map((pack) => ({
              chPackID: pack.chPackID || 0,
              chargeID: pack.chargeID || data.chargeID || 0,
              chDetID: pack.chDetID || detail.chDetID || 0,
              chargeRevise: pack.chargeRevise || "",
              chargeStatus: pack.chargeStatus || "AC",
              dcValue: pack.dcValue || 0,
              hcValue: pack.hcValue || 0,
              chValue: pack.chValue || 0,
              effectiveFromDate: pack.effectiveFromDate,
              effectiveToDate: pack.effectiveToDate,
            })),
          })) || [],
        DoctorShares:
          data.DoctorShares?.map((share) => ({
            docShareID: share.docShareID || 0,
            chargeID: data.chargeID || 0,
            conID: share.conID,
            doctorShare: share.doctorShare,
            hospShare: share.hospShare,
          })) || [],
        ChargeAliases:
          data.ChargeAliases?.map((alias) => ({
            chAliasID: alias.chAliasID || 0,
            chargeID: data.chargeID || 0,
            pTypeID: alias.pTypeID,
            chargeDesc: alias.chargeDesc,
            chargeDescLang: alias.chargeDescLang,
          })) || [],
        ChargeFaculties:
          data.ChargeFaculties?.map((faculty) => ({
            chFacID: faculty.chFacID || 0,
            chargeID: data.chargeID || 0,
            aSubID: faculty.aSubID,
          })) || [],
        ChargePacks:
          data.ChargePacks?.map((pack) => ({
            chPackID: pack.chPackID || 0,
            chargeID: data.chargeID || 0,
            chDetID: pack.chDetID,
            chargeRevise: pack.chargeRevise,
            chargeStatus: pack.chargeStatus || "AC",
            dcValue: pack.dcValue || 0,
            hcValue: pack.hcValue || 0,
            chValue: pack.chValue || 0,
            effectiveFromDate: pack.effectiveFromDate,
            effectiveToDate: pack.effectiveToDate,
          })) || [],
      };
      await onSubmit(formattedData);
    } catch (error) {
      // Error handling would go here
    }
  };

  const handleClear = () => {
    if (isEditMode && charge) {
      reset({
        chargeID: charge.chargeID || 0,
        chargeCode: charge.chargeCode || "",
        chargeDesc: charge.chargeDesc || "",
        chargesHDesc: charge.chargesHDesc || "",
        chargeDescLang: charge.chargeDescLang || "",
        cShortName: charge.cShortName || "",
        bChID: charge.bChID || null,
        chargeType: charge.chargeType || "",
        chargeTo: charge.chargeTo || "",
        chargeStatus: charge.chargeStatus || "AC",
        chargeBreakYN: charge.chargeBreakYN || "N",
        regServiceYN: charge.regServiceYN || "N",
        regDefaultServiceYN: charge.regDefaultServiceYN || "N",
        isBedServiceYN: charge.isBedServiceYN || "N",
        doctorShareYN: charge.doctorShareYN || "N",
        cNhsCode: charge.cNhsCode || "",
        cNhsEnglishName: charge.cNhsEnglishName || "",
        chargeCost: charge.chargeCost || 0,
        serviceGroupID: charge.serviceGroupID || null,
        ChargeDetails: charge.ChargeDetails || [],
        DoctorShares: charge.DoctorShares || [],
        ChargeAliases: charge.ChargeAliases || [],
        ChargeFaculties: charge.ChargeFaculties || [],
        ChargePacks: charge.ChargePacks || [],
      });
      initializeGridData(charge.ChargeDetails);
    } else {
      reset({
        chargeID: 0,
        chargeCode: "",
        chargeDesc: "",
        chargesHDesc: "",
        chargeDescLang: "",
        cShortName: "",
        bChID: null,
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
        serviceGroupID: null,
        ChargeDetails: [],
        DoctorShares: [],
        ChargeAliases: [],
        ChargeFaculties: [],
        ChargePacks: [],
      });
      initializeGridData([]);
    }
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={isEditMode ? "Reset" : "Clear"} icon={ClearIcon} onClick={handleClear} disabled={isSubmitting} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Charge" : "Create Charge"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={isSubmitting}
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
        {process.env.NODE_ENV === "development" && (
          <Paper sx={{ p: 1, mb: 2, bgcolor: "#f5f5f5" }}>
            <Typography variant="caption">
              Form Debug: isValid={formDebug.isValid.toString()}, isDirty={formDebug.isDirty.toString()}
            </Typography>
            {Object.entries(errors).length > 0 && (
              <Typography variant="caption" color="error">
                Errors: {JSON.stringify(errors)}
              </Typography>
            )}
          </Paper>
        )}

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
                      <CustomButton size="small" variant="outlined" text="Generate" onClick={handleGenerateCode} disabled={!watchedBChID || !watchedChargeTo || isGeneratingCode} />
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
                <EnhancedFormField name="chargeCost" control={control} type="number" label="Charge Cost" size="small" />
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
                    <EnhancedFormField name="chargeStatus" control={control} type="switch" label="Charge Status" size="small" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Price Details Component */}
          <PriceDetailsComponent
            control={control}
            expanded={detailsExpanded}
            onToggleExpand={() => setDetailsExpanded(!detailsExpanded)}
            pricingGridData={pricingGridData}
            setPricingGridData={setPricingGridData}
            updateChargeDetailsFromGrid={updateChargeDetailsFromGrid}
            wardCategories={wardCategories}
            pic={pic}
            bedCategory={bedCategory}
          />

          {/* Doctor Shares Component */}
          <DoctorSharesComponent
            control={control}
            expanded={doctorSharesExpanded}
            onToggleExpand={() => setDoctorSharesExpanded(!doctorSharesExpanded)}
            attendingPhy={attendingPhy}
            doctorShareEnabled={watchedDoctorShareYN === "Y"}
          />

          {/* Charge Aliases Component */}
          <ChargeAliasesComponent control={control} expanded={aliasesExpanded} onToggleExpand={() => setAliasesExpanded(!aliasesExpanded)} pic={pic} />

          {/* Associated Faculties Component */}
          <AssociatedFacultiesComponent control={control} expanded={facultiesExpanded} onToggleExpand={() => setFacultiesExpanded(!facultiesExpanded)} subModules={subModules} />

          {/* Charge Packs Component */}
          <ChargePacksComponent control={control} expanded={packsExpanded} onToggleExpand={() => setPacksExpanded(!packsExpanded)} />
        </form>
      </Box>
    </GenericDialog>
  );
};

export default ChargeFormDialog;
