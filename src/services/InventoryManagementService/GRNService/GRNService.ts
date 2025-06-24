// src/services/InventoryManagement/grnService.ts - Enhanced Version

import { APIConfig } from "@/apiConfig";
import {
  GRNDepartmentTransfer,
  GRNDetailDto,
  GRNDto,
  GRNExcelUploadResult,
  GRNHistoryDto,
  GRNMastDto,
  GRNQualityCheck,
  GRNSearchRequest,
  GRNWithAllDetailsDto,
} from "@/interfaces/InventoryManagement/GRNDto";
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

  async getBySupplier(supplierId: number): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetBySupplier/${supplierId}`, this.getToken());
  }

  async getByDateRange(startDate: string, endDate: string): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetByDateRange?startDate=${startDate}&endDate=${endDate}`, this.getToken());
  }

  async getExpiringItems(days: number): Promise<OperationResult<GRNDetailDto[]>> {
    return this.apiService.get<OperationResult<GRNDetailDto[]>>(`${this.baseEndpoint}/GetExpiringItems/${days}`, this.getToken());
  }

  async updateQualityStatus(grnDetId: number, status: string, remarks: string): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateQualityStatus/${grnDetId}`, { status, remarks }, this.getToken());
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

  async getByDateRange(startDate: string, endDate: string): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetByDateRange?startDate=${startDate}&endDate=${endDate}`, this.getToken());
  }

  async approveGrn(grnId: number): Promise<OperationResult<GRNMastDto>> {
    return this.apiService.put<OperationResult<GRNMastDto>>(`${this.baseEndpoint}/Approve/${grnId}`, {}, this.getToken());
  }

  async updateProductStock(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateProductStock/${grnId}`, {}, this.getToken());
  }

  async getApprovedGrns(dateFrom?: string, dateTo?: string): Promise<OperationResult<GRNMastDto[]>> {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetApproved?${params.toString()}`, this.getToken());
  }

  async getPendingApprovalGrns(): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetPendingApproval`, this.getToken());
  }

  async getOverdueGrns(days: number): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetOverdue/${days}`, this.getToken());
  }

  async bulkApprove(grnIds: number[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkApprove`, { grnIds }, this.getToken());
  }

  async hideGrn(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/Hide/${grnId}`, {}, this.getToken());
  }

  async unhideGrn(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/Unhide/${grnId}`, {}, this.getToken());
  }
}

class ExtendedGRNService extends GenericEntityService<GRNDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.inventoryManagementURL }), "Grn");
  }

  // Basic GRN Operations
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

  async downloadExcelTemplate(): Promise<OperationResult<Blob>> {
    return this.apiService.get<OperationResult<Blob>>(`${this.baseEndpoint}/DownloadExcelTemplate`, this.getToken(), {
      responseType: "blob",
    });
  }

  async exportGrnToExcel(grnId: number): Promise<OperationResult<Blob>> {
    return this.apiService.get<OperationResult<Blob>>(`${this.baseEndpoint}/ExportToExcel/${grnId}`, this.getToken(), {
      responseType: "blob",
    });
  }

  async exportMultipleGrnsToExcel(grnIds: number[]): Promise<OperationResult<Blob>> {
    return this.apiService.post<OperationResult<Blob>>(`${this.baseEndpoint}/ExportMultipleToExcel`, { grnIds }, this.getToken(), {
      responseType: "blob",
    });
  }

  // History Operations
  async getGrnHistory(grnId: number): Promise<OperationResult<GRNHistoryDto[]>> {
    return this.apiService.get<OperationResult<GRNHistoryDto[]>>(`${this.baseEndpoint}/GetHistory/${grnId}`, this.getToken());
  }

  async addGrnHistoryEntry(historyEntry: Omit<GRNHistoryDto, "historyID">): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/AddHistoryEntry`, historyEntry, this.getToken());
  }

  // Department Transfer Operations
  async transferGrnToDepartment(transferData: GRNDepartmentTransfer): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/TransferToDepartment`, transferData, this.getToken());
  }

  async getIssueDepartments(grnId: number): Promise<OperationResult<any[]>> {
    return this.apiService.get<OperationResult<any[]>>(`${this.baseEndpoint}/GetIssueDepartments/${grnId}`, this.getToken());
  }

  async createNewIssueDepartment(grnId: number, departmentId: number, issueItems: number[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(
      `${this.baseEndpoint}/CreateNewIssueDepartment`,
      {
        grnId,
        departmentId,
        issueItems,
      },
      this.getToken()
    );
  }

  // Quality Check Operations
  async performQualityCheck(qualityCheck: GRNQualityCheck): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/PerformQualityCheck`, qualityCheck, this.getToken());
  }

  async getQualityCheckHistory(grnId: number): Promise<OperationResult<GRNQualityCheck[]>> {
    return this.apiService.get<OperationResult<GRNQualityCheck[]>>(`${this.baseEndpoint}/GetQualityCheckHistory/${grnId}`, this.getToken());
  }

  // Bulk Operations
  async bulkDelete(grnIds: number[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkDelete`, { grnIds }, this.getToken());
  }

  async bulkApprove(grnIds: number[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkApprove`, { grnIds }, this.getToken());
  }

  async bulkHide(grnIds: number[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkHide`, { grnIds }, this.getToken());
  }

  async bulkUpdateStatus(grnIds: number[], status: string): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/BulkUpdateStatus`, { grnIds, status }, this.getToken());
  }

  // Validation Operations
  async validateGrn(grnData: GRNWithAllDetailsDto): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/Validate`, grnData, this.getToken());
  }

  async validateDuplicateInvoice(invoiceNo: string, supplierId: number, excludeGrnId?: number): Promise<OperationResult<boolean>> {
    const params = new URLSearchParams();
    params.append("invoiceNo", invoiceNo);
    params.append("supplierId", supplierId.toString());
    if (excludeGrnId) params.append("excludeGrnId", excludeGrnId.toString());

    return this.apiService.get<OperationResult<boolean>>(`${this.baseEndpoint}/ValidateDuplicateInvoice?${params.toString()}`, this.getToken());
  }

  // Reporting Operations
  async getGrnSummaryReport(dateFrom: string, dateTo: string, departmentId?: number): Promise<OperationResult<any>> {
    const params = new URLSearchParams();
    params.append("dateFrom", dateFrom);
    params.append("dateTo", dateTo);
    if (departmentId) params.append("departmentId", departmentId.toString());

    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetSummaryReport?${params.toString()}`, this.getToken());
  }

  async getSupplierWiseReport(dateFrom: string, dateTo: string): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetSupplierWiseReport?dateFrom=${dateFrom}&dateTo=${dateTo}`, this.getToken());
  }

  async getDepartmentWiseReport(dateFrom: string, dateTo: string): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetDepartmentWiseReport?dateFrom=${dateFrom}&dateTo=${dateTo}`, this.getToken());
  }

  async getProductWiseReport(dateFrom: string, dateTo: string, productId?: number): Promise<OperationResult<any>> {
    const params = new URLSearchParams();
    params.append("dateFrom", dateFrom);
    params.append("dateTo", dateTo);
    if (productId) params.append("productId", productId.toString());

    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetProductWiseReport?${params.toString()}`, this.getToken());
  }

  // Dashboard Operations
  async getDashboardData(dateFrom: string, dateTo: string): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetDashboardData?dateFrom=${dateFrom}&dateTo=${dateTo}`, this.getToken());
  }

  async getRecentActivity(limit: number = 10): Promise<OperationResult<any[]>> {
    return this.apiService.get<OperationResult<any[]>>(`${this.baseEndpoint}/GetRecentActivity?limit=${limit}`, this.getToken());
  }

  // Utility Operations
  async getNextSequenceNumber(departmentId: number): Promise<OperationResult<number>> {
    return this.apiService.get<OperationResult<number>>(`${this.baseEndpoint}/GetNextSequenceNumber/${departmentId}`, this.getToken());
  }

  async recalculateGrnTotals(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/RecalculateTotals/${grnId}`, {}, this.getToken());
  }

  async syncWithPO(grnId: number, poId: number): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/SyncWithPO`, { grnId, poId }, this.getToken());
  }

  // Advanced Search Operations
  async advancedSearch(criteria: any): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.post<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/AdvancedSearch`, criteria, this.getToken());
  }

  async getRelatedGrns(grnId: number): Promise<OperationResult<GRNMastDto[]>> {
    return this.apiService.get<OperationResult<GRNMastDto[]>>(`${this.baseEndpoint}/GetRelatedGrns/${grnId}`, this.getToken());
  }

  // Inventory Integration
  async updateInventoryFromGrn(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateInventory/${grnId}`, {}, this.getToken());
  }

  async reverseInventoryUpdate(grnId: number): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(`${this.baseEndpoint}/ReverseInventoryUpdate/${grnId}`, {}, this.getToken());
  }

  // Notification Operations
  async sendGrnNotification(grnId: number, notificationType: string, recipients: string[]): Promise<OperationResult<boolean>> {
    return this.apiService.post<OperationResult<boolean>>(
      `${this.baseEndpoint}/SendNotification`,
      {
        grnId,
        notificationType,
        recipients,
      },
      this.getToken()
    );
  }

  async getNotificationSettings(departmentId: number): Promise<OperationResult<any>> {
    return this.apiService.get<OperationResult<any>>(`${this.baseEndpoint}/GetNotificationSettings/${departmentId}`, this.getToken());
  }

  async updateNotificationSettings(departmentId: number, settings: any): Promise<OperationResult<boolean>> {
    return this.apiService.put<OperationResult<boolean>>(`${this.baseEndpoint}/UpdateNotificationSettings/${departmentId}`, settings, this.getToken());
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
export type { GRNDepartmentTransfer, GRNDetailDto, GRNDto, GRNExcelUploadResult, GRNHistoryDto, GRNMastDto, GRNQualityCheck, GRNSearchRequest, GRNWithAllDetailsDto };
