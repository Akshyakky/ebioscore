import { useState, useEffect, useCallback, useMemo } from "react";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useAlert } from "@/providers/AlertProvider";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { BillingService } from "@/services/NotGenericPaternServices/BillingService";
import { AppModifyListService } from "@/services/NotGenericPaternServices/AppModifyListService";
import { departmentListService } from "@/services/CommonServices/CommonGenericServices";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { ContactMastService } from "@/services/NotGenericPaternServices/ContactMastService";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { deptUnitListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { roomGroupService, roomListService, wardCategoryService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { WardCategoryDto } from "@/interfaces/HospitalAdministration/WardCategoryDto";
import { productGroupService, productSubGroupService, productTaxService, productUnitService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  consultantRoleService,
  medicationDosageService,
  medicationFormService,
  medicationFrequencyService,
  medicationGenericService,
  medicationInstructionService,
} from "@/services/ClinicalManagementServices/clinicalManagementService";
import { dischargeStatusService } from "@/services/PatientAdministrationServices/patientAdministrationService";
import { componentEntryTypeService, templategroupService } from "@/services/Laboratory/LaboratoryService";
import { appSubModuleService, appUserModuleService, profileMastService } from "@/services/SecurityManagementServices/securityManagementServices";
import { serviceGroupService, serviceTypeService } from "@/services/BillingServices/BillingGenericService";
import { ServiceTypeDto } from "@/interfaces/Billing/BChargeDetails";
import { ContactService } from "@/services/HospitalAdministrationServices/ContactListService/ContactService";
import { resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { useUserList } from "@/pages/securityManagement/UserListPage/hooks/useUserList";
import { ProfileMastDto } from "@/interfaces/SecurityManagement/ProfileListData";
import { AppointmentService } from "@/services/NotGenericPaternServices/AppointmentService";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { ContactMastShortDto } from "@/interfaces/HospitalAdministration/ContactListData";

export type DropdownType =
  | "pic"
  | "title"
  | "gender"
  | "ageUnit"
  | "nationality"
  | "area"
  | "city"
  | "country"
  | "company"
  | "department"
  | "attendingPhy"
  | "primaryIntroducingSource"
  | "membershipScheme"
  | "relation"
  | "insurance"
  | "coverFor"
  | "departmentTypes"
  | "bloodGroup"
  | "maritalStatus"
  | "state"
  | "category"
  | "employeeStatus"
  | "speciality"
  | "floor"
  | "unit"
  | "bedCategory"
  | "productCategory"
  | "productSubGroup"
  | "productGroup"
  | "productUnit"
  | "medicationForm"
  | "medicationGeneric"
  | "taxType"
  | "consultantRole"
  | "roomGroup"
  | "roomList"
  | "payment"
  | "admissionType"
  | "caseType"
  | "beds"
  | "medicationDosage"
  | "medicationFrequency"
  | "medicationInstruction"
  | "dischargeStatus"
  | "dischargeSituation"
  | "deliveryType"
  | "investigationType"
  | "language"
  | "entryType"
  | "templateGroup"
  | "mainModules"
  | "subModules"
  | "mainGroup"
  | "subTitle"
  | "sampleType"
  | "serviceType"
  | "serviceGroup"
  | "employeeRoom"
  | "departmentIndent"
  | "statusFilter"
  | "manufacturer"
  | "productLocation"
  | "grnType"
  | "resourceList"
  | "usersWithoutLogin"
  | "appointmentConsultants"
  | "profiles"
  | "units"
  | "dischargeType"
  | "alertCategory"
  | "productBaseUnit";

// Structure for tracking each dropdown's state
interface DropdownState {
  data: DropdownOption[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Hook configuration options
interface UseDropdownValuesOptions {
  cacheDuration?: number; // Duration in milliseconds to consider cached data valid
  showErrorAlerts?: boolean; // Whether to show error alerts to the user
  autoRefresh?: boolean; // Whether to automatically refresh stale data
}

// Default options
const DEFAULT_OPTIONS: UseDropdownValuesOptions = {
  cacheDuration: 15 * 60 * 1000, // 15 minutes cache by default
  showErrorAlerts: true,
  autoRefresh: true,
};

// Type for the fetch functions registry
type FetcherFunction = (compID?: number) => Promise<any>;

/**
 * Enhanced hook for fetching and managing dropdown values
 */
const useDropdownValues = (requiredDropdowns: DropdownType[], options: UseDropdownValuesOptions = {}) => {
  // Merge default options with provided options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Get company ID from user info in Redux store
  const userInfo = useAppSelector((state: RootState) => state.auth);
  const compID = userInfo.compID!;

  // State to track status of each dropdown
  const [dropdownStates, setDropdownStates] = useState<Record<DropdownType, DropdownState>>({} as Record<DropdownType, DropdownState>);
  const { getUsersWithoutCredentials } = useUserList();
  const { showAlert } = useAlert();
  // Registry of dropdown fetcher functions
  const fetcherRegistry = useMemo<Record<DropdownType, FetcherFunction>>(
    () => ({
      pic: async () => {
        const response = await BillingService.fetchPicValues("GetPICDropDownValues");
        return response;
      },
      nationality: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "NATIONALITY");
        return response;
      },
      area: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "AREA");
        return response;
      },
      city: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CITY");
        return response;
      },
      country: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COUNTRY");
        return response;
      },
      company: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COMPANY");
        return response;
      },
      title: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "TITLE");
        return response;
      },
      gender: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "GENDER");
        return response;
      },
      ageUnit: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "AGEUNIT");
        return response;
      },
      coverFor: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COVERFOR");
        return response;
      },
      departmentTypes: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DEPARTMENTTYPES");
        return response;
      },
      bloodGroup: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "BLOODGROUP");
        return response;
      },
      maritalStatus: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "MARITALSTATUS");
        return response;
      },
      employeeRoom: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "EMPROOM");
        return response;
      },
      category: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CONCATEGORY");
        return response;
      },
      employeeStatus: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "EMPLOYEESTATUS");
        return response;
      },
      productCategory: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PRODUCTCATEGORY");
        return response;
      },
      payment: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PAYMENT");
        return response;
      },
      admissionType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "ADMISSIONTYPE");
        return response;
      },
      caseType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CASETYPE");
        return response;
      },
      statusFilter: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "STATUSFILTER");
        return response;
      },

      department: async () => {
        const response = await departmentListService.getAll();
        return (response.data || []).map((item: DepartmentDto) => ({
          value: item.deptID || 0,
          label: item.deptName || "",
          ...item,
        }));
      },
      attendingPhy: async (compID?: number) => {
        const response = await ContactMastService.fetchAttendingPhysician("GetActiveConsultants", compID!);
        return response;
      },
      primaryIntroducingSource: async (compID?: number) => {
        const response = await ContactMastService.fetchRefferalPhy("GetActiveReferralContacts", compID!);
        return response;
      },
      membershipScheme: async (compID?: number) => {
        const response = await BillingService.fetchMembershipScheme("GetActivePatMemberships", compID!);
        return response;
      },
      relation: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "RELATION");
        return response;
      },
      insurance: async () => {
        const response = await InsuranceCarrierService.fetchInsuranceOptions("GetAllActiveForDropDown");
        return response;
      },
      state: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "STATE");
        return response;
      },
      speciality: async (compID?: number) => {
        const response = await ContactListService.fetchActiveSpecialties(compID!);
        return response;
      },
      floor: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "FLOOR");
        return (response || []).map((item: any) => ({
          value: item.value || 0,
          label: item.value || "",
          id: item.id,
        }));
      },
      unit: async () => {
        const response = await deptUnitListService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.dulID || 0,
          label: item.unitDesc || "",
        }));
      },
      bedCategory: async () => {
        const response = await wardCategoryService.getAll();
        return (response.data || []).map((item: WardCategoryDto) => ({
          value: item.wCatID || 0,
          label: item.wCatName || "",
        }));
      },
      productSubGroup: async () => {
        const response = await productSubGroupService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.psGrpID || 0,
          label: item.psGrpName || "",
        }));
      },
      productGroup: async () => {
        const response = await productGroupService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.pgrpID || 0,
          label: item.pgrpName || "",
        }));
      },
      productUnit: async () => {
        const response = await productUnitService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.punitID || 0,
          label: item.punitName || "",
        }));
      },
      productBaseUnit: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PRODUCTBASEUNIT");
        return response;
      },
      medicationForm: async () => {
        const response = await medicationFormService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.mFID || 0,
          label: item.mFName || "",
        }));
      },
      medicationGeneric: async () => {
        const response = await medicationGenericService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.mGenID || 0,
          label: item.mGenName || "",
        }));
      },
      taxType: async () => {
        const response = await productTaxService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.pTaxID || 0,
          label: item.pTaxAmt || "",
          code: item.pTaxCode || "",
        }));
      },
      consultantRole: async () => {
        const response = await consultantRoleService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.crID || 0,
          label: item.crName || "",
        }));
      },
      roomGroup: async () => {
        const response = await roomGroupService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.rGrpID || 0,
          label: item.rGrpName || "",
        }));
      },
      roomList: async () => {
        const response = await roomListService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.rlID || 0,
          label: item.rName || "",
        }));
      },
      beds: async () => {
        const response = await wrBedService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.bedID || 0,
          label: item.bedName || "",
        }));
      },
      medicationDosage: async () => {
        const response = await medicationDosageService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.mdId || 0,
          label: item.mdName || "",
        }));
      },
      medicationFrequency: async () => {
        const response = await medicationFrequencyService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.mfrqId || 0,
          label: item.mfrqName || "",
        }));
      },
      medicationInstruction: async () => {
        const response = await medicationInstructionService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.minsId || 0,
          label: item.minsName || "",
        }));
      },
      dischargeStatus: async () => {
        const response = await dischargeStatusService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.dsID || 0,
          label: item.dsName || "",
        }));
      },
      dischargeSituation: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SITUATION");
        return response;
      },
      deliveryType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DELIVERYTYPE");
        return response;
      },
      investigationType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "INVESTIGATIONTYPE");
        return response;
      },
      language: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "LANGUAGE");
        return response;
      },
      entryType: async () => {
        const response = await componentEntryTypeService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.lCentID || 0,
          label: item.lCentName || "",
        }));
      },
      templateGroup: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "TEMPLATEGROUP");
        return response;
      },
      mainModules: async () => {
        const response = await appUserModuleService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.aUGrpID || 0,
          label: item.aUGrpName || "",
        }));
      },
      subModules: async () => {
        const response = await appSubModuleService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.aSubID || 0,
          label: item.aSubName || "",
          aUGrpID: item.aUGrpID || 0,
        }));
      },
      mainGroup: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "INVMAINGROUP");
        return response;
      },
      subTitle: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SUBTITLE");
        return response;
      },
      sampleType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SAMPLETYPE");
        return response;
      },
      serviceType: async () => {
        const response = await serviceTypeService.getAll();
        return (response.data || []).map((item: ServiceTypeDto) => ({
          value: item.bchID || 0,
          label: item.bchName || "",
        }));
      },
      serviceGroup: async () => {
        const response = await serviceGroupService.getAll();
        return (response.data || []).map((item: any) => ({
          value: item.sGrpID || 0,
          label: item.sGrpName || "",
        }));
      },
      departmentIndent: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DEPARTMENTINDENT");
        return response;
      },
      manufacturer: async () => {
        const contactService = new ContactService();
        const response = await contactService.getContactsForDropdown("MANUFACTURER", "", false);
        if (response.success && response.data) {
          return response.data.map((item) => ({
            value: item.conID,
            label: item.conName,
            code: item.conCode,
          }));
        }
        return [];
      },
      productLocation: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PRODUCTLOCATION");
        return response;
      },
      grnType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "GRNTYPE");
        return response;
      },
      resourceList: async () => {
        const response = await resourceListService.getAll();
        return (response.data || []).map((item: ResourceListData) => ({
          value: item.rLID || 0,
          label: item.rLName || "",
          ...item,
        }));
      },
      units: async () => {
        const response = await deptUnitListService.getAll();
        return (response.data || []).map((item: DeptUnitListDto) => ({
          value: item.dulID || 0,
          label: item.unitDesc || "",
          ...item,
        }));
      },
      appointmentConsultants: async () => {
        const response = await AppointmentService.fetchAppointmentConsultants();
        return (response.data || []).map((item) => ({
          value: item.conID || 0,
          label: item.conFName + " " + item.conLName || "",
          ...item,
        }));
      },
      usersWithoutLogin: async () => {
        const response = await getUsersWithoutCredentials();
        const users = Array.isArray(response.data) ? response.data : [];
        return users.map((user: ContactMastShortDto) => ({
          value: user.conID || 0,
          label: `${user.conTitle}. ${user.conName} (${user.conCat})` || "",
          ...user,
        }));
      },
      profiles: async () => {
        const response = await profileMastService.getAll();
        const profiles: ProfileMastDto[] = response.data || [];
        const profilesDropdownOptions: any[] = profiles.map((profile: ProfileMastDto) => ({
          value: profile.profileID,
          label: profile.profileName,
          ...profile,
        }));
        return profilesDropdownOptions;
      },
      dischargeType: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DISCHARGETYPE");
        return response;
      },
      alertCategory: async () => {
        const response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "ALERTCATEGORY");
        return response;
      },
    }),
    []
  );

  // Initialize state for required dropdowns
  useEffect(() => {
    const newStates: Partial<Record<DropdownType, DropdownState>> = {};

    requiredDropdowns.forEach((type) => {
      if (!dropdownStates[type]) {
        newStates[type] = {
          data: [],
          isLoading: false,
          error: null,
          lastFetched: null,
        };
      }
    });

    if (Object.keys(newStates).length > 0) {
      setDropdownStates((prev) => ({
        ...prev,
        ...newStates,
      }));
    }
  }, [requiredDropdowns]);

  // Check if data is stale and needs refresh
  const isDataStale = useCallback(
    (type: DropdownType): boolean => {
      const state = dropdownStates[type];
      if (!state || !state.lastFetched) return true;

      return Date.now() - state.lastFetched > mergedOptions.cacheDuration!;
    },
    [dropdownStates, mergedOptions.cacheDuration]
  );

  // Function to fetch a specific dropdown
  const fetchDropdown = useCallback(
    async (type: DropdownType) => {
      // Skip if already loading
      if (dropdownStates[type]?.isLoading) return;

      // Skip if we have valid cached data
      if (!isDataStale(type) && dropdownStates[type]?.data.length > 0) {
        return;
      }

      // Set loading state
      setDropdownStates((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          isLoading: true,
          error: null,
        },
      }));

      try {
        // Get the fetcher function for this dropdown type
        const fetcher = fetcherRegistry[type];
        if (!fetcher) {
          throw new Error(`No fetcher defined for dropdown type: ${type}`);
        }

        // Call the fetcher with compID if needed
        const response = await fetcher(compID);

        // Process the response
        let formattedData: DropdownOption[];
        if (Array.isArray(response)) {
          formattedData = response.map((item) => ({
            value: item.value,
            label: item.label,
            ...item,
          }));
        } else if (response?.data && Array.isArray(response.data)) {
          formattedData = response.data.map((item: { value?: any; id?: any; label?: string; name?: string }) => ({
            value: item.value || item.id,
            label: item.label || item.name,
            ...item,
          }));
        } else {
          formattedData = [];
        }

        // Update state with the result
        setDropdownStates((prev) => ({
          ...prev,
          [type]: {
            data: formattedData,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          },
        }));
      } catch (error) {
        console.error(`Error fetching ${type} dropdown values:`, error);

        // Update state with error
        setDropdownStates((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            isLoading: false,
            error: error instanceof Error ? error.message : "Unknown error",
            data: prev[type]?.data || [], // Keep existing data if any
          },
        }));

        // Show alert if option is enabled
        if (mergedOptions.showErrorAlerts) {
          showAlert("Error", `Failed to load ${type} dropdown. Please try again.`, "error");
        }
      }
    },
    [dropdownStates, fetcherRegistry, compID, mergedOptions.showErrorAlerts, isDataStale]
  );

  // Fetch required dropdowns on mount and when dependencies change
  useEffect(() => {
    if (!compID) return; // Skip if compID is not available

    requiredDropdowns.forEach((type) => {
      // Only fetch if auto-refresh is enabled or we don't have data yet
      if (mergedOptions.autoRefresh || !dropdownStates[type]?.data.length) {
        fetchDropdown(type);
      }
    });
  }, [requiredDropdowns, fetchDropdown, compID, mergedOptions.autoRefresh, dropdownStates]);

  // Function to refresh specific dropdowns
  const refreshDropdownValues = useCallback(
    (types?: DropdownType | DropdownType[]) => {
      // If no types specified, refresh all required dropdowns
      if (!types) {
        requiredDropdowns.forEach((type) => fetchDropdown(type));
        return;
      }

      // Otherwise, refresh only the specified types
      const typesToRefresh = Array.isArray(types) ? types : [types];
      typesToRefresh.forEach((type) => fetchDropdown(type));
    },
    [fetchDropdown, requiredDropdowns]
  );

  // Prepare data object with all dropdown values
  const dropdownValues = useMemo(() => {
    const result: Record<string, DropdownOption[]> = {};

    requiredDropdowns.forEach((type) => {
      result[type] = dropdownStates[type]?.data || [];
    });

    return result;
  }, [requiredDropdowns, dropdownStates]);

  // Define the return type to include dropdown values and utility functions
  type ReturnType = {
    [key in DropdownType]?: DropdownOption[];
  } & {
    isLoading: (type?: DropdownType) => boolean;
    isLoadingAny: boolean;
    hasError: (type?: DropdownType) => boolean;
    getError: (type: DropdownType) => string | null;
    isStale: (type: DropdownType) => boolean;
    refreshDropdownValues: (types?: DropdownType | DropdownType[]) => void;
    getDropdownStatus: (type: DropdownType) => {
      isLoading: boolean;
      hasError: boolean;
      error: string | null;
      lastFetched: number | null;
      dataCount: number;
    };
  };

  // Return values and utility functions with proper typing
  return {
    ...dropdownValues,
    isLoading: (type?: DropdownType) => (type ? dropdownStates[type]?.isLoading || false : requiredDropdowns.some((t) => dropdownStates[t]?.isLoading)),
    isLoadingAny: requiredDropdowns.some((t) => dropdownStates[t]?.isLoading),
    hasError: (type?: DropdownType) => (type ? !!dropdownStates[type]?.error : requiredDropdowns.some((t) => !!dropdownStates[t]?.error)),
    getError: (type: DropdownType) => dropdownStates[type]?.error || null,
    isStale: (type: DropdownType) => isDataStale(type),
    refreshDropdownValues,
    getDropdownStatus: (type: DropdownType) => ({
      isLoading: dropdownStates[type]?.isLoading || false,
      hasError: !!dropdownStates[type]?.error,
      error: dropdownStates[type]?.error || null,
      lastFetched: dropdownStates[type]?.lastFetched || null,
      dataCount: dropdownStates[type]?.data.length || 0,
    }),
  } as ReturnType;
};

export default useDropdownValues;
