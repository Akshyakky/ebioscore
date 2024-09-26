import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { useLoading } from "../../context/LoadingContext";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { BillingService } from "../../services/BillingServices/BillingService";
import { ConstantValues } from "../../services/CommonServices/ConstantValuesService";
import { AppModifyListService } from "../../services/CommonServices/AppModifyListService";
import { DepartmentService } from "../../services/CommonServices/DepartmentService";
import { ContactMastService } from "../../services/CommonServices/ContactMastService";
import { InsuranceCarrierService } from "../../services/CommonServices/InsuranceCarrierService";
import { ContactListService } from "../../services/HospitalAdministrationServices/ContactListService/ContactListService";
import { DeptUnitListService } from "../../services/HospitalAdministrationServices/DeptUnitListService/DeptUnitListService";
import { ServiceTypeService } from "../../services/BillingServices/ServiceTypeServices";
import { WardCategoryService } from "../../services/HospitalAdministrationServices/ContactListService/WardCategoryService/WardCategoryService";
import {
  productGroupService,
  productSubGroupService,
  productTaxService,
  productUnitService,
} from "../../services/InventoryManagementService/inventoryManagementService";
import {
  consultantRoleService,
  medicationFormService,
  medicationGenericService,
} from "../../services/ClinicalManagementServices/clinicalManagementService";

// Cache object to store API responses
const apiCache: { [key: string]: DropdownOption[] } = {};

// Type for the state object
type DropdownState = {
  [key: string]: DropdownOption[];
};

