import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/reducers";
import { useLoading } from "../../context/LoadingContext";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { BillingService } from "../../services/BillingServices/BillingService";
import { ConstantValues } from "../../services/CommonServices/ConstantValuesService";
import { AppModifyListService } from "../../services/CommonServices/AppModifyListService";
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
import {
  roomGroupService,
  roomListService,
  wardCategoryService,
} from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { WardCategoryDto } from "../../interfaces/HospitalAdministration/WardCategoryDto";
import { departmentService } from "../../services/CommonServices/CommonModelServices";
import { DepartmentDto } from "../../interfaces/Billing/DepartmentDto";

const useDropdownValues = () => {
  const [picValues, setPicValues] = useState<DropdownOption[]>([]);
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const [genderValues, setGenderValues] = useState<DropdownOption[]>([]);
  const [ageUnitOptions, setAgeValues] = useState<DropdownOption[]>([]);
  const [nationalityValues, setNationalityValues] = useState<DropdownOption[]>(
    []
  );
  const [areaValues, setAreaValues] = useState<DropdownOption[]>([]);
  const [cityValues, setCityValues] = useState<DropdownOption[]>([]);
  const [countryValues, setCountryValues] = useState<DropdownOption[]>([]);
  const [companyValues, setCompanyValues] = useState<DropdownOption[]>([]);
  const [departmentValues, setDepartmentValues] = useState<DropdownOption[]>(
    []
  );
  const [attendingPhyValues, setAttendingPhyValues] = useState<
    DropdownOption[]
  >([]);
  const [primaryIntroducingSourceValues, setPrimaryIntroducingSourceValues] =
    useState<DropdownOption[]>([]);
  const [membershipSchemeValues, setMembershipSchemeValues] = useState<
    DropdownOption[]
  >([]);
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [insuranceOptions, setInsuranceOptions] = useState<DropdownOption[]>(
    []
  );
  const [coverForValues, setCoverForValues] = useState<DropdownOption[]>([]);
  const [departmentTypesValues, setDepartmentTypesValues] = useState<
    DropdownOption[]
  >([]);
  const [bloodGroupValues, setBloodGroupValues] = useState<DropdownOption[]>(
    []
  );
  const [maritalStatusValues, setmaritalStatusValues] = useState<
    DropdownOption[]
  >([]);
  const [stateValues, setstateValues] = useState<DropdownOption[]>([]);
  const [categoryValues, setcategoryValues] = useState<DropdownOption[]>([]);
  const [employeeStatusValues, setemployeeStatusValues] = useState<
    DropdownOption[]
  >([]);
  const [specialityValues, setspecialityValues] = useState<DropdownOption[]>(
    []
  );

  const [floorValues, setFloorValues] = useState<DropdownOption[]>([]);
  const [unitValues, setUnitValues] = useState<any[]>([]);
  const [serviceValues, setServiceValues] = useState<any[]>([]);
  const [bedCategoryValues, setBedCategoryValues] = useState<any[]>([]);
  const [productCategoryValues, setProductBedCategoryValues] = useState<any[]>(
    []
  );
  const [productSubGroupValues, setProductSubGroupValues] = useState<any[]>([]);
  const [productGroupValues, setProductGroupValues] = useState<any[]>([]);
  const [productUnitValues, setProductUnitValues] = useState<any[]>([]);
  const [medicationFormValues, setMedicationFormValues] = useState<any[]>([]);
  const [medicationGenericValues, setMedicationGenericValues] = useState<any[]>(
    []
  );
  const [taxTypeValue, setTaxTypeValue] = useState<any[]>([]);
  const [consultantRoleValues, setConsultantRoleValues] = useState<any[]>([]);
  const [roomGroupValues, setroomGroupValues] = useState<any[]>([]);
  const [roomListValues, setroomListValues] = useState<any[]>([]);
  const [paymentValues, setPaymentValues] = useState<any[]>([]);

  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const compID = userInfo.compID!;

  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        setLoading(true);
        const [
          picResponse,
          titleResponse,
          genderResponse,
          ageResponse,
          nationalityResponse,
          areaResponse,
          cityResponse,
          countryResponse,
          companyResponse,
          departmentResponse,
          attendingPhyResponse,
          primaryIntroducingSourceResponse,
          membershipSchemeResponse,
          relationResponse,
          insuranceResponse,
          coverForResponse,
          departmentTypesResponse,
          bloodGroupResponse,
          maritalStatusResponse,
          stateResponse,
          categoryResponse,
          employeeStatusResponse,
          specialityResponse,
          floorResponse,
          unitResponse,
          serviceTypeResponse,
          categoryTypeResponse,
          productCategoryTypeResponse,
          productSubGroupTypeResponse,
          productGroupTypeResponse,
          productUnitTypeResponse,
          medicationFormTypeResponse,
          medicationGenericTypeResponse,
          taxTypeResponse,
          consultantRoleResponse,
          roomGroupResponse,
          roomListResponse,
          paymentValueResponse,
        ] = await Promise.all([
          BillingService.fetchPicValues("GetPICDropDownValues"),
          ConstantValues.fetchConstantValues("GetConstantValues", "PTIT"),
          ConstantValues.fetchConstantValues("GetConstantValues", "PSEX"),
          ConstantValues.fetchConstantValues("GetConstantValues", "PAT"),

          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "NATIONALITY"
          ),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "AREA"
          ),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "CITY"
          ),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "ACTUALCOUNTRY"
          ),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "COMPANY"
          ),

          departmentService.getAll(),
          ContactMastService.fetchAttendingPhysician(
            "GetActiveConsultants",
            compID
          ),
          ContactMastService.fetchRefferalPhy(
            "GetActiveReferralContacts",
            compID
          ),
          BillingService.fetchMembershipScheme(
            "GetActivePatMemberships",
            compID
          ),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "RELATION"
          ),
          InsuranceCarrierService.fetchInsuranceOptions(
            "GetAllActiveForDropDown"
          ),
          ConstantValues.fetchConstantValues("GetConstantValues", "COVR"),
          ConstantValues.fetchConstantValues("GetConstantValues", "DTYP"),
          ConstantValues.fetchConstantValues("GetConstantValues", "PBLD"),
          ConstantValues.fetchConstantValues("GetConstantValues", "PMAR"),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "STATE"
          ),
          ConstantValues.fetchConstantValues("GetConstantValues", "ACAT"),
          ConstantValues.fetchConstantValues("GetConstantValues", "EMPS"),
          ContactListService.fetchActiveSpecialties(compID!),
          AppModifyListService.fetchAppModifyList(
            "GetActiveAppModifyFieldsAsync",
            "FLOOR"
          ),
          DeptUnitListService.getAllDeptUnitList(),
          ServiceTypeService.getAllServiceType(),
          wardCategoryService.getAll(),
          ConstantValues.fetchConstantValues("GetConstantValues", "PMED"),
          productSubGroupService.getAll(),
          productGroupService.getAll(),
          productUnitService.getAll(),
          medicationFormService.getAll(),
          medicationGenericService.getAll(),
          productTaxService.getAll(),
          consultantRoleService.getAll(),
          roomGroupService.getAll(),
          roomListService.getAll(),
          ConstantValues.fetchConstantValues("GetConstantValues", "PAYT"),
        ]);

        setPicValues(
          picResponse.map((item) => ({ value: item.value, label: item.label }))
        );
        setTitleValues(
          titleResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setGenderValues(
          genderResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setAgeValues(
          ageResponse.map((item) => ({ value: item.value, label: item.label }))
        );
        setNationalityValues(
          nationalityResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setAreaValues(
          areaResponse.map((item) => ({ value: item.value, label: item.label }))
        );
        setCityValues(
          cityResponse.map((item) => ({ value: item.value, label: item.label }))
        );
        setCountryValues(
          countryResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setCompanyValues(
          companyResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );

        setDepartmentValues(
          (departmentResponse.data || []).map((item: DepartmentDto) => ({
            value: item.deptID || 0,
            label: item.deptName || "",
          }))
        );

        // setDepartmentValues(
        //   departmentResponse.map((item: DepartmentDto) => ({
        //     value: item.deptID,
        //     label: item.deptName,
        //   }))
        // );
        setAttendingPhyValues(
          attendingPhyResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setPrimaryIntroducingSourceValues(
          primaryIntroducingSourceResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setMembershipSchemeValues(
          membershipSchemeResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setRelationValues(
          relationResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setInsuranceOptions(
          insuranceResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setCoverForValues(
          coverForResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setDepartmentTypesValues(
          departmentTypesResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setBloodGroupValues(
          bloodGroupResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setmaritalStatusValues(
          maritalStatusResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setstateValues(
          stateResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setcategoryValues(
          categoryResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setemployeeStatusValues(
          employeeStatusResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setspecialityValues(
          specialityResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setFloorValues(
          floorResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setUnitValues(
          (unitResponse.data || []).map((item) => ({
            value: item.dulID || 0,
            label: item.unitDesc || "",
          }))
        );

        setServiceValues(
          (serviceTypeResponse.data || []).map((item) => ({
            value: item.bchID || 0,
            label: item.bchName || "",
          }))
        );

        setBedCategoryValues(
          (categoryTypeResponse.data || []).map((item: WardCategoryDto) => ({
            value: item.wCatID || 0,
            label: item.wCatName || "",
          }))
        );

        setProductBedCategoryValues(
          productCategoryTypeResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
        setProductSubGroupValues(
          (productSubGroupTypeResponse.data || []).map((item: any) => ({
            value: item.psGrpID || 0,
            label: item.psGrpName || "",
          }))
        );
        setProductGroupValues(
          (productGroupTypeResponse.data || []).map((item: any) => ({
            value: item.pgrpID || 0,
            label: item.pgrpName || "",
          }))
        );
        setProductUnitValues(
          (productUnitTypeResponse.data || []).map((item: any) => ({
            value: item.punitID || 0,
            label: item.punitName || "",
          }))
        );
        setMedicationFormValues(
          (medicationFormTypeResponse.data || []).map((item: any) => ({
            value: item.mFID || 0,
            label: item.mFName || "",
          }))
        );
        setMedicationGenericValues(
          (medicationGenericTypeResponse.data || []).map((item: any) => ({
            value: item.mGenID || 0,
            label: item.mGenName || "",
          }))
        );
        setTaxTypeValue(
          (taxTypeResponse.data || []).map((item: any) => ({
            value: item.pTaxID || 0,
            label: item.pTaxAmt || "",
          }))
        );
        setConsultantRoleValues(
          (consultantRoleResponse.data || []).map((item: any) => ({
            value: item.crID || 0,
            label: item.crName || "",
          }))
        );
        setroomGroupValues(
          (roomGroupResponse.data || []).map((item: any) => ({
            value: item.rGrpID || 0,
            label: item.rGrpName || "",
          }))
        );
        setroomListValues(
          (roomListResponse.data || []).map((item: any) => ({
            value: item.rlID || 0,
            label: item.rName || "",
          }))
        );

        setPaymentValues(
          paymentValueResponse.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        );
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownValues();
  }, [compID]);

  return {
    picValues,
    titleValues,
    genderValues,
    ageUnitOptions,
    nationalityValues,
    areaValues,
    cityValues,
    countryValues,
    companyValues,
    departmentValues,
    attendingPhyValues,
    primaryIntroducingSourceValues,
    membershipSchemeValues,
    relationValues,
    insuranceOptions,
    coverForValues,
    departmentTypesValues,
    bloodGroupValues,
    maritalStatusValues,
    stateValues,
    categoryValues,
    employeeStatusValues,
    specialityValues,
    floorValues,
    unitValues,
    serviceValues,
    bedCategoryValues,
    productCategoryValues,
    productSubGroupValues,
    productGroupValues,
    productUnitValues,
    medicationFormValues,
    medicationGenericValues,
    taxTypeValue,
    consultantRoleValues,
    roomGroupValues,
    roomListValues,
    paymentValues,
  };
};

export default useDropdownValues;
