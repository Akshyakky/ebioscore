import React, { useCallback, useEffect, useState, ChangeEvent } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent } from "@mui/material";
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
    lCentID: 0,
    deptID: 1,
    compoID: 0,
    compDetailYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    compInterpretCD: "",
    compUnitCD: "",
    compOCodeCD: "",
    cShortNameCD: "",
    cNHSEnglishNameCD: "",
    deltaValPercent: undefined,
    compCode: selectedComponent?.compCode || "", // Initialize with selected component values or empty string
    compName: selectedComponent?.compName || "",
    invNameCD: selectedComponent?.invNameCD || "",
    lCentNameCD: selectedComponent?.lCentNameCD || "",
    lCentTypeCD: selectedComponent?.lCentTypeCD || "",
    compID: compID || 1,
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
  const [templateDetails, setTemplateDetails] = useState<LCompTemplateDto[]>([]);

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

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({ ...prev, [name]: value }));

      if (name === "lCentID") {
        const selectedID = Number(value);
        setSelectedLCentID(selectedID);

        // Fetch or derive lCentNameCD and lCentTypeCD based on the selected lCentID
        const selectedEntry = dropdownValues["entryType"]?.find((item: any) => item.value === selectedID);

        // If a valid entry is found, update lCentNameCD and lCentTypeCD
        if (selectedEntry) {
          setFormState((prev) => ({
            ...prev,
            lCentNameCD: selectedEntry.lCentName || "", // Update lCentNameCD
            lCentTypeCD: selectedEntry.lCentType || "", // Update lCentTypeCD
          }));
        }
      }
    },
    [dropdownValues]
  );

  const updateTemplateDetails = useCallback(
    (newTemplate: LCompTemplateDto) => {
      debugger;
      setTemplateDetails((prev: LCompTemplateDto[]) => {
        const existingIndex = prev.findIndex((t) => t.tGroupID === newTemplate.tGroupID && t.compOID === newTemplate.compOID);
        if (existingIndex >= 0) {
          const updatedTemplates = [...prev];
          updatedTemplates[existingIndex] = newTemplate;
          return updatedTemplates;
        } else {
          return [...prev, newTemplate];
        }
      });
      onUpdateTemplate(newTemplate); // Pass the updated template to the parent
    },
    [onUpdateTemplate]
  );

  const handleOkClick = useCallback(() => {
    debugger;
    if (!formState.compOCodeCD || !formState.compoNameCD || !formState.lCentID) {
      showAlert("error", "Please fill all required fields", "error");
      return;
    }
    const componentWithAgeRanges = {
      ...formState,
      compoID: formState.compoID || 0, // Ensure it's passed correctly
      ageRanges: formState.lCentID === 6 ? ageRanges : [],
    };

    onUpdate(componentWithAgeRanges);
    if (formState.lCentID === 5 && formComp) {
      onUpdateCompMultiple(formComp);
    }

    if (formState.lCentID === 6 && ageRanges.length > 0) {
      ageRanges.forEach((range) => {
        onUpdateAgeRange({
          ...range,
          compOID: formState.compoID,
          cappID: formState.compoID,
        });
      });
    }

    if (formState.lCentID === 7) {
      setSelectedComponent(componentWithAgeRanges);
    }

    handleClose();
  }, [formState, formComp, ageRanges, onUpdate, onUpdateCompMultiple, onUpdateAgeRange, setSelectedComponent]);

  const handleAgeRangeUpdate = useCallback(
    (newAgeRange: LCompAgeRangeDto) => {
      debugger;
      setAgeRanges((prev) => {
        // Check if the age range exists
        const existingIndex = prev.findIndex((range) => range.carID === newAgeRange.carID);
        if (existingIndex >= 0) {
          // If it exists, update it
          const updatedRanges = [...prev];
          updatedRanges[existingIndex] = { ...updatedRanges[existingIndex], ...newAgeRange };
          return updatedRanges;
        } else {
          // If it doesn't exist, add it
          return [...prev, newAgeRange];
        }
      });

      // Notify parent component to update global state
      onUpdateAgeRange(newAgeRange);
    },
    [onUpdateAgeRange]
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

  useEffect(() => {
    debugger;
    if (selectedComponent) {
      setFormState({
        ...selectedComponent,
        compoID: selectedComponent.compoID || 0, // Ensure compoID is passed correctly
      });
      setSelectedLCentID(selectedComponent.lCentID || null);
      if (selectedComponent.lCentID === 6) {
        const componentAgeRanges = selectedComponent.ageRanges || [];
        setAgeRanges(componentAgeRanges);
      }
    }
  }, [selectedComponent?.compoID]); // Watch for changes in selectedComponent or its compoID

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
            compOID={formState?.compoID || 0}
            invID={selectedComponent?.invID || 0}
            selectedValue={selectedComponent?.selectedValue || ""}
            onUpdateCompMultiple={onUpdateCompMultiple}
            formComp={formComp} // Pass formComp to the child
            setFormComp={setFormComp} // Pass setFormComp to the child
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
          onUpdateTemplate={updateTemplateDetails}
          selectedComponent={{
            ...formState,
            compoID: formState.compoID, // Ensure compoID is passed
            invID: formState.invID,
            compCode: formState.compOCodeCD,
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
