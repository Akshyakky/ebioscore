// src/pages/patientAdministration/DischargeSummary/Form/DischargeSummaryForm.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useContactMastByCategory from "@/hooks/hospitalAdministration/useContactMastByCategory";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { calculateDaysBetween } from "@/utils/Common/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PostAdd as AdviceIcon,
  Clear as ClearIcon,
  MedicalServices as DoctorIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  MedicalInformation as MedicalIcon,
  Person as PatientIcon,
  Assignment as SummaryIcon,
  Healing as TreatmentIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Avatar, Box, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Discharge summary schema with validation
const dischargeSummarySchema = z.object({
  dischgDetID: z.number().default(0),
  dischgID: z.number().min(1, "Discharge ID is required"),
  dchNotes: z.string().optional().nullable(),
  admitDate: z.date().optional().nullable(),
  adviceOnDischarge: z.string().optional().nullable(),
  birthHistory: z.string().optional().nullable(),
  cheifCompliant: z.string().optional().nullable(),
  conditionOnDischarge: z.string().optional().nullable(),
  consultantID: z.number().min(1, "Consultant is required"),
  specialityID: z.number().min(1, "Speciality is required"),
  speciality: z.string().optional().nullable(),
  consultants: z.string().optional().nullable(),
  consultant: z.string().optional().nullable(),
  courseInHospital: z.string().optional().nullable(),
  deliveryDet: z.string().optional().nullable(),
  development: z.string().optional().nullable(),
  dischgDate: z.date().optional().nullable(),
  familyHistory: z.string().optional().nullable(),
  finalDiagnosis: z.string().optional().nullable(),
  followUp: z.string().optional().nullable(),
  history: z.string().optional().nullable(),
  immunisation: z.string().optional().nullable(),
  intraoperativeFinding: z.string().optional().nullable(),
  investigations: z.string().optional().nullable(),
  localExam: z.string().optional().nullable(),
  menstrualExam: z.string().optional().nullable(),
  neonatalDet: z.string().optional().nullable(),
  obstericHistory: z.string().optional().nullable(),
  otFindings: z.string().optional().nullable(),
  pastHistory: z.string().optional().nullable(),
  personalHistory: z.string().optional().nullable(),
  physicalExam: z.string().optional().nullable(),
  postOperTreatment: z.string().optional().nullable(),
  procedureDone: z.string().optional().nullable(),
  reportDate: z.date().optional().nullable(),
  reviewDate: z.date().optional().nullable(),
  riskFactor: z.string().optional().nullable(),
  systemicExam: z.string().optional().nullable(),
  treatmentGiven: z.string().optional().nullable(),
  vaccination: z.string().optional().nullable(),
});

type DischargeSummaryFormData = z.infer<typeof dischargeSummarySchema>;

