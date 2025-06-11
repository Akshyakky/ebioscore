// src/components/Button/SmartButton.tsx
import { SvgIconComponent } from "@mui/icons-material";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import React, { useState } from "react";
import CustomButton, { CustomButtonProps } from "./CustomButton";

interface SmartButtonProps extends Omit<CustomButtonProps, "icon"> {
  icon?: SvgIconComponent;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  tooltip?: string;
  confirmBeforeAction?: boolean;
  confirmationMessage?: string;
  onConfirm?: () => void;
  asynchronous?: boolean;
  onAsyncClick?: () => Promise<any>;
  showLoadingIndicator?: boolean;
  showSuccessState?: boolean;
  successDuration?: number;
  showErrorState?: boolean;
  errorDuration?: number;
}

const SmartButton: React.FC<SmartButtonProps> = ({
  text,
  icon: Icon,
  loadingText = "Processing...",
  successText = "Success!",
  errorText = "Failed",
  tooltip,
  confirmBeforeAction = false,
  confirmationMessage = "Are you sure?",
  onConfirm,
  asynchronous = false,
  onAsyncClick,
  onClick,
  showLoadingIndicator = true,
  showSuccessState = true,
  successDuration = 2000,
  showErrorState = true,
  errorDuration = 2000,
  disabled = false,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (confirmBeforeAction) {
      const isConfirmed = window.confirm(confirmationMessage);
      if (!isConfirmed) return;
      if (onConfirm) {
        onConfirm();
        return;
      }
    }

    if (asynchronous && onAsyncClick) {
      try {
        setIsLoading(true);
        setState("loading");
        await onAsyncClick();

        if (showSuccessState) {
          setState("success");
          setTimeout(() => {
            setState("idle");
            setIsLoading(false);
          }, successDuration);
        } else {
          setState("idle");
          setIsLoading(false);
        }
      } catch (error) {
        if (showErrorState) {
          setState("error");
          setTimeout(() => {
            setState("idle");
            setIsLoading(false);
          }, errorDuration);
        } else {
          setState("idle");
          setIsLoading(false);
        }
      }
    } else if (onClick) {
      onClick(event);
    }
  };

  // Determine current button text based on state
  const getCurrentText = () => {
    switch (state) {
      case "loading":
        return loadingText;
      case "success":
        return successText;
      case "error":
        return errorText;
      default:
        return text;
    }
  };

  // Determine current button color based on state
  const getCurrentColor = () => {
    if (state === "success") return "success" as const;
    if (state === "error") return "error" as const;
    return rest.color || "primary";
  };

  const buttonContent = (
    <>
      {state === "loading" && showLoadingIndicator ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          {getCurrentText()}
        </Box>
      ) : (
        getCurrentText()
      )}
    </>
  );

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>
        <CustomButton text="" icon={state === "idle" ? Icon : undefined} onClick={handleClick} disabled={disabled || isLoading} color={getCurrentColor()} {...rest}>
          {buttonContent}
        </CustomButton>
      </span>
    </Tooltip>
  ) : (
    <CustomButton text="" icon={state === "idle" ? Icon : undefined} onClick={handleClick} disabled={disabled || isLoading} color={getCurrentColor()} {...rest}>
      {buttonContent}
    </CustomButton>
  );
};

export default SmartButton;
