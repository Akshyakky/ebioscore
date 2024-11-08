import React, { forwardRef, useMemo, memo } from "react";
import { Box, Grid, Theme, SelectChangeEvent } from "@mui/material";
import { GridProps } from "@mui/material/Grid";
import { TextFieldProps } from "@mui/material/TextField";
import { SxProps, useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

// Component imports
import FloatingLabelTextBox from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import TextArea from "../TextArea/TextArea";
import DropdownSelect from "../DropDown/DropdownSelect";
import CustomSwitch from "../Checkbox/ColorSwitch";
import RadioGroup from "../RadioGroup/RadioGroup";
import AutocompleteTextBox from "../TextBox/AutocompleteTextBox/AutocompleteTextBox";
import MultiSelectDropdown from "../DropDown/MultiSelectDropdown";
import CustomDatePicker from "../DatePicker/CustomDatePicker";
import CustomDateTimePicker from "../DateTimePicker/CustomDateTimePicker";
import CustomButton from "../Button/CustomButton";
import CustomTimePicker from "../TimePicker/CustomTimePicker";

// Types
export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "switch"
  | "number"
  | "email"
  | "radio"
  | "autocomplete"
  | "date"
  | "search"
  | "multiselect"
  | "time"
  | "datepicker"
  | "datetimepicker"
  | "timepicker";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  metadata?: Record<string, any>;
}

interface BaseFormFieldProps {
  type: FieldType;
  label: string;
  value: any;
  name: string;
  ControlID: string;
  size?: "small" | "medium";
  placeholder?: string;
  isMandatory?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  fullWidth?: boolean;
  rows?: number;
  isSubmitted?: boolean;
  gridProps?: GridProps;
  InputProps?: TextFieldProps["InputProps"];
  InputLabelProps?: TextFieldProps["InputLabelProps"];
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
  helperText?: string;
  className?: string;
  testId?: string;
  sx?: SxProps<Theme>;
}

export interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "number" | "email" | "date" | "search" | "time";
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mask?: string;
  validation?: RegExp;
}

export interface TextAreaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minRows?: number;
  maxRows?: number;
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  options: DropdownOption[];
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  defaultText?: string;
  clearable?: boolean;
  onClear?: () => void;
  groupBy?: string;
}

export interface MultiSelectFormFieldProps extends BaseFormFieldProps {
  type: "multiselect";
  options: DropdownOption[];
  onChange: (event: SelectChangeEvent<string[]>, child: React.ReactNode) => void;
  defaultText?: string;
  maxSelections?: number;
}

export interface SwitchFormFieldProps extends BaseFormFieldProps {
  type: "switch";
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  checked: boolean;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "default";
}

