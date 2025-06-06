import React from "react";
import { Box, Typography, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Alert, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control } from "react-hook-form";

interface AssociatedFacultiesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  subModules: { value: string; label: string }[];
}

const AssociatedFacultiesComponent: React.FC<AssociatedFacultiesComponentProps> = ({ control, expanded, onToggleExpand, subModules }) => {
  const facultiesArray = useFieldArray({
    control,
    name: "ChargeFaculties",
  });

  const addFaculty = () => {
    facultiesArray.append({
      chFacID: 0,
      chargeID: 0,
      aSubID: 0,
    });
    onToggleExpand();
  };

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Associated Faculties</Typography>
          <Chip label={`${facultiesArray.fields.length} faculties`} size="small" color="secondary" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addFaculty();
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
          {facultiesArray.fields.map((field, index) => (
            <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">Faculty #{index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => facultiesArray.remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 12 }}>
                  <EnhancedFormField
                    name={`ChargeFaculties.${index}.aSubID`}
                    control={control}
                    type="select"
                    label="Academic Subject/Faculty"
                    required
                    size="small"
                    options={subModules}
                    helperText="Select the academic subject or faculty this charge is associated with"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {facultiesArray.fields.length === 0 && (
            <Alert severity="info">No faculties associated. Click the + button to associate this charge with academic subjects or faculties.</Alert>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default AssociatedFacultiesComponent;
