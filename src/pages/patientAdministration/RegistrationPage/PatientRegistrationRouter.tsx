// src/pages/patientAdministration/RegistrationPage/PatientRegistrationRouter.tsx
import { EditNote as EditNoteIcon, GridView as GridViewIcon, PersonAdd as PersonAddIcon, Search as SearchIcon } from "@mui/icons-material";
import { Box, Chip, Paper, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import PatientRegistrationFormManager from "./MainPage/PatientRegistrationFormManager";
import PatientRegistrationManager from "./MainPage/PatientRegistrationManager";

type RegistrationMode = "search-first" | "form-first";

interface PatientRegistrationRouterProps {
  defaultMode?: RegistrationMode;
  allowModeSwitch?: boolean;
  showModeDescription?: boolean;
}

const PatientRegistrationRouter: React.FC<PatientRegistrationRouterProps> = ({ defaultMode = "search-first", allowModeSwitch = true, showModeDescription = true }) => {
  const [currentMode, setCurrentMode] = useState<RegistrationMode>(defaultMode);

  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: RegistrationMode | null) => {
      if (newMode && allowModeSwitch) {
        setCurrentMode(newMode);
      }
    },
    [allowModeSwitch]
  );

  const renderModeSelector = () => {
    if (!allowModeSwitch) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Patient Registration Module
            </Typography>
            {showModeDescription && (
              <Typography variant="body2" color="text.secondary">
                {currentMode === "search-first"
                  ? "Search and manage existing patients, then add new ones as needed"
                  : "Focus on patient registration with quick search capabilities"}
              </Typography>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Chip label={currentMode === "search-first" ? "Search-First Mode" : "Form-First Mode"} color="primary" variant="filled" />

            <ToggleButtonGroup value={currentMode} exclusive onChange={handleModeChange} aria-label="registration mode" size="small">
              <ToggleButton value="search-first" aria-label="search first mode">
                <Tooltip title="Search-First Mode: Patient grid and search as primary interface">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GridViewIcon fontSize="small" />
                    <Typography variant="body2">Search First</Typography>
                  </Stack>
                </Tooltip>
              </ToggleButton>

              <ToggleButton value="form-first" aria-label="form first mode">
                <Tooltip title="Form-First Mode: Registration form as primary interface">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EditNoteIcon fontSize="small" />
                    <Typography variant="body2">Form First</Typography>
                  </Stack>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {showModeDescription && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
            <Stack direction="row" spacing={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <SearchIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  <strong>Search-First:</strong> Best for patient lookup and management workflows
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <PersonAddIcon fontSize="small" color="success" />
                <Typography variant="caption">
                  <strong>Form-First:</strong> Optimized for new patient registration workflows
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>
    );
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case "search-first":
        return <PatientRegistrationManager defaultMode="grid" showStats={true} enableBulkOperations={false} />;

      case "form-first":
        return <PatientRegistrationFormManager showSearchInSidebar={true} enableQuickActions={true} showPatientStats={false} />;

      default:
        return null;
    }
  };

  return (
    <Box>
      {renderModeSelector()}
      {renderCurrentMode()}
    </Box>
  );
};

export default PatientRegistrationRouter;
