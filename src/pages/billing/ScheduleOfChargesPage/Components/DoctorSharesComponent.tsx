import {
  Balance as BalanceIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModel, GridRowModesModel } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";

interface DoctorShareOption {
  id: string;
  docShareID: number;
  chargeID: number;
  conID: number;
  doctorShare?: number;
  hospShare?: number | null;
  rActiveYN?: "Y" | "N";
  doctorName: string;
  originalIndex: number;
  originalCompositeId: string;
  isValid?: boolean;
  validationMessage?: string;
}

interface DoctorSharesComponentProps {
  control: Control<any>;
  expanded: boolean;
  onToggleExpand: () => void;
  attendingPhy: { value: string; label: string }[];
  doctorShareEnabled: boolean;
  onUpdateFunction?: (updateFn: () => void) => void;
  disabled?: boolean;
  maxDoctors?: number;
}

const DoctorSharesComponent: React.FC<DoctorSharesComponentProps> = ({
  control,
  expanded,
  onToggleExpand,
  attendingPhy,
  doctorShareEnabled,
  onUpdateFunction,
  disabled = false,
  maxDoctors = 5,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [validationSummary, setValidationSummary] = useState<{
    totalShare: number;
    isBalanced: boolean;
    hasErrors: boolean;
    doctorCount: number;
  }>({ totalShare: 0, isBalanced: true, hasErrors: false, doctorCount: 0 });
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [gridRefreshKey, setGridRefreshKey] = useState(0);

  const doctorNamesRef = useRef<Map<string, string>>(new Map());
  const fieldRefsRef = useRef<Map<string, any>>(new Map());

  const { append, update } = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const doctorShares = useWatch({
    control,
    name: "DoctorShares",
    defaultValue: [],
  });

  const activeDoctorShares = useMemo(() => {
    return doctorShares?.filter((share: any) => share.rActiveYN !== "N") || [];
  }, [doctorShares]);

  const extractDoctorName = useCallback((label: string): string => {
    if (!label) return "Doctor NaN";
    const parts = label.split("|");
    if (parts.length > 1) {
      return parts[0]?.trim() || "Doctor NaN";
    }

    const dashParts = label.split("-");
    if (dashParts.length > 1) {
      return dashParts.slice(1).join("-").trim() || "Doctor NaN";
    }

    return label.trim() || "Doctor NaN";
  }, []);

  const parseCompositeId = useCallback((compositeId: string): { conID: number } => {
    const parts = compositeId.split("-");
    return {
      conID: parts.length > 0 ? Number(parts[0]) : Number(compositeId),
    };
  }, []);

  const validateShares = useCallback((shares: any[]) => {
    const activeShares = shares.filter((share) => share.rActiveYN !== "N");
    let totalDoctorShare = 0;
    let totalHospitalShare = 0;
    let hasErrors = false;

    const validationResults = shares.map((share, currentIndex) => {
      if (share.rActiveYN === "N") {
        return {
          ...share,
          isValid: true,
          validationMessage: "",
          index: currentIndex,
          originalIndex: currentIndex,
        };
      }

      const doctorShare = Number(share.doctorShare) || 0;
      const hospShare = Number(share.hospShare) || 0;
      const shareTotal = doctorShare + hospShare;
      totalDoctorShare += doctorShare;
      totalHospitalShare += hospShare;

      let isValid = true;
      let validationMessage = "";

      if (doctorShare < 0 || hospShare < 0) {
        isValid = false;
        validationMessage = "Shares cannot be negative";
        hasErrors = true;
      } else if (shareTotal !== 100 && shareTotal !== 0) {
        isValid = false;
        validationMessage = `Total must be 100% (currently ${shareTotal}%)`;
        hasErrors = true;
      } else if (doctorShare > 100 || hospShare > 100) {
        isValid = false;
        validationMessage = "Individual shares cannot exceed 100%";
        hasErrors = true;
      }

      return {
        ...share,
        isValid,
        validationMessage,
        index: currentIndex,
        originalIndex: currentIndex,
      };
    });

    const isBalanced = Math.abs(totalDoctorShare + totalHospitalShare - activeShares.length * 100) < 0.01 || (totalDoctorShare === 0 && totalHospitalShare === 0);
    setValidationSummary({
      totalShare: totalDoctorShare + totalHospitalShare,
      isBalanced,
      hasErrors,
      doctorCount: activeShares.length,
    });

    return validationResults;
  }, []);

  const shareStatistics = useMemo(() => {
    if (!activeDoctorShares || activeDoctorShares.length === 0) {
      return {
        totalDoctors: 0,
        avgDoctorShare: 0,
        avgHospitalShare: 0,
        totalDoctorRevenue: 0,
        totalHospitalRevenue: 0,
        utilizationRate: 0,
        isOptimal: false,
      };
    }

    const totalDoctorShare = activeDoctorShares.reduce((sum: number, share: any) => sum + (Number(share.doctorShare) || 0), 0);
    const totalHospitalShare = activeDoctorShares.reduce((sum: number, share: any) => sum + (Number(share.hospShare) || 0), 0);
    const doctorCount = activeDoctorShares.length;
    const avgDoctorShare = doctorCount > 0 ? totalDoctorShare / doctorCount : 0;
    const avgHospitalShare = doctorCount > 0 ? totalHospitalShare / doctorCount : 0;
    const utilizationRate = maxDoctors > 0 ? (doctorCount / maxDoctors) * 100 : 0;

    const isOptimal = validationSummary.isBalanced && avgDoctorShare >= 20 && avgDoctorShare <= 80 && !validationSummary.hasErrors;
    return {
      totalDoctors: doctorCount,
      avgDoctorShare,
      avgHospitalShare,
      totalDoctorRevenue: totalDoctorShare,
      totalHospitalRevenue: totalHospitalShare,
      utilizationRate,
      isOptimal,
    };
  }, [activeDoctorShares, maxDoctors, validationSummary]);

  useEffect(() => {
    attendingPhy.forEach((doctor) => {
      if (!doctorNamesRef.current.has(doctor.value)) {
        doctorNamesRef.current.set(doctor.value, extractDoctorName(doctor.label));
      }
    });
  }, [attendingPhy, extractDoctorName]);

  useEffect(() => {
    if (!isInitialized && doctorShares && doctorShares.length > 0) {
      doctorShares.forEach((share: any, index: number) => {
        if (!share.originalCompositeId) {
          const matchingDoctor = attendingPhy.find((doc) => {
            const parsed = parseCompositeId(doc.value);
            return parsed.conID === share.conID;
          });

          if (matchingDoctor) {
            share.originalCompositeId = matchingDoctor.value;
            doctorNamesRef.current.set(matchingDoctor.value, extractDoctorName(matchingDoctor.label));
          } else {
            const fallbackKey = `fallback_${share.conID}`;
            doctorNamesRef.current.set(fallbackKey, `Doctor ${share.conID}`);
            share.originalCompositeId = fallbackKey;
          }
        } else {
          const doctor = attendingPhy.find((doc) => doc.value === share.originalCompositeId);
          if (doctor && !doctorNamesRef.current.has(share.originalCompositeId)) {
            doctorNamesRef.current.set(share.originalCompositeId, extractDoctorName(doctor.label));
          }
        }
      });
      setIsInitialized(true);
    }
  }, [doctorShares, attendingPhy, isInitialized, parseCompositeId, extractDoctorName]);

  useEffect(() => {
    if (doctorShares) {
      validateShares(doctorShares);
    }
  }, [doctorShares, validateShares]);

  const getDoctorName = useCallback(
    (conID: number, originalCompositeId?: string): string => {
      if (originalCompositeId && doctorNamesRef.current.has(originalCompositeId)) {
        return doctorNamesRef.current.get(originalCompositeId) || "Doctor undefined";
      }
      const doctor = attendingPhy.find((doc) => parseCompositeId(doc.value).conID === conID);
      if (doctor) {
        const name = extractDoctorName(doctor.label);
        doctorNamesRef.current.set(doctor.value, name);
        return name;
      }
      const doctorByDirectMatch = attendingPhy.find((doc) => doc.value.includes(conID.toString()));
      if (doctorByDirectMatch) {
        const name = extractDoctorName(doctorByDirectMatch.label);
        doctorNamesRef.current.set(doctorByDirectMatch.value, name);
        return name;
      }
      return `Doctor ${conID}`;
    },
    [attendingPhy, parseCompositeId, extractDoctorName]
  );

  const gridData = useMemo((): DoctorShareOption[] => {
    if (!doctorShares) return [];

    const allValidatedShares = validateShares(doctorShares);

    const activeShares = allValidatedShares
      .map((share: any, originalIndex: number) => ({
        id: `doctor-share-${originalIndex}`,
        docShareID: share.docShareID || 0,
        chargeID: share.chargeID || 0,
        conID: share.conID,
        doctorShare: share.doctorShare || 0,
        hospShare: share.hospShare || 0,
        rActiveYN: share.rActiveYN || "Y",
        doctorName: getDoctorName(share.conID, share.originalCompositeId),
        originalIndex,
        originalCompositeId: share.originalCompositeId || "",
        isValid: share.isValid,
        validationMessage: share.validationMessage || "",
      }))
      .filter((share) => share.rActiveYN !== "N");

    return activeShares;
  }, [doctorShares, getDoctorName, validateShares, gridRefreshKey]);

  const isDoctorAdded = useCallback(
    (doctorCompositeId: string) => {
      const parsed = parseCompositeId(doctorCompositeId);
      return activeDoctorShares?.some((share: any) => Number(share.conID) === parsed.conID);
    },
    [activeDoctorShares, parseCompositeId]
  );

  const handleDoctorSelect = useCallback(
    (event: SelectChangeEvent<string>) => {
      const doctorCompositeId = event.target.value;
      if (doctorCompositeId && !isDoctorAdded(doctorCompositeId)) {
        const doctor = attendingPhy.find((doc) => doc.value === doctorCompositeId);
        if (doctor) {
          const parsed = parseCompositeId(doctorCompositeId);
          doctorNamesRef.current.set(doctorCompositeId, extractDoctorName(doctor.label));

          const newShare = {
            docShareID: 0,
            chargeID: 0,
            conID: parsed.conID,
            doctorShare: 0,
            hospShare: 0,
            rActiveYN: "Y" as const,
            rTransferYN: "N" as const,
            rNotes: "",
            originalCompositeId: doctorCompositeId,
          };
          append(newShare);
          setSelectedDoctor("");
          if (!expanded) onToggleExpand();
        }
      }
    },
    [isDoctorAdded, attendingPhy, parseCompositeId, extractDoctorName, append, expanded, onToggleExpand]
  );

  const handleRemoveDoctor = useCallback(
    (originalIndex: number) => {
      const shareToRemove = doctorShares[originalIndex];

      if (shareToRemove) {
        const updatedShare = {
          ...shareToRemove,
          rActiveYN: "N" as const,
        };

        update(originalIndex, updatedShare);

        const rActiveYNFieldRef = fieldRefsRef.current.get(`rActiveYN_${originalIndex}`);
        if (rActiveYNFieldRef && rActiveYNFieldRef.onChange) {
          setTimeout(() => {
            rActiveYNFieldRef.onChange("N");
          }, 0);
        }
      }

      fieldRefsRef.current.delete(`doctorShare_${originalIndex}`);
      fieldRefsRef.current.delete(`hospShare_${originalIndex}`);
      fieldRefsRef.current.delete(`rActiveYN_${originalIndex}`);
    },
    [doctorShares, update]
  );

  const handleDoctorShareChange = useCallback((originalIndex: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const hospitalShare = 100 - numValue;
      const hospFieldRef = fieldRefsRef.current.get(`hospShare_${originalIndex}`);
      if (hospFieldRef && hospFieldRef.onChange) {
        setTimeout(() => {
          hospFieldRef.onChange(hospitalShare);
          setGridRefreshKey((prev) => prev + 1);
        }, 0);
      }
    }
  }, []);

  const handleHospitalShareChange = useCallback((originalIndex: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const doctorShare = 100 - numValue;
      const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${originalIndex}`);
      if (doctorFieldRef && doctorFieldRef.onChange) {
        setTimeout(() => {
          doctorFieldRef.onChange(doctorShare);
          setGridRefreshKey((prev) => prev + 1);
        }, 0);
      }
    }
  }, []);

  const autoBalanceShares = useCallback(() => {
    if (activeDoctorShares.length === 0) return;

    const equalDoctorShare = Math.floor(100 / activeDoctorShares.length);
    const equalHospitalShare = 100 - equalDoctorShare;

    activeDoctorShares.forEach((activeShare: any) => {
      const originalIndex = doctorShares.findIndex(
        (share: any) => share.conID === activeShare.conID && share.originalCompositeId === activeShare.originalCompositeId && share.rActiveYN !== "N"
      );

      if (originalIndex !== -1) {
        const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${originalIndex}`);
        const hospFieldRef = fieldRefsRef.current.get(`hospShare_${originalIndex}`);

        if (doctorFieldRef && hospFieldRef) {
          doctorFieldRef.onChange(equalDoctorShare);
          hospFieldRef.onChange(equalHospitalShare);
        }
      }
    });

    setGridRefreshKey((prev) => prev + 1);
  }, [activeDoctorShares, doctorShares]);

  const calculateTotal = useCallback((doctorShare?: number, hospShare?: number | null): string => {
    const total = (Number(doctorShare) || 0) + (Number(hospShare) || 0);
    return `${total}%`;
  }, []);

  const processRowUpdate = useCallback((newRow: GridRowModel, oldRow: GridRowModel) => {
    const originalIndex = newRow.originalIndex as number;
    let doctorShare = Math.max(0, Math.min(100, Number(newRow.doctorShare) || 0));
    let hospShare = Math.max(0, Math.min(100, Number(newRow.hospShare) || 0));

    const doctorChanged = newRow.doctorShare !== oldRow.doctorShare;
    const hospChanged = newRow.hospShare !== oldRow.hospShare;

    if (doctorChanged && !hospChanged) {
      hospShare = 100 - doctorShare;
    } else if (hospChanged && !doctorChanged) {
      doctorShare = 100 - hospShare;
    }

    const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${originalIndex}`);
    const hospFieldRef = fieldRefsRef.current.get(`hospShare_${originalIndex}`);

    if (doctorFieldRef) {
      doctorFieldRef.onChange(doctorShare);
    }
    if (hospFieldRef) {
      hospFieldRef.onChange(hospShare);
    }

    return {
      ...newRow,
      doctorShare,
      hospShare,
    };
  }, []);

  const handleProcessRowUpdateError = useCallback((error: Error) => {}, []);

  const gridColumns = useMemo((): GridColDef[] => {
    return [
      {
        field: "doctorName",
        headerName: "DOCTOR",
        flex: 1.2,
        editable: false,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as DoctorShareOption;
          return (
            <Box display="flex" alignItems="center" gap={1} sx={{ height: "100%", py: 1 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {item.doctorName}
              </Typography>
              {item.isValid === false && (
                <Tooltip title={item.validationMessage} arrow>
                  <WarningIcon color="error" sx={{ fontSize: 16 }} />
                </Tooltip>
              )}
              {item.isValid === true && <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />}

              <Controller
                name={`DoctorShares.${item.originalIndex}.rActiveYN`}
                control={control}
                render={({ field }) => {
                  fieldRefsRef.current.set(`rActiveYN_${item.originalIndex}`, field);
                  return <input type="hidden" {...field} value={field.value || "Y"} />;
                }}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.rTransferYN`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || "N"} />}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.docShareID`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || 0} />}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.chargeID`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || 0} />}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.conID`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || item.conID} />}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.rNotes`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || ""} />}
              />
              <Controller
                name={`DoctorShares.${item.originalIndex}.originalCompositeId`}
                control={control}
                render={({ field }) => <input type="hidden" {...field} value={field.value || item.originalCompositeId} />}
              />
            </Box>
          );
        },
      },
      {
        field: "doctorShare",
        headerName: "DOCTOR SHARE (%)",
        flex: 0.8,
        type: "number",
        editable: !disabled,
        sortable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as DoctorShareOption;
          return (
            <Controller
              name={`DoctorShares.${item.originalIndex}.doctorShare`}
              control={control}
              render={({ field }) => {
                fieldRefsRef.current.set(`doctorShare_${item.originalIndex}`, field);
                return (
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Number(value) || 0;
                      field.onChange(numValue);

                      if (numValue >= 0 && numValue <= 100) {
                        const hospitalShare = 100 - numValue;
                        const hospFieldRef = fieldRefsRef.current.get(`hospShare_${item.originalIndex}`);
                        if (hospFieldRef && hospFieldRef.onChange) {
                          setTimeout(() => {
                            hospFieldRef.onChange(hospitalShare);
                            setGridRefreshKey((prev) => prev + 1);
                          }, 0);
                        }
                      }
                    }}
                    disabled={disabled}
                    error={item.isValid === false}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "0.875rem",
                        "&.Mui-error": {
                          "& fieldset": {
                            borderColor: "error.main",
                          },
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        textAlign: "center",
                        padding: "8px 12px",
                      },
                    }}
                  />
                );
              }}
            />
          );
        },
      },
      {
        field: "hospShare",
        headerName: "HOSPITAL SHARE (%)",
        flex: 0.8,
        type: "number",
        editable: !disabled,
        sortable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as DoctorShareOption;
          return (
            <Controller
              name={`DoctorShares.${item.originalIndex}.hospShare`}
              control={control}
              render={({ field }) => {
                fieldRefsRef.current.set(`hospShare_${item.originalIndex}`, field);
                return (
                  <TextField
                    {...field}
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Number(value) || 0;
                      field.onChange(numValue);

                      if (numValue >= 0 && numValue <= 100) {
                        const doctorShare = 100 - numValue;
                        const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${item.originalIndex}`);
                        if (doctorFieldRef && doctorFieldRef.onChange) {
                          setTimeout(() => {
                            doctorFieldRef.onChange(doctorShare);
                            setGridRefreshKey((prev) => prev + 1);
                          }, 0);
                        }
                      }
                    }}
                    disabled={disabled}
                    error={item.isValid === false}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "0.875rem",
                        "&.Mui-error": {
                          "& fieldset": {
                            borderColor: "error.main",
                          },
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        textAlign: "center",
                        padding: "8px 12px",
                      },
                    }}
                  />
                );
              }}
            />
          );
        },
      },
      {
        field: "total",
        headerName: "TOTAL",
        editable: false,
        sortable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as DoctorShareOption;
          const total = calculateTotal(item.doctorShare, item.hospShare);
          const isValid = total === "100%" || total === "0%";

          return (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ height: "100%" }}>
              <Chip label={total} size="small" variant={isValid ? "filled" : "outlined"} color={isValid ? (total === "0%" ? "default" : "success") : "error"} />
              {!isValid && (
                <Tooltip title="Total must equal 100%" arrow>
                  <WarningIcon color="error" sx={{ fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        field: "actions",
        headerName: "ACTIONS",
        editable: false,
        sortable: false,
        filterable: false,
        headerAlign: "center",
        align: "center",
        renderCell: (params: GridRenderCellParams) => {
          const item = params.row as DoctorShareOption;
          return (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Tooltip title="Remove doctor from revenue sharing" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveDoctor(item.originalIndex)}
                  disabled={disabled}
                  sx={{
                    "&:hover": {
                      backgroundColor: "error.light",
                      color: "white",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [control, disabled, calculateTotal, handleRemoveDoctor]);

  useEffect(() => {
    if (onUpdateFunction) {
      onUpdateFunction(() => {});
    }
  }, [onUpdateFunction]);

  if (!doctorShareEnabled) return null;

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <TrendingUpIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Doctor Revenue Sharing
          </Typography>

          <Chip label={`${shareStatistics.totalDoctors} doctors`} size="small" color={shareStatistics.totalDoctors > 0 ? "primary" : "default"} variant="outlined" />

          {validationSummary.hasErrors && (
            <Tooltip title="Validation errors found" arrow>
              <WarningIcon color="error" sx={{ fontSize: 16 }} />
            </Tooltip>
          )}

          {validationSummary.isBalanced && !validationSummary.hasErrors && shareStatistics.totalDoctors > 0 && (
            <Tooltip title="All shares properly configured" arrow>
              <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
            </Tooltip>
          )}

          {shareStatistics.isOptimal && <Chip label="Optimal" size="small" color="success" variant="filled" icon={<BalanceIcon />} />}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: "16px" }}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <PersonAddIcon color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                Add Doctor to Revenue Sharing
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="end">
              <Grid size={{ xs: 12, sm: 8 }}>
                <FormControl fullWidth size="small">
                  <Select
                    displayEmpty
                    value={selectedDoctor}
                    onChange={handleDoctorSelect}
                    disabled={disabled || shareStatistics.totalDoctors >= maxDoctors}
                    renderValue={(selected) => {
                      if (!selected) return <em>Select a doctor to add to revenue sharing...</em>;
                      const doctor = attendingPhy.find((doc) => doc.value === selected);
                      return doctor?.label || selected;
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a doctor</em>
                    </MenuItem>
                    {attendingPhy.map((doctor) => (
                      <MenuItem key={doctor.value} value={doctor.value} disabled={isDoctorAdded(doctor.value)}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {doctor.label}
                          {isDoctorAdded(doctor.value) && <Chip label="Added" size="small" color="success" variant="outlined" />}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Stack direction="row" spacing={1}>
                  {shareStatistics.totalDoctors > 1 && (
                    <Button size="small" variant="outlined" onClick={autoBalanceShares} disabled={disabled} startIcon={<BalanceIcon />}>
                      Auto Balance
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {shareStatistics.totalDoctors >= maxDoctors && (
              <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                Maximum number of doctors ({maxDoctors}) reached for revenue sharing.
              </Alert>
            )}
          </Paper>

          <Paper elevation={0}>
            <DataGrid
              key={gridRefreshKey}
              rows={gridData}
              columns={gridColumns}
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              density="compact"
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
                      No Doctor Revenue Sharing Configured
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: "400px" }}>
                      Select a doctor above to add revenue sharing configuration.
                    </Typography>
                  </Box>
                ),
              }}
            />
          </Paper>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(DoctorSharesComponent);
