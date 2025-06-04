// src/pages/patientAdministration/AdmissionPage/Components/InsuranceSelectionForAdmission.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Paper, Card, CardContent, Grid, Chip, Radio, RadioGroup, FormControlLabel, Alert, Avatar, Stack, Divider } from "@mui/material";
import { AccountBalance as InsuranceIcon, Warning as WarningIcon, CheckCircle as ActiveIcon, Error as ExpiredIcon, Add as AddIcon } from "@mui/icons-material";
import CustomButton from "@/components/Button/CustomButton";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { formatDt } from "@/utils/Common/dateUtils";
import { useAlert } from "@/providers/AlertProvider";
import PatientInsuranceManagement from "@/pages/patientAdministration/RegistrationPage/Components/PatientInsuranceManagement";

interface InsuranceSelectionForAdmissionProps {
  pChartID: number;
  patientName: string;
  selectedInsuranceID?: number;
  onInsuranceSelect: (insuranceDetails: OPIPInsurancesDto | null) => void;
  onManageInsurance?: () => void;
}

const InsuranceSelectionForAdmission: React.FC<InsuranceSelectionForAdmissionProps> = ({ pChartID, patientName, selectedInsuranceID, onInsuranceSelect, onManageInsurance }) => {
  const [insuranceList, setInsuranceList] = useState<OPIPInsurancesDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<OPIPInsurancesDto | null>(null);
  const [isInsuranceManagementOpen, setIsInsuranceManagementOpen] = useState(false);

  const { showAlert } = useAlert();

  // Load insurance data
  const loadInsuranceData = useCallback(async () => {
    if (!pChartID) return;

    try {
      setLoading(true);
      const result = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);

      if (result.success && result.data) {
        const activeInsurances = result.data.filter((insurance) => insurance.rActiveYN === "Y");
        setInsuranceList(activeInsurances);

        // Set selected insurance if provided
        if (selectedInsuranceID) {
          const preSelectedInsurance = activeInsurances.find((insurance) => insurance.oPIPInsID === selectedInsuranceID);
          if (preSelectedInsurance) {
            setSelectedInsurance(preSelectedInsurance);
            onInsuranceSelect(preSelectedInsurance);
          }
        }
      } else {
        setInsuranceList([]);
      }
    } catch (error) {
      console.error("Error loading insurance data:", error);
      showAlert("Error", "Failed to load insurance information", "error");
      setInsuranceList([]);
    } finally {
      setLoading(false);
    }
  }, [pChartID, selectedInsuranceID, onInsuranceSelect, showAlert]);

  // Load data on mount and when pChartID changes
  useEffect(() => {
    loadInsuranceData();
  }, [loadInsuranceData]);

  // Handle insurance selection
  const handleInsuranceSelection = useCallback(
    (insuranceId: string) => {
      const insuranceIdNumber = parseInt(insuranceId);
      const selected = insuranceList.find((insurance) => insurance.oPIPInsID === insuranceIdNumber);

      if (selected) {
        setSelectedInsurance(selected);
        onInsuranceSelect(selected);
      } else if (insuranceId === "none") {
        setSelectedInsurance(null);
        onInsuranceSelect(null);
      }
    },
    [insuranceList, onInsuranceSelect]
  );

  // Handle insurance management
  const handleManageInsurance = useCallback(() => {
    if (onManageInsurance) {
      onManageInsurance();
    } else {
      setIsInsuranceManagementOpen(true);
    }
  }, [onManageInsurance]);

  const handleInsuranceManagementClose = useCallback(() => {
    setIsInsuranceManagementOpen(false);
    // Refresh insurance data after management
    loadInsuranceData();
  }, [loadInsuranceData]);

  // Check if policy is expired
  const isPolicyExpired = useCallback((endDate: Date) => {
    return new Date() > new Date(endDate);
  }, []);

  // Check if policy is expiring soon (within 30 days)
  const isPolicyExpiringSoon = useCallback(
    (endDate: Date) => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return new Date(endDate) <= thirtyDaysFromNow && !isPolicyExpired(endDate);
    },
    [isPolicyExpired]
  );

  // Format policy period display
  const formatPolicyPeriod = useCallback((startDate: Date, endDate: Date) => {
    return `${formatDt(startDate)} - ${formatDt(endDate)}`;
  }, []);

  // Get policy status
  const getPolicyStatus = useCallback(
    (insurance: OPIPInsurancesDto) => {
      if (!insurance.policyEndDt) return { status: "unknown", color: "default", icon: WarningIcon };

      const endDate = new Date(insurance.policyEndDt);

      if (isPolicyExpired(endDate)) {
        return { status: "expired", color: "error", icon: ExpiredIcon };
      }

      if (isPolicyExpiringSoon(endDate)) {
        return { status: "expiring", color: "warning", icon: WarningIcon };
      }

      return { status: "active", color: "success", icon: ActiveIcon };
    },
    [isPolicyExpired, isPolicyExpiringSoon]
  );

  const processedInsuranceOptions = useMemo(() => {
    return insuranceList.map((insurance) => {
      const policyStatus = getPolicyStatus(insurance);
      const policyPeriod =
        insurance.policyStartDt && insurance.policyEndDt ? formatPolicyPeriod(new Date(insurance.policyStartDt), new Date(insurance.policyEndDt)) : "Period not specified";

      return {
        ...insurance,
        policyStatus,
        policyPeriod,
        isSelectable: policyStatus.status !== "expired",
      };
    });
  }, [insuranceList, getPolicyStatus, formatPolicyPeriod]);

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading insurance information...
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid", borderColor: "grey.300" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsuranceIcon fontSize="small" />
            Select Insurance Coverage
          </Typography>
          <CustomButton variant="outlined" text="Manage Insurance" icon={AddIcon} size="small" onClick={handleManageInsurance} />
        </Box>

        {processedInsuranceOptions.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No active insurance records found. Please add insurance coverage first.
          </Alert>
        ) : (
          <Box>
            <RadioGroup value={selectedInsurance?.oPIPInsID?.toString() || "none"} onChange={(e) => handleInsuranceSelection(e.target.value)}>
              {/* Option for no insurance coverage */}
              <FormControlLabel
                value="none"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    No insurance coverage for this admission
                  </Typography>
                }
                sx={{ mb: 1 }}
              />

              {/* Insurance options */}
              {processedInsuranceOptions.map((insurance) => (
                <Card
                  key={insurance.oPIPInsID}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    cursor: insurance.isSelectable ? "pointer" : "not-allowed",
                    opacity: insurance.isSelectable ? 1 : 0.6,
                    border: selectedInsurance?.oPIPInsID === insurance.oPIPInsID ? "2px solid" : "1px solid",
                    borderColor:
                      selectedInsurance?.oPIPInsID === insurance.oPIPInsID
                        ? "primary.main"
                        : insurance.policyStatus.status === "expired"
                        ? "error.light"
                        : insurance.policyStatus.status === "expiring"
                        ? "warning.light"
                        : "grey.300",
                    backgroundColor:
                      selectedInsurance?.oPIPInsID === insurance.oPIPInsID
                        ? "primary.50"
                        : insurance.policyStatus.status === "expired"
                        ? "error.50"
                        : insurance.policyStatus.status === "expiring"
                        ? "warning.50"
                        : "white",
                    "&:hover": insurance.isSelectable
                      ? {
                          borderColor: "primary.light",
                          backgroundColor: "primary.25",
                        }
                      : {},
                  }}
                  onClick={() => insurance.isSelectable && handleInsuranceSelection(insurance.oPIPInsID.toString())}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <FormControlLabel
                      value={insurance.oPIPInsID.toString()}
                      control={<Radio size="small" disabled={!insurance.isSelectable} />}
                      label={
                        <Box display="flex" alignItems="center" gap={1.5} width="100%">
                          <Avatar sx={{ bgcolor: insurance.policyStatus.color + ".main", width: 32, height: 32 }}>
                            <InsuranceIcon fontSize="small" />
                          </Avatar>
                          <Box flex={1}>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {insurance.insurName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Policy: {insurance.policyNumber}
                                </Typography>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 3 }}>
                                <Typography variant="body2">
                                  <strong>Holder:</strong> {insurance.policyHolder}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Relation: {insurance.relation || insurance.relationVal}
                                </Typography>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 3 }}>
                                <Typography variant="body2">
                                  <strong>Period:</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {insurance.policyPeriod}
                                </Typography>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 2 }}>
                                <Chip
                                  size="small"
                                  icon={<insurance.policyStatus.icon fontSize="small" />}
                                  label={insurance.policyStatus.status === "active" ? "Active" : insurance.policyStatus.status === "expiring" ? "Expiring" : "Expired"}
                                  color={insurance.policyStatus.color as any}
                                  variant={insurance.policyStatus.status === "expired" ? "filled" : "outlined"}
                                />
                                {insurance.groupNumber && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    Group: {insurance.groupNumber}
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>

                            {/* Policy warnings */}
                            {insurance.policyStatus.status === "expired" && (
                              <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                                This policy has expired and cannot be used for admission
                              </Alert>
                            )}

                            {insurance.policyStatus.status === "expiring" && (
                              <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                                This policy is expiring soon. Please verify coverage before admission.
                              </Alert>
                            )}
                          </Box>
                        </Box>
                      }
                      sx={{ m: 0, width: "100%" }}
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>

            {selectedInsurance && (
              <Box mt={2}>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Selected Insurance: <strong>{selectedInsurance.insurName}</strong> - Policy: <strong>{selectedInsurance.policyNumber}</strong>
                </Typography>

                {/* Additional insurance details for selected */}
                <Box sx={{ mt: 1, p: 1, backgroundColor: "info.50", borderRadius: 1, border: "1px solid", borderColor: "info.200" }}>
                  <Grid container spacing={2}>
                    {selectedInsurance.guarantor && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">
                          <strong>Guarantor:</strong> {selectedInsurance.guarantor}
                        </Typography>
                      </Grid>
                    )}

                    {selectedInsurance.referenceNo && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">
                          <strong>Reference:</strong> {selectedInsurance.referenceNo}
                        </Typography>
                      </Grid>
                    )}

                    {selectedInsurance.coveredFor && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">
                          <strong>Coverage:</strong> {selectedInsurance.coveredFor}
                        </Typography>
                      </Grid>
                    )}

                    {selectedInsurance.phone1 && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption">
                          <strong>Contact:</strong> {selectedInsurance.phone1}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Insurance Management Dialog */}
      <PatientInsuranceManagement open={isInsuranceManagementOpen} onClose={handleInsuranceManagementClose} pChartID={pChartID} patientName={patientName} />
    </>
  );
};

export default InsuranceSelectionForAdmission;
