import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useLoading } from "@/hooks/Common/useLoading";
import { AdvanceReceiptDto } from "@/interfaces/Billing/AdvanceReceiptDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { PaymentSection } from "@/pages/billing/Billing/MainPage/components/PaymentSection";
import { BillingFormData } from "@/pages/billing/Billing/MainPage/types";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
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
  ExpandLess,
  ExpandMore,
  History,
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
  fullName: string;
  pTitle?: string;
  pMName?: string;
  pAddPhone1?: string;
  pDob?: Date | null;
  pGender?: string;
  pBldGrp?: string;
  pTypeID?: number;
  pTypeCode?: string;
  pTypeName?: string;
  pFhName?: string;
  patMemID?: number;
  patMemName?: string;
  patMemDescription?: string;
  deptID?: number;
  deptName?: string;
  facultyID?: number;
  faculty?: string;
  pPob?: string;
  patCompName?: string;
  indentityType?: string;
  indentityValue?: string;
  patientType?: string;
  pRegDate?: Date;
  pAddEmail?: string;
  attendingPhysicianName?: string;
}

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
  clientID: z.number().default(0),
  clientCode: z.string().default(""),
  clientName: z.string().default(""),
});

const formSchema = z.object({
  uhidNo: z.string().min(1, "UHID number is required"),
  patientId: z.number().min(1, "Valid patient selection is required"),
  receiptCode: z.string().default(""),
  receiptDate: z.date({ required_error: "Receipt date is required" }),
  billPaymentDetails: z.array(paymentDetailSchema).min(1, "At least one payment detail is required"),
});

type FormData = z.infer<typeof formSchema>;

