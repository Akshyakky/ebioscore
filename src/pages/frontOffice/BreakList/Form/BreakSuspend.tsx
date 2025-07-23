import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { BreakConSuspendDto, BreakListData } from "@/interfaces/FrontOffice/BreakListDto";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Close } from "@mui/icons-material";
import { Box, Grid, TextField } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useBreakConSuspend } from "../hooks/useBreakConSuspend";

const suspendSchema = z.object({
  bCSStartDate: z.date({
    required_error: "Suspend Start Date is required",
    invalid_type_error: "Invalid date format",
  }),

  bCSEndDate: z
    .date({
      required_error: "Suspend End Date is required",
      invalid_type_error: "Invalid date format",
    })
    .refine(
      (endDate) => {
        const startDate = new Date();
        return endDate >= startDate;
      },
      {
        message: "End date must be on or after the start date",
      }
    ),
  rNotes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

type SuspendFormData = z.infer<typeof suspendSchema>;

interface BreakSuspendProps {
  open: boolean;
  onClose: (isSaved: boolean, updatedData?: BreakConSuspendDto) => void;
  breakData: BreakConSuspendDto | null;
}

const formatToDDMMYYYY = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj
    .toLocaleDateString("en-In", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join("/");
};

const BreakSuspend: React.FC<BreakSuspendProps> = ({ open, onClose, breakData }) => {
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { showAlert } = useAlert();

  const { saveBreakConSuspend } = useBreakConSuspend();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
    defaultValues: {
      bCSStartDate: serverDate,
      bCSEndDate: serverDate,
      rNotes: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open && breakData) {
      reset({
        bCSStartDate: breakData.bCSStartDate ? new Date(breakData.bCSStartDate) : serverDate,
        bCSEndDate: breakData.bCSEndDate ? new Date(breakData.bCSEndDate) : serverDate,
        rNotes: breakData.rNotes || "",
      });
    }
  }, [open, breakData, serverDate, reset]);

  const handleSave = useCallback(
    async (formData: SuspendFormData) => {
      if (!breakData) return;

      const updatedSuspendData: BreakConSuspendDto = {
        ...breakData,
        hPLID: breakData.hPLID,
        bCSStartDate: formData.bCSStartDate,
        bCSEndDate: formData.bCSEndDate,
        rNotes: formData.rNotes || "",
        rActiveYN: "Y",
      };

      setLoading(true);
      try {
        const result = await saveBreakConSuspend(updatedSuspendData);
        if (result.success) {
          showAlert("Success", "The break has been suspended", "success");
          onClose(true, updatedSuspendData);
        } else {
          showAlert("Error", result.errorMessage || "Failed to suspend break", "error");
          onClose(false);
        }
      } catch (error) {
        console.error("Error saving suspend data:", error);
        showAlert("Error", "Failed to suspend break", "error");
        onClose(false);
      } finally {
        setLoading(false);
      }
    },
    [breakData, onClose, showAlert, saveBreakConSuspend]
  );

  const renderSuspendDateField = (name: keyof SuspendFormData, label: string) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <FormField name={name} control={control} label={label} type="datepicker" required size="small" fullWidth />
    </Grid>
  );

  const renderBreakDateField = (name: keyof BreakListData, label: string) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField label={label} value={breakData && breakData[name] ? formatToDDMMYYYY(breakData[name]) : ""} fullWidth size="small" disabled InputProps={{ readOnly: true }} />
    </Grid>
  );

  return (
    <GenericDialog
      open={open}
      onClose={() => onClose(false)}
      title="Suspend Break"
      maxWidth="sm"
      disableEscapeKeyDown={true}
      disableBackdropClick={true}
      dialogContentSx={{ maxHeight: "400px" }}
      fullWidth
      actions={
        <>
          <CustomButton variant="contained" text="Save" onClick={handleSubmit(handleSave)} size="small" color="secondary" />
          <CustomButton variant="outlined" text="Close" onClick={() => onClose(false)} icon={Close} size="small" color="secondary" />
        </>
      }
    >
      <Box>
        <Grid container spacing={2}>
          {/* Display Break Start and End Dates as read-only */}
          {renderBreakDateField("bLStartDate", "Break Start Date")}
          {renderBreakDateField("bLEndDate", "Break End Date")}
          {/* Editable Suspend Dates */}
          {renderSuspendDateField("bCSStartDate", "Suspend Start Date")}
          {renderSuspendDateField("bCSEndDate", "Suspend End Date")}
          <Grid size={{ xs: 12 }}>
            <FormField
              control={control}
              name="rNotes"
              label="Notes"
              type="textarea"
              placeholder="Enter any notes here"
              rows={4}
              fullWidth
              size="small"
              required={false}
              helperText={errors.rNotes?.message}
              inputProps={{ maxLength: 2000 }}
            />
          </Grid>
        </Grid>
      </Box>
    </GenericDialog>
  );
};

export default React.memo(BreakSuspend);
