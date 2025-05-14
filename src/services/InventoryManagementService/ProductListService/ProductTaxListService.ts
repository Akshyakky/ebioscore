import { APIConfig } from "@/apiConfig";
import { CommonApiService } from "../../CommonApiService";
import { store } from "@/store";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";

const apiService = new CommonApiService({ baseURL: APIConfig.inventoryManagementURL });
const getToken = () => store.getState().auth.token!;

export const saveProductTaxList = async (data: ProductTaxListDto): Promise<OperationResult<ProductTaxListDto>> => {
  return apiService.post<OperationResult<ProductTaxListDto>>("ProductTaxList/SaveProductTaxList", data, getToken());
};

export const getAllProductTaxList = async (): Promise<OperationResult<ProductTaxListDto[]>> => {
  return apiService.get<OperationResult<ProductTaxListDto[]>>("ProductTaxList/GetAllProductTaxList", getToken());
};

export const getProductTaxListById = async (pTaxID: number): Promise<OperationResult<ProductTaxListDto>> => {
  return apiService.get<OperationResult<ProductTaxListDto>>(`ProductTaxList/GetProductTaxListById/${pTaxID}`, getToken());
};

export const updateProductTaxListActiveStatus = async (pTaxID: number, rActive: boolean): Promise<OperationResult<boolean>> => {
  return apiService.put<OperationResult<boolean>>(`ProductTaxList/UpdateProductTaxListActiveStatus/${pTaxID}`, rActive, getToken());
};

// New method to get formatted dropdown options
export const getTaxDropdownOptions = async (): Promise<DropdownOption[]> => {
  const response = await getAllProductTaxList();
  if (response.success && response.data) {
    return response.data.map((tax) => ({
      value: tax.pTaxID.toString(),
      label: tax.pTaxName || "",
      code: tax.pTaxCode,
      amount: tax.pTaxAmt,
      description: tax.pTaxDescription,
      isActive: tax.rActiveYN === "Y",
    }));
  }
  return [];
};

export const ProductTaxListService = {
  saveProductTaxList,
  getAllProductTaxList,
  getProductTaxListById,
  updateProductTaxListActiveStatus,
  getTaxDropdownOptions,
};
