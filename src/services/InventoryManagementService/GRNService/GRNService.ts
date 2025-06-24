// src/services/InventoryManagement/grnService.ts

import { APIConfig } from "@/apiConfig";
import { GRNDetailDto, GRNDto, GRNMastDto, GRNSearchRequest, GRNWithAllDetailsDto } from "@/interfaces/InventoryManagement/GRNDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

// Create extended services with custom methods
class ExtendedGRNDetailService extends GenericEntityService<GRNDetailDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "GrnDetail");
  }

  async getByGrnId(grnId: number): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetByGrnId/${grnId}`, this.getToken());
  }

  async getByProductId(productId: number): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetByProductId/${productId}`, this.getToken());
  }

  async getByBatchNo(batchNo: string): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetByBatchNo/${encodeURIComponent(batchNo)}`, this.getToken());
  }
}

class ExtendedGRNMastService extends GenericEntityService<GRNMastDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "GrnMast");
  }

  async getBySupplier(supplierId: number): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetBySupplier/${supplierId}`, this.getToken());
  }

  async getByDepartment(departmentId: number): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetByDepartment/${departmentId}`, this.getToken());
  }

  async getByInvoiceNo(invoiceNo: string): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetByInvoiceNo/${encodeURIComponent(invoiceNo)}`, this.getToken());
  }

  async getByGrnCode(grnCode: string): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.get<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/GetByGrnCode/${encodeURIComponent(grnCode)}`, this.getToken());
  }

  async approveGrn(grnId: number): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.put<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/Approve/${grnId}`, {}, this.getToken());
  }

  async updateProductStock(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateProductStock/${grnId}`, {}, this.getToken());
  }
}

class ExtendedGRNService extends GenericEntityService<GRNDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "Grn");
  }

  async createGrnWithDetails(grnData: GRNWithAllDetailsDto): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.post<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/CreateWithDetails`, grnData, this.getToken());
  }

  async updateGrnWithDetails(grnData: GRNWithAllDetailsDto): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.put<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/UpdateWithDetails`, grnData, this.getToken());
  }

  async saveGrnWithAllDetails(dto: GRNWithAllDetailsDto): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.post<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/CreateWithDetails`, dto, this.getToken());
  }

  async getAllGrnsWithDetails(): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetAll`, this.getToken());
  }

  async getAllGrnsWithDetailsByID(id: number): Promise<OperationResult<GRNWithAllDetailsDto>> {
    return this.apiService.get<OperationResult<GRNWithAllDetailsDto>>(`${this.baseEndpoint}/GetGrnWithDetailsById/${id}`, this.getToken());
  }

  async generateGrnCode(deptId: number): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateGrnCode/${deptId}`, this.getToken());
  }

  async searchGrns(searchRequest: GRNSearchRequest): Promise<OperationResult<any>> {
    return this.apiService.post<OperationResult<any>>(`${this.baseEndpoint}/GrnSearch`, searchRequest, this.getToken());
  }

  async approveGrn(grnId: number): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.put<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/Approve/${grnId}`, {}, this.getToken());
  }

  async updateActiveStatus(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateActiveStatus/${grnId}`, {}, this.getToken());
  }

  async validateGrn(grnData: GRNWithAllDetailsDto): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/Validate`, grnData, this.getToken());
  }

  async getNextCode(): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GetNextCode`, this.getToken());
  }

  async getPaged(pageIndex: number, pageSize: number): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetPaged?pageIndex=${pageIndex}&pageSize=${pageSize}`, this.getToken());
  }

  async getCount(): Promise<OperationResult<number>> {
    return this.apiService.get<OperationResult<number>>(`${this.baseEndpoint}/Count`, this.getToken());
  }

  async getAny(): Promise<OperationResult<boolean>> {
    return this.apiService.get<OperationResult<boolean>>(`${this.baseEndpoint}/Any`, this.getToken());
  }
}

// Export basic services using factory pattern (for simple CRUD operations)
export const grnService = createEntityService<GRNDto>("Grn", "inventoryManagementURL");
export const grnMastService = createEntityService<GRNMastDto>("GrnMast", "inventoryManagementURL");
export const grnDetailService = createEntityService<GRNDetailDto>("GrnDetail", "inventoryManagementURL");

// Export extended services with custom methods (for complex operations)
export const bGrnService = new ExtendedGRNService();
export const bGrnMastService = new ExtendedGRNMastService();
export const bGrnDetailService = new ExtendedGRNDetailService();

// Export types for convenience
export type { GRNDetailDto, GRNDto, GRNMastDto, GRNSearchRequest, GRNWithAllDetailsDto };
