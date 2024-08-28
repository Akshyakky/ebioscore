import { ReasonListData } from './../../../interfaces/frontOffice/ReasonListData';
import { APIConfig } from "../../../apiConfig";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { CommonApiService } from '../../CommonApiService';
import { store } from '../../../store/store';

const commonApiService = new CommonApiService({
  baseURL: APIConfig.frontOffice,
});

const getToken = () => store.getState().userDetails.token!;

export const saveReasonList = async (
  reasonListData: ReasonListData
): Promise<OperationResult<ReasonListData>> => {
  return commonApiService.post<OperationResult<any>>(
    "ReasonList/SaveReasonList",
    reasonListData,
    getToken()
  );
};

export const getReasonById = async (
  id: number
): Promise<OperationResult<any>> => {
  return commonApiService.get<OperationResult<any>>(
    `ReasonList/GetReasonListById/${id}`,
    getToken()
  );
};


export const getAllReasonLists = async (): Promise<
  OperationResult<any[]>
> => {
  return commonApiService.get<OperationResult<any[]>>(
    "ReasonList/GetAllReasonLists",
    getToken()
  );
};


export const updateReasonActiveStatus = async (
  arlID: number,
  rActive: boolean
): Promise<OperationResult<boolean>> => {
  return commonApiService.put<OperationResult<boolean>>(
    `ReasonList/UpdateReasonActiveStatus/${arlID}`,
    rActive,
    getToken()
  );
};

export const ReasonListService = {
  saveReasonList,
  getAllReasonLists,
  updateReasonActiveStatus,
  getReasonById
};
