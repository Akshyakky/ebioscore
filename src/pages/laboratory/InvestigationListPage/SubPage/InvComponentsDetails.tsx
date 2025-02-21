import React, { useCallback, useEffect, useState, ChangeEvent, ReactNode } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent, Button, IconButton, RadioGroup, FormControlLabel, Radio, Grow, Fade } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { LCompAgeRangeDto, LCompMultipleDto, LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import CustomButton from "@/components/Button/CustomButton";
import ApplicableAgeRangeTable from "./ApplicableAgeRanges";
import CompMultipleDetails from "./CompMultipleDetails";
import CompTemplateDetails from "./CompTemplateDetails";

interface LComponentDetailsProps {
  onUpdate: (componentData: LComponentDto) => void;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
  onUpdateAgeRange: (ageRangeData: LCompAgeRangeDto) => void;
  onUpdateTemplate: (ageRangeData: LCompTemplateDto) => void;
  selectedComponent?: LComponentDto;
  setSelectedComponent: React.Dispatch<React.SetStateAction<LComponentDto | null>>;
}

const mainGroupOptions = [
  { value: "1", label: "Group 1" },
  { value: "2", label: "Group 2" },
];

const subTitleOptions = [
  { value: "1", label: "Title 1" },
  { value: "2", label: "Title 2" },
];

const LComponentDetails: React.FC<LComponentDetailsProps> = ({ onUpdate, onUpdateCompMultiple, onUpdateAgeRange, onUpdateTemplate, selectedComponent, setSelectedComponent }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [formState, setFormState] = useState<LComponentDto>({
    invID: 0,
    invNameCD: "",
    lCentID: 0,
    deptID: 1,
    compoID: 0,
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

  const [formComp, setFormComp] = useState<LCompMultipleDto>({
    cmID: 0,
    cmValues: "",
    compOID: 0,
    defaultYN: "Y",
    compID: compID || 1,
    compCode: compCode || "",
    compName: compName || "",
    rModifiedID: userID || 0,
    rModifiedBy: userName || "",
    rCreatedID: userID || 0,
    rCreatedBy: userName || "",
    rCreatedOn: serverDate || new Date(),
    rModifiedOn: serverDate || new Date(),
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  });

  const [ageRanges, setAgeRanges] = useState<LCompAgeRangeDto[]>([]);
  const dropdownValues = useDropdownValues(["entryType"]);
  const [selectedLCentID, setSelectedLCentID] = useState<number | null>(null);

  // Add useEffect to populate form when selectedComponent changes
  useEffect(() => {
    if (selectedComponent) {
      console.log("Populating component form with:", selectedComponent);
      setFormState({
        ...formState,
        ...selectedComponent,
        // Ensure all required fields are set
        compoID: selectedComponent.compoID || 0,
        compOCodeCD: selectedComponent.compOCodeCD || "",
        compoNameCD: selectedComponent.compoNameCD || "",
        cShortNameCD: selectedComponent.cShortNameCD || "",
        lCentID: selectedComponent.lCentID || 0,
        compInterpretCD: selectedComponent.compInterpretCD || "",
        compUnitCD: selectedComponent.compUnitCD || "",
        cNHSEnglishNameCD: selectedComponent.cNHSEnglishNameCD || "",
        deltaValPercent: selectedComponent.deltaValPercent,
      });

      // Set the entry type
      if (selectedComponent.lCentID) {
        setSelectedLCentID(selectedComponent.lCentID);
      }
    }
  }, [selectedComponent]);

  const handleTextInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));

    setFormComp((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, child: ReactNode) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "lCentID") {
      setSelectedLCentID(Number(value));
    }
  };

  const handleAddAgeRange = (newAgeRange: LCompAgeRangeDto) => {
    setAgeRanges((prev) => [...prev, newAgeRange]);
    onUpdateAgeRange(newAgeRange);
  };

  const handleOkClick = () => {
    debugger;
    if (!formState.compCode || !formState.compName || !formState.lCentID) {
      showAlert("error", "Please fill all required fields", "error");
      return;
    }

    // First update component to get the compoID
    onUpdate(formState);

    // If it's a template type component, update the template with the correct compoID
    if (formState.lCentID === 7) {
      const componentToUse = {
        ...formState,
        compoID: formState.compoID || 0, // This will be the newly created component's ID
      };

      // Pass the updated component to CompTemplateDetails
      setSelectedComponent(componentToUse);
    }

    // Update multiple choice if applicable
    if (formState.lCentID === 5) {
      onUpdateCompMultiple(formComp);
    }

    // Update age range if applicable
    if (formState.lCentID === 6 && ageRanges.length > 0) {
      ageRanges.forEach((range) => onUpdateAgeRange(range));
    }

    // Clear form after saving
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

    setFormComp({
      cmID: 0,
      cmValues: "",
      compOID: 0,
      defaultYN: "Y",
      compID: compID || 1,
      compCode: compCode || "",
      compName: compName || "",
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
      rCreatedID: userID || 0,
      rCreatedBy: userName || "",
      rCreatedOn: serverDate || new Date(),
      rModifiedOn: serverDate || new Date(),
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
    setAgeRanges([]);
  };

  const handleClose = () => {
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
            value={formState.lCentID?.toString() || ""}
            onChange={handleSelectChange}
            options={dropdownValues["entryType"] || []}
            ControlID="entryType"
            gridProps={{ xs: 12 }}
          />
        </Grid>
      </Grid>

      {selectedLCentID === 5 && <CompMultipleDetails compName={compName || ""} onUpdateCompMultiple={onUpdateCompMultiple} />}

      {selectedLCentID === 6 && (
        <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#f5f5f5", boxShadow: 1 }}>
          <ApplicableAgeRangeTable ageRanges={ageRanges} componentId={formState.compoID} onAddAgeRange={handleAddAgeRange} />
        </Box>
      )}

      {selectedLCentID === 7 && (
        <CompTemplateDetails
          onUpdateTemplate={onUpdateTemplate}
          selectedComponent={{
            ...formState,
            compoID: formState.compoID || 0,
          }}
        />
      )}

      <CustomButton variant="contained" color="primary" onClick={handleOkClick} sx={{ marginTop: 3 }}>
        OK
      </CustomButton>
      <CustomButton variant="contained" color="error" onClick={handleClose} sx={{ marginTop: 3 }}>
        Close
      </CustomButton>
    </Paper>
  );
};

export default LComponentDetails;
