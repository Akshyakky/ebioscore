import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useLoading } from "@/hooks/Common/useLoading";
import { AdvanceReceiptDto } from "@/interfaces/Billing/AdvanceReceiptDto";
import { PaymentSection } from "@/pages/billing/Billing/MainPage/components/PaymentSection";
import { BillingFormData } from "@/pages/billing/Billing/MainPage/types";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle as ActiveIcon,
  Info as AdjustedIcon,
  AccountBalance as BankIcon,
  Cancel,
  Cancel as CancelledIcon,
  CreditCard as CardIcon,
  AttachMoney as CashIcon,
  Assignment as ChequeIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Info,
  Person,
  Receipt as ReceiptIcon,
  Refresh,
  Save,
  SwapHorizOutlined as TransferIcon,
  PhoneAndroid as UpiIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Card, CardContent, Chip, CircularProgress, Collapse, Divider, Grid, InputAdornment, Paper, Stack, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Control, useForm, UseFormSetValue, UseFormWatch } from "react-hook-form";
import * as z from "zod";
import { useAdvanceReceipt } from "../hook/useAdvanceReceipt";

interface AdvanceReceiptMainPageProps {
  initialData?: AdvanceReceiptDto | null;
  viewOnly?: boolean;
  onSaveSuccess?: (receipt: AdvanceReceiptDto) => void;
}

interface SelectedPatientInfo {
  pChartID: number;
  pChartCode: string;
  pfName: string;
  plName: string;
  pAddPhone1?: string;
  pDob?: Date | null;
  fullName: string;
  pTitle?: string;
  pMName?: string;
}

// Payment detail schema that matches BPayDetailDto structure
const paymentDetailSchema = z.object({
  paymentID: z.number().default(0),
  paymentMode: z.string().min(1, "Payment mode is required"),
  paymentCode: z.string().default(""),
  paymentName: z.string().min(1, "Payment type is required"),
  paidAmount: z.number().min(0.01, "Amount must be greater than zero"),
  paymentNote: z.string().default(""),
  referenceNumber: z.string().default(""),
  bank: z.string().default(""),
  branch: z.string().default(""),
  transactionNumber: z.number().optional(),
});

// Form schema that matches the expected data structure
const formSchema = z.object({
  uhidNo: z.string().min(1, "UHID number is required"),
  patientId: z.number().min(1, "Valid patient selection is required"),
  receiptCode: z.string().default(""),
  receiptDate: z.date({ required_error: "Receipt date is required" }),
  billPaymentDetails: z.array(paymentDetailSchema).min(1, "At least one payment detail is required"),
});

type FormData = z.infer<typeof formSchema>;

// Enhanced PaymentSection adapter with proper type conversion
interface PaymentSectionAdapterProps {
  control: Control<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
  finalBillAmount: number;
  disabled?: boolean;
}

const PaymentSectionAdapter: React.FC<PaymentSectionAdapterProps> = ({ control, setValue, watch, finalBillAmount, disabled = false }) => {
  const adaptedControl = control as unknown as Control<BillingFormData>;
  const adaptedSetValue = setValue as unknown as UseFormSetValue<BillingFormData>;
  const adaptedWatch = watch as unknown as UseFormWatch<BillingFormData>;

  return <PaymentSection control={adaptedControl} setValue={adaptedSetValue} watch={adaptedWatch} finalBillAmount={finalBillAmount} />;
};

