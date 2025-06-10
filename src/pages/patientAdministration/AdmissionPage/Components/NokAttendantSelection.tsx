// src/pages/patientAdministration/AdmissionPage/Components/NokAttendantSelection.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Paper, Card, CardContent, Grid, Chip, Radio, RadioGroup, FormControlLabel, Alert, Avatar, Stack, Divider } from "@mui/material";
import { People as PeopleIcon, Person as PersonIcon, Phone as PhoneIcon, CalendarToday as CalendarIcon, Add as AddIcon } from "@mui/icons-material";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { formatDt } from "@/utils/Common/dateUtils";
import { useAlert } from "@/providers/AlertProvider";
import NextOfKinManagement from "@/pages/patientAdministration/RegistrationPage/Components/NextOfKinManagement";
import { useLoading } from "@/hooks/Common/useLoading";

interface NokAttendantSelectionProps {
  pChartID: number;
  patientName: string;
  selectedNokID?: number;
  onNokSelect: (nokDetails: PatNokDetailsDto | null) => void;
  onManageNok?: () => void;
}

const NokAttendantSelection: React.FC<NokAttendantSelectionProps> = ({ pChartID, patientName, selectedNokID, onNokSelect, onManageNok }) => {
  const [nokList, setNokList] = useState<PatNokDetailsDto[]>([]);
  const { isLoading, setLoading } = useLoading();
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const [isNokManagementOpen, setIsNokManagementOpen] = useState(false);

  const { showAlert } = useAlert();

  // Load NOK data
  const loadNokData = useCallback(async () => {
    if (!pChartID) return;

    try {
      setLoading(true);
      const result = await PatNokService.getNokDetailsByPChartID(pChartID);

      if (result.success && result.data) {
        const activeNokList = result.data.filter((nok) => nok.rActiveYN === "Y");
        setNokList(activeNokList);

        // Set selected NOK if provided
        if (selectedNokID) {
          const preSelectedNok = activeNokList.find((nok) => nok.pNokID === selectedNokID);
          if (preSelectedNok) {
            setSelectedNok(preSelectedNok);
            onNokSelect(preSelectedNok);
          }
        }
      } else {
        setNokList([]);
      }
    } catch (error) {
      console.error("Error loading NOK data:", error);
      showAlert("Error", "Failed to load Next of Kin information", "error");
      setNokList([]);
    } finally {
      setLoading(false);
    }
  }, [pChartID, selectedNokID, onNokSelect, showAlert]);

  // Load data on mount and when pChartID changes
  useEffect(() => {
    loadNokData();
  }, [loadNokData]);

  // Handle NOK selection
  const handleNokSelection = useCallback(
    (nokId: string) => {
      const nokIdNumber = parseInt(nokId);
      const selected = nokList.find((nok) => nok.pNokID === nokIdNumber);

      if (selected) {
        setSelectedNok(selected);
        onNokSelect(selected);
      } else if (nokId === "none") {
        setSelectedNok(null);
        onNokSelect(null);
      }
    },
    [nokList, onNokSelect]
  );

  // Handle NOK management
  const handleManageNok = useCallback(() => {
    if (onManageNok) {
      onManageNok();
    } else {
      setIsNokManagementOpen(true);
    }
  }, [onManageNok]);

  const handleNokManagementClose = useCallback(() => {
    setIsNokManagementOpen(false);
    // Refresh NOK data after management
    loadNokData();
  }, [loadNokData]);

  // Format NOK display name
  const formatNokName = useCallback((nok: PatNokDetailsDto) => {
    return `${nok.pNokFName} ${nok.pNokMName || ""} ${nok.pNokLName}`.trim();
  }, []);

  // Get age from DOB
  const calculateAge = useCallback((dob: Date) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, []);

  const nokOptions = useMemo(() => {
    return nokList.map((nok) => ({
      ...nok,
      displayName: formatNokName(nok),
      age: nok.pNokDob ? calculateAge(new Date(nok.pNokDob)) : null,
    }));
  }, [nokList, formatNokName, calculateAge]);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading Next of Kin information...
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid", borderColor: "grey.300" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PeopleIcon fontSize="small" />
            Select Patient Attendant
          </Typography>
          <CustomButton variant="outlined" text="Manage NOK" icon={AddIcon} size="small" onClick={handleManageNok} />
        </Box>

        {nokOptions.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No Next of Kin records found. Please add family members first to select an attendant.
          </Alert>
        ) : (
          <Box>
            <RadioGroup value={selectedNok?.pNokID?.toString() || "none"} onChange={(e) => handleNokSelection(e.target.value)}>
              {/* Option for no attendant */}
              <FormControlLabel
                value="none"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    No attendant required
                  </Typography>
                }
                sx={{ mb: 1 }}
              />

              {/* NOK options */}
              {nokOptions.map((nok) => (
                <Card
                  key={nok.pNokID}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    cursor: "pointer",
                    border: selectedNok?.pNokID === nok.pNokID ? "2px solid" : "1px solid",
                    borderColor: selectedNok?.pNokID === nok.pNokID ? "primary.main" : "grey.300",
                    backgroundColor: selectedNok?.pNokID === nok.pNokID ? "primary.50" : "white",
                    "&:hover": {
                      borderColor: "primary.light",
                      backgroundColor: "primary.25",
                    },
                  }}
                  onClick={() => handleNokSelection(nok.pNokID.toString())}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <FormControlLabel
                      value={nok.pNokID.toString()}
                      control={<Radio size="small" />}
                      label={
                        <Box display="flex" alignItems="center" gap={1.5} width="100%">
                          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box flex={1}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {nok.displayName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {nok.pNokTitle}
                                </Typography>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 3 }}>
                                <Typography variant="body2">
                                  <strong>Relation:</strong> {nok.pNokRelName}
                                </Typography>
                                {nok.age && (
                                  <Typography variant="caption" color="text.secondary">
                                    Age: {nok.age} years
                                  </Typography>
                                )}
                              </Grid>

                              <Grid size={{ xs: 12, sm: 3 }}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PhoneIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{nok.pAddPhone1}</Typography>
                                </Box>
                                {nok.pAddPhone2 && (
                                  <Typography variant="caption" color="text.secondary">
                                    Alt: {nok.pAddPhone2}
                                  </Typography>
                                )}
                              </Grid>

                              <Grid size={{ xs: 12, sm: 2 }}>
                                <Chip size="small" label="Active" color="success" variant="outlined" />
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0, width: "100%" }}
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {selectedNok && (
              <Box mt={2}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Selected Attendant: <strong>{selectedNok.displayName}</strong> ({selectedNok.pNokRelName})
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* NOK Management Dialog */}
      <NextOfKinManagement open={isNokManagementOpen} onClose={handleNokManagementClose} pChartID={pChartID} patientName={patientName} />
    </>
  );
};

export default NokAttendantSelection;
