import React, { useCallback, useEffect, useState, ChangeEvent } from "react";
import { Paper, Typography, Grid, Box, SelectChangeEvent } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import { ComponentFormErrors, LCompAgeRangeDto, LCompMultipleDto, LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import CustomButton from "@/components/Button/CustomButton";
import ApplicableAgeRangeTable from "./ApplicableAgeRanges";
import CompMultipleDetails from "./CompMultipleDetails";
import CompTemplateDetails from "./CompTemplateDetails";
import { notifyWarning } from "@/utils/Common/toastManager";

interface LComponentDetailsProps {
  onUpdate: (componentData: LComponentDto) => void;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
  onUpdateAgeRange: (ageRangeData: LCompAgeRangeDto) => void;
  onUpdateTemplate: (ageRangeData: LCompTemplateDto) => void;
  selectedComponent?: LComponentDto & { ageRanges?: LCompAgeRangeDto[] };
  setSelectedComponent: React.Dispatch<React.SetStateAction<LComponentDto | null>>;
  totalComponentsForInvestigation: number; // <-- NEW PROP
}

const LComponentDetails: React.FC<LComponentDetailsProps> = ({
  onUpdate,
  onUpdateCompMultiple,
  onUpdateAgeRange,
  onUpdateTemplate,
  selectedComponent,
  setSelectedComponent,
  totalComponentsForInvestigation,
}) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [isDeltaValueDisabled, setIsDeltaValueDisabled] = useState<boolean>(false);

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
    compCode: selectedComponent?.compCode || "",
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
  const [, setTemplateDetails] = useState<LCompTemplateDto[]>([]);
  const [unsavedComponents, setUnsavedComponents] = useState<LComponentDto[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [, setFormErrors] = useState<ComponentFormErrors>({});
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

  const validateComponentFormData = useCallback(() => {
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

    if (Object.keys(errors).length > 0) {
      if (isSubmitted) {
      }
      return false;
    }

    return true;
  }, [formState, isSubmitted]);

  const handleTextInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const { name, value } = event.target;

      setFormState((prev) => {
        const updatedState = { ...prev, [name]: value };

        if (name === "mGrpID") {
          const selectedGroup = dropdownValues["mainGroup"]?.find((item: any) => item.value === value);

          if (selectedGroup) {
            updatedState.mGrpNameCD = selectedGroup.label; // Assign `mGrpNameCD`
          } else {
            updatedState.mGrpNameCD = ""; // Clear if no match
          }
        }

        if (name === "lCentID") {
          const selectedID = Number(value);
          setSelectedLCentID(selectedID);

          const disableDeltaValues = [1, 2, 4, 8];
          setIsDeltaValueDisabled(disableDeltaValues.includes(selectedID));

          const selectedEntry = dropdownValues["entryType"]?.find((item: any) => item.value === selectedID);

          if (selectedEntry) {
            updatedState.lCentNameCD = selectedEntry.lCentName || "";
            updatedState.lCentTypeCD = selectedEntry.lCentType || "";
          }
        }

        return updatedState;
      });
    },
    [dropdownValues]
  );

  const updateTemplateDetails = useCallback(
    (newTemplate: LCompTemplateDto) => {
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

      setSelectedComponent((prev) => {
        if (prev) {
          const updatedTemplates = prev.templates ? [...prev.templates.filter((t: LCompTemplateDto) => t.tGroupID !== newTemplate.tGroupID), newTemplate] : [newTemplate];

          return {
            ...prev,
            templates: updatedTemplates,
          };
        }
        return prev;
      });

      onUpdateTemplate(newTemplate);
    },
    [onUpdateTemplate]
  );

  useEffect(() => {
    if (selectedComponent) {
      setFormState({
        ...selectedComponent,
        mGrpID: selectedComponent.mGrpID || undefined,
        mGrpNameCD: selectedComponent.mGrpNameCD || "",
      });
    }
  }, [selectedComponent?.compoID]);

  const handleOkClick = useCallback(() => {
    setIsSubmitted(true);

    if (!validateComponentFormData()) {
      notifyWarning("Please fill all mandatory fields.");
      return;
    }

    const nextOrderId = totalComponentsForInvestigation + unsavedComponents.length + 1;
    const uniqueCompoID = formState.compoID && formState.compoID > 0 ? formState.compoID : 0;

    const modifiedAgeRanges = ageRanges.filter((range) => range.modified);

    const componentWithAgeRanges = {
      ...formState,
      compoID: uniqueCompoID,
      ageRanges: modifiedAgeRanges,
      compOrder: nextOrderId,
      mGrpID: formState.mGrpID,
      mGrpNameCD: formState.mGrpNameCD,
    };

    onUpdate(componentWithAgeRanges);

    setUnsavedComponents((prev) => [...prev.filter((comp) => comp.compoID !== 0), componentWithAgeRanges]);

    if (formState.lCentID === 5 && formComp) {
      onUpdateCompMultiple({
        ...formComp,
        compOID: uniqueCompoID,
        invID: formState.invID || 0,
      });
    }

    if (formState.lCentID === 7) {
      setSelectedComponent(componentWithAgeRanges);
    }

    handleClose();
  }, [formState, formComp, ageRanges, onUpdate, onUpdateCompMultiple, onUpdateAgeRange, setSelectedComponent]);

  const handleDeleteAgeRange = useCallback((ageRangeIds: number[]) => {
    setAgeRanges((prev) => prev.filter((range) => !ageRangeIds.includes(range.carID)));
  }, []);

  const handleAgeRangeUpdate = useCallback(
    (newAgeRange: LCompAgeRangeDto) => {
      setAgeRanges((prev) => {
        const isEdit = prev.some((range) => range.carID === newAgeRange.carID);
        if (isEdit) {
          return prev.map((range) => (range.carID === newAgeRange.carID ? { ...range, ...newAgeRange } : range));
        }
        const alreadyExists = prev.some(
          (range) => range.carStart === newAgeRange.carStart && range.carEnd === newAgeRange.carEnd && range.carName === newAgeRange.carName && range.carSex === newAgeRange.carSex
        );

        if (!alreadyExists) {
          return [...prev, newAgeRange];
        }

        return prev;
      });

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
    if (selectedComponent) {
      setFormState({
        ...selectedComponent,
        compoID: selectedComponent.compoID || 0,
      });
      setSelectedLCentID(selectedComponent.lCentID || null);
      if (selectedComponent.lCentID === 6) {
        const componentAgeRanges = selectedComponent.ageRanges || [];
        setAgeRanges(componentAgeRanges);
      }
    }
  }, [selectedComponent?.compoID]);

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
        <Grid item xs={12}>
          <CompMultipleDetails
            compName={selectedComponent?.compoNameCD || ""}
            compOID={formState?.compoID || 0}
            invID={selectedComponent?.invID || 0}
            selectedValue={selectedComponent?.selectedValue || ""}
            onUpdateCompMultiple={onUpdateCompMultiple}
            formComp={formComp}
            setFormComp={setFormComp}
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
            onDeleteAgeRanges={handleDeleteAgeRange}
            selectedComponent={selectedComponent}
          />
        </Box>
      )}

      {selectedLCentID === 7 && (
        <CompTemplateDetails
          onUpdateTemplate={updateTemplateDetails}
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
