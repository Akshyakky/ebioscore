import { CommonApiService } from "../CommonApiService";
import { BServiceGrpDto } from "../../interfaces/Billing/BServiceGrpDto"
import { OperationResult } from "../../interfaces/Common/OperationResult";
import { APIConfig } from "../../apiConfig";
import { store } from "../../store/store";


const apiService = new CommonApiService({ baseURL: APIConfig.billingURL });

const getToken = () => store.getState().userDetails.token!;

export const saveBServiceGrp = async (
    bServiceGrpDto: BServiceGrpDto
): Promise<OperationResult<BServiceGrpDto>> => {
    return apiService.post<OperationResult<BServiceGrpDto>>(
        "ServiceGroup/SaveBServiceGrp",
        bServiceGrpDto,
        getToken()
    );
};

export const getAllBServiceGrps = async (): Promise<
    OperationResult<BServiceGrpDto[]>
> => {
    return apiService.get<OperationResult<BServiceGrpDto[]>>(
        "ServiceGroup/GetAllBServiceGrps",
        getToken()
    );
};

export const getBServiceGrpById = async (
    sGrpID: number
): Promise<OperationResult<BServiceGrpDto>> => {
    return apiService.get<OperationResult<BServiceGrpDto>>(
        `ServiceGroup/GetBServiceGrpById/${sGrpID}`,
        getToken()
    );
};

export const updateBServiceGrpActiveStatus = async (
    sGrpID: number,
    rActiveYN: boolean
): Promise<OperationResult<BServiceGrpDto>> => {
    return apiService.put<OperationResult<BServiceGrpDto>>(
        `ServiceGroup/UpdateBServiceGrpActiveStatus/${sGrpID}`,
        rActiveYN,
        getToken()
    );
};

export const ServiceGroupListCodeService = {
    saveBServiceGrp,
    getAllBServiceGrps,
    getBServiceGrpById,
    updateBServiceGrpActiveStatus,
};



