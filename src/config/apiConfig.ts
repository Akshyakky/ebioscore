// // src/config/apiConfig.ts

// import { infisicalConfig, APIConfigType } from "./infisicalConfig";

// class APIConfig {
//   private static instance: APIConfig;
//   private config: APIConfigType | null = null;

//   private constructor() {}

//   public static getInstance(): APIConfig {
//     if (!APIConfig.instance) {
//       APIConfig.instance = new APIConfig();
//     }
//     return APIConfig.instance;
//   }

//   public async initialize(): Promise<void> {
//     this.config = await infisicalConfig.getConfig();
//   }

//   public getConfig(): APIConfigType {
//     if (!this.config) {
//       throw new Error("APIConfig not initialized. Call initialize() first");
//     }
//     return this.config;
//   }

//   public async refreshConfig(): Promise<void> {
//     this.config = await infisicalConfig.getConfig();
//   }
// }

// export const apiConfig = APIConfig.getInstance();

// // Initialize config when the application starts
// export const initializeConfig = async () => {
//   await apiConfig.initialize();
// };
