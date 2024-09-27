import { CommonApiService } from "../CommonApiService";
import { store } from "../../store/store";

// Generic DTO interface with common properties
export interface BaseDto {
  // id: number;
  // rActiveYN: string;
  [key: string]: any; // Allow for additional properties
}

// Generic service class
export class GenericEntityService<T extends BaseDto> {
  protected apiService: CommonApiService;
  protected baseEndpoint: string;

  constructor(apiService: CommonApiService, entityName: string) {
    this.apiService = apiService;
    this.baseEndpoint = `${entityName}`;
  }

  protected getToken(): string {
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

  async find(predicate: string): Promise<T[]> {
    return this.apiService.get<T[]>(
      `${this.baseEndpoint}/Find?predicate=${encodeURIComponent(predicate)}`,
      this.getToken()
    );
  }

  async getPaged(
    pageIndex: number,
    pageSize: number,
    filter?: string
  ): Promise<{
    items: T[];
    pageIndex: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }> {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });
    if (filter) {
      params.append("filter", filter);
    }
    return this.apiService.get<{
      items: T[];
      pageIndex: number;
      totalPages: number;
      totalCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    }>(`${this.baseEndpoint}/GetPaged?${params.toString()}`, this.getToken());
  }

  async firstOrDefault(predicate: string): Promise<T | null> {
    return this.apiService.get<T | null>(
      `${this.baseEndpoint}/FirstOrDefault?predicate=${encodeURIComponent(predicate)}`,
      this.getToken()
    );
  }

  async count(predicate?: string): Promise<number> {
    const params = predicate
      ? `?predicate=${encodeURIComponent(predicate)}`
      : "";
    return this.apiService.get<number>(
      `${this.baseEndpoint}/Count${params}`,
      this.getToken()
    );
  }

  async any(predicate: string): Promise<boolean> {
    return this.apiService.get<boolean>(
      `${this.baseEndpoint}/Any?predicate=${encodeURIComponent(predicate)}`,
      this.getToken()
    );
  }

  async getAllWithIncludes(includeProperties: string[]): Promise<T> {
    const params = new URLSearchParams();
    includeProperties.forEach((prop) =>
      params.append("includeProperties", prop)
    );
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetAllWithIncludes?${params.toString()}`,
      this.getToken()
    );
  }

  async bulkSave(entities: T[]): Promise<boolean> {
    return this.apiService.post<boolean>(
      `${this.baseEndpoint}/BulkSave`,
      entities,
      this.getToken()
    );
  }

  async bulkUpdate(entities: T[]): Promise<boolean> {
    return this.apiService.put<boolean>(
      `${this.baseEndpoint}/BulkUpdate`,
      entities,
      this.getToken()
    );
  }
}