interface DischargeSummaryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (summaryData: IpDischargeDetailDto) => Promise<void>;
  patient: PatientSearchResult | null;
  admission: AdmissionDto | null;
  discharge: IpDischargeDto | null;
  existingSummary?: IpDischargeDetailDto | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`summary-tabpanel-${index}`} aria-labelledby={`summary-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const DischargeSummaryForm: React.FC<DischargeSummaryFormProps> = ({ open, onClose, onSubmit, patient, admission, discharge, existingSummary }) => {
  const [tabValue, setTabValue] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [accordionState, setAccordionState] = useState({
    history: true,
    examination: false,
    treatment: false,
    discharge: false,
  });

  const isEditMode = !!existingSummary;
  const serverDate = useServerDate();

  // Load dropdown values
  const { speciality = [] } = useDropdownValues(["speciality"]);
  const { contacts: consultants } = useContactMastByCategory({ consValue: "PHY" });

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch: _watch,
    formState: { errors: _errors, isDirty, isValid, isSubmitting },
  } = useForm<DischargeSummaryFormData>({
    resolver: zodResolver(dischargeSummarySchema),
    mode: "onChange",
  });
  // Initialize form data
  useEffect(() => {
    if (open && discharge && !isInitialized) {
      initializeForm();
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
      setTabValue(0);
    }
  }, [open, discharge, existingSummary, isInitialized]);

  // Initialize form with data
  const initializeForm = useCallback(async () => {
    if (!discharge || !admission) return;

    const admissionData = admission.ipAdmissionDto;
    const reportDate = serverDate;
    const reviewDate = new Date(serverDate);
    reviewDate.setDate(reviewDate.getDate() + 7); // Default review after 7 days

    if (isEditMode && existingSummary) {
      // Populate with existing summary data
      reset({
        ...existingSummary,
        reportDate: existingSummary.reportDate || reportDate,
        reviewDate: existingSummary.reviewDate || reviewDate,
      });
    } else {
      // Initialize new summary
      reset({
        dischgDetID: 0,
        dischgID: discharge.dischgID,
        admitDate: new Date(),
        dischgDate: discharge.dischgDate,
        consultantID: admissionData.attendingPhysicianID || 0,
        consultant: admissionData.attendingPhysicianName || "",
        specialityID: 0,
        reportDate,
        reviewDate: reviewDate,
        // Initialize other fields as empty
        dchNotes: "",
        adviceOnDischarge: "",
        birthHistory: "",
        cheifCompliant: "",
        conditionOnDischarge: "",
        courseInHospital: "",
        deliveryDet: "",
        development: "",
        familyHistory: "",
        finalDiagnosis: "",
        followUp: "",
        history: "",
        immunisation: "",
        intraoperativeFinding: "",
        investigations: "",
        localExam: "",
        menstrualExam: "",
        neonatalDet: "",
        obstericHistory: "",
        otFindings: "",
        pastHistory: "",
        personalHistory: "",
        physicalExam: "",
        postOperTreatment: "",
        procedureDone: "",
        riskFactor: "",
        systemicExam: "",
        treatmentGiven: "",
        vaccination: "",
      });
    }
  }, [discharge, admission, existingSummary, isEditMode, reset, serverDate]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle accordion change
  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setAccordionState((prev) => ({ ...prev, [panel]: isExpanded }));
  };

  // Handle consultant change
  const handleConsultantChange = useCallback(
    (value: any) => {
      const selectedOption = consultants.find((option) => option.value === value.value);
      if (selectedOption) {
        const consultantId = Number(value.value.split("-")[0]);
        setValue("consultantID", consultantId, { shouldValidate: true });
        setValue("consultant", selectedOption.label, { shouldValidate: true });
      }
    },
    [consultants, setValue]
  );

  // Handle speciality change
  const handleSpecialityChange = useCallback(
    (value: any) => {
      const selectedOption = speciality.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("specialityID", Number(value.value), { shouldValidate: true });
        setValue("speciality", selectedOption.label, { shouldValidate: true });
      }
    },
    [speciality, setValue]
  );

  // Form submission
  const handleFormSubmit = async (data: DischargeSummaryFormData) => {
    try {
      console.log("Submitting discharge summary:", data);
      const summaryDto: IpDischargeDetailDto = {
        ...data,
        baseDto: {
          id: data.dischgDetID,
          rActiveYN: "Y",
        },
      } as IpDischargeDetailDto;

      await onSubmit(summaryDto);
    } catch (error) {
      console.error("Error submitting discharge summary:", error);
      throw error;
    }
  };

  // Clear form handler
  const handleClear = () => {
    if (isEditMode) {
      initializeForm();
    } else {
      reset();
    }
  };

  // Close dialog handler
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get patient and admission info
  const patientInfo = useMemo(() => {
    // if (!patient || !admission || !discharge) return null;

    const admissionData = admission.ipAdmissionDto;
    const patientName = `${admissionData.pTitle} ${admissionData.pfName} ${admissionData.pmName || ""} ${admissionData.plName}`.trim();
    const lengthOfStay = calculateDaysBetween(new Date(admissionData.admitDate), new Date(discharge.dischgDate));

    return {
      patientName,
      uhid: admissionData.pChartCode,
      admissionCode: admissionData.admitCode,
      admitDate: new Date(admissionData.admitDate),
      dischargeDate: new Date(discharge.dischgDate),
      lengthOfStay,
      department: admissionData.deptName,
      dischargeType: discharge.dischgType,
      dischargingPhysician: discharge.dischgPhyName,
    };
  }, [patient, admission, discharge]);

  const dialogActions = (
    <Stack direction="row" spacing={1}>
      <CustomButton
        variant="outlined"
        text={isEditMode ? "Reset" : "Clear"}
        icon={ClearIcon}
        onClick={handleClear}
        disabled={isSubmitting || !isDirty}
        color="inherit"
        size="small"
      />
      <CustomButton variant="outlined" text="Cancel" onClick={handleClose} disabled={isSubmitting} size="small" />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Summary" : "Create Summary"}
        icon={SummaryIcon}
        onAsyncClick={handleSubmit(handleFormSubmit)}
        asynchronous
        // disabled={!isValid || (!isEditMode && !isDirty)}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Creating..."}
        successText={isEditMode ? "Updated!" : "Created!"}
        size="small"
      />
    </Stack>
  );

  if (!patient || !admission || !discharge) {
    return null;
  }

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Update Discharge Summary" : "Create Discharge Summary"}
      fullScreen
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ p: 1.5 }}>
        {/* Patient Information Header */}
        <Paper sx={{ p: 1.5, mb: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
              <PatientIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="600">
                {patientInfo?.patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                UHID: {patientInfo?.uhid} | Admission: {patientInfo?.admissionCode} | Stay: {patientInfo?.lengthOfStay} days
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="discharge summary tabs">
            <Tab label="Basic Information" icon={<MedicalIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Medical History" icon={<HistoryIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Examination & Findings" icon={<HospitalIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Treatment & Procedures" icon={<TreatmentIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Discharge Details" icon={<AdviceIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Basic Information Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField
                  name="consultant"
                  control={control}
                  type="select"
                  label="Consultant"
                  required
                  size="small"
                  options={consultants}
                  onChange={handleConsultantChange}
                  adornment={<DoctorIcon />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField
                  name="speciality"
                  control={control}
                  type="select"
                  label="Speciality"
                  required
                  size="small"
                  options={speciality}
                  onChange={handleSpecialityChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="reportDate" control={control} type="datetimepicker" label="Report Date" required size="small" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="cheifCompliant"
                  control={control}
                  type="textarea"
                  label="Chief Complaint"
                  size="small"
                  rows={3}
                  placeholder="Patient's chief complaint on admission..."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField name="admitDate" control={control} type="datetimepicker" label="Admission Date" disabled size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField name="dischgDate" control={control} type="datetimepicker" label="Discharge Date" disabled size="small" />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Medical History Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Accordion expanded={accordionState.history} onChange={handleAccordionChange("history")}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Patient History</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="history"
                          control={control}
                          type="textarea"
                          label="Present History"
                          size="small"
                          rows={3}
                          placeholder="History of present illness..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="pastHistory"
                          control={control}
                          type="textarea"
                          label="Past History"
                          size="small"
                          rows={3}
                          placeholder="Relevant past medical history..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="familyHistory"
                          control={control}
                          type="textarea"
                          label="Family History"
                          size="small"
                          rows={2}
                          placeholder="Relevant family medical history..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="personalHistory"
                          control={control}
                          type="textarea"
                          label="Personal History"
                          size="small"
                          rows={2}
                          placeholder="Personal history including habits..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField
                      name="birthHistory"
                      control={control}
                      type="textarea"
                      label="Birth History"
                      size="small"
                      rows={2}
                      placeholder="Birth and developmental history..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField
                      name="menstrualExam"
                      control={control}
                      type="textarea"
                      label="Menstrual History"
                      size="small"
                      rows={2}
                      placeholder="Menstrual history (if applicable)..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField
                      name="obstericHistory"
                      control={control}
                      type="textarea"
                      label="Obstetric History"
                      size="small"
                      rows={2}
                      placeholder="Obstetric history (if applicable)..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField
                      name="immunisation"
                      control={control}
                      type="textarea"
                      label="Immunization History"
                      size="small"
                      rows={2}
                      placeholder="Immunization history..."
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Examination & Findings Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Accordion expanded={accordionState.examination} onChange={handleAccordionChange("examination")}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Physical Examination</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="physicalExam"
                          control={control}
                          type="textarea"
                          label="General Physical Examination"
                          size="small"
                          rows={3}
                          placeholder="General physical examination findings..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="localExam"
                          control={control}
                          type="textarea"
                          label="Local Examination"
                          size="small"
                          rows={3}
                          placeholder="Local examination findings..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="systemicExam"
                          control={control}
                          type="textarea"
                          label="Systemic Examination"
                          size="small"
                          rows={3}
                          placeholder="Systemic examination findings..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <EnhancedFormField
                      name="investigations"
                      control={control}
                      type="textarea"
                      label="Investigations"
                      size="small"
                      rows={4}
                      placeholder="Laboratory and diagnostic investigations..."
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField name="otFindings" control={control} type="textarea" label="Other Findings" size="small" rows={2} placeholder="Other relevant findings..." />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <EnhancedFormField name="riskFactor" control={control} type="textarea" label="Risk Factors" size="small" rows={2} placeholder="Identified risk factors..." />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Treatment & Procedures Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="finalDiagnosis"
                  control={control}
                  type="textarea"
                  label="Final Diagnosis"
                  size="small"
                  rows={3}
                  placeholder="Final diagnosis at discharge..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Accordion expanded={accordionState.treatment} onChange={handleAccordionChange("treatment")}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Treatment Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="treatmentGiven"
                          control={control}
                          type="textarea"
                          label="Treatment Given"
                          size="small"
                          rows={4}
                          placeholder="Medical treatment provided during admission..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="procedureDone"
                          control={control}
                          type="textarea"
                          label="Procedures Done"
                          size="small"
                          rows={3}
                          placeholder="Surgical or other procedures performed..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="intraoperativeFinding"
                          control={control}
                          type="textarea"
                          label="Intraoperative Findings"
                          size="small"
                          rows={3}
                          placeholder="Findings during surgical procedures..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="postOperTreatment"
                          control={control}
                          type="textarea"
                          label="Post-Operative Treatment"
                          size="small"
                          rows={3}
                          placeholder="Post-operative care and treatment..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="courseInHospital"
                  control={control}
                  type="textarea"
                  label="Course in Hospital"
                  size="small"
                  rows={4}
                  placeholder="Patient's clinical course during hospitalization..."
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Discharge Details Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="conditionOnDischarge"
                  control={control}
                  type="textarea"
                  label="Condition on Discharge"
                  size="small"
                  rows={3}
                  placeholder="Patient's condition at the time of discharge..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Accordion expanded={accordionState.discharge} onChange={handleAccordionChange("discharge")}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Discharge Instructions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="adviceOnDischarge"
                          control={control}
                          type="textarea"
                          label="Advice on Discharge"
                          size="small"
                          rows={4}
                          placeholder="Discharge advice and instructions for the patient..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <EnhancedFormField
                          name="followUp"
                          control={control}
                          type="textarea"
                          label="Follow-up Instructions"
                          size="small"
                          rows={3}
                          placeholder="Follow-up schedule and instructions..."
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <EnhancedFormField name="reviewDate" control={control} type="datetimepicker" label="Review Date" required size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <EnhancedFormField
                          name="vaccination"
                          control={control}
                          type="textarea"
                          label="Vaccination Schedule"
                          size="small"
                          rows={2}
                          placeholder="Recommended vaccinations..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="dchNotes"
                  control={control}
                  type="textarea"
                  label="Additional Discharge Notes"
                  size="small"
                  rows={3}
                  placeholder="Any additional notes or special instructions..."
                />
              </Grid>

              {/* Special Case Fields */}
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">The following fields are applicable only for specific cases</Typography>
                </Alert>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="deliveryDet"
                  control={control}
                  type="textarea"
                  label="Delivery Details"
                  size="small"
                  rows={2}
                  placeholder="Details if delivery case..."
                  helperText="For maternity cases only"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="neonatalDet"
                  control={control}
                  type="textarea"
                  label="Neonatal Details"
                  size="small"
                  rows={2}
                  placeholder="Neonatal information..."
                  helperText="For pediatric/neonatal cases"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="development"
                  control={control}
                  type="textarea"
                  label="Developmental Assessment"
                  size="small"
                  rows={2}
                  placeholder="Developmental milestones..."
                  helperText="For pediatric cases"
                />
              </Grid>
            </Grid>
          </TabPanel>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default DischargeSummaryForm;
