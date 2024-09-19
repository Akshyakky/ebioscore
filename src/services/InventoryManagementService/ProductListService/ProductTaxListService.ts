import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { ProductTaxListDto } from "../../../interfaces/InventoryManagement/ProductTaxListDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.inventoryManagementURL,
});

const getToken = () => store.getState().userDetails.token!;

export const saveProductTaxList = async (
  productTaxListDto: ProductTaxListDto
): Promise<OperationResult<ProductTaxListDto>> => {
  debugger;
  return apiService.post<OperationResult<ProductTaxListDto>>(
    "ProductTaxList/SaveProductTaxList",
    productTaxListDto,
    getToken()
  );
};

export const getAllProductTaxList = async (): Promise<
  OperationResult<ProductTaxListDto[]>
> => {
  return apiService.get<OperationResult<ProductTaxListDto[]>>(
    "ProductTaxList/GetAllProductTaxList",
    getToken()
  );
};

export const getProductTaxListById = async (
  pTaxID: number
): Promise<OperationResult<ProductTaxListDto>> => {
  return apiService.get<OperationResult<ProductTaxListDto>>(
    `ProductTaxList/GetProductTaxListById/${pTaxID}`,
    getToken()
  );
};

export const updateProductTaxListActiveStatus = async (
  pTaxID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `ProductTaxList/UpdateProductTaxListActiveStatus/${pTaxID}`,
    rActive,
    getToken()
  );
};

export const ProductTaxListService = {
  saveProductTaxList,
  getAllProductTaxList,
  getProductTaxListById,
  updateProductTaxListActiveStatus,
};
