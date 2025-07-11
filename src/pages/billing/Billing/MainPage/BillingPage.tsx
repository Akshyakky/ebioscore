import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { BChargeDto } from "@/interfaces/Billing/BChargeDetails";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { GetPatientAllVisitHistory } from "@/interfaces/PatientAdministration/revisitFormData";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import PatientVisitDialog from "@/pages/patientAdministration/RevisitPage/SubPage/PatientVisitDialog";
import { useAlert } from "@/providers/AlertProvider";
import { bChargeService, billingService } from "@/services/BillingServices/BillingService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Delete as DeleteIcon, Edit as EditIcon, History as HistoryIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useBilling } from "../hooks/useBilling";

// Schema definitions (keeping the same)
const BillServicesDtoSchema = z.object({
  billDetID: z.number().default(0),
  billID: z.number().default(0),
  chargeDt: z.union([z.date(), z.string()]).default(new Date()),
  chargeID: z.number(),
  chargeCode: z.string().default(""),
  chargeDesc: z.string().default(""),
  chargeDescLang: z.string().optional(),
  cHValue: z.number().default(0),
  chUnits: z.number().optional().default(1),
  chDisc: z.number().optional().default(0),
  actualDDValue: z.number().optional().default(0),
  actualHCValue: z.number().optional().default(0),
  dCValue: z.number().optional().default(0),
  drPercShare: z.number().optional().default(0),
  dValDisc: z.number().optional().default(0),
  hCValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  physicianID: z.number().optional(),
  PhysicianName: z.string().optional(),
  sGRPID: z.number().optional(),
  sGRPName: z.string().optional(),
  opipNo: z.number().optional(),
  bCHID: z.number(),
  bCHName: z.string().default(""),
  physicianYN: z.string().default("N"),
  nHSXessAmt: z.number().optional().default(0),
  actualAmt: z.number().optional().default(0),
  procedureID: z.number().optional(),
  procedureName: z.string().optional(),
  chargeCost: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
});

const BillProductsDtoSchema = z.object({
  billDetID: z.number().default(0),
  billID: z.number().default(0),
  productID: z.number(),
  batchNo: z.string().optional(),
  expiryDate: z.union([z.date(), z.string()]).optional(),
  grnDetID: z.number().optional(),
  deptID: z.number(),
  deptName: z.string().default(""),
  cHValue: z.number().default(0),
  chUnits: z.number().optional().default(1),
  chDisc: z.number().optional().default(0),
  actualDDValue: z.number().optional().default(0),
  actualHCValue: z.number().optional().default(0),
  dCValue: z.number().optional().default(0),
  drPercShare: z.number().optional().default(0),
  dValDisc: z.number().optional().default(0),
  hCValue: z.number().optional().default(0),
  hospPercShare: z.number().optional().default(0),
  hValDisc: z.number().optional().default(0),
  packID: z.number().optional(),
  packName: z.string().optional(),
  opipNo: z.number().optional(),
  physicianYN: z.string().default("N"),
  actualAmt: z.number().optional().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional(),
});

