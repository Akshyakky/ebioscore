import React from "react";
import { Box, Typography, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Alert, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control } from "react-hook-form";

interface DoctorSharesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  attendingPhy: { value: string; label: string }[];
  doctorShareEnabled: boolean;
}

const DoctorSharesComponent: React.FC<DoctorSharesComponentProps> = ({ control, expanded, onToggleExpand, attendingPhy, doctorShareEnabled }) => {
  const doctorSharesArray = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const addDoctorShare = () => {
    doctorSharesArray.append({
      docShareID: 0,
      chargeID: 0,
      conID: 0,
      doctorShare: 0,
      hospShare: 0,
    });
    onToggleExpand();
  };

  if (!doctorShareEnabled) {
    return null;
  }

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Doctor Revenue Sharing</Typography>
          <Chip label={`${doctorSharesArray.fields.length} doctors`} size="small" color="success" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addDoctorShare();
              }}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {doctorSharesArray.fields.map((field, index) => (
            <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">Doctor Share #{index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => doctorSharesArray.remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <EnhancedFormField name={`DoctorShares.${index}.conID`} control={control} type="select" label="Doctor" size="small" options={attendingPhy} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`DoctorShares.${index}.doctorShare`} control={control} type="number" label="Doctor Share (%)" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`DoctorShares.${index}.hospShare`} control={control} type="number" label="Hospital Share (%)" size="small" />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {doctorSharesArray.fields.length === 0 && <Alert severity="info">No doctor shares configured. Click the + button to add revenue sharing with doctors.</Alert>}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default DoctorSharesComponent;
