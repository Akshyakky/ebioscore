import React, { useState, ReactNode, forwardRef, useMemo } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import {
  TextField,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Autocomplete,
  Box,
  IconButton,
  Chip,
  InputLabel,
  FormGroup,
  SelectChangeEvent,
  TextFieldProps,
  CircularProgress,
  useTheme,
  Switch,
  styled, // Added Switch import
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs, { Dayjs } from "dayjs";

const ColorSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "switchColor",
})<{ switchColor?: string }>(({ theme, switchColor }) => ({
  "& .MuiSwitch-switchBase": {
    color: "#fff",
    "&.Mui-checked": {
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: switchColor || theme.palette.primary.main,
      },
      "&:hover": {
        backgroundColor: switchColor ? `${switchColor}B2` : `${theme.palette.primary.main}B2`,
      },
    },
    "&.Mui-disabled": {
      "& + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
      "&.Mui-checked": {
        "& + .MuiSwitch-track": {
          backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
        },
      },
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#ccc",
  },
}));

// Define the date format constant
const DATE_FORMAT = "DD/MM/YYYY";

// Define option type for select, radio, checkbox, etc.
export interface OptionType {
  value: string | number | boolean;
  label: string;
}

// Field types
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "search"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "multiselect"
  | "autocomplete"
  | "radio"
  | "checkbox"
  | "datepicker"
  | "datetimepicker"
  | "file"
  | "switch";

// Common props for all field types
interface FormFieldCommonProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  helperText?: string;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  defaultValue?: any;
  onChange?: (value: any) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  adornment?: ReactNode;
  adornmentPosition?: "start" | "end";
  // New props for dropdown functionality
  isSubmitted?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  defaultText?: string;
}

