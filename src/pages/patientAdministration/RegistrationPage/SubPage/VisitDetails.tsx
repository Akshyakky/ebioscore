import { Grid, Typography, Box } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { DepartmentService } from "../../../../services/CommonService/DepartmentService";
import { ContactMastService } from "../../../../services/CommonService/ContactMastService";
import { useLoading } from "../../../../context/LoadingContext";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";

interface VisitDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  isSubmitted: boolean;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
}) => {
  const [departmentValues, setDepartmentValues] = useState<DropdownOption[]>(
    []
  );
  const [attendingPhy, setAttendingPhy] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource, setprimaryIntroducingSource] = useState<
    DropdownOption[]
  >([]);
  const { handleDropdownChange } =
    useDropdownChange<RegsitrationFormData>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<RegsitrationFormData>(setFormData);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const compID = userInfo.compID!;
  const { setLoading } = useLoading();
  const endpointDepartment = "GetActiveRegistrationDepartments";
  const endpointAttendingPhy = "GetActiveConsultants";
  const endpointPrimaryIntroducingSource = "GetActiveReferralContacts";
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const departmentValues = await DepartmentService.fetchDepartments(
          token,
          endpointDepartment,
          compID
        );
        const departmentOptions = departmentValues.map((item) => ({
          value: item.value,
          label: item.label,
        }));
        setDepartmentValues(departmentOptions);

        const attendingPhy = await ContactMastService.fetchAttendingPhysician(
          token,
          endpointAttendingPhy,
          compID
        );
        const attendingPhyOptions: DropdownOption[] = attendingPhy.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setAttendingPhy(attendingPhyOptions);
        const primaryIntroducingSource =
          await ContactMastService.fetchRefferalPhy(
            token,
            endpointPrimaryIntroducingSource,
            compID
          );
        const primaryIntroducingSourceOption: DropdownOption[] =
          primaryIntroducingSource.map((item) => ({
            value: item.value,
            label: item.label,
          }));
        setprimaryIntroducingSource(primaryIntroducingSourceOption);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    loadDropdownData();
  }, [token]);

  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];
  const isHospitalVisit = formData.OPVisits.VisitTypeVal === "H";
  const isPhysicianVisit = formData.OPVisits.VisitTypeVal === "P";
  return (
    <section aria-labelledby="visit-details-header">
      <Box>
        <Typography variant="h6" id="visit-details-header">
          VISIT DETAILS
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <RadioGroup
            name="visitDetails"
            label="Visit To"
            options={visitOptions}
            selectedValue={formData.OPVisits.VisitTypeVal}
            onChange={handleRadioButtonChange(
              ["OPVisits", "VisitTypeVal"],
              ["OPVisits", "VisitType"],
              visitOptions
            )}
            inline={true}
          />
        </Grid>
        {isHospitalVisit && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              label="Department"
              name="Department"
              value={formData.DeptID === 0 ? "" : String(formData.DeptID)}
              options={departmentValues}
              onChange={handleDropdownChange(
                ["DeptID"],
                ["DeptName"],
                departmentValues
              )}
              isSubmitted={isSubmitted}
              isMandatory={isHospitalVisit}
              size="small"
            />
          </Grid>
        )}
        {isPhysicianVisit && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="AttendingPhysician"
              label="Attending Physician"
              value={
                formData.ConsultantID === 0 ? "" : String(formData.ConsultantID)
              }
              options={attendingPhy}
              onChange={handleDropdownChange(
                ["ConsultantID"],
                ["ConsultantName"],
                attendingPhy
              )}
              isSubmitted={isSubmitted}
              isMandatory={isPhysicianVisit}
              size="small"
            />
          </Grid>
        )}
        {(isPhysicianVisit || isHospitalVisit) && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="PrimaryIntroducingSource"
              label="Primary Introducing Source"
              value={formData.SourceID === 0 ? "" : String(formData.SourceID)}
              options={primaryIntroducingSource}
              onChange={handleDropdownChange(
                ["SourceID"],
                ["SourceName"],
                primaryIntroducingSource
              )}
              isSubmitted={isSubmitted}
              isMandatory={isPhysicianVisit || isHospitalVisit}
              size="small"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}></Grid>
      </Grid>
    </section>
  );
};

export default VisitDetails;