const useDropdownValues = () => {
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    picValues: [],
    titleValues: [],
    genderValues: [],
    ageUnitOptions: [],
    nationalityValues: [],
    areaValues: [],
    cityValues: [],
    countryValues: [],
    companyValues: [],
    departmentValues: [],
    attendingPhyValues: [],
    primaryIntroducingSourceValues: [],
    membershipSchemeValues: [],
    relationValues: [],
    insuranceOptions: [],
    coverForValues: [],
    departmentTypesValues: [],
    bloodGroupValues: [],
    maritalStatusValues: [],
    stateValues: [],
    categoryValues: [],
    employeeStatusValues: [],
    specialityValues: [],
    floorValues: [],
    unitValues: [],
    serviceValues: [],
    bedCategoryValues: [],
    productCategoryValues: [],
    productSubGroupValues: [],
    productGroupValues: [],
    productUnitValues: [],
    medicationFormValues: [],
    medicationGenericValues: [],
    taxTypeValue: [],
    consultantRoleValues: [],
  });

  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const compID = userInfo.compID!;

  const fetchData = async (
    key: string,
    fetchFunction: () => Promise<any>,
    dataMapper: (data: any) => DropdownOption[] = (data) => data
  ) => {
    if (apiCache[key]) {
      return apiCache[key];
    }

    const data = await fetchFunction();
    const formattedData = dataMapper(data);
    apiCache[key] = formattedData;
    return formattedData;
  };

  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        setLoading(true);

        const fetchConfigs = [
          {
            key: "picValues",
            fetch: () => BillingService.fetchPicValues("GetPICDropDownValues"),
          },
          {
            key: "titleValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PTIT"),
          },
          {
            key: "genderValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PSEX"),
          },
          {
            key: "ageUnitOptions",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PAT"),
          },
          {
            key: "nationalityValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "NATIONALITY"
              ),
          },
          {
            key: "areaValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "AREA"
              ),
          },
          {
            key: "cityValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "CITY"
              ),
          },
          {
            key: "countryValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "ACTUALCOUNTRY"
              ),
          },
          {
            key: "companyValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "COMPANY"
              ),
          },
          {
            key: "departmentValues",
            fetch: () =>
              DepartmentService.fetchDepartments(
                "GetActiveRegistrationDepartments",
                compID
              ),
          },
          {
            key: "attendingPhyValues",
            fetch: () =>
              ContactMastService.fetchAttendingPhysician(
                "GetActiveConsultants",
                compID
              ),
          },
          {
            key: "primaryIntroducingSourceValues",
            fetch: () =>
              ContactMastService.fetchRefferalPhy(
                "GetActiveReferralContacts",
                compID
              ),
          },
          {
            key: "membershipSchemeValues",
            fetch: () =>
              BillingService.fetchMembershipScheme(
                "GetActivePatMemberships",
                compID
              ),
          },
          {
            key: "relationValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "RELATION"
              ),
          },
          {
            key: "insuranceOptions",
            fetch: () =>
              InsuranceCarrierService.fetchInsuranceOptions(
                "GetAllActiveForDropDown"
              ),
          },
          {
            key: "coverForValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "COVR"),
          },
          {
            key: "departmentTypesValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "DTYP"),
          },
          {
            key: "bloodGroupValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PBLD"),
          },
          {
            key: "maritalStatusValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PMAR"),
          },
          {
            key: "stateValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "STATE"
              ),
          },
          {
            key: "categoryValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "ACAT"),
          },
          {
            key: "employeeStatusValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "EMPS"),
          },
          {
            key: "specialityValues",
            fetch: () => ContactListService.fetchActiveSpecialties(compID),
          },
          {
            key: "floorValues",
            fetch: () =>
              AppModifyListService.fetchAppModifyList(
                "GetActiveAppModifyFieldsAsync",
                "FLOOR"
              ),
          },
          {
            key: "unitValues",
            fetch: () => DeptUnitListService.getAllDeptUnitList(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.dulID || 0,
                label: item.unitDesc || "",
              })),
          },
          {
            key: "serviceValues",
            fetch: () => ServiceTypeService.getAllServiceType(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.bchID || 0,
                label: item.bchName || "",
              })),
          },
          {
            key: "bedCategoryValues",
            fetch: () => WardCategoryService.getAllWardCategory(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.wCatID || 0,
                label: item.wCatName || "",
              })),
          },
          {
            key: "productCategoryValues",
            fetch: () =>
              ConstantValues.fetchConstantValues("GetConstantValues", "PMED"),
          },
          {
            key: "productSubGroupValues",
            fetch: () => productSubGroupService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.psGrpID || 0,
                label: item.psGrpName || "",
              })),
          },
          {
            key: "productGroupValues",
            fetch: () => productGroupService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.pgrpID || 0,
                label: item.pgrpName || "",
              })),
          },
          {
            key: "productUnitValues",
            fetch: () => productUnitService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.punitID || 0,
                label: item.punitName || "",
              })),
          },
          {
            key: "medicationFormValues",
            fetch: () => medicationFormService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.mFID || 0,
                label: item.mFName || "",
              })),
          },
          {
            key: "medicationGenericValues",
            fetch: () => medicationGenericService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.mGenID || 0,
                label: item.mGenName || "",
              })),
          },
          {
            key: "taxTypeValue",
            fetch: () => productTaxService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.pTaxID || 0,
                label: item.pTaxAmt || "",
              })),
          },
          {
            key: "consultantRoleValues",
            fetch: () => consultantRoleService.getAll(),
            dataMapper: (data: any) =>
              (data.data || []).map((item: any) => ({
                value: item.crID || 0,
                label: item.crName || "",
              })),
          },
        ];

        const results = await Promise.all(
          fetchConfigs.map(
            ({
              key,
              fetch,
              dataMapper = (data: any) =>
                data.map((item: any) => ({
                  value: item.value,
                  label: item.label,
                })),
            }) => fetchData(key, fetch, dataMapper)
          )
        );

        const newState = fetchConfigs.reduce((acc, { key }, index) => {
          acc[key] = results[index];
          return acc;
        }, {} as DropdownState);

        setDropdownState(newState);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownValues();
  }, [compID, setLoading]);

  return useMemo(() => dropdownState, [dropdownState]);
};

export default useDropdownValues;
