import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { DateFilterType, GetPatientAllVisitHistory, OPVisitDto } from "@/interfaces/PatientAdministration/revisitFormData";
import { useAlert } from "@/providers/AlertProvider";
import { ContactMastService } from "@/services/NotGenericPaternServices/ContactMastService";
import { getPatientAllVisitHistory, RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Grid, Paper, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatDateTime } from "../../../../utils/Common/formatUtils";
import { useRevisit } from "../hooks/useRevisitForm";
import VisitDetailsForm from "./VisitDetailsForm";

interface PatientVisitDialogProps {
  pChartID: number;
  pChartCode: string;
  open: boolean;
  onClose: () => void;
  onVisitSelect?: (visit: GetPatientAllVisitHistory) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

// Schema for visit form
const visitSchema = z.object({
  opVID: z.number().default(0),
  pChartID: z.number().default(0),
  pVisitDate: z.date().default(new Date()),
  patOPIP: z.string().default("O"),
  attendingPhysicianId: z.union([z.number(), z.string()]).default(0),
  attendingPhysicianSpecialtyId: z.number().default(0),
  attendingPhysicianName: z.string().default(""),
  attendingPhysicianSpecialty: z.string().default(""),
  primaryReferralSourceId: z.number().default(0),
  primaryReferralSourceName: z.string().default(""),
  pVisitStatus: z.string().default("W"),
  pVisitType: z.enum(["H", "P"]).default("P"),
  pVisitTypeText: z.string().default(""),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().default(""),
  pTypeID: z.number().default(0),
  pTypeCode: z.string().default(""),
  pTypeName: z.string().default(""),
  deptID: z.number().default(0),
  deptName: z.string().default(""),
  opNumber: z.string().default(""),
  pChartCompID: z.number().default(0),
});

type VisitFormData = z.infer<typeof visitSchema>;

const PatientVisitDialog: React.FC<PatientVisitDialogProps> = ({ open, onClose, pChartID, pChartCode, onVisitSelect }) => {
  const { setLoading } = useLoading();
  const { saveVisit, fetchVisitList } = useRevisit();
  const { showAlert } = useAlert();
  const [visitHistory, setVisitHistory] = useState<GetPatientAllVisitHistory[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [availableAttendingPhysicians, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource] = useState<DropdownOption[]>([
    { value: "1", label: "Test 01" },
    { value: "2", label: "Test 02" },
  ]);
  const dropdownValues = useDropdownValues(["pic", "department"]);

  const defaultValues: VisitFormData = {
    opVID: 0,
    pChartID: pChartID,
    pVisitDate: new Date(),
    patOPIP: "O",
    attendingPhysicianId: 0,
    attendingPhysicianName: "",
    attendingPhysicianSpecialtyId: 0,
    attendingPhysicianSpecialty: "",
    primaryReferralSourceId: 0,
    primaryReferralSourceName: "",
    pVisitStatus: "W",
    pVisitType: "P",
    pVisitTypeText: "",
    rActiveYN: "Y",
    rNotes: "",
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    deptID: 0,
    deptName: "",
    opNumber: "",
    pChartCompID: 0,
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { isDirty, isValid, errors },
  } = useForm<VisitFormData>({
    defaultValues,
    resolver: zodResolver(visitSchema),
    mode: "onChange",
  });

  const watchedVisitType = watch("pVisitType");

  useEffect(() => {
    if (pChartID > 0 && open) {
      fetchPatientAllVisitHistory();
      loadInitialData();
    }
  }, [pChartID, open]);

  useEffect(() => {
    if (open) {
      setTabValue(0);
      setValue("pChartID", pChartID);
    }
  }, [open, pChartID, setValue]);

  const fetchPatientAllVisitHistory = async () => {
    try {
      const response = await getPatientAllVisitHistory(pChartID);
      setVisitHistory(response.data);
    } catch (error) {
      console.error("Error fetching visit history:", error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load available physicians
      const availablePhysicians = await ContactMastService.fetchAvailableAttendingPhysicians(pChartID);
      setAvailableAttendingPhysicians(
        availablePhysicians.map((item) => ({
          value: item.value.toString(),
          label: item.label,
        }))
      );

      // Load last visit details
      const lastVisitResult = await RevisitService.getLastVisitDetailsByPChartID(pChartID);
      if (lastVisitResult && lastVisitResult.success && lastVisitResult.data) {
        setValue("deptID", lastVisitResult.data.deptID || 0);
        setValue("pTypeID", lastVisitResult.data.pTypeID || 0);
        setValue("primaryReferralSourceId", lastVisitResult.data.primaryReferralSourceId || 0);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const DepartmentDropdownValues = useMemo(() => {
    if (!dropdownValues.department) return [];
    return dropdownValues.department.filter((item: any) => item.rActiveYN === "Y" && item.isUnitYN === "Y");
  }, [dropdownValues.department]);

  const handleRadioButtonChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValue("pVisitType", value as "H" | "P", { shouldValidate: true, shouldDirty: true });
      setValue("pVisitTypeText", event.target.labels?.[0]?.textContent || "");

      if (value === "H") {
        setValue("attendingPhysicianId", 0);
        setValue("attendingPhysicianName", "");
        setValue("attendingPhysicianSpecialtyId", 0);
        setValue("attendingPhysicianSpecialty", "");
      } else {
        setValue("deptID", 0);
        setValue("deptName", "");
      }

      await trigger();
    },
    [setValue, trigger]
  );

  const handlePhysicianChange = useCallback(
    async (event: any) => {
      const selectedValue = event.value || event.target?.value;
      const selectedLabel = event.label;

      if (!selectedValue || selectedValue === "" || selectedValue === "0") {
        setValue("attendingPhysicianId", 0);
        setValue("attendingPhysicianSpecialtyId", 0);
        setValue("attendingPhysicianName", "");
        setValue("attendingPhysicianSpecialty", "");
        return;
      }

      if (typeof selectedValue === "string" && selectedValue.includes("-")) {
        const [conIDStr] = selectedValue.split("-");
        const physicianId = parseInt(conIDStr, 10);

        let physicianName = "";
        let physicianSpecialty = "";

        const selectedPhysician = availableAttendingPhysicians.find((physician) => physician.value === selectedValue);
        if (selectedPhysician) {
          const labelParts = selectedPhysician.label.split("|");
          physicianName = labelParts[0]?.trim() || "";
          physicianSpecialty = labelParts[1]?.trim() || "Unknown Specialty";
        }

        setValue("attendingPhysicianId", selectedValue);
        setValue("attendingPhysicianSpecialtyId", physicianId);
        setValue("attendingPhysicianName", physicianName);
        setValue("attendingPhysicianSpecialty", physicianSpecialty);
      }
    },
    [setValue, availableAttendingPhysicians]
  );

  const handleDropdownChange = useCallback(
    async (fieldName: keyof VisitFormData, value: string | number, _options?: DropdownOption[], additionalFields?: Record<string, any>) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, val]) => {
          setValue(key as keyof VisitFormData, val, { shouldDirty: true });
        });
      }
      await trigger();
    },
    [setValue, trigger]
  );

  const extractPhysicianId = (attendingPhysicianId: string | number): number => {
    if (typeof attendingPhysicianId === "number") return attendingPhysicianId;
    if (typeof attendingPhysicianId === "string" && attendingPhysicianId.includes("-")) {
      const parts = attendingPhysicianId.split("-");
      const physicianId = parseInt(parts[0], 10);
      return isNaN(physicianId) ? 0 : physicianId;
    }
    return 0;
  };

  const onSubmit = async (data: VisitFormData) => {
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const physicianId = extractPhysicianId(data.attendingPhysicianId);

      if (!data.pTypeID || data.pTypeID === 0) {
        setFormError("Payment Source is required");
        return;
      }

      if (!data.primaryReferralSourceId || data.primaryReferralSourceId === 0) {
        setFormError("Primary Introducing Source is required");
        return;
      }

      if (data.pVisitType === "H" && (!data.deptID || data.deptID === 0)) {
        setFormError("Department is required for hospital visits");
        return;
      }

      if (data.pVisitType === "P" && physicianId === 0) {
        setFormError("Attending Physician is required for physician visits");
        return;
      }

      const visitData: OPVisitDto = {
        ...data,
        attendingPhysicianId: physicianId,
        pChartID: pChartID,
        pChartCode: pChartCode,
        oldPChartID: 0,
        primaryPhysicianId: 0,
        primaryPhysicianName: "",
        crossConsultation: "N",
        refFacultyID: 0,
        refFaculty: "",
        secondaryReferralSourceId: 0,
        secondaryReferralSourceName: "",
        transferYN: "N",
      } as unknown as OPVisitDto;

      const response = await saveVisit(visitData);

      if (response.success) {
        showAlert("Success", "Visit created successfully", "success");
        reset(defaultValues);
        onClose();
        fetchVisitList(DateFilterType.Today, null, null);
      } else {
        throw new Error(response.errorMessage || "Failed to save visit");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save visit";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setFormError(null);
  };

  const columns: Column<GetPatientAllVisitHistory>[] = [
    {
      key: "opNumber",
      header: "Reference Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pVisitDate",
      header: "Visit Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 160,
      render: (item) => formatDateTime(item.pVisitDate),
    },
    {
      key: "pVisitType",
      header: "Visit Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 110,
      formatter: (value: string) => <Chip size="small" color={value === "H" ? "info" : "secondary"} label={value === "H" ? "Hospital" : "Physician"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 200,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Select Visit">
            <SmartButton
              text="Select"
              onClick={() => {
                if (onVisitSelect) {
                  onVisitSelect(item);
                }
                onClose();
              }}
              variant="contained"
              color="primary"
            />
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const isHospitalVisit = watchedVisitType === "H";
  const isPhysicianVisit = watchedVisitType === "P";

  return (
    <GenericDialog open={open} onClose={onClose} title="Patient Visit History" maxWidth="md" fullWidth showCloseButton>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient visit tabs">
            <Tab label="Create New Visit" />
            <Tab label="Select Old Visit" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
                  {formError}
                </Alert>
              )}

              <VisitDetailsForm
                control={control}
                errors={errors}
                watchedVisitType={watchedVisitType}
                dropdownValues={dropdownValues}
                DepartmentDropdownValues={DepartmentDropdownValues}
                availableAttendingPhysicians={availableAttendingPhysicians}
                primaryIntroducingSource={primaryIntroducingSource}
                handleRadioButtonChange={handleRadioButtonChange}
                handlePhysicianChange={handlePhysicianChange}
                handleDropdownChange={handleDropdownChange}
                showCard={true}
              />

              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || !isDirty} />
                <SmartButton
                  text="Create Visit"
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  onClick={handleSubmit(onSubmit)}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText="Creating..."
                  successText="Created!"
                  disabled={isSaving || !isDirty || !isValid}
                />
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid size={{ sm: 12, md: 8 }}>
                  <Typography variant="h5" component="h1" gutterBottom>
                    Patient Visits {pChartID ? `for UHID: ${pChartCode}` : ""}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <CustomGrid columns={columns} data={visitHistory} maxHeight="calc(100vh - 320px)" emptyStateMessage="No visits found" loading={false} />
            </Paper>
          </Box>
        </TabPanel>
      </Box>
    </GenericDialog>
  );
};

export default PatientVisitDialog;
