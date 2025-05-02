import React from "react";
import { Box, Grid, Typography, Paper, IconButton, Chip, Divider, Zoom, Slide } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "@/components/Button/CustomButton";
import { LComponentDto, LCompTemplateDto, LCompAgeRangeDto, LCompMultipleDto } from "@/interfaces/Laboratory/LInvMastDto";

interface ComponentDetailsSectionProps {
  componentDetails: LComponentDto[];
  unsavedComponents: LComponentDto[];
  selectedComponent: LComponentDto | null;
  templateDetails: LCompTemplateDto[];
  ageRangeDetails: LCompAgeRangeDto[];
  compMultipleDetails: LCompMultipleDto[];
  onAddComponent: () => void;
  onEditComponent: (component: LComponentDto) => void;
  onDeleteComponent: (component: LComponentDto) => void;
  onSelectComponent: (component: LComponentDto) => void;
  getEntryTypeName: (id?: number) => string;
}

const ComponentDetailsSection: React.FC<ComponentDetailsSectionProps> = ({
  componentDetails,
  unsavedComponents,
  selectedComponent,
  // templateDetails,
  // ageRangeDetails,
  // compMultipleDetails,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
  onSelectComponent,
  getEntryTypeName,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <CustomButton variant="contained" color="primary" icon={AddIcon} onClick={onAddComponent} size="small">
            Add Component
          </CustomButton>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, maxHeight: "75vh", overflow: "auto", borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Component Library
            </Typography>

            {[...componentDetails, ...unsavedComponents]
              .filter((comp) => comp.rActiveYN !== "N")
              .map((component) => (
                <Zoom in key={component.compoID} timeout={300}>
                  <Paper
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      border: selectedComponent?.compoID === component.compoID ? "1px solid #1976d2" : "1px solid #ccc",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box onClick={() => onSelectComponent(component)}>
                        <Typography variant="subtitle1">{component.compoNameCD || "Unnamed Component"}</Typography>
                        <Typography variant="caption">{component.compOCodeCD || "No Code"}</Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" color="primary" onClick={() => onEditComponent(component)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDeleteComponent(component)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Chip size="small" label={getEntryTypeName(component.lCentID)} sx={{ mt: 1 }} />

                    {/* Newly added associated details */}
                    {component.multipleChoices?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Multiple Choices:</Typography>
                        {component.multipleChoices.map((mc: LCompMultipleDto, idx: any) => (
                          <Typography key={idx} variant="body2">
                            - {mc.cmValues}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {component.ageRanges?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Age Ranges:</Typography>
                        {component.ageRanges.map((ar: LCompAgeRangeDto, idx: any) => (
                          <Typography key={idx} variant="body2">
                            - {ar.carName} ({ar.carStart}-{ar.carEnd} {ar.carAgeType})
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {component.templates?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Templates:</Typography>
                        {component.templates.map((tp: LCompTemplateDto, idx: any) => (
                          <Typography key={idx} variant="body2">
                            - {tp.tGroupName}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Zoom>
              ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Slide direction="left" in={!!selectedComponent && selectedComponent.rActiveYN !== "N"} timeout={400}>
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: "60vh" }}>
              {selectedComponent ? (
                <>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {selectedComponent.compoNameCD}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2">Type:</Typography>
                      <Typography>{getEntryTypeName(selectedComponent.lCentID)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2">Code:</Typography>
                      <Typography>{selectedComponent.compOCodeCD}</Typography>
                    </Grid>
                  </Grid>

                  {selectedComponent.lCentID === 5 && selectedComponent.multipleChoices?.length && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6">Multiple Choice Values</Typography>
                      {selectedComponent.multipleChoices.map((choice: LCompMultipleDto, idx: any) => (
                        <Paper key={idx} sx={{ mt: 1, p: 2 }}>
                          <Typography>{choice.cmValues}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {selectedComponent.lCentID === 6 && selectedComponent.ageRanges?.length && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6">Age Range Values</Typography>
                      {selectedComponent.ageRanges.map((range: LCompAgeRangeDto) => (
                        <Paper key={range.carID || Math.random()} sx={{ mt: 1, p: 2 }}>
                          <Typography>
                            <strong>Value:</strong> {range.carName}
                          </Typography>
                          <Typography>
                            <strong>Age:</strong> {range.carStart}-{range.carEnd} {range.carAgeType}
                          </Typography>
                          <Typography>
                            <strong>Sex:</strong> {range.carSex}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {selectedComponent.lCentID === 7 && selectedComponent.templates?.length && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6">Template Values</Typography>
                      {selectedComponent.templates.map((template: LCompTemplateDto) => (
                        <Paper key={template.cTID || Math.random()} sx={{ mt: 1, p: 2 }}>
                          <Typography dangerouslySetInnerHTML={{ __html: template.cTText ?? "" }} />
                        </Paper>
                      ))}
                    </Box>
                  )}
                </>
              ) : (
                <Typography>No component selected. Please pick one from the list.</Typography>
              )}
            </Paper>
          </Slide>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComponentDetailsSection;
