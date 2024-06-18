import React, { useEffect, useState, useCallback, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useSelector } from "react-redux";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import TextArea from "../../../../components/TextArea/TextArea";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import MultiSelectDropdown from "../../../../components/DropDown/MultiSelectDropdown";
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
import useDropdownChange from "../../../../hooks/useDropdownChange";

interface ValidationErrors {
  [key: string]: string[];
}

const ContactListPage: React.FC = () => {
  const { token, compID, userID, userName, compCode, compName } = useSelector(
    (state: RootState) => state.userDetails
  );

  const initialSwitchStates = {
    isEmployee: false,
    isReferral: false,
    isAppointment: false,
    isSuperSpeciality: false,
    isUserRequired: false,
    isAuthorisedUser: false,
    isContract: false,
  };

  const getInitialContactListState = (): ContactListData => ({
    contactMastDto: {
      conID: 0,
      conCode: "",
      conTitle: "",
      conFName: "",
      conLName: "",
      conMName: "",
      conDob: new Date().toISOString().split("T")[0],
      conGender: "",
      conSSNID: "",
      conBldGrp: "",
      conCat: "",
      consValue: "",
      conEmpYN: "N",
      rActiveYN: "Y",
      rCreatedOn: new Date().toISOString().split("T")[0],
      rCreatedID: userID!,
      rCreatedBy: userName!,
      rModifiedOn: new Date().toISOString().split("T")[0],
      rModifiedID: userID!,
      rModifiedBy: userName!,
      compID: compID!,
      compCode: compCode!,
      compName: compName!,
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
      compID: 0,
      compCode: "",
      compName: "",
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
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [switchStates, setSwitchStates] = useState(initialSwitchStates);
  const today = new Date().toISOString().split("T")[0];
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
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
    getInitialContactListState()
  );
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>(
    []
  );
  const { setLoading } = useLoading();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { performSearch } = useContext(ContactListSearchContext);
  const { handleDropdownChange } =
    useDropdownChange<ContactListData>(setContactList);

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
  }, [token, compID, setLoading]);

  useEffect(() => {
    loadDropdownValues();
  }, [loadDropdownValues]);

  useEffect(() => {
    if (contactList.contactAddressDto.conCode) {
      setContactList((prev) => ({
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          conCode: prev.contactAddressDto.conCode,
        },
      }));
    }
  }, [contactList.contactAddressDto.conCode]);

  const handleAdvancedSearch = async () => {
    setIsSearchOpen(true);
    await performSearch("");
  };

  const handleEditContactList = async (conID: number) => {
    setLoading(true);
    try {
      const contactDetails = await ContactListService.fetchContactDetails(
        token!,
        conID
      );
      if (
        contactDetails &&
        contactDetails.contactMastDto &&
        contactDetails.contactAddressDto
      ) {
        setContactList(contactDetails);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactList((prev) => {
      // Check if the field belongs to ContactAddressDto
      if (name in prev.contactAddressDto) {
        // Additional handling for cAddEmail
        if (name === "cAddEmail") {
          return {
            ...prev,
            contactAddressDto: {
              ...prev.contactAddressDto,
              [name]: value,
              cAddMail: validateEmail(value) ? "Y" : "N",
            },
          };
        }
        return {
          ...prev,
          contactAddressDto: {
            ...prev.contactAddressDto,
            [name]: value,
          },
        };
      }
      // Additional handling for conCode
      if (name === "conCode") {
        return {
          ...prev,
          contactMastDto: {
            ...prev.contactMastDto,
            [name]: value,
          },
          contactAddressDto: {
            ...prev.contactAddressDto,
            conCode: value,
          },
        };
      }
      // Otherwise, update ContactMastDto
      return {
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          [name]: value,
        },
      };
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSwitchChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checkedValue = event.target.checked ? "Y" : "N";
      setSwitchStates((prev) => ({
        ...prev,
        [name]: event.target.checked,
      }));
      setContactList((prev) => ({
        ...prev,
        contactMastDto: {
          ...prev.contactMastDto,
          [`${name}YN`]: checkedValue,
        },
        contactAddressDto:
          name === "isEmployee" || name === "isAuthorisedUser"
            ? {
                ...prev.contactAddressDto,
                [`${name}YN`]: checkedValue,
              }
            : prev.contactAddressDto,
      }));
    };

  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      const result = await ContactListService.saveContactList(
        token!,
        contactList
      );
      if (result.success) {
        console.log("Contact list saved successfully:", result.data);
        alert("Contact list saved successfully");
        handleClear();
      } else {
        setValidationErrors(result.validationErrors || {});
        console.error("Failed to save contact list:", result);
      }
    } catch (error) {
      console.error("Error saving contact list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setContactList(getInitialContactListState());
    setSwitchStates(initialSwitchStates);
    setSelectedSpecialities([]);
    setIsSubmitted(false);
    setValidationErrors({});
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
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <section>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Code"
                  ControlID="txtCode"
                  placeholder="Code"
                  type="text"
                  size="small"
                  name="conCode"
                  value={contactList.contactAddressDto.conCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                  isMandatory
                />
                {validationErrors["contactMastDto.conCode"] && (
                  <span style={{ color: "red" }}>
                    {validationErrors["contactMastDto.conCode"]}
                  </span>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conCat"
                  label="Category"
                  value={contactList.contactMastDto.consValue}
                  options={dropdownValues.categoryOptions}
                  onChange={handleDropdownChange(
                    ["contactMastDto", "consValue"],
                    ["contactMastDto", "conCat"],
                    dropdownValues.categoryOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="deptID"
                  label="Department"
                  value={
                    contactList.contactMastDto.deptID === 0
                      ? ""
                      : String(contactList.contactMastDto.deptID)
                  }
                  options={dropdownValues.departmentOptions}
                  onChange={handleDropdownChange(
                    ["contactMastDto", "deptID"],
                    ["contactMastDto", "deptName"],
                    dropdownValues.departmentOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              {contactList.contactMastDto.consValue === "PHY" && (
                <Grid item xs={12} sm={6} md={3}>
                  <MultiSelectDropdown
                    label="Speciality"
                    name="selectedSpecialities"
                    value={selectedSpecialities}
                    defaultText="Select Specialities"
                    options={dropdownValues.specialityOptions}
                    onChange={(e) =>
                      setSelectedSpecialities(e.target.value as string[])
                    }
                    size="small"
                    multiple
                    isMandatory
                    isSubmitted={isSubmitted}
                  />
                </Grid>
              )}
            </Grid>
          </section>
          <section>
            <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
              Personal Details
            </Typography>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conTitle"
                  label="Title"
                  value={contactList.contactMastDto.conTitle}
                  options={dropdownValues.titleOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactMastDto", "conTitle"],
                    dropdownValues.titleOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="First Name"
                  ControlID="txtFName"
                  placeholder="First Name"
                  type="text"
                  name="conFName"
                  size="small"
                  value={contactList.contactMastDto.conFName}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                  isMandatory
                />
                {validationErrors["contactMastDto.conFName"] && (
                  <span style={{ color: "red" }}>
                    {validationErrors["contactMastDto.conFName"]}
                  </span>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Last Name"
                  ControlID="txtLName"
                  placeholder="Last Name"
                  type="text"
                  name="conLName"
                  size="small"
                  value={contactList.contactMastDto.conLName}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                  isMandatory
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conGender"
                  label="Gender"
                  value={contactList.contactMastDto.conGender || ""}
                  options={dropdownValues.genderOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactMastDto", "conGender"],
                    dropdownValues.genderOptions
                  )}
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Birth Date"
                  ControlID="BirthDate"
                  placeholder="dd/mm/yyyy"
                  type="date"
                  name="conDob"
                  size="small"
                  value={
                    contactList.contactMastDto.conDob
                      ? contactList.contactMastDto.conDob
                          .toString()
                          .split("T")[0]
                      : today
                  }
                  max={today}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conBldGrp"
                  label="Blood Group"
                  value={contactList.contactMastDto.conBldGrp || ""}
                  options={dropdownValues.bloodGroupOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactMastDto", "conBldGrp"],
                    dropdownValues.bloodGroupOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="maritalStatus"
                  label="Marital Status"
                  value={contactList.contactMastDto.maritalStatus || ""}
                  options={dropdownValues.maritalStatusOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactMastDto", "maritalStatus"],
                    dropdownValues.maritalStatusOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="ID/Passport No"
                  ControlID="PassportNo"
                  placeholder="ID/Passport No"
                  type="text"
                  name="conSSNID"
                  size="small"
                  value={contactList.contactMastDto.conSSNID}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </section>
          <section>
            <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
              Contact Details
            </Typography>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Mobile No"
                  ControlID="txtMobileNo"
                  placeholder="Mobile No"
                  type="text"
                  name="cAddPhone1"
                  size="small"
                  value={contactList.contactAddressDto.cAddPhone1}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="cAddCity"
                  label="City"
                  value={contactList.contactAddressDto.cAddCity || ""}
                  options={dropdownValues.cityOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactAddressDto", "cAddCity"],
                    dropdownValues.cityOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="cAddState"
                  label="State"
                  value={contactList.contactAddressDto.cAddState || ""}
                  options={dropdownValues.stateOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactAddressDto", "cAddState"],
                    dropdownValues.stateOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="cAddCountry"
                  label="Nationality"
                  value={contactList.contactAddressDto.cAddCountry || ""}
                  options={dropdownValues.nationalityOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactAddressDto", "cAddCountry"],
                    dropdownValues.nationalityOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="E-Mail ID"
                  ControlID="MailID"
                  placeholder="E-Mail ID"
                  type="email"
                  name="cAddEmail"
                  size="small"
                  value={contactList.contactAddressDto.cAddEmail}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Post Code"
                  ControlID="PostCode"
                  placeholder="Post Code"
                  type="text"
                  name="cAddPostCode"
                  size="small"
                  value={contactList.contactAddressDto.cAddPostCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Emergency Contact Name"
                  ControlID="EmergencyContactName"
                  placeholder="Emergency Contact Name"
                  type="text"
                  name="emergenContactName"
                  size="small"
                  value={contactList.contactMastDto.emergenContactName}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Emergency Contact No"
                  ControlID="EmergencyContactNo"
                  placeholder="Emergency Contact No"
                  type="text"
                  name="cAddPhone2"
                  size="small"
                  value={contactList.contactAddressDto.cAddPhone2}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <TextArea
                  label="Address"
                  name="cAddStreet"
                  value={contactList.contactAddressDto.cAddStreet || ""}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      contactAddressDto: {
                        ...prev.contactAddressDto,
                        cAddStreet: e.target.value,
                      },
                    }))
                  }
                  placeholder="Address"
                  rows={1}
                />
              </Grid>
            </Grid>
          </section>
          <section>
            <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
              Account Details
            </Typography>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Account Code"
                  ControlID="AccountCode"
                  placeholder="Account Code"
                  type="text"
                  name="accCode"
                  size="small"
                  value={contactList.contactMastDto.accCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                  isMandatory={contactList.contactMastDto.consValue === "PHY"} // Make Account Code mandatory if Category is PHY
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Account Pay Code"
                  ControlID="AccountPayCode"
                  placeholder="Account Pay Code"
                  type="text"
                  name="accPayCode"
                  size="small"
                  value={contactList.contactMastDto.accPayCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conEmpStatus"
                  label="Employee Status"
                  value={contactList.contactMastDto.conEmpStatus || ""}
                  options={dropdownValues.employeeStatusOptions}
                  onChange={handleDropdownChange(
                    [""],
                    ["contactMastDto", "conEmpStatus"],
                    dropdownValues.employeeStatusOptions
                  )}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              {[
                { label: "is Employee", name: "isEmployee" },
                { label: "is Referral", name: "isReferral" },
                ...(contactList.contactMastDto.consValue === "PHY"
                  ? [
                      { label: "is Appointment", name: "isAppointment" },
                      {
                        label: "is Super Speciality",
                        name: "isSuperSpeciality",
                      },
                    ]
                  : []),
                ...(switchStates.isEmployee
                  ? [
                      { label: "is User Required", name: "isUserRequired" },
                      { label: "is Authorised User", name: "isAuthorisedUser" },
                    ]
                  : []),
              ].map((switchItem) => (
                <Grid item xs={12} sm={3} md={2} key={switchItem.name}>
                  <CustomSwitch
                    label={switchItem.label}
                    size="medium"
                    color="secondary"
                    checked={
                      switchStates[switchItem.name as keyof typeof switchStates]
                    }
                    onChange={handleSwitchChange(switchItem.name)}
                  />
                </Grid>
              ))}
            </Grid>
          </section>
        </Paper>
      </Container>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
      <ContactListSearch
        show={isSearchOpen}
        handleClose={() => setIsSearchOpen(false)}
        onEditContactList={handleEditContactList}
      />
    </MainLayout>
  );
};

export default ContactListPage;
