import React, { useState, useEffect, useMemo } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DeptUnitAllocationDto } from "@/interfaces/HospitalAdministration/DeptUnitAllocationDto";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import { Save, Cancel } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useDeptUnitAllocation } from "../hooks/useDeptUnitAllocation";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface DeptUnitAllocationFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: DeptUnitAllocationDto | null;
  viewOnly?: boolean;
}

const formatTimeToString = (date: Date | undefined): string => {
  const dateValue = new Date(date);
  if (!date || isNaN(dateValue.getTime())) return "";
  return dateValue.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const parseTimeToDate = (time: string): Date => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format: ${time}`);
  }
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values: ${time}`);
  }
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const weekDayOptions = [
  { value: "sun", label: "Sunday" },
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
];

const occurrenceOptions = [
  { value: "1", label: "First Week" },
  { value: "2", label: "Second Week" },
  { value: "3", label: "Third Week" },
  { value: "4", label: "Fourth Week" },
  { value: "5", label: "Fifth Week" },
];

const schema = z
  .object({
    dUAID: z.number().default(0),
    deptID: z.number().min(1, "Department is required"),
    deptName: z.string().optional(),
    dulID: z.number().min(1, "Unit is required"),
    unitDesc: z.string().optional(),
    uASTIME: z
      .string()
      .nonempty("Start time is required")
      .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    uAETIME: z
      .string()
      .nonempty("End time is required")
      .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    facultyID: z.number().min(1, "Faculty is required"),
    facultyName: z.string().optional(),
    roomID: z.number().optional(),
    roomName: z.string().optional(),
    resourceID: z.number().optional(),
    resourceName: z.string().optional(),
    specialityID: z.number().optional(),
    unitHeadYN: z.string().optional(),
    fullDay: z.boolean().optional(),
    allDaysYN: z.string().optional(),
    weekDays: z.array(z.string()).optional(),
    occuranceAllYN: z.string().optional(),
    occurrences: z.array(z.string()).optional(),
    rActiveYN: z.string(),
    rNotes: z.string().nullable().optional(),
    transferYN: z.string().optional(),
  })
  .refine(
    (data) => {
      try {
        const startTime = parseTimeToDate(data.uASTIME);
        const endTime = parseTimeToDate(data.uAETIME);
        return endTime > startTime;
      } catch {
        return false;
      }
    },
    {
      message: "End time must be after start time",
      path: ["uAETIME"],
    }
  );

type DeptUnitAllocationFormData = z.infer<typeof schema>;

