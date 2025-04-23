import React, { useState, ReactNode, JSX } from "react";
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
  Stack,
  InputLabel,
  FormGroup,
  SelectChangeEvent,
  TextFieldProps,
  FormControlProps,
  CheckboxProps,
  RadioGroupProps,
  SelectProps,
  AutocompleteProps,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

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
  | "file";

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
  shrink?: boolean;
  adornment?: ReactNode;
  adornmentPosition?: "start" | "end";
}

// Specific props for text-like inputs
interface TextFieldTypeProps {
  type: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
}

// Specific props for textarea
interface TextareaTypeProps {
  type: "textarea";
  rows?: number;
  inputProps?: React.InputHTMLAttributes<HTMLTextAreaElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
}

// Specific props for select and multiselect
interface SelectTypeProps {
  type: "select";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLSelectElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
}

// Specific props for autocomplete
interface AutocompleteTypeProps {
  type: "autocomplete" | "multiselect";
  options: OptionType[];
  multiple?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
}

// Specific props for radio
interface RadioTypeProps {
  type: "radio";
  options: OptionType[];
  row?: boolean;
}

// Specific props for checkbox
interface CheckboxTypeProps {
  type: "checkbox";
  options?: OptionType[];
  row?: boolean;
}

// Specific props for datepicker and datetimepicker
interface DatePickerTypeProps {
  type: "datepicker" | "datetimepicker";
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

// Specific props for file input
interface FileTypeProps {
  type: "file";
  accept?: string;
  maxSize?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: Partial<TextFieldProps["InputProps"]>;
}

// Combine all possible props using discriminated union
export type FormFieldProps<TFieldValues extends FieldValues> = FormFieldCommonProps<TFieldValues> &
  (TextFieldTypeProps | TextareaTypeProps | SelectTypeProps | AutocompleteTypeProps | RadioTypeProps | CheckboxTypeProps | DatePickerTypeProps | FileTypeProps);

/**
 * FormField - A comprehensive form field component that supports various field types
 * Integrates with React Hook Form and Material UI
 */
const FormField = <TFieldValues extends FieldValues>({
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
  shrink,
  adornment,
  adornmentPosition = "end",
  ...rest
}: FormFieldProps<TFieldValues>): JSX.Element => {
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

  // Safely access properties based on field type
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

  const getMin = (): number | undefined => {
    if (isTextField(type) && type === "number") {
      return (rest as any).min;
    }
    return undefined;
  };

  const getMax = (): number | undefined => {
    if (isTextField(type) && type === "number") {
      return (rest as any).max;
    }
    return undefined;
  };

  const getStep = (): number | undefined => {
    if (isTextField(type) && type === "number") {
      return (rest as any).step;
    }
    return undefined;
  };

  const getPattern = (): string | undefined => {
    if (isTextField(type)) {
      return (rest as any).pattern;
    }
    return undefined;
  };

  const getAccept = (): string | undefined => {
    if (isFileInput(type)) {
      return (rest as any).accept;
    }
    return undefined;
  };

  const getMaxSize = (): number | undefined => {
    if (isFileInput(type)) {
      return (rest as any).maxSize;
    }
    return undefined;
  };

  const getRow = (): boolean => {
    if (isRadio(type) || isCheckbox(type)) {
      return (rest as any).row || false;
    }
    return false;
  };

  // Handle password visibility toggle
  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  // Validate file
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
      const acceptedTypes: string[] = accept.split(",").map((type: string): string => type.trim());
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;

      if (!acceptedTypes.some((type: string) => type === fileType || type === fileExtension || (type.includes("/*") && fileType.startsWith(type.replace("/*", "/"))))) {
        setFileError(`File type not supported. Accepted types: ${accept}`);
        return false;
      }
    }