// Type guards for other props based on field type
type TextFieldTypeProps = {
  type: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

// Define other specific props types similarly to your original component
type TextareaTypeProps = {
  type: "textarea";
  rows?: number;
  inputProps?: React.InputHTMLAttributes<HTMLTextAreaElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type SelectTypeProps = {
  type: "select";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLSelectElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type AutocompleteTypeProps = {
  type: "autocomplete" | "multiselect";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type RadioTypeProps = {
  type: "radio";
  options: OptionType[];
  row?: boolean;
};

type CheckboxTypeProps = {
  type: "checkbox";
  options?: OptionType[];
  row?: boolean;
};

type DatePickerTypeProps = {
  type: "datepicker" | "datetimepicker";
  minDate?: Dayjs;
  maxDate?: Dayjs;
  format?: string;
};

type FileTypeProps = {
  type: "file";
  accept?: string;
  maxSize?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
};

type SwitchTypeProps = {
  type: "switch";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

// Combine all possible props using discriminated union
export type FormFieldProps<TFieldValues extends FieldValues> = FormFieldCommonProps<TFieldValues> &
  (TextFieldTypeProps | TextareaTypeProps | SelectTypeProps | AutocompleteTypeProps | RadioTypeProps | CheckboxTypeProps | DatePickerTypeProps | FileTypeProps | SwitchTypeProps);

/**
 * FormField - A comprehensive form field component for Material UI v7
 * Integrates with React Hook Form and Material UI
 */
const FormField = forwardRef<any, FormFieldProps<any>>(
  <TFieldValues extends FieldValues>(
    {
      name,
      control,
      label,
      type = "text",
      required = false,
      disabled = false,
      fullWidth = true,
      placeholder = "",
      helperText = "",
      variant = "outlined",
      size = "medium",
      defaultValue,
      onChange: externalOnChange,
      onBlur: externalOnBlur,
      adornment,
      adornmentPosition = "end",
      isSubmitted = false,
      clearable = false,
      onClear,
      loading = false,
      defaultText,
      ...rest
    }: FormFieldProps<TFieldValues>,
    ref: React.Ref<any>
  ) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string>("");

    // Type guards for checking field types
    const isTextField = (type: FieldType): type is TextFieldTypeProps["type"] => ["text", "email", "password", "number", "search", "tel", "url"].includes(type);
    const isTextArea = (type: FieldType): boolean => type === "textarea";
    const isSelect = (type: FieldType): boolean => type === "select";
    const isMultiSelect = (type: FieldType): boolean => type === "multiselect";
    const isAutocomplete = (type: FieldType): boolean => type === "autocomplete";
    const isRadio = (type: FieldType): boolean => type === "radio";
    const isCheckbox = (type: FieldType): boolean => type === "checkbox";
    const isDatePicker = (type: FieldType): boolean => type === "datepicker";
    const isDateTimePicker = (type: FieldType): boolean => type === "datetimepicker";
    const isFileInput = (type: FieldType): boolean => type === "file";
    const isSwitch = (type: FieldType): boolean => type === "switch";

    // Helper functions to access properties based on field type
    const getOptions = (): OptionType[] => {
      if (isSelect(type) || isMultiSelect(type) || isAutocomplete(type) || isRadio(type) || isCheckbox(type)) {
        return (rest as any).options || [];
      }
      return [];
    };

    const getMultiple = (): boolean => {
      if (isSelect(type) || isMultiSelect(type) || isAutocomplete(type)) {
        return (rest as any).multiple || false;
      }
      return false;
    };

    const getRows = (): number => {
      if (isTextArea(type)) {
        return (rest as any).rows || 4;
      }
      return 4;
    };

    const getInputProps = (): any => {
      return (rest as any).inputProps || {};
    };

    const getInputPropsObj = (): any => {
      return (rest as any).InputProps || {};
    };

    // Get date format from props or use default
    const getDateFormat = (): string => {
      if (isDatePicker(type) || isDateTimePicker(type)) {
        return (rest as any).format || DATE_FORMAT;
      }
      return DATE_FORMAT;
    };

    // Other getter functions similar to your original component
    const getMin = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).min : undefined);

    const getMax = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).max : undefined);

    const getStep = (): number | undefined => (isTextField(type) && type === "number" ? (rest as any).step : undefined);

    const getAccept = (): string | undefined => (isFileInput(type) ? (rest as any).accept : undefined);

    const getMaxSize = (): number | undefined => (isFileInput(type) ? (rest as any).maxSize : undefined);

    const getRow = (): boolean => (isRadio(type) || isCheckbox(type) ? (rest as any).row || false : false);

    const getSwitchColor = (): SwitchTypeProps["color"] => (isSwitch(type) ? (rest as any).color || "primary" : "primary");

    // Toggle password visibility
    const handleClickShowPassword = (): void => {
      setShowPassword(!showPassword);
    };

    // Validate file uploads
    const validateFile = (file: File | null): boolean => {
      if (!file) return true;

      const maxSize = getMaxSize();
      const accept = getAccept();

      if (maxSize && file.size > maxSize) {
        const sizeMB = Math.round(maxSize / 1048576);
        setFileError(`File size should not exceed ${sizeMB} MB`);
        return false;
      }

      if (accept) {
        const acceptedTypes = accept.split(",").map((type) => type.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split(".").pop()}`;

        const isValidType = acceptedTypes.some((type) => type === fileType || type === fileExtension || (type.includes("/*") && fileType.startsWith(type.replace("/*", "/"))));

        if (!isValidType) {
          setFileError(`File type not supported. Accepted types: ${accept}`);
          return false;
        }
      }

      setFileError("");
      return true;
    };

    // Main render function for Controller
    const renderField = ({ field, fieldState }: { field: any; fieldState: { error?: { message?: string } } }) => {
      const { error } = fieldState;
      const errorMessage = error?.message || fileError;

      // Common props for text-based fields
      const commonProps = {
        id: `field-${name}`,
        label,
        error: !!errorMessage,
        helperText: errorMessage || helperText,
        disabled,
        fullWidth,
        required,
        placeholder,
        size,
        variant,
        InputProps: {
          ...getInputPropsObj(),
          ...(adornment && {
            [adornmentPosition === "start" ? "startAdornment" : "endAdornment"]: <InputAdornment position={adornmentPosition}>{adornment}</InputAdornment>,
          }),
        },
        inputProps: {
          ...getInputProps(),
        },
      };

      // Handle text fields (input, email, number, etc.)
      if (isTextField(type) && type !== "password") {
        return (
          <TextField
            {...commonProps}
            {...field}
            type={type}
            inputProps={{
              ...getInputProps(),
              ...(type === "number" && {
                min: getMin(),
                max: getMax(),
                step: getStep(),
              }),
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
            InputLabelProps={{
              shrink: field.value ? true : undefined,
            }}
          />
        );
      }

      // Password field with visibility toggle
      if (isTextField(type) && type === "password") {
        return (
          <TextField
            {...commonProps}
            {...field}
            type={showPassword ? "text" : "password"}
            InputProps={{
              ...getInputPropsObj(),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
          />
        );
      }

      // Textarea
      if (isTextArea(type)) {
        return (
          <TextField
            {...commonProps}
            {...field}
            multiline
            rows={getRows()}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
          />
        );
      }

      // Enhanced Select field similar to DropdownSelect
      if (isSelect(type)) {
        const options = getOptions();
        const multiple = getMultiple();

        // Check for empty value state for error handling
        const isEmptyValue = useMemo(() => field.value === "" || field.value === "0", [field.value]);

        // Enhanced error handling with isSubmitted check (similar to DropdownSelect)
        const hasError = required && isSubmitted && isEmptyValue;

        // Get display value similar to DropdownSelect
        const displayValue = useMemo(() => {
          if (!options) return "";
          const selectedOption = options.find((option) => String(option.value) === String(field.value) || option.label === field.value);
          return selectedOption ? selectedOption.value : "";
        }, [field.value, options]);

        // Show loading state if options are not available
        if (!options || (loading && !options.length)) {
          return <CircularProgress size={24} />;
        }

        return (
          <FormControl variant={variant} size={size} fullWidth={fullWidth} error={hasError || !!errorMessage} required={required} disabled={disabled} ref={ref}>
            <InputLabel id={`${name}-label`} htmlFor={`field-${name}`}>
              {label}
            </InputLabel>
            <Select
              {...field}
              labelId={`${name}-label`}
              id={`field-${name}`}
              value={displayValue}
              multiple={multiple}
              label={label}
              onChange={(e: SelectChangeEvent<unknown>) => {
                const selectedValue = e.target.value;
                const selectedOption = options.find((opt) => String(opt.value) === String(selectedValue));

                if (selectedOption) {
                  field.onChange(selectedOption.value);
                  if (externalOnChange) {
                    externalOnChange({
                      label: selectedOption.label,
                      value: selectedOption.value,
                      originalEvent: e,
                    });
                  }
                } else {
                  field.onChange(e);
                  externalOnChange?.(e);
                }
              }}
              onBlur={(e: React.FocusEvent<HTMLElement>) => {
                field.onBlur(e);
                externalOnBlur?.(e);
              }}
              // Add clearable endAdornment similar to DropdownSelect
              endAdornment={
                clearable && field.value ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear selection"
                      onClick={() => {
                        field.onChange("");
                        onClear?.();
                      }}
                      edge="end"
                      size="small"
                      sx={{
                        padding: "2px",
                        margin: "8px",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.text.primary,
                        },
                      }}
                    >
                      <ClearIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              renderValue={(selected: any) => {
                if (multiple) {
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as Array<string | number>).map((value) => {
                        const option = options.find((opt) => String(opt.value) === String(value));
                        return <Chip key={String(value)} label={option?.label ?? value} size="small" />;
                      })}
                    </Box>
                  );
                }
                return options.find((opt) => String(opt.value) === String(selected))?.label ?? selected;
              }}
            >
              <MenuItem value="">{defaultText || `Select ${label}`}</MenuItem>
              {options.map((option) => (
                <MenuItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(hasError || errorMessage || helperText) && <FormHelperText>{hasError ? `${label} is required.` : errorMessage || helperText}</FormHelperText>}
          </FormControl>
        );
      }

      // Autocomplete with multiselect support
      if (isMultiSelect(type) || isAutocomplete(type)) {
        const options = getOptions();
        const multiple = isMultiSelect(type) || getMultiple();

        return (
          <Autocomplete
            {...field}
            multiple={multiple}
            id={`field-${name}`}
            options={options}
            getOptionLabel={(option: any) => {
              if (typeof option === "object" && option !== null) {
                return option.label || "";
              }
              const foundOption = options.find((opt) => opt.value === option);
              return foundOption ? foundOption.label : String(option);
            }}
            isOptionEqualToValue={(option, value) => {
              if (typeof value === "object" && value !== null) {
                return (option as OptionType).value === (value as OptionType).value;
              }
              return (option as OptionType).value === value;
            }}
            value={field.value || (multiple ? [] : null)}
            disabled={disabled}
            onChange={(_, newValue) => {
              if (multiple) {
                const values = (newValue as Array<any>).map((item: any) => (typeof item === "object" ? item.value : item));
                field.onChange(values);
                externalOnChange?.(values);
              } else {
                const value = newValue ? (typeof newValue === "object" && "value" in newValue ? (newValue as OptionType).value : newValue) : null;
                field.onChange(value);
                externalOnChange?.(value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                variant={variant}
                error={!!errorMessage}
                helperText={errorMessage || helperText}
                required={required}
                size={size}
                InputLabelProps={{
                  shrink: field.value ? true : undefined,
                }}
              />
            )}
          />
        );
      }

      // Radio group
      if (isRadio(type)) {
        const options = getOptions();
        const row = getRow();

        return (
          <FormControl component="fieldset" error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              {...field}
              aria-label={String(name)}
              name={String(name)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(e);
                externalOnChange?.(e);
              }}
              row={row}
            >
              {options.map((option) => (
                <FormControlLabel key={String(option.value)} value={option.value} control={<Radio size={size} />} label={option.label} />
              ))}
            </RadioGroup>
            {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
          </FormControl>
        );
      }

      // Checkbox group or single checkbox
      if (isCheckbox(type)) {
        const options = getOptions();
        const row = getRow();

        if (options.length > 0) {
          // Multiple checkboxes
          return (
            <FormControl component="fieldset" error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
              <FormLabel component="legend">{label}</FormLabel>
              <FormGroup row={row}>
                {options.map((option) => {
                  const isChecked = Array.isArray(field.value) ? field.value.includes(option.value) : false;

                  return (
                    <FormControlLabel
                      key={String(option.value)}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            let newValue = [...(field.value || [])];
                            if (e.target.checked) {
                              newValue.push(option.value);
                            } else {
                              newValue = newValue.filter((val) => val !== option.value);
                            }
                            field.onChange(newValue);
                            externalOnChange?.(newValue);
                          }}
                          size={size}
                        />
                      }
                      label={option.label}
                    />
                  );
                })}
              </FormGroup>
              {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
            </FormControl>
          );
        }

        // Single checkbox
        return (
          <FormControl error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value || false}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    externalOnChange?.(e.target.checked);
                  }}
                  size={size}
                />
              }
              label={label}
            />
            {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
          </FormControl>
        );
      }

      // Date pickers
      if (isDatePicker(type) || isDateTimePicker(type)) {
        const PickerComponent = isDatePicker(type) ? DatePicker : DateTimePicker;
        const dateFormat = getDateFormat();

        return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <PickerComponent
              label={label}
              value={field.value ? (typeof field.value === "string" ? dayjs(field.value) : dayjs(field.value)) : null}
              onChange={(newValue) => {
                let formattedValue = null;

                if (newValue && dayjs.isDayjs(newValue)) {
                  formattedValue = newValue.toISOString();
                }

                field.onChange(formattedValue);
                externalOnChange?.(formattedValue);
              }}
              disabled={disabled}
              format={dateFormat}
              slotProps={{
                textField: {
                  variant,
                  fullWidth,
                  required,
                  error: !!errorMessage,
                  helperText: errorMessage || helperText,
                  size,
                  InputLabelProps: {
                    shrink: true,
                  },
                },
              }}
            />
          </LocalizationProvider>
        );
      }

      // File input
      if (isFileInput(type)) {
        const accept = getAccept();

        return (
          <TextField
            {...commonProps}
            type="file"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              ...getInputProps(),
              accept,
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              const isValid = validateFile(file);
              if (isValid) {
                field.onChange(file);
                externalOnChange?.(file);
              } else {
                e.target.value = "";
                field.onChange(null);
                externalOnChange?.(null);
              }
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
          />
        );
      }

      // Switch component
      if (isSwitch(type)) {
        const switchColor = getSwitchColor();

        // Handle Y/N values properly
        const isChecked = field.value === "Y" || field.value === true;

        return (
          <FormControl
            error={!!errorMessage}
            disabled={disabled}
            required={required}
            fullWidth={fullWidth}
            sx={{
              // Improve spacing and alignment
              "& .MuiFormControlLabel-root": {
                alignItems: "center",
                gap: 1,
                margin: 0,
              },
              "& .MuiFormControlLabel-label": {
                fontSize: size === "small" ? "0.875rem" : "1rem",
                fontWeight: 500,
                color: disabled ? "text.disabled" : "text.primary",
              },
            }}
          >
            <FormControlLabel
              control={
                <ColorSwitch
                  checked={isChecked}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // Convert boolean to Y/N string
                    const newValue = e.target.checked ? "Y" : "N";
                    field.onChange(newValue);
                    externalOnChange?.(newValue);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLElement>) => {
                    field.onBlur(e);
                    externalOnBlur?.(e);
                  }}
                  color={switchColor}
                  size={size}
                  disabled={disabled}
                  inputProps={{
                    ...getInputProps(),
                    "aria-describedby": errorMessage ? `${name}-helper-text` : undefined,
                  }}
                  sx={{
                    "& .MuiSwitch-thumb": {
                      color: disabled ? "#BDBDBD" : "#fff",
                    },
                    "& .MuiSwitch-switchBase:not(.Mui-checked)": {
                      color: disabled ? "#BDBDBD" : "#ccc",
                    },
                  }}
                />
              }
              label={label}
              labelPlacement="end"
            />
            {(errorMessage || helperText) && (
              <FormHelperText
                id={`${name}-helper-text`}
                sx={{
                  marginTop: 0.5,
                  marginLeft: 0,
                  fontSize: size === "small" ? "0.75rem" : "0.875rem",
                }}
              >
                {errorMessage || helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }

      // Default text field as fallback
      return (
        <TextField
          {...commonProps}
          {...field}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e);
            externalOnChange?.(e);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            field.onBlur(e);
            externalOnBlur?.(e);
          }}
        />
      );
    };

    return <Controller name={name} control={control} defaultValue={defaultValue} render={renderField} />;
  }
);

FormField.displayName = "FormField";

export default FormField;
