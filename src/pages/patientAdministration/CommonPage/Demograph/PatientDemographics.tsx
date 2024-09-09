import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import { RegistrationService } from "../../../../services/PatientAdministrationServices/RegistrationService/RegistrationService";
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
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
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
import { BillingService } from "../../../../services/BillingServices/BillingService";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import { PatientDemoGraphService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientDemoGraphService";
import { format, parseISO } from "date-fns";
import FormField, { AutocompleteFormFieldProps, SelectFormFieldProps, TextFormFieldProps } from "../../../../components/FormField/FormField";

interface PatientDemographicsProps {
  pChartID: number;
}

const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  pChartID,
}) => {
  const [patientDetails, setPatientDetails] =
    useState<PatientDemographicDetails>();
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
    dob: format(new Date(), "yyyy-MM-dd"),
    pGender: "",
    pGenderVal: "",
    pBldGrp: "",
    pTypeID: 0,
    pTypeName: "",
    pRegDate: format(new Date(), "yyyy-MM-dd"),
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
    debugger
    setLoading(true);
    try {
      const response = await RegistrationService.PatientDemoGraph(
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
  }, [pChartID]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "yyyy-MM-dd");
  };

  const fetchPatientDemographics = async () => {
    setLoading(true);
    try {
      const response: OperationResult<PatientDemoGraph> =
        await PatientDemoGraphService.getPatientDemographicsByPChartID(
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

  const memoizedParams = useMemo(
    () => ["GetConstantValues", "PTIT"],
    []
  );
  const titleResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformTitleValues,
    memoizedParams
  );
  const titleValues = titleResult.options as DropdownOption[];

  const transformGenderValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForGender = useMemo(
    () => ["GetConstantValues", "PSEX"],
    []
  );
  const genderResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformGenderValues,
    memoizedParamsForGender
  );
  const genderValues = genderResult.options as DropdownOption[];

  const transformBloodGrpValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForBloodGrp = useMemo(
    () => ["GetConstantValues", "PBLD"],
    []
  );
  const bloodGrpResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformBloodGrpValues,
    memoizedParamsForBloodGrp
  );
  const bloodGrpValues = bloodGrpResult.options as DropdownOption[];

  const transformPicValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForPic = useMemo(
    () => ["GetPICDropDownValues"],
    []
  );
  const picResult = useDropdown(
    BillingService.fetchPicValues,
    transformPicValues,
    memoizedParamsForPic
  );
  const picValues = picResult.options as DropdownOption[];

  const transformAreaValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForArea = useMemo(
    () => ["GetActiveAppModifyFieldsAsync", "AREA"],
    []
  );
  const areaResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformAreaValues,
    memoizedParamsForArea
  );
  const areaValues = areaResult.options as DropdownOption[];

  const transformCityValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForCity = useMemo(
    () => ["GetActiveAppModifyFieldsAsync", "CITY"],
    []
  );
  const cityResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformCityValues,
    memoizedParamsForCity
  );
  const cityValues = cityResult.options as DropdownOption[];

  const transformNationalityValues = (
    data: DropdownOption[]
  ): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParamsForNationality = useMemo(
    () => ["GetActiveAppModifyFieldsAsync", "ACTUALCOUNTRY"],
    []
  );
  const nationalityResult = useDropdown(
    AppModifyListService.fetchAppModifyList,
    transformNationalityValues,
    memoizedParamsForNationality
  );
  const nationalityValues = nationalityResult.options as DropdownOption[];

  if (!pChartID || pChartID === 0) {
    return null;
  }

  const renderFormField = (
    type: "text" | "date" | "email" | "select" | "autocomplete",
    name: keyof PatientDemoGraph,
    label: string,
    options: DropdownOption[] = [],
    isMandatory: boolean = false,
    disabled: boolean = false,
    gridProps: { xs: number; sm?: number; md?: number } = { xs: 12, sm: 6 }
  ) => {
    const commonProps = {
      label,
      name,
      ControlID: name,
      isMandatory,
      isSubmitted,
      errorMessage: formErrors[name as keyof PatientDemoGraphError],
      disabled,
      gridProps,
    };

    switch (type) {
      case 'select':
        const selectProps: SelectFormFieldProps = {
          ...commonProps,
          type: 'select',
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: SelectChangeEvent<string>) =>
            setPatientDemoGraph({
              ...patientDemoGraph,
              [name]: e.target.value,
            }),
          options,
        };
        return <FormField {...selectProps} />;

      case 'date':
        const dateProps: TextFormFieldProps = {
          ...commonProps,
          type: 'date',
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setPatientDemoGraph({
              ...patientDemoGraph,
              [name]: e.target.value,
            }),
        };
        return <FormField {...dateProps} />;

      case 'autocomplete':
        const autocompleteProps: AutocompleteFormFieldProps = {
          ...commonProps,
          type: 'autocomplete',
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setPatientDemoGraph({
              ...patientDemoGraph,
              [name]: e.target.value,
            }),
          fetchSuggestions: async () => [],
          onSelectSuggestion: () => { },
        };
        return <FormField {...autocompleteProps} />;

      default:
        const textProps: TextFormFieldProps = {
          ...commonProps,
          type: type as "text" | "email",
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setPatientDemoGraph({
              ...patientDemoGraph,
              [name]: e.target.value,
            }),
        };
        return <FormField {...textProps} />;
    }
  };

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
            "&:last-child": { paddingBottom: "8px" },
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
                {patientDetails?.patientName} | Gender: {patientDetails?.gender}{" "}
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
                {renderFormField("text", "pChartCode", "UHID", [], true, true, { xs: 12 })}
                {renderFormField("select", "pTitleVal", "Title", titleValues, true, false, { xs: 12 })}
                {renderFormField("select", "pGenderVal", "Gender", genderValues, true, false, { xs: 12 })}
                {renderFormField("text", "pfName", "First Name", [], true, false, { xs: 12 })}
                {renderFormField("text", "plName", "Last Name", [], true, false, { xs: 12 })}
                {renderFormField("date", "dob", "Date of Birth", [], true, false, { xs: 12 })}
                {renderFormField("select", "pBldGrp", "Blood Group", bloodGrpValues, false, false, { xs: 12 })}
                {renderFormField("select", "pTypeID", "Payment Source [PIC]", picValues, true, false, { xs: 12 })}
                {renderFormField("date", "pRegDate", "Registration Date", [], true, true, { xs: 12 })}
                {renderFormField("text", "pssnID", "Aadhaar No", [], true, false, { xs: 12 })}
                {renderFormField("text", "intIdPsprt", "Int. ID/Passport ID", [], false, false, { xs: 12 })}
                {renderFormField("text", "pAddStreet", "Address", [], false, false, { xs: 12 })}
                {renderFormField("select", "patAreaVal", "Area", areaValues, false, false, { xs: 12 })}
                {renderFormField("select", "pAddCityVal", "City", cityValues, false, false, { xs: 12 })}
                {renderFormField("select", "pAddActualCountryVal", "Nationality", nationalityValues, false, false, { xs: 12 })}
                {renderFormField("text", "pAddPhone1", "Mobile No", [], true, false, { xs: 12 })}
                {renderFormField("email", "pAddEmail", "Email", [], false, false, { xs: 12 })}
                {renderFormField("text", "refSource", "Referral Source", [], false, true, { xs: 12 })}
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