    setFileError("");
    return true;
  };

  // Render the appropriate field based on type
  const renderField = ({ field, fieldState }: { field: any; fieldState: { error?: { message?: string } } }) => {
    const { error } = fieldState;
    const errorMessage = error?.message || fileError;

    // Common props for most field types
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
      ...rest,
    };

    // Text-like inputs
    if (isTextField(type)) {
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
            shrink: shrink,
          }}
        />
      );
    }

    // Password field
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
                  {showPassword ? <VisibilityOff /> : <Visibility />}
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

    // Text area
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

    // Select field
    if (isSelect(type)) {
      const options = getOptions();
      const multiple = getMultiple();

      return (
        <FormControl error={!!errorMessage} disabled={disabled} fullWidth={fullWidth} required={required} variant={variant} size={size}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            {...field}
            labelId={`${name}-label`}
            id={`field-${name}`}
            multiple={multiple}
            label={label}
            onChange={(e: SelectChangeEvent<unknown>) => {
              field.onChange(e);
              externalOnChange?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
              field.onBlur(e);
              externalOnBlur?.(e);
            }}
            renderValue={
              multiple
                ? (selected: any) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as Array<string | number>).map((value) => {
                        const option: OptionType = options.find((opt: OptionType) => opt.value === value) || { value: "", label: "" };
                        return <Chip key={String(value)} label={option.label || value} size="small" />;
                      })}
                    </Box>
                  )
                : undefined
            }
            {...(rest as any)}
          >
            {options.map((option) => (
              <MenuItem key={String(option.value)} value={String(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Multi-select using Autocomplete
    if (isMultiSelect(type)) {
      const options = getOptions();

      return (
        <Autocomplete
          {...field}
          multiple
          id={`field-${name}`}
          options={options}
          getOptionLabel={(option: any) => {
            // Handle both object options and simple value options
            if (typeof option === "object" && option !== null) {
              return option.label || "";
            }
            const foundOption: OptionType | undefined = options.find((opt: OptionType) => opt.value === option);
            return foundOption ? foundOption.label : String(option);
          }}
          isOptionEqualToValue={(option: OptionType, value: any) => {
            if (typeof value === "object" && value !== null) {
              return option.value === value.value;
            }
            return option.value === value;
          }}
          value={field.value || []}
          disabled={disabled}
          fullWidth={fullWidth}
          onChange={(_: any, newValue: any) => {
            // Transform selected options to array of values
            const values = newValue.map((item: any) => (typeof item === "object" ? item.value : item));
            field.onChange(values);
            externalOnChange?.(values);
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
                shrink: shrink,
              }}
            />
          )}
          {...(rest as any)}
        />
      );
    }

    // Autocomplete field
    if (isAutocomplete(type)) {
      const options = getOptions();

      return (
        <Autocomplete
          {...field}
          id={`field-${name}`}
          options={options}
          getOptionLabel={(option: any) => {
            // Handle both object options and simple value options
            if (typeof option === "object" && option !== null) {
              return option.label || "";
            }
            const foundOption: OptionType | undefined = options.find((opt: OptionType) => opt.value === option);
            return foundOption ? foundOption.label : option?.toString() || "";
          }}
          isOptionEqualToValue={(option: OptionType, value: any) => {
            if (typeof value === "object" && value !== null) {
              return option.value === value.value;
            }
            return option.value === value;
          }}
          value={field.value || null}
          disabled={disabled}
          fullWidth={fullWidth}
          onChange={(_: any, newValue: any) => {
            // Transform to value
            const value = newValue ? (typeof newValue === "object" ? newValue.value : newValue) : null;
            field.onChange(value);
            externalOnChange?.(value);
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
                shrink: shrink,
              }}
            />
          )}
          {...(rest as any)}
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
          >
            <Stack direction={row ? "row" : "column"} spacing={1}>
              {options.map((option: OptionType) => (
                <FormControlLabel key={String(option.value)} value={option.value} control={<Radio size={size} />} label={option.label} />
              ))}
            </Stack>
          </RadioGroup>
          {(errorMessage || helperText) && <FormHelperText>{errorMessage || helperText}</FormHelperText>}
        </FormControl>
      );
    }

    // Checkbox
    if (isCheckbox(type)) {
      const options = getOptions();
      const row = getRow();

      if (options.length > 0) {
        // Multiple checkboxes
        return (
          <FormControl component="fieldset" error={!!errorMessage} disabled={disabled} required={required} fullWidth={fullWidth}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup row={row}>
              {options.map((option: OptionType) => {
                const isChecked: boolean = Array.isArray(field.value) ? field.value.includes(option.value) : false;

                return (
                  <FormControlLabel
                    key={String(option.value)}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let newValue: Array<string | number | boolean> = [...(field.value || [])];
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
                {...field}
                checked={field.value || false}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Date picker
    if (isDatePicker(type)) {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              field.onChange(newValue);
              externalOnChange?.(newValue);
            }}
            disabled={disabled}
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
            {...(rest as any)}
          />
        </LocalizationProvider>
      );
    }

    // Date-time picker
    if (isDateTimePicker(type)) {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => {
              field.onChange(newValue);
              externalOnChange?.(newValue);
            }}
            disabled={disabled}
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
            {...(rest as any)}
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

    // Default to text input
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
};

export default FormField;
