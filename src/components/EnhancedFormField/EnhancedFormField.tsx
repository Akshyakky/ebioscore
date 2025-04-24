import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Autocomplete,
  InputAdornment,
  IconButton,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Controller, useFormContext, RegisterOptions } from "react-hook-form";

interface EnhancedFormFieldProps {
  type: string;
  label: string;
  name: string;
  ControlID: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<unknown> | Date | null) => void;
  options?: { value: string; label: string }[];
  isSubmitted?: boolean;
  isMandatory?: boolean;
  gridProps?: { xs: number; sm?: number; md?: number; lg?: number; xl?: number };
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  maxDate?: Date;
  onBlur?: () => void;
  fetchSuggestions?: (input: string) => Promise<string[]>;
  onSelectSuggestion?: (suggestion: string) => void;
  inline?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  InputProps?: any;
  size?: "small" | "medium";
  rules?: RegisterOptions; // React Hook Form validation rules
  useFormController?: boolean; // Flag to use React Hook Form Controller
  defaultValue?: any; // Default value for React Hook Form
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  type,
  label,
  name,
  ControlID,
  value,
  onChange,
  options = [],
  isSubmitted = false,
  isMandatory = false,
  gridProps = { xs: 12, sm: 6, md: 3 },
  placeholder = "",
  disabled = false,
  maxLength,
  maxDate,
  onBlur,
  fetchSuggestions,
  onSelectSuggestion,
  inline = false,
  showAddButton = false,
  onAddClick,
  InputProps,
  size = "medium",
  rules,
  useFormController = false,
  defaultValue,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Get React Hook Form context if available
  const formContext = useFormContext();
  const isHookForm = useFormController && formContext;

  // Set up validation rules
  const validationRules: RegisterOptions = {
    ...(isMandatory && { required: "This field is required" }),
    ...rules,
  };

  // Validate field if it's mandatory and submitted for non-hook form mode
  const isError = !isHookForm && isSubmitted && isMandatory && (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0));

  // Handle autocomplete input change
  const handleAutocompleteInputChange = async (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);

    if (fetchSuggestions && newInputValue.trim().length > 0) {
      try {
        const fetchedSuggestions = await fetchSuggestions(newInputValue);
        setSuggestions(fetchedSuggestions);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // When using React Hook Form mode, reset the input value when field is reset
  useEffect(() => {
    if (isHookForm && defaultValue !== undefined) {
      setInputValue("");
    }
  }, [isHookForm, defaultValue]);

  // Renders field when using React Hook Form
  const renderHookFormField = () => {
    if (!formContext) return null;

    return (
      <Controller
        name={name}
        control={formContext.control}
        defaultValue={defaultValue}
        rules={validationRules}
        render={({ field, fieldState: { error } }) => {
          // Make the field props available for the different component types
          const fieldProps = {
            ...field,
            error: !!error,
            helperText: error?.message || "",
            disabled,
            size,
            id: ControlID,
          };

          switch (type) {
            case "text":
              return (
                <TextField {...fieldProps} label={label} fullWidth placeholder={placeholder} inputProps={{ maxLength }} InputProps={InputProps} variant="outlined" margin="dense" />
              );

            case "email":
              return (
                <TextField
                  {...fieldProps}
                  label={label}
                  fullWidth
                  type="email"
                  placeholder={placeholder}
                  inputProps={{ maxLength }}
                  InputProps={InputProps}
                  variant="outlined"
                  margin="dense"
                />
              );

            case "number":
              return (
                <TextField
                  {...fieldProps}
                  label={label}
                  fullWidth
                  type="number"
                  placeholder={placeholder}
                  inputProps={{ maxLength }}
                  InputProps={InputProps}
                  variant="outlined"
                  margin="dense"
                />
              );

            case "textarea":
              return (
                <TextField
                  {...fieldProps}
                  label={label}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={placeholder}
                  inputProps={{ maxLength }}
                  InputProps={InputProps}
                  variant="outlined"
                  margin="dense"
                />
              );

            case "select":
              return (
                <FormControl fullWidth error={!!error} disabled={disabled} size={size} variant="outlined" margin="dense">
                  <InputLabel id={`${ControlID}-label`}>{label}</InputLabel>
                  <Select
                    {...fieldProps}
                    labelId={`${ControlID}-label`}
                    label={label}
                    displayEmpty
                    endAdornment={
                      showAddButton && (
                        <InputAdornment position="end">
                          <IconButton onClick={onAddClick} size="small" edge="end">
                            <AddCircleIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      <em>Select</em>
                    </MenuItem>
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              );

            case "multiselect":
              return (
                <FormControl fullWidth error={!!error} disabled={disabled} size={size} variant="outlined" margin="dense">
                  <InputLabel id={`${ControlID}-label`}>{label}</InputLabel>
                  <Select
                    {...fieldProps}
                    labelId={`${ControlID}-label`}
                    multiple
                    label={label}
                    renderValue={(selected) => {
                      if (Array.isArray(selected)) {
                        return selected
                          .map((val) => {
                            const option = options.find((opt) => opt.value === val);
                            return option ? option.label : val;
                          })
                          .join(", ");
                      }
                      return "";
                    }}
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              );

            case "radio":
              return (
                <FormControl component="fieldset" error={!!error} fullWidth margin="dense">
                  {label && <Typography variant="subtitle2">{label}</Typography>}
                  <RadioGroup {...fieldProps} row={inline}>
                    {options.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size={size === "small" ? "small" : "medium"} />}
                        label={option.label}
                        disabled={disabled}
                      />
                    ))}
                  </RadioGroup>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              );

            case "autocomplete":
              return (
                <Autocomplete
                  id={ControlID}
                  freeSolo
                  options={suggestions}
                  inputValue={inputValue}
                  onInputChange={handleAutocompleteInputChange}
                  onChange={(event, newValue) => {
                    field.onChange(newValue);
                    if (onSelectSuggestion && typeof newValue === "string") {
                      onSelectSuggestion(newValue);
                    }
                  }}
                  disabled={disabled}
                  size={size}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={label}
                      error={!!error}
                      helperText={error?.message || ""}
                      placeholder={placeholder}
                      fullWidth
                      variant="outlined"
                      margin="dense"
                      InputProps={{
                        ...params.InputProps,
                        ...InputProps,
                      }}
                    />
                  )}
                />
              );

            case "datepicker":
              return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={label}
                    value={field.value || null}
                    onChange={(newDate) => {
                      field.onChange(newDate);
                    }}
                    disabled={disabled}
                    maxDate={maxDate}
                    slotProps={{
                      textField: {
                        id: ControlID,
                        error: !!error,
                        helperText: error?.message || "",
                        fullWidth: true,
                        margin: "dense",
                        variant: "outlined",
                        size: size,
                      },
                    }}
                  />
                </LocalizationProvider>
              );

            case "datetimepicker":
              return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={label}
                    value={field.value || null}
                    onChange={(newDateTime) => {
                      field.onChange(newDateTime);
                    }}
                    disabled={disabled}
                    maxDate={maxDate}
                    slotProps={{
                      textField: {
                        id: ControlID,
                        error: !!error,
                        helperText: error?.message || "",
                        fullWidth: true,
                        margin: "dense",
                        variant: "outlined",
                        size: size,
                      },
                    }}
                  />
                </LocalizationProvider>
              );

            default:
              return <TextField {...fieldProps} label={label} fullWidth placeholder={placeholder} InputProps={InputProps} variant="outlined" margin="dense" />;
          }
        }}
      />
    );
  };

  // Renders field with traditional props approach
  const renderStandardField = () => {
    switch (type) {
      case "text":
        return (
          <TextField
            fullWidth
            id={ControlID}
            name={name}
            label={label}
            value={value ?? ""}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur}
            error={isError}
            helperText={isError ? "This field is required" : ""}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            inputProps={{
              maxLength: maxLength,
            }}
            InputProps={InputProps}
            variant="outlined"
            margin="dense"
          />
        );

      case "email":
        return (
          <TextField
            fullWidth
            id={ControlID}
            name={name}
            label={label}
            value={value ?? ""}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur}
            error={isError || (value && !/\S+@\S+\.\S+/.test(value))}
            helperText={isError ? "This field is required" : value && !/\S+@\S+\.\S+/.test(value) ? "Invalid email format" : ""}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            type="email"
            inputProps={{
              maxLength: maxLength,
            }}
            InputProps={InputProps}
            variant="outlined"
            margin="dense"
          />
        );

      case "number":
        return (
          <TextField
            fullWidth
            id={ControlID}
            name={name}
            label={label}
            value={value ?? ""}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur}
            error={isError}
            helperText={isError ? "This field is required" : ""}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            type="number"
            inputProps={{
              maxLength: maxLength,
            }}
            InputProps={InputProps}
            variant="outlined"
            margin="dense"
          />
        );

      case "textarea":
        return (
          <TextField
            fullWidth
            id={ControlID}
            name={name}
            label={label}
            value={value ?? ""}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur}
            error={isError}
            helperText={isError ? "This field is required" : ""}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            multiline
            rows={4}
            inputProps={{
              maxLength: maxLength,
            }}
            InputProps={InputProps}
            variant="outlined"
            margin="dense"
          />
        );

      case "select":
        return (
          <FormControl fullWidth error={isError} disabled={disabled} size={size} variant="outlined" margin="dense">
            <InputLabel id={`${ControlID}-label`}>{label}</InputLabel>
            <Select
              labelId={`${ControlID}-label`}
              id={ControlID}
              name={name}
              value={value !== undefined && value !== null ? value : ""}
              onChange={onChange as (e: SelectChangeEvent<unknown>) => void}
              label={label}
              displayEmpty
              endAdornment={
                showAddButton && (
                  <InputAdornment position="end">
                    <IconButton onClick={onAddClick} size="small" edge="end">
                      <AddCircleIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }
            >
              <MenuItem value="" disabled>
                <em>Select</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {isError && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );

      case "multiselect":
        return (
          <FormControl fullWidth error={isError} disabled={disabled} size={size} variant="outlined" margin="dense">
            <InputLabel id={`${ControlID}-label`}>{label}</InputLabel>
            <Select
              labelId={`${ControlID}-label`}
              id={ControlID}
              name={name}
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={onChange as (e: SelectChangeEvent<unknown>) => void}
              label={label}
              renderValue={(selected) => {
                if (Array.isArray(selected)) {
                  return selected
                    .map((val) => {
                      const option = options.find((opt) => opt.value === val);
                      return option ? option.label : val;
                    })
                    .join(", ");
                }
                return "";
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {isError && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );

      case "radio":
        return (
          <FormControl component="fieldset" error={isError} fullWidth margin="dense">
            {label && <Typography variant="subtitle2">{label}</Typography>}
            <RadioGroup id={ControlID} name={name} value={value || ""} onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void} row={inline}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size={size === "small" ? "small" : "medium"} />}
                  label={option.label}
                  disabled={disabled}
                />
              ))}
            </RadioGroup>
            {isError && <FormHelperText>This field is required</FormHelperText>}
          </FormControl>
        );

      case "autocomplete":
        return (
          <Autocomplete
            id={ControlID}
            freeSolo
            options={suggestions}
            inputValue={inputValue}
            onInputChange={handleAutocompleteInputChange}
            onChange={(event, newValue) => {
              if (onSelectSuggestion && typeof newValue === "string") {
                onSelectSuggestion(newValue);
              }
            }}
            disabled={disabled}
            size={size}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                name={name}
                value={value || ""}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  (onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)(e);
                }}
                onBlur={onBlur}
                error={isError}
                helperText={isError ? "This field is required" : ""}
                placeholder={placeholder}
                fullWidth
                variant="outlined"
                margin="dense"
                InputProps={{
                  ...params.InputProps,
                  ...InputProps,
                }}
              />
            )}
          />
        );

      case "datepicker":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={value || null}
              onChange={(newDate) => {
                onChange && onChange(newDate);
              }}
              disabled={disabled}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  id: ControlID,
                  name: name,
                  fullWidth: true,
                  error: isError,
                  helperText: isError ? "This field is required" : "",
                  size: size,
                  margin: "dense",
                  variant: "outlined",
                },
              }}
            />
          </LocalizationProvider>
        );

      case "datetimepicker":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label={label}
              value={value || null}
              onChange={(newDateTime) => {
                onChange && onChange(newDateTime);
              }}
              disabled={disabled}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  id: ControlID,
                  name: name,
                  fullWidth: true,
                  error: isError,
                  helperText: isError ? "This field is required" : "",
                  size: size,
                  margin: "dense",
                  variant: "outlined",
                },
              }}
            />
          </LocalizationProvider>
        );

      default:
        return (
          <TextField
            fullWidth
            id={ControlID}
            name={name}
            label={label}
            value={value || ""}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            onBlur={onBlur}
            error={isError}
            helperText={isError ? "This field is required" : ""}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            InputProps={InputProps}
            variant="outlined"
            margin="dense"
          />
        );
    }
  };

  return (
    <Grid item {...gridProps}>
      {isHookForm ? renderHookFormField() : renderStandardField()}
    </Grid>
  );
};

export default EnhancedFormField;
