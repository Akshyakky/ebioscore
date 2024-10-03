import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar, Box, Card, CardContent, Chip, Grid, IconButton,
  SelectChangeEvent, Tooltip, Typography, useTheme
} from '@mui/material';
import { PersonOutline, Edit, CalendarToday, LocalHospital, Close, Save } from '@mui/icons-material';
import { PatientDemographicDetails } from '../../../../interfaces/PatientAdministration/registrationFormData';
import { RegistrationService } from '../../../../services/PatientAdministrationServices/RegistrationService/RegistrationService';
import { useLoading } from '../../../../context/LoadingContext';
import CustomButton from '../../../../components/Button/CustomButton';
import FormField from '../../../../components/FormField/FormField';
import { PatientDemoGraph, PatientDemoGraphError } from '../../../../interfaces/PatientAdministration/patientDemoGraph';
import { useServerDate } from '../../../../hooks/Common/useServerDate';
import useDropdownValues from '../../../../hooks/PatientAdminstration/useDropdownValues';
import { notifyError, notifySuccess } from '../../../../utils/Common/toastManager';
import { PatientDemoGraphService } from '../../../../services/PatientAdministrationServices/RegistrationService/PatientDemoGraphService';
import GenericDialog from '../../../../components/GenericDialog/GenericDialog';

interface PatientDemographicsProps {
  pChartID: number;
}