const AdvanceReceiptMainPage: React.FC<AdvanceReceiptMainPageProps> = ({ initialData = null, viewOnly = false, onSaveSuccess }) => {
  const { setLoading } = useLoading();
  const { saveAdvanceReceipt, updateAdvanceReceipt, generateAdvanceReceiptCode, getAdvanceReceiptsByPatientId } = useAdvanceReceipt();
  const { showAlert } = useAlert();

  const [state, setState] = useState({
    isSaving: false,
    formError: null as string | null,
    isGeneratingCode: false,
    showResetConfirmation: false,
    patientClearTrigger: 0,
    isHistoryExpanded: false,
  });

  const [selectedPatient, setSelectedPatient] = useState<SelectedPatientInfo | null>(null);
  const [patientPaymentHistory, setPatientPaymentHistory] = useState<AdvanceReceiptDto[]>([]);

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
        clientID: 0,
        clientCode: "",
        clientName: "",
      },
    ],
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const watchedPaymentDetails = watch("billPaymentDetails");

  const updateState = (updates: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const getCompletePatientData = async (pChartID: number): Promise<SelectedPatientInfo | null> => {
    try {
      setLoading(true);
      const result = await PatientService.getPatientDetails(pChartID);

      if (result.success && result.data) {
        const patientData: PatientRegistrationDto = result.data;
        const fullName = [
          patientData.patRegisters.pTitleVal || patientData.patRegisters.pTitle,
          patientData.patRegisters.pFName,
          patientData.patRegisters.pMName,
          patientData.patRegisters.pLName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

        return {
          pChartID: patientData.patRegisters.pChartID,
          pChartCode: patientData.patRegisters.pChartCode,
          pfName: patientData.patRegisters.pFName || "",
          plName: patientData.patRegisters.pLName || "",
          pTitle: patientData.patRegisters.pTitle || "",
          pMName: patientData.patRegisters.pMName || "",
          fullName,
          pDob: patientData.patRegisters.pDob || null,
          pAddPhone1: patientData.patAddress?.pAddPhone1 || "",
          pAddEmail: patientData.patAddress?.pAddEmail || "",
          pGender: patientData.patRegisters.pGender || "",
          pBldGrp: patientData.patRegisters.pBldGrp || "",
          pTypeID: patientData.patRegisters.pTypeID || 0,
          pTypeCode: patientData.patRegisters.pTypeCode || "",
          pTypeName: patientData.patRegisters.pTypeName || "",
          pFhName: patientData.patRegisters.pFhName || "",
          patMemID: patientData.patRegisters.patMemID || 0,
          patMemName: patientData.patRegisters.patMemName || "",
          patMemDescription: patientData.patRegisters.patMemDescription || "",
          deptID: patientData.patRegisters.deptID || 0,
          deptName: patientData.patRegisters.deptName || "",
          facultyID: patientData.patRegisters.facultyID || 0,
          faculty: patientData.patRegisters.faculty || "",
          pPob: patientData.patRegisters.pPob || "",
          patCompName: patientData.patRegisters.patCompName || "",
          indentityType: patientData.patRegisters.indentityType || "",
          indentityValue: patientData.patRegisters.indentityValue || "",
          patientType: patientData.patRegisters.patientType || "",
          pRegDate: patientData.patRegisters.pRegDate || new Date(),
          attendingPhysicianName: patientData.lastVisit?.attendingPhysicianName || "",
        };
      }
      throw new Error(result.errorMessage || "Failed to fetch patient details");
    } catch (error) {
      console.error("Error fetching complete patient data:", error);
      showAlert("Error", "Failed to fetch complete patient details", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptCode = async () => {
    if (!isAddMode) return;
    try {
      updateState({ isGeneratingCode: true });
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
      updateState({ isGeneratingCode: false });
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

  const mapInitialDataToForm = (data: AdvanceReceiptDto): FormData => ({
    uhidNo: data.receiptDetail.pChartCode || "",
    patientId: data.receiptMaster.pChartID,
    receiptCode: data.receiptMaster.docCodeCd,
    receiptDate: new Date(data.receiptMaster.docDate),
    billPaymentDetails: data.paymentDetails.map((payment) => ({
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
      clientID: 0,
      clientCode: "",
      clientName: "",
    })),
  });

  const createPatientInfoFromInitialData = (data: AdvanceReceiptDto): SelectedPatientInfo => {
    const fullName = [data.receiptDetail.pTitle, data.receiptDetail.pFName, data.receiptDetail.pMName, data.receiptDetail.pLName].filter(Boolean).join(" ").trim();

    return {
      pChartID: data.receiptMaster.pChartID,
      pChartCode: data.receiptDetail.pChartCode || "",
      pfName: data.receiptDetail.pFName || "",
      plName: data.receiptDetail.pLName || "",
      pTitle: data.receiptDetail.pTitle || "",
      pMName: data.receiptDetail.pMName || "",
      fullName,
      pAddPhone1: undefined,
      pDob: null,
    };
  };

  useEffect(() => {
    if (initialData) {
      const formData = mapInitialDataToForm(initialData);
      reset(formData);
      const patientInfo = createPatientInfoFromInitialData(initialData);
      setSelectedPatient(patientInfo);
      fetchPatientPaymentHistory(initialData.receiptMaster.pChartID);
    } else {
      reset(defaultValues);
      generateReceiptCode();
    }
  }, [initialData, reset]);

  const validatePatientData = (patient: SelectedPatientInfo) => {
    const requiredFields = {
      fullName: patient.fullName,
      pTitle: patient.pTitle,
      pfName: patient.pfName,
      plName: patient.plName,
      pChartCode: patient.pChartCode,
      pChartID: patient.pChartID,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === "number" && value <= 0))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const errorMessage = `Patient data is incomplete. Missing: ${missingFields.join(", ")}. Please ensure patient data is complete.`;
      updateState({ formError: errorMessage });
      showAlert("Validation Error", errorMessage, "warning");
      return false;
    }
    return true;
  };

  const createAdvanceReceiptDto = (data: FormData, patient: SelectedPatientInfo): AdvanceReceiptDto => {
    const now = new Date();
    const totalAmount = data.billPaymentDetails.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);

    return {
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
        pTitle: patient.pTitle || "",
        pFName: patient.pfName || "",
        pLName: patient.plName || "",
        pMName: "",
        pChartCode: patient.pChartCode || "",
        pGender: patient.pGender || "",
        pDob: patient.pDob || null,
        pBldGrp: patient.pBldGrp || "",
        pFhName: patient.pFhName || "",
        patientType: patient.patientType || "",
        pTypeCode: patient.pTypeCode || "",
        pTypeName: patient.pTypeName || "",
        deptID: patient.deptID || 0,
        deptName: patient.deptName || "",
        facultyID: patient.facultyID || 0,
        faculty: patient.faculty || "",
        patMemID: patient.patMemID || 0,
        patMemName: patient.patMemName || "",
        patMemDescription: patient.patMemDescription || "",
        indentityType: patient.indentityType || "",
        indentityValue: patient.indentityValue || "",
        pPob: patient.pPob || "",
        patCompName: patient.patCompName || "",
        pAddPhone1: patient.pAddPhone1 || "",
        pAddEmail: patient.pAddEmail || "",
        attendingPhysicianName: patient.attendingPhysicianName || "",
        billID: 0,
        billAmount: 0,
        crAmount: 0,
        tnsID: 0,
        refundAmount: 0,
        transactionNumber: 0,
        oldPChartID: 0,
        authorizedBy: "",
        crnType: "",
        docType: "ADV",
        docAmount: totalAmount,
        docAdjAmount: 0,
        docStatus: "ACT",
        docCodeCD: data.receiptCode || "",
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
        payID: payment.paymentID || 0,
        payCode: payment.paymentCode || `PAY${String(index + 1).padStart(3, "0")}`,
        payName: payment.paymentName || payment.paymentMode || "",
        payMode: payment.paymentMode || "",
        docID: 0,
        paidAmt: payment.paidAmount || 0,
        refNo: payment.referenceNumber || "",
        refDate: data.receiptDate,
        payNotes: payment.paymentNote || "",
        docDate: data.receiptDate,
        transactionNr: payment.transactionNumber || 0,
        bank: payment.bank || "",
        branch: payment.branch || "",
        cardApprove: "",
        payTypeNumber: payment.transactionNumber?.toString() || "",
        creditCardPer: 0,
        chequeNo: payment.referenceNumber || "",
        chequeDate: payment.referenceNumber ? data.receiptDate : null,
        upiTransactionId: payment.paymentMode?.toUpperCase() === "UPI" ? payment.referenceNumber || "" : "",
        neftRtgsNumber: ["NEFT", "RTGS"].includes(payment.paymentMode?.toUpperCase() || "") ? payment.referenceNumber || "" : "",
        cardNumber: ["CARD", "CREDIT_CARD", "DEBIT_CARD"].some((type) => payment.paymentMode?.toUpperCase().includes(type)) ? payment.referenceNumber || "" : "",
        rActiveYN: "Y",
        transferYN: "N",
        rCreatedBy: 0,
        rCreatedOn: now,
        rModifiedBy: 0,
        rModifiedOn: now,
        rNotes: "",
      })),
    };
  };

  const onSubmit = async (data: FormData) => {
    if (viewOnly || !selectedPatient || !validatePatientData(selectedPatient)) return;

    updateState({ formError: null });

    try {
      updateState({ isSaving: true });
      setLoading(true);

      const advanceReceiptDto = createAdvanceReceiptDto(data, selectedPatient);
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
      updateState({ formError: errorMessage });
      showAlert("Error", errorMessage, "error");
    } finally {
      updateState({ isSaving: false });
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patient: SelectedPatientInfo | null) => {
    setSelectedPatient(patient);

    if (patient?.pChartID) {
      try {
        const completePatientData = await getCompletePatientData(patient.pChartID);
        const patientData = completePatientData || patient;

        setSelectedPatient(patientData);
        setValue("uhidNo", patientData.pChartCode, { shouldValidate: true, shouldDirty: true });
        setValue("patientId", patientData.pChartID, { shouldValidate: true, shouldDirty: true });
        await fetchPatientPaymentHistory(patientData.pChartID);
      } catch (error) {
        console.error("Error fetching complete patient data:", error);
        setValue("uhidNo", patient.pChartCode, { shouldValidate: true, shouldDirty: true });
        setValue("patientId", patient.pChartID, { shouldValidate: true, shouldDirty: true });
        await fetchPatientPaymentHistory(patient.pChartID);
      }
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
    updateState({ patientClearTrigger: state.patientClearTrigger + 1, formError: null });
    setPatientPaymentHistory([]);
    generateReceiptCode();
  };

  const performReset = () => {
    if (initialData && initialData.receiptMaster.docID !== 0) {
      const formData = mapInitialDataToForm(initialData);
      reset(formData);
    } else {
      handleClear();
    }
    updateState({ formError: null });
  };

  const handleReset = () => {
    if (isDirty) {
      updateState({ showResetConfirmation: true });
    } else {
      performReset();
    }
  };

  const getPaymentModeIcon = (paymentMode: string) => {
    const iconMap = {
      CASH: <CashIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
      CARD: <CardIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
      CREDIT_CARD: <CardIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
      DEBIT_CARD: <CardIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
      CHEQUE: <ChequeIcon sx={{ color: "#ff9800", fontSize: 18 }} />,
      UPI: <UpiIcon sx={{ color: "#9c27b0", fontSize: 18 }} />,
      NEFT: <TransferIcon sx={{ color: "#f44336", fontSize: 18 }} />,
      RTGS: <TransferIcon sx={{ color: "#f44336", fontSize: 18 }} />,
    };
    return iconMap[paymentMode?.toUpperCase() as keyof typeof iconMap] || <BankIcon sx={{ color: "#607d8b", fontSize: 18 }} />;
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      ACT: <ActiveIcon sx={{ color: "#4caf50", fontSize: 14 }} />,
      CAN: <CancelledIcon sx={{ color: "#f44336", fontSize: 14 }} />,
      ADJ: <AdjustedIcon sx={{ color: "#2196f3", fontSize: 14 }} />,
    };
    return iconMap[status as keyof typeof iconMap] || <Info sx={{ color: "#607d8b", fontSize: 14 }} />;
  };

  const renderPatientPaymentHistory = () => {
    if (!selectedPatient || !patientPaymentHistory.length) return null;

    const activeReceipts = patientPaymentHistory.filter((r) => r.receiptDetail.docStatus === "ACT").length;

    return (
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                mb: state.isHistoryExpanded ? 2 : 0,
                py: 1,
                px: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.04)" },
              }}
              onClick={() => updateState({ isHistoryExpanded: !state.isHistoryExpanded })}
            >
              <Typography variant="h6" color="primary" fontWeight="bold">
                <History sx={{ mr: 1, verticalAlign: "bottom" }} />
                Patient Advance Payment History ({patientPaymentHistory.length} records)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{state.isHistoryExpanded ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}</Box>
            </Box>

            <Collapse in={state.isHistoryExpanded}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1.5 }}>
                  Recent Transactions ({activeReceipts} Active)
                </Typography>

                <Box sx={{ maxHeight: "320px", overflow: "auto", borderRadius: 2 }}>
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

                          {[
                            { label: "Amount", value: receipt.receiptDetail.docAmount, color: "success.main" },
                            { label: "Used", value: receipt.receiptDetail.docAdjAmount, color: "warning.main" },
                            { label: "Balance", value: (receipt.receiptDetail.docAmount || 0) - (receipt.receiptDetail.docAdjAmount || 0), color: "secondary.main" },
                          ].map((item, idx) => (
                            <Grid key={idx} size={{ xs: 4, sm: 2 }}>
                              <Box textAlign="center">
                                <Typography variant="body1" color={item.color} fontWeight={idx === 2 ? "bold" : "medium"} sx={{ fontSize: "0.9rem" }}>
                                  ₹{(item.value || 0).toLocaleString()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                  {item.label}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}

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
                                    "& .MuiChip-label": { px: 0.75 },
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
            </Collapse>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      {state.formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => updateState({ formError: null })}>
          {state.formError}
        </Alert>
      )}

      {getTotalAmount() > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
          <Typography variant="body2">
            <strong>Total Amount:</strong> ₹{getTotalAmount().toLocaleString()} will be received as advance payment.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
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
                    clearTrigger={state.patientClearTrigger}
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
                            {state.isGeneratingCode ? (
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

              {selectedPatient && selectedPatient.pChartID > 0 && (
                <Box sx={{ mt: 3 }}>
                  <PatientDemographics pChartID={selectedPatient.pChartID} variant="compact" showEditButton={false} showRefreshButton={false} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {renderPatientPaymentHistory()}

        <Grid size={{ xs: 12 }}>
          <PaymentSection
            control={control as unknown as Control<BillingFormData>}
            setValue={setValue as unknown as UseFormSetValue<BillingFormData>}
            watch={watch as unknown as UseFormWatch<BillingFormData>}
            finalBillAmount={getTotalAmount()}
          />
        </Grid>
      </Grid>

      {!viewOnly && (
        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 3 }}>
          <SmartButton text="Clear" onClick={handleClear} variant="outlined" color="inherit" disabled={state.isSaving} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={state.isSaving || (!isDirty && !state.formError)} />
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
              disabled={state.isSaving || !isValid}
            />
          </Box>
        </Box>
      )}

      <ConfirmationDialog
        open={state.showResetConfirmation}
        onClose={() => updateState({ showResetConfirmation: false })}
        onConfirm={() => {
          performReset();
          updateState({ showResetConfirmation: false });
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
