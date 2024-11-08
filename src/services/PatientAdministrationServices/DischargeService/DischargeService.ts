// src/services/patientAdministrationServices/DischargeService/DischargeService.ts
import { createEntityService } from "../../../utils/Common/serviceFactory";
import { IpDischargeDto } from "../../../interfaces/PatientAdministration/IpDischargeDto";
import { handleError } from "../../CommonServices/HandlerError";

class DischargeService {
  private baseService = createEntityService<IpDischargeDto>("Discharge", "patientAdministrationURL");

  /**
   * Process a new discharge or update existing discharge
   * @param dischargeData The discharge data to process
   * @returns Promise with the processed discharge data
   */
  async processDischarge(dischargeData: IpDischargeDto): Promise<IpDischargeDto> {
    const formattedData = this.formatDischargeData(dischargeData);
    return await this.baseService.save(formattedData);
  }

  /**
   * Get discharge details by admission ID
   * @param admitId The admission ID
   * @returns Promise with the discharge details
   */
  async getDischargeByAdmissionId(admitId: number): Promise<IpDischargeDto | null> {
    const predicate = `admitID==${admitId}`;
    return await this.baseService.firstOrDefault(predicate);
  }

  /**
   * Get discharge details by patient chart ID
   * @param pChartId The patient chart ID
   * @returns Promise with the discharge details
   */
  async getDischargeByPatientChartId(pChartId: number): Promise<IpDischargeDto | null> {
    const predicate = `pChartID==${pChartId}`;
    return await this.baseService.firstOrDefault(predicate);
  }

  /**
   * Check if discharge exists for given admission
   * @param admitId The admission ID
   * @returns Promise with boolean indicating if discharge exists
   */
  async checkDischargeExists(admitId: number): Promise<boolean> {
    const predicate = `admitID==${admitId}`;
    return await this.baseService.any(predicate);
  }

  /**
   * Get all discharges with pagination
   * @param pageIndex The page number
   * @param pageSize The number of items per page
   * @param filter Optional filter string
   * @returns Promise with paginated discharge data
   */
  async getDischargesWithPagination(pageIndex: number, pageSize: number, filter?: string) {
    try {
      return await this.baseService.getPaged(pageIndex, pageSize, filter);
    } catch (error) {
      console.error("Error fetching paginated discharges:", error);
      return handleError(error);
    }
  }

  /**
   * Initialize a new discharge DTO with default values
   * @param admitId The admission ID
   * @param pChartId The patient chart ID
   * @param companyDetails The company details
   * @returns A new discharge DTO with default values
   */
  initializeDischargeDto(admitId: number, pChartId: number, companyDetails: { compID: number; compCode: string; compName: string }): IpDischargeDto {
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
      dischgType: "",
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

  /**
   * Format discharge data for submission
   * @param data The discharge data to format
   * @returns Formatted discharge data
   */
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

  /**
   * Format YN field to ensure valid value
   * @param value The value to format
   * @returns "Y" or "N"
   */
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

// Export singleton instance
export const dischargeService = new DischargeService();
export default dischargeService;
