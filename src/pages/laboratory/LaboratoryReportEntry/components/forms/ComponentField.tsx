import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { ComponentResultDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { LCENT_ID } from "@/types/lCentConstants";
import { Box, Chip, Typography } from "@mui/material";
import React from "react";
import { Control } from "react-hook-form";

interface ComponentFieldProps {
  component: ComponentResultDto;
  control: Control<any>;
  watchValue: string;
}

export const ComponentField: React.FC<ComponentFieldProps> = ({ component, control, watchValue }) => {
  const fieldName = `component_${component.componentId}`;

  const getComponentStatus = (): "Normal" | "Abnormal" => {
    if (component.resultTypeId === LCENT_ID.REFERENCE_VALUES && watchValue && component.referenceRange) {
      const numValue = Number(watchValue);
      const { lowerValue = 0, upperValue = 0 } = component.referenceRange;
      if (numValue < lowerValue || numValue > upperValue) {
        return "Abnormal";
      }
    }
    return "Normal";
  };

  const getStatusChip = () => {
    if (!watchValue || component.resultTypeId !== LCENT_ID.REFERENCE_VALUES) {
      return null;
    }
    const status = getComponentStatus();
    return <Chip size="small" label={status} color={status === "Normal" ? "success" : "error"} />;
  };

  const renderField = () => {
    switch (component.resultTypeId) {
      case LCENT_ID.SINGLELINE_ALPHANUMERIC_VALUES:
        return <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />;

      case LCENT_ID.SINGLELINE_NUMERIC_VALUES:
      case LCENT_ID.REFERENCE_VALUES:
        return (
          <Box>
            <FormField
              name={fieldName}
              control={control}
              label={component.componentName}
              type="number"
              required
              size="small"
              fullWidth
              placeholder="Enter numeric value"
              adornment={component.unit}
              adornmentPosition="end"
            />
            {component.resultTypeId === LCENT_ID.REFERENCE_VALUES && component.referenceRange && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                Reference Range: {component.referenceRange.referenceRange} {component.unit}
              </Typography>
            )}
          </Box>
        );

      case LCENT_ID.MULTILINE_VALUES:
        return (
          <FormField
            name={fieldName}
            control={control}
            label={component.componentName}
            type="textarea"
            required
            size="small"
            fullWidth
            rows={3}
            placeholder="Enter detailed text"
          />
        );

      case LCENT_ID.MULTIPLE_SELECTION:
        const selectionOptions = [
          { value: "Positive", label: "Positive" },
          { value: "Negative", label: "Negative" },
          { value: "Not Detected", label: "Not Detected" },
        ];

        return <FormField name={fieldName} control={control} label={component.componentName} type="select" required size="small" fullWidth options={selectionOptions} />;

      case LCENT_ID.TEMPLATE_VALUES:
        return (
          <FormField
            name={fieldName}
            control={control}
            label={component.componentName}
            type="textarea"
            required
            size="small"
            fullWidth
            rows={5}
            placeholder="Enter or modify template text"
          />
        );

      default:
        return <FormField name={fieldName} control={control} label={component.componentName} type="text" required size="small" fullWidth placeholder="Enter value" />;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="flex-start" gap={1}>
        <Box flex={1}>{renderField()}</Box>
        {getStatusChip()}
      </Box>
      {component.interpretation && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Interpretation:
          </Typography>
          <Typography variant="body2">{component.interpretation}</Typography>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <FormField name={`${fieldName}_comments`} control={control} label="Comments" type="textarea" size="small" fullWidth rows={2} />
      </Box>
    </Box>
  );
};
