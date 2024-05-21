import React, { useEffect, useState } from "react";
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
import { SelectChangeEvent } from "@mui/material/Select";
import { ContactListData } from "../../../../interfaces/hospitalAdministration/ContactListData";

const ContactListPage: React.FC = () => {
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const initialSwitchStates = {
    isEmployee: false,
    isReferral: false,
    isAppointment: false,
    isSuperSpeciality: false,
    isUserRequired: false,
    isAuthorisedUser: false,
  };

  const getInitialContactListState = (): ContactListData => ({
    conID: 0,
    conCode: "",
    conTitle: "",
    conFName: "",
    conLName: "",
    conMName: "",
    conDob: undefined,
    conGender: "",
    conSSNID: "",
    conBldGrp: "",
    conCat: "",
    conEmpYN: "N",
    notes: "",
    conEmpStatus: "",
    consValue: "",
    allergicToAllergence: "",
    allergicToMedicine: "",
    aPHYRMID: 0,
    aPhyRoomName: "",
    compID: compID || 0,
    compCode: "",
    compName: "",
    deptID: 0,
    deptName: "",
    designation: "",
    emergenContactName: "",
    iPP: 0,
    oPP: 0,
    isAuthorizedUserYN: "N",
    isContractYN: "N",
    isSuperSpecialtyYN: "N",
    maritalStatus: "",
    tINNo: "",
    accCode: "",
    accPayCode: "",
    gESYCode: "",
    digSignPath: "",
    stampPath: "",
    payPolicy: 0,
    nationality: "",
    email: "",
    postCode: "",
    emergencyContactNo: "",
    address: "",
    state: "",
    city: "",
    IncomeAccountCode: "",
    MobileNo: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [switchStates, setSwitchStates] = useState(initialSwitchStates);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const today = new Date().toISOString().split("T")[0];
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

  const loadDropdownValues = async () => {
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
  };

  useEffect(() => {
    loadDropdownValues();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactList((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSwitchStates({
        ...switchStates,
        [name]: event.target.checked,
      });
      setContactList((prev) => ({
        ...prev,
        [name]: event.target.checked ? "Y" : "N",
      }));
    };

  const handleSave = async () => {
    try {
      const result = await ContactListService.saveContactList(
        token!,
        contactList
      );
      if (result.success) {
        console.log("Contact list saved successfully:", result.data);
      } else {
        console.error("Failed to save contact list:", result);
      }
    } catch (error) {
      console.error("Error saving contact list:", error);
    }
  };

  const handleClear = () => {
    setContactList(getInitialContactListState());
    setSwitchStates(initialSwitchStates);
  };

  const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
    setSelectedCategory(event.target.value as string);
    setContactList((prev) => ({
      ...prev,
      conCat: event.target.value as string,
    }));
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: async () => {},
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
                  value={contactList.conCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conCat"
                  label="Category"
                  value={selectedCategory}
                  options={dropdownValues.categoryOptions}
                  onChange={handleCategoryChange}
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
                    contactList.deptID === 0
                      ? ""
                      : contactList.deptID.toString()
                  }
                  options={dropdownValues.departmentOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      deptID: parseInt(e.target.value as string),
                    }))
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              {selectedCategory === "PHY" && (
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
                  value={contactList.conTitle}
                  options={dropdownValues.titleOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      conTitle: e.target.value as string,
                    }))
                  }
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
                  value={contactList.conFName}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Last Name"
                  ControlID="txtLName"
                  placeholder="Last Name"
                  type="text"
                  name="conLName"
                  size="small"
                  value={contactList.conLName}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conGender"
                  label="Gender"
                  value={contactList.conGender || ""}
                  options={dropdownValues.genderOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      conGender: e.target.value as string,
                    }))
                  }
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
                    contactList.conDob
                      ? contactList.conDob.toISOString().split("T")[0]
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
                  value={contactList.conBldGrp || ""}
                  options={dropdownValues.bloodGroupOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      conBldGrp: e.target.value as string,
                    }))
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="maritalStatus"
                  label="Marital Status"
                  value={contactList.maritalStatus || ""}
                  options={dropdownValues.maritalStatusOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      maritalStatus: e.target.value as string,
                    }))
                  }
                  isMandatory
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
                  value={contactList.conSSNID}
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
                  name="conFName"
                  size="small"
                  value={contactList.MobileNo}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="city"
                  label="City"
                  value={contactList.city}
                  options={dropdownValues.cityOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      city: e.target.value as string,
                    }))
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="state"
                  label="State"
                  value={contactList.state}
                  options={dropdownValues.stateOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      state: e.target.value as string,
                    }))
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="nationality"
                  label="Nationality"
                  value={contactList.nationality}
                  options={dropdownValues.nationalityOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      nationality: e.target.value as string,
                    }))
                  }
                  isMandatory
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
                  name="email"
                  size="small"
                  value={contactList.email}
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
                  name="postCode"
                  size="small"
                  value={contactList.postCode}
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
                  value={contactList.emergenContactName}
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
                  name="emergenContactNo"
                  size="small"
                  value={contactList.emergencyContactNo}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3}>
                <TextArea
                  label="Address"
                  name="address"
                  value={contactList.address}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      address: e.target.value,
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
                  value={contactList.accCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
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
                  value={contactList.accPayCode}
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FloatingLabelTextBox
                  title="Physician Income Account Code"
                  ControlID="PhysicianIncomeAccountCode"
                  placeholder="Physician Income Account Code"
                  type="text"
                  name="physicianIncomeAccCode"
                  size="small"
                  value={contactList.IncomeAccountCode} //contactList.physicianIncomeAccCode
                  isSubmitted={isSubmitted}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DropdownSelect
                  name="conEmpStatus"
                  label="Employee Status"
                  value={contactList.conEmpStatus || ""}
                  options={dropdownValues.employeeStatusOptions}
                  onChange={(e) =>
                    setContactList((prev) => ({
                      ...prev,
                      conEmpStatus: e.target.value as string,
                    }))
                  }
                  isMandatory
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="flex-start">
              {[
                { label: "is Employee", name: "isEmployee" },
                { label: "is Referral", name: "isReferral" },
                ...(selectedCategory === "PHY"
                  ? [
                      { label: "is Appointment", name: "isAppointment" },
                      {
                        label: "is Super Speciality",
                        name: "isSuperSpeciality",
                      },
                    ]
                  : []),
                { label: "is User Required", name: "isUserRequired" },
                { label: "is Authorised User", name: "isAuthorisedUser" },
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
    </MainLayout>
  );
};

export default ContactListPage;
