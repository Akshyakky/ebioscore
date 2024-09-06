import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, Container, Grid, Paper } from "@mui/material";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import {
  RevisitFormErrors,
  revisitFormData,
} from "../../../../interfaces/PatientAdministration/revisitFormData";
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
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { BillingService } from "../../../../services/BillingServices/BillingService";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { DepartmentService } from "../../../../services/CommonServices/DepartmentService";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import PatientVisitHistory from "../SubPage/PatientVisitHisotry";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import GeneralAlert from "../../../../components/GeneralAlert/GeneralAlert";
import WaitingPatientSearch from "../../CommonPage/AdvanceSearch/WaitingPatientSearch";
import useDropdownChange from "../../../../hooks/useDropdownChange";

const RevisitPage: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const compID = userInfo.compID!;

  const revisitInitialState = (): revisitFormData => ({
    opVID: 0,
    pChartID: 0,
    pVisitDate: new Date().toISOString().split("T")[0],
    patOPIP: "O",
    attndPhyID: 0,
    attendingPhysicianName: "",
    refSourceID: 0,
    refSource: "",
    primPhyID: 0,
    primaryPhysicianName: "",
    pVisitStatus: "W",
    pVisitType: "P",
    pVisitTypeText: "",
    rActiveYN: "Y",
    rCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    rCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    rCreatedOn: new Date().toISOString().split("T")[0],
    rModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    rModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    rModifiedOn: new Date().toISOString().split("T")[0],
    rNotes: "",
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    compID: userInfo.compID !== null ? userInfo.compID : 0,
    compCode: userInfo.compCode !== null ? userInfo.compCode : "",
    compName: userInfo.compName !== null ? userInfo.compName : "",
    crossConsultation: "N",
    deptID: 0,
    deptName: "",
    opNumber: "",
    pChartCode: "",
    pChartCompID: 0,
    refFacultyID: 0,
    refFaculty: "",
    sourceID: 0,
    source: "",
    refSourceID2: 0,
    refSource2: "",
    oldPChartID: 0,
    transferYN: "N",
  });

  const [revisitFormData, setRevisitFormData] = useState<revisitFormData>(
    revisitInitialState()
  );
  const uhidRef = useRef<HTMLInputElement>(null);
  const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
  const { setLoading } = useLoading();

  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const [shouldClearInsuranceData, setShouldClearInsuranceData] =
    useState(false);
  const [successAlert, setSuccessAlert] = useState({
    open: false,
    message: "",
  });
  const [formErrors, setFormErrors] = useState<RevisitFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableAttendingPhysicians, setAvailableAttendingPhysicians] =
    useState<DropdownOption[]>([]);
  const [showWaitingPatientSearch, setShowWaitingPatientSearch] =
    useState(false);
  const [picValues, setPicValues] = useState<DropdownOption[]>([]);
  const [departmentValues, setDepartmentValues] = useState<DropdownOption[]>(
    []
  );
  const [primaryIntroducingSource, setPrimaryIntroducingSource] = useState<
    DropdownOption[]
  >([]);
  const insurancePageRef = useRef<any>(null);
  const { handleDropdownChange } =
    useDropdownChange<revisitFormData>(setRevisitFormData);

  const loadDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      const [picValues, departmentValues, primaryIntroducingSource] =
        await Promise.all([
          BillingService.fetchPicValues("GetPICDropDownValues"),
          DepartmentService.fetchDepartments(
            "GetActiveRegistrationDepartments",
            compID
          ),
          ContactMastService.fetchRefferalPhy(
            "GetActiveReferralContacts",
            compID
          ),
        ]);

      setPicValues(
        picValues.map((item) => ({
          value: item.value.toString(),
          label: item.label,
        }))
      );
      setDepartmentValues(
        departmentValues.map((item) => ({
          value: item.value.toString(),
          label: item.label,
        }))
      );
      setPrimaryIntroducingSource(
        primaryIntroducingSource.map((item) => ({
          value: item.value.toString(),
          label: item.label,
        }))
      );
    } catch (error) {
      console.error("Error loading dropdown values:", error);
    } finally {
      setLoading(false);
    }
  }, [compID]);

  useEffect(() => {
    loadDropdownValues();
  }, [loadDropdownValues]);

  const validateForm = () => {
    const errors: RevisitFormErrors = {};
    if (!revisitFormData.pChartCode) {
      errors.pChartCode = "UHID is required.";
    }
    if (revisitFormData.pTypeID === 0) {
      errors.pTypeID = "Payment Source is required.";
    }
    if (isHospitalVisit() && revisitFormData.deptID === 0) {
      errors.deptID = "Department is required for hospital visits.";
    }
    if (isPhysicianVisit() && revisitFormData.attndPhyID === 0) {
      errors.attndPhyID =
        "Attending Physician is required for physician visits.";
    }
    if (revisitFormData.primPhyID === 0) {
      errors.primPhyID = "Primary Introducing Source is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRadioButtonChange =
    (field: string[], textField: string[]) =>
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setRevisitFormData((prevState) => ({
          ...prevState,
          [field[0]]: value,
          [textField[0]]: event.target.labels
            ? event.target.labels[0].textContent
            : "",
        }));

        if (value === "H") {
          // Fetch and set department values
          const departmentValues = await DepartmentService.fetchDepartments(
            "GetActiveRegistrationDepartments",
            compID
          );
          setDepartmentValues(
            departmentValues.map((item) => ({
              value: item.value.toString(),
              label: item.label,
            }))
          );
        } else if (value === "P") {
          // Fetch and set attending physicians
          const availablePhysicians =
            await ContactMastService.fetchAvailableAttendingPhysicians(
              selectedPChartID
            );
          setAvailableAttendingPhysicians(
            availablePhysicians.map((item) => ({
              value: item.value.toString(),
              label: item.label,
            }))
          );
        }
      };

  const handlePatientSelect = async (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const numbersArray = extractNumbers(selectedSuggestion);
      const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
      if (pChartID) {
        setSelectedPChartID(pChartID);
        const availablePhysicians =
          await ContactMastService.fetchAvailableAttendingPhysicians(
            pChartID
          );
        setAvailableAttendingPhysicians(availablePhysicians);
        const lastVisitResult =
          await RevisitService.getLastVisitDetailsByPChartID(pChartID);
        if (lastVisitResult && lastVisitResult.success) {
          const isAttendingPhysicianAvailable = availablePhysicians.some(
            (physician) => physician.value === lastVisitResult.data.attndPhyID
          );

          setRevisitFormData((prevFormData) => ({
            ...prevFormData,
            pChartCode: selectedSuggestion.split("|")[0].trim(),
            pChartID: pChartID,
            attndPhyID: isAttendingPhysicianAvailable
              ? lastVisitResult.data.attndPhyID
              : 0,
            deptID: lastVisitResult.data.deptID || prevFormData.deptID,
            pTypeID: lastVisitResult.data.pTypeID || prevFormData.pTypeID,
            primPhyID: lastVisitResult.data.primPhyID || prevFormData.primPhyID,
          }));



        } else {
          console.error(
            "Failed to fetch last visit details or no details available"
          );
        }
      }
    } catch (error) {
      console.error("Error in handlePatientSelect:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };

  const handleWaitingSearch = async () => {
    setShowWaitingPatientSearch(true);
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
      size: "medium",
      icon: SearchIcon,
      text: "Waiting Search",
      onClick: handleWaitingSearch,
    },
    {
      variant: "contained",
      icon: PrintIcon,
      text: "Print Form",
      size: "medium",
    },
  ];
  const { performSearch } = useContext(PatientSearchContext);

  const isHospitalVisit = () => revisitFormData.pVisitType === "H";
  const isPhysicianVisit = () => revisitFormData.pVisitType === "P";

  useEffect(() => {
    if (uhidRef.current) {
      uhidRef.current.focus();
    }
  }, []);

  const handleClear = () => {
    setRevisitFormData(revisitInitialState);
    setSelectedPChartID(0);
    setShouldClearInsuranceData(true);
    setIsSubmitted(false);
    setFormErrors({});

    if (uhidRef.current) {
      uhidRef.current.focus();
    }
  };

  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      if (!validateForm()) {
        return;
      }
      const response = await RevisitService.saveOPVisits(
        revisitFormData
      );
      if (response && response.success) {
        setSuccessAlert({
          open: true,
          message: "Save successful",
        });
        setRevisitFormData(revisitInitialState);
        handleClear();
      } else {
        console.error("Save failed", response);
      }
    } catch (error) {
      console.error("Error in saving OP Visits", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessAlert = () => {
    setSuccessAlert({ ...successAlert, open: false });
  };

  const successActions = [{ label: "OK", onClick: handleCloseSuccessAlert }];

  useEffect(() => {
    if (shouldClearInsuranceData) {
      setShouldClearInsuranceData(false);
    }
  }, [shouldClearInsuranceData]);

  return (
    <>
      <Container maxWidth={false}>
        {successAlert.open && (
          <GeneralAlert
            open={successAlert.open}
            onClose={handleCloseSuccessAlert}
            message={successAlert.message}
            severity="success"
            actions={successActions}
          />
        )}
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <PatientSearch
          show={showPatientSearch}
          handleClose={() => setShowPatientSearch(false)}
          onEditPatient={handlePatientSelect}
        />
        <WaitingPatientSearch
          userInfo={userInfo}
          show={showWaitingPatientSearch}
          handleClose={() => setShowWaitingPatientSearch(false)}
          onPatientSelect={handlePatientSelect}
        />
        <Paper variant="elevation" sx={{ padding: 2 }}>
          <section aria-labelledby="personal-details-header">
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <AutocompleteTextBox
                  ref={uhidRef}
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
                  isSubmitted={isSubmitted}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                <PatientDemographics
                  pChartID={selectedPChartID}
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
                    ["pTypeID"],
                    ["pTypeName"],
                    picValues
                  )}
                  size="small"
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <RadioGroup
                  name="visitDetails"
                  label="Visit To"
                  options={[
                    { value: "H", label: "Hospital" },
                    { value: "P", label: "Physician" },
                  ]}
                  selectedValue={revisitFormData.pVisitType}
                  onChange={handleRadioButtonChange(
                    ["pVisitType"],
                    ["pVisitTypeText"]
                  )}
                  inline={true}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                {isHospitalVisit() && (
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
                      ["deptID"],
                      ["deptName"],
                      departmentValues
                    )}
                    isMandatory={isHospitalVisit()}
                    size="small"
                    isSubmitted={isSubmitted}
                  />
                )}
                {isPhysicianVisit() && (
                  <DropdownSelect
                    name="AttendingPhysician"
                    label="Attending Physician"
                    value={
                      revisitFormData.attndPhyID === 0
                        ? ""
                        : String(revisitFormData.attndPhyID)
                    }
                    options={availableAttendingPhysicians}
                    onChange={handleDropdownChange(
                      ["attndPhyID"],
                      ["attendingPhysicianName"],
                      availableAttendingPhysicians
                    )}
                    isMandatory={isPhysicianVisit()}
                    size="small"
                    isSubmitted={isSubmitted}
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
                  isMandatory={isPhysicianVisit() || isHospitalVisit()}
                  size="small"
                  isSubmitted={isSubmitted}
                />
              </Grid>
            </Grid>
          </section>
          <InsurancePage
            ref={insurancePageRef}
            pChartID={selectedPChartID}
            shouldClearData={shouldClearInsuranceData}
          />
          <PatientVisitHistory pChartID={selectedPChartID} token={token} />
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
    </>
  );
};

export default RevisitPage;
