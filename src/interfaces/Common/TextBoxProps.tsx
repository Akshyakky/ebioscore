import { TextField } from "@mui/material";

export interface TextBoxProps {
  ControlID: string;
  title?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  max?: number | string;
  min?: number | string;
  autoComplete?: string;
  inputPattern?: RegExp;
  name?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  multiline?: boolean;
  rows?: number;
  InputProps?: React.ComponentProps<typeof TextField>['InputProps'];
}
