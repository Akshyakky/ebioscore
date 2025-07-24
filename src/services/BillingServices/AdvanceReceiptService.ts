// Updated AdvanceReceiptService (removing conversion methods)
import { APIConfig } from "@/apiConfig";
import { AdvanceReceiptDto, BReceiptMastDto, PatientAdvanceSummaryDto } from "@/interfaces/Billing/AdvanceReceiptDto";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService } from "@/services/GenericEntityService/GenericEntityService";

export interface AdvanceReceiptSearchRequest {
  uhidNo?: string;
  receiptCode?: string;
  patientName?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: string;
  paymentMode?: string;
  patientId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

class AdvanceReceiptService extends GenericEntityService<AdvanceReceiptDto> {
  private readonly receiptEndpoint = "Receipt";

  constructor() {
    super(
      new CommonApiService({
        baseURL: APIConfig.billingURL,
      }),
      "Receipt"
    );
  }

  /**
   * Saves a new advance receipt with payment details
   */
  async saveAdvanceReceipt(advanceReceiptDto: AdvanceReceiptDto): Promise<OperationResult<AdvanceReceiptDto>> {
    try {
      return await this.apiService.post<OperationResult<AdvanceReceiptDto>>(`${this.receiptEndpoint}/SaveAdvance`, advanceReceiptDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to save advance receipt",
      };
    }
  }

