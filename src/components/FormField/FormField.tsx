import React from "react";
import {
  Grid,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import TextArea from "../TextArea/TextArea";
import FloatingLabelTextBox from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../DropDown/DropdownSelect";
import CustomSwitch from "../Checkbox/ColorSwitch";

type DropdownOption = {
  value: string;
  label: string;
};

type FieldType = "text" | "textarea" | "select" | "switch" | "number" | "email";

interface BaseFormFieldProps {
  type: FieldType;
  label: string;
  value: any;
  isSubmitted?: boolean;
  options?: DropdownOption[];
  name: string;
  ControlID: string;
  size?: "small" | "medium";
  placeholder?: string;
  isMandatory?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "textarea" | "number" | "email";
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
}

interface SwitchFormFieldProps extends BaseFormFieldProps {
  type: "switch";
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
  checked: boolean;
}

type FormFieldProps =
  | TextFormFieldProps
  | SelectFormFieldProps
  | SwitchFormFieldProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const {
    type,
    label,
    value,
    isSubmitted = false,
    options = [],
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
  } = props;

  const renderField = () => {
    switch (type) {
      case "text":
      case "number":
      case "email":
        return (
          <FloatingLabelTextBox
            title={label}
            placeholder={placeholder}
            value={value}
            onChange={props.onChange}
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
            inputPattern={type === "number" ? /^[0-9]*$/ : undefined}
          />
        );
      case "textarea":
        return (
          <TextArea
            label={label}
            value={value}
            placeholder={placeholder}
            onChange={props.onChange}
            rows={2}
            name={name}
          />
        );
      case "select":
        return (
          <DropdownSelect
            label={label}
            value={value}
            onChange={props.onChange}
            options={options}
            isSubmitted={isSubmitted}
            size={size}
            name={name}
          />
        );
      case "switch":
        return (
          <FormControlLabel
            control={
              <CustomSwitch
                checked={props.checked}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  props.onChange(event, event.target.checked);
                }}
              />
            }
            label={label}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Grid item xs={12} sm={6} md={3}>
      {renderField()}
    </Grid>
  );
};

export default FormField;