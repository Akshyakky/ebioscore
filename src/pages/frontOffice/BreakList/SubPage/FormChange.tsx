import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  FormControl,
  TextField,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";

interface ChangeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (details: string, formattedEndDate: Date, frequencyCode: string, frequencyNumber: number, weekCodes?: string[]) => void;
  startDate: string;
  frequencyNumber: number;
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const frequencyCodeMap: Record<string, string> = {
  None: "FO70",
  Daily: "FO71",
  Weekly: "FO72",
  Monthly: "FO73",
  Yearly: "FO74",
};

const weekdayCodeMap: Record<string, string> = {
  Sunday: "FO75",
  Monday: "FO76",
  Tuesday: "FO77",
  Wednesday: "FO78",
  Thursday: "FO79",
  Friday: "FO80",
  Saturday: "FO81",
};

const formatDateToDateString = (date: string): string => {
  const d = new Date(date);
  return `${("0" + d.getDate()).slice(-2)}/${("0" + (d.getMonth() + 1)).slice(-2)}/${d.getFullYear()}`;
};

const ChangeFormDialog: React.FC<ChangeFormDialogProps> = ({
  open,
  onClose,
  onSave,
  startDate,
  frequencyNumber,
}) => {
  const [frequency, setFrequency] = useState<string>("None");
  const [noRepeatEndDate, setNoRepeatEndDate] = useState<string>(startDate || "");
  const [everyDays, setEveryDays] = useState<number | "">("");
  const [endDate, setEndDate] = useState<string>(startDate || "");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);

  useEffect(() => {
    if (frequency === "None" && startDate) {
      setNoRepeatEndDate(startDate);
      setEndDate(new Date(startDate).toISOString());
    } else {
      setNoRepeatEndDate("");
    }
  }, [frequency, startDate]);

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(event.target.value);
  };

  const handleEveryDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setEveryDays(value === "" ? "" : Number(value));
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);
  };

  const handleWeekdayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedWeekdays((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((day) => day !== value)
        : [...prevSelected, value]
    );
  };

  const generateDetails = () => {
    const formattedEndDate = formatDateToDateString(endDate);

    let details = "";
    if (frequency === "None") {
      details = `No Repeat End Date: ${formatDateToDateString(noRepeatEndDate)}`;
    } else if (frequency === "Daily") {
      details = `Every ${everyDays} Day[s] Till: ${formattedEndDate}`;
    } else if (frequency === "Weekly") {
      details = `Every ${everyDays} Week[s] on ${selectedWeekdays.join(", ")} Till: ${formattedEndDate}`;
    } else if (frequency === "Monthly") {
      details = `Every ${everyDays} Month[s] Till: ${formattedEndDate}`;
    } else if (frequency === "Yearly") {
      details = `Every ${everyDays} Year[s] Till: ${formattedEndDate}`;
    }
    return details;
  };

  const handleSave = () => {
    const parsedEndDate = new Date(endDate);
    const parsedStartDate = new Date(startDate);

    if (parsedEndDate <= parsedStartDate) {
      notifyError("End date must be greater than start date.");
      return;
    }

    const frequencyNumber = Number(everyDays) || 0;
    if (frequencyNumber <= 0) {
      notifyError("Frequency number must be greater than 0.");
      return;
    }

    const frequencyCode = frequencyCodeMap[frequency] || "";
    const weekCodes = frequency === "Weekly"
      ? selectedWeekdays.map(day => weekdayCodeMap[day])
      : [];

    const details = generateDetails();
    onSave(details, parsedEndDate, frequencyCode, frequencyNumber, weekCodes);

    notifySuccess("Details saved successfully.");
    onClose();
    console.log("End Date Value:", endDate);
    console.log("Formatted End Date:", parsedEndDate);
    console.log("Frequency Number Value:", frequencyNumber);
    console.log("Frequency Code Value:", frequencyCode); // Log frequencyCode for verification
    console.log("Weekday Codes:", weekCodes); // Log weekCodes for verification
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Change Form</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Frequency Section */}
          <Grid item xs={12} md={4} sx={{ borderRight: "1px solid #ddd" }}>
            <Typography variant="h6" gutterBottom>
              Frequency
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="frequency"
                name="frequency"
                value={frequency}
                onChange={handleFrequencyChange}
              >
                {Object.keys(frequencyCodeMap).map((freq) => (
                  <FormControlLabel
                    key={freq}
                    value={freq}
                    control={<Radio />}
                    label={freq}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Additional Fields Section */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* No Repeat End Date Display */}
              {frequency === "None" && (
                <Grid item xs={12} sm={6} md={6} mt={4}>
                  <Typography variant="body1" fontWeight={600}>
                    No Repeat End Date: {noRepeatEndDate}
                  </Typography>
                </Grid>
              )}

              {/* Daily Frequency Details */}
              {frequency === "Daily" && (
                <>
                  <Grid item xs={12} sm={8} md={7} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        Every :
                      </Typography>
                      <TextField
                        type="number"
                        value={everyDays}
                        onChange={handleEveryDaysChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Typography
                        variant="body1"
                        ml={2}
                        mr={2}
                        fontWeight={600}
                      >
                        Day[s]
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={7} md={6} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        End On :
                      </Typography>
                      <TextField
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2}>
                    <Typography variant="body1" fontWeight={600} color="green">
                      Every {everyDays} Day[s] Till: {formatDateToDateString(endDate)}
                    </Typography>
                  </Grid>
                </>
              )}

                 {/* Weekly Frequency Details */}
                 {frequency === "Weekly" && (
                <>
                  <Grid item xs={12} sm={8} md={7} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        Every :
                      </Typography>
                      <TextField
                        type="number"
                        value={everyDays}
                        onChange={handleEveryDaysChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Typography
                        variant="body1"
                        ml={2}
                        mr={2}
                        fontWeight={600}
                      >
                        Week[s]
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={12} md={12} mt={4}>
                    <Typography variant="body1" fontWeight={600}>
                      Select Weekdays:
                    </Typography>
                    <FormGroup>
                      {weekdays.map((day) => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              checked={selectedWeekdays.includes(day)}
                              onChange={handleWeekdayChange}
                              value={day}
                            />
                          }
                          label={day}
                        />
                      ))}
                    </FormGroup>
                  </Grid>

                  <Grid item xs={12} sm={7} md={6} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        End On :
                      </Typography>
                      <TextField
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2}>
                    <Typography variant="body1" fontWeight={600} color="green">
                      Every {everyDays} Week[s] on {selectedWeekdays.join(", ")} Till: {formatDateToDateString(endDate)}
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Monthly Frequency Details */}
              {frequency === "Monthly" && (
                <>
                  <Grid item xs={12} sm={8} md={7} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        Every :
                      </Typography>
                      <TextField
                        type="number"
                        value={everyDays}
                        onChange={handleEveryDaysChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Typography
                        variant="body1"
                        ml={2}
                        mr={2}
                        fontWeight={600}
                      >
                        Month[s]
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={7} md={6} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        End On :
                      </Typography>
                      <TextField
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2}>
                    <Typography variant="body1" fontWeight={600} color="green">
                      Every {everyDays} Month[s] Till: {formatDateToDateString(endDate)}
                    </Typography>
                  </Grid>
                </>
              )}

              {/* Yearly Frequency Details */}
              {frequency === "Yearly" && (
                <>
                  <Grid item xs={12} sm={8} md={7} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        Every :
                      </Typography>
                      <TextField
                        type="number"
                        value={everyDays}
                        onChange={handleEveryDaysChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <Typography
                        variant="body1"
                        ml={2}
                        mr={2}
                        fontWeight={600}
                      >
                        Year[s]
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={7} md={6} mt={4}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{ mr: 2 }}
                        fontWeight={600}
                      >
                        End On :
                      </Typography>
                      <TextField
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2}>
                    <Typography variant="body1" fontWeight={600} color="green">
                      Every {everyDays} Year[s] Till: {formatDateToDateString(endDate)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={CloseIcon}
          size="medium"
          onClick={onClose}
          color="error"
        />
        <CustomButton
          variant="contained"
          text="Save"
          icon={SaveIcon}
          size="medium"
          onClick={handleSave}
          color="success"
        />
      </DialogActions>
    </Dialog>
  );
};

export default ChangeFormDialog;


