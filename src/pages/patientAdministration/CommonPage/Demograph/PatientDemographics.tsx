import React, { useState, useEffect } from "react";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { PatientDemographicDetails } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { useLoading } from "../../../../context/LoadingContext";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { notifyError } from "../../../../utils/Common/toastManager";
import {
  Avatar,
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
import { patientDemoGraph } from "../../../../interfaces/PatientAdministration/patientDemoGraph";
import CustomButton from "../../../../components/Button/CustomButton";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

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
  const patientDemoGraphInitialState: patientDemoGraph = {
    pChartCode: "",
    pTitleVal: "",
    pTitle: "",
    pfName: "",
    plName: "",
    dob: "",
    pGender: "",
    pGenderVal: "",
    pBldGrp: "",
    pTypeID: 0,
    pTypeName: "",
    pRegDate: "",
    pssnID: "",
    intIdPsprt: "",
    pAddStreet: "",
    patArea: "",
    patAreaVal: "",
    pAddCity: "",
    pAddCityVal: "",
    pAddActualCountry: "",
    pAddActualCountryVal: "",
  };
  const [patientDemoGraph, setPatientDemoGraph] = useState<patientDemoGraph>(
    patientDemoGraphInitialState
  );
  const { handleDropdownChange } =
    useDropdownChange<patientDemoGraph>(setPatientDemoGraph);

  useEffect(() => {
    if (pChartID && pChartID !== 0) {
      const fetchPatientDemographics = async () => {
        setLoading(true);
        try {
          const response: OperationResult<PatientDemographicDetails> =
            await RegistrationService.PatientGemogrpah(token, pChartID);
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

      fetchPatientDemographics();
    }
  }, [pChartID, token, setLoading]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePatientSave = () =>{

  };

  const transformTitleValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
  const titleResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformTitleValues,
    [token, "PTIT", "GetConstantValues"]
  );
  const titleValues = titleResult.options as DropdownOption[];

  

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
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Patient Details</DialogTitle>
        <DialogContent>
          <FloatingLabelTextBox
            ControlID="UHID"
            title="UHID"
            placeholder="UHID"
            type="text"
            size="small"
            value=""
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
          <DropdownSelect
            label="Title"
            name="Title"
            value=""
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
            value=""
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
          <FloatingLabelTextBox
            ControlID="PLName"
            title="Last Name"
            placeholder="Last Name"
            type="text"
            size="small"
            value=""
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
          <FloatingLabelTextBox
            ControlID="PRegDate"
            title="Registration Date"
            placeholder="Registration Date"
            type="date"
            size="small"
            onChange={(e) =>
              setPatientDemoGraph({
                ...patientDemoGraph,
                pChartCode: e.target.value,
              })
            }
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
          <FloatingLabelTextBox
            ControlID="IdentityNo"
            title="Aadhaar No"
            placeholder="Aadhaar No"
            type="texttype"
            size="small"
            value=""
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
          <FloatingLabelTextBox
            ControlID="PassportID"
            title="Int. ID/Passport ID"
            placeholder="Int. ID/Passport ID"
            type="text"
            size="small"
            value=""
          />
          <FloatingLabelTextBox
            ControlID="Address"
            title="Address"
            placeholder="Address"
            type="text"
            size="small"
            value=""
          />
          <FloatingLabelTextBox
            ControlID="MobileNo"
            title="Mobile No"
            placeholder="Mobile No"
            type="text"
            size="small"
            value=""
          />
          <FloatingLabelTextBox
            ControlID="Email"
            title="Email"
            type="email"
            size="small"
            placeholder="Email"
            value=""
          />
          <FloatingLabelTextBox
            ControlID="RefferalSource"
            title="Refferal Source"
            type="email"
            size="small"
            placeholder="Refferal Source"
            value=""
          />
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
