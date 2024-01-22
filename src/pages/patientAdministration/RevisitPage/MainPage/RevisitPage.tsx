import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import { Box, Container, Grid, Paper } from "@mui/material";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { revisitFormData } from "../../../../interfaces/PatientAdministration/revisitFormData";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { useLoading } from "../../../../context/LoadingContext";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { usePatientAutocomplete } from "../../../../hooks/usePatientAutocomplete";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import {
  DepartmentValue,
  DropdownOption,
  PhysicianValue,
  PicValue,
} from "../../../../interfaces/Common/DropdownOption";
import { BillingService } from "../../../../services/BillingService/BillingService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import { DepartmentService } from "../../../../services/CommonService/DepartmentService";
import { ContactMastService } from "../../../../services/CommonService/ContactMastService";
import useDropdown from "../../../../hooks/useDropdown";

const RevisitPage: React.FC = () => {
  const revisitInitialState: revisitFormData = {
    pChartID: 0,
    pChartCode: "",
    pTypeID: 0,
    pTypeName: "",
    pVisitType: "H",
    pVisitTypeText: "",
    deptID: 0,
    deptName: "",
    attndPhyID: 0,
    attendingPhysicianName: "",
    primPhyID: 0,
    primaryPhysicianName: "",
  };
  const [revisitFormData, setRevisitFormData] =
    useState<revisitFormData>(revisitInitialState);
  const { handleDropdownChange } =
    useDropdownChange<revisitFormData>(setRevisitFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<revisitFormData>(setRevisitFormData);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { fetchPatientSuggestions } = usePatientAutocomplete(token);
  const handlePatientSelect = (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const numbersArray = extractNumbers(selectedSuggestion);
      const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
      if (pChartID) {
        // Fetch patient details and update form
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    {
      variant: "contained",
      icon: PrintIcon,
      text: "Print Form",
      size: "medium",
    },
  ];
  const { performSearch } = useContext(PatientSearchContext);

  // Transform functions for each dropdown
  const transformPicValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(), // Ensure value is a string
      label: item.label,
    }));

  const transformDepartmentValues = (
    data: DropdownOption[]
  ): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const transformAttendingPhysicians = (
    data: DropdownOption[]
  ): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const transformprimaryIntroducingSource = (
    data: DropdownOption[]
  ): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  // Use the custom hook for dropdowns
  const picResult = useDropdown(
    BillingService.fetchPicValues,
    transformPicValues,
    [token, "GetPICDropDownValues"]
  );
  const departmentResult = useDropdown(
    DepartmentService.fetchDepartments,
    transformDepartmentValues,
    [token, "GetActiveRegistrationDepartments", userInfo.compID ?? 0]
  );
  const attendingPhysiciansResult = useDropdown(
    ContactMastService.fetchAttendingPhysician,
    transformAttendingPhysicians,
    [token, "GetActiveConsultants", userInfo.compID ?? 0]
  );
  const primaryIntroducingSourceResult = useDropdown(
    ContactMastService.fetchRefferalPhy,
    transformprimaryIntroducingSource,
    [token, "GetActiveReferralContacts", userInfo.compID ?? 0]
  );
  const picValues = picResult.options as DropdownOption[];
  const departmentValues = departmentResult.options as DropdownOption[];
  const attendingPhysicians =
    attendingPhysiciansResult.options as DropdownOption[];
  const primaryIntroducingSource =
    primaryIntroducingSourceResult.options as DropdownOption[];
  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
  ];
  const isHospitalVisit = revisitFormData.pVisitType === "H";
  const isPhysicianVisit = revisitFormData.pVisitType === "P";
  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <PatientSearch
          show={showPatientSearch}
          handleClose={() => setShowPatientSearch(false)}
          onEditPatient={handlePatientSelect}
        />
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <section aria-labelledby="personal-details-header">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <AutocompleteTextBox
                  ControlID="UHID"
                  title="UHID"
                  type="text"
                  size="small"
                  placeholder="Search through UHID, Name, DOB, Phone No...."
                  value={revisitFormData.pChartCode}
                  onChange={(e) =>
                    setRevisitFormData({
                      ...revisitFormData,
                      pChartCode: e.target.value,
                    })
                  }
                  fetchSuggestions={fetchPatientSuggestions}
                  isMandatory={true}
                  onSelectSuggestion={handlePatientSelect}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <DropdownSelect
                  label="Payment Source [PIC]"
                  name="PIC"
                  value={
                    revisitFormData.pTypeID === 0
                      ? ""
                      : revisitFormData.pTypeID.toString()
                  }
                  options={picValues}
                  onChange={handleDropdownChange(
                    ["PTypeID"],
                    ["PTypeName"],
                    picValues
                  )}
                  size="small"
                  isMandatory={true}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <RadioGroup
                  name="visitDetails"
                  label="Visit To"
                  options={visitOptions}
                  selectedValue={revisitFormData.pVisitType}
                  onChange={handleRadioButtonChange(
                    ["pVisitType"],
                    ["pVisitTypeText"],
                    visitOptions
                  )}
                  inline={true}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                {isHospitalVisit && (
                  <DropdownSelect
                    label="Department"
                    name="Department"
                    value={
                      revisitFormData.deptID === 0
                        ? ""
                        : String(revisitFormData.deptID)
                    }
                    options={departmentValues}
                    onChange={handleDropdownChange(
                      ["DeptID"],
                      ["DeptName"],
                      departmentValues
                    )}
                    isMandatory={isHospitalVisit}
                    size="small"
                  />
                )}
                {isPhysicianVisit && (
                  <DropdownSelect
                    name="AttendingPhysician"
                    label="Attending Physician"
                    value={
                      revisitFormData.attndPhyID === 0
                        ? ""
                        : String(revisitFormData.attendingPhysicianName)
                    }
                    options={attendingPhysicians}
                    onChange={handleDropdownChange(
                      ["attndPhyID"],
                      ["attendingPhysicianName"],
                      attendingPhysicians
                    )}
                    isMandatory={isPhysicianVisit}
                    size="small"
                  />
                )}
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <DropdownSelect
                  name="PrimaryIntroducingSource"
                  label="Primary Introducing Source"
                  value={
                    revisitFormData.primPhyID === 0
                      ? ""
                      : String(revisitFormData.primPhyID)
                  }
                  options={primaryIntroducingSource}
                  onChange={handleDropdownChange(
                    ["primPhyID"],
                    ["primaryPhysicianName"],
                    primaryIntroducingSource
                  )}
                  isMandatory={isPhysicianVisit || isHospitalVisit}
                  size="small"
                />
              </Grid>
            </Grid>
          </section>
        </Paper>
      </Container>
    </MainLayout>
  );
};
export default RevisitPage;
