// RoutineReports/RoutineReports.interface.ts

import { JSX } from "react";

// RoutineReports.interface.ts
export interface RoutineReports {
  repID: number;
  repName: string;
  // Define other properties of your reports here
}

// Column.interface.ts
export interface Column<T> {
  key: keyof T;
  header: string;
  visible: boolean;
  render?: (item: T) => JSX.Element | string;
}