// Add this to your schema definition
const schema = z.object({
  pChartID: z.number().min(1, "Patient selection is required"),
  pChartCode: z.string().default(""),
  pFName: z.string().default(""),
  pLName: z.string().optional().default(""),
  pMName: z.string().optional().default(""),
  pTitle: z.string().optional().default(""),
  billID: z.number().default(0),
  billCode: z.string().default(""),
  billDate: z.date().default(new Date()),
  pTypeID: z.number().min(1, "Payment source is required"),
  pTypeName: z.string().default(""),
  pTypeCode: z.string().optional().default(""),
  patOPIP: z.enum(["O", "I"]).default("O"),
  billStatus: z.enum(["A", "C", "D"]).default("A"),
  physicianID: z.number().optional(),
  physicianName: z.string().optional(),
  referralID: z.number().optional(),
  referralName: z.string().optional(),
  referral2ID: z.number().optional(),
  referralName2: z.string().optional(),
  billMisc: z.string().optional().default(""),
  admitID: z.number().default(0),
  opipCaseNo: z.number().default(0),
  opIPNo: z.number().default(0),
  disapprovedEmpID: z.number().optional(),
  disapproveEmpName: z.string().optional(),
  groupDisc: z.number().optional().default(0),
  langType: z.string().optional(),
  patMemID: z.number().optional(),
  patMemName: z.string().optional(),
  pckAmount: z.number().optional(),
  pckCode: z.string().optional(),
  pckID: z.number().optional(),
  pckName: z.string().optional(),
  strProfitOrLoss: z.string().optional(),
  profitOrLoss: z.number().optional(),
  sourceID: z.number().default(0),
  source: z.string().optional(),
  oldPChartID: z.number().default(0),
  drBillID: z.number().default(0),
  billGrossAmt: z.number().default(0),
  billDiscAmt: z.number().default(0),
  visitReferenceCode: z.string().optional().default(""), // Add this field to store visit reference
  billServices: z.array(BillServicesDtoSchema).default([]),
  billProducts: z.array(BillProductsDtoSchema).default([]),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().optional().default("N"),
  rNotes: z.string().optional().default(""),
});

type BillingFormData = z.infer<typeof schema>;

