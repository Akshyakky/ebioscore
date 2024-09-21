import React, { useState, useEffect, ChangeEvent } from "react";
import { RegistrationService } from "../../../../services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { PatientDemographicDetails } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { useLoading } from "../../../../context/LoadingContext";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";
import {
  Avatar, Box, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, SelectChangeEvent,
  Tooltip, Typography, useTheme
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import { PatientDemoGraph, PatientDemoGraphError } from "../../../../interfaces/PatientAdministration/patientDemoGraph";
import CustomButton from "../../../../components/Button/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { PatientDemoGraphService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientDemoGraphService";
import { format, parseISO } from "date-fns";
import FormField, { AutocompleteFormFieldProps, SelectFormFieldProps, TextFormFieldProps } from "../../../../components/FormField/FormField";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WcIcon from '@mui/icons-material/Wc';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";

interface PatientDemographicsProps {
  pChartID: number;
}

const PatientDemographics: React.FC<PatientDemographicsProps> = ({ pChartID }) => {
  const theme = useTheme();
  const [patientDetails, setPatientDetails] = useState<PatientDemographicDetails>();
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<PatientDemoGraphError>({});
  const [patientDemoGraph, setPatientDemoGraph] = useState<PatientDemoGraph>({
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
  });

  // Use the useDropdownValues hook
  const {
    titleValues,
    genderValues,
    bloodGroupValues,
    picValues,
    areaValues,
    cityValues,
    nationalityValues,
  } = useDropdownValues();

  useEffect(() => {
    if (pChartID && pChartID !== 0) {
      fetchPatientDetails();
    }
  }, [pChartID]);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const response = await RegistrationService.PatientDemoGraph(pChartID);
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

  const fetchPatientDemographics = async () => {
    setLoading(true);
    try {
      const response: OperationResult<PatientDemoGraph> =
        await PatientDemoGraphService.getPatientDemographicsByPChartID(pChartID);
      if (response.success && response.data) {
        const formattedData = {
          ...response.data,
          dob: format(parseISO(response.data.dob), "yyyy-MM-dd"),
          pRegDate: format(parseISO(response.data.pRegDate), "yyyy-MM-dd"),
        };
        setPatientDemoGraph(formattedData);
      } else {
        notifyError("Patient demographic details not found.");
      }
    } catch (error) {
      notifyError("An error occurred while fetching patient demographic details.");
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
    if (!patientDemoGraph.pChartCode) error.pChartCode = "UHID is required.";
    if (!patientDemoGraph.pTitleVal) error.pTitleVal = "Title is required";
    if (!patientDemoGraph.pfName) error.pfName = "First Name is required";
    if (!patientDemoGraph.plName) error.plName = "Last Name is required";
    if (!patientDemoGraph.dob) error.dob = "Date of Birth is required";
    if (!patientDemoGraph.pGenderVal) error.pGenderVal = "Gender is required";
    if (!patientDemoGraph.pssnID) error.pssnID = "Identity No is required";
    if (!patientDemoGraph.pAddPhone1) error.pAddPhone1 = "Mobile No is required";
    setFormErrors(error);
    return Object.keys(error).length === 0;
  };

  const handlePatientSave = async () => {
    setIsSubmitted(true);
    if (!validateForm()) {
      notifyError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const result = await PatientDemoGraphService.savePatientDemographics(patientDemoGraph);
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

  const renderFormField = (
    type: "text" | "date" | "email" | "select" | "autocomplete",
    name: keyof PatientDemoGraph,
    label: string,
    options: { value: string; label: string }[] = [],
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
            setPatientDemoGraph({ ...patientDemoGraph, [name]: e.target.value }),
          options,
        };
        return <FormField {...selectProps} />;

      case 'date':
      case 'text':
      case 'email':
        const textProps: TextFormFieldProps = {
          ...commonProps,
          type: type,
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setPatientDemoGraph({ ...patientDemoGraph, [name]: e.target.value }),
        };
        return <FormField {...textProps} />;

      case 'autocomplete':
        const autocompleteProps: AutocompleteFormFieldProps = {
          ...commonProps,
          type: 'autocomplete',
          value: patientDemoGraph[name]?.toString() || "",
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            setPatientDemoGraph({ ...patientDemoGraph, [name]: e.target.value }),
          fetchSuggestions: async () => [],
          onSelectSuggestion: () => { },
        };
        return <FormField {...autocompleteProps} />;

      default:
        return null;
    }
  };

  if (!pChartID || pChartID === 0) {
    return null;
  }

  return (
    <>
      <Card sx={{
        boxShadow: theme.shadows[1],
        '&:hover': { boxShadow: theme.shadows[2] },
        borderRadius: '4px',
        marginBottom: '16px',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
          : 'linear-gradient(145deg, #f0f0f0 0%, #ffffff 100%)',
      }}>
        <CardContent sx={{ padding: '8px !important' }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
                <PersonIcon />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                {patientDetails?.patientName}
              </Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Chip
                    icon={<WcIcon fontSize="small" />}
                    label={patientDetails?.gender}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: '24px',
                      '& .MuiChip-label': { fontSize: '0.75rem' },
                      color: theme.palette.primary.main,
                      borderColor: theme.palette.primary.main,
                    }}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    icon={<CalendarTodayIcon fontSize="small" />}
                    label={patientDetails?.dateOfBirthOrAge}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{
                      height: '24px',
                      '& .MuiChip-label': { fontSize: '0.75rem' },
                      color: theme.palette.secondary.main,
                      borderColor: theme.palette.secondary.main,
                    }}
                  />
                </Grid>
                {patientDetails?.pBldGrp && (
                  <Grid item>
                    <Chip
                      icon={<LocalHospitalIcon fontSize="small" />}
                      label={`Blood: ${patientDetails.pBldGrp}`}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{
                        height: '24px',
                        '& .MuiChip-label': { fontSize: '0.75rem' },
                        color: theme.palette.error.main,
                        borderColor: theme.palette.error.main,
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item>
              <Tooltip title="Edit Patient Details" placement="top" arrow>
                <IconButton
                  onClick={handleClickOpen}
                  color="primary"
                  size="medium"
                  sx={{
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(144, 202, 249, 0.08)'
                      : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(144, 202, 249, 0.16)'
                        : 'rgba(25, 118, 210, 0.16)'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
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
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }
        }}
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
                {renderFormField("select", "pBldGrp", "Blood Group", bloodGroupValues, false, false, { xs: 12 })}
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