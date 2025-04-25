// src/pages/patientAdministration/commonPage/patient/PatientDemographics/PatientDemographicsProps.ts

import { PatientDemographicsData } from "@/interfaces/PatientAdministration/Patient/PatientDemographics.interface";

export interface PatientDemographicsProps {
  /**
   * Patient chart ID - if provided, data will be fetched automatically
   */
  pChartID?: number | null;

  /**
   * Patient demographics data - if provided, will override fetched data
   */
  demographicsData?: PatientDemographicsData | null;

  /**
   * Whether to show the edit button
   * @default true
   */
  showEditButton?: boolean;

  /**
   * Callback when edit button is clicked
   */
  onEditClick?: () => void;

  /**
   * Whether to show the refresh button
   * @default true
   */
  showRefreshButton?: boolean;

  /**
   * Callback when refresh button is clicked
   */
  onRefreshClick?: () => void;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether the component should be in a loading state
   */
  isLoading?: boolean;

  /**
   * Layout variant
   * @default "detailed"
   */
  variant?: "compact" | "detailed";

  /**
   * Message to display when no data is available
   * @default "No demographics information available for this patient."
   */
  emptyStateMessage?: string;
}
