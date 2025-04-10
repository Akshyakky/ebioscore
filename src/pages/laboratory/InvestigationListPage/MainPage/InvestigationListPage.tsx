import React, { useState, useCallback } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useAppSelector } from "@/store/hooks";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { investigationDto, LCompMultipleDto, LCompAgeRangeDto, LInvMastDto, LCompTemplateDto, LComponentDto, InvestigationFormErrors } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { showAlert } from "@/utils/Common/showAlert";
import { notifyWarning } from "@/utils/Common/toastManager";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import InvestigationListSearch from "../SubPage/InvestigationListSearch";
import InvestigationPrintOrder from "../SubPage/investigationPrintOrder";
import InvestigationListDetails from "../SubPage/InvestigationListDetails";
import PrintPreferences from "../SubPage/PrintPreference";
import LComponentDetails from "../SubPage/InvComponentsDetails";
import ComponentDetailsSection from "../SubPage/ComponentDetailsSection";

interface Props {
  compID: number;
  compCode: string;
  compName: string;
}

const InvestigationListPage: React.FC<Props> = () => {
  const { compCode, compName } = useAppSelector((state) => state.auth);
  const dropdownValues = useDropdownValues(["entryType"]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showInvestigationPrintOrder, setShowInvestigationPrintOrder] = useState(false);
  const [investigationDetails, setInvestigationDetails] = useState<LInvMastDto | null>(null);
  const [componentDetails, setComponentDetails] = useState<LComponentDto[]>([]);
  const [compMultipleDetails, setCompMultipleDetails] = useState<LCompMultipleDto[]>([]);
  const [ageRangeDetails, setAgeRangeDetails] = useState<LCompAgeRangeDto[]>([]);
  const [templateDetails, setTemplateDetails] = useState<LCompTemplateDto[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<LComponentDto | null>(null);
  const [unsavedComponents, setUnsavedComponents] = useState<LComponentDto[]>([]);
  const [printPreferences, setPrintPreferences] = useState<{ invTitle?: string; invSTitle?: string }>({
    invTitle: "",
    invSTitle: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const [, setFormErrors] = useState<InvestigationFormErrors>({});
  const [activeView, setActiveView] = useState<"component" | "printPreferences">("component");
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    {
      variant: "contained",
      size: "medium",
      icon: PrintIcon,
      text: "Investigation Print Order",
      onClick: () => setShowInvestigationPrintOrder(true),
    },
  ];

  const enhanceComponentDetails = (components: LComponentDto[], multiples: LCompMultipleDto[], ages: LCompAgeRangeDto[], templates: LCompTemplateDto[]): LComponentDto[] =>
    components.map((comp) => {
      return {
        ...comp,
        multipleChoices: multiples.filter((mc) => mc.compoID === comp.compoID || mc.compOID === comp.compoID || mc.compID === comp.compID),
        ageRanges: ages.filter((ar) => ar.compoID === comp.compoID || ar.cappID === comp.compoID || ar.compID === comp.compID),
        templates: templates.filter((tpl) => tpl.compoID === comp.compoID || tpl.compID === comp.compID || tpl.compCode === comp.compCode),
      };
    });

  const handleSelect = async (selectedInvestigation: investigationDto) => {
    try {
      if (!selectedInvestigation.invID) {
        showAlert("Error", "Selected investigation is invalid", "error");
        return;
      }
      setIsLoading(true);
      const response = await investigationlistService.getById(selectedInvestigation.invID);
      if (response.success && response.data) {
        const data = response.data;

        const enhancedComponents = enhanceComponentDetails(data.lComponentsDto || [], data.lCompMultipleDtos || [], data.lCompAgeRangeDtos || [], data.lCompTemplateDtos || []);

        setInvestigationDetails(data.lInvMastDto);
        setComponentDetails(enhancedComponents);
        setCompMultipleDetails(data.lCompMultipleDtos || []);
        setAgeRangeDetails(data.lCompAgeRangeDtos || []);
        setTemplateDetails(data.lCompTemplateDtos || []);
        setPrintPreferences({
          invTitle: data.lInvMastDto?.invTitle || "",
          invSTitle: data.lInvMastDto?.invSTitle || "",
        });
        if (enhancedComponents.length) {
          setSelectedComponent(enhancedComponents[0]);
        }

        setIsSearchOpen(false);
      } else {
        showAlert("Error", "Failed to fetch full investigation details", "error");
      }
    } catch (err) {
      showAlert("Error", "An error occurred while selecting the investigation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback(async (investigation: investigationDto) => {
    try {
      setIsLoading(true);
      if (!investigation.lInvMastDto?.invID) return;

      const response = await investigationlistService.getById(investigation.lInvMastDto.invID);
      if (response.success && response.data) {
        const data = response.data;

        const enhancedComponents = enhanceComponentDetails(data.lComponentsDto || [], data.lCompMultipleDtos || [], data.lCompAgeRangeDtos || [], data.lCompTemplateDtos || []);

        setInvestigationDetails(data.lInvMastDto);
        setComponentDetails(enhancedComponents);
        setCompMultipleDetails(data.lCompMultipleDtos || []);
        setAgeRangeDetails(data.lCompAgeRangeDtos || []);
        setTemplateDetails(data.lCompTemplateDtos || []);
        setPrintPreferences({
          invTitle: data.lInvMastDto?.invTitle || "",
          invSTitle: data.lInvMastDto?.invSTitle || "",
        });

        if (enhancedComponents.length > 0) {
          setSelectedComponent(enhancedComponents[0]);
        }
      } else {
        showAlert("Error", "Could not fetch details", "error");
      }
    } catch (err) {
      showAlert("Error", "Failed to edit investigation", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateFormData = useCallback(() => {
    const errors: InvestigationFormErrors = {};
    if (!investigationDetails?.invCode?.trim()) errors.invCode = "Investigation Code is required.";
    if (!investigationDetails?.invName?.trim()) errors.invName = "Investigation Name is required.";
    if (!investigationDetails?.invShortName?.trim()) errors.invShortName = "Investigation Short Name is required.";
    if (!investigationDetails?.bchID) errors.bchID = "Investigation Type is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [investigationDetails]);

  const handleCodeSelect = async (selectedSuggestion: string) => {
    const selectedCode = selectedSuggestion?.split(" - ")[0]?.trim();
    if (!selectedCode) {
      showAlert("Error", "Invalid investigation code selected.", "error");
      return;
    }

    try {
      setIsLoading(true);

      const allInvestigationsResponse = await investigationlistService.getAll();
      if (allInvestigationsResponse?.success && allInvestigationsResponse.data) {
        const allInvestigations = allInvestigationsResponse.data;

        const matchingInvestigation = allInvestigations.find((inv: investigationDto) => inv.lInvMastDto?.invCode === selectedCode);

        if (matchingInvestigation?.lInvMastDto?.invID) {
          const investigationDetailsResponse = await investigationlistService.getById(matchingInvestigation.lInvMastDto.invID);

          if (investigationDetailsResponse?.success && investigationDetailsResponse.data) {
            const investigationDetails = investigationDetailsResponse.data;

            const { lComponentsDto = [], lCompMultipleDtos = [], lCompAgeRangeDtos = [], lCompTemplateDtos = [] } = investigationDetails;

            // Attach multiple, age, and template data to each component
            const enhancedComponents = lComponentsDto.map((comp: LComponentDto) => {
              const compoID = comp.compoID;

              return {
                ...comp,
                multipleChoices: lCompMultipleDtos.filter((mc: LCompMultipleDto) => mc.compoID === compoID || mc.compOID === compoID),
                ageRanges: lCompAgeRangeDtos.filter((ar: LCompAgeRangeDto) => ar.compoID === compoID || ar.cappID === compoID),
                templates: lCompTemplateDtos.filter((tpl: LCompTemplateDto) => tpl.compoID === comp.compoID || tpl.compID === comp.compID || tpl.compCode === comp.compCode),
              };
            });

            setInvestigationDetails({
              ...investigationDetails.lInvMastDto,
              invCode: selectedCode,
            });

            setComponentDetails(enhancedComponents);
            setCompMultipleDetails(lCompMultipleDtos);
            setAgeRangeDetails(lCompAgeRangeDtos);
            setTemplateDetails(lCompTemplateDtos);
            setPrintPreferences({
              invTitle: investigationDetails.lInvMastDto?.invTitle || "",
              invSTitle: investigationDetails.lInvMastDto?.invSTitle || "",
            });

            if (enhancedComponents.length > 0) {
              setSelectedComponent(enhancedComponents[0]);
            }
          } else {
            showAlert("Info", "No matching investigation details found.", "info");
          }
        } else {
          showAlert("Info", "No matching investigation found.", "info");
        }
      } else {
        showAlert("Error", "Failed to fetch investigations.", "error");
      }
    } catch (error) {
      console.error("Error fetching investigation details:", error);
      showAlert("Error", "Error fetching investigation details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitted(true);

      if (!validateFormData()) {
        notifyWarning("Please fill all mandatory fields.");
        return;
      }

      setIsLoading(true);

      // All components (saved & unsaved) should reset compoID to 0
      const allComponents: LComponentDto[] = [...componentDetails, ...unsavedComponents].map((comp, i) => ({
        ...comp,
        compoID: comp.compoID || 0, // backend assigns IDs
        compOrder: i + 1,
        compCode: comp.compCode || "",
        compName: comp.compName || "",
        mGrpID: typeof comp.mGrpID === "string" ? parseInt(comp.mGrpID, 10) || 0 : comp.mGrpID || 0,
      }));

      const payload: investigationDto = {
        lInvMastDto: {
          ...investigationDetails,
          invTitle: printPreferences.invTitle,
          invSTitle: printPreferences.invSTitle,
          invID: investigationDetails?.invID ?? 0,
        } as LInvMastDto,
        lComponentsDto: allComponents,
        lCompMultipleDtos: [],
        lCompAgeRangeDtos: [],
        lCompTemplateDtos: [],
      };

      // Properly associate multiple choices, age ranges, and templates
      allComponents.forEach((comp) => {
        if (comp.multipleChoices?.length) {
          payload.lCompMultipleDtos.push(
            ...comp.multipleChoices.map((mc: LCompMultipleDto) => ({
              ...mc,
              compoID: comp.compoID || 0,
              cmID: 0,
              invID: comp.invID,
              compID: comp.compID,
              compCode: comp.compCode,
              compName: comp.compoNameCD,
            }))
          );
        }
        if (comp.ageRanges?.length) {
          payload.lCompAgeRangeDtos.push(
            ...comp.ageRanges.map((ar: LCompAgeRangeDto) => ({
              ...ar,
              cappID: 0, // backend will assign cappID
              compoID: 0,
              carID: 0,
              compID: comp.compID,
              compCode: comp.compCode,
              compName: comp.compoNameCD,
            }))
          );
        }
        if (comp.templates?.length) {
          payload.lCompTemplateDtos.push(
            ...comp.templates.map((tp: LCompTemplateDto) => ({
              ...tp,
              compoID: 0, // backend will assign compoID
              cTID: 0,
              invID: comp.invID,
              compID: comp.compID,
              compCode: comp.compCode,
              compName: comp.compoNameCD,
            }))
          );
        }
      });

      const response = await investigationlistService.save(payload);

      if (response.success) {
        showAlert("Success", "Investigation saved successfully", "success");
        setShouldResetForm(true);
        handleClear();
        setUnsavedComponents([]);
      } else {
        showAlert("Error", response.errorMessage || "Save failed", "error");
      }
    } catch (err) {
      showAlert("Warning", "Please Add At-least One Component  ", "warning");
    } finally {
      setIsLoading(false);
      setTimeout(() => setShouldResetForm(false), 100);
    }
  };

  const handleClear = () => {
    setShouldResetForm(true);
    setIsSubmitted(false);
    setInvestigationDetails(null);
    setComponentDetails([]);
    setCompMultipleDetails([]);
    setAgeRangeDetails([]);
    setTemplateDetails([]);
    setPrintPreferences({ invTitle: "", invSTitle: "" });
    setSelectedComponent(null);
    setIsSearchOpen(false);
    setIsComponentDialogOpen(false);
    setTimeout(() => setShouldResetForm(false), 100);
  };
  const handleAddComponent = () => {
    setSelectedComponent(null);
    setIsComponentDialogOpen(true);
  };

  const handleEditComponent = (component: LComponentDto) => {
    const isUnsaved = component.compoID !== 0 && unsavedComponents.some((c) => c.compoID === component.compoID);

    const compWithNestedData: LComponentDto = {
      ...component,
      multipleChoices: isUnsaved ? component.multipleChoices || [] : compMultipleDetails.filter((mc) => mc.compoID === component.compoID || mc.compOID === component.compoID),

      ageRanges: isUnsaved ? component.ageRanges || [] : ageRangeDetails.filter((ar) => ar.compoID === component.compoID || ar.cappID === component.compoID),

      templates: isUnsaved ? component.templates || [] : templateDetails.filter((tpl) => tpl.compoID === component.compoID),
    };

    setSelectedComponent(compWithNestedData);
    setIsComponentDialogOpen(true);
  };

  const handleDeleteComponent = (component: LComponentDto) => {
    const activeSaved = componentDetails.filter((c) => c.rActiveYN !== "N" && c.compoID !== component.compoID);
    const activeUnsaved = unsavedComponents.filter((c) => c.rActiveYN !== "N" && c.compoID !== component.compoID);

    const totalActive = activeSaved.length + activeUnsaved.length;

    // ⛔ If trying to delete the only active component, block it
    if (totalActive === 0) {
      showAlert("Warning", "At least one component is required for this investigation. Deletion not allowed.", "warning");

      return;
    }

    const existsInUnsaved = unsavedComponents.some((c) => c.compoID === component.compoID);

    if (existsInUnsaved) {
      setUnsavedComponents((prev) => prev.map((c) => (c.compoID === component.compoID ? { ...c, rActiveYN: "N" } : c)));
    } else {
      setComponentDetails((prev) => prev.map((c) => (c.compoID === component.compoID ? { ...c, rActiveYN: "N" } : c)));
    }

    if (selectedComponent?.compoID === component.compoID) {
      setSelectedComponent(null);
    }
  };

  const updateInvestigationDetails = useCallback((data: LInvMastDto) => {
    setInvestigationDetails(data);
  }, []);

  const updateComponentDetails = useCallback((compData: LComponentDto) => {
    setComponentDetails((prev) => {
      const idx = prev.findIndex((c) => c.compoID === compData.compoID);
      if (idx >= 0) {
        return prev.map((c, i) => (i === idx ? { ...c, ...compData } : c));
      }
      return prev;
    });

    setUnsavedComponents((prev) => {
      const idx = prev.findIndex((c) => c.compoID === compData.compoID);
      if (idx >= 0) {
        // replace existing unsaved component
        const updated = [...prev];
        updated[idx] = { ...compData };
        return updated;
      }
      return prev; // if not found, don’t add
    });
  }, []);

  const updateCompMultipleDetails = useCallback((multipleData: LCompMultipleDto) => {
    setCompMultipleDetails((prev) => {
      let updated: LCompMultipleDto[];

      const existingIndex = prev.findIndex((m) => m.cmID === multipleData.cmID && m.compoID === multipleData.compoID);

      if (existingIndex >= 0) {
        // 🔁 Update existing by cmID
        updated = prev.map((m, i) => (i === existingIndex ? { ...m, ...multipleData } : m));
      } else {
        // ➕ Add new
        updated = [...prev, multipleData];
      }

      // 🔁 Reflect update inside componentDetails (UI)
      setComponentDetails((prevComponents) =>
        prevComponents.map((comp) =>
          comp.compoID === multipleData.compoID
            ? {
                ...comp,
                multipleChoices: updated.filter((mc) => mc.compoID === comp.compoID),
              }
            : comp
        )
      );

      return updated;
    });
  }, []);

  const updateAgeRangeDetails = useCallback((ageRange: LCompAgeRangeDto) => {
    setAgeRangeDetails((prev) => {
      const idx = prev.findIndex((a) => a.carID === ageRange.carID);
      if (idx >= 0) {
        return prev.map((a, i) => (i === idx ? { ...a, ...ageRange } : a));
      }
      return [...prev, ageRange];
    });
  }, []);

  const updateTemplateDetails = useCallback((template: LCompTemplateDto) => {
    setTemplateDetails((prev) => {
      const idx = prev.findIndex((t) => t.tGroupID === template.tGroupID && t.compoID === template.compoID);
      if (idx >= 0) {
        return prev.map((t, i) => (i === idx ? template : t));
      }
      return [...prev, template];
    });
  }, []);

  const handleUpdateComponentOrder = (updatedComponents: LComponentDto[]) => {
    setComponentDetails(updatedComponents);
  };

  const getEntryTypeName = (id?: number) => {
    if (!id) return "Not Specified";
    const found = dropdownValues["entryType"]?.find((item) => Number(item.value) === id);
    return found ? found.label : "Not Specified";
  };

  const renderComponentDetails = () => {
    const filteredComponentDetails = componentDetails.filter((comp) => comp.rActiveYN !== "N");
    const filteredUnsavedComponents = unsavedComponents.filter((comp) => comp.rActiveYN !== "N");

    // Auto-deselect if selected component is deleted
    const isDeleted = selectedComponent?.rActiveYN === "N";
    const validSelectedComponent = isDeleted ? null : selectedComponent;

    return (
      <ComponentDetailsSection
        componentDetails={filteredComponentDetails}
        unsavedComponents={filteredUnsavedComponents}
        selectedComponent={validSelectedComponent}
        templateDetails={templateDetails}
        ageRangeDetails={ageRangeDetails}
        compMultipleDetails={compMultipleDetails}
        onAddComponent={handleAddComponent}
        onEditComponent={handleEditComponent}
        onDeleteComponent={handleDeleteComponent}
        onSelectComponent={setSelectedComponent}
        getEntryTypeName={getEntryTypeName}
      />
    );
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        <ActionButtonGroup buttons={actionButtons} />

        <InvestigationListSearch open={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelect={handleSelect} />
        <InvestigationPrintOrder
          show={showInvestigationPrintOrder}
          handleClose={() => setShowInvestigationPrintOrder(false)}
          onSelectInvestigation={(data) => {
            showAlert("Success", `Investigation ID ${data.invID} selected.`, "success");
            setShowInvestigationPrintOrder(false);
          }}
        />
      </Box>

      <Box sx={{ mt: 2, mb: 2 }}>
        <InvestigationListDetails
          onUpdate={updateInvestigationDetails}
          investigationData={investigationDetails}
          shouldReset={shouldResetForm}
          isSubmitted={isSubmitted}
          onCodeSelect={handleCodeSelect} // <- Use this prop
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        <CustomButton variant={activeView === "component" ? "contained" : "outlined"} onClick={() => setActiveView("component")}>
          Component Details
        </CustomButton>
        <CustomButton variant={activeView === "printPreferences" ? "contained" : "outlined"} onClick={() => setActiveView("printPreferences")}>
          Print Preferences
        </CustomButton>
      </Box>
      {activeView === "component" ? (
        renderComponentDetails()
      ) : (
        <PrintPreferences
          componentsList={componentDetails}
          reportTitle={printPreferences.invTitle || ""}
          subTitle={printPreferences.invSTitle || ""}
          onReportTitleChange={(val) => setPrintPreferences((prev) => ({ ...prev, invTitle: val }))}
          onSubTitleChange={(val) => setPrintPreferences((prev) => ({ ...prev, invSTitle: val }))}
          onClear={() => setPrintPreferences({ invTitle: "", invSTitle: "" })}
          onUpdateComponentOrder={handleUpdateComponentOrder}
        />
      )}
      <GenericDialog open={isComponentDialogOpen} onClose={() => setIsComponentDialogOpen(false)} title="Component Details" maxWidth="xl" fullWidth>
        <LComponentDetails
          onUpdate={updateComponentDetails}
          onUpdateCompMultiple={updateCompMultipleDetails}
          onUpdateAgeRange={updateAgeRangeDetails}
          onUpdateTemplate={updateTemplateDetails}
          selectedComponent={selectedComponent || undefined}
          setSelectedComponent={setSelectedComponent}
          totalComponentsForInvestigation={componentDetails.length + unsavedComponents.length}
          setUnsavedComponents={setUnsavedComponents}
          handleCloseDialog={() => setIsComponentDialogOpen(false)} // 👈 ADD THIS
        />
      </GenericDialog>

      <Box sx={{ mt: 3 }}>
        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </Box>
    </Container>
  );
};

export default InvestigationListPage;
