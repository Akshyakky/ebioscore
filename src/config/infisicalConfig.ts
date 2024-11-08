// // src/config/infisicalConfig.ts

// import { InfisicalClient } from "@infisical/sdk";

// // Type definitions for environment variables
// export interface APIConfigType {
//   moduleURL: string;
//   dashBoardURL: string;
//   authURL: string;
//   patientAdministrationURL: string;
//   billingURL: string;
//   commonURL: string;
//   routineReportURL: string;
//   securityManagementURL: string;
//   hospitalAdministrationURL: string;
//   frontOfficeURL: string;
//   inventoryManagementURL: string;
//   clinicalManagementURL: string;
// }

// class InfisicalConfig {
//   private static instance: InfisicalConfig;
//   private client: InfisicalClient;
//   private cachedConfig: APIConfigType | null = null;
//   private lastFetchTime: number = 0;
//   private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

//   private constructor() {
//     this.client = new InfisicalClient({
//       token: process.env.INFISICAL_TOKEN!,
//     });
//   }

//   public static getInstance(): InfisicalConfig {
//     if (!InfisicalConfig.instance) {
//       InfisicalConfig.instance = new InfisicalConfig();
//     }
//     return InfisicalConfig.instance;
//   }

//   private async fetchAndCacheConfig(): Promise<APIConfigType> {
//     try {
//       const environment = import.meta.env.MODE; // 'development' or 'production'
//       const secrets = await this.client.getAllSecrets({
//         environment,
//         workspacePath: "/",
//       });

//       const config: APIConfigType = {
//         moduleURL: this.getSecretValue(secrets, "VITE_MODULE_URL"),
//         dashBoardURL: this.getSecretValue(secrets, "VITE_DASHBOARD_URL"),
//         authURL: this.getSecretValue(secrets, "VITE_AUTH_URL"),
//         patientAdministrationURL: this.getSecretValue(secrets, "VITE_PATIENT_ADMINISTRATION_URL"),
//         billingURL: this.getSecretValue(secrets, "VITE_BILLING_URL"),
//         commonURL: this.getSecretValue(secrets, "VITE_COMMONURL"),
//         routineReportURL: this.getSecretValue(secrets, "VITE_ROUTINEREPORTURL"),
//         securityManagementURL: this.getSecretValue(secrets, "VITE_SECURITY_MANAGEMENT_URL"),
//         hospitalAdministrationURL: this.getSecretValue(secrets, "VITE_HOSPITAL_ADMINISTRATION_URL"),
//         frontOfficeURL: this.getSecretValue(secrets, "VITE_FRONT_OFFICE_URL"),
//         inventoryManagementURL: this.getSecretValue(secrets, "VITE_INVENTORY_MANAGEMENT_URL"),
//         clinicalManagementURL: this.getSecretValue(secrets, "VITE_CLINICAL_MANAGEMENT_URL"),
//       };

//       this.cachedConfig = config;
//       this.lastFetchTime = Date.now();
//       return config;
//     } catch (error) {
//       console.error("Failed to fetch secrets from Infisical:", error);
//       throw new Error("Failed to load configuration from Infisical");
//     }
//   }

//   private getSecretValue(secrets: any[], key: string): string {
//     const secret = secrets.find((s) => s.secretName === key);
//     if (!secret?.secretValue) {
//       throw new Error(`Required configuration key ${key} not found in Infisical`);
//     }
//     return secret.secretValue;
//   }

//   public async getConfig(): Promise<APIConfigType> {
//     // Return cached config if it's still valid
//     if (this.cachedConfig && Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
//       return this.cachedConfig;
//     }

//     return this.fetchAndCacheConfig();
//   }

//   public async refreshConfig(): Promise<void> {
//     await this.fetchAndCacheConfig();
//   }
// }

// export const infisicalConfig = InfisicalConfig.getInstance();
