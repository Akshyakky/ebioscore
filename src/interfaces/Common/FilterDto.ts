export enum DateFilterType {
  Today = 0,
  Yesterday = 1,
  ThisWeek = 2,
  ThisMonth = 3,
  ThisYear = 4,
  DateRange = 5,
  All = 6,
}

export interface FilterDto {
  dateFilter: DateFilterType;
  startDate: Date | null;
  endDate: Date | null;
  statusFilter: string | null;
  pageIndex: number;
  pageSize: number;
}
