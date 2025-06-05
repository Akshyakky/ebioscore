import React from "react";
import { Box, Typography, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Alert, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control } from "react-hook-form";

interface ChargePacksComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
}

const ChargePacksComponent: React.FC<ChargePacksComponentProps> = ({ control, expanded, onToggleExpand }) => {
  const packsArray = useFieldArray({
    control,
    name: "ChargePacks",
  });

  const addPack = () => {
    packsArray.append({
      chPackID: 0,
      chargeID: 0,
      chargeRevise: "",
      chargeStatus: "AC",
      dcValue: 0,
      hcValue: 0,
      chValue: 0,
    });
    onToggleExpand();
  };

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Charge Packs</Typography>
          <Chip label={`${packsArray.fields.length} packs`} size="small" color="warning" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addPack();
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
          {packsArray.fields.map((field, index) => (
            <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">Pack #{index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => packsArray.remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.chargeRevise`} control={control} type="text" label="Revision" size="small" helperText="Pack revision identifier" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.chValue`} control={control} type="number" label="Pack Value" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.effectiveFromDate`} control={control} type="datepicker" label="Effective From" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.effectiveToDate`} control={control} type="datepicker" label="Effective To" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.dcValue`} control={control} type="number" label="DC Value" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <EnhancedFormField name={`ChargePacks.${index}.hcValue`} control={control} type="number" label="HC Value" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <EnhancedFormField
                    name={`ChargePacks.${index}.chargeStatus`}
                    control={control}
                    type="select"
                    label="Status"
                    size="small"
                    options={[
                      { value: "AC", label: "Active" },
                      { value: "IN", label: "Inactive" },
                    ]}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {packsArray.fields.length === 0 && <Alert severity="info">No charge packs configured. Click the + button to add versioned charge packages with effective dates.</Alert>}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChargePacksComponent;
