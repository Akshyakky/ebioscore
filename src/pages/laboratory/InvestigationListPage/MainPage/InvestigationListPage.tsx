import React, { useState, useCallback } from "react";
import { Box, Button, Container, Grid, Typography, Paper, Divider, IconButton, styled, Zoom, Slide, Chip, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import InvestigationListDetails from "../SubPage/InvestigationListDetails";
import InvestigationListSearch from "../SubPage/InvestigationListSearch";
import LComponentDetails from "../SubPage/InvComponentsDetails";
import { investigationDto, LInvMastDto, LComponentDto, LCompMultipleDto, LCompAgeRangeDto, LCompTemplateDto, InvestigationFormErrors } from "@/interfaces/Laboratory/LInvMastDto";
import { showAlert } from "@/utils/Common/showAlert";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAppSelector } from "@/store/hooks";
import PrintPreferences from "../SubPage/PrintPreference";
import { notifyWarning } from "@/utils/Common/toastManager";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import NavBar from "@/components/GenericNav/GenericNav";
import CustomButton from "@/components/Button/CustomButton";

const ComponentListItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  borderRadius: "12px",
  cursor: "pointer",
  marginBottom: theme.spacing(1.5),
  border: "1px solid rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateX(5px)",
    boxShadow: "0 4px 15px rgba(33, 150, 243, 0.15)",
  },
  "&.selected": {
    backgroundColor: "rgba(33, 150, 243, 0.04)",
    borderColor: theme.palette.primary.main,
    "&::before": {
      width: "4px",
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    width: "0",
    height: "100%",
    background: "linear-gradient(to bottom, #2196F3, #1976D2)",
    transition: "width 0.3s ease",
  },
}));

