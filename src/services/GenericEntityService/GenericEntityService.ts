import { store } from "@/store";
import { CommonApiService } from "../CommonApiService";

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errorMessage?: string;
  affectedRows?: number;
  concurrencyConflict?: boolean;
  databaseValues?: any;
  currentValues?: any;
  additionalData?: Record<string, any>;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BaseDto {
  [key: string]: any;
}

export class GenericEntityService<T extends BaseDto> {
  protected readonly apiService: CommonApiService;
  protected readonly baseEndpoint: string;

  constructor(apiService: CommonApiService, entityName: string) {
    this.apiService = apiService;
    this.baseEndpoint = entityName;
  }

  protected getToken(): string {
    const state = store.getState() as { auth?: { token?: string } };
    return state.auth?.token ?? "";
  }

  /**
   * Retrieves all active entities
   */
  async getAll(): Promise<OperationResult<T[]>> {
    return this.apiService.get<OperationResult<T[]>>(`${this.baseEndpoint}/GetAll`, this.getToken());
  }

  /**
   * Retrieves an entity by its ID
   */
  async getById(id: number): Promise<OperationResult<T>> {
    return this.apiService.get<OperationResult<T>>(`${this.baseEndpoint}/GetById/${id}`, this.getToken());
  }

  /**
   * Retrieves an entity by its ID with related entities
   */
  async getByIdWithIncludes(id: number, includeProperties: string[]): Promise<OperationResult<T>> {
    const params = new URLSearchParams(includeProperties.map((prop) => ["includeProperties", prop]));
    return this.apiService.get<OperationResult<T>>(`${this.baseEndpoint}/GetByIdWithIncludes/${id}?${params.toString()}`, this.getToken());
  }

  /**
   * Creates or updates an entity
   */
  async save(entity: T): Promise<OperationResult<T>> {
    return this.apiService.post<OperationResult<T>>(`${this.baseEndpoint}/Save`, entity, this.getToken());
  }

  /**
   * Updates the active status of an entity
   */
  async updateActiveStatus(id: number, active: boolean): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateActiveStatus/${id}`, active, this.getToken());
  }

  /**
   * Deletes an entity by ID (soft or hard delete)
   */
  async delete(id: number, softDelete: boolean = true): Promise<OperationResult<boolean>> {
    return this.apiService.delete<OperationResult<boolean>>(`${this.baseEndpoint}/Delete/${id}?softDelete=${softDelete}`, this.getToken());
  }

  /**
   * Generates the next code with the specified prefix and padding
   */
  async getNextCode(prefix: string, padLength: number = 5): Promise<OperationResult<string>> {
    const params = new URLSearchParams({ prefix, padLength: padLength.toString() });
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GetNextCode?${params.toString()}`, this.getToken());
  }

  /**
   * Finds entities matching the specified predicate
   */
  async find(predicate: string): Promise<OperationResult<T[]>> {
    return this.apiService.get<OperationResult<T[]>>(`${this.baseEndpoint}/Find?predicate=${encodeURIComponent(predicate)}`, this.getToken());
  }

  /**
   * Retrieves a paginated list of entities with optional filtering and sorting
   */
  async getPaged(pageIndex: number, pageSize: number, filter?: string, sortBy?: string, ascending: boolean = true): Promise<OperationResult<PaginatedList<T>>> {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      ...(filter && { filter }),
      ...(sortBy && { sortBy }),
      ...(sortBy && { ascending: ascending.toString() }),
    });

    return this.apiService.get<OperationResult<PaginatedList<T>>>(`${this.baseEndpoint}/GetPaged?${params.toString()}`, this.getToken());
  }

  /**
   * Retrieves the first entity matching the specified predicate
   */
  async firstOrDefault(predicate: string): Promise<OperationResult<T>> {
    return this.apiService.get<OperationResult<T>>(`${this.baseEndpoint}/FirstOrDefault?predicate=${encodeURIComponent(predicate)}`, this.getToken());
  }

  /**
   * Retrieves the latest entity matching the specified predicate
   */
  async getLatest(predicate: string): Promise<OperationResult<T>> {
    return this.apiService.get<OperationResult<T>>(`${this.baseEndpoint}/GetLatest?predicate=${encodeURIComponent(predicate)}`, this.getToken());
  }

  /**
   * Counts entities matching the specified predicate
   */
  async count(predicate?: string): Promise<OperationResult<number>> {
    const params = predicate ? `?predicate=${encodeURIComponent(predicate)}` : "";
    return this.apiService.get<OperationResult<number>>(`${this.baseEndpoint}/Count${params}`, this.getToken());
  }

  /**
   * Checks if any entity matches the specified predicate
   */
  async any(predicate: string): Promise<OperationResult<boolean>> {
    return this.apiService.get<OperationResult<boolean>>(`${this.baseEndpoint}/Any?predicate=${encodeURIComponent(predicate)}`, this.getToken());
  }

  /**
   * Retrieves all entities with included related entities
   */
  async getAllWithIncludes(includeProperties: string[]): Promise<OperationResult<T[]>> {
    const params = new URLSearchParams(includeProperties.map((prop) => ["includeProperties", prop]));
    return this.apiService.get<OperationResult<T[]>>(`${this.baseEndpoint}/GetAllWithIncludes?${params.toString()}`, this.getToken());
  }

  /**
   * Validates a DTO without saving it
   */
  async validate(entity: T): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/Validate`, entity, this.getToken());
  }

  /**
   * Bulk saves a collection of entities
   */
  async bulkSave(entities: T[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkSave`, entities, this.getToken());
  }

  /**
   * Bulk updates a collection of entities
   */
  async bulkUpdate(entities: T[]): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/BulkUpdate`, entities, this.getToken());
  }

  /**
   * Bulk deletes a collection of entities by their IDs
   */
  async bulkDelete(ids: number[], softDelete: boolean = true): Promise<OperationResult<boolean>> {
    return this.apiService.delete<OperationResult<boolean>>(`${this.baseEndpoint}/BulkDelete?softDelete=${softDelete}`, this.getToken(), ids);
  }
}
