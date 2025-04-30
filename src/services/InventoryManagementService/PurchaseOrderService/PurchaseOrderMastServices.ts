import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";
import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
class PurchaseOrderMastServices extends GenericEntityService<PurchaseOrderMastDto> {
  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.inventoryManagementURL,
      }),
      "PurchaseOrderMast"
    );
  }
  async getPOCode(departmentName: string): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GeneratePurchaseOrderCode?departmentName=${departmentName}`, this.getToken());
  }
  async getPOProductDetails(productCode: string, deptId: number, barcode: boolean = false): Promise<OperationResult<PurchaseOrderDetailDto>> {
    return this.apiService.get<OperationResult<PurchaseOrderDetailDto>>(
      `${this.baseEndpoint}/GetPOProductDetails?productCode=${productCode}&deptId=${deptId}&barcode=${barcode}`,
      this.getToken()
    );
  }
  async savePurchaseOrder(purchaseOrderData: purchaseOrderSaveDto): Promise<OperationResult<any[]>> {
    return this.apiService.post<OperationResult<any[]>>(`${this.baseEndpoint}/SavePurchaseOrder`, purchaseOrderData, this.getToken());
  }
  async getPurchaseOrderDetailsByPOID(pOId: number): Promise<OperationResult<PurchaseOrderDetailDto[]>> {
    return this.apiService.get<OperationResult<PurchaseOrderDetailDto[]>>(`${this.baseEndpoint}/GetPurchaseOrderDetailsByPOID?pOID=${pOId}`, this.getToken());
  }
}

export const purchaseOrderMastServices = new PurchaseOrderMastServices();