const InvestigationListPage: React.FC = () => {
  const [investigationDetails, setInvestigationDetails] = useState<LInvMastDto | null>(null);
  const [componentDetails, setComponentDetails] = useState<LComponentDto[]>([]);
  const [compMultipleDetails, setCompMultipleDetails] = useState<LCompMultipleDto[]>([]);
  const [ageRangeDetails, setAgeRangeDetails] = useState<LCompAgeRangeDto[]>([]);
  const [templateDetails, setTemplateDetails] = useState<LCompTemplateDto[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<LComponentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const dropdownValues = useDropdownValues(["entryType"]);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [activeView, setActiveView] = useState<"component" | "printPreferences">("component");
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [unsavedComponents, setUnsavedComponents] = useState<LComponentDto[]>([]);
  const [, setFormErrors] = useState<InvestigationFormErrors>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [printPreferences, setPrintPreferences] = useState<{ invTitle?: string; invSTitle?: string }>({
    invTitle: "",
    invSTitle: "",
  });

  const updateInvestigationDetails = useCallback((data: LInvMastDto) => {
    setInvestigationDetails(data);
  }, []);

  const handleSelect = (selectedInvestigation: investigationDto) => {
    setInvestigationDetails(selectedInvestigation.lInvMastDto);
    setComponentDetails(selectedInvestigation.lComponentsDto || []);
    setTemplateDetails(selectedInvestigation.lCompTemplateDtos || []);
    setSelectedComponent(selectedInvestigation.lComponentsDto?.[0] || null);
    setAgeRangeDetails(selectedInvestigation.lCompAgeRangeDtos || []);
    setCompMultipleDetails(selectedInvestigation.lCompMultipleDtos || []);
    setPrintPreferences({
      invTitle: selectedInvestigation.lInvMastDto?.invTitle || "",
      invSTitle: selectedInvestigation.lInvMastDto?.invSTitle || "",
    });
    setIsSearchOpen(false);
  };

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const validateFormData = useCallback(() => {
    const errors: InvestigationFormErrors = {};
    if (!investigationDetails?.invCode?.trim()) {
      errors.invCode = "Investigation Code is required.";
    }
    if (!investigationDetails?.invName?.trim()) {
      errors.invName = "Investigation Name is required.";
    }
    if (!investigationDetails?.invShortName?.trim()) {
      errors.invShortName = "Investigation Short Name  is required.";
    }
    if (!investigationDetails?.bchID) {
      errors.bchID = "Investigation Type  is required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (isSubmitted) {
      }
      return false;
    }

    return true;
  }, [investigationDetails, isSubmitted]);

  const updateComponentDetails = useCallback(
    (
      data: LComponentDto & {
        ageRanges?: LCompAgeRangeDto[];
        multipleChoiceValues?: LCompMultipleDto[];
      }
    ) => {
      setComponentDetails((prev) => {
        const existingComponentIndex = prev.findIndex((c) => c.compoID === data.compoID);
        if (existingComponentIndex !== -1) {
          return prev.map((comp) =>
            comp.compoID === data.compoID
              ? {
                  ...comp,
                  ...data,
                  multipleChoiceValues: data.multipleChoiceValues || comp.multipleChoiceValues || [],
                  ageRanges: data.ageRanges || comp.ageRanges || [],
                }
              : comp
          );
        }

        return [...prev, data];
      });

      if (data.ageRanges?.length) {
        setAgeRangeDetails((prev) => {
          const filteredRanges = prev.filter((range) => range.compOID !== data.compoID);

          const updatedRanges = (data.ageRanges ?? []).map((range) => ({
            ...range,
            compOID: data.compoID || 0,
            cappID: data.compoID || 0,
          }));

          return [...filteredRanges, ...updatedRanges];
        });
      }

      setIsComponentDialogOpen(false);
    },
    []
  );

  const updateCompMultipleDetails = useCallback((data: LCompMultipleDto) => {
    if (!data.cmValues?.trim()) return;
    setCompMultipleDetails((prev) => {
      const filtered = prev.filter((item) => item.cmValues?.trim() !== "");
      const existingIndex = filtered.findIndex((item) => item.compOID === data.compOID && item.cmValues === data.cmValues);
      if (existingIndex >= 0) {
        const updated = [...filtered];
        updated[existingIndex] = data;
        return updated;
      }
      if (data.defaultYN === "Y") {
        filtered.forEach((item) => {
          if (item.compOID === data.compOID) {
            item.defaultYN = "N";
          }
        });
      }
      return [...filtered, data];
    });
  }, []);

  const updateAgeRangeDetails = useCallback((newAgeRange: LCompAgeRangeDto) => {
    setAgeRangeDetails((prev) => {
      const existingEntryIndex = prev.findIndex(
        (range) => range.carStart === newAgeRange.carStart && range.carEnd === newAgeRange.carEnd && range.carName === newAgeRange.carName && range.carSex === newAgeRange.carSex
      );

      if (existingEntryIndex !== -1) {
        const updatedRanges = [...prev];
        updatedRanges[existingEntryIndex] = { ...prev[existingEntryIndex], ...newAgeRange };
        return updatedRanges;
      }

      return [...prev, newAgeRange];
    });

    setSelectedComponent((prev) => {
      if (prev) {
        const updatedAgeRanges = prev.ageRanges ? prev.ageRanges.map((range: LCompAgeRangeDto) => (range.carID === newAgeRange.carID ? newAgeRange : range)) : [];

        return { ...prev, ageRanges: updatedAgeRanges };
      }
      return prev;
    });
  }, []);

  const updateTemplateDetails = useCallback((data: LCompTemplateDto) => {
    setTemplateDetails((prev) => {
      const existingIndex = prev.findIndex((t) => t.tGroupID === data.tGroupID && t.compOID === data.compOID);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        return [...prev, data];
      }
    });

    setComponentDetails((prev) =>
      prev.map((comp) =>
        comp.compoID === data.compOID
          ? {
              ...comp,
              templates: [...(comp.templates || []).filter((t: LCompTemplateDto) => t.tGroupID !== data.tGroupID), data],
            }
          : comp
      )
    );

    setSelectedComponent((prev) =>
      prev && prev.compoID === data.compOID
        ? {
            ...prev,
            templates: [...(prev.templates || []).filter((t: LCompTemplateDto) => t.tGroupID !== data.tGroupID), data],
          }
        : prev
    );
  }, []);

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

        const matchingInvestigation = allInvestigations.find((inv: LInvMastDto) => inv?.lInvMastDto?.invCode === selectedCode);

        if (matchingInvestigation?.lInvMastDto?.invID) {
          const investigationDetailsResponse = await investigationlistService.getById(matchingInvestigation.lInvMastDto.invID);

          if (investigationDetailsResponse?.success && investigationDetailsResponse.data) {
            const investigationDetails = investigationDetailsResponse.data;

            setInvestigationDetails({
              ...investigationDetails.lInvMastDto,
              invCode: selectedCode,
            });
            setComponentDetails(investigationDetails.lComponentsDto || []);
            setCompMultipleDetails(investigationDetails.lCompMultipleDtos || []);
            setAgeRangeDetails(investigationDetails.lCompAgeRangeDtos || []);
            setTemplateDetails(investigationDetails.lCompTemplateDtos || []);
            setPrintPreferences({
              invTitle: investigationDetails.lInvMastDto?.invTitle || "",
              invSTitle: investigationDetails.lInvMastDto?.invSTitle || "",
            });

            if (investigationDetails.lComponentsDto?.length > 0) {
              setSelectedComponent({
                ...investigationDetails.lComponentsDto[0],
                ageRanges:
                  investigationDetails.lCompAgeRangeDtos?.filter(
                    (range: LCompAgeRangeDto) => range.compOID === investigationDetails.lComponentsDto[0].compoID || range.cappID === investigationDetails.lComponentsDto[0].compoID
                  ) || [],
              });
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

  const mergedComponents = [...componentDetails, ...unsavedComponents];

  const handleSave = async () => {
    setIsSubmitted(true);
    if (!validateFormData()) {
      notifyWarning("Please fill all mandatory fields.");
      return;
    }
    const defaultInvestigationDetails: LInvMastDto = {
      invID: investigationDetails?.invID ?? 0,
      invName: investigationDetails?.invName || "",
      invTypeCode: investigationDetails?.invTypeCode || "",
      invReportYN: investigationDetails?.invReportYN || "N",
      invSampleYN: investigationDetails?.invSampleYN || "N",
      invPrintOrder: investigationDetails?.invPrintOrder || 0,
      deptID: investigationDetails?.deptID ?? 0,
      rCreatedOn: investigationDetails?.rCreatedOn || new Date(),
      rModifiedOn: investigationDetails?.rModifiedOn || new Date(),
      rCreatedID: investigationDetails?.rCreatedID || 0,
      rModifiedID: investigationDetails?.rModifiedID || 0,
      bchID: investigationDetails?.bchID ?? 0,
      invCode: investigationDetails?.invCode || "",
      invType: investigationDetails?.invType || "",
      invNHCode: investigationDetails?.invNHCode || "",
      invNHEnglishName: investigationDetails?.invNHEnglishName || "",
      invNHGreekName: investigationDetails?.invNHGreekName || "",
      invSampleType: investigationDetails?.invSampleType || "",
      invShortName: investigationDetails?.invShortName || "",
      methods: investigationDetails?.methods || "",
      coopLabs: investigationDetails?.coopLabs || "",
      compID: investigationDetails?.compID ?? 0,
      compCode: investigationDetails?.compCode || "",
      compName: investigationDetails?.compName || "",
      transferYN: investigationDetails?.transferYN || "N",
      rActiveYN: investigationDetails?.rActiveYN || "Y",
    };

    const payload: investigationDto = {
      lInvMastDto: {
        ...defaultInvestigationDetails,
        invTitle: printPreferences.invTitle,
        invSTitle: printPreferences.invSTitle,
      },
      lComponentsDto: mergedComponents.map((comp, index) => ({
        ...comp,
        compCode: compCode || "",
        compName: compName || "",
        invNameCD: investigationDetails?.invName || "",
        mGrpID: typeof comp.mGrpID === "string" ? parseInt(comp.mGrpID, 10) || 0 : comp.mGrpID || 0,
        deltaValPercent: typeof comp.deltaValPercent === "string" ? parseFloat(comp.deltaValPercent) : comp.deltaValPercent || 0,
        compoID: comp.compoID < 0 ? 0 : comp.compoID,
        compOrder: comp.compOrder || index + 1,
      })),
      lCompMultipleDtos: compMultipleDetails.map((multiple) => ({
        ...multiple,
        cmID: multiple.cmID,
        compOID: multiple.compOID,
        cmValues: multiple.cmValues,
        rModifiedOn: new Date(),
        rActiveYN: "Y",
        compID: compID || 0,
        compCode: multiple.compCode || "",
        compName: multiple.compName || "",
        transferYN: multiple.transferYN || "N",
      })),
      lCompAgeRangeDtos: ageRangeDetails.filter(
        (range, index, self) => index === self.findIndex((r) => r.carStart === range.carStart && r.carEnd === range.carEnd && r.carName === range.carName)
      ),

      lCompTemplateDtos: templateDetails,
    };

    try {
      setIsLoading(true);
      const response = await investigationlistService.save(payload);

      if (response.success) {
        const updatedComponents = [...componentDetails.filter((comp) => comp.compoID !== 0), ...response.data.lComponentsDto];
        setComponentDetails(updatedComponents);
        showAlert("success", "Investigation details saved successfully!", "success");
        setShouldResetForm(true);
        handleClear();
        setIsSearchOpen(false);
        setIsComponentDialogOpen(false);
        setUnsavedComponents([]);
      } else {
        showAlert("error", response.errorMessage || "Failed to save data.", "error");
      }
    } catch (error) {
      showAlert("Warning", "Please Add AtLeast One Component To Save Investigation", "warning");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShouldResetForm(false);
      }, 100);
    }
  };

  const handleClear = () => {
    setShouldResetForm(true);
    setIsSubmitted(false);
    setInvestigationDetails(null);
    setComponentDetails([]);
    setSelectedComponent(null);
    setCompMultipleDetails([]);
    setAgeRangeDetails([]);
    setTemplateDetails([]);
    setIsSearchOpen(false);
    setIsComponentDialogOpen(false);
    setPrintPreferences({ invTitle: "", invSTitle: "" });
    setTimeout(() => {
      setShouldResetForm(false);
    }, 100);
  };

  const getEntryTypeName = (lCentID: number | undefined) => {
    if (!lCentID) return "Not Specified";
    const entryTypeFromDropdown = dropdownValues["entryType"]?.find((item) => Number(item.value) === lCentID);

    if (entryTypeFromDropdown) {
      return entryTypeFromDropdown.label;
    }
    const entryTypeMap: { [key: number]: string } = {
      5: "Multiple Choice",
      6: "Age Range",
      7: "Template Values [Alpha Numeric]",
    };

    return entryTypeMap[lCentID] || "Not Specified";
  };

  const handleEditComponent = (component: LComponentDto) => {
    const componentAgeRanges = ageRangeDetails.filter((range) => range.compOID === component.compoID || range.cappID === component.compoID);
    const componentMultipleChoices = compMultipleDetails.filter((multiple) => multiple.compOID === component.compoID && multiple.cmValues?.trim() !== "");

    setSelectedComponent({
      ...component,
      ageRanges: componentAgeRanges,
      multipleChoices: componentMultipleChoices,
    });

    setIsComponentDialogOpen(true);
  };

  const handleDeleteComponent = (component: LComponentDto) => {
    setComponentDetails((prev) => prev.map((c) => (c.compoID === component.compoID ? { ...c, rActiveYN: "N" } : c)));
    if (selectedComponent?.compoID === component.compoID) {
      setSelectedComponent(null);
    }
  };

  const handleEdit = useCallback(async (investigation: investigationDto) => {
    try {
      debugger;
      setIsLoading(true);
      const invID = investigation.lInvMastDto?.invID;
      if (!invID) {
        showAlert("error", "Invalid investigation ID", "error");
        return;
      }

      const response = await investigationlistService.getById(invID);
      if (response.success && response.data) {
        const investigationDetails = response.data.lInvMastDto;
        setInvestigationDetails(response.data.lInvMastDto);
        setPrintPreferences({
          invTitle: investigationDetails.invTitle || "",
          invSTitle: investigationDetails.invSTitle || "",
        });
        const components = response.data.lComponentsDto || [];
        const ageRanges = response.data.lCompAgeRangeDtos || [];
        const sortedComponents = components
          .sort((a: LComponentDto, b: LComponentDto) => (a.compOrder || 0) - (b.compOrder || 0))
          .map((comp: LComponentDto) => {
            const componentAgeRanges = ageRanges
              .filter((range: LCompAgeRangeDto) => range.compOID === comp.compoID || range.cappID === comp.compoID)
              .map((range: LCompAgeRangeDto) => ({
                ...range,
                compOID: comp.compoID,
                cappID: comp.compoID,
                rActiveYN: "Y",
              }));

            return {
              ...comp,
              ageRanges: componentAgeRanges,
            };
          });

        setComponentDetails(sortedComponents);

        const activeAgeRanges = ageRanges.map((range: LCompAgeRangeDto) => ({
          ...range,
          rActiveYN: "Y",
        }));
        setAgeRangeDetails(activeAgeRanges);

        setCompMultipleDetails(response.data.lCompMultipleDtos || []);
        setTemplateDetails(response.data.lCompTemplateDtos || []);

        if (sortedComponents.length > 0) {
          setSelectedComponent({
            ...sortedComponents[0],
            ageRanges: activeAgeRanges.filter((range: LCompAgeRangeDto) => range.compOID === sortedComponents[0].compoID || range.cappID === sortedComponents[0].compoID),
          });
        }
      } else {
        showAlert("error", response.errorMessage || "Failed to fetch investigation details", "error");
      }
    } catch (error) {
      showAlert("error", "An error occurred while fetching investigation details", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateComponentOrder = (updatedComponents: LComponentDto[]) => {
    setComponentDetails(updatedComponents);
  };

  const handleAddComponent = () => {
    setSelectedComponent(null);
    setIsComponentDialogOpen(true);
  };

  const navButtons = [
    {
      label: "Component Details",
      value: "component",
      onClick: () => setActiveView("component"),
      icon: <VisibilityIcon />,
    },
    {
      label: "Print Preferences",
      value: "printPreferences",
      onClick: () => setActiveView("printPreferences"),
      icon: <PrintIcon />,
    },
  ];

  const renderComponentDetails = () => (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomButton variant="contained" color="primary" icon={AddIcon} onClick={handleAddComponent} size="small">
            Add Component
          </CustomButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              maxHeight: "75vh",
              overflow: "auto",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              background: "linear-gradient(145deg, #ffffff, #f5f7fa)",
              position: "relative",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                borderRadius: "16px 16px 0 0",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Component Library
            </Typography>

            {componentDetails
              .filter((comp) => comp.rActiveYN !== "N")
              .map((component) => (
                <Zoom in key={`component-${component.compoID}-${component.compOCodeCD}`} timeout={300}>
                  <ComponentListItem
                    className={selectedComponent?.compoID === component.compoID ? "selected" : ""}
                    sx={{
                      mb: 2,
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      background: selectedComponent?.compoID === component.compoID ? "linear-gradient(145deg, rgba(33, 150, 243, 0.08), rgba(33, 150, 243, 0.15))" : "white",
                      boxShadow: selectedComponent?.compoID === component.compoID ? "0 4px 20px rgba(33, 150, 243, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
                      border: selectedComponent?.compoID === component.compoID ? "1px solid rgba(33, 150, 243, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Box sx={{ p: 2, width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(2px)",
                            },
                          }}
                          onClick={() => setSelectedComponent(component)}
                        >
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              color: selectedComponent?.compoID === component.compoID ? "#1976d2" : "inherit",
                            }}
                          >
                            {component.compoNameCD || "Unnamed Component"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {component.compOCodeCD || "No Code"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditComponent(component)}
                            sx={{
                              background: "rgba(33, 150, 243, 0.1)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.1) rotate(5deg)",
                                background: "rgba(33, 150, 243, 0.2)",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteComponent(component)}
                            sx={{
                              background: "rgba(244, 67, 54, 0.1)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.1) rotate(-5deg)",
                                background: "rgba(244, 67, 54, 0.2)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={getEntryTypeName(component.lCentID)}
                        sx={{
                          background: "linear-gradient(45deg, #3a7bd5, #00d2ff)",
                          color: "white",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          borderRadius: "8px",
                          "& .MuiChip-label": {
                            px: 1.5,
                          },
                        }}
                      />
                    </Box>
                  </ComponentListItem>
                </Zoom>
              ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Slide direction="left" in={!!selectedComponent && selectedComponent.rActiveYN !== "N"} timeout={400}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "16px",
                background: "linear-gradient(145deg, #ffffff, #f5f7fa)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                minHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {selectedComponent && selectedComponent.rActiveYN !== "N" ? (
                <>
                  <Box
                    sx={{
                      mb: 3,
                      pb: 2,
                      borderBottom: "2px solid",
                      borderImage: "linear-gradient(to right, #3a7bd5, #00d2ff, transparent) 1",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                        backgroundClip: "text",
                        textFillColor: "transparent",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                      }}
                    >
                      Component Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Component Type
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {getEntryTypeName(selectedComponent.lCentID)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Component Name
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {selectedComponent.compoNameCD}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: "12px",
                          background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                          border: "1px solid rgba(58, 123, 213, 0.15)",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(58, 123, 213, 0.15)",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mb: 1,
                            fontWeight: 500,
                            color: "#3a7bd5",
                          }}
                        >
                          Component Code
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedComponent.compOCodeCD}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: "12px",
                          background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                          border: "1px solid rgba(58, 123, 213, 0.15)",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(58, 123, 213, 0.15)",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mb: 1,
                            fontWeight: 500,
                            color: "#3a7bd5",
                          }}
                        >
                          Short Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedComponent.cShortNameCD}
                        </Typography>
                      </Box>
                    </Grid>

                    {selectedComponent.lCentID === 7 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                              backgroundClip: "text",
                              textFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              display: "inline-block",
                            }}
                          >
                            Template Values
                          </Typography>
                          {(() => {
                            const componentTemplates = templateDetails.filter((template) => template.compOID === selectedComponent.compoID);

                            if (componentTemplates.length === 0) {
                              return (
                                <Box
                                  sx={{
                                    p: 4,
                                    borderRadius: "12px",
                                    background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                                    border: "1px dashed rgba(58, 123, 213, 0.3)",
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    No template values found for this component
                                  </Typography>
                                </Box>
                              );
                            }

                            const groupedTemplates = componentTemplates.reduce(
                              (acc, template) => {
                                const groupName = template.tGroupName || "Unnamed Group";
                                if (!acc[groupName]) acc[groupName] = [];
                                acc[groupName].push(template);
                                return acc;
                              },
                              {} as Record<string, LCompTemplateDto[]>
                            );

                            return Object.entries(groupedTemplates).map(([groupName, templates], index) => (
                              <Zoom in key={groupName} timeout={300 + index * 100}>
                                <Paper
                                  sx={{
                                    p: 3,
                                    mb: 2,
                                    borderRadius: "12px",
                                    background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                                    border: "1px solid rgba(58, 123, 213, 0.15)",
                                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                      boxShadow: "0 8px 24px rgba(58, 123, 213, 0.15)",
                                    },
                                  }}
                                >
                                  <Box sx={{ mb: 1 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        fontWeight: 600,
                                        color: "#3a7bd5",
                                        display: "flex",
                                        alignItems: "center",
                                        "& svg": {
                                          mr: 1,
                                        },
                                      }}
                                    >
                                      Template Group: {groupName}
                                    </Typography>
                                  </Box>
                                  <Divider sx={{ my: 2 }} />
                                  {templates.map((template, tIndex) => (
                                    <Box
                                      key={template.cTID}
                                      sx={{
                                        p: 2,
                                        borderRadius: "8px",
                                        mb: tIndex < templates.length - 1 ? 2 : 0,
                                        background: "rgba(255, 255, 255, 0.5)",
                                        border: "1px solid rgba(58, 123, 213, 0.1)",
                                      }}
                                    >
                                      <Typography
                                        component="div"
                                        variant="body2"
                                        dangerouslySetInnerHTML={{
                                          __html: template.cTText ?? "",
                                        }}
                                      />
                                    </Box>
                                  ))}
                                </Paper>
                              </Zoom>
                            ));
                          })()}
                        </Box>
                      </Grid>
                    )}

                    {selectedComponent?.lCentID === 6 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                              backgroundClip: "text",
                              textFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              display: "inline-block",
                            }}
                          >
                            Age Range Values
                          </Typography>
                          {[
                            ...new Map(
                              ageRangeDetails
                                .filter((ar: LCompAgeRangeDto) => ar.compOID === selectedComponent.compoID || ar.cappID === selectedComponent.compoID)
                                .map((item) => [item.carID, item])
                            ),
                          ].map(([_, range]: [number, LCompAgeRangeDto], index) => (
                            <Zoom in key={`range-${range.carID}`} timeout={300 + index * 100}>
                              <Paper
                                sx={{
                                  p: 3,
                                  mb: 2,
                                  borderRadius: "12px",
                                  background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                                  border: "1px solid rgba(58, 123, 213, 0.15)",
                                  transition: "all 0.3s ease",
                                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 8px 24px rgba(58, 123, 213, 0.15)",
                                  },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 1,
                                    "& strong": {
                                      fontWeight: 600,
                                      color: "#3a7bd5",
                                    },
                                  }}
                                >
                                  <strong>Normal Value:</strong> {range.carName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 1,
                                    "& strong": {
                                      fontWeight: 600,
                                      color: "#3a7bd5",
                                    },
                                  }}
                                >
                                  <strong>Age Range:</strong> {`${range.carStart} - ${range.carEnd} ${range.carAgeType}`}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    "& strong": {
                                      fontWeight: 600,
                                      color: "#3a7bd5",
                                    },
                                  }}
                                >
                                  <strong>Sex:</strong> {range.carSex}
                                </Typography>
                              </Paper>
                            </Zoom>
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {selectedComponent?.lCentID === 5 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              background: "linear-gradient(90deg, #3a7bd5, #00d2ff)",
                              backgroundClip: "text",
                              textFillColor: "transparent",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              display: "inline-block",
                            }}
                          >
                            Multiple Choice Values
                          </Typography>
                          {compMultipleDetails.filter((cm: LCompMultipleDto) => cm.compOID === selectedComponent.compoID).length === 0 ? (
                            <Box
                              sx={{
                                p: 4,
                                borderRadius: "12px",
                                background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                                border: "1px dashed rgba(58, 123, 213, 0.3)",
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                No multiple choice values found for this component
                              </Typography>
                            </Box>
                          ) : (
                            <Grid container spacing={2}>
                              {compMultipleDetails
                                .filter((cm: LCompMultipleDto) => cm.compOID === selectedComponent.compoID)
                                .map((choice: LCompMultipleDto, index: number) => (
                                  <Grid item xs={12} sm={6} md={4} key={`choice-${choice.cmID}-${choice.compOID}-${index}`}>
                                    <Zoom in timeout={300 + index * 50}>
                                      <Paper
                                        sx={{
                                          p: 2,
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          borderRadius: "12px",
                                          background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                                          border: "1px solid rgba(58, 123, 213, 0.15)",
                                          transition: "all 0.3s ease",
                                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                                          "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 8px 24px rgba(58, 123, 213, 0.15)",
                                          },
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            textAlign: "center",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {choice.cmValues}
                                        </Typography>
                                      </Paper>
                                    </Zoom>
                                  </Grid>
                                ))}
                            </Grid>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              ) : (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: "text.secondary",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    background: "linear-gradient(145deg, #ffffff, #f0f7ff)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      color: "#3a7bd5",
                      opacity: 0.7,
                    }}
                  >
                    No Component Selected
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Select a component from the list to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth={false}>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <ActionButtonGroup
          buttons={[
            {
              variant: "contained",
              size: "medium",
              icon: SearchIcon,
              text: "Advanced Search",
              onClick: handleAdvancedSearch,
            },
          ]}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <InvestigationListDetails
          onUpdate={updateInvestigationDetails}
          investigationData={investigationDetails}
          shouldReset={shouldResetForm}
          onCodeSelect={handleCodeSelect}
          isSubmitted={isSubmitted}
        />
      </Box>

      <NavBar buttons={navButtons} />

      {/* Conditionally render details based on activeView */}
      {activeView === "component" && renderComponentDetails()}
      {activeView === "printPreferences" && (
        <PrintPreferences
          componentsList={componentDetails}
          reportTitle={printPreferences.invTitle || ""}
          subTitle={printPreferences.invSTitle || ""}
          onReportTitleChange={(title) => setPrintPreferences((prev) => ({ ...prev, invTitle: title }))}
          onSubTitleChange={(subTitle) => setPrintPreferences((prev) => ({ ...prev, invSTitle: subTitle }))}
          onClear={() => setPrintPreferences({ invTitle: "", invSTitle: "" })}
          onUpdateComponentOrder={handleUpdateComponentOrder}
        />
      )}

      <Box sx={{ mt: 4 }}>
        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </Box>
      <InvestigationListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} onEdit={handleEdit} />

      <GenericDialog open={isComponentDialogOpen} onClose={() => setIsComponentDialogOpen(false)} title="Add New Component" maxWidth="xl" fullWidth>
        <LComponentDetails
          onUpdate={updateComponentDetails}
          onUpdateCompMultiple={updateCompMultipleDetails}
          onUpdateAgeRange={updateAgeRangeDetails}
          onUpdateTemplate={updateTemplateDetails}
          selectedComponent={{
            ...selectedComponent!,
            ageRanges: ageRangeDetails.filter((ar) => ar.compOID === selectedComponent?.compoID || ar.cappID === selectedComponent?.compoID),
            templates: templateDetails.filter((template) => template.compOID === selectedComponent?.compoID),
          }}
          setSelectedComponent={setSelectedComponent}
          totalComponentsForInvestigation={componentDetails.filter((comp) => comp.invID === investigationDetails?.invID).length}
        />
      </GenericDialog>
    </Container>
  );
};

export default InvestigationListPage;
