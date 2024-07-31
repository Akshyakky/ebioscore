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
  onSave: (details: string) => void;
  startDate: string;
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ChangeFormDialog: React.FC<ChangeFormDialogProps> = ({
  open,
  onClose,
  onSave,
  startDate,
}) => {
  const [frequency, setFrequency] = useState<string>("None");
  const [noRepeatEndDate, setNoRepeatEndDate] = useState<string>(startDate || "");
  const [everyDays, setEveryDays] = useState<number | "">("");
  const [endDate, setEndDate] = useState<string>(startDate || "");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);

  useEffect(() => {
    if (frequency === "None" && startDate) {
      setNoRepeatEndDate(startDate);
      setEndDate(startDate);
    } else {
      setNoRepeatEndDate("");
    }
  }, [frequency, startDate]);

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(event.target.value);
  };

  const handleEveryDaysChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Handle numeric input and empty string
    if (/^\d*$/.test(value)) {
      setEveryDays(value === "" ? "" : Number(value));
    }
  };

  const validateDates = (): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
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
    let details = "";

    if (frequency === "None") {
      details = `No Repeat End Date: ${noRepeatEndDate}`;
    } else if (frequency === "Daily") {
      details = `Every ${everyDays} Day[s] Till: ${new Date(endDate).toDateString()}`;
    } else if (frequency === "Weekly") {
      details = `Every ${everyDays} Week[s] on ${selectedWeekdays.join(", ")} Till: ${new Date(endDate).toDateString()}`;
    } else if (frequency === "Monthly") {
      details = `Every ${everyDays} Month[s] Till: ${new Date(endDate).toDateString()}`;
    } else if (frequency === "Yearly") {
      details = `Every ${everyDays} Year[s] Till: ${new Date(endDate).toDateString()}`;
    }

    return details;
  };

  const handleSave = () => {
    // Check if end date is greater than start date
    if (new Date(endDate) <= new Date(startDate)) {
      notifyError("End date must be greater than start date."); // Notify error message
      return;
    }

    const details = generateDetails();
    onSave(details); // Pass the details to the parent component

    // Log the saved data
    console.log("Saved details:", details);

    // Notify success message
    notifySuccess("Details saved successfully.");

    onClose();
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
                <FormControlLabel
                  value="None"
                  control={<Radio />}
                  label="None"
                />
                <FormControlLabel
                  value="Daily"
                  control={<Radio />}
                  label="Daily"
                />
                <FormControlLabel
                  value="Weekly"
                  control={<Radio />}
                  label="Weekly"
                />
                <FormControlLabel
                  value="Monthly"
                  control={<Radio />}
                  label="Monthly"
                />
                <FormControlLabel
                  value="Yearly"
                  control={<Radio />}
                  label="Yearly"
                />
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
                      Every {everyDays} Day[s] Till:{" "}
                      {new Date(endDate).toDateString()}
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

                  <Grid item xs={12} sm={7} md={6} mt={2}>
                    <Typography variant="body1" sx={{ mb: 2 }} fontWeight={600}>
                      On :
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

                  <Grid item xs={12} sm={8} md={7} mt={2}>
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
                      Every {everyDays} Week[s] on{" "}
                      {selectedWeekdays.join(", ")} Till:{" "}
                      {new Date(endDate).toDateString()}
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
                      Every {everyDays} Month[s] Till:{" "}
                      {new Date(endDate).toDateString()}
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
                      Every {everyDays} Year[s] Till:{" "}
                      {new Date(endDate).toDateString()}
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



    
  

     
