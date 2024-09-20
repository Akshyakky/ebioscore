import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { ProductListDto } from "../../../interfaces/InventoryManagement/ProductListDto";
import { store } from "../../../store/store";
import { CommonApiService } from "../../CommonApiService";

const apiService = new CommonApiService({
  baseURL: APIConfig.inventoryManagementURL,
});
const getToken = () => store.getState().userDetails.token!;
export const saveProductList = async (
  productListDto: ProductListDto
): Promise<OperationResult<ProductListDto>> => {
  debugger;
  return apiService.post<OperationResult<ProductListDto>>(
    "ProductList/SaveProductList",
    productListDto,
    getToken()
  );
};

export const getAllProductList = async (): Promise<
  OperationResult<ProductListDto[]>
> => {
  return apiService.get<OperationResult<ProductListDto[]>>(
    "ProductList/GetAllProductList",
    getToken()
  );
};

export const getProductListById = async (
  productID: number
): Promise<OperationResult<ProductListDto>> => {
  return apiService.get<OperationResult<ProductListDto>>(
    `ProductList/GetProductListById/${productID}`,
    getToken()
  );
};

export const updateProductListActiveStatus = async (
  productID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(
    `ProductList/UpdateProductListActiveStatus/${productID}`,
    rActive,
    getToken()
  );
};

export const ProductListService = {
  saveProductList,
  getAllProductList,
  getProductListById,
  updateProductListActiveStatus,
};
