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
  selectedComponent?: LComponentDto & { ageRanges?: LCompAgeRangeDto[] };
  setSelectedComponent: React.Dispatch<React.SetStateAction<LComponentDto | null>>;
}

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
  const dropdownValues = useDropdownValues(["entryType", "mainGroup", "subTitle"]);
  const [selectedLCentID, setSelectedLCentID] = useState<number | null>(null);

  useEffect(() => {
    if (selectedComponent) {
      setFormState(selectedComponent);
      setSelectedLCentID(selectedComponent.lCentID || null);
      if (selectedComponent.lCentID === 6) {
        const componentAgeRanges = selectedComponent.ageRanges || [];
        setAgeRanges(componentAgeRanges);
      }
    }
  }, [selectedComponent?.compoID]);

  const handleTextInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    if (name === "lCentID") {
      setSelectedLCentID(Number(value));
    }
  }, []);

  const handleOkClick = useCallback(() => {
    debugger;
    if (!formState.compCode || !formState.compName || !formState.lCentID) {
      showAlert("error", "Please fill all required fields", "error");
      return;
    }

    const componentWithAgeRanges = {
      ...formState,
      ageRanges: formState.lCentID === 6 ? ageRanges : [],
    };
    onUpdate(componentWithAgeRanges);
    if (formState.lCentID === 7) {
      setSelectedComponent(componentWithAgeRanges);
    } else if (formState.lCentID === 5 && formComp) {
      onUpdateCompMultiple(formComp);
    } else if (formState.lCentID === 6 && ageRanges.length > 0) {
      ageRanges.forEach((range) => {
        onUpdateAgeRange({
          ...range,
          compOID: formState.compoID,
          cappID: formState.compoID,
        });
      });
    }
  }, [formState, formComp, ageRanges, onUpdate, onUpdateCompMultiple, onUpdateAgeRange, setSelectedComponent]);

  const handleAgeRangeUpdate = useCallback(
    (newAgeRange: LCompAgeRangeDto) => {
      setAgeRanges((prev) => {
        const exists = prev.some((range) => range.carSex === newAgeRange.carSex && range.carStart === newAgeRange.carStart && range.carEnd === newAgeRange.carEnd);

        if (!exists) {
          const updatedRange = {
            ...newAgeRange,
            compOID: formState.compoID,
            cappID: formState.compoID,
          };
          return [...prev, updatedRange];
        }
        return prev;
      });
    },
    [formState.compoID]
  );

  const handleClose = () => {
    setFormState({
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
    setSelectedLCentID(null);
    setSelectedComponent(null);
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
            label="Maingroup "
            value={formState.mGrpID || ""}
            onChange={handleSelectChange}
            name="mGrpID"
            ControlID="mGrpID"
            options={dropdownValues.mainGroup || [{ value: "", label: "Loading..." }]}
            isMandatory
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
            value={formState.compoTitleCD || ""}
            onChange={handleSelectChange}
            name="compoTitleCD"
            ControlID="compoTitleCD"
            options={dropdownValues.subTitle || [{ value: "", label: "Loading..." }]}
            isMandatory
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

      {selectedLCentID === 5 && (
        <Grid item xs={12}>
          <CompMultipleDetails
            compName={selectedComponent?.compoNameCD || ""}
            compOID={selectedComponent?.compoID || 0}
            invID={selectedComponent?.invID || 0}
            selectedValue={selectedComponent?.selectedValue || ""}
            onUpdateCompMultiple={onUpdateCompMultiple}
          />
        </Grid>
      )}

      {selectedLCentID === 6 && (
        <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#f5f5f5", boxShadow: 1 }}>
          <ApplicableAgeRangeTable
            ageRanges={ageRanges}
            componentId={formState.compoID}
            onAddAgeRange={handleAgeRangeUpdate}
            onUpdateAgeRange={onUpdateAgeRange}
            selectedComponent={selectedComponent}
          />
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 4,
          mb: 2,
          px: 1,
        }}
      >
        <CustomButton variant="contained" color="primary" onClick={handleOkClick}>
          OK
        </CustomButton>
        <CustomButton variant="contained" color="error" onClick={handleClose}>
          Clear
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default LComponentDetails;
