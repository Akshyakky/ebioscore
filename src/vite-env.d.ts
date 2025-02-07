/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODULE_URL: string;
  readonly VITE_DASHBOARD_URL: string;
  readonly VITE_AUTH_URL: string;
  readonly VITE_PATIENT_ADMINISTRATION_URL: string;
  readonly VITE_BILLING_URL: string;
  readonly VITE_COMMONURL: string;
  readonly VITE_ROUTINEREPORTURL: string;
  readonly VITE_SECURITY_MANAGEMENT_URL: string;
  readonly VITE_HOSPITAL_ADMINISTRATION_URL: string;
  readonly VITE_FRONT_OFFICE_URL: string;
  readonly VITE_INVENTORY_MANAGEMENT_URL: string;
  readonly VITE_LABORATORY_URL: string;
  // add more environment variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
