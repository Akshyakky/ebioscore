import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";

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

  const selectedFaculties = useWatch({
    control,
    name: "selectedFaculties",
    defaultValue: [],
  });

  useEffect(() => {
    if (selectedFaculties && selectedFaculties.length > 0) {
      facultiesArray.replace(
        selectedFaculties.map((facultyId: number) => ({
          chFacID: 0,
          chargeID: 0,
          aSubID: facultyId,
          rActiveYN: "Y",
          rTransferYN: "N",
          rNotes: "",
        }))
      );
    } else {
      facultiesArray.replace([]);
    }
  }, [selectedFaculties, facultiesArray]);

  const getInitialSelectedValues = () => {
    const fields = facultiesArray.fields || [];
    return fields.map((field: any) => field.aSubID);
  };

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1">Associated Faculties</Typography>
          <Chip label={`${facultiesArray.fields.length} faculties`} size="small" color="secondary" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <FormField
            name="selectedFaculties"
            control={control}
            type="multiselect"
            label="Academic Subjects/Faculties"
            options={subModules}
            defaultValue={getInitialSelectedValues()}
            helperText="Select one or more  faculties this charge is associated with"
            size="small"
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default AssociatedFacultiesComponent;
