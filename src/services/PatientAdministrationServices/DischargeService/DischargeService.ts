// src/services/patientAdministrationServices/DischargeService/DischargeService.ts

import { APIConfig } from "@/apiConfig";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

class DischargeService extends GenericEntityService<IpDischargeDto> {
  constructor(apiService: CommonApiService, entityName: string) {
    super(apiService, entityName);
  }

  /**
   * Process a new discharge or update existing discharge
   */
  async processDischarge(dischargeData: IpDischargeDto): Promise<OperationResult<IpDischargeDto>> {
    const formattedData = this.formatDischargeData(dischargeData);
    return await this.apiService.post<OperationResult<IpDischargeDto>>(`${this.baseEndpoint}/ProcessDischarge`, formattedData, this.getToken());
  }

  /**
   * Get discharge details by admission ID
   */
  async getDischargeByAdmissionId(admitId: number): Promise<IpDischargeDto | null> {
    const predicate = `admitID==${admitId}`;
    const result = await this.firstOrDefault(predicate);
    return result?.data || null;
  }

  /**
   * Get discharge details by patient chart ID
   */
  async getDischargeByPatientChartId(pChartId: number): Promise<IpDischargeDto | null> {
    const predicate = `pChartID==${pChartId}`;
    const result = await this.firstOrDefault(predicate);
    return result?.data || null;
  }

  /**
   * Check if discharge exists for given admission
   */
  async checkDischargeExists(admitId: number): Promise<boolean> {
    const predicate = `admitID==${admitId}`;
    const result = await this.any(predicate);
    return result.data ?? false;
  }

  /**
   * Get all discharges with pagination
   */
  async getDischargesWithPagination(pageIndex: number, pageSize: number, filter?: string) {
    return await this.getPaged(pageIndex, pageSize, filter);
  }

  /**
   * Initialize a new discharge DTO with default values
   */
  initializeDischargeDto(
    admitId: number,
    pChartId: number,
    companyDetails: {
      compID: number;
      compCode: string;
      compName: string;
    }
  ): IpDischargeDto {
    const currentDate = new Date();
    return {
      dischgID: 0,
      pChartID: pChartId,
      admitID: admitId,
      dischgDate: currentDate,
      dischgTime: currentDate,
      dischgStatus: "",
      dischgPhyID: undefined,
      dischgPhyName: "",
      releaseBedYN: "Y",
      authorisedBy: "",
      deliveryType: "",
      dischargeCode: "",
      dischgSumYN: "N",
      facultyID: undefined,
      faculty: "",
      dischgType: "DISCHARGED",
      pChartCode: "",
      pTitle: "",
      pfName: "",
      pmName: "",
      plName: "",
      defineStatus: "",
      defineSituation: "",
      situation: "",
      rActiveYN: "Y",
      compID: companyDetails.compID,
      compCode: companyDetails.compCode,
      compName: companyDetails.compName,
      transferYN: "N",
      rNotes: "",
    };
  }

  private formatDischargeData(data: IpDischargeDto): IpDischargeDto {
    return {
      ...data,
      dischgDate: new Date(data.dischgDate),
      dischgTime: new Date(data.dischgTime),
      releaseBedYN: this.formatYNField(data.releaseBedYN),
      dischgSumYN: this.formatYNField(data.dischgSumYN),
      rActiveYN: this.formatYNField(data.rActiveYN),
      transferYN: this.formatYNField(data.transferYN),
      // Ensure optional string fields are not undefined
      dischgStatus: data.dischgStatus || "",
      dischgPhyName: data.dischgPhyName || "",
      authorisedBy: data.authorisedBy || "",
      deliveryType: data.deliveryType || "",
      dischargeCode: data.dischargeCode || "",
      faculty: data.faculty || "",
      dischgType: data.dischgType || "",
      pChartCode: data.pChartCode || "",
      pfName: data.pfName || "",
      pmName: data.pmName || "",
      plName: data.plName || "",
      defineStatus: data.defineStatus || "",
      defineSituation: data.defineSituation || "",
      situation: data.situation || "",
      rNotes: data.rNotes || "",
    };
  }

  private formatYNField(value: any): "Y" | "N" {
    if (typeof value === "boolean") {
      return value ? "Y" : "N";
    }
    if (typeof value === "string") {
      return value.toUpperCase() === "Y" ? "Y" : "N";
    }
    return "N";
  }
}

export const dischargeService = new DischargeService(
  new CommonApiService({
    baseURL: APIConfig.patientAdministrationURL,
  }),
  "Discharge"
);

export default dischargeService;
