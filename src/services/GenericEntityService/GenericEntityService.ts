import { CommonApiService } from "../CommonApiService";
import { store } from "../../store/store";
import { ProductTaxListDto } from "../../interfaces/InventoryManagement/ProductTaxListDto";
import {
  ProductGroupDto,
  ProductSubGroupDto,
  ProductUnitDto,
} from "../../interfaces/InventoryManagement/ProductGroup-Unit-SubGroup";
import { MedicationRouteDto } from "../../interfaces/ClinicalManagement/MedicationRouteDto";
import { MedicationFormDto } from "../../interfaces/ClinicalManagement/MedicationFormDto";
import { MedicationGenericDto } from "../../interfaces/ClinicalManagement/MedicationGenericDto";
import { ProductOverviewDto } from "../../interfaces/InventoryManagement/ProductOverviewDto";
import { ConsultantRoleDto } from "../../interfaces/ClinicalManagement/ConsultantRoleDto";
import { AdmissionDto } from "../../interfaces/PatientAdministration/AdmissionDto";
import { ProfileMastDto } from "../../interfaces/SecurityManagement/ProfileListData";
import {
  RoomGroupDto,
  RoomListDto,
  WrBedDto,
} from "../../interfaces/HospitalAdministration/Room-BedSetUpDto";

// Generic DTO interface with common properties
export interface BaseDto {
  // id: number;
  // rActiveYN: string;
  [key: string]: any; // Allow for additional properties
}

interface ApiConfig {
  [key: string]: string;
}

interface JoinConfig {
  joinType: "inner" | "left";
  joinEntityName: string;
  leftKeySelector: string;
  rightKeySelector: string;
  resultSelector: string;
}

interface MultiJoinDataRequest<T> {
  mainFilter: string;
  joinConfigs: JoinConfig[];
  selector: string;
}

// Load environment variables
const apiConfig: ApiConfig = {
  AUTH_URL: import.meta.env.VITE_AUTH_URL,
  COMMON_URL: import.meta.env.VITE_COMMONURL,
  PATIENT_ADMINISTRATION_URL: import.meta.env.VITE_PATIENT_ADMINISTRATION_URL,
  HOSPITAL_ADMINISTRATION_URL: import.meta.env.VITE_HOSPITAL_ADMINISTRATION_URL,
  FRONT_OFFICE_URL: import.meta.env.VITE_FRONT_OFFICE_URL,
  SECURITY_MANAGEMENT_URL: import.meta.env.VITE_SECURITY_MANAGEMENT_URL,
  BILLING_URL: import.meta.env.VITE_BILLING_URL,
  ROUTINE_REPORT_URL: import.meta.env.VITE_ROUTINEREPORTURL,
  INVENTORY_MANAGEMENT_URL: import.meta.env.VITE_INVENTORY_MANAGEMENT_URL,
  CLINICAL_MANAGEMENT_URL: import.meta.env.VITE_CLINICAL_MANAGEMENT_URL,
};

// Generic service class
class GenericEntityService<T extends BaseDto> {
  protected apiService: CommonApiService;
  protected baseEndpoint: string;

  constructor(apiService: CommonApiService, entityName: string) {
    this.apiService = apiService;
    this.baseEndpoint = `${entityName}`;
  }

  protected getToken(): string {
    return store.getState().userDetails.token!;
  }

  async getAll(): Promise<T> {
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetAll`,
      this.getToken()
    );
  }

  async getById(id: number): Promise<T> {
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetById/${id}`,
      this.getToken()
    );
  }

  async save(entity: T): Promise<T> {
    return this.apiService.post<T>(
      `${this.baseEndpoint}/Save`,
      entity,
      this.getToken()
    );
  }

  async updateActiveStatus(id: number, active: boolean): Promise<boolean> {
    return this.apiService.put<boolean>(
      `${this.baseEndpoint}/UpdateActiveStatus/${id}`,
      active,
      this.getToken()
    );
  }

  async getNextCode(
    prefix: string,
    codeProperty: string,
    padLength: number = 5
  ): Promise<T> {
    const params = new URLSearchParams({
      prefix,
      codeProperty,
      padLength: padLength.toString(),
    });
    return this.apiService.get<T>(
      `${this.baseEndpoint}/GetNextCode?${params.toString()}`,
      this.getToken()
    );
  }

  async getMultiJoinData<TResult>(
    request: MultiJoinDataRequest<T>
  ): Promise<TResult[]> {
    return this.apiService.post<TResult[]>(
      `${this.baseEndpoint}/GetMultiJoinData`,
      request,
      this.getToken()
    );
  }
  // Add any additional common methods here
}

