import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
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
  totalDoctorShares?: number;
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

  // Load dropdown values
  const { serviceType = [], serviceGroup = [], pic = [] } = useDropdownValues(["serviceType", "serviceGroup", "pic"]);

  useEffect(() => {
    refreshCharges();
  }, [refreshCharges]);

  // Enhanced debug logging
  useEffect(() => {
    console.log("=== SCHEDULE OF CHARGES DEBUG ===");
    console.log("Raw charges from hook:", charges);
    console.log("Charges length:", charges?.length || 0);
    console.log("Loading state:", loading);
    console.log("ServiceType dropdown:", serviceType);
    console.log("ServiceGroup dropdown:", serviceGroup);
    console.log("=== END DEBUG ===");
  }, [charges, loading, serviceType, serviceGroup]);

  const enhancedCharges = useMemo(() => {
    console.log("Processing charges in enhancedCharges memo...");

    if (!charges) {
      console.log("No charges data available");
      return [];
    }

    if (!Array.isArray(charges)) {
      console.log("Charges is not an array:", typeof charges, charges);
      return [];
    }

    if (charges.length === 0) {
      console.log("Charges array is empty");
      return [];
    }

    console.log("Processing", charges.length, "charges");

    return charges.map((charge, index) => {
      try {
        console.log(`Processing charge ${index + 1}:`, charge.chargeCode, charge);

        // Enhanced Price Range calculation with INR formatting
        let prices: number[] = [];

        // Try to get prices from ChargeDetails
        if (charge.ChargeDetails && Array.isArray(charge.ChargeDetails)) {
          console.log(`Charge ${charge.chargeCode} has ${charge.ChargeDetails.length} charge details`);

          charge.ChargeDetails.forEach((detail, detailIndex) => {
            if (detail && typeof detail === "object") {
              console.log(`  Detail ${detailIndex}:`, detail);

              // Try different possible field names
              const chValue = detail.chValue || detail.chargeValue || detail.totalAmount || 0;
              if (chValue && chValue > 0) {
                prices.push(Number(chValue));
                console.log(`  Found price from chValue: ${chValue}`);
              } else {
                // If no direct charge value, try to calculate from components
                const dcValue = Number(detail.DcValue) || 0;
                const hcValue = Number(detail.hcValue) || 0;
                const total = dcValue + hcValue;
                if (total > 0) {
                  prices.push(total);
                  console.log(`  Calculated price from components: ${dcValue} + ${hcValue} = ${total}`);
                }
              }
            }
          });
        }

        // Fallback to charge cost if no prices found
        if (prices.length === 0 && charge.chargeCost && charge.chargeCost > 0) {
          prices.push(Number(charge.chargeCost));
          console.log(`  Using fallback chargeCost: ${charge.chargeCost}`);
        }

        console.log(`  Final prices array for ${charge.chargeCode}:`, prices);

        const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Use INR formatting for currency
        const priceRange =
          prices.length > 0
            ? lowestPrice === highestPrice
              ? formatCurrency(lowestPrice, "INR", "en-IN")
              : `${formatCurrency(lowestPrice, "INR", "en-IN")} - ${formatCurrency(highestPrice, "INR", "en-IN")}`
            : "No pricing";

        console.log(`  Price range for ${charge.chargeCode}: ${priceRange}`);

        // Enhanced Doctor Share calculation
        let totalDoctorShares = 0;
        if (charge.DoctorShares && Array.isArray(charge.DoctorShares)) {
          totalDoctorShares = charge.DoctorShares.reduce((sum, share) => {
            if (share && typeof share === "object") {
              const doctorShare = Number(share.doctorShare) || 0;
              return sum + doctorShare;
            }
            return sum;
          }, 0);
          console.log(`  Total doctor shares for ${charge.chargeCode}: ${totalDoctorShares}%`);
        }

        const aliasCount = charge.ChargeAliases && Array.isArray(charge.ChargeAliases) ? charge.ChargeAliases.length : 0;
        const packCount = charge.ChargePacks && Array.isArray(charge.ChargePacks) ? charge.ChargePacks.length : 0;

        // Enhanced Service Group Display
        let serviceGroupDisplay = "Not specified";

        if (charge.serviceGroupID) {
          console.log(`  Looking up serviceGroupID ${charge.serviceGroupID} for ${charge.chargeCode}`);

          // First try serviceGroup dropdown
          const serviceGroupItem = serviceGroup.find((s) => {
            const matchesValue = Number(s.value) === Number(charge.serviceGroupID);
            const matchesLabel = s.label?.toLowerCase().includes(charge.chargeType?.toLowerCase() || "");
            return matchesValue || matchesLabel;
          });

          if (serviceGroupItem) {
            serviceGroupDisplay = serviceGroupItem.label;
            console.log(`    Found in serviceGroup: ${serviceGroupDisplay}`);
          } else {
            // Fallback to serviceType dropdown
            const serviceTypeItem = serviceType.find((s) => {
              const matchesValue = Number(s.value) === Number(charge.serviceGroupID);
              const matchesLabel = s.label?.toLowerCase().includes(charge.chargeType?.toLowerCase() || "");
              return matchesValue || matchesLabel;
            });

            if (serviceTypeItem) {
              serviceGroupDisplay = serviceTypeItem.label;
              console.log(`    Found in serviceType: ${serviceGroupDisplay}`);
            } else {
              // Try to match by chargeType
              const typeBasedItem = [...serviceGroup, ...serviceType].find((s) => s.label?.toLowerCase() === charge.chargeType?.toLowerCase());

              if (typeBasedItem) {
                serviceGroupDisplay = typeBasedItem.label;
                console.log(`    Found by chargeType match: ${serviceGroupDisplay}`);
              } else {
                console.log(`    No match found for serviceGroupID ${charge.serviceGroupID}`);
                serviceGroupDisplay = charge.chargeType || "Not specified";
              }
            }
          }
        } else {
          // If no serviceGroupID, try to use chargeType
          serviceGroupDisplay = charge.chargeType || "Not specified";
          console.log(`  No serviceGroupID, using chargeType: ${serviceGroupDisplay}`);
        }

        const enhancedCharge = {
          ...charge,
          lowestPrice,
          highestPrice,
          priceRange,
          totalDoctorShares,
          aliasCount,
          packCount,
          serviceGroupDisplay,
        };

        console.log(`  Enhanced charge ${charge.chargeCode}:`, {
          priceRange: enhancedCharge.priceRange,
          serviceGroupDisplay: enhancedCharge.serviceGroupDisplay,
          totalDoctorShares: enhancedCharge.totalDoctorShares,
        });

        return enhancedCharge;
      } catch (error) {
        console.error(`Error processing charge ${charge.chargeID}:`, error);
        // Return charge with default values if processing fails
        return {
          ...charge,
          lowestPrice: 0,
          highestPrice: 0,
          priceRange: "No pricing",
          totalDoctorShares: 0,
          aliasCount: 0,
          packCount: 0,
          serviceGroupDisplay: charge.chargeType || "Not specified",
        };
      }
    });
  }, [charges, serviceType, serviceGroup]);

  const filteredCharges = useMemo(() => {
    console.log("Filtering charges...");

    if (!enhancedCharges || enhancedCharges.length === 0) {
      console.log("No enhanced charges to filter");
      return [];
    }

    let filtered = [...enhancedCharges];
    console.log("Starting with", filtered.length, "charges");

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
          console.error("Error filtering charge:", charge.chargeID, error);
          return false;
        }
      });
      console.log("After search filter:", filtered.length, "charges");
    }

    if (filterType !== "all") {
      filtered = filtered.filter((charge) => charge.chargeType === filterType);
      console.log("After type filter:", filtered.length, "charges");
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
      console.log("After status filter:", filtered.length, "charges");
    }

    console.log("Final filtered charges:", filtered.length);
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
    const withDoctorShare = enhancedCharges.filter((c) => c.doctorShareYN === "Y").length;
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

  const handleViewDetails = useCallback((charge: EnhancedChargeDto) => {
    setSelectedCharge(charge);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCopyCharge = useCallback(
    async (charge: EnhancedChargeDto) => {
      try {
        if (typeof charge.serviceGroupID !== "number") {
          showAlert("Error", "Service Group ID is missing or invalid", "error");
          return;
        }
        const newCode = await generateChargeCode({
          ChargeType: charge.chargeType,
          ChargeTo: charge.chargeTo,
          ServiceGroupId: charge.serviceGroupID,
        });
        const copiedCharge: ChargeWithAllDetailsDto = {
          ...charge,
          chargeID: 0,
          chargeCode: newCode,
          chargeDesc: `${charge.chargeDesc} (Copy)`,
          ChargeDetails: charge.ChargeDetails?.map((detail) => ({ ...detail, chDetID: 0, chargeID: 0 })) || [],
          DoctorShares: charge.DoctorShares?.map((share) => ({ ...share, docShareID: 0, chargeID: 0 })) || [],
          ChargeAliases: charge.ChargeAliases?.map((alias) => ({ ...alias, chAliasID: 0, chargeID: 0 })) || [],
          ChargeFaculties: charge.ChargeFaculties?.map((faculty) => ({ ...faculty, chFacID: 0, chargeID: 0 })) || [],
          ChargePacks: charge.ChargePacks?.map((pack) => ({ ...pack, chPackID: 0, chargeID: 0 })) || [],
        };

        setSelectedCharge(copiedCharge);
        setIsChargeFormOpen(true);
      } catch (error) {
        showAlert("Error", "Failed to copy charge", "error");
      }
    },
    [generateChargeCode, showAlert]
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
      render: (charge) => (
        <Box>
          {charge.doctorShareYN === "Y" ? (
            <>
              <Chip icon={<DoctorIcon />} label={`${Math.round(charge.totalDoctorShares || 0)}%`} size="small" color="success" variant="filled" />
              <Typography variant="caption" color="text.secondary" display="block">
                {charge.DoctorShares && Array.isArray(charge.DoctorShares) ? charge.DoctorShares.length : 0} doctors
              </Typography>
            </>
          ) : (
            <Chip label="No Share" size="small" color="default" variant="outlined" />
          )}
        </Box>
      ),
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
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={refreshCharges} asynchronous />
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
