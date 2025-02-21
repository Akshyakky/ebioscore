import React, { useState, useCallback } from "react";
import { Box, Button, Card, CardContent, Container, Grid, Typography, Paper, Divider, IconButton, styled, Zoom, Tooltip, Slide, Chip, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
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

const AnimatedCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: theme.shadows[5],
  borderRadius: 10,
  "&:hover": {
    boxShadow: theme.shadows[12],
    transform: "scale(1.02)",
  },
}));

const DetailField = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
    transform: "scale(1.03)",
  },
}));

const StyledTemplateCard = styled(Card)(({ theme }) => ({
  position: "relative",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  "&:hover": {
    transform: "translateY(-8px) scale(1.01)",
    boxShadow: "0 20px 30px rgba(0, 0, 0, 0.1)",
    "&::before": {
      transform: "translateX(0)",
      opacity: 1,
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: "linear-gradient(90deg, #2196f3, #00bcd4, #3f51b5)",
    transform: "translateX(-100%)",
    opacity: 0,
    transition: "all 0.4s ease",
  },
  "& .actions": {
    position: "absolute",
    top: 12,
    right: 12,
    opacity: 0,
    transform: "translateX(10px)",
    transition: "all 0.3s ease",
  },
  "&:hover .actions": {
    opacity: 1,
    transform: "translateX(0)",
  },
}));

const TemplateContent = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(2),
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: theme.shape.borderRadius,
  border: "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
    boxShadow: "0 8px 12px rgba(0, 0, 0, 0.08)",
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.1) rotate(5deg)",
    backgroundColor: theme.palette.action.hover,
  },
}));

const ComponentHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
  borderRadius: "10px 10px 0 0",
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
    animation: "shimmer 2s infinite",
  },
  "@keyframes shimmer": {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
}));

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

const DetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.shape.borderRadius * 2,
  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
  position: "relative",
  overflow: "hidden",
  maxHeight: "80vh",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    borderRadius: "10px",
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  backgroundColor: "#fff",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "3px",
    background: "linear-gradient(to bottom, #2196F3, #21CBF3)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    "&::before": {
      opacity: 1,
    },
  },
}));

const DetailInfoGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3),
  "& .detail-label": {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: "0.875rem",
    marginBottom: theme.spacing(0.5),
  },
  "& .detail-value": {
    fontSize: "1rem",
    fontWeight: 500,
  },
}));

