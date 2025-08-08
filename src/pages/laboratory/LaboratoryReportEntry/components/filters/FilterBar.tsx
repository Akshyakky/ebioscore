import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { Box, Chip, Stack, Tooltip } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";
import { PATIENT_STATUS_OPTIONS, SAMPLE_STATUS_OPTIONS } from "../../constants";

interface FilterBarProps {
  control: Control<any>;
  serviceGroupOptions: Array<{ value: string; label: string }>;
  selectedServiceType: number | null;
  filters: any;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ control, serviceGroupOptions, selectedServiceType, filters, onClearFilters }) => {
  const activeFiltersCount = Object.values(filters).filter((v) => v !== "all" && v !== selectedServiceType?.toString()).length;

  return (
    <Tooltip title="Filter Lab Registers">
      <Stack direction="row" spacing={2}>
        <FormField name="serviceGroup" control={control} label="Service Group" type="select" size="small" options={serviceGroupOptions} defaultText="All Service Groups" />
        <FormField name="sampleStatus" control={control} label="Report Status" type="select" size="small" options={SAMPLE_STATUS_OPTIONS} defaultText="All Reports" />
        <FormField name="patientStatus" control={control} label="Patient Status" type="select" size="small" options={PATIENT_STATUS_OPTIONS} defaultText="All Patients" />
        <Box display="flex" alignItems="center" gap={1}>
          {activeFiltersCount > 0 && <Chip label={`Filters (${activeFiltersCount})`} onDelete={onClearFilters} size="small" color="primary" />}
        </Box>
      </Stack>
    </Tooltip>
  );
};