const DeptUnitAllocationForm: React.FC<DeptUnitAllocationFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const { saveAllocation, checkScheduleConflict, allocationList } = useDeptUnitAllocation();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const {
    department,
    roomList,
    resourceList,
    units,
    appointmentConsultants: facultyList,
  } = useDropdownValues(["department", "roomList", "resourceList", "units", "appointmentConsultants"]);

  const { showAlert } = useAlert();
  const isAddMode = !initialData;

  const defaultValues: DeptUnitAllocationFormData = {
    dUAID: 0,
    deptID: 0,
    deptName: "",
    dulID: 0,
    unitDesc: "",
    uASTIME: "09:00",
    uAETIME: "17:00",
    facultyID: 0,
    facultyName: "",
    roomID: 0,
    roomName: "",
    resourceID: 0,
    resourceName: "",
    specialityID: 0,
    unitHeadYN: "N",
    fullDay: false,
    allDaysYN: "N",
    weekDays: [],
    occuranceAllYN: "N",
    occurrences: [],
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
  } = useForm<DeptUnitAllocationFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const fullDay = watch("fullDay");
  const allDaysYN = watch("allDaysYN");
  const occuranceAllYN = watch("occuranceAllYN");
  const deptID = watch("deptID");

  const filteredUnitList = useMemo(() => {
    if (!deptID || !units) return [];
    return units.filter((unit) => unit.deptID === deptID);
  }, [deptID, units]);

  useEffect(() => {
    if (initialData) {
      const weekDays = [];
      if (initialData.sunYN === "Y") weekDays.push("sun");
      if (initialData.monYN === "Y") weekDays.push("mon");
      if (initialData.tueYN === "Y") weekDays.push("tue");
      if (initialData.wedYN === "Y") weekDays.push("wed");
      if (initialData.thuYN === "Y") weekDays.push("thu");
      if (initialData.friYN === "Y") weekDays.push("fri");
      if (initialData.satYN === "Y") weekDays.push("sat");

      const occurrences = [];
      if (initialData.occurance1YN === "Y") occurrences.push("1");
      if (initialData.occurance2YN === "Y") occurrences.push("2");
      if (initialData.occurance3YN === "Y") occurrences.push("3");
      if (initialData.occurance4YN === "Y") occurrences.push("4");
      if (initialData.occurance5YN === "Y") occurrences.push("5");

      reset({
        ...initialData,
        uASTIME: formatTimeToString(initialData.uASTIME),
        uAETIME: formatTimeToString(initialData.uAETIME),
        fullDay: false,
        weekDays,
        occurrences,
      } as DeptUnitAllocationFormData);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (fullDay) {
      setValue("uASTIME", "00:00", { shouldValidate: true });
      setValue("uAETIME", "23:59", { shouldValidate: true });
    }
  }, [fullDay, setValue]);

  const handleAllDaysChange = (checked: boolean) => {
    const value = checked ? "Y" : "N";
    setValue("allDaysYN", value);
    setValue("weekDays", checked ? weekDayOptions.map((opt) => opt.value) : [], { shouldValidate: true });
  };

  const handleAllOccurrencesChange = (checked: boolean) => {
    const value = checked ? "Y" : "N";
    setValue("occuranceAllYN", value);
    setValue("occurrences", checked ? occurrenceOptions.map((opt) => opt.value) : [], { shouldValidate: true });
  };

  const onSubmit = async (data: DeptUnitAllocationFormData) => {
    if (viewOnly) return;

    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const weekDaysFlags = {
        sunYN: data.weekDays.includes("sun") ? "Y" : "N",
        monYN: data.weekDays.includes("mon") ? "Y" : "N",
        tueYN: data.weekDays.includes("tue") ? "Y" : "N",
        wedYN: data.weekDays.includes("wed") ? "Y" : "N",
        thuYN: data.weekDays.includes("thu") ? "Y" : "N",
        friYN: data.weekDays.includes("fri") ? "Y" : "N",
        satYN: data.weekDays.includes("sat") ? "Y" : "N",
      };

      const occurrencesFlags = {
        occurance1YN: data.occurrences.includes("1") ? "Y" : "N",
        occurance2YN: data.occurrences.includes("2") ? "Y" : "N",
        occurance3YN: data.occurrences.includes("3") ? "Y" : "N",
        occurance4YN: data.occurrences.includes("4") ? "Y" : "N",
        occurance5YN: data.occuranceAllYN === "Y" ? "Y" : data.occurrences.includes("5") ? "Y" : "N",
      };

      const uASTIME = parseTimeToDate(data.uASTIME);
      const uAETIME = parseTimeToDate(data.uAETIME);

      const allocationData: DeptUnitAllocationDto = {
        dUAID: data.dUAID ?? 0,
        deptID: data.deptID,
        deptName: data.deptName ?? "",
        dulID: data.dulID,
        unitDesc: data.unitDesc ?? "",
        uASTIME,
        uAETIME,
        facultyID: data.facultyID,
        facultyName: data.facultyName ?? "",
        roomID: data.roomID ?? 0,
        roomName: data.roomName ?? "",
        resourceID: data.resourceID ?? 0,
        resourceName: data.resourceName ?? "",
        specialityID: data.specialityID ?? 0,
        unitHeadYN: data.unitHeadYN ?? "N",
        allDaysYN: data.allDaysYN ?? "N",
        ...weekDaysFlags,
        occuranceAllYN: data.occuranceAllYN ?? "N",
        ...occurrencesFlags,
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes ?? "",
        transferYN: data.transferYN ?? "N",
      };

      const conflictCheck = checkScheduleConflict(allocationData, allocationList);
      if (conflictCheck.hasConflict) {
        setFormError(conflictCheck.message!);
        showAlert("Warning", conflictCheck.message!, "warning");
        return;
      }

      const response = await saveAllocation(allocationData);

      if (response.success) {
        showAlert("Success", isAddMode ? "Allocation created successfully" : "Allocation updated successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save allocation");
      }
    } catch (error) {
      console.error("Error saving allocation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save allocation";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    if (initialData) {
      const weekDays = [];
      if (initialData.sunYN === "Y") weekDays.push("sun");
      if (initialData.monYN === "Y") weekDays.push("mon");
      if (initialData.tueYN === "Y") weekDays.push("tue");
      if (initialData.wedYN === "Y") weekDays.push("wed");
      if (initialData.thuYN === "Y") weekDays.push("thu");
      if (initialData.friYN === "Y") weekDays.push("fri");
      if (initialData.satYN === "Y") weekDays.push("sat");

      const occurrences = [];
      if (initialData.occurance1YN === "Y") occurrences.push("1");
      if (initialData.occurance2YN === "Y") occurrences.push("2");
      if (initialData.occurance3YN === "Y") occurrences.push("3");
      if (initialData.occurance4YN === "Y") occurrences.push("4");
      if (initialData.occurance5YN === "Y") occurrences.push("5");

      reset({
        ...initialData,
        uASTIME: formatTimeToString(initialData.uASTIME),
        uAETIME: formatTimeToString(initialData.uAETIME),
        fullDay: false,
        weekDays,
        occurrences,
      } as DeptUnitAllocationFormData);
    } else {
      reset(defaultValues);
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

  const dialogTitle = viewOnly ? "View Allocation Details" : isAddMode ? "Create New Department Unit Allocation" : `Edit Allocation - ${initialData?.unitDesc ?? ""}`;

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={isAddMode ? "Create Allocation" : "Update Allocation"}
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

  return (
    <>
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

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <FormField name="rActiveYN" control={control} label="Active" type="switch" disabled={viewOnly} size="small" />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department & Unit Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                      <FormField
                        name="deptID"
                        control={control}
                        label="Department"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={department}
                        fullWidth
                        onChange={(value) => {
                          const selectedDept = department?.find((dept) => Number(dept.value) === Number(value.value));
                          setValue("deptName", selectedDept?.label || "");
                          setValue("dulID", 0);
                          setValue("unitDesc", "");
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                      <FormField
                        name="dulID"
                        control={control}
                        label="Unit"
                        type="select"
                        required
                        disabled={viewOnly || !deptID}
                        size="small"
                        options={filteredUnitList}
                        fullWidth
                        onChange={(value) => {
                          const selectedUnit = filteredUnitList?.find((unit) => Number(unit.value) === Number(value.value));
                          setValue("unitDesc", selectedUnit?.label || "");
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schedule
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <FormField name="fullDay" control={control} label="Full Day" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                      <FormField name="uASTIME" control={control} label="Start Time" type="timepicker" required disabled={viewOnly || fullDay} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                      <FormField name="uAETIME" control={control} label="End Time" type="timepicker" required disabled={viewOnly || fullDay} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <FormField
                        name="facultyID"
                        control={control}
                        label="Faculty/Physician"
                        type="select"
                        required
                        disabled={viewOnly}
                        size="small"
                        options={facultyList}
                        fullWidth
                        onChange={(value) => {
                          const selectedFaculty = facultyList?.find((faculty) => Number(faculty.value) === Number(value.value));
                          setValue("facultyName", selectedFaculty?.label || "");
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resources
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <FormField
                        name="roomID"
                        control={control}
                        label="Room"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        options={roomList}
                        fullWidth
                        onChange={(value) => {
                          const selectedRoom = roomList?.find((room) => Number(room.value) === Number(value.value));
                          setValue("roomName", selectedRoom?.label || "");
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <FormField
                        name="resourceID"
                        control={control}
                        label="Resource"
                        type="select"
                        disabled={viewOnly}
                        size="small"
                        options={resourceList}
                        fullWidth
                        onChange={(value) => {
                          const selectedResource = resourceList?.find((resource) => Number(resource.value) === Number(value.value));
                          setValue("resourceName", selectedResource?.label || "");
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <FormField name="unitHeadYN" control={control} label="Unit Head" type="switch" disabled={viewOnly} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Week Days
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={allDaysYN === "Y"} onChange={(e) => handleAllDaysChange(e.target.checked)} disabled={viewOnly} />}
                      label="All Days"
                    />
                    <Box sx={{ mt: 2 }}>
                      <FormField
                        name="weekDays"
                        control={control}
                        label="Select Days"
                        type="multiselect"
                        options={weekDayOptions}
                        disabled={viewOnly || allDaysYN === "Y"}
                        size="small"
                        fullWidth
                        multiple
                      />
                    </Box>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Occurrences
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={occuranceAllYN === "Y"} onChange={(e) => handleAllOccurrencesChange(e.target.checked)} disabled={viewOnly} />}
                      label="All Occurrences"
                    />
                    <Box sx={{ mt: 2 }}>
                      <FormField
                        name="occurrences"
                        control={control}
                        label="Select Occurrences"
                        type="multiselect"
                        options={occurrenceOptions}
                        disabled={viewOnly || occuranceAllYN === "Y"}
                        size="small"
                        fullWidth
                        multiple
                      />
                    </Box>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormField
                    name="rNotes"
                    control={control}
                    label="Notes"
                    type="textarea"
                    disabled={viewOnly}
                    size="small"
                    fullWidth
                    rows={4}
                    placeholder="Enter any additional information about this allocation"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
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
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleCancelConfirm}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        type="warning"
        maxWidth="sm"
      />
    </>
  );
};

export default DeptUnitAllocationForm;
