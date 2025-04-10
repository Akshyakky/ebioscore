import React, { useState, useEffect, forwardRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
interface AutocompleteTextBoxProps {
  ControlID: string;
  title?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchSuggestions?: (input: string) => Promise<string[]>;
  onSelectSuggestion?: (suggestion: string) => void;
  suggestions?: string[];
  placeholder?: string;
  type?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium";
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ariaLabel?: string;
  maxLength?: number;
  isSubmitted?: boolean;
  errorMessage?: string;
  inputValue?: any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  InputProps?: Partial<React.ComponentProps<typeof TextField>["InputProps"]>;
}

const AutocompleteTextBox = forwardRef<HTMLInputElement, AutocompleteTextBoxProps>(
  (
    {
      ControlID,
      title,
      value = "",
      onChange,
      fetchSuggestions,
      onSelectSuggestion,
      suggestions = [],
      placeholder,
      type = "text",
      className,
      style,
      size,
      isMandatory = false,
      disabled = false,
      readOnly = false,
      ariaLabel = "",
      maxLength,
      isSubmitted = false,
      errorMessage,
      onBlur,
      InputProps,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value);
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
      // Sync value → inputValue on external reset or selection
      if (value !== inputValue) {
        setInputValue(value || "");
      }
    }, [value]);

    const fetchOptions = async (input: string) => {
      if (fetchSuggestions) {
        const fetchedSuggestions = await fetchSuggestions(input);
        setOptions(fetchedSuggestions);
      }
    };

    useEffect(() => {
      fetchOptions(inputValue);
    }, [inputValue]);

    const handleInputChange = (event: React.SyntheticEvent<Element, Event> | null, newInputValue: string) => {
      setInputValue(newInputValue);
      if (onChange && event) {
        onChange(event as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleSelect = (event: React.SyntheticEvent, newValue: string | null) => {
      if (onSelectSuggestion) {
        onSelectSuggestion(newValue || "");
      }
    };

    const highlightMatch = (text: string, query: string) => {
      const regex = new RegExp(query, "gi");
      const parts = text.split(regex);
      const matches = text.match(regex);

      return (
        <>
          {parts.map((part, index) => (
            <span key={index}>
              {part}
              {index < parts.length - 1 && matches && matches[index] && <span style={{ fontWeight: 700, color: "#1976d2" }}>{matches[index]}</span>}
            </span>
          ))}
        </>
      );
    };

    const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: string) => {
      return <li {...props}>{highlightMatch(option, inputValue)}</li>;
    };

    const controlId = `txt${ControlID}`;
    const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;
    const errorToShow = errorMessage || (isMandatory && !value ? `${title} is required.` : "");

    return (
      <FormControl fullWidth className={className} margin="normal" style={style}>
        <Autocomplete
          id={controlId}
          freeSolo
          options={options}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          value={inputValue}
          onChange={handleSelect}
          renderOption={renderOption}
          ListboxProps={{
            sx: {
              "& .MuiAutocomplete-option": {
                fontSize: "1rem", // Example font size, adjust as needed
                padding: "10px 15px", // Adjust padding as needed
                display: "block", // Allows text to wrap as in a standard block element
                whiteSpace: "wrap", // Allows text to wrap to next line
                textAlign: "left", // Aligns text to the left
                lineHeight: "1.5", // Adjust line height to ensure readability of wrapped text
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={title}
              type={type}
              placeholder={placeholder}
              size={size}
              disabled={disabled}
              onChange={onChange}
              inputRef={ref}
              InputProps={{
                ...params.InputProps,
                ...InputProps,
                readOnly: readOnly,
                inputProps: {
                  ...params.inputProps,
                  "aria-label": ariaLabel || title,
                  maxLength: maxLength,
                },
              }}
              value={value}
              error={isInvalid}
              helperText={isInvalid ? errorToShow : ""}
              onBlur={onBlur}
            />
          )}
          onBlur={onBlur}
        />
      </FormControl>
    );
  }
);

export default AutocompleteTextBox;
