import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import { ComponentFormErrors, LCompAgeRangeDto, LCompMultipleDto, LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { notifyWarning } from "@/utils/Common/toastManager";
import ApplicableAgeRangeTable from "./ApplicableAgeRanges";
import CompMultipleDetails from "./CompMultipleDetails";
import CompTemplateDetails from "./CompTemplateDetails";

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
  onUpdateCompMultiple,
  onUpdateAgeRange,
  onUpdateTemplate,
  selectedComponent,
  setSelectedComponent,
  totalComponentsForInvestigation,
  setUnsavedComponents,
  handleCloseDialog,
}) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [isDeltaValueDisabled, setIsDeltaValueDisabled] = useState(false);

  // Create a ref to hold the latest ageRanges
  const ageRangesRef = useRef<LCompAgeRangeDto[]>([]);

  const [formState, setFormState] = useState<LComponentDto>({
    invID: 0,
    lCentID: 0,
    deptID: 1,
    compoID: 0,
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
    compCode: "",
    compName: "",
    invNameCD: "",
    lCentNameCD: "",
    lCentTypeCD: "",
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

  // Keep track of age ranges in state
  const [ageRanges, setAgeRanges] = useState<LCompAgeRangeDto[]>([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setFormErrors] = useState<ComponentFormErrors>({});
  const dropdownValues = useDropdownValues(["entryType", "mainGroup", "subTitle"]);
  const [selectedLCentID, setSelectedLCentID] = useState<number | null>(null);
  const [templateDetails, setTemplateDetails] = useState<LCompTemplateDto[]>([]);
  const [compMultipleList, setCompMultipleList] = useState<LCompMultipleDto[]>([]);
  const isEditMode = !!selectedComponent && selectedComponent.compoID !== 0;
  const [tempCompoID, setTempCompoID] = useState(1);

  // IMPORTANT: Sync the ref with state whenever ageRanges changes
  useEffect(() => {
    ageRangesRef.current = [...ageRanges];
    console.log("Age ranges updated:", ageRanges);
  }, [ageRanges]);

  useEffect(() => {
    if (!selectedComponent) return;

    setFormState(() => ({
      ...selectedComponent,
      mGrpID: selectedComponent.mGrpID || 0,
      compID: compID || 1,
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
      rCreatedID: userID || 0,
      rCreatedBy: userName || "",
      rCreatedOn: selectedComponent.rCreatedOn || serverDate || new Date(),
      rModifiedOn: selectedComponent.rModifiedOn || serverDate || new Date(),
    }));

    setSelectedLCentID(selectedComponent.lCentID || null);

    if (selectedComponent.lCentID === 6) {
      const activeRanges = (selectedComponent.ageRanges || []).filter((ar) => ar.rActiveYN !== "N");
      setAgeRanges(activeRanges);
      ageRangesRef.current = [...activeRanges]; // Sync the ref immediately
      console.log("Loading age ranges:", activeRanges);
    }

    if (selectedComponent.lCentID === 5 && Array.isArray(selectedComponent.multipleChoices)) {
      // ✅ Load saved values (active only) into compMultipleList
      const activeChoices = selectedComponent.multipleChoices.filter((mc) => mc.rActiveYN !== "N");
      setCompMultipleList(activeChoices);

      // optional: reset the input formComp
      setFormComp((prev) => ({
        ...prev,
        compID: compID || 1,
        compCode: compCode || "",
        compName: compName || "",
        cmValues: "", // clear the input
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
  }, [formState, setFormErrors]);

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

      // Add new value
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

  // Handler for deleting age ranges
  const handleDeleteAgeRange = useCallback((ids: number[]) => {
    setAgeRanges((prev) => {
      const updated = prev.filter((range) => !ids.includes(range.carID));
      ageRangesRef.current = updated; // Keep the ref in sync
      return updated;
    });
  }, []);

  const handleAgeRangeUpdate = useCallback(
    (newRange: LCompAgeRangeDto) => {
      console.log("Handling age range update:", newRange);

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

        // Important: Keep the ref in sync immediately
        ageRangesRef.current = [...updated];
        console.log("Updated age ranges:", updated);

        return updated;
      });

      // Call the parent update function immediately
      onUpdateAgeRange(enriched);
    },
    [formState.compoID, selectedComponent?.compoID, onUpdateAgeRange]
  );

  // Modified OK click handler to use the ref for age ranges
  const handleOkClick = useCallback(() => {
    debugger;
    console.log("OK clicked, current age ranges:", ageRangesRef.current);

    setIsSubmitted(true);
    if (!validateComponentForm()) {
      notifyWarning("Please fill all mandatory fields.");
      return;
    }

    const isEditMode = !!selectedComponent; // ✅ Check based on selection, not compoID
    const currentAgeRanges = [...ageRangesRef.current];
    const assignedCompoID = isEditMode ? selectedComponent!.compoID : tempCompoID;

    const updatedComponent: LComponentDto = {
      ...formState,
      compoID: assignedCompoID,
      compOrder: isEditMode ? formState.compOrder : totalComponentsForInvestigation + 1,
      multipleChoices: [...compMultipleList],
      ageRanges:
        formState.lCentID === 6
          ? currentAgeRanges.map((ar) => ({
              ...ar,
              cappID: 0,
              compoID: assignedCompoID,
              carID: ar.carID || 0,
              carAgeValue: `${ar.carStart}-${ar.carEnd} ${ar.carAgeType}`,
              carSexValue: ar.carSex,
            }))
          : [],
      templates:
        formState.lCentID === 7
          ? templateDetails.map((t) => ({
              ...t,
              compOID: 0,
              cTID: t.cTID || 0,
            }))
          : [],
    };

    if (isEditMode) {
      onUpdate(updatedComponent);
    } else {
      setUnsavedComponents((prev) => [...prev, updatedComponent]);
      setTempCompoID((prev) => prev + 1); // 🆙 Increment only for new additions
    }

    handleClose();
    handleCloseDialog();
  }, [
    formState,
    compMultipleList,
    templateDetails,
    validateComponentForm,
    onUpdate,
    setUnsavedComponents,
    handleCloseDialog,
    selectedComponent,
    totalComponentsForInvestigation,
    tempCompoID,
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
      compID: compID || 1,
      compCode: compCode || "",
      compName: compName || "",
      lCentNameCD: "",
      lCentTypeCD: "",
      rModifiedID: userID || 0,
      rModifiedBy: userName || "",
      rCreatedID: userID || 0,
      rCreatedBy: userName || "",
      rCreatedOn: serverDate || new Date(),
      rModifiedOn: serverDate || new Date(),
    });
    setFormComp((prev) => ({
      ...prev,
      cmID: 0,
      cmValues: "",
      compoID: 0,
      defaultYN: "Y",
    }));
    setAgeRanges([]);
    ageRangesRef.current = []; // Clear the ref as well
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
          compName={selectedComponent?.compoNameCD || ""}
          compoID={formState.compoID || 0}
          invID={selectedComponent?.invID || 0}
          selectedValue={selectedComponent?.selectedValue || ""}
          onUpdateCompMultiple={handleUpdateCompMultiple}
          formComp={formComp}
          setFormComp={setFormComp}
          existingChoices={selectedComponent?.multipleChoices || []}
        />
      )}
      {selectedLCentID === 6 && (
        <Box sx={{ mt: 3 }}>
          <ApplicableAgeRangeTable
            ageRanges={ageRanges}
            componentId={formState.compoID}
            onAddAgeRange={handleAgeRangeUpdate}
            onUpdateAgeRange={handleAgeRangeUpdate} // Use the same handler for both add and update
            onDeleteAgeRanges={handleDeleteAgeRange}
            selectedComponent={selectedComponent}
          />
        </Box>
      )}
      {selectedLCentID === 7 && (
        <CompTemplateDetails
          onUpdateTemplate={handleUpdateTemplateDetails}
          selectedComponent={{
            ...formState,
            compoID: formState.compoID,
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
          mt: 3,
        }}
      >
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
