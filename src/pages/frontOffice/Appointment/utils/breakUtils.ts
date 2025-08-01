// src/pages/frontOffice/Appointment/utils/breakUtils.ts;
import { BreakDto } from "@/interfaces/FrontOffice/BreakListDto";

export interface BreakLayout {
  breakItem: BreakDto;
  column: number;
  totalColumns: number;
}

export const calculateBreakLayout = (date: Date, breaks: BreakDto[]): BreakLayout[] => {
  const dayBreaks = breaks.filter((breakItem) => {
    const breakStartDate = new Date(breakItem.bLStartDate);
    const breakEndDate = new Date(breakItem.bLEndDate);

    return date >= breakStartDate && date <= breakEndDate;
  });

  const sortedBreaks = [...dayBreaks].sort((a, b) => new Date(a.bLStartTime).getTime() - new Date(b.bLStartTime).getTime());

  const layout: BreakLayout[] = [];
  const columns: Array<{ endTime: Date; breaks: BreakDto[] }> = [];

  sortedBreaks.forEach((breakItem) => {
    const startTime = new Date(breakItem.bLStartTime);
    const endTime = new Date(breakItem.bLEndTime);

    let columnIndex = columns.findIndex((col) => col.endTime <= startTime);

    if (columnIndex === -1) {
      columnIndex = columns.length;
      columns.push({ endTime, breaks: [breakItem] });
    } else {
      columns[columnIndex].endTime = endTime;
      columns[columnIndex].breaks.push(breakItem);
    }

    layout.push({
      breakItem,
      column: columnIndex,
      totalColumns: Math.max(
        columns.length,
        layout.reduce((max, item) => Math.max(max, item.totalColumns), 1)
      ),
    });
  });

  // Update total columns for all items
  layout.forEach((item) => {
    item.totalColumns = columns.length;
  });

  return layout;
};
