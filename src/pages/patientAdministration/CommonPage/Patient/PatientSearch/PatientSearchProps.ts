// src/pages/patientAdministration/commonPage/patient/PatientSeachProps.ts
import { PatientOption, PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";

export interface PatientSearchProps {
  /**
   * Callback function called when a patient is selected
   */
  onPatientSelect: (patient: PatientSearchResult | null) => void;

  /**
   * External trigger to clear the search (increment to trigger)
   */
  clearTrigger?: number;

  /**
   * Minimum length of search term before search is performed
   * @default 2
   */
  minSearchLength?: number;

  /**
   * Custom label for the search field
   * @default "Search Patient"
   */
  label?: string;

  /**
   * Custom placeholder text
   * @default "Enter name, chart code or phone number"
   */
  placeholder?: string;

  /**
   * Whether the component should be disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Initial patient selection (optional)
   */
  initialSelection?: PatientOption | null;

  /**
   * Additional CSS class names
   */
  className?: string;
}
