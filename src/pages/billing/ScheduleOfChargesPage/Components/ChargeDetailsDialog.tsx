// src/pages/billing/ScheduleOfChargesPage/Components/ChargeDetailsDialog.tsx
import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Divider, Tab, Tabs, Alert, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import {
  LocalHospital as ChargeIcon,
  AttachMoney as PriceIcon,
  Group as DoctorIcon,
  Label as AliasIcon,
  School as FacultyIcon,
  Inventory as PackIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as PaymentIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatCurrency } from "@/utils/Common/formatUtils";
import { formatDt } from "@/utils/Common/newDateUtils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`charge-details-tabpanel-${index}`} aria-labelledby={`charge-details-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface ChargeDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  charge: ChargeWithAllDetailsDto | null;
  onEdit?: (charge: ChargeWithAllDetailsDto) => void;
  onDelete?: (chargeId: number) => void;
}

const ChargeDetailsDialog: React.FC<ChargeDetailsDialogProps> = ({ open, onClose, charge, onEdit, onDelete }) => {
  const [tabValue, setTabValue] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Load dropdown values for display purposes
  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
    subModules = [],
  } = useDropdownValues(["serviceType", "pic", "bedCategory", "attendingPhy", "subModules"]);

  // Helper functions to get display names from dropdown values
  const getChargeTypeDisplay = (value: string) => serviceType.find((t) => t.value === value)?.label || value;

  const getServiceGroupDisplay = (id: number) => serviceGroup.find((s) => Number(s.value) === id)?.label || "Not specified";

  const getPatientTypeDisplay = (id: number) => pic.find((p) => Number(p.value) === id)?.label || "Unknown";

  const getWardCategoryDisplay = (id: number) => bedCategory.find((w) => Number(w.value) === id)?.label || "Unknown";

  const getDoctorDisplay = (id: number) => attendingPhy.find((d) => Number(d.value.split("-")[0]) === id)?.label || "Unknown Doctor";

  const getSubModuleDisplay = (id: number) => subModules.find((s) => Number(s.value) === id)?.label || "Unknown Subject";

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!charge) return {};

    const prices = charge.ChargeDetails?.map((detail) => detail.chValue) || [];
    const totalDoctorShare = charge.DoctorShares?.reduce((sum, share) => sum + share.doctorShare, 0) || 0;
    const totalHospitalShare = charge.DoctorShares?.reduce((sum, share) => sum + share.hospShare, 0) || 0;

    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      avgPrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
      totalDoctorShare,
      totalHospitalShare,
      priceVariants: prices.length,
      aliasCount: charge.ChargeAliases?.length || 0,
      facultyCount: charge.ChargeFaculties?.length || 0,
      packCount: charge.ChargePacks?.length || 0,
    };
  }, [charge]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    if (charge && onEdit) {
      onEdit(charge);
    }
  };

  const handleDeleteConfirm = () => {
    if (charge && onDelete) {
      onDelete(charge.chargeID);
      setDeleteConfirmOpen(false);
      onClose();
    }
  };

  if (!charge) {
    return null;
  }

  const renderBasicInformation = () => (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Charge Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ChargeIcon />
            Charge Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Charge Code:</strong> {charge.chargeCode}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Description:</strong> {charge.chargeDesc}
            </Typography>
            {charge.cShortName && (
              <Typography variant="body2" gutterBottom>
                <strong>Short Name:</strong> {charge.cShortName}
              </Typography>
            )}
            {charge.chargesHDesc && (
              <Typography variant="body2" gutterBottom>
                <strong>Short Description:</strong> {charge.chargesHDesc}
              </Typography>
            )}
            {charge.chargeDescLang && (
              <Typography variant="body2" gutterBottom>
                <strong>Local Language:</strong> {charge.chargeDescLang}
              </Typography>
            )}
            <Typography variant="body2" gutterBottom>
              <strong>Type:</strong> {getChargeTypeDisplay(charge.chargeType)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Charge To:</strong> {charge.chargeTo}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Service Group:</strong> {getServiceGroupDisplay(charge.serviceGroupID || 0)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Status:</strong>
              <Chip
                label={charge.chargeStatus === "AC" ? "Active" : "Inactive"}
                size="small"
                color={charge.chargeStatus === "AC" ? "success" : "default"}
                variant="filled"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        </Grid>

        {/* Configuration & Features */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InfoIcon />
            Configuration & Features
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {charge.doctorShareYN === "Y" && <Chip icon={<DoctorIcon />} label="Doctor Share Enabled" size="small" color="success" variant="outlined" />}
              {charge.regServiceYN === "Y" && <Chip label="Registration Service" size="small" color="info" variant="outlined" />}
              {charge.regDefaultServiceYN === "Y" && <Chip label="Default Registration" size="small" color="info" variant="outlined" />}
              {charge.isBedServiceYN === "Y" && <Chip label="Bed Service" size="small" color="warning" variant="outlined" />}
              {charge.chargeBreakYN === "Y" && <Chip label="Charge Break" size="small" color="secondary" variant="outlined" />}
            </Box>

            {charge.cNhsCode && (
              <Typography variant="body2" gutterBottom>
                <strong>NHS Code:</strong> {charge.cNhsCode}
              </Typography>
            )}
            {charge.cNhsEnglishName && (
              <Typography variant="body2" gutterBottom>
                <strong>NHS English Name:</strong> {charge.cNhsEnglishName}
              </Typography>
            )}
            {charge.chargeCost && (
              <Typography variant="body2" gutterBottom>
                <strong>Base Cost:</strong> {formatCurrency(charge.chargeCost)}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Pricing Statistics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PriceIcon />
            Pricing Statistics
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Price Range:</strong> {formatCurrency(statistics.minPrice)} - {formatCurrency(statistics.maxPrice)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Average Price:</strong> {formatCurrency(statistics.avgPrice)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Price Variants:</strong> {statistics.priceVariants}
            </Typography>
          </Box>
        </Grid>

        {/* Related Configurations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Related Configurations
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Aliases:</strong> {statistics.aliasCount}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Faculties:</strong> {statistics.facultyCount}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Price Packs:</strong> {statistics.packCount}
            </Typography>
            {charge.doctorShareYN === "Y" && (
              <>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Doctor Share:</strong> {statistics.totalDoctorShare}%
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Total Hospital Share:</strong> {statistics.totalHospitalShare}%
                </Typography>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderPricingDetails = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PriceIcon />
        Pricing Details
      </Typography>

      {charge.ChargeDetails && charge.ChargeDetails.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Patient Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Ward Category</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Charge Value</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>DC Value</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>HC Value</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {charge.ChargeDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{getPatientTypeDisplay(detail.pTypeID)}</TableCell>
                  <TableCell>{getWardCategoryDisplay(detail.wCatID)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {formatCurrency(detail.chValue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{detail.DcValue ? formatCurrency(detail.DcValue) : "-"}</TableCell>
                  <TableCell align="right">{detail.hcValue ? formatCurrency(detail.hcValue) : "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={detail.chargeStatus === "AC" ? "Active" : "Inactive"}
                      size="small"
                      color={detail.chargeStatus === "AC" ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No pricing details configured for this charge.</Alert>
      )}
    </Paper>
  );

  const renderDoctorShares = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DoctorIcon />
        Doctor Revenue Sharing
      </Typography>

      {charge.doctorShareYN === "Y" ? (
        charge.DoctorShares && charge.DoctorShares.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Doctor</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Doctor Share (%)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Hospital Share (%)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total (%)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {charge.DoctorShares.map((share, index) => (
                  <TableRow key={index}>
                    <TableCell>{getDoctorDisplay(share.conID)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {share.doctorShare}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="primary.main" fontWeight="medium">
                        {share.hospShare}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {share.doctorShare + share.hospShare}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="warning">Doctor sharing is enabled but no shares are configured.</Alert>
        )
      ) : (
        <Alert severity="info">Doctor sharing is not enabled for this charge.</Alert>
      )}
    </Paper>
  );

  const renderAliases = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AliasIcon />
        Charge Aliases
      </Typography>

      {charge.ChargeAliases && charge.ChargeAliases.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Patient Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Alias Description</strong>
                </TableCell>
                <TableCell>
                  <strong>Language Description</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {charge.ChargeAliases.map((alias, index) => (
                <TableRow key={index}>
                  <TableCell>{getPatientTypeDisplay(alias.pTypeID)}</TableCell>
                  <TableCell>{alias.chargeDesc}</TableCell>
                  <TableCell>{alias.chargeDescLang}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No aliases configured for this charge.</Alert>
      )}
    </Paper>
  );

  const renderFaculties = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <FacultyIcon />
        Associated Faculties
      </Typography>

      {charge.ChargeFaculties && charge.ChargeFaculties.length > 0 ? (
        <Stack spacing={1}>
          {charge.ChargeFaculties.map((faculty, index) => (
            <Chip key={index} label={getSubModuleDisplay(faculty.aSubID)} variant="outlined" color="primary" />
          ))}
        </Stack>
      ) : (
        <Alert severity="info">No faculties associated with this charge.</Alert>
      )}
    </Paper>
  );

  const renderChargePacks = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PackIcon />
        Charge Packs
      </Typography>

      {charge.ChargePacks && charge.ChargePacks.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Revision</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Value</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>DC Value</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>HC Value</strong>
                </TableCell>
                <TableCell>
                  <strong>Effective From</strong>
                </TableCell>
                <TableCell>
                  <strong>Effective To</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {charge.ChargePacks.map((pack, index) => (
                <TableRow key={index}>
                  <TableCell>{pack.chargeRevise}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {formatCurrency(pack.chValue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{pack.dcValue ? formatCurrency(pack.dcValue) : "-"}</TableCell>
                  <TableCell align="right">{pack.hcValue ? formatCurrency(pack.hcValue) : "-"}</TableCell>
                  <TableCell>{pack.effectiveFromDate ? formatDt(pack.effectiveFromDate) : "-"}</TableCell>
                  <TableCell>{pack.effectiveToDate ? formatDt(pack.effectiveToDate) : "-"}</TableCell>
                  <TableCell>
                    <Chip label={pack.chargeStatus === "AC" ? "Active" : "Inactive"} size="small" color={pack.chargeStatus === "AC" ? "success" : "default"} variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No charge packs configured.</Alert>
      )}
    </Paper>
  );

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={`Charge Details - ${charge.chargeCode}`}
        maxWidth="xl"
        fullWidth
        showCloseButton
        actions={
          <Stack direction="row" spacing={2}>
            {onEdit && <CustomButton variant="outlined" text="Edit Charge" icon={EditIcon} onClick={handleEdit} color="primary" />}
            {onDelete && <CustomButton variant="outlined" text="Delete Charge" icon={DeleteIcon} onClick={() => setDeleteConfirmOpen(true)} color="error" />}
            <CustomButton variant="contained" text="Close" onClick={onClose} color="primary" />
          </Stack>
        }
      >
        <Box sx={{ width: "100%" }}>
          {/* Charge Header */}
          <Paper sx={{ p: 2, mb: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                <ChargeIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {charge.chargeDesc}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Code: {charge.chargeCode} | Type: {getChargeTypeDisplay(charge.chargeType)} | Service Group: {getServiceGroupDisplay(charge.serviceGroupID || 0)}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip label={charge.chargeStatus === "AC" ? "Active" : "Inactive"} size="small" color={charge.chargeStatus === "AC" ? "success" : "default"} variant="filled" />
                  {charge.doctorShareYN === "Y" && <Chip icon={<DoctorIcon />} label="Doctor Share" size="small" color="info" variant="outlined" />}
                  {charge.regServiceYN === "Y" && <Chip label="Registration" size="small" color="warning" variant="outlined" />}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="charge details tabs">
              <Tab label="Basic Information" icon={<InfoIcon />} iconPosition="start" />
              <Tab label="Pricing Details" icon={<PriceIcon />} iconPosition="start" />
              <Tab label="Doctor Shares" icon={<DoctorIcon />} iconPosition="start" />
              <Tab label="Aliases" icon={<AliasIcon />} iconPosition="start" />
              <Tab label="Faculties" icon={<FacultyIcon />} iconPosition="start" />
              <Tab label="Charge Packs" icon={<PackIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            {renderBasicInformation()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderPricingDetails()}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderDoctorShares()}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderAliases()}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {renderFaculties()}
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            {renderChargePacks()}
          </TabPanel>
        </Box>
      </GenericDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Charge"
        message={`Are you sure you want to delete the charge "${charge.chargeCode} - ${charge.chargeDesc}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </>
  );
};

export default ChargeDetailsDialog;
