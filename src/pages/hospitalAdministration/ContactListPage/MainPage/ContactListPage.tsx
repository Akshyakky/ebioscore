import React, { useEffect, useState, useCallback, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import { useLoading } from "../../../../context/LoadingContext";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { RootState } from "../../../../store/reducers";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import { DepartmentService } from "../../../../services/CommonServices/DepartmentService";
import { ContactListService } from "../../../../services/HospitalAdministrationServices/ContactListService/ContactListService";
import { ContactListData } from "../../../../interfaces/HospitalAdministration/ContactListData";
import ContactListSearch from "../../CommonPage/AdvanceSearch/ContactListSearch";
import { ContactListSearchContext } from "../../../../context/hospitalAdministration/ContactListSearchContext";
import ContactListForm from "../SubPage/ContactListForm";

const ContactListPage: React.FC = () => {
  const { token, compID, userID, userName, compCode, compName } = useSelector(
    (state: RootState) => state.userDetails
  );

  const [dropdownValues, setDropdownValues] = useState({
    titleOptions: [] as DropdownOption[],
    genderOptions: [] as DropdownOption[],
    bloodGroupOptions: [] as DropdownOption[],
    maritalStatusOptions: [] as DropdownOption[],
    cityOptions: [] as DropdownOption[],
    stateOptions: [] as DropdownOption[],
    nationalityOptions: [] as DropdownOption[],
    categoryOptions: [] as DropdownOption[],
    departmentOptions: [] as DropdownOption[],
    employeeStatusOptions: [] as DropdownOption[],
    specialityOptions: [] as DropdownOption[],
  });

  const [contactList, setContactList] = useState<ContactListData>(
    getInitialContactListState(userID!, userName!, compID!, compCode!, compName!)
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { performSearch } = useContext(ContactListSearchContext);
  const { setLoading } = useLoading();

  const [switchStates, setSwitchStates] = useState({
    isEmployee: false,
    isReferral: false,
    isAppointment: false,
    isSuperSpeciality: false,
    isUserRequired: false,
    isAuthorisedUser: false,
    isContract: false,
  });

  const loadDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      const [
        categoryValues,
        refCategoryValues,
        titleValues,
        genderValues,
        bloodGroupValues,
        maritalStatusValues,
        cityValues,
        stateValues,
        nationalityValues,
        departmentValues,
        employeeStatusValues,
        specialityValues,
      ] = await Promise.all([
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "ACAT"),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "REFS"),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "PTIT"),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "PSEX"),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "PBLD"),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "PMAR"),
        AppModifyListService.fetchAppModifyList(
          token!,
          "GetActiveAppModifyFieldsAsync",
          "CITY"
        ),
        AppModifyListService.fetchAppModifyList(
          token!,
          "GetActiveAppModifyFieldsAsync",
          "STATE"
        ),
        AppModifyListService.fetchAppModifyList(
          token!,
          "GetActiveAppModifyFieldsAsync",
          "NATIONALITY"
        ),
        DepartmentService.fetchDepartments(
          token!,
          "GetActiveWardDepartments",
          compID!
        ),
        ConstantValues.fetchConstantValues(token!, "GetConstantValues", "EMPS"),
        ContactListService.fetchActiveSpecialties(token!, compID!),
      ]);

      setDropdownValues({
        titleOptions: titleValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        genderOptions: genderValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        bloodGroupOptions: bloodGroupValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        maritalStatusOptions: maritalStatusValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        cityOptions: cityValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        stateOptions: stateValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        nationalityOptions: nationalityValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        categoryOptions: [...categoryValues, ...refCategoryValues].map(
          (item) => ({ value: item.value, label: item.label })
        ),
        departmentOptions: departmentValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        employeeStatusOptions: employeeStatusValues.map((item) => ({
          value: item.value,
          label: item.label,
        })),
        specialityOptions: specialityValues,
      });
    } catch (error) {
      console.error("Error loading dropdown values:", error);
    } finally {
      setLoading(false);
    }
  }, [token, compID]);

  useEffect(() => {
    loadDropdownValues();
  }, [loadDropdownValues]);

  const handleAdvancedSearch = async () => {
    setIsSearchOpen(true);
    await performSearch("");
  };

  const handleEditContactList = async (conID: number) => {
    setLoading(true);
    try {
      const contactDetails = await ContactListService.fetchContactDetails(token!, conID);
      if (
        contactDetails &&
        contactDetails.contactMastDto &&
        contactDetails.contactAddressDto && contactDetails.contactDetailsDto
      ) {
        setContactList(contactDetails);
        setSwitchStates({
          isEmployee: contactDetails.contactMastDto.isEmployeeYN === "Y",
          isReferral: contactDetails.contactMastDto.isRefferalYN === "Y",
          isAppointment: contactDetails.contactMastDto.isAppointmentYN === "Y",
          isSuperSpeciality: contactDetails.contactMastDto.isSuperSpecialtyYN === "Y",
          isUserRequired: contactDetails.contactMastDto.isUserRequiredYN === "Y",
          isAuthorisedUser: contactDetails.contactMastDto.isAuthorizedUserYN === "Y",
          isContract: contactDetails.contactMastDto.isContractYN === "Y",
        });
      } else {
        throw new Error("Invalid contact details structure");
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
    } finally {
      setLoading(false);
      setIsSearchOpen(false);
    }
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <ContactListForm
            dropdownValues={dropdownValues}
            contactList={contactList}
            setContactList={setContactList}
            switchStates={switchStates}
            setSwitchStates={setSwitchStates}
          />
        </Paper>
      </Container>
      <ContactListSearch
        show={isSearchOpen}
        handleClose={() => setIsSearchOpen(false)}
        onEditContactList={handleEditContactList}
      />
    </>
  );
};