  /**
   * Retrieves advance receipt by ID
   */
  async getAdvanceReceiptById(receiptId: number): Promise<OperationResult<AdvanceReceiptDto>> {
    try {
      return await this.apiService.get<OperationResult<AdvanceReceiptDto>>(`${this.receiptEndpoint}/GetAdvanceById/${receiptId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve advance receipt",
      };
    }
  }

  /**
   * Retrieves all advance receipts for a specific patient
   */
  async getAdvanceReceiptsByPatientId(patientId: number): Promise<OperationResult<AdvanceReceiptDto[]>> {
    try {
      return await this.apiService.get<OperationResult<AdvanceReceiptDto[]>>(`${this.receiptEndpoint}/GetAdvanceByPatient/${patientId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve patient advance receipts",
      };
    }
  }

  /**
   * Updates the status of an advance receipt
   */
  async updateAdvanceReceiptStatus(receiptId: number, status: string): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.put<OperationResult<boolean>>(`${this.receiptEndpoint}/UpdateStatus/${receiptId}`, JSON.stringify(status), this.getToken(), {
        "Content-Type": "application/json",
      });
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to update receipt status",
      };
    }
  }

  /**
   * Gets comprehensive advance summary for a patient
   */
  async getPatientAdvanceSummary(patientId: number): Promise<OperationResult<PatientAdvanceSummaryDto>> {
    try {
      return await this.apiService.get<OperationResult<PatientAdvanceSummaryDto>>(`${this.receiptEndpoint}/GetPatientAdvanceSummary/${patientId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve patient advance summary",
      };
    }
  }

  /**
   * Searches advance receipts based on multiple criteria with pagination
   */
  async searchAdvanceReceipts(searchRequest: AdvanceReceiptSearchRequest): Promise<OperationResult<PaginatedList<AdvanceReceiptDto>>> {
    try {
      return await this.apiService.post<OperationResult<PaginatedList<AdvanceReceiptDto>>>(`${this.receiptEndpoint}/SearchAdvanceReceipts`, searchRequest, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to search advance receipts",
      };
    }
  }

  /**
   * Adjusts advance receipt against a bill
   */
  async adjustAdvanceAgainstBill(receiptId: number, billId: number, adjustmentAmount: number): Promise<OperationResult<boolean>> {
    try {
      const adjustmentData = {
        receiptId,
        billId,
        adjustmentAmount,
      };

      return await this.apiService.post<OperationResult<boolean>>(`${this.receiptEndpoint}/AdjustAdvanceAgainstBill`, adjustmentData, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to adjust advance against bill",
      };
    }
  }

  /**
   * Generates a new advance receipt code
   */
  async generateAdvanceReceiptCode(receiptMaster?: Partial<BReceiptMastDto>): Promise<OperationResult<string>> {
    try {
      // Create a default receipt master object for new receipts
      const defaultReceiptMaster: BReceiptMastDto = {
        docID: 0,
        docCode: 0,
        docDate: new Date(),
        pChartID: 0,
        docType: "ADV",
        docCodeCd: "",
        oldPChartID: 0,
        rActiveYN: "Y",
        transferYN: "N",
        rCreatedBy: 0,
        rCreatedOn: new Date(),
        rModifiedBy: 0,
        rModifiedOn: new Date(),
        rNotes: "",
        ...receiptMaster, // Override with any provided values
      };

      return await this.apiService.post<OperationResult<string>>(`${this.receiptEndpoint}/GenerateAdvanceReceiptCode`, defaultReceiptMaster, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to generate receipt code",
      };
    }
  }

  /**
   * Validates advance receipt data before saving
   */
  async validateAdvanceReceipt(advanceReceiptDto: AdvanceReceiptDto): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.post<OperationResult<boolean>>(`${this.receiptEndpoint}/ValidateAdvanceReceipt`, advanceReceiptDto, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to validate advance receipt",
      };
    }
  }

  /**
   * Gets advance receipts with filtering and pagination
   */
  async getAdvanceReceiptsWithFilters(
    uhidNo?: string,
    receiptCode?: string,
    patientName?: string,
    fromDate?: Date,
    toDate?: Date,
    status?: string,
    paymentMode?: string,
    pageNumber: number = 1,
    pageSize: number = 25
  ): Promise<OperationResult<PaginatedList<AdvanceReceiptDto>>> {
    try {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (uhidNo) params.append("uhidNo", uhidNo);
      if (receiptCode) params.append("receiptCode", receiptCode);
      if (patientName) params.append("patientName", patientName);
      if (fromDate) params.append("fromDate", fromDate.toISOString());
      if (toDate) params.append("toDate", toDate.toISOString());
      if (status) params.append("status", status);
      if (paymentMode) params.append("paymentMode", paymentMode);

      const url = `${this.receiptEndpoint}/GetAdvanceReceiptsWithFilters?${params.toString()}`;
      return await this.apiService.get<OperationResult<PaginatedList<AdvanceReceiptDto>>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve filtered advance receipts",
      };
    }
  }

  /**
   * Gets advance receipt summary by date range
   */
  async getAdvanceReceiptSummary(startDate?: Date, endDate?: Date): Promise<OperationResult<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      const queryString = params.toString();
      const url = `${this.receiptEndpoint}/GetAdvanceReceiptSummary${queryString ? `?${queryString}` : ""}`;

      return await this.apiService.get<OperationResult<any>>(url, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve advance receipt summary",
      };
    }
  }

  /**
   * Cancels an advance receipt
   */
  async cancelAdvanceReceipt(receiptId: number): Promise<OperationResult<boolean>> {
    try {
      return await this.apiService.put<OperationResult<boolean>>(`${this.receiptEndpoint}/CancelAdvanceReceipt/${receiptId}`, {}, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to cancel advance receipt",
      };
    }
  }

  /**
   * Gets available advance balance for a patient
   */
  async getPatientAdvanceBalance(patientId: number): Promise<OperationResult<number>> {
    try {
      return await this.apiService.get<OperationResult<number>>(`${this.receiptEndpoint}/GetPatientAdvanceBalance/${patientId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve patient advance balance",
      };
    }
  }

  /**
   * Gets active advance receipts for a patient
   */
  async getActiveAdvanceReceipts(patientId: number): Promise<OperationResult<AdvanceReceiptDto[]>> {
    try {
      return await this.apiService.get<OperationResult<AdvanceReceiptDto[]>>(`${this.receiptEndpoint}/GetActiveAdvanceReceipts/${patientId}`, this.getToken());
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Failed to retrieve active advance receipts",
      };
    }
  }

  /**
   * Client-side validation for advance receipt data
   */
  validateAdvanceReceiptData(advanceReceiptDto: AdvanceReceiptDto): string[] {
    const errors: string[] = [];

    if (!advanceReceiptDto.receiptDetail.pChartCode?.trim()) {
      errors.push("UHID number is required");
    }

    if (!advanceReceiptDto.receiptDetail.pTitle?.trim()) {
      errors.push("Patient title is required");
    }

    if (advanceReceiptDto.receiptMaster.pChartID <= 0) {
      errors.push("Valid patient ID is required");
    }

    if (!advanceReceiptDto.receiptMaster.docDate) {
      errors.push("Receipt date is required");
    }

    if (!advanceReceiptDto.paymentDetails || advanceReceiptDto.paymentDetails.length === 0) {
      errors.push("At least one payment detail is required");
    } else {
      const totalAmount = advanceReceiptDto.paymentDetails.reduce((sum, payment) => sum + (payment.paidAmt || 0), 0);

      if (totalAmount <= 0) {
        errors.push("Total payment amount must be greater than zero");
      }

      advanceReceiptDto.paymentDetails.forEach((payment, index) => {
        if (!payment.payMode?.trim()) {
          errors.push(`Payment mode is required for payment ${index + 1}`);
        }

        if (!payment.paidAmt || payment.paidAmt <= 0) {
          errors.push(`Payment amount must be greater than zero for payment ${index + 1}`);
        }

        if (["CHEQUE", "NEFT", "RTGS"].includes(payment.payMode) && !payment.refNo?.trim()) {
          errors.push(`Reference number is required for ${payment.payMode} payment`);
        }

        if (payment.payMode === "CARD" && !payment.cardApprove?.trim()) {
          errors.push(`Card approval code is required for card payment`);
        }
      });
    }

    return errors;
  }
}

export const advanceReceiptService = new AdvanceReceiptService();
