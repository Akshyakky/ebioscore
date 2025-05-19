import React from "react";
import { Controller, Control, FieldValues, Path, FieldErrors } from "react-hook-form";
import { Grid, GridSize } from "@mui/material";
import EnhancedFormField, { FieldType, FormFieldProps } from "@/components/EnhancedFormField/EnhancedFormField";

interface ZodFormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  type: FieldType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  options?: Array<{ value: string | number | boolean; label: string }>;
  gridProps?: any;
  errors?: FieldErrors<TFieldValues>;
  isMandatory?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onChange?: (value: any) => void;
  clearable?: boolean;
  [key: string]: any; // Additional props will be passed to EnhancedFormField
}

/**
 * ZodFormField - A wrapper over EnhancedFormField that integrates with React Hook Form + Zod
 * This component automatically handles error state from React Hook Form
 */
function ZodFormField<TFieldValues extends FieldValues>({
  name,
  control,
  type,
  label,
  placeholder,
  helperText,
  required,
  disabled,
  fullWidth = true,
  options,
  gridProps = { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
  errors,
  isMandatory,
  showAddButton,
  onAddClick,
  onChange: externalOnChange,
  clearable,
  ...restProps
}: ZodFormFieldProps<TFieldValues>) {
  // Extract error message for the field
  const errorMessage = errors?.[name]?.message as string | undefined;

  return (
    <Grid size={{ ...gridProps }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          // Extract the value and onChange from field
          const { value, onChange, ...restField } = field;

          // Props specific to EnhancedFormField
          const fieldProps: FormFieldProps<TFieldValues> = {
            name,
            control,
            type,
            label: isMandatory ? `${label} *` : label,
            required: required || isMandatory,
            disabled,
            fullWidth,
            placeholder,
            helperText: errorMessage || helperText,
            defaultValue: value,
            clearable,
            onChange: (val) => {
              onChange(val);
              if (externalOnChange) {
                externalOnChange(val);
              }
            },
            ...(options && { options }),
            ...(showAddButton && { showAddButton }),
            ...(onAddClick && { onAddClick }),
            ...restProps,
          } as any;

          return <EnhancedFormField {...fieldProps} />;
        }}
      />
    </Grid>
  );
}

export default ZodFormField;
