import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent,
  Alert,
  FormControlLabel,
  Switch,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { BreakListData, BreakConDetailData, FrequencyData, BreakListDto } from "@/interfaces/FrontOffice/BreakListData";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import CustomButton from "@/components/Button/CustomButton";
import { Save, Cancel, ChangeCircle } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import CustomCheckbox from "@/components/Checkbox/Checkbox";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { useServerDate } from "@/hooks/Common/useServerDate";

import { formatDate } from "@/utils/Common/dateUtils";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import BreakFrequency from "./BreakFrequency";
import { zodResolver } from "@hookform/resolvers/zod";
import { frequencyCodeMap, weekDayCodeMap } from "../MainPage/BreakListPage";

import { useBreakList } from "../hooks/useBreakList";
import { useBreakConDetails } from "../hooks/useBreakConDetails";

interface BreakListFormProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  initialData: BreakListData | null;
  viewOnly?: boolean;
}

const schema = z.object({
  bLID: z.number(),
  bLName: z.string().nonempty("Break name is required"),
  bLStartTime: z.date(),
  bLEndTime: z.date(),
  bLStartDate: z.date(),
  bLEndDate: z.date(),
  bLFrqNo: z.number().min(0, "Frequency number must be positive").optional(),
  bLFrqDesc: z.string().optional(),
  bLFrqWkDesc: z.string().optional(),
  bColor: z.string().optional(),
  rActiveYN: z.string(),
  rNotes: z.string().nullable().optional(),
  isPhyResYN: z.string(),
  transferYN: z.string().optional(),
});

type BreakListFormData = z.infer<typeof schema>;

