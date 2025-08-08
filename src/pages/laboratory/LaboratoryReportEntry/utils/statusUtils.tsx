import { AssignmentTurnedIn as AssignmentTurnedInIcon, CheckCircle as CheckCircleIcon, Science as SampleIcon, HourglassEmpty, Error as ErrorIcon } from "@mui/icons-material";
import { SAMPLE_STATUS } from "../constants";

type ColorType = "error" | "warning" | "info" | "success" | "default" | "primary" | "secondary";

export const getStatusColor = (status: string): ColorType => {
  const statusLower = status.toLowerCase();
  const colorMap: Record<string, ColorType> = {
    pending: "error",
    "partially collected": "warning",
    collected: "warning",
    "partially completed": "info",
    completed: "info",
    "partially approved": "success",
    approved: "success",
    rejected: "default",
  };
  return colorMap[statusLower] || "default";
};

export const getStatusIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "completed":
    case "partially completed":
      return <AssignmentTurnedInIcon />;
    case "approved":
    case "partially approved":
      return <CheckCircleIcon />;
    case "pending":
      return <HourglassEmpty />;
    case "rejected":
      return <ErrorIcon />;
    default:
      return <SampleIcon />;
  }
};

export const getShortStatusIcon = (status: string) => {
  switch (status) {
    case "P":
      return <HourglassEmpty />;
    case "C":
      return <CheckCircleIcon />;
    case "R":
      return <ErrorIcon />;
    default:
      return null;
  }
};

export const getShortStatusColor = (status: string): ColorType => {
  switch (status) {
    case "P":
      return "warning";
    case "C":
      return "success";
    case "R":
      return "error";
    default:
      return "default";
  }
};

export const canUpdateSampleStatus = (status: string): boolean => {
  return status === SAMPLE_STATUS.PENDING || status === SAMPLE_STATUS.COLLECTED;
};