const PatientDemographics: React.FC<PatientDemographicsProps> = ({ pChartID }) => {
  const theme = useTheme();
  const [patientDetails, setPatientDetails] = useState<PatientDemographicDetails | null>(null);
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<PatientDemoGraphError>({});
  const serverDate = useServerDate();
  const [patientDemoGraph, setPatientDemoGraph] = useState<PatientDemoGraph>({
    pChartID: 0,
    pChartCode: '',
    pTitleVal: '',
    pTitle: '',
    pfName: '',
    plName: '',
    dob: serverDate,
    pGender: '',
    pGenderVal: '',
    pBldGrp: '',
    pTypeID: 0,
    pTypeName: '',
    pRegDate: serverDate,
    indentityType: '',
    indentityValue: '',
    intIdPsprt: '',
    pAddStreet: '',
    patArea: '',
    patAreaVal: '',
    pAddCity: '',
    pAddCityVal: '',
    pAddActualCountry: '',
    pAddActualCountryVal: '',
    pAddPhone1: '',
    pAddEmail: '',
    refSource: '',
  });

  const {
    titleValues,
    genderValues,
    bloodGroupValues,
    picValues,
    areaValues,
    cityValues,
    nationalityValues,
  } = useDropdownValues();

  const fetchPatientDetails = useCallback(async () => {
    if (!pChartID) return;
    setLoading(true);
    try {
      const response = await RegistrationService.PatientDemoGraph(pChartID);
      if (response.success && response.data) {
        setPatientDetails(response.data);
      } else {
        notifyError('Patient details not found.');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while fetching patient details.');
    } finally {
      setLoading(false);
    }
  }, [pChartID, setLoading]);

  useEffect(() => {
    fetchPatientDetails();
  }, [fetchPatientDetails]);

  const fetchPatientDemographics = useCallback(async () => {
    if (!pChartID) return;
    setLoading(true);
    try {
      const response = await PatientDemoGraphService.getPatientDemographicsByPChartID(pChartID);
      if (response.success && response.data) {
        setPatientDemoGraph({
          ...response.data,
          dob: response.data.dob,
          pRegDate: response.data.pRegDate,
        });
      } else {
        notifyError('Patient demographic details not found.');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while fetching patient demographics.');
    } finally {
      setLoading(false);
    }
  }, [pChartID, setLoading]);

  const handleClickOpen = useCallback(() => {
    fetchPatientDemographics();
    setOpen(true);
  }, [fetchPatientDemographics]);

  const handleClose = useCallback(() => {
    setIsSubmitted(false);
    setOpen(false);
  }, []);

  const validateForm = useCallback(() => {
    const error: PatientDemoGraphError = {};
    if (!patientDemoGraph.pChartCode) error.pChartCode = 'UHID is required.';
    if (!patientDemoGraph.pTitleVal) error.pTitleVal = 'Title is required';
    if (!patientDemoGraph.pfName) error.pfName = 'First Name is required';
    if (!patientDemoGraph.plName) error.plName = 'Last Name is required';
    if (!patientDemoGraph.dob) error.dob = 'Date of Birth is required';
    if (!patientDemoGraph.pGenderVal) error.pGenderVal = 'Gender is required';
    if (!patientDemoGraph.indentityValue) error.indentityValue = 'Identity No is required';
    if (!patientDemoGraph.pAddPhone1) error.pAddPhone1 = 'Mobile No is required';
    setFormErrors(error);
    return Object.keys(error).length === 0;
  }, [patientDemoGraph]);

  const handlePatientSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!validateForm()) {
      notifyError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const result = await PatientDemoGraphService.savePatientDemographics(patientDemoGraph);
      if (result.success) {
        notifySuccess('Patient details saved successfully.');
        handleClose();
        fetchPatientDetails();
      } else {
        notifyError('Failed to save patient details.');
      }
    } catch (err) {
      notifyError('An unexpected error occurred while saving patient details.');
    } finally {
      setLoading(false);
    }
  }, [validateForm, patientDemoGraph, handleClose, fetchPatientDetails, setLoading]);

  const handleInputChange = useCallback((name: keyof PatientDemoGraph, value: string | number | Date | null) => {
    setPatientDemoGraph(prev => {
      if (name === 'dob' || name === 'pRegDate') {
        return { ...prev, [name]: value ? value : serverDate };
      }
      return { ...prev, [name]: value };
    });
  }, [serverDate]);

  const renderFormField = useCallback((
    type: "text" | "select" | "datepicker",
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
        return (
          <FormField
            {...commonProps}
            type="select"
            value={patientDemoGraph[name]?.toString() || ""}
            onChange={(e: SelectChangeEvent<string>) => handleInputChange(name, e.target.value)}
            options={options}
          />
        );
      case 'datepicker':
        return (
          <FormField
            {...commonProps}
            type="datepicker"
            value={patientDemoGraph[name] || null}
            onChange={(date: Date | null) => handleInputChange(name, date)}
          />
        );
      default:
        return (
          <FormField
            {...commonProps}
            type="text"
            value={patientDemoGraph[name]?.toString() || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(name, e.target.value)}
          />
        );
    }
  }, [patientDemoGraph, isSubmitted, formErrors, handleInputChange]);

  const dialogContent = (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          {renderFormField("text", "pChartCode", "UHID", [], true, true, { xs: 12 })}
          {renderFormField("select", "pTitleVal", "Title", titleValues, true, false, { xs: 12 })}
          {renderFormField("select", "pGenderVal", "Gender", genderValues, true, false, { xs: 12 })}
          {renderFormField("text", "pfName", "First Name", [], true, false, { xs: 12 })}
          {renderFormField("text", "plName", "Last Name", [], true, false, { xs: 12 })}
          {renderFormField("datepicker", "dob", "Date of Birth", [], true, false, { xs: 12 })}
          {renderFormField("select", "pBldGrp", "Blood Group", bloodGroupValues, false, false, { xs: 12 })}
          {renderFormField("select", "pTypeID", "Payment Source [PIC]", picValues, true, false, { xs: 12 })}
          {renderFormField("datepicker", "pRegDate", "Registration Date", [], true, true, { xs: 12 })}
          {renderFormField("text", "indentityValue", "Aadhaar No", [], true, false, { xs: 12 })}
          {renderFormField("text", "intIdPsprt", "Int. ID/Passport ID", [], false, false, { xs: 12 })}
          {renderFormField("text", "pAddStreet", "Address", [], false, false, { xs: 12 })}
          {renderFormField("select", "patAreaVal", "Area", areaValues, false, false, { xs: 12 })}
          {renderFormField("select", "pAddCityVal", "City", cityValues, false, false, { xs: 12 })}
          {renderFormField("select", "pAddActualCountryVal", "Nationality", nationalityValues, false, false, { xs: 12 })}
          {renderFormField("text", "pAddPhone1", "Mobile No", [], true, false, { xs: 12 })}
          {renderFormField("text", "pAddEmail", "Email", [], false, false, { xs: 12 })}
          {renderFormField("text", "refSource", "Referral Source", [], false, true, { xs: 12 })}
        </Grid>
      </Grid>
    </Box>
  );

  const dialogActions = (
    <>
      <CustomButton
        variant="contained"
        text="Close"
        icon={Close}
        size="medium"
        onClick={handleClose}
        color="secondary"
      />
      <CustomButton
        variant="contained"
        text="Save"
        icon={Save}
        size="medium"
        onClick={handlePatientSave}
        color="success"
      />
    </>
  );

  if (!pChartID) {
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
                <PersonOutline />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                {patientDetails?.patientName}
              </Typography>
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Chip
                    icon={<PersonOutline fontSize="small" />}
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
                    icon={<CalendarToday fontSize="small" />}
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
                      icon={<LocalHospital fontSize="small" />}
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
                  <Edit />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <GenericDialog
        open={open}
        onClose={handleClose}
        title="Edit Patient Details"
        maxWidth="sm"
        fullWidth
        actions={dialogActions}
      >
        {dialogContent}
      </GenericDialog>
    </>
  );
};

export default React.memo(PatientDemographics);