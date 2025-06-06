// src/pages/billing/ScheduleOfChargesPage/MainPage/ScheduleOfChargesPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Stack, IconButton, TextField, MenuItem } from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  LocalHospital as ChargeIcon,
  AccountBalance as PaymentIcon,
  Group as DoctorIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { useAlert } from "@/providers/AlertProvider";
import { BChargeDto, ChargeWithAllDetailsDto } from "@/interfaces/Billing/ChargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatCurrency } from "@/utils/Common/formatUtils";
import useScheduleOfCharges from "../hooks/useScheduleOfCharges";
import ChargeFormDialog from "../Components/ChargeFormDialog";
import ChargeDetailsDialog from "../Components/ChargeDetailsDialog";

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
  const [selectedCharge, setSelectedCharge] = useState<EnhancedChargeDto | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { showAlert } = useAlert();
  const { charges, loading, refreshCharges, saveCharge, generateChargeCode, deleteCharge } = useScheduleOfCharges();
  const { serviceType = [], serviceGroup = [], pic = [] } = useDropdownValues(["serviceType", "serviceGroup", "pic"]);

  useEffect(() => {
    refreshCharges();
  }, [refreshCharges]);

  const enhancedCharges = useMemo(() => {
    return charges.map((charge) => {
      const prices = charge.ChargeDetails?.map((detail) => detail.chValue) || [];
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const priceRange =
        prices.length > 0 ? (lowestPrice === highestPrice ? formatCurrency(lowestPrice) : `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`) : "No pricing";
      const totalDoctorShares = charge.DoctorShares?.reduce((sum, share) => sum + share.doctorShare, 0) || 0;
      const aliasCount = charge.ChargeAliases?.length || 0;
      const packCount = charge.ChargePacks?.length || 0;
      const serviceGroupDisplay = serviceType.find((s) => Number(s.value) === charge.serviceGroupID)?.label || "Not specified";
      return {
        ...charge,
        lowestPrice,
        highestPrice,
        priceRange,
        totalDoctorShares,
        aliasCount,
        packCount,
        serviceGroupDisplay,
      };
    });
  }, [charges, serviceType]);

  const filteredCharges = useMemo(() => {
    let filtered = enhancedCharges;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((charge) => {
        return (
          charge.chargeCode.toLowerCase().includes(searchLower) ||
          charge.chargeDesc.toLowerCase().includes(searchLower) ||
          charge.chargesHDesc?.toLowerCase().includes(searchLower) ||
          charge.cShortName?.toLowerCase().includes(searchLower) ||
          charge.serviceGroupDisplay?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filterType !== "all") {
      filtered = filtered.filter((charge) => charge.chargeType === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((charge) => charge.chargeStatus === filterStatus);
    }

    return filtered;
  }, [enhancedCharges, searchTerm, filterType, filterStatus]);

  const statistics = useMemo(() => {
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

  const handleEditCharge = useCallback((charge: EnhancedChargeDto) => {
    setSelectedCharge(charge);
    setIsChargeFormOpen(true);
  }, []);

  const handleViewDetails = useCallback((charge: EnhancedChargeDto) => {
    setSelectedCharge(charge);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCopyCharge = useCallback(
    async (charge: EnhancedChargeDto) => {
      try {
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
          ChargeDetails: charge.ChargeDetails.map((detail) => ({ ...detail, chDetID: 0, chargeID: 0 })),
          DoctorShares: charge.DoctorShares.map((share) => ({ ...share, docShareID: 0, chargeID: 0 })),
          ChargeAliases: charge.ChargeAliases.map((alias) => ({ ...alias, chAliasID: 0, chargeID: 0 })),
          ChargeFaculties: charge.ChargeFaculties.map((faculty) => ({ ...faculty, chFacID: 0, chargeID: 0 })),
          ChargePacks: charge.ChargePacks.map((pack) => ({ ...pack, chPackID: 0, chargeID: 0 })),
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
        debugger;
        await saveCharge(chargeData);
        setIsChargeFormOpen(false);
        showAlert("Success", `Charge ${selectedCharge ? "updated" : "created"} successfully`, "success");
        setSelectedCharge(null);
        await refreshCharges();
      } catch (error) {
        showAlert("Error", `Failed to ${selectedCharge ? "update" : "create"} charge`, "error");
      }
    },
    [saveCharge, selectedCharge, showAlert, refreshCharges]
  );

  const handleDeleteCharge = useCallback(
    async (chargeId: number) => {
      try {
        await deleteCharge(chargeId);
        showAlert("Success", "Charge deleted successfully", "success");
        await refreshCharges();
      } catch (error) {
        showAlert("Error", "Failed to delete charge", "error");
      }
    },
    [deleteCharge, showAlert, refreshCharges]
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
            {charge.chargeCode}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            {charge.chargeDesc}
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
          <Chip label={charge.chargeType} size="small" color="primary" variant="outlined" />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {charge.serviceGroupDisplay}
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
            {charge.priceRange}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {charge.ChargeDetails?.length || 0} price levels
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
              <Chip icon={<DoctorIcon />} label={`${charge.totalDoctorShares}%`} size="small" color="success" variant="filled" />
              <Typography variant="caption" color="text.secondary" display="block">
                {charge.DoctorShares?.length || 0} doctors
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
          {charge.aliasCount > 0 && <Chip label={`${charge.aliasCount} Aliases`} size="small" color="info" variant="outlined" />}
          {charge.packCount > 0 && <Chip label={`${charge.packCount} Packs`} size="small" color="secondary" variant="outlined" />}
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
                <MenuItem key={type.value} value={type.value}>
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