const DetailSection = styled(Box)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "6px",
    background: "linear-gradient(90deg, #2196F3, #21CBF3, #2196F3)",
    borderRadius: "8px 8px 0 0",
    animation: "shimmerBorder 2s infinite linear",
  },
  "@keyframes shimmerBorder": {
    "0%": { backgroundPosition: "0% 0%" },
    "100%": { backgroundPosition: "200% 0%" },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "40px",
    height: "3px",
    background: theme.palette.primary.main,
    borderRadius: "2px",
    animation: "expandWidth 0.5s ease-out forwards",
  },
  "@keyframes expandWidth": {
    from: { width: "0" },
    to: { width: "40px" },
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
  const dropdownValues = useDropdownValues(["entryType"]);

  const handleAdvancedSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

  const updateInvestigationDetails = useCallback((data: LInvMastDto) => {
    setInvestigationDetails(data);
  }, []);

  const handleSelect = (selectedInvestigation: investigationDto) => {
    setInvestigationDetails(selectedInvestigation.lInvMastDto);
    setComponentDetails(selectedInvestigation.lComponentsDto || []);
    setCompMultipleDetails(selectedInvestigation.lCompMultipleDtos || []);
    setAgeRangeDetails(selectedInvestigation.lCompAgeRangeDtos || []);
    setTemplateDetails(selectedInvestigation.lCompTemplateDtos || []);
    setIsSearchOpen(false);
  };

  const updateComponentDetails = useCallback((data: LComponentDto) => {
    setComponentDetails((prev) => [...prev, data]);
    setIsComponentDialogOpen(false);
  }, []);

  const updateCompMultipleDetails = useCallback((data: LCompMultipleDto) => {
    setCompMultipleDetails((prev) => {
      const exists = prev.some((item) => item.cmValues === data.cmValues);
      if (!exists) {
        return [...prev, data];
      }
      return prev;
    });
  }, []);

  const updateAgeRangeDetails = useCallback((data: LCompAgeRangeDto) => {
    setAgeRangeDetails((prev) => {
      const exists = prev.some((item) => item.carSex === data.carSex && item.carStart === data.carStart && item.carEnd === data.carEnd && item.carAgeType === data.carAgeType);

      if (!exists) {
        return [...prev, data];
      }
      return prev;
    });
  }, []);

  const updateTemplateDetails = useCallback((data: LCompTemplateDto) => {
    setTemplateDetails((prev) => {
      // Check if template with same group and component exists
      const existingIndex = prev.findIndex((t) => t.tGroupID === data.tGroupID && t.compOID === data.compOID);

      if (existingIndex >= 0) {
        // Update existing template
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        // Add new template
        return [...prev, data];
      }
    });
  }, []);

  const handleSave = async () => {
    debugger;
    if (!investigationDetails || componentDetails.length === 0) {
      showAlert("error", "Please enter all required details before saving.", "error");
      return;
    }

    const payload: investigationDto = {
      lInvMastDto: investigationDetails,
      lComponentsDto: componentDetails,
      lCompMultipleDtos: compMultipleDetails,
      lCompAgeRangeDtos: ageRangeDetails,
      lCompTemplateDtos: templateDetails,
    };

    try {
      const response = await investigationlistService.save(payload);
      if (response.success) {
        showAlert("success", "Investigation details saved successfully!", "success");
        handleClear();
      } else {
        showAlert("error", response.errorMessage || "Failed to save data.", "error");
      }
    } catch (error) {
      showAlert("error", "An error occurred while saving the data.", "error");
    }
  };

  const handleClear = () => {
    setInvestigationDetails(null);
    setComponentDetails([]);
    setSelectedComponent(null);
    setCompMultipleDetails([]);
    setAgeRangeDetails([]);
    setTemplateDetails([]);
  };

  const handleEditTemplate = (componentId: number) => {
    const template = templateDetails.find((t) => t.compOID === componentId);
    if (template) {
      console.log("Editing template:", template);
    }
  };

  const handleDeleteTemplate = (componentId: number) => {
    console.log("Deleting template for component:", componentId);
  };

  const getEntryTypeName = (lCentID: number | undefined) => {
    if (!lCentID) return "Not Specified";

    // First try to find in dropdown values
    const entryTypeFromDropdown = dropdownValues["entryType"]?.find((item) => Number(item.value) === lCentID);

    if (entryTypeFromDropdown) {
      return entryTypeFromDropdown.label;
    }

    // Map common entry type IDs to names if dropdown fails
    const entryTypeMap: { [key: number]: string } = {
      5: "Multiple Choice",
      6: "Age Range",
      7: "Template Values [Alpha Numeric]",
      // Add other mappings as needed
    };

    return entryTypeMap[lCentID] || "Not Specified";
  };

  const handleEditComponent = (component: LComponentDto) => {
    setSelectedComponent(component);
    setIsComponentDialogOpen(true);
  };

  const handleDeleteComponent = (component: LComponentDto) => {
    setComponentDetails((prev) => prev.filter((c) => c.compoID !== component.compoID));
    if (selectedComponent?.compoID === component.compoID) {
      setSelectedComponent(null);
    }
  };

  const debugTemplates = (selectedComp: LComponentDto) => {
    console.log("All Templates:", templateDetails);
    console.log("Selected Component:", selectedComp);
    const filtered = templateDetails.filter((t) => t.compOID === selectedComp.compoID);
    console.log("Filtered Templates:", filtered);
  };

  const handleEdit = async (investigation: investigationDto) => {
    try {
      const invID = investigation.lInvMastDto?.invID;
      if (!invID) {
        showAlert("error", "Investigation ID not found", "error");
        return;
      }

      setIsLoading(true);
      const response = await investigationlistService.getById(invID);
      console.log("Edit API Response:", response);

      if (response.success && response.data) {
        const investigationData = response.data;
        console.log("Investigation Data to populate:", investigationData);

        // Update main investigation details
        setInvestigationDetails(investigationData);

        // Update components and related details
        if (investigationData.lComponentsDto && investigationData.lComponentsDto.length > 0) {
          setComponentDetails(investigationData.lComponentsDto);
          // Set the first component as selected by default
          setSelectedComponent(investigationData.lComponentsDto[0]);
          setIsComponentDialogOpen(true); // Open the component dialog automatically
        }

        if (investigationData.lCompMultipleDtos) {
          setCompMultipleDetails(investigationData.lCompMultipleDtos);
        }

        if (investigationData.lCompAgeRangeDtos) {
          setAgeRangeDetails(investigationData.lCompAgeRangeDtos);
        }

        if (investigationData.lCompTemplateDtos) {
          setTemplateDetails(investigationData.lCompTemplateDtos);
        }

        setIsSearchOpen(false);
      } else {
        showAlert("error", response.errorMessage || "Failed to fetch investigation details", "error");
      }
    } catch (error) {
      console.error("Error fetching investigation details:", error);
      showAlert("error", "An error occurred while fetching the investigation details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderComponentDetails = () => (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left side - Component List */}
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

            {componentDetails.map((component: LComponentDto) => (
              <Zoom in key={component.compCode}>
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
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{component.compoNameCD}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {component.compOCodeCD}
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

        {/* Right side - Details Panel */}
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

                    {/* Show type-specific details based on lCentID */}
                    {selectedComponent.lCentID === 7 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Template Values
                          </Typography>
                          {(() => {
                            // Filter templates for the current component only
                            const componentTemplates = templateDetails.filter((t) => t.compOID === selectedComponent.compoID);

                            if (componentTemplates.length === 0) {
                              return (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                  No template values found for this component
                                </Typography>
                              );
                            }

                            // Group templates by template group
                            const groupedTemplates = componentTemplates.reduce(
                              (acc, template) => {
                                const groupName = template.tGroupName || "Unnamed Group";
                                if (!acc[groupName]) {
                                  acc[groupName] = [];
                                }
                                acc[groupName].push(template);
                                return acc;
                              },
                              {} as Record<string, LCompTemplateDto[]>
                            );

                            return Object.entries(groupedTemplates).map(([groupName, templates]) => (
                              <Zoom in key={`group-${selectedComponent.compoID}-${groupName}`}>
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Template Group:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {groupName}
                                    </Typography>
                                  </Box>
                                  <Divider sx={{ my: 1 }} />
                                  {templates.map((template) => (
                                    <Box key={`template-${template.cTID}`}>
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

                    {selectedComponent.lCentID === 6 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Age Range Values
                          </Typography>
                          {ageRangeDetails
                            .filter((ar) => ar.compOID === selectedComponent.compoID)
                            .map((range, index) => (
                              <Zoom in key={index}>
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                  <Typography variant="body2">{`${range.carStart} - ${range.carEnd} ${range.carAgeType} (${range.carSex})`}</Typography>
                                </Paper>
                              </Zoom>
                            ))}
                        </Box>
                      </Grid>
                    )}

                    {selectedComponent.lCentID === 5 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                            Multiple Choice Values
                          </Typography>
                          {compMultipleDetails
                            .filter((cm) => cm.compOID === selectedComponent.compoID)
                            .map((choice, index) => (
                              <Zoom in key={index}>
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                  <Typography variant="body2">{choice.cmValues}</Typography>
                                </Paper>
                              </Zoom>
                            ))}
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
        <InvestigationListDetails onUpdate={updateInvestigationDetails} investigationData={investigationDetails} />
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
          selectedComponent={selectedComponent!}
          setSelectedComponent={setSelectedComponent}
        />
      </GenericDialog>
    </Container>
  );
};

export default InvestigationListPage;
