import React, { forwardRef, useMemo } from "react";
import { Box, Grid, IconButton, SelectChangeEvent } from "@mui/material";
import { GridProps } from "@mui/material/Grid";
import FloatingLabelTextBox from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import TextArea from "../TextArea/TextArea";
import DropdownSelect from "../DropDown/DropdownSelect";
import CustomSwitch from "../Checkbox/ColorSwitch";
import RadioGroup from "../RadioGroup/RadioGroup";
import AutocompleteTextBox from "../TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { TextFieldProps } from "@mui/material/TextField";
import MultiSelectDropdown from "../DropDown/MultiSelectDropdown";
import CustomDatePicker from "../DatePicker/CustomDatePicker";
import CustomDateTimePicker from "../DateTimePicker/CustomDateTimePicker";
import AddIcon from "@mui/icons-material/Add";
import CustomButton from "../Button/CustomButton";

type FieldType =
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
  | "datetimepicker";

interface DropdownOption {
  value: string;
  label: string;
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
  showAddButton?: boolean; // Controls visibility of the Add button
  onAddClick?: () => void; // Callback function for Add button click
}

export interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "number" | "email" | "date" | "search" | "time";
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TextAreaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  options: DropdownOption[];
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  defaultText?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export interface MultiSelectFormFieldProps extends BaseFormFieldProps {
  type: "multiselect";
  options: DropdownOption[];
  onChange: (event: SelectChangeEvent<string[]>, child: React.ReactNode) => void;
  defaultText?: string;
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
}

export interface AutocompleteFormFieldProps extends BaseFormFieldProps {
  type: "autocomplete";
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fetchSuggestions?: (input: string) => Promise<string[]>;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions?: string[];
}

