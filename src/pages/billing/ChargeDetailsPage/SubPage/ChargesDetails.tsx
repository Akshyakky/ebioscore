import React, { useState, useEffect, useCallback } from "react";
import { Paper, Grid, Typography, Button, SelectChangeEvent } from "@mui/material";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import { chargeDetailsService, serviceGroupService } from "../../../../services/BillingServices/BillingGenericService";
import FormField from "../../../../components/FormField/FormField";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { BServiceGrpDto } from "../../../../interfaces/Billing/BServiceGrpDto";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { showAlert } from "../../../../utils/Common/showAlert";
const ChargeDetails: React.FC = () => {
  const [formData, setFormData] = useState<ChargeDetailsDto>({
    chargeInfo: {
      rActiveYN: "Y",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "N",
      rNotes: "",
      chargeID: 0,
      chargeCode: "",
      chargeDesc: "",
      chargesHDesc: "",
      chargeDescLang: "",
      cShortName: "",
      chargeType: "",
      sGrpID: 0,
      chargeTo: "",
      chargeStatus: "",
      chargeBreakYN: "N",
      bChID: 0,
      regServiceYN: "N",
      regDefaultServiceYN: "N",
      isBedServiceYN: "N",
      doctorShareYN: "N",
      cNhsCode: "",
      cNhsEnglishName: "",
      nhsCstWt: "",
      chargeCost: "",
    },
    chargeDetails: [],
    chargeAliases: [],
  });

  const dropdownValues = useDropdownValues(["service"]);
  const [serviceGroups, setServiceGroups] = useState<any[]>([]);
  const [calculationType, setCalculationType] = useState("percentage");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        const response = await serviceGroupService.getAll();
        console.log("Service Groups Response:", response);

        // Accessing the data property in the response
        if (response.success && Array.isArray(response.data)) {
          setServiceGroups(
            response.data.map((group: BServiceGrpDto) => ({
              value: group.sGrpID.toString(),
              label: group.sGrpName,
            }))
          );
        } else {
          console.error("Service Groups is not an array or request was unsuccessful:", response);
        }
      } catch (error) {
        console.error("Error fetching service groups:", error);
      }
    };
    fetchServiceGroups();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: value,
      },
    }));
  };

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      chargeInfo: {
        ...prevState.chargeInfo,
        [name]: value,
      },
    }));
  }, []);

  const handleSwitchChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        [name]: checked ? "Y" : "N",
      },
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      // Prepare the payload for saving to ChargeDetailsDto using chargeDetailsService
      const payload: ChargeDetailsDto = {
        ...formData,
        chargeInfo: {
          ...formData.chargeInfo,
          sGrpID: parseInt(formData.chargeInfo.sGrpID.toString()), // Ensure sGrpID is a number
        },
      };

      // Use chargeDetailsService to save the form data
      const saveResponse = await chargeDetailsService.save(payload);

      if (saveResponse) {
        showAlert("Success", "Form saved successfully!", "success");
      } else {
        showAlert("Error", "Form save failed!", "error");
      }
    } catch (error) {
      // Enhanced error handling
      console.error("Error saving form:", error);

      // Check if the error object contains a response with data and errors
    }
  };

  const handleClear = () => {
    // Clear form data
    setFormData({
      chargeInfo: {
        rActiveYN: "Y",
        compID: 0,
        compCode: "",
        compName: "",
        transferYN: "N",
        rNotes: "",
        chargeID: 0,
        chargeCode: "",
        chargeDesc: "",
        chargesHDesc: "",
        chargeDescLang: "",
        cShortName: "",
        chargeType: "",
        sGrpID: 0,
        chargeTo: "",
        chargeStatus: "",
        chargeBreakYN: "N",
        bChID: 0,
        regServiceYN: "N",
        regDefaultServiceYN: "N",
        isBedServiceYN: "N",
        doctorShareYN: "N",
        cNhsCode: "",
        cNhsEnglishName: "",
        nhsCstWt: "",
        chargeCost: "",
      },
      chargeDetails: [],
      chargeAliases: [],
    });
    setIsSubmitted(false);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="charge-details-header">
        Charge Details
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Code"
          value={formData.chargeInfo.chargeCode}
          onChange={handleInputChange}
          name="chargeCode"
          ControlID="chargeCode"
          placeholder="SOC Code"
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="select"
          label="Service Type"
          value={formData.chargeInfo.chargeType}
          onChange={handleSelectChange}
          name="chargeType"
          ControlID="chargeType"
          options={dropdownValues.service}
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Name"
          value={formData.chargeInfo.chargeDesc}
          onChange={handleInputChange}
          name="chargeDesc"
          ControlID="chargeDesc"
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="select"
          label="Service Group"
          value={formData.chargeInfo.sGrpID.toString()}
          onChange={handleSelectChange}
          name="sGrpID"
          ControlID="sGrpID"
          options={serviceGroups}
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Short Name"
          value={formData.chargeInfo.cShortName}
          onChange={handleInputChange}
          name="cShortName"
          ControlID="cShortName"
          isSubmitted={isSubmitted}
        />

        <FormField
          type="number"
          label="Cost"
          value={formData.chargeInfo.chargeCost}
          onChange={handleInputChange}
          name="chargeCost"
          ControlID="chargeCost"
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Resource Code"
          value={formData.chargeInfo.cNhsCode}
          onChange={handleInputChange}
          name="cNhsCode"
          ControlID="cNhsCode"
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Resource Name"
          value={formData.chargeInfo.cNhsEnglishName}
          onChange={handleInputChange}
          name="cNhsEnglishName"
          ControlID="cNhsEnglishName"
          isSubmitted={isSubmitted}
        />

        <FormField
          type="switch"
          label="Is Package"
          value={formData.chargeInfo.regServiceYN}
          checked={formData.chargeInfo.regServiceYN === "Y"}
          onChange={handleSwitchChange("regServiceYN")}
          name="regServiceYN"
          ControlID="regServiceYN"
        />

        <FormField
          type="switch"
          label="Apply Doctor % Share"
          value={formData.chargeInfo.doctorShareYN}
          checked={formData.chargeInfo.doctorShareYN === "Y"}
          onChange={handleSwitchChange("doctorShareYN")}
          name="doctorShareYN"
          ControlID="doctorShareYN"
        />

        {/* Additional Fields if needed */}

        <Grid item xs={12} sx={{ textAlign: "right", marginTop: 2 }}>
          <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ChargeDetails;
