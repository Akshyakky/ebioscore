import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ChargeCodeGenerationDto, ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";
import {
  Add as AddIcon,
  Category as CategoryIcon,
  LocalHospital as ChargeIcon,
  ContentCopy as CopyIcon,
  Group as DoctorIcon,
  Edit as EditIcon,
  AccountBalance as PaymentIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChargeDetailsDialog from "../Components/ChargeDetailsDialog";
import ChargeFormDialog from "../Components/ChargeFormDialog";
import useScheduleOfCharges from "../hooks/useScheduleOfCharges";

interface EnhancedChargeDto extends ChargeWithAllDetailsDto {
  lowestPrice?: number;
  highestPrice?: number;
  priceRange?: string;
  doctorShareInfo?: {
    isEnabled: boolean;
    doctorCount: number;
    hasValidShares: boolean;
  };
  aliasCount?: number;
  packCount?: number;
  serviceGroupDisplay?: string;
}

const ScheduleOfChargesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCharge, setSelectedCharge] = useState<ChargeWithAllDetailsDto | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { showAlert } = useAlert();
  const { charges, loading, refreshCharges, saveCharge, generateChargeCode, deleteCharge, getChargeById } = useScheduleOfCharges();

  const { serviceType = [], serviceGroup = [], pic = [] } = useDropdownValues(["serviceType", "serviceGroup", "pic"]);

  useEffect(() => {
    refreshCharges();
  }, [refreshCharges]);

  const handleRefresh = useCallback(async () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    await refreshCharges();
  }, [refreshCharges]);

  const enhancedCharges = useMemo(() => {
    if (!charges) {
      return [];
    }

    if (!Array.isArray(charges)) {
      return [];
    }

    if (charges.length === 0) {
      return [];
    }

    return charges.map((charge, index) => {
      try {
        let prices: number[] = [];
        if (charge.ChargeDetails && Array.isArray(charge.ChargeDetails)) {
          charge.ChargeDetails.forEach((detail, detailIndex) => {
            if (detail && typeof detail === "object") {
              const chValue = detail.chValue || detail.chargeValue || detail.totalAmount || 0;
              if (chValue && chValue > 0) {
                prices.push(Number(chValue));
              } else {
                const dcValue = Number(detail.DcValue) || 0;
                const hcValue = Number(detail.hcValue) || 0;
                const total = dcValue + hcValue;
                if (total > 0) {
                  prices.push(total);
                }
              }
            }
          });
        }

        if (prices.length === 0 && charge.chargeCost && charge.chargeCost > 0) {
          prices.push(Number(charge.chargeCost));
        }

        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

        const priceRange =
          prices.length > 0
            ? lowestPrice === highestPrice
              ? formatCurrency(lowestPrice, "INR", "en-IN")
              : `${formatCurrency(lowestPrice, "INR", "en-IN")} - ${formatCurrency(highestPrice, "INR", "en-IN")}`
            : "No pricing";

        let totalDoctorShares = 0;
        let doctorShareInfo = { isEnabled: false, doctorCount: 0, hasValidShares: false };
        if (charge.DoctorShares && Array.isArray(charge.DoctorShares)) {
          totalDoctorShares = charge.DoctorShares.reduce((sum, share) => {
            if (share && typeof share === "object") {
              const doctorShare = Number(share.doctorShare) || 0;
              return sum + doctorShare;
            }
            return sum;
          }, 0);
          doctorShareInfo = {
            isEnabled: String(charge.doctorShareYN) === "Y" || String(charge.doctorShareYN) === "1",
            doctorCount: charge.DoctorShares.length,
            hasValidShares: charge.DoctorShares.length > 0 && totalDoctorShares > 0,
          };
        }

        const aliasCount = charge.ChargeAliases && Array.isArray(charge.ChargeAliases) ? charge.ChargeAliases.length : 0;
        const packCount = charge.ChargePacks && Array.isArray(charge.ChargePacks) ? charge.ChargePacks.length : 0;

        let serviceGroupDisplay = "Not specified";

        if (charge.sGrpID) {
          const serviceGroupItem = serviceGroup.find((s) => {
            const matchesValue = Number(s.value) === Number(charge.sGrpID);
            const matchesLabel = s.label?.toLowerCase().includes(charge.chargeType?.toLowerCase() || "");
            return matchesValue || matchesLabel;
          });

          if (serviceGroupItem) {
            serviceGroupDisplay = serviceGroupItem.label;
          } else {
            const serviceTypeItem = serviceType.find((s) => {
              const matchesValue = Number(s.value) === Number(charge.sGrpID);
              const matchesLabel = s.label?.toLowerCase().includes(charge.chargeType?.toLowerCase() || "");
              return matchesValue || matchesLabel;
            });

            if (serviceTypeItem) {
              serviceGroupDisplay = serviceTypeItem.label;
            } else {
              const typeBasedItem = [...serviceGroup, ...serviceType].find((s) => s.label?.toLowerCase() === charge.chargeType?.toLowerCase());

              if (typeBasedItem) {
                serviceGroupDisplay = typeBasedItem.label;
              } else {
                serviceGroupDisplay = charge.chargeType || "Not specified";
              }
            }
          }
        } else {
          serviceGroupDisplay = charge.chargeType || "Not specified";
        }

        const enhancedCharge = {
          ...charge,
          lowestPrice,
          highestPrice,
          priceRange,
          doctorShareInfo,
          aliasCount,
          packCount,
          serviceGroupDisplay,
        };

        return enhancedCharge;
      } catch (error) {
        return {
          ...charge,
          lowestPrice: 0,
          highestPrice: 0,
          priceRange: "No pricing",
          doctorShareInfo: { isEnabled: false, doctorCount: 0, hasValidShares: false },
          aliasCount: 0,
          packCount: 0,
          serviceGroupDisplay: charge.chargeType || "Not specified",
        };
      }
    });
  }, [charges, serviceType, serviceGroup]);

  const filteredCharges = useMemo(() => {
    if (!enhancedCharges || enhancedCharges.length === 0) {
      return [];
    }

    let filtered = [...enhancedCharges];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((charge) => {
        try {
          const matches =
            (charge.chargeCode && charge.chargeCode.toLowerCase().includes(searchLower)) ||
            (charge.chargeDesc && charge.chargeDesc.toLowerCase().includes(searchLower)) ||
            (charge.chargesHDesc && charge.chargesHDesc.toLowerCase().includes(searchLower)) ||
            (charge.cShortName && charge.cShortName.toLowerCase().includes(searchLower)) ||
            (charge.serviceGroupDisplay && charge.serviceGroupDisplay.toLowerCase().includes(searchLower));
          return matches;
        } catch (error) {
          return false;
        }
      });
    }

    if (filterType !== "all") {
      filtered = filtered.filter((charge) => charge.chargeType === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((charge) => {
        if (filterStatus === "AC") {
          return charge.chargeStatus === "AC" || charge.rActiveYN === "Y";
        } else if (filterStatus === "IN") {
          return charge.chargeStatus === "IN" || charge.rActiveYN === "N";
        }
        return true;
      });
    }

    return filtered;
  }, [enhancedCharges, searchTerm, filterType, filterStatus]);

  const statistics = useMemo(() => {
    if (!enhancedCharges || enhancedCharges.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withDoctorShare: 0,
        serviceCharges: 0,
        procedureCharges: 0,
      };
    }

    const total = enhancedCharges.length;
    const active = enhancedCharges.filter((c) => c.rActiveYN === "Y").length;
    const inactive = enhancedCharges.filter((c) => c.rActiveYN === "N").length;

    const withDoctorShare = enhancedCharges.filter((c) => {
      const shareInfo = c.doctorShareInfo || { isEnabled: false, doctorCount: 0, hasValidShares: false };

      const directDoctorCount = c.DoctorShares?.length || 0;
      const directlyEnabled = String(c.doctorShareYN) === "Y" || String(c.doctorShareYN) === "1";

      const hasSharing = shareInfo.isEnabled || shareInfo.doctorCount > 0 || shareInfo.hasValidShares || directlyEnabled || directDoctorCount > 0;

      return hasSharing;
    }).length;

    const serviceCharges = enhancedCharges.filter((c) => c.chargeType === "SVC").length;
    const procedureCharges = enhancedCharges.filter((c) => c.chargeType === "PROC").length;

    return {
      total,
      active,
      inactive,
      withDoctorShare,
      serviceCharges,
      procedureCharges,
    };
  }, [enhancedCharges]);

  const handleNewCharge = useCallback(() => {
    setSelectedCharge(null);
    setIsChargeFormOpen(true);
  }, []);

  const handleEditCharge = useCallback(
    async (charge: ChargeWithAllDetailsDto) => {
      try {
        const fullChargeDetails = await getChargeById(charge.chargeID);
        if (fullChargeDetails) {
          if (fullChargeDetails.chargeAliases && !fullChargeDetails.ChargeAliases) {
            fullChargeDetails.ChargeAliases = fullChargeDetails.chargeAliases;
          }
          if (fullChargeDetails.chargeDetails && !fullChargeDetails.ChargeDetails) {
            fullChargeDetails.ChargeDetails = fullChargeDetails.chargeDetails;
          }
          if (fullChargeDetails.doctorShares && !fullChargeDetails.DoctorShares) {
            fullChargeDetails.DoctorShares = fullChargeDetails.doctorShares;
          }
          if (fullChargeDetails.chargeFaculties && !fullChargeDetails.ChargeFaculties) {
            fullChargeDetails.ChargeFaculties = fullChargeDetails.chargeFaculties;
          }
          if (fullChargeDetails.chargePacks && !fullChargeDetails.ChargePacks) {
            fullChargeDetails.ChargePacks = fullChargeDetails.chargePacks;
          }

          if (fullChargeDetails.serviceGroupID !== undefined && fullChargeDetails.sGrpID === undefined) {
            fullChargeDetails.sGrpID = fullChargeDetails.serviceGroupID;
          }

          if (fullChargeDetails.scheduleDate && typeof fullChargeDetails.scheduleDate === "string") {
            try {
              fullChargeDetails.scheduleDate = new Date(fullChargeDetails.scheduleDate);
            } catch (error) {
              fullChargeDetails.scheduleDate = null;
            }
          }

          setSelectedCharge(fullChargeDetails);
          setIsChargeFormOpen(true);
        } else {
          showAlert("Error", "Could not fetch complete charge details. Please try again.", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while fetching charge details.", "error");
      }
    },
    [getChargeById, showAlert]
  );

  const handleViewDetails = useCallback(
    async (charge: EnhancedChargeDto) => {
      try {
        const fullChargeDetails = await getChargeById(charge.chargeID);
        if (fullChargeDetails) {
          if (fullChargeDetails.chargeAliases && !fullChargeDetails.ChargeAliases) {
            fullChargeDetails.ChargeAliases = fullChargeDetails.chargeAliases;
          }
          if (fullChargeDetails.chargeDetails && !fullChargeDetails.ChargeDetails) {
            fullChargeDetails.ChargeDetails = fullChargeDetails.chargeDetails;
          }
          if (fullChargeDetails.doctorShares && !fullChargeDetails.DoctorShares) {
            fullChargeDetails.DoctorShares = fullChargeDetails.doctorShares;
          }
          if (fullChargeDetails.chargeFaculties && !fullChargeDetails.ChargeFaculties) {
            fullChargeDetails.ChargeFaculties = fullChargeDetails.chargeFaculties;
          }
          if (fullChargeDetails.chargePacks && !fullChargeDetails.ChargePacks) {
            fullChargeDetails.ChargePacks = fullChargeDetails.chargePacks;
          }

          setSelectedCharge(fullChargeDetails);
          setIsDetailsDialogOpen(true);
        } else {
          showAlert("Error", "Could not fetch complete charge details. Please try again.", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while fetching charge details.", "error");
      }
    },
    [getChargeById, showAlert]
  );

  const handleCopyCharge = useCallback(
    async (charge: EnhancedChargeDto) => {
      try {
        const fullChargeDetails = await getChargeById(charge.chargeID);
        if (!fullChargeDetails) {
          showAlert("Error", "Could not fetch complete charge details. Please try again.", "error");
          return;
        }

        if (fullChargeDetails.chargeAliases && !fullChargeDetails.ChargeAliases) {
          fullChargeDetails.ChargeAliases = fullChargeDetails.chargeAliases;
        }
        if (fullChargeDetails.chargeDetails && !fullChargeDetails.ChargeDetails) {
          fullChargeDetails.ChargeDetails = fullChargeDetails.chargeDetails;
        }
        if (fullChargeDetails.doctorShares && !fullChargeDetails.DoctorShares) {
          fullChargeDetails.DoctorShares = fullChargeDetails.doctorShares;
        }
        if (fullChargeDetails.chargeFaculties && !fullChargeDetails.ChargeFaculties) {
          fullChargeDetails.ChargeFaculties = fullChargeDetails.chargeFaculties;
        }
        if (fullChargeDetails.chargePacks && !fullChargeDetails.ChargePacks) {
          fullChargeDetails.ChargePacks = fullChargeDetails.chargePacks;
        }

        const sGrpID = fullChargeDetails.sGrpID ?? fullChargeDetails.serviceGroupID ?? 0;

        if (!fullChargeDetails.chargeType || !fullChargeDetails.chargeTo) {
          showAlert("Error", "Charge type or charge to is missing from the charge details", "error");
          return;
        }

        const codeGenData: ChargeCodeGenerationDto = {
          ChargeType: fullChargeDetails.chargeType,
          ChargeTo: fullChargeDetails.chargeTo,
        };

        if (sGrpID && sGrpID > 0) {
          codeGenData.ServiceGroupId = sGrpID;
        }

        const newCode = await generateChargeCode(codeGenData);

        const copiedCharge: ChargeWithAllDetailsDto = {
          ...fullChargeDetails,
          chargeID: 0,
          chargeCode: newCode,
          chargeDesc: `${fullChargeDetails.chargeDesc} (Copy)`,
          sGrpID: sGrpID,

          ChargeDetails:
            fullChargeDetails.ChargeDetails?.map((detail) => ({
              ...detail,
              chDetID: 0,
              chargeID: 0,
              ChargePacks:
                detail.ChargePacks?.map((pack) => ({
                  ...pack,
                  chPackID: 0,
                  chargeID: 0,
                  chDetID: 0,
                })) || [],
            })) || [],

          DoctorShares:
            fullChargeDetails.DoctorShares?.map((share) => ({
              ...share,
              docShareID: 0,
              chargeID: 0,
            })) || [],

          ChargeAliases:
            fullChargeDetails.ChargeAliases?.map((alias) => ({
              ...alias,
              chAliasID: 0,
              chargeID: 0,
            })) || [],

          ChargeFaculties:
            fullChargeDetails.ChargeFaculties?.map((faculty) => ({
              ...faculty,
              chFacID: 0,
              chargeID: 0,
            })) || [],

          ChargePacks:
            fullChargeDetails.ChargePacks?.map((pack) => ({
              ...pack,
              chPackID: 0,
              chargeID: 0,
              chDetID: 0,
            })) || [],
        };

        setSelectedCharge(copiedCharge);
        setIsChargeFormOpen(true);
      } catch (error) {
        showAlert("Error", "Failed to copy charge", "error");
      }
    },
    [getChargeById, generateChargeCode, showAlert]
  );

  const handleChargeSubmit = useCallback(
    async (chargeData: ChargeWithAllDetailsDto) => {
      try {
        await saveCharge(chargeData);
        setIsChargeFormOpen(false);
        setSelectedCharge(null);
        await refreshCharges();
      } catch (error) {}
    },
    [saveCharge, refreshCharges]
  );

  const handleDeleteCharge = useCallback(
    async (chargeId: number) => {
      try {
        await deleteCharge(chargeId);
        await refreshCharges();
      } catch (error) {}
    },
    [deleteCharge, refreshCharges]
  );

  const columns: Column<EnhancedChargeDto>[] = [
    {
      key: "chargeInfo",
      header: "Charge Information",
      visible: true,
      sortable: true,
      width: 250,
      render: (charge) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {charge.chargeCode || "N/A"}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            {charge.chargeDesc || "N/A"}
          </Typography>
          {charge.cShortName && (
            <Typography variant="caption" color="text.secondary">
              {charge.cShortName}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "type",
      header: "Type & Category",
      visible: true,
      sortable: true,
      width: 150,
      render: (charge) => (
        <Box>
          <Chip label={charge.chargeType || "N/A"} size="small" color="primary" variant="outlined" />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {charge.serviceGroupDisplay || "Not specified"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "pricing",
      header: "Price Range",
      visible: true,
      sortable: true,
      width: 140,
      render: (charge) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {charge.priceRange || "No pricing"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {charge.ChargeDetails && Array.isArray(charge.ChargeDetails) ? charge.ChargeDetails.length : 0} price levels
          </Typography>
        </Box>
      ),
    },
    {
      key: "doctorShare",
      header: "Doctor Share",
      visible: true,
      sortable: true,
      width: 120,
      render: (charge) => {
        const shareInfo = charge.doctorShareInfo || { isEnabled: false, doctorCount: 0, hasValidShares: false };

        const directDoctorCount = charge.DoctorShares?.length || charge.doctorShares?.length || 0;
        const directlyEnabled = String(charge.doctorShareYN) === "Y" || String(charge.doctorShareYN) === "1";

        const isEnabled = shareInfo.isEnabled || directlyEnabled;
        const doctorCount = shareInfo.doctorCount || directDoctorCount;
        const hasValidShares = shareInfo.hasValidShares || directDoctorCount > 0;

        if (isEnabled || doctorCount > 0 || hasValidShares) {
          return (
            <Box>
              <Chip
                icon={<DoctorIcon />}
                label={doctorCount > 0 ? `${doctorCount} Doctors` : "Enabled"}
                size="small"
                color={hasValidShares ? "success" : "warning"}
                variant="filled"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                {hasValidShares ? "Configured" : "Setup Required"}
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box>
              <Chip label="No Share" size="small" color="default" variant="outlined" />
              <Typography variant="caption" color="text.secondary" display="block">
                Not enabled
              </Typography>
            </Box>
          );
        }
      },
    },
    {
      key: "configuration",
      header: "Configuration",
      visible: true,
      sortable: false,
      width: 120,
      render: (charge) => (
        <Stack spacing={0.5}>
          {(charge.aliasCount ?? 0) > 0 && <Chip label={`${charge.aliasCount} Aliases`} size="small" color="info" variant="outlined" />}
          {(charge.packCount ?? 0) > 0 && <Chip label={`${charge.packCount} Packs`} size="small" color="secondary" variant="outlined" />}
          {charge.regServiceYN === "Y" && <Chip label="Registration" size="small" color="warning" variant="outlined" />}
        </Stack>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (charge) => <Chip label={charge.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={charge.rActiveYN === "Y" ? "success" : "default"} variant="filled" />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 140,
      render: (charge) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              handleViewDetails(charge);
            }}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={(event) => {
              event.stopPropagation();
              handleEditCharge(charge);
            }}
            title="Edit Charge"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={(event) => {
              event.stopPropagation();
              handleCopyCharge(charge);
            }}
            title="Copy Charge"
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          Schedule of Charges
        </Typography>
        <Stack direction="row" spacing={2}>
          <CustomButton variant="contained" icon={AddIcon} text="New Charge" onClick={handleNewCharge} color="primary" />
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous />
        </Stack>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #1976d2" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <ChargeIcon sx={{ fontSize: 32, color: "#1976d2", mb: 1 }} />
              <Typography variant="h5" color="#1976d2" fontWeight="bold">
                {statistics.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Charges
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #4caf50" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <CategoryIcon sx={{ fontSize: 32, color: "#4caf50", mb: 1 }} />
              <Typography variant="h5" color="#4caf50" fontWeight="bold">
                {statistics.active}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #ff9800" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <PaymentIcon sx={{ fontSize: 32, color: "#ff9800", mb: 1 }} />
              <Typography variant="h5" color="#ff9800" fontWeight="bold">
                {statistics.withDoctorShare}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                With Doctor Share
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #9c27b0" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <DoctorIcon sx={{ fontSize: 32, color: "#9c27b0", mb: 1 }} />
              <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                {statistics.serviceCharges}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Services
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #f44336" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <CategoryIcon sx={{ fontSize: 32, color: "#f44336", mb: 1 }} />
              <Typography variant="h5" color="#f44336" fontWeight="bold">
                {statistics.procedureCharges}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Procedures
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Card sx={{ borderLeft: "4px solid #607d8b" }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <CategoryIcon sx={{ fontSize: 32, color: "#607d8b", mb: 1 }} />
              <Typography variant="h5" color="#607d8b" fontWeight="bold">
                {statistics.inactive}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inactive
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search charges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" select label="Charge Type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="all">All Types</MenuItem>
              {serviceType.map((type) => (
                <MenuItem key={type.value} value={type.label}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="AC">Active</MenuItem>
              <MenuItem value="IN">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredCharges.length} of {statistics.total} charges
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ChargeIcon />
            Charges List
          </Typography>
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredCharges}
          loading={loading}
          maxHeight="600px"
          emptyStateMessage="No charges found"
          rowKeyField="chargeID"
          density="medium"
          showDensityControls
          onRowClick={handleViewDetails}
        />
      </Paper>

      <ChargeFormDialog
        open={isChargeFormOpen}
        onClose={() => {
          setIsChargeFormOpen(false);
          setSelectedCharge(null);
        }}
        onSubmit={handleChargeSubmit}
        charge={selectedCharge}
      />

      <ChargeDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedCharge(null);
        }}
        charge={selectedCharge}
        onEdit={handleEditCharge}
        onDelete={handleDeleteCharge}
      />
    </Box>
  );
};

export default ScheduleOfChargesPage;
