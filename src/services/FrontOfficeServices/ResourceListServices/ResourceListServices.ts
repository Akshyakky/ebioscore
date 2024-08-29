import { ResourceListData } from "./../../../interfaces/FrontOffice/ResourceListData";
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { CommonApiService } from "../../CommonApiService";
import { store } from "../../../store/store";

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().userDetails.token!;

export const saveResourceList = async (
  resourceListData: ResourceListData
): Promise<OperationResult<ResourceListData>> => {
  return commonApiService.post<OperationResult<any>>(
    "ResourceList/SaveResourceList",
    resourceListData,
    getToken()
  );
};

export const getResourceById = async (
  id: number
): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(
    `ResourceList/GetResourceListById/${id}`,
    getToken()
  );
};

export const getAllResourceLists = async (): Promise<
  OperationResult<any[]>
> => {
  return commonApiService.get<OperationResult<any[]>>(
    "ResourceList/GetAllResourceLists",
    getToken()
  );
};

export const updateResourceActiveStatus = async (
  resourceId: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(
    `ResourceList/UpdateResourceActiveStatus/${resourceId}`,
    rActive,
    getToken()
  );
};

export const ResourceListService = {
  saveResourceList,
  getResourceById,
  getAllResourceLists,
  updateResourceActiveStatus,
};
