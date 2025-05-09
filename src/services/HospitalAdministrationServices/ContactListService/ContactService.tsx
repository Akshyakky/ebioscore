import { APIConfig } from "@/apiConfig";
import { ContactListData, ContactMastData } from "@/interfaces/HospitalAdministration/ContactListData";
import { GenericEntityService, OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";
import { CommonApiService } from "@/services/CommonApiService";

export class ContactService extends GenericEntityService<ContactMastData> {
  constructor() {
    const apiService = new CommonApiService({
      baseURL: APIConfig.hospitalAdministrations,
    });
    super(apiService, "Contact");
  }

  /**
   * Saves a complete contact with address and details
   */
  async saveContactList(contactListDto: ContactListData): Promise<OperationResult<ContactListData>> {
    return this.apiService.post<OperationResult<ContactListData>>(`${this.baseEndpoint}/SaveContactList`, contactListDto, this.getToken());
  }

  /**
   * Searches contacts based on provided filters
   */
  async searchContactList(
    name?: string,
    conCode?: string,
    conCat?: string,
    phoneNumber?: string,
    fromDate?: Date,
    toDate?: Date,
    pageIndex: number = 1,
    pageSize: number = 20
  ): Promise<OperationResult<PaginatedList<ContactMastData>>> {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
      ...(name && { name }),
      ...(conCode && { conCode }),
      ...(conCat && { conCat }),
      ...(phoneNumber && { phoneNumber }),
      ...(fromDate && { fromDate: fromDate.toISOString() }),
      ...(toDate && { toDate: toDate.toISOString() }),
    });

    return this.apiService.get<OperationResult<PaginatedList<ContactMastData>>>(`${this.baseEndpoint}/SearchContactList?${params.toString()}`, this.getToken());
  }

  /**
   * Gets contact details by contact ID
   */
  async getContactDetails(conID: number): Promise<OperationResult<ContactListData>> {
    return this.apiService.get<OperationResult<ContactListData>>(`${this.baseEndpoint}/GetContactDetails/${conID}`, this.getToken());
  }

  /**
   * Generates a new contact code
   */
  async generateContactCode(): Promise<OperationResult<string>> {
    return this.apiService.get<OperationResult<string>>(`${this.baseEndpoint}/GenerateContactCode`, this.getToken());
  }
}
