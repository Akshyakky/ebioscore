import { CommonApiService } from "../CommonApiService";
import { store } from "../../store/store";
import { APIConfig } from "../../apiConfig";
import { ProductSubGroupDto } from "../../interfaces/InventoryManagement/ProductSubGroupDto";
import { ProductGroupDto } from "../../interfaces/InventoryManagement/ProductGroupDto";

// Generic DTO interface with common properties
export interface BaseDto {
  id: number;
  rActiveYN: string;
  [key: string]: any; // Allow for additional properties
}

// Generic service class
class GenericEntityService<T extends BaseDto> {
  private apiService: CommonApiService;
  private baseEndpoint: string;

  constructor(apiService: CommonApiService, entityName: string) {
    this.apiService = apiService;
    this.baseEndpoint = `/${entityName}`;
  }

  private getToken(): string {
    return store.getState().userDetails.token!;
  }

  async getAll(): Promise<T[]> {
    return this.apiService.get<T[]>(
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

  async getNextCode(): Promise<string> {
    return this.apiService.get<string>(
      `${this.baseEndpoint}/GetNextCode`,
      this.getToken()
    );
  }

  // Add any additional common methods here
}

// Factory function to create entity-specific services
function createEntityService<T extends BaseDto>(
  entityName: string
): GenericEntityService<T> {
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: APIConfig.commonURL,
    }),
    entityName
  );
}

export const productSubGroupService =
  createEntityService<ProductSubGroupDto>("ProductSubGroup");

export const productGroupService =
  createEntityService<ProductGroupDto>("ProductGroup");

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
