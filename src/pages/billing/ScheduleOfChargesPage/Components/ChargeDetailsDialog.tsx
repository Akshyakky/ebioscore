import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  Receipt as AliasIcon,
  Category as CategoryIcon,
  LocalHospital as ChargeIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Group as DoctorIcon,
  Edit as EditIcon,
  School as FacultyIcon,
  Business as HospitalIcon,
  Info as InfoIcon,
  AccountBalance as PaymentIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

interface ChargeDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  charge: ChargeWithAllDetailsDto | null;
  onEdit: (charge: ChargeWithAllDetailsDto) => void;
  onDelete: (chargeId: number) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`charge-tabpanel-${index}`} aria-labelledby={`charge-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ChargeDetailsDialog: React.FC<ChargeDetailsDialogProps> = ({ open, onClose, charge, onEdit, onDelete }) => {
  const [tabValue, setTabValue] = useState(0);

  const {
    serviceType = [],
    serviceGroup = [],
    pic = [],
    bedCategory = [],
    attendingPhy = [],
    subModules = [],
  } = useDropdownValues(["serviceType", "serviceGroup", "pic", "bedCategory", "attendingPhy", "subModules"]);

  // Debug dropdown data when component mounts or data changes
  useEffect(() => {
    if (open && charge) {
      console.log("=== CHARGE DETAILS DIALOG DROPDOWN DEBUG ===");
      console.log("PIC options:", pic.slice(0, 5));
      console.log("BedCategory options:", bedCategory.slice(0, 5));
      console.log("AttendingPhy options (DETAILED):", attendingPhy.slice(0, 10));
      console.log(
        "AttendingPhy sample structure:",
        attendingPhy.length > 0
          ? {
              sampleDoctor: attendingPhy[0],
              valueType: typeof attendingPhy[0]?.value,
              labelType: typeof attendingPhy[0]?.label,
              allKeys: attendingPhy[0] ? Object.keys(attendingPhy[0]) : [],
            }
          : "No attendingPhy data"
      );
      console.log("SubModules options:", subModules.slice(0, 5));
      console.log("ServiceGroup options:", serviceGroup.slice(0, 5));
      console.log("Charge data:", charge);

      // Debug doctor shares specifically
      const doctorShares = charge.DoctorShares || charge.doctorShares || [];
      console.log("Doctor shares data:", doctorShares);
      if (doctorShares.length > 0) {
        console.log("First doctor share conID:", doctorShares[0].conID, "type:", typeof doctorShares[0].conID);
      }

      console.log("=== END DROPDOWN DEBUG ===");
    }
  }, [open, charge, pic, bedCategory, attendingPhy, subModules, serviceGroup]);

  const chargeStatistics = useMemo(() => {
    if (!charge) return null;

    // Handle different field name variations
    const chargeDetails = charge.ChargeDetails || charge.chargeDetails || [];
    const doctorShares = charge.DoctorShares || charge.doctorShares || [];
    const chargeAliases = charge.ChargeAliases || charge.chargeAliases || [];
    const chargeFaculties = charge.ChargeFaculties || charge.chargeFaculties || [];
    const chargePacks = charge.ChargePacks || charge.chargePacks || [];

    const priceConfigurations = chargeDetails.length || 0;
    const doctorSharesCount = doctorShares.length || 0;
    const aliasesCount = chargeAliases.length || 0;
    const facultiesCount = chargeFaculties.length || 0;
    const packsCount = chargePacks.length || 0;

    // Calculate price range
    let minPrice = 0;
    let maxPrice = 0;
    if (chargeDetails.length > 0) {
      const prices = chargeDetails.map((detail: any) => (detail.DcValue || detail.dcValue || 0) + (detail.hcValue || 0)).filter((price: number) => price > 0);
      if (prices.length > 0) {
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
      }
    }

    // Calculate total doctor share percentage
    const totalDoctorShare = doctorShares.reduce((sum: number, share: any) => sum + (share.doctorShare || 0), 0) || 0;

    console.log("ChargeDetailsDialog - Charge Statistics:", {
      charge,
      chargeDetails,
      doctorShares,
      chargeAliases,
      chargeFaculties,
      chargePacks,
      priceConfigurations,
      doctorSharesCount,
      aliasesCount,
      facultiesCount,
      packsCount,
    });

    return {
      priceConfigurations,
      doctorSharesCount,
      aliasesCount,
      facultiesCount,
      packsCount,
      minPrice,
      maxPrice,
      totalDoctorShare,
      hasDoctorSharing: charge.doctorShareYN === "Y",
      isActive: charge.rActiveYN === "Y",
      hasBreakdown: charge.chargeBreakYN === "Y",
      isRegistrationService: charge.regServiceYN === "Y",
      isBedService: charge.isBedServiceYN === "Y",
    };
  }, [charge]);

  // Enhanced dropdown lookup function with multiple matching strategies
  const getDropdownLabel = (options: Array<{ value: string; label: string }>, value: number | string | null | undefined, fallbackPrefix: string = ""): string => {
    if (!value && value !== 0) return "Not specified";

    // Convert value to both string and number for comparison
    const valueStr = value.toString();
    const valueNum = Number(value);

    // Try multiple matching strategies
    let found = options.find((option) => option.value === valueStr);
    if (!found) {
      found = options.find((option) => Number(option.value) === valueNum);
    }
    if (!found) {
      found = options.find((option) => option.value == value); // Loose equality
    }

    console.log(`Looking for ${fallbackPrefix}:`, {
      searchValue: value,
      valueStr,
      valueNum,
      optionsCount: options.length,
      sampleOptions: options.slice(0, 3),
      found: found ? found.label : null,
    });

    if (found) {
      return found.label;
    } else {
      // Better fallback - show the ID with a descriptive prefix
      return fallbackPrefix ? `${fallbackPrefix} (ID: ${value})` : `ID: ${value}`;
    }
  };

  // Specific lookup functions with enhanced debugging
  const getPICName = (pTypeID: number): string => {
    const result = getDropdownLabel(pic, pTypeID, "Patient Type");
    console.log("PIC Name lookup:", { pTypeID, picCount: pic.length, result });
    return result;
  };

  const getWardCategoryName = (wCatID: number): string => {
    const result = getDropdownLabel(bedCategory, wCatID, "Ward Category");
    console.log("Ward Category lookup:", { wCatID, bedCategoryCount: bedCategory.length, result });
    return result;
  };

  const getDoctorName = (conID: number): string => {
    console.log("=== DOCTOR LOOKUP DEBUG ===");
    console.log("Looking for conID:", conID);
    console.log("AttendingPhy data structure:", attendingPhy.slice(0, 3));
    console.log("AttendingPhy total count:", attendingPhy.length);

    if (!conID && conID !== 0) return "Not specified";

    // Enhanced doctor lookup with multiple strategies
    let found = null;

    // Strategy 1: Direct value match
    found = attendingPhy.find((doctor) => doctor.value === conID.toString());
    if (found) {
      console.log("Found doctor by string value match:", found);
      return found.label;
    }

    // Strategy 2: Numeric value match
    found = attendingPhy.find((doctor) => Number(doctor.value) === Number(conID));
    if (found) {
      console.log("Found doctor by numeric value match:", found);
      return found.label;
    }

    // Strategy 3: Loose equality
    found = attendingPhy.find((doctor) => String(doctor.value) === String(conID));
    if (found) {
      console.log("Found doctor by loose equality:", found);
      return found.label;
    }

    // Strategy 4: Check if value contains the ID (some dropdowns have composite values)
    found = attendingPhy.find((doctor) => doctor.value.includes(conID.toString()));
    if (found) {
      console.log("Found doctor by value contains ID:", found);
      return found.label;
    }

    // Strategy 5: Check if value starts with the ID
    found = attendingPhy.find((doctor) => doctor.value.startsWith(conID.toString()));
    if (found) {
      console.log("Found doctor by value starts with ID:", found);
      return found.label;
    }

    // Strategy 6: Parse composite values (e.g., "123-Dr. Smith")
    found = attendingPhy.find((doctor) => {
      const parts = doctor.value.split("-");
      return parts.length > 0 && Number(parts[0]) === Number(conID);
    });
    if (found) {
      console.log("Found doctor by composite value parsing:", found);
      return found.label;
    }

    console.log("Doctor not found in any strategy");
    console.log(
      "Sample attendingPhy values:",
      attendingPhy.slice(0, 5).map((d) => ({ value: d.value, label: d.label }))
    );

    return `Doctor (ID: ${conID})`;
  };

  const getFacultyName = (aSubID: number): string => {
    const result = getDropdownLabel(subModules, aSubID, "Faculty");
    console.log("Faculty lookup:", { aSubID, subModulesCount: subModules.length, result });
    return result;
  };

  const getServiceGroupName = (serviceGroupID: number): string => {
    const result = getDropdownLabel(serviceGroup, serviceGroupID, "Service Group");
    console.log("Service Group lookup:", { serviceGroupID, serviceGroupCount: serviceGroup.length, result });
    return result;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Close" onClick={onClose} />
      {charge && (
        <>
          <CustomButton variant="outlined" text="Copy" icon={CopyIcon} onClick={() => onEdit(charge)} color="info" />
          <CustomButton variant="outlined" text="Edit" icon={EditIcon} onClick={() => onEdit(charge)} color="primary" />
          <CustomButton variant="outlined" text="Delete" icon={DeleteIcon} onClick={() => onDelete(charge.chargeID)} color="error" />
        </>
      )}
    </>
  );

  if (!charge) return null;

  return (
    <GenericDialog open={open} onClose={onClose} title={`Charge Details - ${charge.chargeCode}`} maxWidth="xl" fullWidth actions={dialogActions}>
      <Box sx={{ width: "100%" }}>
        {/* Header Card with Key Information */}
        <Card sx={{ mb: 3, borderLeft: "4px solid #1976d2" }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    <ChargeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {charge.chargeDesc}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {charge.chargeCode} | {charge.chargeType}
                    </Typography>
                    {charge.cShortName && (
                      <Typography variant="body2" color="text.secondary">
                        Short Name: {charge.cShortName}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip label={charge.rActiveYN === "Y" ? "Active" : "Inactive"} color={charge.rActiveYN === "Y" ? "success" : "default"} variant="filled" />
                  <Chip label={charge.chargeType} color="primary" variant="outlined" />
                  <Chip label={`Charge To: ${charge.chargeTo}`} color="secondary" variant="outlined" />
                  {charge.regServiceYN === "Y" && <Chip label="Registration Service" color="warning" variant="outlined" />}
                  {charge.isBedServiceYN === "Y" && <Chip label="Bed Service" color="info" variant="outlined" />}
                  {charge.doctorShareYN === "Y" && <Chip label="Doctor Share Enabled" color="success" variant="outlined" icon={<DoctorIcon />} />}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box textAlign="right">
                  {chargeStatistics && chargeStatistics.maxPrice > 0 && (
                    <Box mb={2}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {chargeStatistics.minPrice === chargeStatistics.maxPrice
                          ? formatCurrency(chargeStatistics.maxPrice, "INR", "en-IN")
                          : `${formatCurrency(chargeStatistics.minPrice, "INR", "en-IN")} - ${formatCurrency(chargeStatistics.maxPrice, "INR", "en-IN")}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price Range
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {chargeStatistics?.priceConfigurations || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Price Levels
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main" fontWeight="bold">
                        {chargeStatistics?.doctorSharesCount || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Doctor Shares
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="charge details tabs">
            <Tab icon={<InfoIcon />} iconPosition="start" label="Basic Information" />
            <Tab icon={<PaymentIcon />} iconPosition="start" label={`Pricing Details (${chargeStatistics?.priceConfigurations || 0})`} />
            <Tab icon={<DoctorIcon />} iconPosition="start" label={`Doctor Shares (${chargeStatistics?.doctorSharesCount || 0})`} />
            <Tab icon={<AliasIcon />} iconPosition="start" label={`Aliases (${chargeStatistics?.aliasesCount || 0})`} />
            <Tab icon={<FacultyIcon />} iconPosition="start" label={`Faculties (${chargeStatistics?.facultiesCount || 0})`} />
            <Tab icon={<CategoryIcon />} iconPosition="start" label={`Charge Packs (${chargeStatistics?.packsCount || 0})`} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Charge Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Charge Code
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge.chargeCode}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Charge Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge.chargeType}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge.chargeDesc}
                    </Typography>
                  </Grid>
                  {charge.chargesHDesc && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        Hindi Description
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {charge.chargesHDesc}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Charge To
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {charge.chargeTo}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Service Group
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getServiceGroupName(charge.serviceGroupID || 0)}
                    </Typography>
                  </Grid>
                  {charge.chargeCost && charge.chargeCost > 0 && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Base Cost
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCurrency(charge.chargeCost, "INR", "en-IN")}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                  <CategoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Configuration & Status
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip label={charge.rActiveYN === "Y" ? "Active" : "Inactive"} color={charge.rActiveYN === "Y" ? "success" : "default"} size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Charge Status
                    </Typography>
                    <Chip label={charge.chargeStatus} color="primary" size="small" variant="outlined" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor Share
                    </Typography>
                    <Chip
                      label={charge.doctorShareYN === "Y" ? "Enabled" : "Disabled"}
                      color={charge.doctorShareYN === "Y" ? "success" : "default"}
                      size="small"
                      icon={<DoctorIcon />}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Charge Break
                    </Typography>
                    <Chip label={charge.chargeBreakYN === "Y" ? "Yes" : "No"} color={charge.chargeBreakYN === "Y" ? "warning" : "default"} size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Registration Service
                    </Typography>
                    <Chip label={charge.regServiceYN === "Y" ? "Yes" : "No"} color={charge.regServiceYN === "Y" ? "info" : "default"} size="small" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bed Service
                    </Typography>
                    <Chip label={charge.isBedServiceYN === "Y" ? "Yes" : "No"} color={charge.isBedServiceYN === "Y" ? "secondary" : "default"} size="small" />
                  </Grid>
                  {charge.cNhsCode && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Resource Code
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {charge.cNhsCode}
                      </Typography>
                    </Grid>
                  )}
                  {charge.cNhsEnglishName && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Resource Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {charge.cNhsEnglishName}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <PaymentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Pricing Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const chargeDetails = charge.ChargeDetails || charge.chargeDetails || [];
              console.log("Rendering pricing details:", { chargeDetails, count: chargeDetails.length });

              return chargeDetails.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Patient Category</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ward Category</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Doctor Amount
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Hospital Amount
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargeDetails.map((detail: any, index: number) => {
                        // Debug the detail data
                        console.log(`Processing pricing detail ${index}:`, detail);

                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PersonIcon color="primary" fontSize="small" />
                                {(() => {
                                  const picName = getPICName(detail.pTypeID);
                                  console.log(`Detail ${index} PIC: ${detail.pTypeID} -> ${picName}`);
                                  return picName;
                                })()}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <HospitalIcon color="secondary" fontSize="small" />
                                {(() => {
                                  const wardName = getWardCategoryName(detail.wCatID);
                                  console.log(`Detail ${index} Ward: ${detail.wCatID} -> ${wardName}`);
                                  return wardName;
                                })()}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium" color="primary">
                                {formatCurrency(detail.DcValue || detail.dcValue || 0, "INR", "en-IN")}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium" color="warning.main">
                                {formatCurrency(detail.hcValue || 0, "INR", "en-IN")}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="success.main">
                                {formatCurrency(detail.chValue || 0, "INR", "en-IN")}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={detail.chargeStatus || "AC"} size="small" color={(detail.chargeStatus || "AC") === "AC" ? "success" : "default"} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={6}>
                  <PaymentIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No pricing configuration available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pricing details have not been configured for this charge.
                  </Typography>
                </Box>
              );
            })()}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <DoctorIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Doctor Revenue Sharing
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const doctorShares = charge.DoctorShares || charge.doctorShares || [];
              console.log("Rendering doctor shares:", { doctorShares, count: doctorShares.length });

              return doctorShares.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Doctor</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Doctor Share (%)
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Hospital Share (%)
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Total (%)
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctorShares.map((share: any, index: number) => {
                        console.log(`Processing doctor share ${index}:`, share);

                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                  <DoctorIcon fontSize="small" />
                                </Avatar>
                                {(() => {
                                  const doctorName = getDoctorName(share.conID);
                                  console.log(`Doctor share ${index} Doctor: ${share.conID} -> ${doctorName}`);
                                  return doctorName;
                                })()}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="primary">
                                {share.doctorShare || 0}%
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="warning.main">
                                {share.hospShare || 0}%
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold" color="success.main">
                                {((share.doctorShare || 0) + (share.hospShare || 0)).toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={share.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={share.rActiveYN === "Y" ? "success" : "default"} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={6}>
                  <DoctorIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No doctor revenue sharing configured
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doctor revenue sharing has not been set up for this charge.
                  </Typography>
                </Box>
              );
            })()}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <AliasIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Charge Aliases
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const chargeAliases = charge.ChargeAliases || charge.chargeAliases || [];
              console.log("Rendering charge aliases:", { chargeAliases, count: chargeAliases.length });

              return chargeAliases.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Patient Category</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Alias Description</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Language Description</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargeAliases.map((alias: any, index: number) => {
                        console.log(`Processing alias ${index}:`, alias);

                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PersonIcon color="primary" fontSize="small" />
                                {(() => {
                                  const picName = getPICName(alias.pTypeID);
                                  console.log(`Alias ${index} PIC: ${alias.pTypeID} -> ${picName}`);
                                  return picName;
                                })()}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {alias.chargeDesc}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{alias.chargeDescLang || "-"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={alias.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={alias.rActiveYN === "Y" ? "success" : "default"} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={6}>
                  <AliasIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No aliases configured
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No alternative names have been set up for this charge.
                  </Typography>
                </Box>
              );
            })()}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <FacultyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Associated Faculties
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const chargeFaculties = charge.ChargeFaculties || charge.chargeFaculties || [];
              console.log("Rendering charge faculties:", { chargeFaculties, count: chargeFaculties.length });

              return chargeFaculties.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Faculty</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargeFaculties.map((faculty: any, index: number) => {
                        console.log(`Processing faculty ${index}:`, faculty);

                        return (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <FacultyIcon color="primary" fontSize="small" />
                                {(() => {
                                  const facultyName = getFacultyName(faculty.aSubID);
                                  console.log(`Faculty ${index} aSubID: ${faculty.aSubID} -> ${facultyName}`);
                                  return facultyName;
                                })()}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={faculty.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={faculty.rActiveYN === "Y" ? "success" : "default"} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{faculty.rNotes || "-"}</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={6}>
                  <FacultyIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No faculties associated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No faculties have been associated with this charge.
                  </Typography>
                </Box>
              );
            })()}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
              <CategoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Charge Packs
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const chargePacks = charge.ChargePacks || charge.chargePacks || [];
              console.log("Rendering charge packs:", { chargePacks, count: chargePacks.length });

              return chargePacks.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pack Revision</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Doctor Amount
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Hospital Amount
                        </TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Effective Period</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargePacks.map((pack: any, index: number) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {pack.chargeRevise}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium" color="primary">
                              {formatCurrency(pack.dcValue || 0, "INR", "en-IN")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium" color="warning.main">
                              {formatCurrency(pack.hcValue || 0, "INR", "en-IN")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              {formatCurrency(pack.chValue || 0, "INR", "en-IN")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {pack.effectiveFromDate ? new Date(pack.effectiveFromDate).toLocaleDateString() : "-"} to{" "}
                              {pack.effectiveToDate ? new Date(pack.effectiveToDate).toLocaleDateString() : "Ongoing"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={pack.chargeStatus || "AC"} size="small" color={(pack.chargeStatus || "AC") === "AC" ? "success" : "default"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={6}>
                  <CategoryIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No charge packs configured
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No charge packs have been set up for this charge.
                  </Typography>
                </Box>
              );
            })()}
          </Paper>
        </TabPanel>
      </Box>
    </GenericDialog>
  );
};

export default ChargeDetailsDialog;
