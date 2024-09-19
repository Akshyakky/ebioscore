import { CommonApiService } from "../CommonApiService";
import { store } from "../../store/store";
import { ProductSubGroupDto } from "../../interfaces/InventoryManagement/ProductSubGroupDto";
import { ProductGroupDto } from "../../interfaces/InventoryManagement/ProductGroupDto";
import { ProductTaxListDto } from "../../interfaces/InventoryManagement/ProductTaxListDto";

// Generic DTO interface with common properties
export interface BaseDto {
  // id: number;
  // rActiveYN: string;
  [key: string]: any; // Allow for additional properties
}

interface ApiConfig {
  [key: string]: string;
}

// Load environment variables
const apiConfig: ApiConfig = {
  AUTH_URL: import.meta.env.VITE_AUTH_URL,
  COMMON_URL: import.meta.env.VITE_COMMONURL,
  PATIENT_ADMINISTRATION_URL: import.meta.env.VITE_PATIENT_ADMINISTRATION_URL,
  HOSPITAL_ADMINISTRATION_URL: import.meta.env.VITE_HOSPITAL_ADMINISTRATION_URL,
  FRONT_OFFICE_URL: import.meta.env.VITE_FRONT_OFFICE_URL,
  SECURITY_MANAGEMENT_URL: import.meta.env.VITE_SECURITY_MANAGEMENT_URL,
  BILLING_URL: import.meta.env.VITE_BILLING_URL,
  ROUTINE_REPORT_URL: import.meta.env.VITE_ROUTINEREPORTURL,
  INVENTORY_MANAGEMENT_URL: import.meta.env.VITE_INVENTORY_MANAGEMENT_URL,
};

// Generic service class
class GenericEntityService<T extends BaseDto> {
  private apiService: CommonApiService;
  private baseEndpoint: string;

  constructor(apiService: CommonApiService, entityName: string) {
    this.apiService = apiService;
    this.baseEndpoint = `${entityName}`;
  }

  private getToken(): string {
    return store.getState().userDetails.token!;
  }

  async getAll(): Promise<T> {
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetAll`,
      this.getToken()
    );
  }

  async getById(id: number): Promise<T> {
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetById/${id}`,
      this.getToken()
    );
  }

  async save(entity: T): Promise<T> {
    return this.apiService.post<T>(
      `${this.baseEndpoint}/Save`,
      entity,
      this.getToken()
    );
  }

  async updateActiveStatus(id: number, active: boolean): Promise<boolean> {
    return this.apiService.put<boolean>(
      `${this.baseEndpoint}/UpdateActiveStatus/${id}`,
      active,
      this.getToken()
    );
  }

  async getNextCode(
    prefix: string,
    codeProperty: string,
    padLength: number = 5
  ): Promise<T> {
    const params = new URLSearchParams({
      prefix,
      codeProperty,
      padLength: padLength.toString(),
    });
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetNextCode?${params.toString()}`,
      this.getToken()
    );
  }

  // Add any additional common methods here
}

// Factory function to create entity-specific services
function createEntityService<T extends BaseDto>(
  entityName: string,
  apiKey: keyof typeof apiConfig
): GenericEntityService<T> {
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: apiConfig[apiKey],
    }),
    entityName
  );
}

export const productSubGroupService = createEntityService<ProductSubGroupDto>(
  "ProductSubGroup",
  "INVENTORY_MANAGEMENT_URL"
);
export const productGroupService = createEntityService<ProductGroupDto>(
  "ProductGroup",
  "INVENTORY_MANAGEMENT_URL"
);
export const productTaxService = createEntityService<ProductTaxListDto>(
  "ProductTaxList",
  "INVENTORY_MANAGEMENT_URL"
);

// Example of how to extend the generic service for entity-specific methods if needed
// class ExtendedProductSubGroupService extends GenericEntityService<ProductSubGroupDto> {
//   async getByCompanyId(companyId: number): Promise<ProductSubGroupDto[]> {
//     return this.apiService.get<ProductSubGroupDto[]>(
//       `${this.baseEndpoint}/GetByCompanyId/${companyId}`,
//       this.getToken()
//     );
//   }
// }

// export const extendedProductSubGroupService =
//   new ExtendedProductSubGroupService(
//     new CommonApiService({
//       baseURL: APIConfig.commonURL,
//     }),
//     "ProductSubGroup"
//   );
