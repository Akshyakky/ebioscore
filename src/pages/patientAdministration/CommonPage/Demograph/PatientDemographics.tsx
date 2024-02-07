import React, { useState, useEffect } from "react";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { PatientDemographicDetails } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { useLoading } from "../../../../context/LoadingContext";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import {
  notifyError,
  notifySuccess,
} from "../../../../utils/Common/toastManager";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdown from "../../../../hooks/useDropdown";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import {
  PatientDemoGraph,
  PatientDemoGraphError,
} from "../../../../interfaces/PatientAdministration/patientDemoGraph";
import CustomButton from "../../../../components/Button/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { BillingService } from "../../../../services/BillingService/BillingService";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { PatientDemoGraphService } from "../../../../services/RegistrationService/PatientDemoGraphService";

interface PatientDemographicsProps {
  pChartID: number;
  token: string;
}

const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  pChartID,
  token,
}) => {
  const [patientDetails, setPatientDetails] =
    useState<PatientDemographicDetails | null>(null);
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<PatientDemoGraphError>({});
  const patientDemoGraphInitialState: PatientDemoGraph = {
    pChartID: 0,
    pChartCode: "",
    pTitleVal: "",
    pTitle: "",
    pfName: "",
    plName: "",
    dob: new Date().toISOString().split("T")[0],
    pGender: "",
    pGenderVal: "",
    pBldGrp: "",
    pTypeID: 0,
    pTypeName: "",
    pRegDate: new Date().toISOString().split("T")[0],
    pssnID: "",
    intIdPsprt: "",
    pAddStreet: "",
    patArea: "",
    patAreaVal: "",
    pAddCity: "",
    pAddCityVal: "",
    pAddActualCountry: "",
    pAddActualCountryVal: "",
    pAddPhone1: "",
    pAddEmail: "",
    refSource: "",
  };
  const [patientDemoGraph, setPatientDemoGraph] = useState<PatientDemoGraph>(
    patientDemoGraphInitialState
  );
  const { handleDropdownChange } =
    useDropdownChange<PatientDemoGraph>(setPatientDemoGraph);
  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const response = await RegistrationService.PatientDemoGraph(
        token,
        pChartID
      );
      if (response.success && response.data) {
        setPatientDetails(response.data);
      } else {
        notifyError("Patient details not found.");
      }
    } catch (err) {
      notifyError("An error occurred while fetching patient details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pChartID && pChartID !== 0) {
      fetchPatientDetails();
    }
  }, [pChartID, token, setLoading]);

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0]; // Extracts the date part from the ISO string
  };
  const fetchPatientDemographics = async () => {
    setLoading(true);
    try {
      const response: OperationResult<PatientDemoGraph> =
        await PatientDemoGraphService.getPatientDemographicsByPChartID(
          token,
          pChartID
        );
      if (response.success && response.data) {
        const formattedData = {
          ...response.data,
          dob: formatDate(response.data.dob),
          pRegDate: formatDate(response.data.pRegDate),
        };
        setPatientDemoGraph(formattedData);
      } else {
        notifyError("Patient demographic details not found.");
      }
    } catch (error) {
      notifyError(
        "An error occurred while fetching patient demographic details."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleClickOpen = () => {
    fetchPatientDemographics();
    setOpen(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setOpen(false);
  };

  const validateForm = () => {
    const error: PatientDemoGraphError = {};
    if (!patientDemoGraph.pChartCode) {
      error.pChartCode = "UHID is required.";
    }
    if (!patientDemoGraph.pTitleVal) {
      error.pTitleVal = "Title is required";
    }
    if (!patientDemoGraph.pfName) {
      error.pfName = "First Name is required";
    }
    if (!patientDemoGraph.plName) {
      error.plName = "Last Name is required";
    }
    if (!patientDemoGraph.dob) {
      error.dob = "Date of Birth is required";
    }
    if (!patientDemoGraph.pGenderVal) {
      error.pGenderVal = "Gender is required";
    }
    if (!patientDemoGraph.pssnID) {
      error.pssnID = "Indentity No is required";
    }
    if (!patientDemoGraph.pAddPhone1) {
      error.pAddPhone1 = "Mobile No is required";
    }
    setFormErrors(error);
    return Object.keys(error).length === 0;
  };

  const handlePatientSave = async () => {
    setIsSubmitted(true);
    const isValid = validateForm();
    if (!isValid) {
      notifyError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await PatientDemoGraphService.savePatientDemographics(
        token,
        patientDemoGraph
      );
      if (result.success) {
        notifySuccess("Patient details saved successfully.");
        handleClose();
        fetchPatientDetails();
      } else {
        notifyError("Failed to save patient details.");
      }
    } catch (error) {
      notifyError("An error occurred while saving patient details.");
    } finally {
      setLoading(false);
    }
  };

  const transformTitleValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const titleResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformTitleValues,
    [token, "GetConstantValues", "PTIT"]
  );
  const titleValues = titleResult.options as DropdownOption[];

  const transformGenderValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const genderResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformGenderValues,
    [token, "GetConstantValues", "PSEX"]
  );
  const genderValues = genderResult.options as DropdownOption[];

  const transformBloodGrpValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const bloodGrpResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformBloodGrpValues,
    [token, "GetConstantValues", "PBLD"]
  );
  const bloodGrpValues = bloodGrpResult.options as DropdownOption[];
  const transformPicValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const picResult = useDropdown(
    BillingService.fetchPicValues,
    transformPicValues,
    [token, "GetPICDropDownValues"]
  );
  const picValues = picResult.options as DropdownOption[];

  const transformAreaValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const areaResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformAreaValues,
    [token, "GetActiveAppModifyFieldsAsync", "AREA"]
  );
  const areaValues = areaResult.options as DropdownOption[];

  const transformCityValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const cityResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformCityValues,
    [token, "GetActiveAppModifyFieldsAsync", "CITY"]
  );
  const cityValues = cityResult.options as DropdownOption[];
  const transformNationalityValues = (
    data: DropdownOption[]
  ): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const nationalityResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformNationalityValues,
    [token, "GetActiveAppModifyFieldsAsync", "ACTUALCOUNTRY"]
  );
  const nationalityValues = nationalityResult.options as DropdownOption[];

  if (!pChartID || pChartID === 0) {
    return null;
  }

  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          boxShadow: 1,
          "&:hover": { boxShadow: 4 },
          marginTop: "10px",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "8px",
            "&:last-child": {
              paddingBottom: "8px",
            },
          }}
        >
          <Tooltip title="Edit Patient Details" placement="top" arrow>
            <IconButton
              onClick={handleClickOpen}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="body2" component="div" noWrap>
                {patientDetails?.patientName} | Gender: {patientDetails?.gender}
                | DOB/Age: {patientDetails?.dateOfBirthOrAge}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleClose();
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6">Edit Patient Details</Typography>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <FloatingLabelTextBox
                  ControlID="UHID"
                  title="UHID"
                  placeholder="UHID"
                  type="text"
                  size="small"
                  value={patientDemoGraph.pChartCode}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pChartCode: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                  disabled={true}
                />
                <DropdownSelect
                  label="Title"
                  name="Title"
                  value={patientDemoGraph.pTitleVal}
                  options={titleValues}
                  size="small"
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                  onChange={handleDropdownChange(
                    ["pTitleVal"],
                    ["pTitle"],
                    titleValues
                  )}
                />
                <FloatingLabelTextBox
                  ControlID="PFName"
                  title="First Name"
                  placeholder="First Name"
                  type="text"
                  size="small"
                  value={patientDemoGraph.pfName}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pfName: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
                <FloatingLabelTextBox
                  ControlID="PLName"
                  title="Last Name"
                  placeholder="Last Name"
                  type="text"
                  size="small"
                  value={patientDemoGraph.plName}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      plName: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
                <FloatingLabelTextBox
                  ControlID="DOB"
                  title="Date of Birth"
                  placeholder="Date of Birth"
                  type="date"
                  size="small"
                  value={patientDemoGraph.dob}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      dob: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
                <DropdownSelect
                  label="Gender"
                  name="Gender"
                  value={patientDemoGraph.pGenderVal}
                  options={genderValues}
                  onChange={handleDropdownChange(
                    ["pGenderVal"],
                    ["pGender"],
                    genderValues
                  )}
                  size="small"
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                />
                <DropdownSelect
                  label="BloodGrp"
                  name="BloodGrp"
                  value={patientDemoGraph.pBldGrp}
                  options={bloodGrpValues}
                  onChange={handleDropdownChange(
                    ["BloodGrpVal"],
                    ["BloodGrp"],
                    genderValues
                  )}
                  size="small"
                />
                <DropdownSelect
                  label="Payment Source [PIC]"
                  name="PIC"
                  value={String(patientDemoGraph.pTypeID)}
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
                <FloatingLabelTextBox
                  ControlID="PRegDate"
                  title="Registration Date"
                  placeholder="Registration Date"
                  type="date"
                  size="small"
                  value={patientDemoGraph.pRegDate}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pRegDate: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                  disabled={true}
                />
                <FloatingLabelTextBox
                  ControlID="IdentityNo"
                  title="Aadhaar No"
                  placeholder="Aadhaar No"
                  type="texttype"
                  size="small"
                  value={patientDemoGraph.pssnID}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pssnID: e.target.value,
                    })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
                <FloatingLabelTextBox
                  ControlID="PassportID"
                  title="Int. ID/Passport ID"
                  placeholder="Int. ID/Passport ID"
                  type="text"
                  size="small"
                  value={patientDemoGraph.intIdPsprt}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      intIdPsprt: e.target.value,
                    })
                  }
                />
                <FloatingLabelTextBox
                  ControlID="Address"
                  title="Address"
                  placeholder="Address"
                  type="text"
                  size="small"
                  value={patientDemoGraph.pAddStreet}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pAddStreet: e.target.value,
                    })
                  }
                />
                <DropdownSelect
                  label="Area"
                  name="Area"
                  value={patientDemoGraph.patAreaVal}
                  options={areaValues}
                  onChange={handleDropdownChange(
                    ["patAreaVal"],
                    ["patArea"],
                    areaValues
                  )}
                  size="small"
                />
                <DropdownSelect
                  label="City"
                  name="City"
                  value={patientDemoGraph.pAddCityVal}
                  options={cityValues}
                  onChange={handleDropdownChange(
                    ["pAddCityVal"],
                    ["pAddCity"],
                    cityValues
                  )}
                  size="small"
                />
                <DropdownSelect
                  label="Nationality"
                  name="Nationality"
                  value={patientDemoGraph.pAddActualCountryVal}
                  options={nationalityValues}
                  onChange={handleDropdownChange(
                    ["pAddActualCountryVal"],
                    ["pAddActualCountry"],
                    nationalityValues
                  )}
                  size="small"
                />
                <FloatingLabelTextBox
                  ControlID="MobileNo"
                  title="Mobile No"
                  placeholder="Mobile No"
                  type="text"
                  size="small"
                  value={patientDemoGraph.pAddPhone1}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pAddPhone1: e.target.value,
                    })
                  }
                  isMandatory={true}
                  isSubmitted={isSubmitted}
                />
                <FloatingLabelTextBox
                  ControlID="Email"
                  title="Email"
                  type="email"
                  size="small"
                  placeholder="Email"
                  value={patientDemoGraph.pAddEmail}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      pAddEmail: e.target.value,
                    })
                  }
                />
                <FloatingLabelTextBox
                  ControlID="RefferalSource"
                  title="Refferal Source"
                  type="email"
                  size="small"
                  placeholder="Refferal Source"
                  value={patientDemoGraph.refSource}
                  disabled={true}
                  onChange={(e) =>
                    setPatientDemoGraph({
                      ...patientDemoGraph,
                      refSource: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton
            variant="contained"
            text="Close"
            icon={CloseIcon}
            size="medium"
            onClick={handleClose}
            color="secondary"
          />
          <CustomButton
            variant="contained"
            text="Save"
            icon={SaveIcon}
            size="medium"
            onClick={handlePatientSave}
            color="success"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientDemographics;
