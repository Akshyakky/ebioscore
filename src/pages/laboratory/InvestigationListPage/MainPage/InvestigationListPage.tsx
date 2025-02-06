import React, { useState, useCallback } from "react";
import { Box, Button, Card, CardContent, Container, Grid, Typography, Paper, Divider, IconButton, Fade, styled, useTheme, Zoom, Tooltip, Slide } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import InvestigationListDetails from "../SubPage/InvestigationListDetails";
import InvestigationListSearch from "../SubPage/InvestigationListSearch";
import LComponentDetails from "../SubPage/InvComponentsDetails";
import { investigationDto, LInvMastDto, LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import { showAlert } from "@/utils/Common/showAlert";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

// Styled Components
const ComponentCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "4px",
    backgroundColor: theme.palette.primary.main,
  },
}));

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

const InvestigationListPage: React.FC = () => {
  const theme = useTheme();
  const [investigationDetails, setInvestigationDetails] = useState<LInvMastDto | null>(null);
  const [componentDetails, setComponentDetails] = useState<LComponentDto[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<LComponentDto | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);

  const handleAdvancedSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

  const updateInvestigationDetails = useCallback((data: LInvMastDto) => {
    setInvestigationDetails(data);
  }, []);

  const handleSelect = (selectedInvestigation: LInvMastDto) => {
    setInvestigationDetails(selectedInvestigation);
    setIsSearchOpen(false);
  };

  const updateComponentDetails = useCallback((data: LComponentDto) => {
    setComponentDetails((prev) => [...prev, data]);
    setIsComponentDialogOpen(false);
  }, []);

  const handleSave = async () => {
    if (!investigationDetails || componentDetails.length === 0) {
      showAlert("error", "Please enter all required details before saving.", "error");
      return;
    }

    const payload: investigationDto = {
      linvMastDto: investigationDetails,
      lcomponentsDto: componentDetails,
    };

    try {
      const response = await investigationlistService.save(payload);
      if (response.success) {
        showAlert("success", "Investigation details saved successfully!", "success");
      } else {
        showAlert("error", "Failed to save data.", "error");
      }
    } catch (error) {
      showAlert("error", "An error occurred while saving the data.", "error");
    }
  };

  return (
    <Container maxWidth={false}>
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
        <InvestigationListDetails onUpdate={updateInvestigationDetails} />
      </Box>

      {/* Components Section */}
      {/* Components Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Test Components
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsComponentDialogOpen(true)}>
            Add Component
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {componentDetails.map((component: LComponentDto) => (
                <Zoom in key={component.compCode}>
                  <AnimatedCard onClick={() => setSelectedComponent(component)}>
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h6" color="primary">
                          {component.compoNameCD}
                        </Typography>
                        <Tooltip title="Settings">
                          <IconButton>
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="body2">Code: {component.compOCodeCD}</Typography>
                    </CardContent>
                  </AnimatedCard>
                </Zoom>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Slide direction="left" in={!!selectedComponent} mountOnEnter unmountOnExit>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                {selectedComponent ? (
                  <>
                    <Typography variant="h6">Component Details</Typography>
                    <Divider sx={{ my: 2 }} />
                    <DetailField>
                      <Typography variant="caption">Component Code</Typography>
                      <Typography variant="body1">{selectedComponent.compOCodeCD}</Typography>
                    </DetailField>
                    <DetailField>
                      <Typography variant="caption">Component Name</Typography>
                      <Typography variant="body1">{selectedComponent.compoNameCD}</Typography>
                    </DetailField>
                    <DetailField>
                      <Typography variant="caption">Short Name</Typography>
                      <Typography variant="body1">{selectedComponent.cShortNameCD}</Typography>
                    </DetailField>
                    <DetailField>
                      <Typography variant="caption">Entry Type</Typography>
                      <Typography variant="body1">{selectedComponent.lCentNameCD}</Typography>
                    </DetailField>
                  </>
                ) : (
                  <Typography>Select a component to view details</Typography>
                )}
              </Paper>
            </Slide>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={() => {
            setInvestigationDetails(null);
            setComponentDetails([]);
            setSelectedComponent(null);
          }}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </Box>

      <InvestigationListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />

      <GenericDialog open={isComponentDialogOpen} onClose={() => setIsComponentDialogOpen(false)} title="Add New Component" maxWidth="md" fullWidth>
        <LComponentDetails onUpdate={updateComponentDetails} />
      </GenericDialog>
    </Container>
  );
};

export default InvestigationListPage;
