import React from "react";
import { Box, Typography, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Alert, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control } from "react-hook-form";

interface ChargeAliasesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  pic: { value: string; label: string }[];
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({ control, expanded, onToggleExpand, pic }) => {
  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const addAlias = () => {
    aliasesArray.append({
      chAliasID: 0,
      chargeID: 0,
      pTypeID: 0,
      chargeDesc: "",
      chargeDescLang: "",
    });
    onToggleExpand();
  };

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Charge Aliases</Typography>
          <Chip label={`${aliasesArray.fields.length} aliases`} size="small" color="info" variant="outlined" />
          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addAlias();
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
          {aliasesArray.fields.map((field, index) => (
            <Paper key={field.id} sx={{ p: 2, backgroundColor: "grey.50" }}>
              <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">Alias #{index + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => aliasesArray.remove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField name={`ChargeAliases.${index}.pTypeID`} control={control} type="select" label="Patient Type" size="small" options={pic} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField
                    name={`ChargeAliases.${index}.chargeDesc`}
                    control={control}
                    type="text"
                    label="Alias Description"
                    size="small"
                    helperText="Alternative description for this patient type"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField
                    name={`ChargeAliases.${index}.chargeDescLang`}
                    control={control}
                    type="text"
                    label="Local Language Description"
                    size="small"
                    helperText="Description in local language"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {aliasesArray.fields.length === 0 && (
            <Alert severity="info">No charge aliases configured. Click the + button to add alternative descriptions for different patient types or languages.</Alert>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChargeAliasesComponent;