export default ContactListPage;

function getInitialContactListState(
  userID: number,
  userName: string,
  compID: number,
  compCode: string,
  compName: string
): ContactListData {
  const today = new Date().toISOString().split("T")[0];
  return {
    contactMastDto: {
      conID: 0,
      conCode: "",
      conTitle: "",
      conFName: "",
      conLName: "",
      conMName: "",
      conDob: today,
      conGender: "",
      conSSNID: "",
      conBldGrp: "",
      conCat: "",
      consValue: "",
      conEmpYN: "N",
      rActiveYN: "Y",
      rCreatedOn: today,
      rCreatedID: userID,
      rCreatedBy: userName,
      rModifiedOn: today,
      rModifiedID: userID,
      rModifiedBy: userName,
      compID: compID,
      compCode: compCode,
      compName: compName,
      notes: "",
      conEmpStatus: "",
      allergicToAllergence: "",
      allergicToMedicine: "",
      aPHYRMID: 0,
      aPhyRoomName: "",
      deptID: 0,
      deptName: "",
      designation: "",
      emergenContactName: "",
      iPP: 0,
      oPP: 0,
      isAuthorizedUserYN: "N",
      isContractYN: "N",
      isSuperSpecialtyYN: "N",
      isEmployeeYN: "N",
      isRefferalYN: "N",
      isAppointmentYN: "N",
      isUserRequiredYN: "N",
      maritalStatus: "",
      tINNo: "",
      accCode: "",
      accPayCode: "",
      gESYCode: "",
      digSignPath: "",
      stampPath: "",
      payPolicy: 0,
      transferYN: "N",
    },
    contactAddressDto: {
      cAddID: 0,
      conID: 0,
      conCode: "",
      cAddType: "",
      cAddMail: "N",
      cAddPostCode: "",
      cAddPSSID: "",
      compID: compID,
      compCode: compCode,
      compName: compName,
      cAddCity: "",
      cAddCountry: "",
      cAddEmail: "",
      cAddPhone1: "",
      cAddPhone2: "",
      cAddPhone3: "",
      cAddState: "",
      cAddStreet: "",
      cAddStreet1: "",
      transferYN: "N",
    },
    contactDetailsDto: []
  };
}
