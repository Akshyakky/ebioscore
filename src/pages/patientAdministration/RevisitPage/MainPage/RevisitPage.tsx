import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Grid, Paper, SelectChangeEvent } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { useLoading } from "../../../../context/LoadingContext";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
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
import FormField from "../../../../components/FormField/FormField";
import { OPVisitDto, RevisitFormErrors } from "../../../../interfaces/PatientAdministration/revisitFormData";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "../../../../hooks/useDropdownChange";

const RevisitPage: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const compID = userInfo.compID!;
  const { setLoading } = useLoading();
  const { performSearch } = useContext(PatientSearchContext);
  const { fetchPatientSuggestions } = usePatientAutocomplete();

  const dropdownValues = useDropdownValues([
    "pic",
    "department",
  ]);

  const DepartmentDropdownValues = useMemo(() => {
    if (!dropdownValues.department) return [];
    return dropdownValues.department.filter((item: any) =>
      item.rActiveYN === 'Y' && item.isUnitYN === 'Y'
    );
  }, [dropdownValues.department]);

  const revisitInitialState = (): OPVisitDto => ({
    opVID: 0,
    pChartID: 0,
    pVisitDate: new Date(),
    patOPIP: "O",
    attendingPhysicianId: 0,
    attendingPhysicianName: "",
    primaryReferralSourceId: 0,
    primaryReferralSourceName: "",
    primaryPhysicianId: 0,
    primaryPhysicianName: "",
    pVisitStatus: "W",
    pVisitType: "P",
    pVisitTypeText: "",
    rActiveYN: "Y",
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
    secondaryReferralSourceId: 0,
    secondaryReferralSourceName: "",
    oldPChartID: 0,
    transferYN: "N",
  });

  const [revisitFormData, setRevisitFormData] = useState<OPVisitDto>(revisitInitialState);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showWaitingPatientSearch, setShowWaitingPatientSearch] = useState(false);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const [successAlert, setSuccessAlert] = useState({ open: false, message: "" });
  const [formErrors, setFormErrors] = useState<RevisitFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [availableAttendingPhysicians, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource, setPrimaryIntroducingSource] = useState<DropdownOption[]>([]);
  const { handleDropdownChange } = useDropdownChange<OPVisitDto>(setRevisitFormData);
  const uhidRef = useRef<HTMLInputElement>(null);
  const insurancePageRef = useRef<any>(null);

  const loadDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      const [primaryIntroducingSource] = await Promise.all([
        ContactMastService.fetchRefferalPhy("GetActiveReferralContacts", compID),
      ]);

      setPrimaryIntroducingSource(primaryIntroducingSource.map(item => ({ value: item.value.toString(), label: item.label })));
    } catch (error) {
      console.error("Error loading dropdown values:", error);
    } finally {
      setLoading(false);
    }
  }, [compID]);

  useEffect(() => {
    loadDropdownValues();
    if (uhidRef.current) uhidRef.current.focus();
  }, [loadDropdownValues]);

  const validateForm = useCallback(() => {
    const errors: RevisitFormErrors = {};
    if (!revisitFormData.pChartCode) errors.pChartCode = "UHID is required.";
    if (revisitFormData.pTypeID === 0) errors.pTypeID = "Payment Source is required.";
    if (isHospitalVisit() && revisitFormData.deptID === 0) errors.deptID = "Department is required for hospital visits.";
    if (isPhysicianVisit() && revisitFormData.attendingPhysicianId === 0) errors.attndPhyID = "Attending Physician is required for physician visits.";
    if (revisitFormData.primaryReferralSourceId === 0) errors.primPhyID = "Primary Introducing Source is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [revisitFormData]);

  const handleRadioButtonChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRevisitFormData(prev => ({
      ...prev,
      [name]: value,
      pVisitTypeText: event.target.labels ? event.target.labels[0].textContent || "" : "",
    }));

    if (value === "H") {

    } else if (value === "P") {
      ContactMastService.fetchAvailableAttendingPhysicians(selectedPChartID)
        .then(availablePhysicians => {
          setAvailableAttendingPhysicians(availablePhysicians.map(item => ({ value: item.value.toString(), label: item.label })));
        });
    }
  }, [compID, selectedPChartID]);

  const handlePatientSelect = useCallback(async (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const pChartID = extractNumbers(selectedSuggestion)[0] || null;
      if (pChartID) {
        setSelectedPChartID(pChartID);
        const [availablePhysicians, lastVisitResult] = await Promise.all([
          ContactMastService.fetchAvailableAttendingPhysicians(pChartID),
          RevisitService.getLastVisitDetailsByPChartID(pChartID)
        ]);

        setAvailableAttendingPhysicians(availablePhysicians);

        if (lastVisitResult && lastVisitResult.success) {
          const isAttendingPhysicianAvailable = availablePhysicians.some(physician => physician.value === lastVisitResult.data.attndPhyID);
          setRevisitFormData(prev => ({
            ...prev,
            pChartCode: selectedSuggestion.split("|")[0].trim(),
            pChartID: pChartID,
            attndPhyID: isAttendingPhysicianAvailable ? lastVisitResult.data.attndPhyID : 0,
            deptID: lastVisitResult.data.deptID || prev.deptID,
            pTypeID: lastVisitResult.data.pTypeID || prev.pTypeID,
            primPhyID: lastVisitResult.data.primPhyID || prev.primaryReferralSourceId,
          }));
        }
      }
    } catch (error) {
      console.error("Error in handlePatientSelect:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdvancedSearch = useCallback(async () => {
    setShowPatientSearch(true);
    await performSearch("");
  }, [performSearch]);

  const handleWaitingSearch = useCallback(() => setShowWaitingPatientSearch(true), []);

  const actionButtons: ButtonProps[] = [
    { variant: "contained", size: "medium", icon: SearchIcon, text: "Advanced Search", onClick: handleAdvancedSearch },
    { variant: "contained", size: "medium", icon: SearchIcon, text: "Waiting Search", onClick: handleWaitingSearch },
    { variant: "contained", icon: PrintIcon, text: "Print Form", size: "medium" },
  ];
  const isHospitalVisit = useCallback(() => revisitFormData.pVisitType === "H", [revisitFormData.pVisitType]);
  const isPhysicianVisit = useCallback(() => revisitFormData.pVisitType === "P", [revisitFormData.pVisitType]);

  const handleClear = useCallback(() => {
    setRevisitFormData(revisitInitialState);
    setSelectedPChartID(0);
    setShouldClearInsuranceData(true);
    setIsSubmitted(false);
    setFormErrors({});
    if (uhidRef.current) uhidRef.current.focus();
  }, [revisitInitialState]);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await RevisitService.saveOPVisits(revisitFormData);
      if (response && response.success) {
        setSuccessAlert({ open: true, message: "Save successful" });
        handleClear();
      } else {
        console.error("Save failed", response);
      }
    } catch (error) {
      console.error("Error in saving OP Visits", error);
    } finally {
      setLoading(false);
    }
  }, [revisitFormData, validateForm, setLoading, handleClear]);

  const handleCloseSuccessAlert = useCallback(() => setSuccessAlert(prev => ({ ...prev, open: false })), []);

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
            actions={[{ label: "OK", onClick: handleCloseSuccessAlert }]}
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
              <FormField
                type="autocomplete"
                label="UHID"
                value={revisitFormData.pChartCode}
                name="pChartCode"
                ControlID="UHID"
                onChange={(e) =>
                  setRevisitFormData({ ...revisitFormData, pChartCode: e.target.value })
                }
                fetchSuggestions={fetchPatientSuggestions}
                onSelectSuggestion={handlePatientSelect}
                placeholder="Search through UHID, Name, DOB, Phone No...."
                isMandatory={true}
                isSubmitted={isSubmitted}
                errorMessage={formErrors.pChartCode}
                gridProps={{ xs: 12, sm: 6, md: 3, lg: 3, xl: 3 }}
                ref={uhidRef}
              />
              <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                <PatientDemographics pChartID={selectedPChartID} />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <FormField
                type="select"
                label="Payment Source [PIC]"
                value={revisitFormData.pTypeID}
                name="pTypeID"
                ControlID="PIC"
                options={dropdownValues.pic}
                onChange={handleDropdownChange(["pTypeID"], ["pTypeName"], dropdownValues.pic)}
                isMandatory={true}
                isSubmitted={isSubmitted}
                errorMessage={formErrors.pTypeID}
              />
            </Grid>
            <Grid container spacing={2}>
              <FormField
                type="radio"
                label="Visit To"
                value={revisitFormData.pVisitType}
                name="pVisitType"
                ControlID="visitDetails"
                options={[
                  { value: "H", label: "Hospital" },
                  { value: "P", label: "Physician" },
                ]}
                onChange={handleRadioButtonChange}
                inline={true}
              />
            </Grid>
            <Grid container spacing={2}>
              {isHospitalVisit() && (
                <FormField
                  type="select"
                  label="Department"
                  value={revisitFormData.deptID}
                  name="deptID"
                  ControlID="Department"
                  options={DepartmentDropdownValues}
                  onChange={handleDropdownChange(["deptID"], ["deptName"], dropdownValues.department)}
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                  errorMessage={formErrors.deptID}
                />
              )}
              {isPhysicianVisit() && (
                <FormField
                  type="select"
                  label="Attending Physician"
                  value={revisitFormData.attendingPhysicianId}
                  name="attendingPhysicianId"
                  ControlID="AttendingPhysician"
                  options={availableAttendingPhysicians}
                  onChange={handleDropdownChange(["attendingPhysicianId"], ["attendingPhysicianName"], availableAttendingPhysicians)}
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                  errorMessage={formErrors.attndPhyID}
                />
              )}
            </Grid>
            <Grid container spacing={2}>
              <FormField
                type="select"
                label="Primary Introducing Source"
                value={revisitFormData.primaryReferralSourceId}
                name="primaryReferralSourceId"
                ControlID="PrimaryIntroducingSource"
                options={primaryIntroducingSource}
                onChange={handleDropdownChange(["primaryReferralSourceId"], ["primaryReferralSourceName"], primaryIntroducingSource)}
                isMandatory={true}
                isSubmitted={isSubmitted}
                errorMessage={formErrors.primPhyID}
              />
            </Grid>
          </section>
          <InsurancePage
            ref={insurancePageRef}
            pChartID={selectedPChartID}
            shouldClearData={shouldClearInsuranceData}
          />
          <PatientVisitHistory pChartID={selectedPChartID} />
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
