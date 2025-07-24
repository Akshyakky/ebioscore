import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatCurrency, IssualType, ProductIssualCompositeDto, ProductIssualDto } from "@/interfaces/InventoryManagement/ProductIssualDto";
import { useAlert } from "@/providers/AlertProvider";
import { productIssualMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  ViewModule as CardIcon,
  Clear as ClearIcon,
  ContentCopy as ContentCopyIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Group as DeptIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  GetApp as ExportIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  ViewList as ListIcon,
  LocalHospital as MedicalIcon,
  PendingActions as PendingIcon,
  PersonOutline as PhysicianIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  CheckBox as SelectAllIcon,
  Sort as SortIcon,
  BarChart as StatisticsIcon,
  Sync,
  TaskAlt as TaskAltIcon,
  CheckBoxOutlineBlank as UnselectAllIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { useProductIssual } from "../../ProductIssual/hooks/useProductIssual";
import PhysicianIssualForm from "../Form/PhysicianIssualForm";

const PhysicianIssualPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIssual, setSelectedIssual] = useState<ProductIssualDto | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [isCopyMode, setIsCopyMode] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "detailed">("grid");
  const [reportsMenuAnchor, setReportsMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginatedIssuals, setPaginatedIssuals] = useState<ProductIssualDto[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [, setFromDepartmentID] = useState<number | undefined>(undefined);
  const [physicianID, setPhysicianID] = useState<number | undefined>(undefined);
  const [approvedStatus, setApprovedStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<string>("thisMonth");
  const [sortBy, setSortBy] = useState<string>("pisDate");
  const [sortOrder, setSortOrder] = useState<boolean>(false);
  const [pisCode, setPisCode] = useState<string>("");
  const [indentNo, setIndentNo] = useState<string>("");

  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    overdue: 0,
    totalValue: 0,
  });
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const { attendingPhy } = useDropdownValues(["department", "attendingPhy"]);
  const { clearError: hookClearError, getIssualWithDetailsById, deleteIssual, approveIssual, canEditIssual, canApproveIssual, canDeleteIssual } = useProductIssual();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatIssueDate = (date: Date): string => {
    return date ? dayjs(date).format("DD/MM/YYYY") : "";
  };
  const calculateDaysOld = (date: Date): number => {
    return date ? dayjs().diff(dayjs(date), "days") : 0;
  };
  const clearError = useCallback(() => {
    setError(null);
    hookClearError();
  }, [hookClearError]);

  const fetchIssualsForDepartment = useCallback(async () => {
    if (!deptId) return;
    try {
      setIsLoading(true);
      clearError();
      const response = await productIssualMastService.getAll();
      if (response.success && response.data && Array.isArray(response.data)) {
        let physicianIssuals = response.data.filter((issual: ProductIssualDto) => {
          return issual.fromDeptID === deptId && issual.issualType === IssualType.Physician;
        });
        physicianIssuals = applyClientSideFilters(physicianIssuals);
        physicianIssuals = applySorting(physicianIssuals);
        setPaginatedIssuals(physicianIssuals);
      } else {
        throw new Error(response.errorMessage || "Failed to fetch Physician Issuals - invalid response");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Physician Issual data";
      setError(errorMessage);
      showAlert("Error", "Failed to fetch Physician Issual data for the selected department", "error");
      setPaginatedIssuals([]);
    } finally {
      setIsLoading(false);
    }
  }, [deptId, physicianID, approvedStatus, pisCode, indentNo, startDate, endDate, sortBy, sortOrder, showAlert, clearError]);

  const applyClientSideFilters = useCallback(
    (issuals: ProductIssualDto[]) => {
      let filtered = [...issuals];
      if (physicianID) {
        filtered = filtered.filter((issual) => issual.recConID === physicianID);
      }
      if (approvedStatus && approvedStatus !== "all") {
        filtered = filtered.filter((issual) => issual.approvedYN === approvedStatus);
      }
      if (pisCode) {
        filtered = filtered.filter((issual) => issual.pisCode?.toLowerCase().includes(pisCode.toLowerCase()));
      }
      if (indentNo) {
        filtered = filtered.filter((issual) => issual.indentNo?.toLowerCase().includes(indentNo.toLowerCase()));
      }
      if (startDate && endDate) {
        const start = dayjs(startDate).startOf("day");
        const end = dayjs(endDate).endOf("day");
        filtered = filtered.filter((issual) => {
          const issualDate = dayjs(issual.pisDate);
          return issualDate.isAfter(start.subtract(1, "day")) && issualDate.isBefore(end.add(1, "day"));
        });
      } else if (dateRange !== "custom") {
        const now = dayjs();
        let filterStartDate: dayjs.Dayjs;
        switch (dateRange) {
          case "today":
            filterStartDate = now.startOf("day");
            break;
          case "thisWeek":
            filterStartDate = now.subtract(7, "days");
            break;
          case "thisMonth":
            filterStartDate = now.subtract(1, "month");
            break;
          case "last3Months":
            filterStartDate = now.subtract(3, "months");
            break;
          default:
            filterStartDate = now.subtract(1, "month");
        }
        filtered = filtered.filter((issual) => {
          const issualDate = dayjs(issual.pisDate);
          return issualDate.isAfter(filterStartDate);
        });
      }
      return filtered;
    },
    [physicianID, approvedStatus, pisCode, indentNo, startDate, endDate, dateRange]
  );

  const applySorting = useCallback(
    (issuals: ProductIssualDto[]) => {
      return issuals.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case "pisDate":
            aValue = new Date(a.pisDate || 0);
            bValue = new Date(b.pisDate || 0);
            break;
          case "pisCode":
            aValue = a.pisCode || "";
            bValue = b.pisCode || "";
            break;
          case "indentNo":
            aValue = a.indentNo || "";
            bValue = b.indentNo || "";
            break;
          case "fromDeptName":
            aValue = a.fromDeptName || "";
            bValue = b.fromDeptName || "";
            break;
          case "recConName":
            aValue = a.recConName || "";
            bValue = b.recConName || "";
            break;
          case "approvedYN":
            aValue = a.approvedYN || "";
            bValue = b.approvedYN || "";
            break;
          default:
            aValue = a.pisid;
            bValue = b.pisid;
        }
        if (typeof aValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortOrder ? comparison : -comparison;
        } else {
          const comparison = aValue - bValue;
          return sortOrder ? comparison : -comparison;
        }
      });
    },
    [sortBy, sortOrder]
  );

  const getIssualWithDetailsByIdLocal = useCallback(
    async (issualId: number): Promise<ProductIssualCompositeDto | null> => {
      try {
        const compositeDto = await getIssualWithDetailsById(issualId);
        return compositeDto;
      } catch (error) {
        return null;
      }
    },
    [getIssualWithDetailsById]
  );

  const handleDepartmentSelectWithIssualFetch = useCallback(
    async (selectedDeptId: number, selectedDeptName: string) => {
      try {
        await handleDepartmentSelect(selectedDeptId, selectedDeptName);
        setFromDepartmentID(undefined);
        setPhysicianID(undefined);
        setApprovedStatus(undefined);
        setPisCode("");
        setIndentNo("");
        clearError();
        showAlert("Success", `Selected department: ${selectedDeptName}`, "success");
      } catch (error) {
        showAlert("Error", "Failed to load data for the selected department", "error");
      }
    },
    [handleDepartmentSelect, showAlert, clearError]
  );

  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchIssualsForDepartment();
    }
  }, [isDepartmentSelected, deptId, fetchIssualsForDepartment]);

  const filteredAndSearchedIssuals = useMemo(() => {
    let filtered = [...paginatedIssuals];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((issual) => {
        const searchableText = `${issual.pisCode || ""} ${issual.indentNo || ""} ${issual.fromDeptName || ""} ${issual.recConName || ""}`.toLowerCase();
        return searchableText.includes(searchLower);
      });
    }
    return filtered;
  }, [paginatedIssuals, searchTerm]);

  useEffect(() => {
    const issuals = paginatedIssuals || [];
    const total = issuals.length;
    const approved = issuals.filter((issual) => issual.approvedYN === "Y").length;
    const pending = total - approved;
    const daysOldCheck = (date: Date): number => (date ? dayjs().diff(dayjs(date), "days") : 0);
    const overdue = issuals.filter((issual) => daysOldCheck(issual.pisDate) > 7 && issual.approvedYN !== "Y").length;
    const totalValue = issuals.reduce((sum, issual) => {
      if (issual.details && Array.isArray(issual.details)) {
        const issualValue = issual.details.reduce((detailSum, detail) => {
          const itemValue = (detail.unitPrice || 0) * (detail.issuedQty || 0);
          const taxValue = itemValue * ((detail.tax || 0) / 100);
          return detailSum + itemValue + taxValue;
        }, 0);
        return sum + issualValue;
      }
      return sum;
    }, 0);

    setStatistics({ total, approved, pending, overdue, totalValue });
  }, [paginatedIssuals]);

  const handleRefresh = useCallback(async () => {
    if (!deptId) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    setSearchTerm("");
    setSelectedRows([]);
    await fetchIssualsForDepartment();
    showAlert("Success", "Data refreshed successfully", "success");
  }, [deptId, fetchIssualsForDepartment, showAlert]);

  const handleAddNew = useCallback(() => {
    setSelectedIssual(null);
    setIsViewMode(false);
    setIsCopyMode(false);
    setIsFormOpen(true);
  }, []);

  const handleCopy = useCallback(
    async (issual: ProductIssualDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getIssualWithDetailsByIdLocal(issual.pisid);
        if (!compositeDto || !compositeDto.productIssual) {
          throw new Error("Failed to load Physician Issual details for copying");
        }
        const issualToCopy: ProductIssualDto = {
          ...compositeDto.productIssual,
          details: compositeDto.details || [],
        };
        setSelectedIssual(issualToCopy);
        setIsCopyMode(true);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Copying Physician Issual "${issual.pisCode}" with ${issualToCopy.details?.length || 0} products. Please review and save.`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Physician Issual details for copying", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getIssualWithDetailsByIdLocal, showAlert]
  );

  const handleEdit = useCallback(
    async (issual: ProductIssualDto) => {
      if (!canEditIssual(issual)) {
        showAlert("Warning", "Approved Physician Issuals cannot be edited.", "warning");
        return;
      }
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getIssualWithDetailsByIdLocal(issual.pisid);
        if (!compositeDto || !compositeDto.productIssual) {
          throw new Error("Failed to load Physician Issual details for editing");
        }
        const issualToEdit: ProductIssualDto = {
          ...compositeDto.productIssual,
          details: compositeDto.details || [],
        };
        setSelectedIssual(issualToEdit);
        setIsCopyMode(false);
        setIsViewMode(false);
        setIsFormOpen(true);
        showAlert("Info", `Loading Physician Issual "${issual.pisCode}" with ${issualToEdit.details?.length || 0} products for editing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Physician Issual details for editing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [canEditIssual, getIssualWithDetailsByIdLocal, showAlert]
  );

  const handleView = useCallback(
    async (issual: ProductIssualDto) => {
      try {
        setIsLoadingDetails(true);
        const compositeDto = await getIssualWithDetailsByIdLocal(issual.pisid);
        if (!compositeDto || !compositeDto.productIssual) {
          throw new Error("Failed to load Physician Issual details for viewing");
        }
        const issualToView: ProductIssualDto = {
          ...compositeDto.productIssual,
          details: compositeDto.details || [],
        };
        setSelectedIssual(issualToView);
        setIsCopyMode(false);
        setIsViewMode(true);
        setIsFormOpen(true);
        showAlert("Info", `Loading Physician Issual "${issual.pisCode}" with ${issualToView.details?.length || 0} products for viewing...`, "info");
      } catch (error) {
        showAlert("Error", "Failed to load Physician Issual details for viewing", "error");
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [getIssualWithDetailsByIdLocal, showAlert]
  );

  const handleDeleteClick = useCallback(
    (issual: ProductIssualDto) => {
      if (!canDeleteIssual(issual)) {
        showAlert("Warning", "Approved Physician Issuals cannot be deleted.", "warning");
        return;
      }
      setSelectedIssual(issual);
      setIsDeleteConfirmOpen(true);
    },
    [canDeleteIssual, showAlert]
  );

  const handleApproveClick = useCallback(
    (issual: ProductIssualDto) => {
      if (!canApproveIssual(issual)) {
        showAlert("Warning", "This Physician Issual is already approved.", "warning");
        return;
      }
      setSelectedIssual(issual);
      setIsApproveConfirmOpen(true);
    },
    [canApproveIssual, showAlert]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedIssual) return;
    try {
      const success = await deleteIssual(selectedIssual.pisid);
      if (success) {
        await fetchIssualsForDepartment();
      }
    } catch (error) {
      showAlert("Error", "Failed to delete Physician Issual", "error");
    }
    setIsDeleteConfirmOpen(false);
    setSelectedIssual(null);
  }, [selectedIssual, deleteIssual, fetchIssualsForDepartment, showAlert]);

  const handleConfirmApprove = useCallback(async () => {
    if (!selectedIssual) return;
    try {
      const success = await approveIssual(selectedIssual.pisid);
      if (success) {
        await fetchIssualsForDepartment();
      }
    } catch (error) {
      showAlert("Error", "Failed to approve Physician Issual", "error");
    }

    setIsApproveConfirmOpen(false);
    setSelectedIssual(null);
  }, [selectedIssual, approveIssual, fetchIssualsForDepartment, showAlert]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      setSelectedIssual(null);
      setIsCopyMode(false);
      setIsViewMode(false);
      if (refreshData && deptId) {
        fetchIssualsForDepartment();
      }
    },
    [deptId, fetchIssualsForDepartment]
  );

  const handleSortChange = useCallback(
    (sortByValue: string) => {
      setSortOrder((prev) => (sortBy === sortByValue ? !prev : false));
      setSortBy(sortByValue);
      setSortMenuAnchor(null);
    },
    [sortBy]
  );

  const handleExportIssuals = useCallback(
    (format: "excel" | "pdf" | "csv") => {
      const exportData = filteredAndSearchedIssuals.map((issual) => ({
        "Issue Code": issual.pisCode,
        "Issue Date": formatIssueDate(issual.pisDate),
        "Indent No": issual.indentNo,
        "From Department": issual.fromDeptName,
        Physician: issual.recConName,
        "Total Items": issual.totalItems,
        "Total Requested Qty": issual.totalRequestedQty,
        "Total Issued Qty": issual.totalIssuedQty,
        "Total Value": formatCurrency(
          (issual.details || []).reduce((sum, detail) => {
            const itemValue = (detail.unitPrice || 0) * (detail.issuedQty || 0);
            const taxValue = itemValue * ((detail.tax || 0) / 100);
            return sum + itemValue + taxValue;
          }, 0)
        ),
        Status: issual.approvedYN === "Y" ? "Approved" : "Pending",
        "Approved By": issual.approvedBy,
      }));
      if (format === "csv") {
        const csvContent = [Object.keys(exportData[0]).join(","), ...exportData.map((row) => Object.values(row).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `physician-issual-report-${deptName}-${dayjs().format("YYYY-MM-DD")}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      showAlert("Success", `${format.toUpperCase()} export initiated for ${filteredAndSearchedIssuals.length} records from ${deptName}`, "success");
      setReportsMenuAnchor(null);
    },
    [filteredAndSearchedIssuals, deptName, showAlert]
  );

  const calculateIssualTotalValue = (issual: ProductIssualDto): number => {
    return (issual.details || []).reduce((sum, detail) => {
      const itemValue = (detail.unitPrice || 0) * (detail.issuedQty || 0);
      const taxValue = itemValue * ((detail.tax || 0) / 100);
      return sum + itemValue + taxValue;
    }, 0);
  };

  const renderContent = () => {
    if (viewMode === "cards") {
      return (
        <Grid container spacing={2}>
          {filteredAndSearchedIssuals.map((issual) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={issual.pisid}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": { elevation: 4 },
                  borderLeft: `4px solid ${issual.approvedYN === "Y" ? "#4caf50" : "#ff9800"}`,
                }}
                onClick={() => handleView(issual)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" color="primary">
                      {issual.pisCode || "Pending"}
                    </Typography>
                    <Chip size="small" label={issual.approvedYN === "Y" ? "Approved" : "Pending"} color={issual.approvedYN === "Y" ? "success" : "warning"} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Indent: {issual.indentNo || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    From: {issual.fromDeptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Physician: {issual.recConName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Date: {formatIssueDate(issual.pisDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Items: {issual.totalItems} | Issued: {issual.totalIssuedQty}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    Value: {formatCurrency(calculateIssualTotalValue(issual))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (viewMode === "detailed") {
      return (
        <List>
          {filteredAndSearchedIssuals.map((issual) => {
            const daysOld = calculateDaysOld(issual.pisDate);
            const isOverdue = daysOld > 7 && issual.approvedYN !== "Y";

            return (
              <ListItem
                key={issual.pisid}
                sx={{
                  mb: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{issual.pisCode || "Pending"}</Typography>
                      <Chip size="small" label={issual.approvedYN === "Y" ? "Approved" : "Pending"} color={issual.approvedYN === "Y" ? "success" : "warning"} />
                      {isOverdue && <Chip size="small" label="Overdue" color="error" />}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Indent No
                          </Typography>
                          <Typography variant="body2">{issual.indentNo || "N/A"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            From Department
                          </Typography>
                          <Typography variant="body2">{issual.fromDeptName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Physician
                          </Typography>
                          <Typography variant="body2">{issual.recConName}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Date
                          </Typography>
                          <Typography variant="body2">{formatIssueDate(issual.pisDate)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Items
                          </Typography>
                          <Typography variant="body2">{issual.totalItems}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                          <Typography variant="caption" display="block">
                            Total Value
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(calculateIssualTotalValue(issual))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleView(issual)} disabled={isLoadingDetails}>
                      {isLoadingDetails ? <CircularProgress size={16} /> : <VisibilityIcon />}
                    </IconButton>
                    {canEditIssual(issual) && (
                      <IconButton size="small" onClick={() => handleEdit(issual)} disabled={isLoadingDetails}>
                        {isLoadingDetails ? <CircularProgress size={16} /> : <EditIcon />}
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleCopy(issual)} disabled={isLoadingDetails}>
                      {isLoadingDetails ? <CircularProgress size={16} /> : <ContentCopyIcon />}
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      );
    }

    return (
      <CustomGrid
        columns={columns}
        data={filteredAndSearchedIssuals}
        loading={isLoading}
        maxHeight="600px"
        emptyStateMessage={`No Physician Issuals found for ${deptName}. Click "New Issual" to create the first one.`}
        rowKeyField="pisid"
        onRowClick={(issual) => handleView(issual)}
      />
    );
  };

  const columns: Column<ProductIssualDto>[] = [
    {
      key: "select",
      header: "",
      visible: true,
      sortable: false,
      width: 50,
      render: (issual: ProductIssualDto) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(issual.pisid)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRows((prev) => (e.target.checked ? [...prev, issual.pisid] : prev.filter((id) => id !== issual.pisid)));
          }}
        />
      ),
    },
    {
      key: "issualInfo",
      header: "Physician Issual Information",
      visible: true,
      sortable: true,
      width: 240,
      render: (issual: ProductIssualDto) => (
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <MedicalIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {issual.pisCode || "Pending"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
            <strong>Indent:</strong> {issual.indentNo || "N/A"} • <strong>Date:</strong> {formatIssueDate(issual.pisDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Days: {calculateDaysOld(issual.pisDate)} • Items: {issual.totalItems}
          </Typography>
        </Box>
      ),
    },
    {
      key: "fromDepartment",
      header: "From Department",
      visible: true,
      sortable: true,
      width: 200,
      render: (issual: ProductIssualDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <DeptIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {issual.fromDeptName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {issual.fromDeptID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "physician",
      header: "Physician",
      visible: true,
      sortable: true,
      width: 200,
      render: (issual: ProductIssualDto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PhysicianIcon sx={{ fontSize: 20, color: "secondary.main" }} />
          <Box>
            <Typography variant="body2" fontWeight="500">
              {issual.recConName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {issual.recConID}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 160,
      render: (issual: ProductIssualDto) => {
        const daysOld = calculateDaysOld(issual.pisDate);
        const isOverdue = daysOld > 7 && issual.approvedYN !== "Y";

        return (
          <Stack spacing={1}>
            {issual.approvedYN === "Y" ? (
              <Chip label="Approved" size="small" variant="filled" color="success" icon={<ApproveIcon />} sx={{ fontWeight: 500 }} />
            ) : (
              <Chip
                label="Pending"
                size="small"
                variant="filled"
                icon={<PendingIcon />}
                sx={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  fontWeight: 500,
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            )}
            {isOverdue && <Chip label="Overdue" size="small" color="error" variant="outlined" sx={{ fontWeight: 500 }} />}
          </Stack>
        );
      },
    },
    {
      key: "approvedBy",
      header: "Approved By",
      visible: true,
      sortable: true,
      width: 150,
      render: (issual: ProductIssualDto) => (
        <Typography variant="body2" color="text.secondary">
          {issual.approvedBy || "-"}
        </Typography>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 250,
      render: (issual: ProductIssualDto) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(issual);
              }}
              disabled={isLoadingDetails}
              sx={{
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                },
              }}
            >
              {isLoadingDetails ? <CircularProgress size={16} /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {canEditIssual(issual) && (
            <Tooltip title="Edit Physician Issual">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(issual);
                }}
                disabled={isLoadingDetails}
                sx={{
                  "&:hover": {
                    backgroundColor: "secondary.main",
                    color: "white",
                  },
                }}
              >
                {isLoadingDetails ? <CircularProgress size={16} /> : <EditIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Copy Physician Issual">
            <IconButton
              size="small"
              color="info"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(issual);
              }}
              disabled={isLoadingDetails}
              sx={{
                "&:hover": {
                  backgroundColor: "info.main",
                  color: "white",
                },
              }}
            >
              {isLoadingDetails ? <CircularProgress size={16} /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {canApproveIssual(issual) && (
            <Tooltip title="Approve Physician Issual">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(issual);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "success.main",
                    color: "white",
                  },
                }}
              >
                <ApproveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDeleteIssual(issual) && (
            <Tooltip title="Delete Physician Issual">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(issual);
                }}
                sx={{
                  "&:hover": {
                    backgroundColor: "error.main",
                    color: "white",
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Print">
            <IconButton size="small" color="info">
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading Physician Issuals: {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? "Loading..." : "Retry"}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {isLoadingDetails && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress />
            <Typography>Loading Physician Issual details...</Typography>
          </Box>
        </Box>
      )}

      {isDepartmentSelected && (
        <>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <MedicalIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Box>
                  <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
                    Physician Issual Management - {deptName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department to Physician medication dispensing management system
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<StatisticsIcon />}
                  endIcon={showStatistics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowStatistics(!showStatistics)}
                  size="small"
                >
                  Statistics
                </Button>
                <SmartButton text={`${deptName}`} onClick={handleDepartmentChange} variant="contained" size="small" color="warning" icon={Sync} />
                <CustomButton variant="contained" icon={AddIcon} text="New Physician Issual" onClick={handleAddNew} size="small" />
                <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={handleRefresh} asynchronous size="small" />
              </Stack>
            </Box>
          </Paper>
          <Collapse in={showStatistics}>
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
              <Grid container spacing={3} justifyContent="center">
                {[
                  {
                    title: "Total Issuals",
                    value: statistics.total,
                    icon: <DashboardIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#1976d2",
                  },
                  {
                    title: "Pending",
                    value: statistics.pending,
                    icon: <PendingIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#ff9800",
                  },
                  {
                    title: "Approved",
                    value: statistics.approved,
                    icon: <TaskAltIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#4caf50",
                  },
                  {
                    title: "Overdue",
                    value: statistics.overdue,
                    icon: <WarningIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#f44336",
                  },
                  {
                    title: "Total Value (K)",
                    value: Math.round(statistics.totalValue / 1000),
                    icon: <InventoryIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#2196f3",
                  },
                  {
                    title: "Physician Issual",
                    value: statistics.total,
                    icon: <MedicalIcon sx={{ fontSize: 24, color: "white" }} />,
                    bgColor: "#9c27b0",
                  },
                ].map((stat, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 2 }} key={stat.title}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1.5,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: `3px solid ${stat.bgColor}`,
                        borderLeft: `6px solid ${stat.bgColor}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "50%",
                          bgcolor: stat.bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: stat.bgColor,
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Collapse>

          <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Issue Code, Indent No, Department, Physician, or Remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    endAdornment: searchTerm && (
                      <IconButton size="small" onClick={() => setSearchTerm("")}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <ToggleButtonGroup value={viewMode} exclusive onChange={(_, newMode) => newMode && setViewMode(newMode)} size="small" sx={{ mr: 1 }}>
                    <ToggleButton value="grid" title="Grid View" size="small">
                      <ListIcon />
                    </ToggleButton>
                    <ToggleButton value="cards" title="Card View" size="small">
                      <CardIcon />
                    </ToggleButton>
                    <ToggleButton value="detailed" title="Detailed List" size="small">
                      <VisibilityIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <CustomButton variant="outlined" icon={SortIcon} text="Sort" onClick={(e) => setSortMenuAnchor(e.currentTarget)} size="small" />
                  <CustomButton variant="outlined" icon={FilterIcon} text="Filter" onClick={() => setIsFilterDrawerOpen(true)} size="small" />
                  <CustomButton
                    variant="outlined"
                    icon={selectedRows.length > 0 ? SelectAllIcon : UnselectAllIcon}
                    text={`Bulk (${selectedRows.length})`}
                    onClick={() => setIsBulkActionsOpen(true)}
                    size="small"
                  />
                  <CustomButton variant="outlined" icon={ReportIcon} text="Export" onClick={(e) => setReportsMenuAnchor(e.currentTarget)} size="small" />
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Showing <strong>{filteredAndSearchedIssuals.length}</strong> of <strong>{statistics.total}</strong> Physician Issuals from <strong>{deptName}</strong>
              {selectedRows.length > 0 && ` (${selectedRows.length} selected)`}
              {searchTerm && ` • Filtered by: "${searchTerm}"`}
            </Typography>
            {selectedRows.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => setSelectedRows(filteredAndSearchedIssuals.map((i) => i.pisid))}>
                  Select All Visible
                </Button>
                <Button size="small" onClick={() => setSelectedRows([])}>
                  Clear Selection
                </Button>
              </Stack>
            )}
          </Box>
          <Paper elevation={2} sx={{ overflow: "hidden" }}>
            {renderContent()}
          </Paper>
        </>
      )}

      <Menu anchorEl={sortMenuAnchor} open={Boolean(sortMenuAnchor)} onClose={() => setSortMenuAnchor(null)}>
        <MenuList>
          {[
            { value: "pisDate", label: "Issue Date" },
            { value: "pisCode", label: "Issue Code" },
            { value: "indentNo", label: "Indent Number" },
            { value: "fromDeptName", label: "From Department" },
            { value: "recConName", label: "Physician" },
            { value: "approvedYN", label: "Status" },
          ].map((option) => (
            <MenuItem key={option.value} onClick={() => handleSortChange(option.value)} selected={sortBy === option.value}>
              <ListItemText>{option.label}</ListItemText>
              {sortBy === option.value && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {sortOrder ? "↑" : "↓"}
                </Typography>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Menu anchorEl={reportsMenuAnchor} open={Boolean(reportsMenuAnchor)} onClose={() => setReportsMenuAnchor(null)}>
        <MenuList>
          <MenuItem onClick={() => handleExportIssuals("csv")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportIssuals("excel")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as Excel</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExportIssuals("pdf")}>
            <ListItemIcon>
              <ExportIcon />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelectWithIssualFetch} requireSelection />
      <Drawer anchor="right" open={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: 400, p: 3 } }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="600">
          Advanced Filters for {deptName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label="Date Range">
              {[
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "thisWeek", label: "This Week" },
                { value: "lastWeek", label: "Last Week" },
                { value: "thisMonth", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                { value: "last3Months", label: "Last 3 Months" },
                { value: "thisYear", label: "This Year" },
                { value: "custom", label: "Custom Range" },
              ].map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {dateRange === "custom" && (
            <>
              <DatePicker label="Start Date" value={startDate ? dayjs(startDate) : null} onChange={(d) => setStartDate(d ? d.toDate() : null)} />
              <DatePicker label="End Date" value={endDate ? dayjs(endDate) : null} onChange={(d) => setEndDate(d ? d.toDate() : null)} />
            </>
          )}

          <TextField label="Issue Code" size="small" fullWidth value={pisCode} onChange={(e) => setPisCode(e.target.value)} />

          <TextField label="Indent Number" size="small" fullWidth value={indentNo} onChange={(e) => setIndentNo(e.target.value)} />

          <FormControl fullWidth size="small">
            <InputLabel>Approval Status</InputLabel>
            <Select value={approvedStatus || "all"} onChange={(e) => setApprovedStatus(e.target.value === "all" ? undefined : e.target.value)} label="Approval Status">
              {[
                { value: "all", label: "All Status" },
                { value: "Y", label: "Approved" },
                { value: "N", label: "Pending" },
              ].map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Physician</InputLabel>
            <Select value={physicianID || "all"} onChange={(e) => setPhysicianID(e.target.value === "all" ? undefined : Number(e.target.value))} label="Physician">
              <MenuItem value="all">All Physicians</MenuItem>
              {attendingPhy?.map((phy) => (
                <MenuItem key={phy.value} value={phy.value}>
                  {phy.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={1}>
            <CustomButton
              variant="contained"
              text="Apply Filters"
              onClick={() => {
                setIsFilterDrawerOpen(false);
                fetchIssualsForDepartment();
                showAlert("Success", "Filters applied successfully", "success");
              }}
              sx={{ flex: 1 }}
            />
            <CustomButton
              variant="outlined"
              text="Clear"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setFromDepartmentID(undefined);
                setPhysicianID(undefined);
                setApprovedStatus(undefined);
                setDateRange("thisMonth");
                setSortBy("pisDate");
                setSortOrder(false);
                setPisCode("");
                setIndentNo("");
                setIsFilterDrawerOpen(false);
                fetchIssualsForDepartment();
                showAlert("Success", "Filters cleared", "success");
              }}
            />
          </Box>
        </Stack>
      </Drawer>

      <Dialog open={isBulkActionsOpen} onClose={() => setIsBulkActionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Bulk Actions ({selectedRows.length} items selected from {deptName})
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <CustomButton
              variant="outlined"
              icon={ApproveIcon}
              text={`Approve Selected (${
                selectedRows.filter((id) => {
                  const issual = filteredAndSearchedIssuals.find((i) => i.pisid === id);
                  return issual && issual.approvedYN !== "Y";
                }).length
              } eligible)`}
              color="success"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk approve functionality to be implemented", "info");
              }}
            />
            <CustomButton
              variant="outlined"
              icon={ExportIcon}
              text="Export Selected"
              color="info"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk export functionality to be implemented", "info");
              }}
            />
            <CustomButton
              variant="outlined"
              icon={DeleteIcon}
              text={`Delete Selected (${
                selectedRows.filter((id) => {
                  const issual = filteredAndSearchedIssuals.find((i) => i.pisid === id);
                  return issual && canDeleteIssual(issual);
                }).length
              } eligible)`}
              color="error"
              onClick={() => {
                setIsBulkActionsOpen(false);
                showAlert("Info", "Bulk delete functionality to be implemented", "info");
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsBulkActionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {isFormOpen && (
        <PhysicianIssualForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedIssual}
          viewOnly={isViewMode}
          copyMode={isCopyMode}
          selectedDepartmentId={deptId}
          selectedDepartmentName={deptName}
          issualType={IssualType.Physician}
        />
      )}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the Physician Issual "${selectedIssual?.pisCode}"?`}
        type="error"
      />

      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        title="Confirm Approval"
        message={`Are you sure you want to approve the Physician Issual "${selectedIssual?.pisCode}"? This action cannot be undone.`}
        type="warning"
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} />
    </Box>
  );
};

export default PhysicianIssualPage;
