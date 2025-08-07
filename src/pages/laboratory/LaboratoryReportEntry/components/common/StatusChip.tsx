import { Chip, ChipProps } from "@mui/material";
import React from "react";
import { getStatusColor, getStatusIcon } from "../../utils/statusUtils";

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: string;
  showIcon?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, showIcon = true, size = "small", ...props }) => {
  return <Chip size={size} icon={showIcon ? getStatusIcon(status) : undefined} label={status} color={getStatusColor(status)} {...props} />;
};
