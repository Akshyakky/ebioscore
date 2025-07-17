// src/services/BillingServices/billingService.ts

import { APIConfig } from "@/apiConfig";
import { BillSaveRequest, BillsDto, BillServicesDto } from "@/interfaces/Billing/BillingDto";
import {
  BChargeAliasDto,
  BChargeDetailDto,
  BChargeDto,
  BChargeFacultyDto,
  BChargePackDto,
  BDoctorSharePercShareDto,
  ChargeCodeGenerationDto,
  ChargeWithAllDetailsDto,
} from "@/interfaces/Billing/ChargeDto";
import { ProductBatchDto } from "@/interfaces/InventoryManagement/ProductBatchDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

// Create extended services with custom methods
class ExtendedBChargeDetailService extends GenericEntityService<BChargeDetailDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BChargeDetail");
  }

  async getByChargeId(chargeId: number): Promise<OperationResult<BChargeDetailDto[]>> {
    return this.apiService.get<OperationResult<BChargeDetailDto[]>>(`${this.baseEndpoint}/GetByChargeId/${chargeId}`, this.getToken());
  }
}

class ExtendedBDoctorSharePercShareService extends GenericEntityService<BDoctorSharePercShareDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BDoctorSharePercShare");
  }

  async getByChargeId(chargeId: number): Promise<OperationResult<BDoctorSharePercShareDto[]>> {
    return this.apiService.get<OperationResult<BDoctorSharePercShareDto[]>>(`${this.baseEndpoint}/GetByChargeId/${chargeId}`, this.getToken());
  }
}

class ExtendedBChargeAliasService extends GenericEntityService<BChargeAliasDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BChargeAlias");
  }

  async getByChargeId(chargeId: number): Promise<OperationResult<BChargeAliasDto[]>> {
    return this.apiService.get<OperationResult<BChargeAliasDto[]>>(`${this.baseEndpoint}/GetByChargeId/${chargeId}`, this.getToken());
  }
}

class ExtendedBChargeFacultyService extends GenericEntityService<BChargeFacultyDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BChargeFaculty");
  }

  async getByChargeId(chargeId: number): Promise<OperationResult<BChargeFacultyDto[]>> {
    return this.apiService.get<OperationResult<BChargeFacultyDto[]>>(`${this.baseEndpoint}/GetByChargeId/${chargeId}`, this.getToken());
  }
}

class ExtendedBChargePackService extends GenericEntityService<BChargePackDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BChargePack");
  }

  async getByChargeId(chargeId: number): Promise<OperationResult<BChargePackDto[]>> {
    return this.apiService.get<OperationResult<BChargePackDto[]>>(`${this.baseEndpoint}/GetByChargeId/${chargeId}`, this.getToken());
  }

  async getByChargeDetailId(chargeDetailId: number): Promise<OperationResult<BChargePackDto[]>> {
    return this.apiService.get<OperationResult<BChargePackDto[]>>(`${this.baseEndpoint}/GetByChargeDetailId/${chargeDetailId}`, this.getToken());
  }
}

class ExtendedBChargeService extends GenericEntityService<BChargeDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "BCharge");
  }

  async saveChargesWithAllDetails(dto: ChargeWithAllDetailsDto): Promise<OperationResult<ChargeWithAllDetailsDto>> {
    return this.apiService.post<OperationResult<ChargeWithAllDetailsDto>>(`${this.baseEndpoint}/SaveChargesWithAllDetails`, dto, this.getToken());
  }

  async getAllChargesWithDetails(): Promise<OperationResult<ChargeWithAllDetailsDto[]>> {
    return this.apiService.get<OperationResult<ChargeWithAllDetailsDto[]>>(`${this.baseEndpoint}/GetAllChargesWithDetails`, this.getToken());
  }

  async getAllChargesWithDetailsByID(id: number): Promise<OperationResult<ChargeWithAllDetailsDto>> {
    return this.apiService.get<OperationResult<ChargeWithAllDetailsDto>>(`${this.baseEndpoint}/GetAllChargesWithDetailsByID/${id}`, this.getToken());
  }

  async generateChargeCode(dto: ChargeCodeGenerationDto): Promise<OperationResult<string>> {
    return this.apiService.post<OperationResult<string>>(`${this.baseEndpoint}/GenerateChargeCode`, dto, this.getToken());
  }
}
class ExtendedBillingService extends GenericEntityService<BillsDto> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.billingURL }), "Billing");
  }
  async getBillingServiceById(chargeId: number): Promise<OperationResult<BillServicesDto[]>> {
    return this.apiService.get<OperationResult<BillServicesDto[]>>(`${this.baseEndpoint}/GetBillingServiceById/${chargeId}`, this.getToken());
  }
  async getBatchNoProduct(productId: number, departmentId: number): Promise<OperationResult<ProductBatchDto[]>> {
    return this.apiService.get<OperationResult<ProductBatchDto[]>>(`${this.baseEndpoint}/GetBatchNoProduct?productId=${productId}&departmentId=${departmentId}`, this.getToken());
  }
}

// Export basic services using factory pattern (for simple CRUD operations)
export const chargeService = createEntityService<BChargeDto>("BCharge", "billingURL");
export const chargeDetailService = createEntityService<BChargeDetailDto>("BChargeDetail", "billingURL");
export const doctorSharePercShareService = createEntityService<BDoctorSharePercShareDto>("BDoctorSharePercShare", "billingURL");
export const chargeAliasService = createEntityService<BChargeAliasDto>("BChargeAlias", "billingURL");
export const chargeFacultyService = createEntityService<BChargeFacultyDto>("BChargeFaculty", "billingURL");
export const chargePackService = createEntityService<BChargePackDto>("BChargePack", "billingURL");
export const billingGenericService = createEntityService<BillSaveRequest>("Billing", "billingURL");

// Export extended services with custom methods (for complex operations)
export const bChargeService = new ExtendedBChargeService();
export const bChargeDetailService = new ExtendedBChargeDetailService();
export const bDoctorSharePercShareService = new ExtendedBDoctorSharePercShareService();
export const bChargeAliasService = new ExtendedBChargeAliasService();
export const bChargeFacultyService = new ExtendedBChargeFacultyService();
export const bChargePackService = new ExtendedBChargePackService();
export const billingService = new ExtendedBillingService();
//

// Export types for convenience
export type { BChargeAliasDto, BChargeDetailDto, BChargeDto, BChargeFacultyDto, BChargePackDto, BDoctorSharePercShareDto, ChargeCodeGenerationDto, ChargeWithAllDetailsDto };
