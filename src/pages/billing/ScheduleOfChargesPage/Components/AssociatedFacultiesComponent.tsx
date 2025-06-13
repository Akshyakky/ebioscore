import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { ExpandMore as ExpandMoreIcon, Info as InfoIcon, School as SchoolIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Paper, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";

interface AssociatedFacultiesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  subModules: { value: string; label: string }[];
  disabled?: boolean;
  showValidation?: boolean;
}

const AssociatedFacultiesComponent: React.FC<AssociatedFacultiesComponentProps> = ({ control, expanded, onToggleExpand, subModules, disabled = false, showValidation = true }) => {
  const facultiesArray = useFieldArray({
    control,
    name: "ChargeFaculties",
  });

  const selectedFaculties = useWatch({
    control,
    name: "selectedFaculties",
    defaultValue: [],
  });

  const validationStatus = useMemo(() => {
    if (!showValidation) return null;

    const facultyCount = selectedFaculties?.length || 0;

    if (facultyCount === 0) {
      return {
        type: "info" as const,
        message: "No faculties selected. This charge will not be associated with any academic subjects.",
      };
    } else if (facultyCount > 10) {
      return {
        type: "warning" as const,
        message: `${facultyCount} faculties selected. Consider if this charge applies to this many subjects.`,
      };
    } else {
      return {
        type: "success" as const,
        message: `${facultyCount} faculty association${facultyCount > 1 ? "s" : ""} configured.`,
      };
    }
  }, [selectedFaculties, showValidation]);

  const updateFacultiesArray = useCallback(() => {
    if (selectedFaculties && selectedFaculties.length > 0) {
      const newFaculties = selectedFaculties.map((facultyId: number) => ({
        chFacID: 0,
        chargeID: 0,
        aSubID: facultyId,
        rActiveYN: "Y",
        rTransferYN: "N",
        rNotes: "",
      }));
      facultiesArray.replace(newFaculties);
    } else {
      facultiesArray.replace([]);
    }
  }, [selectedFaculties, facultiesArray]);

  useEffect(() => {
    updateFacultiesArray();
  }, [updateFacultiesArray]);
  const getInitialSelectedValues = useCallback(() => {
    const fields = facultiesArray.fields || [];
    return fields.map((field: any) => field.aSubID).filter((id) => id != null);
  }, [facultiesArray.fields]);

  const getFacultyCountDisplay = useMemo(() => {
    const count = facultiesArray.fields.length;
    let color: "default" | "primary" | "secondary" | "success" | "warning" = "default";

    if (count === 0) color = "default";
    else if (count <= 3) color = "success";
    else if (count <= 6) color = "primary";
    else if (count <= 10) color = "secondary";
    else color = "warning";

    return { count, color };
  }, [facultiesArray.fields.length]);

  const facultyDisplay = getFacultyCountDisplay;

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggleExpand}
      sx={{
        "&.Mui-expanded": {
          margin: "8px 0",
        },
        "&:before": {
          display: "none",
        },
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderRadius: "8px !important",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <SchoolIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Associated Faculties
          </Typography>

          <Chip label={`${facultyDisplay.count} faculties`} size="small" color={facultyDisplay.color} variant="outlined" icon={<SchoolIcon />} />

          {validationStatus && (
            <Tooltip title={validationStatus.message} arrow>
              <InfoIcon color={validationStatus.type === "success" ? "success" : validationStatus.type} sx={{ fontSize: 16, ml: "auto" }} />
            </Tooltip>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: "16px" }}>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: "background.paper" }}>
          <Box sx={{ mb: 2 }}>
            <FormField
              name="selectedFaculties"
              control={control}
              type="multiselect"
              label="Academic Subjects/Faculties"
              options={subModules}
              defaultValue={getInitialSelectedValues()}
              helperText="Select one or more faculties this charge is associated with. This helps in reporting and categorization."
              size="small"
              disabled={disabled}
              placeholder="Search and select faculties..."
            />
          </Box>

          {facultiesArray.fields.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Faculties:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {selectedFaculties.map((facultyId: number) => {
                  const faculty = subModules.find((s) => Number(s.value) === facultyId);
                  return faculty ? <Chip key={facultyId} label={faculty.label} size="small" variant="filled" color="primary" sx={{ fontSize: "0.75rem" }} /> : null;
                })}
              </Box>
            </Box>
          )}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(AssociatedFacultiesComponent);
