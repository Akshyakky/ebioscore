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
import { investigationDto, LInvMastDto, LComponentDto, LCompMultipleDto, LCompAgeRangeDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";
import { showAlert } from "@/utils/Common/showAlert";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAppSelector } from "@/store/hooks";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const dropdownValues = useDropdownValues(["entryType"]);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [updatedComponentDetails, setUpdatedComponentDetails] = useState<LComponentDto[]>([]); // New state for updated components

  const handleAdvancedSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

  const updateInvestigationDetails = useCallback((data: LInvMastDto) => {
    setInvestigationDetails(data);
  }, []);

  const handleSelect = (selectedInvestigation: investigationDto) => {
    setInvestigationDetails(selectedInvestigation.lInvMastDto);
    setComponentDetails(selectedInvestigation.lComponentsDto || []);
    setTemplateDetails(selectedInvestigation.lCompTemplateDtos || []);
    setSelectedComponent(selectedInvestigation.lComponentsDto?.[0] || null);
    setIsSearchOpen(false);
  };

  const updateComponentDetails = useCallback((data: LComponentDto & { ageRanges?: LCompAgeRangeDto[] }) => {
    debugger;
    setComponentDetails((prev) => {
      const existingIndex = prev.findIndex((c) => c.compoID === data.compoID);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      }
      return [...prev, data];
    });
    if (data.ageRanges?.length) {
      setAgeRangeDetails((prev) => {
        const filteredRanges = prev.filter((range) => range.compOID !== data.compoID);
        const updatedRanges = data.ageRanges!.map((range) => ({
          ...range,
          compOID: data.compoID,
          cappID: data.compoID,
        }));

        return [...filteredRanges, ...updatedRanges];
      });
    }

    setIsComponentDialogOpen(false);
  }, []);

  const updateCompMultipleDetails = useCallback((data: LCompMultipleDto) => {
    debugger;
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
      const updatedRanges = prev.map((range) => (range.carID === newAgeRange.carID ? { ...range, ...newAgeRange } : range));
      return updatedRanges.some((range) => range.carID === newAgeRange.carID) ? updatedRanges : [...prev, newAgeRange];
    });

    // Update the selected component's ageRanges
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

  const handleSave = async () => {
    debugger;
    if (!investigationDetails || componentDetails.length === 0) {
      showAlert("error", "Please enter all required details before saving.", "error");
      return;
    }

    const payload: investigationDto = {
      lInvMastDto: investigationDetails,
      lComponentsDto: componentDetails.map((comp) => ({
        ...comp,
        compCode: compCode || "",
        compName: compName || "",
        invNameCD: investigationDetails?.invName || "",
        // lCentNameCD: comp.lCentNameCD || "DEFAULT_LCENT_NAME",
        // lCentTypeCD: comp.lCentTypeCD || "DEFAULT_LCENT_TYPE",
        mGrpID: typeof comp.mGrpID === "string" ? parseInt(comp.mGrpID, 10) || 0 : comp.mGrpID || 0,
        deltaValPercent: typeof comp.deltaValPercent === "string" ? parseFloat(comp.deltaValPercent) : comp.deltaValPercent || 0,
      })),
      lCompMultipleDtos: compMultipleDetails.map((multiple) => ({
        ...multiple,
        cmID: multiple.cmID,
        compOID: multiple.compOID,
        cmValues: multiple.cmValues,
        rModifiedOn: new Date(),
        rActiveYN: "Y",
        compID: multiple.compID || 1,
        compCode: multiple.compCode || "",
        compName: multiple.compName || "",
        transferYN: multiple.transferYN || "N",
      })),
      lCompAgeRangeDtos: ageRangeDetails,
      lCompTemplateDtos: templateDetails,
    };

    try {
      setIsLoading(true);
      console.log("Saving Payload:", JSON.stringify(payload, null, 2)); // Debug log to check payload
      const response = await investigationlistService.save(payload);

      if (response.success) {
        showAlert("success", "Investigation details saved successfully!", "success");
        setShouldResetForm(true);
        handleClear();
        setIsSearchOpen(false);
        setIsComponentDialogOpen(false);
      } else {
        showAlert("error", response.errorMessage || "Failed to save data.", "error");
      }
    } catch (error) {
      showAlert("error", "An error occurred while saving the data.", "error");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setShouldResetForm(false);
      }, 100);
    }
  };

  const handleClear = () => {
    setShouldResetForm(true);
    setInvestigationDetails(null);
    setComponentDetails([]);
    setSelectedComponent(null);
    setCompMultipleDetails([]);
    setAgeRangeDetails([]);
    setTemplateDetails([]);
    setIsSearchOpen(false);
    setIsComponentDialogOpen(false);
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

    setSelectedComponent({
      ...component,
      ageRanges: componentAgeRanges,
    });
    setIsComponentDialogOpen(true);
  };

  const handleDeleteComponent = (component: LComponentDto) => {
    setComponentDetails((prev) => prev.filter((c) => c.compoID !== component.compoID));
    if (selectedComponent?.compoID === component.compoID) {
      setSelectedComponent(null);
    }
  };

  const handleEdit = useCallback(async (investigation: investigationDto) => {
    try {
      setIsLoading(true);
      const invID = investigation.lInvMastDto?.invID;
      if (!invID) {
        showAlert("error", "Invalid investigation ID", "error");
        return;
      }
      const response = await investigationlistService.getById(invID);
      if (response.success && response.data) {
        setInvestigationDetails(response.data.lInvMastDto);
        const components = response.data.lComponentsDto || [];
        const ageRanges = response.data.lCompAgeRangeDtos || [];
        const componentsWithAgeRanges = components.map((comp: LComponentDto) => {
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

        setComponentDetails(componentsWithAgeRanges);
        const activeAgeRanges = ageRanges.map((range: LCompAgeRangeDto) => ({
          ...range,
          rActiveYN: "Y",
        }));
        setAgeRangeDetails(activeAgeRanges);

        setCompMultipleDetails(response.data.lCompMultipleDtos || []);
        setTemplateDetails(response.data.lCompTemplateDtos || []);

        if (componentsWithAgeRanges.length > 0) {
          setSelectedComponent({
            ...componentsWithAgeRanges[0],
            ageRanges: activeAgeRanges.filter(
              (range: LCompAgeRangeDto) => range.compOID === componentsWithAgeRanges[0].compoID || range.cappID === componentsWithAgeRanges[0].compoID
            ),
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

  const renderComponentDetails = () => (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: "70vh", overflow: "auto", borderRadius: 3 }}>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Components List
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setIsComponentDialogOpen(true)}
                sx={{
                  background: "linear-gradient(45deg, #4CAF50 30%, #45a849 90%)",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #45a849 30%, #4CAF50 90%)",
                  },
                }}
              >
                Add
              </Button>
            </Box>

            {componentDetails.map((component) => (
              <Zoom in key={`component-${component.compoID}-${component.compOCodeCD}`}>
                <ComponentListItem className={selectedComponent?.compoID === component.compoID ? "selected" : ""}>
                  <Box sx={{ pl: 2, width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, cursor: "pointer" }} onClick={() => setSelectedComponent(component)}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{component.compoNameCD || "Unnamed Component"}</Typography>
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
                            "&:hover": {
                              transform: "scale(1.1)",
                              background: "rgba(33, 150, 243, 0.1)",
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
                            "&:hover": {
                              transform: "scale(1.1)",
                              background: "rgba(244, 67, 54, 0.1)",
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
                        background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                        color: "white",
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                </ComponentListItem>
              </Zoom>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Slide direction="left" in={!!selectedComponent}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              {selectedComponent ? (
                <>
                  <Box
                    sx={{
                      mb: 3,
                      pb: 2,
                      borderBottom: "2px solid",
                      borderImage: "linear-gradient(to right, #2196F3, transparent) 1",
                    }}
                  >
                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                      Component Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Component Type
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {getEntryTypeName(selectedComponent.lCentID)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Component Name
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {selectedComponent.compoNameCD}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(33, 150, 243, 0.03)",
                          border: "1px solid rgba(33, 150, 243, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": { transform: "translateY(-2px)" },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Component Code
                        </Typography>
                        <Typography variant="body1">{selectedComponent.compOCodeCD}</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "rgba(33, 150, 243, 0.03)",
                          border: "1px solid rgba(33, 150, 243, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": { transform: "translateY(-2px)" },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Short Name
                        </Typography>
                        <Typography variant="body1">{selectedComponent.cShortNameCD}</Typography>
                      </Box>
                    </Grid>

                    {/* Template Values */}
                    {selectedComponent.lCentID === 7 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Template Values
                          </Typography>
                          {(() => {
                            const componentTemplates = templateDetails.filter((template) => template.compOID === selectedComponent.compoID);

                            if (componentTemplates.length === 0) {
                              return (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                  No template values found for this component
                                </Typography>
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

                            return Object.entries(groupedTemplates).map(([groupName, templates]) => (
                              <Zoom in key={groupName}>
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Template Group: {groupName}
                                    </Typography>
                                  </Box>
                                  <Divider sx={{ my: 1 }} />
                                  {templates.map((template) => (
                                    <Box key={template.cTID}>
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

                    {/* Age Range Values */}
                    {selectedComponent?.lCentID === 6 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Age Range Values
                          </Typography>
                          {ageRangeDetails
                            .filter((ar: LCompAgeRangeDto) => ar.compOID === selectedComponent.compoID || ar.cappID === selectedComponent.compoID)
                            .map((range: LCompAgeRangeDto) => (
                              <Zoom in key={`range-${range.carID}`}>
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Normal Value:</strong> {range.carName}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Age Range:</strong> {`${range.carStart} - ${range.carEnd} ${range.carAgeType}`}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Sex:</strong> {range.carSex}
                                  </Typography>
                                </Paper>
                              </Zoom>
                            ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Multiple Choice Values */}
                    {selectedComponent?.lCentID === 5 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Multiple Choice Values
                          </Typography>
                          {compMultipleDetails.filter((cm: LCompMultipleDto) => cm.compOID === selectedComponent.compoID).length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                              No multiple choice values found for this component
                            </Typography>
                          ) : (
                            compMultipleDetails
                              .filter((cm: LCompMultipleDto) => cm.compOID === selectedComponent.compoID && cm.cmValues?.trim())
                              .map((choice: LCompMultipleDto, index: number) => (
                                <Zoom in key={`choice-${choice.cmID}-${choice.compOID}-${index}`}>
                                  <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                    <Typography variant="body2">{choice.cmValues}</Typography>
                                  </Paper>
                                </Zoom>
                              ))
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              ) : (
                <Box
                  sx={{
                    py: 6,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography>Select a component from the list</Typography>
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
        <InvestigationListDetails onUpdate={updateInvestigationDetails} investigationData={investigationDetails} shouldReset={shouldResetForm} />
      </Box>

      {renderComponentDetails()}

      <Box sx={{ mt: 4 }}>
        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </Box>

      <InvestigationListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} onEdit={handleEdit} />

      <GenericDialog open={isComponentDialogOpen} onClose={() => setIsComponentDialogOpen(false)} title="Add New Component" maxWidth="md" fullWidth>
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
        />
      </GenericDialog>
    </Container>
  );
};

export default InvestigationListPage;
