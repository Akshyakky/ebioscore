import { useState, useEffect, useCallback } from "react";
import { RootState } from "@/store";

import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { BillingService } from "@/services/BillingServices/BillingService";
import { AppModifyListService } from "@/services/CommonServices/AppModifyListService";
import { departmentService } from "@/services/CommonServices/CommonModelServices";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { ContactMastService } from "@/services/CommonServices/ContactMastService";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { ContactListService } from "@/services/HospitalAdministrationServices/ContactListService/ContactListService";
import { DeptUnitListService } from "@/services/HospitalAdministrationServices/DeptUnitListService/DeptUnitListService";
// import { ServiceTypeService } from "@/services/BillingServices/ServiceTypeServices";
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
import { appSubModuleService, appUserModuleService } from "@/services/SecurityManagementServices/securityManagementServices";
import { serviceTypeService } from "@/services/BillingServices/BillingGenericService";
import { ServiceTypeDto } from "@/interfaces/Billing/BChargeDetails";

type DropdownType =
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
  | "service"
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
  | "chargeType"
  | "serviceType";

const useDropdownValues = (requiredDropdowns: DropdownType[]) => {
  const [dropdownValues, setDropdownValues] = useState<Record<DropdownType, DropdownOption[]>>({} as Record<DropdownType, DropdownOption[]>);
  const { setLoading } = useLoading();
  const userInfo = useAppSelector((state: RootState) => state.auth);
  const compID = userInfo.compID!;

  const fetchDropdownValues = useCallback(
    async (type: DropdownType) => {
      try {
        setLoading(true);
        let response;
        switch (type) {
          case "pic":
            response = await BillingService.fetchPicValues("GetPICDropDownValues");
            break;
          case "nationality":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "NATIONALITY");
            break;
          case "area":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "AREA");
            break;
          case "city":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CITY");
            break;
          case "country":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COUNTRY");
            break;
          case "company":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COMPANY");
            break;
          case "title":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "TITLE");
            break;
          case "gender":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "GENDER");
            break;
          case "ageUnit":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "AGEUNITS");
            break;

          case "coverFor":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "COVERFOR");
            break;

          case "departmentTypes":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DEPARTMENTTYPES");
            break;

          case "bloodGroup":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "BLOODGROUP");
            break;

          case "maritalStatus":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "MARITALSTATUS");
            break;

          case "category":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CATEGORY");
            break;

          case "employeeStatus":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "EMPLOYEESTATUS");
            console.log("employeeStatus", response);
            break;

          case "productCategory":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PRODUCTCATEGORY");
            break;

          case "payment":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "PAYMENT");
            break;

          case "admissionType":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "ADMISSIONTYPE");
            break;

          case "caseType":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "CASETYPE");
            break;

          case "department":
            response = await departmentService.getAll();
            response = (response.data || []).map((item: DepartmentDto) => ({
              value: item.deptID || 0,
              label: item.deptName || "",
              ...item,
            }));
            break;
          case "attendingPhy":
            response = await ContactMastService.fetchAttendingPhysician("GetActiveConsultants", compID);
            break;
          case "primaryIntroducingSource":
            response = await ContactMastService.fetchRefferalPhy("GetActiveReferralContacts", compID);
            break;
          case "membershipScheme":
            response = await BillingService.fetchMembershipScheme("GetActivePatMemberships", compID);
            break;
          case "relation":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "RELATION");
            break;
          case "insurance":
            response = await InsuranceCarrierService.fetchInsuranceOptions("GetAllActiveForDropDown");
            break;
          case "state":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "STATE");
            break;
          case "speciality":
            response = await ContactListService.fetchActiveSpecialties(compID);
            break;
          case "floor":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "FLOOR");
            break;
          case "unit":
            response = await DeptUnitListService.getAllDeptUnitList();
            response = (response.data || []).map((item: any) => ({
              value: item.dulID || 0,
              label: item.unitDesc || "",
            }));
            break;
          case "service":
            response = await serviceTypeService.getAll();
            response = (response.data || []).map((item: ServiceTypeDto) => ({
              value: item.bchID || 0,
              label: item.bchName || "",
              isLabYN: item.isLabYN, // Add this line to include isLabYN in the mapped data
            }));

            break;
          case "bedCategory":
            response = await wardCategoryService.getAll();
            response = (response.data || []).map((item: WardCategoryDto) => ({
              value: item.wCatID || 0,
              label: item.wCatName || "",
            }));
            break;
          case "productSubGroup":
            response = await productSubGroupService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.psGrpID || 0,
              label: item.psGrpName || "",
            }));
            break;
          case "productGroup":
            response = await productGroupService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.pgrpID || 0,
              label: item.pgrpName || "",
            }));
            break;
          case "productUnit":
            response = await productUnitService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.punitID || 0,
              label: item.punitName || "",
            }));
            break;
          case "medicationForm":
            response = await medicationFormService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.mFID || 0,
              label: item.mFName || "",
            }));
            break;
          case "medicationGeneric":
            response = await medicationGenericService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.mGenID || 0,
              label: item.mGenName || "",
            }));
            break;
          case "taxType":
            response = await productTaxService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.pTaxID || 0,
              label: item.pTaxAmt || "",
            }));
            break;
          case "consultantRole":
            response = await consultantRoleService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.crID || 0,
              label: item.crName || "",
            }));
            break;
          case "roomGroup":
            response = await roomGroupService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.rGrpID || 0,
              label: item.rGrpName || "",
            }));
            break;
          case "roomList":
            response = await roomListService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.rlID || 0,
              label: item.rName || "",
            }));
            break;

          case "beds":
            response = await wrBedService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.bedID || 0,
              label: item.bedName || "",
            }));
            break;
          case "medicationDosage":
            response = await medicationDosageService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.mdId || 0,
              label: item.mdName || "",
            }));
            break;
          case "medicationFrequency":
            response = await medicationFrequencyService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.mfrqId || 0,
              label: item.mfrqName || "",
            }));
            break;
          case "medicationInstruction":
            response = await medicationInstructionService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.minsId || 0,
              label: item.minsName || "",
            }));
            break;
          case "dischargeStatus":
            response = await dischargeStatusService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.dsID || 0,
              label: item.dsName || "",
            }));
            break;
          case "dischargeSituation":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SITUATION");
            break;
          case "deliveryType":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "DELIVERYTYPE");
            break;
          case "investigationType":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "INVESTIGATIONTYPE");
            break;
          case "language":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "LANGUAGE");
            break;
          case "entryType":
            response = await componentEntryTypeService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.lCentID || 0,
              label: item.lCentName || "",
            }));
            break;
          case "templateGroup":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "TEMPLATEGROUP");
            break;

          case "mainModules":
            response = await appUserModuleService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.aUGrpID || 0,
              label: item.aUGrpName || "",
            }));
            break;
          case "subModules":
            response = await appSubModuleService.getAll();
            response = (response.data || []).map((item: any) => ({
              value: item.aSubID || 0,
              label: item.aSubName || "",
              aUGrpID: item.aUGrpID || 0,
            }));
            break;
          case "mainGroup":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "MAINMODULE");
            break;
          case "subTitle":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SUBTITLE");
            break;
          case "sampleType":
            response = await AppModifyListService.fetchAppModifyList("GetActiveAppModifyFieldsAsync", "SAMPLETYPE");
            break;

          case "serviceType":
            response = await serviceTypeService.getAll();
            response = (response.data || []).map((item: ServiceTypeDto) => ({
              value: item.bchID || 0,
              label: item.bchName || "",
            }));
            break;

          default:
            throw new Error(`Unsupported dropdown type: ${type}`);
        }
        setDropdownValues((prev) => ({
          ...prev,
          [type]: response.map((item: any) => ({
            value: item.value,
            label: item.label,
            ...item,
          })),
        }));
      } catch (error) {
        console.error(`Error fetching ${type} dropdown values:`, error);
      } finally {
        setLoading(false);
      }
    },
    [compID]
  );

  useEffect(() => {
    requiredDropdowns.forEach((type) => {
      if (!dropdownValues[type]) {
        fetchDropdownValues(type);
      }
    });
  }, [requiredDropdowns, fetchDropdownValues, dropdownValues]);

  return dropdownValues;
};

export default useDropdownValues;
