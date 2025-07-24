import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { FrequencyDto } from "@/interfaces/FrontOffice/BreakListDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatDate } from "@/utils/Common/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeCircle, Save } from "@mui/icons-material";
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const frequencySchema = z.object({
  frequency: z.string(),
  endDate: z.string(),
  interval: z.number().min(0, "Interval must be positive"),
  weekDays: z.array(z.string()),
});

type FrequencyFormData = z.infer<typeof frequencySchema>;

const BreakFrequency: React.FC<{
  open: boolean;
  onClose: () => void;
  endDateFromBreakDetails: string;
  onSave: (frequencyData: FrequencyDto) => void;
  initialFrequencyData: FrequencyDto;
}> = ({ open, onClose, endDateFromBreakDetails, onSave, initialFrequencyData }) => {
  const { control, handleSubmit, setValue, watch } = useForm<FrequencyFormData>({
    defaultValues: {
      ...initialFrequencyData,
      endDate: endDateFromBreakDetails,
    },
    resolver: zodResolver(frequencySchema),
    mode: "onChange",
  });

  const frequencyData = watch();
  const { showAlert } = useAlert();
  useEffect(() => {
    setValue("endDate", endDateFromBreakDetails);
  }, [endDateFromBreakDetails, setValue]);

  useEffect(() => {
    Object.keys(initialFrequencyData).forEach((key) => {
      setValue(key as keyof FrequencyFormData, initialFrequencyData[key as keyof FrequencyDto]);
    });
  }, [initialFrequencyData, setValue]);

  const handleWeekDaysChange = (day: string, checked: boolean) => {
    const currentWeekDays = frequencyData.weekDays || [];
    const updatedWeekDays = checked ? [...currentWeekDays, day] : currentWeekDays.filter((d) => d !== day);
    setValue("weekDays", updatedWeekDays);
  };

  const validateFrequency = (): boolean => {
    const { frequency, interval, endDate } = frequencyData;
    const startDate = new Date(initialFrequencyData.endDate);
    const endDateObj = new Date(endDate);

    let validEndDate: Date;

    switch (frequency) {
      case "daily":
        validEndDate = new Date(startDate.setDate(startDate.getDate() + interval));
        if (endDateObj < validEndDate) {
          showAlert("Error", "Invalid date range, End Date does not match with the Start Date for daily frequency", "error");
          return false;
        }
        break;
      case "weekly":
        if (endDateObj < startDate) {
          showAlert("Error", "Invalid date range, End Date does not match with the Start Date for weekly frequency", "error");
          return false;
        }
        break;
      case "monthly":
        validEndDate = new Date(startDate.setMonth(startDate.getMonth() + interval));
        if (endDateObj < validEndDate) {
          showAlert("Error", "Invalid date range, End Date does not match with the Start Date for monthly frequency", "error");
          return false;
        }
        break;
      case "yearly":
        validEndDate = new Date(startDate.setFullYear(startDate.getFullYear() + interval));
        if (endDateObj < validEndDate) {
          showAlert("Error", "Invalid date range, End Date does not match with the Start Date for yearly frequency", "error");
          return false;
        }
        break;
    }

    return true;
  };

  const renderSummaryText = () => {
    const { frequency, interval, weekDays, endDate } = frequencyData;
    const formattedEndDate = formatDate(endDate);

    switch (frequency) {
      case "daily":
        return `Every ${interval} Day${interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "weekly":
        const selectedDays = weekDays.map((day) => day.slice(0, 3)).join("-");
        return `Every ${interval} Week${interval > 1 ? "s" : ""} On ${selectedDays} Till ${formattedEndDate}`;
      case "monthly":
        return `Every ${interval} Month${interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      case "yearly":
        return `Every ${interval} Year${interval > 1 ? "s" : ""} Till ${formattedEndDate}`;
      default:
        return `No Repeat End Date: ${formattedEndDate}`;
    }
  };

  const renderFrequencyDetails = () => {
    const { frequency } = frequencyData;

    const commonInputs = (
      <>
        <FormField
          name="interval"
          control={control}
          label="Every"
          type="number"
          placeholder={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)}s`}
          required
          size="small"
          fullWidth
          onChange={(e) => setValue("interval", Number(e.target.value))}
        />
        <FormField name="endDate" control={control} label="End on" type="datepicker" size="small" fullWidth />
      </>
    );

    switch (frequency) {
      case "daily":
        return commonInputs;
      case "weekly":
        return (
          <>
            {commonInputs}
            <FormGroup row>
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                <FormControlLabel
                  key={day}
                  control={<Checkbox checked={frequencyData.weekDays.includes(day)} onChange={(e) => handleWeekDaysChange(day, e.target.checked)} value={day} />}
                  label={day}
                />
              ))}
            </FormGroup>
          </>
        );
      case "monthly":
      case "yearly":
        return commonInputs;
      default:
        return null;
    }
  };

  const handleSave = () => {
    if (validateFrequency()) {
      onSave(frequencyData as FrequencyDto);
      onClose();
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Break Frequency Details"
      maxWidth="sm"
      fullWidth
      actions={
        <Box sx={{ display: "flex", gap: 1 }}>
          <SmartButton text="Save" onClick={handleSave} variant="contained" color="primary" icon={Save} />
          <SmartButton text="Close" onClick={onClose} variant="outlined" color="inherit" />
        </Box>
      }
    >
      <Box sx={{ p: 2 }}>
        <FormField
          name="frequency"
          control={control}
          label="Frequency"
          type="radio"
          options={[
            { label: "None", value: "none" },
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
          ]}
          size="small"
        />
        {renderFrequencyDetails()}
        <Typography sx={{ color: "primary.main", display: "flex", alignItems: "center", mt: 2 }}>
          <ChangeCircle sx={{ mr: 1 }} />
          {renderSummaryText()}
        </Typography>
      </Box>
    </GenericDialog>
  );
};

export default BreakFrequency;
