//utils/Common/dateUtils.ts
import { format } from "date-fns";

export function formatDate(isoString: string): string {
  return format(new Date(isoString), "dd/MM/yyyy");
}

export const formatDt = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