export interface RadioFormFieldProps extends BaseFormFieldProps {
  type: "radio";
  options: DropdownOption[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  inline?: boolean;
  defaultValue?: string;
}

export interface AutocompleteFormFieldProps extends BaseFormFieldProps {
  type: "autocomplete";
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fetchSuggestions?: (input: string) => Promise<string[]>;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions?: string[];
  freeSolo?: boolean;
  loadingText?: string;
}

export interface DatePickerFormFieldProps extends BaseFormFieldProps {
  type: "datepicker";
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export interface DateTimePickerFormFieldProps extends BaseFormFieldProps {
  type: "datetimepicker";
  onChange: (date: Date | null) => void;
  minDateTime?: Date;
  maxDateTime?: Date;
  format?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export interface TimePickerFormFieldProps extends BaseFormFieldProps {
  type: "timepicker";
  onChange: (date: Date | null) => void;
  minTime?: Date;
  maxTime?: Date;
  format?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export type FormFieldProps =
  | TextFormFieldProps
  | TextAreaFormFieldProps
  | SelectFormFieldProps
  | SwitchFormFieldProps
  | RadioFormFieldProps
  | AutocompleteFormFieldProps
  | MultiSelectFormFieldProps
  | DatePickerFormFieldProps
  | DateTimePickerFormFieldProps
  | TimePickerFormFieldProps;

const useStyles = (theme: Theme) => ({
  fieldContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    width: "100%",
  },
  addButton: {
    marginLeft: theme.spacing(1),
    minWidth: "auto",
    padding: theme.spacing(1),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.05)",
      backgroundColor: theme.palette.primary.dark,
    },
  },
  helperText: {
    marginTop: theme.spacing(0.5),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  errorText: {
    color: theme.palette.error.main,
  },
});

const FormFieldComponent = forwardRef<HTMLInputElement, FormFieldProps>((props, ref) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const {
    type,
    label,
    value,
    name,
    ControlID,
    size = "small",
    placeholder = "",
    isMandatory = false,
    errorMessage,
    disabled = false,
    readOnly = false,
    maxLength,
    min,
    max,
    rows = 3,
    step,
    isSubmitted = false,
    gridProps = { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
    InputProps,
    InputLabelProps,
    onBlur,
    showAddButton = false,
    onAddClick,
    helperText,
    className,
    testId,
  } = props;

  const renderField = useMemo(() => {
    const commonProps = {
      name,
      ControlID,
      disabled,
      readOnly,
      size,
      isMandatory,
      isSubmitted,
      errorMessage,
      "data-testid": testId,
      sx: { flex: 1 },
    };

    switch (type) {
      case "text":
      case "number":
      case "email":
      case "date":
      case "search":
      case "time":
        return (
          <FloatingLabelTextBox
            {...commonProps}
            title={label}
            value={value}
            onChange={(props as TextFormFieldProps).onChange}
            type={type}
            placeholder={placeholder}
            maxLength={maxLength}
            min={min}
            max={max}
            step={step}
            onBlur={onBlur}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
            inputPattern={type === "number" ? /^[0-9]*$/ : undefined}
          />
        );

      case "textarea":
        return (
          <TextArea
            {...commonProps}
            label={label}
            value={value}
            onChange={(props as TextAreaFormFieldProps).onChange}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
          />
        );

      case "select":
        const selectProps = props as SelectFormFieldProps;
        return (
          <DropdownSelect
            {...commonProps}
            label={label}
            value={value}
            options={selectProps.options}
            onChange={selectProps.onChange}
            defaultText={selectProps.defaultText}
            clearable={selectProps.clearable}
            onClear={selectProps.onClear}
          />
        );

      case "multiselect":
        const multiSelectProps = props as MultiSelectFormFieldProps;
        return (
          <MultiSelectDropdown
            {...commonProps}
            label={label}
            value={Array.isArray(value) ? value : [value]}
            options={multiSelectProps.options}
            onChange={multiSelectProps.onChange}
            defaultText={multiSelectProps.defaultText}
          />
        );

      case "switch":
        const switchProps = props as SwitchFormFieldProps;
        return (
          <CustomSwitch
            {...commonProps}
            label={label}
            checked={switchProps.checked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              switchProps.onChange(event, event.target.checked);
            }}
            color={switchProps.color}
          />
        );

      case "radio":
        const radioProps = props as RadioFormFieldProps;
        return <RadioGroup {...commonProps} options={radioProps.options} selectedValue={value} onChange={radioProps.onChange} label={label} inline={radioProps.inline} />;

      case "autocomplete":
        const autocompleteProps = props as AutocompleteFormFieldProps;
        return (
          <AutocompleteTextBox
            {...commonProps}
            title={label}
            value={value}
            onChange={autocompleteProps.onChange}
            fetchSuggestions={autocompleteProps.fetchSuggestions}
            onSelectSuggestion={autocompleteProps.onSelectSuggestion}
            suggestions={autocompleteProps.suggestions}
            placeholder={placeholder}
            ref={ref}
          />
        );

      case "datepicker":
        const datePickerProps = props as DatePickerFormFieldProps;
        return (
          <CustomDatePicker
            {...commonProps}
            title={label}
            value={value}
            onChange={datePickerProps.onChange}
            minDate={datePickerProps.minDate}
            maxDate={datePickerProps.maxDate}
            disableFuture={datePickerProps.disableFuture}
            disablePast={datePickerProps.disablePast}
          />
        );

      case "datetimepicker":
        const dateTimePickerProps = props as DateTimePickerFormFieldProps;
        return (
          <CustomDateTimePicker
            {...commonProps}
            title={label}
            value={value}
            onChange={dateTimePickerProps.onChange}
            minDateTime={dateTimePickerProps.minDateTime}
            maxDateTime={dateTimePickerProps.maxDateTime}
            disableFuture={dateTimePickerProps.disableFuture}
            disablePast={dateTimePickerProps.disablePast}
          />
        );
      case "timepicker":
        const timePickerProps = props as TimePickerFormFieldProps;
        return (
          <CustomTimePicker
            {...commonProps}
            title={label}
            value={value}
            onChange={timePickerProps.onChange}
            placeholder={placeholder}
            size={size}
            minTime={timePickerProps.minTime}
            maxTime={timePickerProps.maxTime}
            disableFuture={timePickerProps.disableFuture}
            disablePast={timePickerProps.disablePast}
            format={timePickerProps.format}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
          />
        );
      default:
        return null;
    }
  }, [props, ref]);

  const addButton = useMemo(() => {
    if (!showAddButton || !onAddClick) return null;

    return <CustomButton variant="contained" size="small" icon={AddIcon} onClick={onAddClick} ariaLabel={`add-${name}`} color="primary" sx={styles.addButton} />;
  }, [showAddButton, onAddClick, name, styles.addButton]);

  return (
    <Grid item {...gridProps} className={className}>
      <Box sx={styles.fieldContainer}>
        {renderField}
        {addButton}
      </Box>
      {(helperText || errorMessage) && (
        <Box
          component="span"
          sx={{
            ...styles.helperText,
            ...(errorMessage && styles.errorText),
          }}
        >
          {errorMessage || helperText}
        </Box>
      )}
    </Grid>
  );
});

FormFieldComponent.displayName = "FormField";

export const FormField = memo(FormFieldComponent);

export default FormField;
