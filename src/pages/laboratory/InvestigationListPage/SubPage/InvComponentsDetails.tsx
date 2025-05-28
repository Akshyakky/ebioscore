import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import { ComponentFormErrors, LCompAgeRangeDto, LCompMultipleDto, LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

import { useServerDate } from "@/hooks/Common/useServerDate";
import { notifyWarning } from "@/utils/Common/toastManager";
import ApplicableAgeRangeTable from "./ApplicableAgeRanges";
import CompMultipleDetails from "./CompMultipleDetails";
import CompTemplateDetails from "./CompTemplateDetails";
import { useAlert } from "@/providers/AlertProvider";

interface LComponentDetailsProps {
  onUpdate: (componentData: LComponentDto) => void;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
  onUpdateAgeRange: (ageRangeData: LCompAgeRangeDto) => void;
  onUpdateTemplate: (templateData: LCompTemplateDto) => void;
  selectedComponent?: LComponentDto & {
    ageRanges?: LCompAgeRangeDto[];
    multipleChoices?: LCompMultipleDto[];
  };
  setSelectedComponent: React.Dispatch<React.SetStateAction<LComponentDto | null>>;
  totalComponentsForInvestigation: number;
  setUnsavedComponents: React.Dispatch<React.SetStateAction<LComponentDto[]>>;
  handleCloseDialog: () => void;
}

const LComponentDetails: React.FC<LComponentDetailsProps> = ({
  onUpdate,
  onUpdateAgeRange,
  onUpdateTemplate,
  selectedComponent,
  setSelectedComponent,
  totalComponentsForInvestigation,
  setUnsavedComponents,
  handleCloseDialog,
}) => {
  const serverDate = useServerDate();
  const { showAlert } = useAlert();
  const [isDeltaValueDisabled, setIsDeltaValueDisabled] = useState(false);

  // Create a ref to hold the latest ageRanges.
  const ageRangesRef = useRef<LCompAgeRangeDto[]>([]);

  const [formState, setFormState] = useState<LComponentDto>({
    invID: 0,
    lCentID: 0,
    deptID: 1,
    compoID: 0, // For a new component, this remains 0.
    compDetailYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    compInterpretCD: "",
    mGrpID: 0,
    mGrpNameCD: "",
    compUnitCD: "",
    compOCodeCD: "",
    cShortNameCD: "",
    compOrder: 0,
    cNHSEnglishNameCD: "",
    deltaValPercent: undefined,
    invNameCD: "",
    lCentNameCD: "",
    lCentTypeCD: "",
  });

  const [formComp, setFormComp] = useState<LCompMultipleDto>({
    cmID: 0,
    cmValues: "",
    compOID: 0,
    defaultYN: "Y",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  });

  // State for age ranges.
  const [ageRanges, setAgeRanges] = useState<LCompAgeRangeDto[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setFormErrors] = useState<ComponentFormErrors>({});
  const dropdownValues = useDropdownValues(["entryType", "mainGroup", "subTitle"]);
  const [selectedLCentID, setSelectedLCentID] = useState<number | null>(null);
  const [templateDetails, setTemplateDetails] = useState<LCompTemplateDto[]>([]);
  const [compMultipleList, setCompMultipleList] = useState<LCompMultipleDto[]>([]);
  const isEditMode = !!selectedComponent && selectedComponent.compoID !== 0;
  const [tempCompoID, setTempCompoID] = useState(1);

  const indexCounterRef = useRef(1); // start with 1 or max + 1 based on component count
  const [currentIndexID, setCurrentIndexID] = useState<number>(() => selectedComponent?.indexID || 1);

  useEffect(() => {
    // whenever total changes or selectedComponent changes
    if (selectedComponent) {
      setCurrentIndexID(selectedComponent.indexID || indexCounterRef.current);
    } else {
      // assign next
      indexCounterRef.current = totalComponentsForInvestigation + 1 > indexCounterRef.current ? totalComponentsForInvestigation + 1 : indexCounterRef.current;
      setCurrentIndexID(indexCounterRef.current);
    }
  }, [selectedComponent, totalComponentsForInvestigation]);
  // Update the ageRanges ref when ageRanges state changes.
  useEffect(() => {
    ageRangesRef.current = [...ageRanges];
  }, [ageRanges]);

  // When loading an existing component, update formState and related fields.
  useEffect(() => {
    if (!selectedComponent) return;
    setFormState(() => ({
      ...selectedComponent,
      mGrpID: selectedComponent.mGrpID || 0,
      rCreatedOn: selectedComponent.rCreatedOn || serverDate || new Date(),
      rModifiedOn: selectedComponent.rModifiedOn || serverDate || new Date(),
    }));

    setSelectedLCentID(selectedComponent.lCentID || null);
    // For Entry Type 6 (age range), load the active ranges.
    if (selectedComponent.lCentID === 6) {
      const activeRanges = (selectedComponent.ageRanges || []).filter((ar) => ar.rActiveYN !== "N");
      setAgeRanges(activeRanges);
      ageRangesRef.current = [...activeRanges];
    }
    // For Entry Type 5 (multiple values), load saved values.
    if (selectedComponent.lCentID === 5 && Array.isArray(selectedComponent.multipleChoices)) {
      const activeChoices = selectedComponent.multipleChoices.filter((mc) => mc.rActiveYN !== "N");
      setCompMultipleList(activeChoices);
      // Clear the input field.
      setFormComp((prev) => ({
        ...prev,
        cmValues: "",
      }));
    }
  }, [selectedComponent]);

  const validateComponentForm = useCallback(() => {
    const errors: ComponentFormErrors = {};
    if (!formState.compOCodeCD?.trim()) {
      errors.compOCodeCD = "Component Code is required.";
    }
    if (!formState.compoNameCD?.trim()) {
      errors.compoNameCD = "Component Name is required.";
    }
    if (!formState.cShortNameCD?.trim()) {
      errors.cShortNameCD = "Short Name is required.";
    }
    if (!formState.lCentID) {
      errors.lCentID = "Entry Type is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState]);

  const handleTextInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const { name, value } = e.target;
      setFormState((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "mGrpID") {
          const sel = dropdownValues.mainGroup?.find((item) => item.value === value);
          updated.mGrpNameCD = sel ? sel.label : "";
        }
        if (name === "lCentID") {
          const chosenID = Number(value);
          setSelectedLCentID(chosenID);
          const disableDeltaFor = [1, 2, 4, 8];
          setIsDeltaValueDisabled(disableDeltaFor.includes(chosenID));
          const found = dropdownValues.entryType?.find((item) => Number(item.value) === chosenID);
          if (found) {
            updated.lCentNameCD = found.lCentName || "";
            updated.lCentTypeCD = found.lCentType || "";
          }
        }
        return updated;
      });
    },
    [dropdownValues]
  );

  const handleUpdateCompMultiple = (multipleData: LCompMultipleDto) => {
    setCompMultipleList((prev) => {
      const existingIndex = prev.findIndex((m) => m.cmID === multipleData.cmID);
      if (multipleData.rActiveYN === "N") {
        return prev.filter((m) => m.cmID !== multipleData.cmID);
      }
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...multipleData };
        return updated;
      }
      return [...prev, multipleData];
    });
  };

  const handleUpdateTemplateDetails = useCallback(
    (newTemplate: LCompTemplateDto) => {
      setTemplateDetails((prev) => {
        const idx = prev.findIndex((t) => t.tGroupID === newTemplate.tGroupID && t.compOID === newTemplate.compOID);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...newTemplate };
          return updated;
        }
        return [...prev, newTemplate];
      });
      setSelectedComponent((prev) => {
        if (!prev) return prev;
        const filtered = (prev.templates || []).filter((t: LCompTemplateDto) => t.tGroupID !== newTemplate.tGroupID);
        return { ...prev, templates: [...filtered, newTemplate] };
      });
      onUpdateTemplate(newTemplate);
    },
    [onUpdateTemplate, setTemplateDetails, setSelectedComponent]
  );

  const handleDeleteAgeRange = useCallback((ids: number[]) => {
    setAgeRanges((prev) => {
      const updated = prev.filter((range) => !ids.includes(range.carID));
      ageRangesRef.current = updated;
      return updated;
    });
  }, []);

  const handleAgeRangeUpdate = useCallback(
    (newRange: LCompAgeRangeDto) => {
      const enriched: LCompAgeRangeDto = {
        ...newRange,
        compoID: formState.compoID || selectedComponent?.compoID || 0,
        carAgeValue: `${newRange.carStart}-${newRange.carEnd} ${newRange.carAgeType}`,
        carSexValue: newRange.carSex,
      };
      setAgeRanges((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((ar) => ar.carID === newRange.carID);
        if (idx >= 0) {
          updated[idx] = enriched;
        } else {
          updated.push(enriched);
        }
        ageRangesRef.current = [...updated];
        return updated;
      });
      onUpdateAgeRange(enriched);
    },
    [formState.compoID, selectedComponent?.compoID, onUpdateAgeRange]
  );

  useEffect(() => {
    if (totalComponentsForInvestigation > 0) {
      indexCounterRef.current = Math.max(1, totalComponentsForInvestigation + 1);
    }
  }, [totalComponentsForInvestigation]);

  const handleOkClick = useCallback(() => {
    setIsSubmitted(true);
    if (!validateComponentForm()) {
      notifyWarning("Please fill all mandatory fields.");
      return;
    }

    // Validate based on Entry Type
    if (formState.lCentID === 5 && compMultipleList.filter((m) => m.rActiveYN !== "N").length === 0) {
      showAlert("Warning", "Please add at least one Multiple Choice value", "warning");
      return;
    }
    if (formState.lCentID === 6 && ageRangesRef.current.filter((a) => a.rActiveYN !== "N").length === 0) {
      showAlert("Warning", "Please add at least one Age Range", "warning");
      return;
    }
    if (formState.lCentID === 7 && templateDetails.filter((t) => t.rActiveYN !== "N").length === 0) {
      showAlert("Warning", "Please add at least one Template.", "warning");
      return;
    }

    // Use our currentIndexID here
    const idxID = currentIndexID;
    if (!isEditMode) {
      indexCounterRef.current = idxID + 1;
    }

    const updated: LComponentDto = {
      ...formState,
      compoID: isEditMode ? selectedComponent?.compoID || 0 : 0,
      compOrder: isEditMode ? formState.compOrder : totalComponentsForInvestigation + 1,
      indexID: idxID,
      multipleChoices:
        formState.lCentID === 5
          ? compMultipleList.map((m) => ({
              ...m,
              indexID: idxID,
            }))
          : [],
      ageRanges:
        formState.lCentID === 6
          ? ageRangesRef.current.map((ar) => ({
              ...ar,
              indexID: idxID,
            }))
          : [],
      templates:
        formState.lCentID === 7
          ? templateDetails.map((tpl) => ({
              ...tpl,
              indexID: idxID,
            }))
          : [],
    };

    if (isEditMode) {
      onUpdate(updated);
    } else {
      setTempCompoID((p) => p + 1);
      setUnsavedComponents((prev) => {
        const existingIndex = prev.findIndex((c) => c.indexID === updated.indexID);
        if (existingIndex >= 0) {
          const clone = [...prev];
          clone[existingIndex] = updated;
          return clone;
        }
        return [...prev, updated];
      });
    }

    handleClose();
    handleCloseDialog();
  }, [
    validateComponentForm,
    formState,
    compMultipleList,
    templateDetails,
    currentIndexID,
    isEditMode,
    tempCompoID,
    totalComponentsForInvestigation,
    onUpdate,
    setUnsavedComponents,
    handleCloseDialog,
  ]);

  const handleClose = () => {
    setFormState({
      invID: 0,
      invNameCD: "",
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
      lCentNameCD: "",
      lCentTypeCD: "",
    });
    setFormComp((prev) => ({
      ...prev,
      cmID: 0,
      cmValues: "",
      compoID: 0,
      defaultYN: "Y",
    }));
    setAgeRanges([]);
    ageRangesRef.current = [];
    setSelectedLCentID(null);
    setSelectedComponent(null);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Add New Component
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Component Code"
          name="compOCodeCD"
          value={formState.compOCodeCD}
          onChange={handleTextInputChange}
          ControlID="compOCodeCD"
          maxLength={100}
          isSubmitted={isSubmitted}
          isMandatory={true}
        />
        <FormField
          type="text"
          label="Component Name"
          name="compoNameCD"
          value={formState.compoNameCD}
          onChange={handleTextInputChange}
          ControlID="compoNameCD"
          maxLength={1000}
          isSubmitted={isSubmitted}
          isMandatory={true}
        />
        <FormField
          type="select"
          label="Maingroup"
          name="mGrpID"
          value={formState.mGrpID || ""}
          onChange={handleSelectChange}
          options={dropdownValues["mainGroup"] || []}
          ControlID="mGrpID"
          isSubmitted={isSubmitted}
          isMandatory={true}
        />
        <FormField
          type="select"
          label="Entry Type"
          name="lCentID"
          value={formState.lCentID?.toString() || ""}
          onChange={handleSelectChange}
          options={dropdownValues["entryType"] || []}
          ControlID="entryType"
          isSubmitted={isSubmitted}
          isMandatory={true}
        />
        <FormField
          type="text"
          label="Short Name"
          name="cShortNameCD"
          value={formState.cShortNameCD}
          onChange={handleTextInputChange}
          ControlID="shortName"
          maxLength={1000}
          isSubmitted={isSubmitted}
          isMandatory={true}
        />
        <FormField
          type="select"
          label="Sub Title"
          value={formState.compoTitleCD || ""}
          onChange={handleSelectChange}
          name="compoTitleCD"
          ControlID="compoTitleCD"
          options={dropdownValues.subTitle || [{ value: "", label: "Loading..." }]}
        />
        <FormField type="text" label="Units" name="compUnitCD" value={formState.compUnitCD} onChange={handleTextInputChange} ControlID="units" maxLength={300} />
        <FormField
          type="number"
          label="Delta Value"
          name="deltaValPercent"
          value={formState.deltaValPercent || ""}
          onChange={handleTextInputChange}
          ControlID="deltaValue"
          disabled={isDeltaValueDisabled}
          maxLength={300}
        />
        <FormField
          type="textarea"
          label="Sample"
          name="cNHSEnglishNameCD"
          value={formState.cNHSEnglishNameCD}
          onChange={handleTextInputChange}
          ControlID="sample"
          rows={4}
          maxLength={1000}
        />
        <FormField
          type="textarea"
          label="Interpretation"
          name="compInterpretCD"
          value={formState.compInterpretCD}
          onChange={handleTextInputChange}
          ControlID="interpretation"
          rows={4}
          maxLength={2000}
        />
      </Grid>
      {selectedLCentID === 5 && (
        <CompMultipleDetails
          key={formState.compoID}
          compoID={formState.compoID || 0}
          invID={selectedComponent?.invID || 0}
          selectedValue={selectedComponent?.selectedValue || ""}
          onUpdateCompMultiple={handleUpdateCompMultiple}
          formComp={formComp}
          setFormComp={setFormComp}
          existingChoices={selectedComponent?.multipleChoices || []}
          onMultipleListChange={setCompMultipleList}
          indexID={currentIndexID}
        />
      )}
      {selectedLCentID === 6 && (
        <Box sx={{ mt: 3 }}>
          <ApplicableAgeRangeTable
            ageRanges={ageRanges}
            componentId={formState.compoID}
            onAddAgeRange={handleAgeRangeUpdate}
            onUpdateAgeRange={handleAgeRangeUpdate}
            onDeleteAgeRanges={handleDeleteAgeRange}
            selectedComponent={selectedComponent}
            indexID={currentIndexID}
          />
        </Box>
      )}
      {selectedLCentID === 7 && (
        <CompTemplateDetails
          onUpdateTemplate={handleUpdateTemplateDetails}
          indexID={currentIndexID}
          selectedComponent={{
            ...formState,
            compoID: formState.compoID,
            invID: formState.invID,
          }}
        />
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <CustomButton variant="contained" color="primary" onClick={handleOkClick}>
          {isEditMode ? "Update" : "OK"}
        </CustomButton>
        <CustomButton variant="contained" color="error" onClick={handleClose}>
          Clear
        </CustomButton>
      </Box>
    </Paper>
  );
};

export default LComponentDetails;
