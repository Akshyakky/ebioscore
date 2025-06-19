import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
class PurchaseOrderMastServices extends GenericEntityService<PurchaseOrderMastDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "PurchaseOrder"
    );
  }
  async getPOCode(departmentId: number): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GeneratePurchaseOrderCode?departmentId=${departmentId}`, this.getToken());
  }
  async getPOProductDetails(productCode: string, _deptId: number, _barcode: boolean = false): Promise<OperationResult<PurchaseOrderDetailDto>> {
    return this.apiService.get<OperationResult<PurchaseOrderDetailDto>>(`${this.baseEndpoint}/GetPOProductDetailsByProductCode?productCode=${productCode}`, this.getToken());
  }
  async getPurchaseOrderDetailsByPOID(pOId: number): Promise<OperationResult<purchaseOrderSaveDto>> {
    return this.apiService.get<OperationResult<purchaseOrderSaveDto>>(`${this.baseEndpoint}/GetPurchaseOrderDetailsByPOID?pOID=${pOId}`, this.getToken());
  }
}

export const purchaseOrderMastServices = new PurchaseOrderMastServices();
