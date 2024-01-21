import React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";

interface TextBoxProps {
  ControlID: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  size?: "small" | "medium"; // Adjusted for Material UI sizes
  disabled?: boolean;
  icon?: React.ReactNode;
  onIconClick?: () => void;
  isMandatory?: boolean;
  readOnly?: boolean;
  ariaLabelIcon?: string;
}

const IconTextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
  placeholder,
  type = "text",
  className,
  size,
  disabled = false,
  icon,
  onIconClick,
  isMandatory = false,
  readOnly = false,
  ariaLabelIcon,
}) => {
  const controlId = `txt${ControlID}`;

  return (
    <FormGroup>
      {title && (
        <FormLabel htmlFor={controlId}>
          {title}
          {isMandatory && <span className="text-danger">*</span>}
        </FormLabel>
      )}
      <FormControl variant="outlined" fullWidth>
        <TextField
          id={controlId}
          type={type}
          label={title}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          size={size}
          disabled={disabled}
          InputProps={{
            readOnly: readOnly,
            endAdornment: icon ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label={ariaLabelIcon}
                  onClick={onIconClick}
                  edge="end"
                >
                  {icon}
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </FormControl>
    </FormGroup>
  );
};

export default IconTextBox;