const AdvanceReceiptMainPage: React.FC<AdvanceReceiptMainPageProps> = ({ initialData = null, viewOnly = false, onSaveSuccess }) => {
  const { setLoading } = useLoading();
  const { saveAdvanceReceipt, updateAdvanceReceipt, generateAdvanceReceiptCode, getAdvanceReceiptsByPatientId } = useAdvanceReceipt();
  const { showAlert } = useAlert();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatientInfo | null>(null);
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [patientPaymentHistory, setPatientPaymentHistory] = useState<AdvanceReceiptDto[]>([]);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const isAddMode = !initialData || initialData.receiptMaster.docID === 0;

  const defaultValues: FormData = {
    uhidNo: "",
    patientId: 0,
    receiptCode: "",
    receiptDate: new Date(),
    billPaymentDetails: [
      {
        paymentID: 0,
        paymentMode: "",
        paymentCode: "",
        paymentName: "",
        paidAmount: 0,
        paymentNote: "",
        referenceNumber: "",
        bank: "",
        branch: "",
        transactionNumber: undefined,
      },
    ],
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedPaymentDetails = watch("billPaymentDetails");

  const generateReceiptCode = async () => {
    if (!isAddMode) return;

    try {
      setIsGeneratingCode(true);
      const nextCode = await generateAdvanceReceiptCode();
      if (nextCode) {
        setValue("receiptCode", nextCode, { shouldValidate: true, shouldDirty: true });
      } else {
        showAlert("Warning", "Failed to generate receipt code", "warning");
      }
    } catch (error) {
      console.error("Error generating receipt code:", error);
      showAlert("Error", "Error generating receipt code", "error");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const fetchPatientPaymentHistory = async (patientId: number) => {
    try {
      const history = await getAdvanceReceiptsByPatientId(patientId);
      setPatientPaymentHistory(history);
    } catch (error) {
      console.error("Error fetching patient payment history:", error);
      setPatientPaymentHistory([]);
    }
  };

  useEffect(() => {
    if (initialData) {
      const formData: FormData = {
        uhidNo: initialData.receiptDetail.pChartCode || "",
        patientId: initialData.receiptMaster.pChartID,
        receiptCode: initialData.receiptMaster.docCodeCd,
        receiptDate: new Date(initialData.receiptMaster.docDate),
        billPaymentDetails: initialData.paymentDetails.map((payment) => ({
          paymentID: payment.payID || 0,
          paymentMode: payment.payMode || "",
          paymentCode: payment.payCode || "",
          paymentName: payment.payName || "",
          paidAmount: payment.paidAmt || 0,
          paymentNote: payment.payNotes || "",
          referenceNumber: payment.refNo || "",
          bank: payment.bank || "",
          branch: payment.branch || "",
          transactionNumber: payment.transactionNr,
        })),
      };

      reset(formData);

      const patientName = [initialData.receiptDetail.pTitle, initialData.receiptDetail.pFName, initialData.receiptDetail.pMName, initialData.receiptDetail.pLName]
        .filter(Boolean)
        .join(" ")
        .trim();

      const patientInfo: SelectedPatientInfo = {
        pChartID: initialData.receiptMaster.pChartID,
        pChartCode: initialData.receiptDetail.pChartCode || "",
        pfName: initialData.receiptDetail.pFName || "",
        plName: initialData.receiptDetail.pLName || "",
        pTitle: initialData.receiptDetail.pTitle || "",
        pMName: initialData.receiptDetail.pMName || "",
        pAddPhone1: undefined,
        pDob: null,
        fullName: patientName,
      };

      setSelectedPatient(patientInfo);
      fetchPatientPaymentHistory(initialData.receiptMaster.pChartID);
    } else {
      reset(defaultValues);
      generateReceiptCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormData) => {
    if (viewOnly) return;

    if (!selectedPatient) {
      setFormError("Please select a patient before saving");
      showAlert("Validation Error", "Please select a patient before saving", "warning");
      return;
    }

    if (!selectedPatient.fullName) {
      setFormError("Patient title is required. Please ensure patient data is complete.");
      showAlert("Validation Error", "Patient title is required. Please ensure patient data is complete.", "warning");
      return;
    }

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const now = new Date();
      const totalAmount = data.billPaymentDetails.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);

      const advanceReceiptDto: AdvanceReceiptDto = {
        receiptMaster: {
          docID: isAddMode ? 0 : initialData?.receiptMaster.docID || 0,
          docCode: isAddMode ? 0 : initialData?.receiptMaster.docCode || 0,
          docDate: data.receiptDate,
          pChartID: data.patientId,
          docType: "ADV",
          docCodeCd: data.receiptCode || "",
          oldPChartID: data.patientId,
          rActiveYN: "Y",
          transferYN: "N",
          rCreatedBy: 0,
          rCreatedOn: now,
          rModifiedBy: 0,
          rModifiedOn: now,
          rNotes: "",
        },
        receiptDetail: {
          docSlNo: isAddMode ? 0 : initialData?.receiptDetail.docSlNo || 0,
          docID: isAddMode ? 0 : initialData?.receiptDetail.docID || 0,
          docCode: isAddMode ? 0 : initialData?.receiptDetail.docCode || 0,
          docDate: data.receiptDate,
          pChartID: data.patientId,
          pTitle: selectedPatient.fullName || "",
          pFName: selectedPatient.pfName || "",
          pLName: selectedPatient.plName || "",
          pMName: selectedPatient.pMName || "",
          pChartCode: selectedPatient.pChartCode || "",
          docType: "ADV",
          docAmount: totalAmount,
          docAdjAmount: 0,
          docStatus: "ACT",
          docCodeCD: data.receiptCode || "",
          oldPChartID: data.patientId,
          rActiveYN: "Y",
          transferYN: "N",
          rCreatedBy: 0,
          rCreatedOn: now,
          rModifiedBy: 0,
          rModifiedOn: now,
          rNotes: "",
        },
        paymentDetails: data.billPaymentDetails.map((payment, index) => ({
          payDetID: 0,
          payID: 0,
          payCode: `PAY${String(index + 1).padStart(3, "0")}`,
          payName: payment.paymentName || payment.paymentMode,
          payMode: payment.paymentMode,
          docID: 0,
          paidAmt: payment.paidAmount,
          refNo: payment.referenceNumber || "",
          refDate: data.receiptDate,
          payNotes: payment.paymentNote || "",
          docDate: data.receiptDate,
          transactionNr: payment.transactionNumber,
          bank: payment.bank || "",
          branch: payment.branch || "",
          cardApprove: "",
          payTypeNumber: payment.transactionNumber?.toString() || "",
          creditCardPer: 0,
          rActiveYN: "Y",
          transferYN: "N",
          rCreatedBy: 0,
          rCreatedOn: now,
          rModifiedBy: 0,
          rModifiedOn: now,
          rNotes: "",
        })),
      };

      const response = isAddMode ? await saveAdvanceReceipt(advanceReceiptDto) : await updateAdvanceReceipt(initialData!.receiptMaster.docID, advanceReceiptDto);

      if (response.success) {
        const successMessage = isAddMode ? "Advance receipt created successfully" : "Advance receipt updated successfully";
        showAlert("Success", successMessage, "success");

        if (onSaveSuccess && response.data) {
          onSaveSuccess(response.data);
        }

        if (isAddMode) {
          handleClear();
        }
      } else {
        throw new Error(response.errorMessage || "Failed to save advance receipt");
      }
    } catch (error) {
      console.error("Error saving advance receipt:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save advance receipt";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient: SelectedPatientInfo | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setValue("uhidNo", patient.pChartCode, { shouldValidate: true, shouldDirty: true });
      setValue("patientId", patient.pChartID, { shouldValidate: true, shouldDirty: true });

      await fetchPatientPaymentHistory(patient.pChartID);
    } else {
      setValue("uhidNo", "", { shouldValidate: true, shouldDirty: true });
      setValue("patientId", 0, { shouldValidate: true, shouldDirty: true });
      setPatientPaymentHistory([]);
    }
  };

  const getTotalAmount = () => {
    return watchedPaymentDetails?.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0) || 0;
  };

  const handleClear = () => {
    reset(defaultValues);
    setSelectedPatient(null);
    setPatientClearTrigger((prev) => prev + 1);
    setPatientPaymentHistory([]);
    setFormError(null);
    generateReceiptCode();
  };

  const performReset = () => {
    if (initialData && initialData.receiptMaster.docID !== 0) {
      const formData: FormData = {
        uhidNo: initialData.receiptDetail.pChartCode || "",
        patientId: initialData.receiptMaster.pChartID,
        receiptCode: initialData.receiptMaster.docCodeCd,
        receiptDate: new Date(initialData.receiptMaster.docDate),
        billPaymentDetails: initialData.paymentDetails.map((payment) => ({
          paymentID: payment.payID || 0,
          paymentMode: payment.payMode || "",
          paymentCode: payment.payCode || "",
          paymentName: payment.payName || "",
          paidAmount: payment.paidAmt || 0,
          paymentNote: payment.payNotes || "",
          referenceNumber: payment.refNo || "",
          bank: payment.bank || "",
          branch: payment.branch || "",
          transactionNumber: payment.transactionNr,
        })),
      };
      reset(formData);
    } else {
      handleClear();
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

  const getPaymentModeIcon = (paymentMode: string) => {
    switch (paymentMode?.toUpperCase()) {
      case "CASH":
        return <CashIcon sx={{ color: "#4caf50", fontSize: 18 }} />;
      case "CARD":
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CardIcon sx={{ color: "#2196f3", fontSize: 18 }} />;
      case "CHEQUE":
        return <ChequeIcon sx={{ color: "#ff9800", fontSize: 18 }} />;
      case "UPI":
        return <UpiIcon sx={{ color: "#9c27b0", fontSize: 18 }} />;
      case "NEFT":
      case "RTGS":
        return <TransferIcon sx={{ color: "#f44336", fontSize: 18 }} />;
      default:
        return <BankIcon sx={{ color: "#607d8b", fontSize: 18 }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACT":
        return <ActiveIcon sx={{ color: "#4caf50", fontSize: 14 }} />;
      case "CAN":
        return <CancelledIcon sx={{ color: "#f44336", fontSize: 14 }} />;
      case "ADJ":
        return <AdjustedIcon sx={{ color: "#2196f3", fontSize: 14 }} />;
      default:
        return <Info sx={{ color: "#607d8b", fontSize: 14 }} />;
    }
  };

  const renderPatientPaymentHistory = () => {
    if (!selectedPatient || !patientPaymentHistory.length) return null;

    const totalAdvance = patientPaymentHistory.reduce((sum, receipt) => sum + (receipt.receiptDetail.docAmount || 0), 0);
    const totalAdjusted = patientPaymentHistory.reduce((sum, receipt) => sum + (receipt.receiptDetail.docAdjAmount || 0), 0);
    const availableBalance = totalAdvance - totalAdjusted;
    const activeReceipts = patientPaymentHistory.filter((r) => r.receiptDetail.docStatus === "ACT").length;

    return (
      <Grid size={{ xs: 12 }}>
        <Card
          variant="outlined"
          sx={{
            borderLeft: "3px solid #1976d2",
            width: "100%",
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                mb: isHistoryExpanded ? 2 : 0,
                py: 1,
                px: 1,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(25, 118, 210, 0.04)",
                },
              }}
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
              <Typography variant="h6" color="primary" fontWeight="bold">
                <HistoryIcon sx={{ mr: 1, verticalAlign: "bottom" }} />
                Patient Advance Payment History ({patientPaymentHistory.length} records)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{isHistoryExpanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}</Box>
            </Box>

            <Collapse in={isHistoryExpanded}>
              <Box>
                {/* Scrollable Transactions Section */}
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1.5 }}>
                    Recent Transactions ({activeReceipts} Active)
                  </Typography>

                  <Box
                    sx={{
                      maxHeight: "320px",
                      overflow: "auto",
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={0}>
                      {patientPaymentHistory.map((receipt, index) => (
                        <Paper
                          key={receipt.receiptMaster.docID}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderBottom: index < patientPaymentHistory.length - 1 ? "1px solid #f0f0f0" : "none",
                            "&:hover": {
                              bgcolor: "rgba(25, 118, 210, 0.06)",
                              transform: "translateX(4px)",
                              transition: "all 0.3s ease-in-out",
                            },
                            cursor: "pointer",
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                                  <ReceiptIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="bold" color="primary" sx={{ fontSize: "0.9rem" }}>
                                    {receipt.receiptMaster.docCodeCd}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                                    {new Date(receipt.receiptMaster.docDate).toLocaleDateString("en-GB")}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 4, sm: 2 }}>
                              <Box textAlign="center">
                                <Typography variant="body1" color="success.main" fontWeight="bold" sx={{ fontSize: "0.9rem" }}>
                                  ₹{(receipt.receiptDetail.docAmount || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                  Amount
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 4, sm: 2 }}>
                              <Box textAlign="center">
                                <Typography variant="body1" color="warning.main" fontWeight="medium" sx={{ fontSize: "0.9rem" }}>
                                  ₹{(receipt.receiptDetail.docAdjAmount || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                  Used
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 4, sm: 2 }}>
                              <Box textAlign="center">
                                <Typography variant="body1" color="secondary.main" fontWeight="bold" sx={{ fontSize: "0.9rem" }}>
                                  ₹{((receipt.receiptDetail.docAmount || 0) - (receipt.receiptDetail.docAdjAmount || 0)).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                  Balance
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 6, sm: 1.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                {getPaymentModeIcon(receipt.paymentDetails?.[0]?.payMode || "")}
                                <Typography variant="caption" color="text.primary" fontWeight="medium" sx={{ fontSize: "0.8rem" }}>
                                  {receipt.paymentDetails?.[0]?.payMode || "-"}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid size={{ xs: 6, sm: 0.5 }}>
                              <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Tooltip title={receipt.receiptDetail.docStatus === "ACT" ? "Active" : receipt.receiptDetail.docStatus === "CAN" ? "Cancelled" : "Adjusted"}>
                                  <Chip
                                    icon={getStatusIcon(receipt.receiptDetail.docStatus || "")}
                                    label={receipt.receiptDetail.docStatus}
                                    size="small"
                                    variant="outlined"
                                    color={receipt.receiptDetail.docStatus === "ACT" ? "success" : receipt.receiptDetail.docStatus === "CAN" ? "error" : "info"}
                                    sx={{
                                      minWidth: "65px",
                                      fontSize: "0.7rem",
                                      height: "24px",
                                      "& .MuiChip-label": {
                                        px: 0.75,
                                      },
                                    }}
                                  />
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Error Alert */}
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {/* Total Amount Info */}
      {getTotalAmount() > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
          <Typography variant="body2">
            <strong>Total Amount:</strong> ₹{getTotalAmount().toLocaleString()} will be received as advance payment.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Patient Information Section */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                <Person sx={{ mr: 1, verticalAlign: "bottom" }} />
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Patient Information Section */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                      <Person sx={{ mr: 1, verticalAlign: "bottom" }} />
                      Patient Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <PatientSearch
                          onPatientSelect={handlePatientSelect}
                          clearTrigger={patientClearTrigger}
                          label="UHID No. / Patient Name"
                          placeholder="Search by name, chart code or phone number"
                          disabled={viewOnly || (!isAddMode && initialData?.receiptMaster.docID !== 0)}
                          initialSelection={selectedPatient}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormField
                          name="receiptCode"
                          control={control}
                          label="Receipt Code"
                          type="text"
                          disabled={true}
                          size="small"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ReceiptIcon />
                              </InputAdornment>
                            ),
                            endAdornment:
                              isAddMode && !viewOnly ? (
                                <InputAdornment position="end">
                                  {isGeneratingCode ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <SmartButton icon={Refresh} variant="text" size="small" onClick={generateReceiptCode} tooltip="Generate new code" sx={{ minWidth: "unset" }} />
                                  )}
                                </InputAdornment>
                              ) : null,
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Patient Demographics Section */}
                    {selectedPatient && selectedPatient.pChartID > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <PatientDemographics pChartID={selectedPatient.pChartID} variant="compact" showEditButton={false} showRefreshButton={false} />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Payment History - Full Width */}
        {renderPatientPaymentHistory()}

        {/* Payment Details Section */}
        <Grid size={{ xs: 12 }}>
          <PaymentSectionAdapter control={control} setValue={setValue} watch={watch} finalBillAmount={getTotalAmount()} disabled={viewOnly} />
        </Grid>
      </Grid>

      {/* Form Actions - Original Style Layout */}
      {!viewOnly && (
        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 3 }}>
          <SmartButton text="Clear" onClick={handleClear} variant="outlined" color="inherit" disabled={isSaving} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
            <SmartButton
              text={isAddMode ? "Create Receipt" : "Update Receipt"}
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
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
          setShowResetConfirmation(false);
        }}
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

export default AdvanceReceiptMainPage;