const BillingPage: React.FC = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isChangingVisit, setIsChangingVisit] = useState(false); // New state for changing visit
  const [formError, setFormError] = useState<string | null>(null);
  const dropdownValues = useDropdownValues(["pic"]);
  const [services, setServices] = useState<BChargeDto[]>([]);
  //   const { contacts: physicians } = useContactMastByCategory({ consValue: "PHY" });
  //   const { contacts: referals } = useContactMastByCategory({ consValue: "REF" });
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<BChargeDto | null>(null);
  const { calculateServiceDiscountAmount, calculateServiceNetAmount, calculateDiscountFromPercent, calculateServicesTotal } = useBilling();

  const physicians = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];
  const referals = [
    { value: 1, label: "Dr. Ajeesh" },
    { value: 2, label: "Dr. Akash" },
  ];

  const defaultValues: BillingFormData = {
    pChartID: 0,
    pChartCode: "",
    pFName: "",
    pLName: "",
    pMName: "",
    pTitle: "",
    billID: 0,
    billCode: "",
    billDate: new Date(),
    pTypeID: 0,
    pTypeName: "",
    pTypeCode: "",
    patOPIP: "O",
    billStatus: "A",
    physicianID: undefined,
    physicianName: undefined,
    referralID: undefined,
    referralName: undefined,
    referral2ID: undefined,
    referralName2: undefined,
    billMisc: "",
    admitID: 0,
    opipCaseNo: 0,
    opIPNo: 0,
    disapprovedEmpID: undefined,
    disapproveEmpName: undefined,
    groupDisc: 0,
    langType: undefined,
    patMemID: undefined,
    patMemName: undefined,
    pckAmount: undefined,
    pckCode: undefined,
    pckID: undefined,
    pckName: undefined,
    strProfitOrLoss: undefined,
    profitOrLoss: undefined,
    sourceID: 0,
    source: undefined,
    oldPChartID: 0,
    drBillID: 0,
    transferYN: "N",
    billGrossAmt: 0,
    billDiscAmt: 0,
    visitReferenceCode: "",
    billServices: [],
    billProducts: [],
    rActiveYN: "Y",
    rNotes: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isDirty, isValid },
  } = useForm<BillingFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    update: updateService,
  } = useFieldArray({
    control,
    name: "billServices",
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "billProducts",
  });
  console.log(productFields, appendProduct, removeProduct);
  const watchedBillServices = watch("billServices");
  const watchedBillProducts = watch("billProducts");
  const watchedVisitReference = watch("visitReferenceCode");
  const watchedGroupDisc = watch("groupDisc");

  // Calculate total amounts whenever services or products change
  useEffect(() => {
    let totalGrossAmount = 0;
    let totalDiscountAmount = 0;

    // Calculate services totals
    watchedBillServices.forEach((service) => {
      const quantity = service.chUnits || 1;
      const drAmt = service.dCValue || 0;
      const hospAmt = service.hCValue || 0;
      const drDiscAmt = service.dValDisc || 0;
      const hospDiscAmt = service.hValDisc || 0;

      const grossAmount = quantity * (drAmt + hospAmt);
      const discountAmount = drDiscAmt + hospDiscAmt;

      totalGrossAmount += grossAmount;
      totalDiscountAmount += discountAmount;
    });

    // Calculate products totals (similar logic)
    watchedBillProducts.forEach((product) => {
      const quantity = product.chUnits || 1;
      const drAmt = product.dCValue || 0;
      const hospAmt = product.hCValue || 0;
      const drDiscAmt = product.dValDisc || 0;
      const hospDiscAmt = product.hValDisc || 0;

      const grossAmount = quantity * (drAmt + hospAmt);
      const discountAmount = drDiscAmt + hospDiscAmt;

      totalGrossAmount += grossAmount;
      totalDiscountAmount += discountAmount;
    });

    setValue("billGrossAmt", totalGrossAmount);
    setValue("billDiscAmt", totalDiscountAmount);
  }, [watchedBillServices, watchedBillProducts, setValue]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await bChargeService.getAll();
        setServices(response.data as unknown as BChargeDto[]);
      } catch (error) {
        showAlert("Error", "Failed to load services", "error");
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [showAlert]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm || !services) return [];

    const searchLower = serviceSearchTerm.toLowerCase();
    return services.filter(
      (service) =>
        service.chargeCode.toLowerCase().includes(searchLower) ||
        service.chargeDesc.toLowerCase().includes(searchLower) ||
        (service.cShortName && service.cShortName.toLowerCase().includes(searchLower))
    );
  }, [serviceSearchTerm, services]);

  const handlePatientSelect = useCallback(
    (patientResult: PatientSearchResult) => {
      if (patientResult && patientResult.pChartID) {
        setSelectedPatient(patientResult);
        setSelectedPChartID(patientResult.pChartID);

        setValue("pChartID", patientResult.pChartID, { shouldValidate: true });
        setValue("pChartCode", patientResult.pChartCode || "", { shouldValidate: true });
        setValue("pFName", patientResult.fullName?.split(" ")[0] || "", { shouldValidate: true });
        setValue("pLName", patientResult.fullName?.split(" ")[1] || "", { shouldValidate: true });

        // Clear visit reference when selecting a new patient
        setValue("visitReferenceCode", "", { shouldValidate: true });
        setValue("billMisc", "", { shouldValidate: true });

        setIsHistoryDialogOpen(true);
        setIsChangingVisit(false);
      }
    },
    [setValue]
  );

  const handleCloseHistoryDialog = useCallback(() => {
    setIsHistoryDialogOpen(false);
    setIsChangingVisit(false);
  }, []);

  // Handle service selection from autocomplete
  const handleServiceSelect = useCallback(
    async (service: BChargeDto | null) => {
      if (service) {
        const response = await billingService.getBillingServiceById(service.chargeID);
        appendService(response.data);
        setSelectedService(null);
        setServiceSearchTerm("");
        showAlert("Success", `Service "${service.chargeDesc}" added`, "success");
      }
    },
    [appendService, showAlert]
  );

  // Handle field changes with automatic calculations
  const handleServiceFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const currentService = watchedBillServices[index];
      const updatedService = { ...currentService };

      // Update the changed field
      updatedService[field] = value;

      // Recalculate based on what changed
      const quantity = updatedService.chUnits || 1;
      const drAmt = updatedService.dCValue || 0;
      const hospAmt = updatedService.hCValue || 0;
      const drDiscPerc = updatedService.drPercShare || 0;
      const hospDiscPerc = updatedService.hospPercShare || 0;

      // Calculate discount amounts based on percentages
      if (field === "drPercShare" || field === "dCValue" || field === "chUnits") {
        updatedService.dValDisc = calculateDiscountFromPercent(drAmt * quantity, drDiscPerc);
      }

      if (field === "hospPercShare" || field === "hCValue" || field === "chUnits") {
        updatedService.hValDisc = calculateDiscountFromPercent(hospAmt * quantity, hospDiscPerc);
      }

      // Calculate gross amount
      updatedService.cHValue = drAmt + hospAmt;

      updateService(index, updatedService);
    },
    [watchedBillServices, updateService, calculateDiscountFromPercent]
  );

  const onSubmit = async (data: BillingFormData) => {
    try {
      setLoading(true);

      // Prepare bill save request
      const billSaveRequest = {
        bill: {
          billID: data.billID,
          billCode: data.billCode,
          billDate: data.billDate,
          pChartID: data.pChartID,
          pTypeID: data.pTypeID,
          pTypeCode: data.pTypeCode,
          pTitle: data.pTitle,
          patOPIP: data.patOPIP,
          pTypeName: data.pTypeName,
          billGrossAmt: data.billGrossAmt,
          billDiscAmt: data.billDiscAmt,
          billStatus: data.billStatus,
          physicianID: data.physicianID,
          physicianName: data.physicianName,
          referralID: data.referralID,
          referralName: data.referralName,
          referral2ID: data.referral2ID,
          referralName2: data.referralName2,
          billMisc: data.billMisc,
          admitID: data.admitID,
          opipCaseNo: data.opipCaseNo,
          opIPNo: data.opIPNo,
          groupDisc: data.groupDisc,
          pckAmount: data.pckAmount,
          pckCode: data.pckCode,
          pckID: data.pckID,
          pckName: data.pckName,
          sourceID: data.sourceID,
          source: data.source,
          pFName: data.pFName,
          pLName: data.pLName,
          pMName: data.pMName,
          oldPChartID: data.oldPChartID,
          drBillID: data.drBillID,
          rActiveYN: data.rActiveYN,
          transferYN: data.transferYN,
          rNotes: data.rNotes,
        },
        billServices: data.billServices,
        billProducts: data.billProducts,
      };

      // TODO: Call your billing service here
      console.log("Bill Save Request:", billSaveRequest);

      showAlert("Success", "Bill saved successfully", "success");
      performReset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save bill";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(defaultValues);
    setFormError(null);
    setSelectedPChartID(0);
    setSelectedPatient(null);
    setClearSearchTrigger((prev) => prev + 1);
    setServiceSearchTerm("");
    setSelectedService(null);
  };

  // Add this function in BillingPage
  const handleVisitSelect = useCallback(
    (visit: GetPatientAllVisitHistory) => {
      setValue("patOPIP", visit.patOPIP as "O" | "I", { shouldValidate: true });
      setValue("visitReferenceCode", visit.opNumber || "", { shouldValidate: true });
      setValue("billMisc", `Visit Ref: ${visit.opNumber}`, { shouldValidate: true });
      trigger();
      showAlert("Success", `Visit ${visit.opNumber} selected`, "success");
      console.log("visit", visit);
    },
    [setValue, trigger, showAlert]
  );

  // New function to handle changing visit
  const handleChangeVisit = useCallback(() => {
    if (selectedPChartID > 0) {
      setIsChangingVisit(true);
      setIsHistoryDialogOpen(true);
    }
  }, [selectedPChartID]);

  // Calculate final bill amount
  const calculateFinalBillAmount = useMemo(() => {
    const grossAmount = watch("billGrossAmt");
    const discountAmount = watch("billDiscAmt");
    const groupDiscountPerc = watchedGroupDisc || 0;

    // Apply group discount on the net amount after individual discounts
    const netAfterDiscount = grossAmount - discountAmount;
    const groupDiscountAmount = calculateDiscountFromPercent(netAfterDiscount, groupDiscountPerc);

    return netAfterDiscount - groupDiscountAmount;
  }, [watch("billGrossAmt"), watch("billDiscAmt"), watchedGroupDisc, calculateDiscountFromPercent]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Main Form */}
      <Paper sx={{ p: 2 }}>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Patient Information Section */}
            <Grid size={{ sm: 8 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <PatientSearch
                        onPatientSelect={handlePatientSelect}
                        clearTrigger={clearSearchTrigger}
                        placeholder="Enter name, UHID or phone number"
                        disabled={selectedPChartID > 0}
                      />
                    </Grid>
                  </Grid>

                  {selectedPChartID > 0 && (
                    <Box mt={2}>
                      <PatientDemographics pChartID={selectedPChartID} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Visit Reference Section - New */}
            <Grid size={{ sm: 4 }}>
              {watchedVisitReference && (
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6">Selected Visit</Typography>
                      </Box>
                      <Tooltip title="Change Visit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleChangeVisit}
                          sx={{
                            bgcolor: "rgba(25, 118, 210, 0.08)",
                            "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        Reference Code:
                      </Typography>
                      <Chip label={watchedVisitReference} color="primary" variant="outlined" size="medium" />
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Bill Details Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bill Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="pTypeID"
                        control={control}
                        label="Payment Source [PIC]"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.pic || []}
                        defaultText="Select Payment Source"
                        onChange={(data: any) => {
                          // Handle the enhanced onChange that returns {label, value, originalEvent}
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("pTypeName", data.label || "", { shouldDirty: true });
                            setValue("pTypeCode", data.value?.toString() || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="referralID"
                        control={control}
                        label="Primary Introducing Source"
                        type="select"
                        size="small"
                        fullWidth
                        options={referals || []}
                        defaultText="Select Primary Introducing Source"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("referralName", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="referral2ID"
                        control={control}
                        label="Secondary Introducing Source"
                        type="select"
                        size="small"
                        fullWidth
                        options={referals || []}
                        defaultText="Select Secondary Introducing Source"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("referralName2", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 4 }}>
                      <FormField
                        name="physicianID"
                        control={control}
                        label="Attending Physician"
                        type="select"
                        size="small"
                        fullWidth
                        options={physicians || []}
                        defaultText="Select Attending Physician"
                        onChange={(data: any) => {
                          if (data && typeof data === "object" && "value" in data) {
                            setValue("physicianName", data.label || "", { shouldDirty: true });
                          }
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField name="rNotes" control={control} label="Notes" type="textarea" size="small" fullWidth rows={2} placeholder="Enter bill remarks" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Services Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Services</Typography>
                    <Box display="flex" gap={2} alignItems="center">
                      {/* Service Search Autocomplete */}
                      <Autocomplete
                        value={selectedService}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleServiceSelect(newValue);
                          }
                        }}
                        inputValue={serviceSearchTerm}
                        onInputChange={(event, newInputValue) => {
                          setServiceSearchTerm(newInputValue);
                        }}
                        options={filteredServices}
                        getOptionLabel={(option) => `${option.chargeCode} - ${option.chargeDesc}`}
                        loading={loadingServices}
                        sx={{ width: 400 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search and add service"
                            size="small"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingServices ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box>
                              <Typography variant="body1">
                                {option.chargeCode} - {option.chargeDesc}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.cShortName && `Short: ${option.cShortName} | `}
                                Type: {option.chargeType} | Status: {option.chargeStatus}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        noOptionsText="No services found"
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {serviceFields.length > 0 ? (
                    <TableContainer sx={{ overflowX: "auto" }}>
                      <Table size="small" sx={{ minWidth: 1500 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 200 }}>Service Name</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Physician</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>Effective Date</TableCell>
                            <TableCell align="center" sx={{ minWidth: 80 }}>
                              Quantity
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 90 }}>
                              Dr Amt (₹)
                            </TableCell>
                            <TableCell align="center" sx={{ minWidth: 90 }}>
                              Dr Disc %
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 90 }}>
                              Dr Disc ₹
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 90 }}>
                              Hosp Amt (₹)
                            </TableCell>
                            <TableCell align="center" sx={{ minWidth: 100 }}>
                              Hosp Disc %
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 100 }}>
                              Hosp Disc ₹
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 100 }}>
                              Gross Amt
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 90 }}>
                              Disc Amt
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 90 }}>
                              Net Amt
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Service Group</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Pack Name</TableCell>
                            <TableCell align="center" sx={{ minWidth: 60 }}>
                              Delete
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {serviceFields.map((field, index) => {
                            const service = watchedBillServices[index];
                            const quantity = service?.chUnits || 1;
                            const drAmt = service?.dCValue || 0;
                            const hospAmt = service?.hCValue || 0;
                            const drDiscAmt = service?.dValDisc || 0;
                            const hospDiscAmt = service?.hValDisc || 0;

                            // Calculate amounts
                            const grossAmt = quantity * (drAmt + hospAmt);
                            const totalDiscAmt = drDiscAmt + hospDiscAmt;
                            const netAmt = grossAmt - totalDiscAmt;

                            return (
                              <TableRow key={field.id}>
                                <TableCell>
                                  <Typography variant="body2" noWrap>
                                    {service?.chargeDesc || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {service?.physicianYN === "Y" ? (
                                    <FormField
                                      name={`billServices.${index}.physicianID`}
                                      control={control}
                                      type="select"
                                      size="small"
                                      fullWidth
                                      options={physicians || []}
                                      defaultText="Select"
                                      onChange={(data: any) => {
                                        if (data && typeof data === "object" && "value" in data) {
                                          setValue(`billServices.${index}.PhysicianName`, data.label || "", { shouldDirty: true });
                                        }
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      N/A
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <FormField name={`billServices.${index}.chargeDt`} control={control} type="datepicker" size="small" fullWidth />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`billServices.${index}.chUnits`}
                                    control={control}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    min={1}
                                    step={1}
                                    onChange={(value: any) => handleServiceFieldChange(index, "chUnits", value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`billServices.${index}.dCValue`}
                                    control={control}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    min={0}
                                    step={0.01}
                                    onChange={(value: any) => handleServiceFieldChange(index, "dCValue", value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`billServices.${index}.drPercShare`}
                                    control={control}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    onChange={(value: any) => handleServiceFieldChange(index, "drPercShare", value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    value={drDiscAmt.toFixed(2)}
                                    size="small"
                                    fullWidth
                                    disabled
                                    InputProps={{
                                      readOnly: true,
                                      style: { textAlign: "right" },
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`billServices.${index}.hCValue`}
                                    control={control}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    min={0}
                                    step={0.01}
                                    onChange={(value: any) => handleServiceFieldChange(index, "hCValue", value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <FormField
                                    name={`billServices.${index}.hospPercShare`}
                                    control={control}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    onChange={(value: any) => handleServiceFieldChange(index, "hospPercShare", value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    value={hospDiscAmt.toFixed(2)}
                                    size="small"
                                    fullWidth
                                    disabled
                                    InputProps={{
                                      readOnly: true,
                                      style: { textAlign: "right" },
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    ₹{grossAmt.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" color="error">
                                    ₹{totalDiscAmt.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="bold" color="primary">
                                    ₹{netAmt.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" noWrap>
                                    {service?.sGRPName || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" noWrap>
                                    {service?.packName || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton size="small" color="error" onClick={() => removeService(index)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      No services added. Use the search box above to add services.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Bill Summary */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bill Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Gross Amount:</Typography>
                          <Typography fontWeight="bold">₹{watch("billGrossAmt").toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Item Discounts:</Typography>
                          <Typography color="error">-₹{watch("billDiscAmt").toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography>Group Discount %:</Typography>
                          <Box sx={{ width: 120 }}>
                            <FormField name="groupDisc" control={control} type="number" size="small" min={0} max={100} step={0.01} fullWidth />
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography>Group Discount Amount:</Typography>
                          <Typography color="error">-₹{calculateDiscountFromPercent(watch("billGrossAmt") - watch("billDiscAmt"), watchedGroupDisc || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6">Net Amount Payable:</Typography>
                          <Typography variant="h6" color="primary">
                            ₹{calculateFinalBillAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <SmartButton text="Reset" onClick={performReset} variant="outlined" color="error" icon={CancelIcon} disabled={!isDirty} />
                <SmartButton
                  text="Save Bill"
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isDirty || !isValid}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText="Saving..."
                  successText="Saved!"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Patient Visit History Dialog */}
      <PatientVisitDialog
        open={isHistoryDialogOpen}
        onClose={handleCloseHistoryDialog}
        pChartID={selectedPChartID}
        pChartCode={selectedPatient?.pChartCode}
        onVisitSelect={handleVisitSelect}
      />
    </Box>
  );
};

export default BillingPage;
