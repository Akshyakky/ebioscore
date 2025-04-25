// src/pages/patientAdministration/commonPage/patient/Patient/PatientDemographicsForm/PatientDemographicsFormProps.ts

import { PatientDemographicsData } from "@/interfaces/PatientAdministration/Patient/PatientDemographics.interface";

export interface PatientDemographicsFormProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog is closed
   */
  onClose: () => void;

  /**
   * Patient chart ID - required for fetching data
   */
  pChartID: number;

  /**
   * Callback when data is saved successfully
   */
  onSaved?: (data: PatientDemographicsData) => void;

  /**
   * Initial form data (optional) - if provided, will override fetched data
   */
  initialData?: PatientDemographicsData;

  /**
   * Dialog title
   * @default "Edit Patient Demographics"
   */
  title?: string;

  /**
   * Custom loading state (optional) - for external control
   */
  isLoading?: boolean;

  /**
   * Whether to confirm before closing with unsaved changes
   * @default true
   */
  confirmUnsavedChanges?: boolean;

  /**
   * Fields to display in the form
   * @default All fields
   */
  displayFields?: Array<keyof PatientDemographicsData>;
}
