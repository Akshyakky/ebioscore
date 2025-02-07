import React, { useCallback, useEffect, useState, ChangeEvent, ReactNode } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent, Button } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";

interface LComponentDetailsProps {
  onUpdate: (componentData: LComponentDto) => void; // Function to pass updated data to parent
}

const mainGroupOptions = [
  { value: "1", label: "Group 1" },
  { value: "2", label: "Group 2" },
];

const subTitleOptions = [
  { value: "1", label: "Title 1" },
  { value: "2", label: "Title 2" },
];

const LComponentDetails: React.FC<LComponentDetailsProps> = ({ onUpdate }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [formState, setFormState] = useState<LComponentDto>({
    invID: 0,
    invNameCD: "",
    lCentID: 0,
    deptID: 1,
    lCentNameCD: "",
    lCentTypeCD: "",
    compDetailYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    compInterpretCD: "",
    compUnitCD: "",
    compOCodeCD: "",
    cShortNameCD: "",
    cNHSEnglishNameCD: "",
    deltaValPercent: undefined,
    compID: compID || 1,
    compCode: compCode || "",
    compName: compName || "",
    rModifiedID: userID || 0,
    rModifiedBy: userName || "",
    rCreatedID: userID || 0,
    rCreatedBy: userName || "",
    rCreatedOn: serverDate || new Date(),
    rModifiedOn: serverDate || new Date(),
  });
  const dropdownValues = useDropdownValues(["entryType"]);

  const handleTextInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
    const { name, value } = event.target;
    if (name) {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleOkClick = () => {
    if (!formState.compCode || !formState.compName || !formState.lCentID) {
      showAlert("error", "Please fill all required fields", "error");
      return;
    }

    onUpdate(formState);
    setFormState({
      invID: 0,
      invNameCD: "",
      lCentID: 0,
      deptID: 1,
      lCentNameCD: "",
      lCentTypeCD: "",
      compDetailYN: "N",
      rActiveYN: "Y",
      transferYN: "N",
      compInterpretCD: "",
      compUnitCD: "",
      compOCodeCD: "",
      cShortNameCD: "",
      cNHSEnglishNameCD: "",
      deltaValPercent: undefined,
      compID: compID || 1,
      compCode: compCode || "",
      compName: compName || "",
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
      rCreatedID: userID || 0,
      rCreatedBy: userName || "",
      rCreatedOn: serverDate || new Date(),
      rModifiedOn: serverDate || new Date(),
    });
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Add New Component
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormField
            type="text"
            label="Component Code"
            name="compOCodeCD"
            value={formState.compOCodeCD}
            onChange={handleTextInputChange}
            ControlID="compOCodeCD"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="text"
            label="Component Name"
            name="compoNameCD"
            value={formState.compoNameCD}
            onChange={handleTextInputChange}
            ControlID="compoNameCD"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="text"
            label="Component Name"
            name="compoNameCD"
            value={formState.compoNameCD}
            onChange={handleTextInputChange}
            ControlID="compoNameCD"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="select"
            label="Maingroup"
            name="mGrpID"
            value={formState.mGrpID?.toString() || ""}
            onChange={handleSelectChange}
            options={mainGroupOptions}
            ControlID="mGrpID"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="textarea"
            label="Method"
            name="compInterpretCD"
            value={formState.compInterpretCD}
            onChange={handleTextInputChange}
            ControlID="method"
            rows={4}
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="textarea"
            label="Interpretation"
            name="compUnitCD"
            value={formState.compUnitCD}
            onChange={handleTextInputChange}
            ControlID="interpretation"
            rows={4}
            gridProps={{ xs: 12 }}
          />
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <FormField
            type="text"
            label="Short Name"
            name="cShortNameCD"
            value={formState.cShortNameCD}
            onChange={handleTextInputChange}
            ControlID="shortName"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="select"
            label="Sub Title"
            name="compoTitleCD"
            value={formState.compoTitleCD}
            onChange={handleSelectChange}
            options={subTitleOptions}
            ControlID="subTitle"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="textarea"
            label="Sample"
            name="cNHSEnglishNameCD"
            value={formState.cNHSEnglishNameCD}
            onChange={handleTextInputChange}
            ControlID="sample"
            rows={4}
            gridProps={{ xs: 12 }}
          />
          <FormField type="text" label="Units" name="compUnitCD" value={formState.compUnitCD} onChange={handleTextInputChange} ControlID="units" gridProps={{ xs: 12 }} />
          <FormField
            type="number"
            label="Delta Value"
            name="deltaValPercent"
            value={formState.deltaValPercent || ""}
            onChange={handleTextInputChange}
            ControlID="deltaValue"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="select"
            label="Entry Type"
            name="lCentID"
            value={formState.lCentID}
            onChange={handleSelectChange}
            options={dropdownValues["entryType"] || []}
            ControlID="entryType"
            gridProps={{ xs: 12 }}
          />
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleOkClick} sx={{ marginTop: 3 }}>
        OK
      </Button>
    </Paper>
  );
};

export default LComponentDetails;