export interface DatePickerFormFieldProps extends BaseFormFieldProps {
  type: "datepicker";
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

export interface DateTimePickerFormFieldProps extends BaseFormFieldProps {
  type: "datetimepicker";
  onChange: (date: Date | null) => void;
  minDateTime?: Date;
  maxDateTime?: Date;
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
  | DateTimePickerFormFieldProps;

const FormField = forwardRef<HTMLInputElement, FormFieldProps>((props, ref) => {
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
  } = props;

  const renderField = useMemo(() => {
    switch (type) {
      case "text":
      case "number":
      case "email":
      case "date":
      case "search":
      case "time":
        return (
          <FloatingLabelTextBox
            title={label}
            placeholder={placeholder}
            value={value}
            onChange={(props as TextFormFieldProps).onChange}
            onBlur={onBlur}
            size={size}
            isSubmitted={isSubmitted}
            name={name}
            ControlID={ControlID}
            type={type}
            isMandatory={isMandatory}
            errorMessage={errorMessage}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            max={max}
            min={min}
            step={step}
            inputPattern={type === "number" ? /^[0-9]*$/ : undefined}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
          />
        );
      case "textarea":
        return (
          <TextArea
            label={label}
            value={value}
            placeholder={placeholder}
            onChange={(props as TextAreaFormFieldProps).onChange}
            //onBlur={onBlur}
            readOnly={readOnly}
            rows={rows}
            name={name}
            maxLength={maxLength}
          />
        );
      case "select":
        const selectProps = props as SelectFormFieldProps;
        return (
          <DropdownSelect
            label={label}
            name={name}
            value={value}
            options={selectProps.options}
            onChange={selectProps.onChange}
            size={size}
            disabled={disabled}
            isMandatory={isMandatory}
            defaultText={selectProps.defaultText}
            isSubmitted={isSubmitted}
            clearable={selectProps.clearable}
            onClear={selectProps.onClear}
          />
        );

      case "multiselect":
        const multiSelectProps = props as MultiSelectFormFieldProps;
        return (
          <MultiSelectDropdown
            label={label}
            name={name}
            value={Array.isArray(value) ? value : [value]}
            options={multiSelectProps.options}
            onChange={multiSelectProps.onChange}
            size={size}
            disabled={disabled}
            isMandatory={isMandatory}
            defaultText={multiSelectProps.defaultText}
            isSubmitted={isSubmitted}
          />
        );

      case "switch":
        const switchProps = props as SwitchFormFieldProps;
        return (
          <CustomSwitch
            label={label}
            size={size}
            color={switchProps.color}
            checked={switchProps.checked}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              switchProps.onChange(event, event.target.checked);
            }}
          />
        );
      case "radio":
        const radioProps = props as RadioFormFieldProps;
        return (
          <RadioGroup
            name={name}
            options={radioProps.options}
            selectedValue={value}
            onChange={radioProps.onChange}
            isMandatory={isMandatory}
            disabled={disabled}
            label={label}
            error={!!errorMessage}
            helperText={errorMessage}
            inline={radioProps.inline}
          />
        );
      case "autocomplete":
        const autocompleteProps = props as AutocompleteFormFieldProps;
        return (
          <AutocompleteTextBox
            ControlID={ControlID}
            title={label}
            value={value}
            onChange={autocompleteProps.onChange}
            fetchSuggestions={autocompleteProps.fetchSuggestions}
            onSelectSuggestion={autocompleteProps.onSelectSuggestion}
            suggestions={autocompleteProps.suggestions}
            placeholder={placeholder}
            type="text"
            size={size}
            isMandatory={isMandatory}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            isSubmitted={isSubmitted}
            errorMessage={errorMessage}
            onBlur={onBlur}
            InputProps={InputProps}
            ref={ref}
          />
        );
      case "datepicker":
        const datePickerProps = props as DatePickerFormFieldProps;
        return (
          <CustomDatePicker
            ControlID={ControlID}
            title={label}
            value={value}
            onChange={datePickerProps.onChange}
            placeholder={placeholder}
            size={size}
            isMandatory={isMandatory}
            disabled={disabled}
            readOnly={readOnly}
            errorMessage={errorMessage}
            minDate={datePickerProps.minDate}
            maxDate={datePickerProps.maxDate}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
          />
        );
      case "datetimepicker":
        const dateTimePickerProps = props as DateTimePickerFormFieldProps;
        return (
          <CustomDateTimePicker
            ControlID={ControlID}
            title={label}
            value={value}
            onChange={dateTimePickerProps.onChange}
            placeholder={placeholder}
            size={size}
            isMandatory={isMandatory}
            disabled={disabled}
            readOnly={readOnly}
            errorMessage={errorMessage}
            minDateTime={dateTimePickerProps.minDateTime}
            maxDateTime={dateTimePickerProps.maxDateTime}
            InputProps={InputProps}
            InputLabelProps={InputLabelProps}
          />
        );
      default:
        return null;
    }
  }, [
    props,
    type,
    label,
    value,
    name,
    ControlID,
    size,
    placeholder,
    isMandatory,
    errorMessage,
    disabled,
    readOnly,
    maxLength,
    min,
    max,
    step,
    isSubmitted,
    InputProps,
    InputLabelProps,
    onBlur,
    ref,
  ]);

  return (
    <Grid item {...gridProps}>
      <Box display="flex" alignItems="center">
        {renderField}
        {showAddButton && onAddClick && (
          <CustomButton
            variant="contained"
            size="small"
            icon={AddIcon}
            onClick={onAddClick}
            ariaLabel="add"
            color="primary"
            sx={{
              marginTop: "4px",
              marginRight: "4px",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              "&:hover": {
                backgroundColor: "blue.700",
                transform: "scale(1.05)",
              },
              "&:active": {
                backgroundColor: "blue.300",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
              },
              marginLeft: 0.5,
              padding: "8px 12px",
            }}
          />
        )}
      </Box>
    </Grid>
  );
});

FormField.displayName = "FormField";

export default FormField;