const BreakListForm: React.FC<BreakListFormProps> = ({ open, onClose, initialData, viewOnly = false }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { showAlert } = useAlert();

  const { saveBreak } = useBreakList();
  const { breakConDetailsList, fetchBreakConDetails } = useBreakConDetails();

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isOneDay, setIsOneDay] = useState(false);
  const [openFrequencyDialog, setOpenFrequencyDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState("physician");
  const [consultantData, setConsultantData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [frequencyData, setFrequencyData] = useState<FrequencyData>({
    frequency: "none",
    endDate: serverDate ? serverDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    interval: 1,
    weekDays: [],
  });
  const { resourceList, appointmentConsultants } = useDropdownValues(["resourceList", "appointmentConsultants"]);

  const defaultValues: BreakListData = {
    bLID: 0,
    bLName: "",
    bLStartTime: serverDate || new Date(),
    bLEndTime: serverDate || new Date(),
    bLStartDate: serverDate || new Date(),
    bLEndDate: serverDate || new Date(),
    bLFrqNo: 0,
    bLFrqDesc: "",
    bLFrqWkDesc: "",
    bColor: "",
    rActiveYN: "Y",
    rNotes: "",
    isPhyResYN: "Y",
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
    watch,
  } = useForm<BreakListFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const rActiveYN = useWatch({ control, name: "rActiveYN" });
  const startDate = watch("bLStartDate");
  const endDate = watch("bLEndDate");
  const startTime = watch("bLStartTime");
  const endTime = watch("bLEndTime");
  const isPhyResYN = watch("isPhyResYN");
  const isSuspended = initialData?.status === "Suspended";
  const generateFrequencyDescription = (data: FrequencyData): string => {
    const formattedEndDate = formatDate(data.endDate);
    switch (data.frequency) {
      case "daily":
        return `Every ${data.interval} Day${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "weekly":
        const selectedDays = data.weekDays.map((day) => day.slice(0, 3)).join("-");
        return `Every ${data.interval} Week${data.interval > 1 ? "s" : ""} On ${selectedDays} Till ${formattedEndDate}`;
      case "monthly":
        return `Every ${data.interval} Month${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "yearly":
        return `Every ${data.interval} Year${data.interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      default:
        return `No Repeat End Date: ${formattedEndDate}`;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedOption === "resource") {
        setResourceData(resourceList || []);
      } else {
        setConsultantData(appointmentConsultants);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedOption, resourceList, setLoading]);

  useEffect(() => {
    if (initialData) {
      const formData: BreakListFormData = {
        ...initialData,
        bLStartTime: new Date(initialData.bLStartTime),
        bLEndTime: new Date(initialData.bLEndTime),
        bLStartDate: new Date(initialData.bLStartDate),
        bLEndDate: new Date(initialData.bLEndDate),
      };
      reset(formData);

      setSelectedOption(initialData.isPhyResYN === "Y" ? "physician" : "resource");

      const frequencyKey = Object.keys(frequencyCodeMap).find((key) => frequencyCodeMap[key as keyof typeof frequencyCodeMap] === initialData.bLFrqDesc);
      const freqData: FrequencyData = {
        frequency: frequencyKey || "none",
        endDate: new Date(initialData.bLEndDate).toISOString().split("T")[0],
        interval: initialData.bLFrqNo || 1,
        weekDays: initialData.bLFrqWkDesc ? initialData.bLFrqWkDesc.split(",") : [],
      };
      setFrequencyData(freqData);

      loadBreakConDetails(initialData.bLID);
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadBreakConDetails = async (bLID: number) => {
    try {
      await fetchBreakConDetails();
      const filteredConDetails = breakConDetailsList.filter((bcd: any) => bcd.bLID === bLID);

      if (filteredConDetails.length > 0) {
        const selectedHPLIDs = filteredConDetails.map((detail: BreakConDetailData) => detail.hPLID);
        setSelectedItems(selectedHPLIDs.filter((id): id is number => id !== null));
      }
    } catch (error) {
      console.error("Error loading break connection details:", error);
    }
  };

  const handleOneDayToggle = useCallback(
    (checked: boolean) => {
      setIsOneDay(checked);

      if (checked) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 0, 0);

        setValue("bLStartTime", startOfDay);
        setValue("bLEndTime", endOfDay);
      } else {
        const defaultStartTime = new Date(startDate);
        defaultStartTime.setHours(9, 0, 0, 0);

        const defaultEndTime = new Date(startDate);
        defaultEndTime.setHours(9, 45, 0, 0);

        setValue("bLStartTime", defaultStartTime);
        setValue("bLEndTime", defaultEndTime);
      }
    },
    [startDate, setValue]
  );

  const handleRadioChange = useCallback(
    (value: string) => {
      setSelectedOption(value);
      setValue("isPhyResYN", value === "physician" ? "Y" : "N");
      setSelectedItems([]);
    },
    [setValue]
  );

  const handleCheckboxChange = useCallback((id: number, isChecked: boolean) => {
    setSelectedItems((prevItems) => (isChecked ? [...prevItems, id] : prevItems.filter((item) => item !== id)));
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (selectedOption === "resource") {
        setSelectedItems(checked ? resourceData.map((item) => item.rLID) : []);
      } else {
        setSelectedItems(checked ? consultantData.map((item) => item.conID) : []);
      }
    },
    [selectedOption, resourceData, consultantData]
  );

  const renderCheckbox = useCallback(
    (item: any) => {
      const id = selectedOption === "resource" ? item.rLID : item.conID;
      return (
        <CustomCheckbox
          label=""
          name={`select-${id}`}
          checked={selectedItems.includes(id)}
          onChange={(e: any) => handleCheckboxChange(id, e.target.checked)}
          size="small"
          disabled={viewOnly}
        />
      );
    },
    [selectedOption, selectedItems, handleCheckboxChange, viewOnly]
  );

  const renderConsultantName = useCallback((item: any) => {
    const { conTitle, conFName, conMName, conLName } = item;
    return `${conTitle || ""} ${conFName || ""} ${conMName || ""} ${conLName || ""}`.trim();
  }, []);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setValue("bLEndDate", startDate);
    }
  }, [startDate, endDate, setValue]);

  useEffect(() => {
    if (startDate && endDate && startTime && endTime && !isOneDay) {
      const isSameDay = startDate === endDate;
      if (isSameDay && startTime >= endTime) {
        const newEndTime = new Date(startTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + 30);
        setValue("bLEndTime", newEndTime);
      }
    }
  }, [startDate, endDate, startTime, endTime, setValue, isOneDay]);

  const handleSaveFrequency = useCallback(
    (data: FrequencyData) => {
      setFrequencyData(data);
      setValue("bLEndDate", new Date(data.endDate));
      setValue("bLFrqDesc", generateFrequencyDescription(data));
      setOpenFrequencyDialog(false);
    },
    [setValue]
  );
  const onSubmit = async (data: BreakListFormData) => {
    if (viewOnly) return;
    if (selectedItems.length === 0) {
      return showAlert("Warning", "Please select at least one resource or physician", "warning");
    }
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      const frequencyKey = frequencyData.frequency as keyof typeof frequencyCodeMap;
      data.bLFrqDesc = frequencyCodeMap[frequencyKey] || "FO70";
      data.bLFrqNo = frequencyData.interval || 0;

      if (frequencyData.frequency === "weekly") {
        data.bLFrqWkDesc = frequencyData.weekDays
          .map((day) => {
            const dayKey = day as keyof typeof weekDayCodeMap;
            return weekDayCodeMap[dayKey];
          })
          .join(",");
      } else {
        data.bLFrqWkDesc = "";
      }

      const breakData: BreakListData = {
        bLID: data.bLID,
        bLName: data.bLName,
        bLStartTime: data.bLStartTime,
        bLEndTime: data.bLEndTime,
        bLStartDate: data.bLStartDate,
        bLEndDate: data.bLEndDate,
        bLFrqNo: data.bLFrqNo || 0,
        bLFrqDesc: data.bLFrqDesc || "",
        bLFrqWkDesc: data.bLFrqWkDesc || "",
        bColor: data.bColor || "",
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        isPhyResYN: data.isPhyResYN || "Y",
        transferYN: data.transferYN || "N",
      };
      const breakConDetails = selectedItems.map((itemID) => {
        const breakConDetailData: BreakConDetailData = {
          bCDID: 0,
          blID: 0,
          hPLID: itemID,
          rActiveYN: "Y",
          rNotes: "",
          transferYN: "N",
        };
        return breakConDetailData;
      });

      const breakListSaveData: BreakListDto = {
        breakList: breakData,
        breakConDetails: breakConDetails,
      };
      const response = await saveBreak(breakListSaveData);

      if (response.success) {
        showAlert("Success", "Break created successfully", "success");
        onClose(true);
      } else {
        throw new Error(response.errorMessage || "Failed to save break");
      }
    } catch (error) {
      console.error("Error saving break:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save break";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(initialData ? (initialData as BreakListFormData) : defaultValues);
    setFormError(null);
    setSelectedItems([]);
    setIsOneDay(false);
    setFrequencyData({
      frequency: "none",
      endDate: serverDate ? serverDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      interval: 1,
      weekDays: [],
    });
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

  const formatTimeStringToDate = (timeString: string): Date => {
    const today = new Date();
    const [hours, minutes] = timeString.split(":");

    const dateWithTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
    return dateWithTime;
  };
  const dialogTitle = viewOnly ? "View Break Details" : "Create New Break";

  const dialogActions = viewOnly ? (
    <SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />
  ) : (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Cancel" onClick={handleCancel} variant="outlined" color="inherit" disabled={isSaving} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={Cancel} disabled={isSaving || (!isDirty && !formError)} />
        <SmartButton
          text={"Create Break"}
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          icon={Save}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText={"Creating..."}
          successText={"Created!"}
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
          {isSuspended && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                This break is suspended from {formatDate(initialData.bCSStartDate)} until {formatDate(initialData.bCSEndDate)}.
              </Typography>
            </Alert>
          )}
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="bLName" control={control} label="Break Name" type="text" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Schedule Information Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Schedule Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="bLStartDate" control={control} label="Start Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="bLEndDate" control={control} label="End Date" type="datepicker" required disabled={viewOnly} size="small" fullWidth />
                    </Grid>
                    <Grid size={{ sm: 12, md: 2 }}>
                      <FormControlLabel
                        control={<Switch checked={isOneDay} onChange={(e) => handleOneDayToggle(e.target.checked)} disabled={viewOnly} size="small" />}
                        label="One Day"
                      />
                    </Grid>
                    <Grid size={{ sm: 12, md: 5 }}>
                      <FormField
                        name="bLStartTime"
                        control={control}
                        label="Start Time"
                        type="timepicker"
                        required
                        disabled={viewOnly || isOneDay}
                        size="small"
                        fullWidth
                        onChange={(item) => {
                          const formattedTime = formatTimeStringToDate(item);
                          setValue("bLStartTime", formattedTime);
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 5 }}>
                      <FormField
                        name="bLEndTime"
                        control={control}
                        label="End Time"
                        type="timepicker"
                        required
                        disabled={viewOnly || isOneDay}
                        size="small"
                        fullWidth
                        onChange={(item) => {
                          const formattedTime = formatTimeStringToDate(item);
                          setValue("bLEndTime", formattedTime);
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 8 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FormField name="bLFrqDesc" control={control} label="Repeat" type="text" disabled={true} size="small" fullWidth />
                        {!viewOnly && (
                          <CustomButton variant="contained" text="Change" icon={ChangeCircle} size="small" color="secondary" onClick={() => setOpenFrequencyDialog(true)} />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Resource/Physician Selection Section */}

            {viewOnly ? (
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assigned {isPhyResYN === "Y" ? "Physician" : "Resource"}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {isPhyResYN === "Y"
                        ? consultantData
                            .filter((item) => initialData.hPLID === item.conID)
                            .map((item) => renderConsultantName(item))
                            .join(", ")
                        : resourceData
                            .filter((item) => initialData.hPLID === item.rLID)
                            .map((item) => item.rLName)
                            .join(", ")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              <Grid size={{ sm: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assignment
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ sm: 12 }}>
                        <FormControl component="fieldset" disabled={viewOnly}>
                          <FormLabel component="legend">Choose Option</FormLabel>
                          <RadioGroup row value={selectedOption} onChange={(e) => handleRadioChange(e.target.value)}>
                            <FormControlLabel value="physician" control={<Radio size="small" />} label="Physician" />
                            <FormControlLabel value="resource" control={<Radio size="small" />} label="Resource" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      <Grid size={{ sm: 12 }}>
                        {(selectedOption === "resource" || selectedOption === "physician") && (
                          <TableContainer component={Paper} sx={{ maxHeight: "300px", minHeight: "300px" }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    <CustomCheckbox
                                      label=""
                                      name="selectAll"
                                      checked={selectedItems.length > 0 && selectedItems.length === (selectedOption === "resource" ? resourceData.length : consultantData.length)}
                                      onChange={(e) => handleSelectAll(e.target.checked)}
                                      size="small"
                                      disabled={viewOnly}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>{selectedOption === "resource" ? "Resource Name" : "Consultant Name"}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(selectedOption === "resource" ? resourceData : consultantData).map((item) => {
                                  const id = selectedOption === "resource" ? item.rLID : item.conID;
                                  return (
                                    <TableRow key={id}>
                                      <TableCell>{renderCheckbox(item)}</TableCell>
                                      <TableCell>{selectedOption === "resource" ? item.rLName : renderConsultantName(item)}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notes Section */}
            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        disabled={viewOnly}
                        size="small"
                        fullWidth
                        rows={4}
                        placeholder="Enter any additional information about this break"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
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

      <BreakFrequency
        open={openFrequencyDialog}
        onClose={() => setOpenFrequencyDialog(false)}
        endDateFromBreakDetails={frequencyData.endDate}
        onSave={handleSaveFrequency}
        initialFrequencyData={frequencyData}
      />
    </>
  );
};

export default BreakListForm;