// Factory function to create entity-specific services
function createEntityService<T extends BaseDto>(
  entityName: string,
  apiKey: keyof typeof apiConfig
): GenericEntityService<T> {
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: apiConfig[apiKey],
    }),
    entityName
  );
}

// Inventory Management Services
export const productSubGroupService = createEntityService<ProductSubGroupDto>(
  "ProductSubGroup",
  "INVENTORY_MANAGEMENT_URL"
);
export const productGroupService = createEntityService<ProductGroupDto>(
  "ProductGroup",
  "INVENTORY_MANAGEMENT_URL"
);

export const productUnitService = createEntityService<ProductUnitDto>(
  "ProductUnit",
  "INVENTORY_MANAGEMENT_URL"
);

export const productTaxService = createEntityService<ProductTaxListDto>(
  "ProductTaxList",
  "INVENTORY_MANAGEMENT_URL"
);

export const productOverviewService = createEntityService<ProductOverviewDto>(
  "ProductOverview",
  "INVENTORY_MANAGEMENT_URL"
);

// Clinical Management Api Services
export const medicationRouteService = createEntityService<MedicationRouteDto>(
  "MedicationRoute",
  "CLINICAL_MANAGEMENT_URL"
);

export const medicationFormService = createEntityService<MedicationFormDto>(
  "MedicationForm",
  "CLINICAL_MANAGEMENT_URL"
);

export const medicationGenericService =
  createEntityService<MedicationGenericDto>(
    "MedicationGeneric",
    "CLINICAL_MANAGEMENT_URL"
  );

export const consultantRoleService = createEntityService<ConsultantRoleDto>(
  "ConsultantRole",
  "CLINICAL_MANAGEMENT_URL"
);

// Patient Administration Api Services
export const admissionService = createEntityService<AdmissionDto>(
  "Admission",
  "PATIENT_ADMINISTRATION_URL"
);

//Hospital Administration Api Services
export const roomGroupService = createEntityService<RoomGroupDto>(
  "RoomGroup",
  "HOSPITAL_ADMINISTRATION_URL"
);

export const roomListService = createEntityService<RoomListDto>(
  "RoomList",
  "HOSPITAL_ADMINISTRATION_URL"
);

export const wrBedService = createEntityService<WrBedDto>(
  "WrBed",
  "HOSPITAL_ADMINISTRATION_URL"
);

// If you need to extend the generic service for admissions with specific methods:
class ExtendedAdmissionService extends GenericEntityService<AdmissionDto> {
  async admit(admissionData: AdmissionDto): Promise<AdmissionDto> {
    return this.apiService.post<AdmissionDto>(
      `${this.baseEndpoint}/Admit`,
      admissionData,
      this.getToken()
    );
  }
}
export const profileMastService = createEntityService<ProfileMastDto>(
  "ProfileMast",
  "SECURITY_MANAGEMENT_URL"
);
// Example of how to extend the generic service for entity-specific methods if needed
// class ExtendedProductSubGroupService extends GenericEntityService<ProductSubGroupDto> {
//   async getByCompanyId(companyId: number): Promise<ProductSubGroupDto[]> {
//     return this.apiService.get<ProductSubGroupDto[]>(
//       `${this.baseEndpoint}/GetByCompanyId/${companyId}`,
//       this.getToken()
//     );
//   }
// }

export const extendedAdmissionService = new ExtendedAdmissionService(
  new CommonApiService({
    baseURL: apiConfig.PATIENT_ADMINISTRATION_URL,
  }),
  "Admission"
);
