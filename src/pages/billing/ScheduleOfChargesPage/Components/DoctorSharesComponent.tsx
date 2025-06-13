import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";

interface DoctorShareOption {
  docShareID: number;
  chargeID: number;
  conID: number;
  doctorShare?: number;
  hospShare?: number | null;
  doctorName: string;
  index: number;
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

  const doctorNamesRef = useRef<Map<string, string>>(new Map());
  const fieldRefsRef = useRef<Map<string, any>>(new Map());

  const { append, remove } = useFieldArray({
    control,
    name: "DoctorShares",
  });

  const doctorShares = useWatch({
    control,
    name: "DoctorShares",
    defaultValue: [],
  });

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
    let totalDoctorShare = 0;
    let totalHospitalShare = 0;
    let hasErrors = false;
    const validationResults = shares.map((share, index) => {
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
      } else if (shareTotal !== 100) {
        isValid = false;
        validationMessage = `Total must be 100% (currently ${shareTotal}%)`;
        hasErrors = true;
      } else if (doctorShare > 100 || hospShare > 100) {
        isValid = false;
        validationMessage = "Individual shares cannot exceed 100%";
        hasErrors = true;
      }

      return { ...share, isValid, validationMessage, index };
    });

    const isBalanced = Math.abs(totalDoctorShare + totalHospitalShare - shares.length * 100) < 0.01;
    setValidationSummary({
      totalShare: totalDoctorShare + totalHospitalShare,
      isBalanced,
      hasErrors,
      doctorCount: shares.length,
    });

    return validationResults;
  }, []);

  const shareStatistics = useMemo(() => {
    if (!doctorShares || doctorShares.length === 0) {
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

    const totalDoctorShare = doctorShares.reduce((sum: number, share: any) => sum + (Number(share.doctorShare) || 0), 0);
    const totalHospitalShare = doctorShares.reduce((sum: number, share: any) => sum + (Number(share.hospShare) || 0), 0);
    const doctorCount = doctorShares.length;
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
  }, [doctorShares, maxDoctors, validationSummary]);

  useEffect(() => {
    attendingPhy.forEach((doctor) => {
      if (!doctorNamesRef.current.has(doctor.value)) {
        doctorNamesRef.current.set(doctor.value, extractDoctorName(doctor.label));
      }
    });
  }, [attendingPhy, extractDoctorName]);

  useEffect(() => {
    if (!isInitialized && doctorShares && doctorShares.length > 0) {
      doctorShares.forEach((share: any) => {
        if (!share.originalCompositeId) {
          const matchingDoctor = attendingPhy.find((doc) => {
            const parsed = parseCompositeId(doc.value);
            return parsed.conID === share.conID;
          });

          if (matchingDoctor) {
            share.originalCompositeId = matchingDoctor.value;
            doctorNamesRef.current.set(matchingDoctor.value, extractDoctorName(matchingDoctor.label));
          }
        }
      });
      setIsInitialized(true);
    }
  }, [doctorShares, attendingPhy, isInitialized, parseCompositeId, extractDoctorName]);

  useEffect(() => {
    if (doctorShares && doctorShares.length > 0) {
      validateShares(doctorShares);
    }
  }, [doctorShares, validateShares]);

  const getDoctorName = useCallback(
    (conID: number, originalCompositeId?: string): string => {
      if (originalCompositeId && doctorNamesRef.current.has(originalCompositeId)) {
        return doctorNamesRef.current.get(originalCompositeId) || "Doctor undefined";
      }
      const doctor = attendingPhy.find((doc) => {
        const parsed = parseCompositeId(doc.value);
        return parsed.conID === conID;
      });
      if (doctor) {
        const name = extractDoctorName(doctor.label);
        doctorNamesRef.current.set(doctor.value, name);
        return name;
      }
      return "Doctor undefined";
    },
    [attendingPhy, parseCompositeId, extractDoctorName]
  );

  const gridData = useMemo(() => {
    if (!doctorShares) return [];
    return validateShares(doctorShares).map((share: any) => ({
      ...share,
      doctorName: getDoctorName(share.conID, share.originalCompositeId),
    }));
  }, [doctorShares, getDoctorName, validateShares]);

  const isDoctorAdded = useCallback(
    (doctorCompositeId: string) => {
      const parsed = parseCompositeId(doctorCompositeId);
      return doctorShares?.some((share: any) => Number(share.conID) === parsed.conID);
    },
    [doctorShares, parseCompositeId]
  );

  const handleDoctorSelect = useCallback(
    (event: SelectChangeEvent<string>) => {
      const doctorCompositeId = event.target.value;
      if (doctorCompositeId && !isDoctorAdded(doctorCompositeId)) {
        const doctor = attendingPhy.find((doc) => doc.value === doctorCompositeId);
        if (doctor) {
          const parsed = parseCompositeId(doctorCompositeId);
          doctorNamesRef.current.set(doctorCompositeId, extractDoctorName(doctor.label));
          const remainingDoctors = maxDoctors - doctorShares.length;
          const suggestedDoctorShare = remainingDoctors > 1 ? 50 : 60;
          const suggestedHospitalShare = 100 - suggestedDoctorShare;
          const newShare = {
            docShareID: 0,
            chargeID: 0,
            conID: parsed.conID,
            doctorShare: suggestedDoctorShare,
            hospShare: suggestedHospitalShare,
            rActiveYN: "Y",
            rTransferYN: "N",
            rNotes: "",
            originalCompositeId: doctorCompositeId,
          };

          append(newShare);
          setSelectedDoctor("");

          if (!expanded) {
            onToggleExpand();
          }
        }
      }
    },
    [isDoctorAdded, attendingPhy, parseCompositeId, extractDoctorName, append, expanded, onToggleExpand, maxDoctors, doctorShares.length]
  );

  const handleRemoveDoctor = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  const handleDoctorShareChange = useCallback((index: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const hospitalShare = 100 - numValue;
      const hospFieldRef = fieldRefsRef.current.get(`hospShare_${index}`);

      if (hospFieldRef && hospFieldRef.onChange) {
        setTimeout(() => {
          hospFieldRef.onChange(hospitalShare);
        }, 0);
      }
    }
  }, []);

  const handleHospitalShareChange = useCallback((index: number, value: any) => {
    const numValue = Number(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      const doctorShare = 100 - numValue;
      const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${index}`);

      if (doctorFieldRef && doctorFieldRef.onChange) {
        setTimeout(() => {
          doctorFieldRef.onChange(doctorShare);
        }, 0);
      }
    }
  }, []);

  const autoBalanceShares = useCallback(() => {
    if (doctorShares.length === 0) return;

    const equalDoctorShare = Math.floor((60 / doctorShares.length) * 10) / 10; // Round to 1 decimal
    const equalHospitalShare = 100 - equalDoctorShare;

    doctorShares.forEach((_: any, index: number) => {
      const doctorFieldRef = fieldRefsRef.current.get(`doctorShare_${index}`);
      const hospFieldRef = fieldRefsRef.current.get(`hospShare_${index}`);

      if (doctorFieldRef && hospFieldRef) {
        doctorFieldRef.onChange(equalDoctorShare);
        hospFieldRef.onChange(equalHospitalShare);
      }
    });
  }, [doctorShares]);

  const calculateTotal = useCallback((doctorShare?: number, hospShare?: number | null): string => {
    const doctor = Number(doctorShare) || 0;
    const hospital = Number(hospShare) || 0;
    const total = doctor + hospital;
    return `${total}%`;
  }, []);

  const columns: Column<DoctorShareOption>[] = [
    {
      key: "doctorName",
      header: "Doctor",
      visible: true,
      width: 200,
      render: (item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight="medium">
            {item.doctorName}
          </Typography>
          {item.isValid === false && (
            <Tooltip title={item.validationMessage} arrow>
              <WarningIcon color="error" sx={{ fontSize: 16 }} />
            </Tooltip>
          )}
          {item.isValid === true && <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />}
        </Box>
      ),
    },
    {
      key: "doctorShare",
      header: "Doctor Share (%)",
      visible: true,
      width: 180,
      render: (item) => (
        <Controller
          name={`DoctorShares.${item.index}.doctorShare`}
          control={control}
          render={({ field }) => {
            fieldRefsRef.current.set(`doctorShare_${item.index}`, field);

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
                  const numValue = Number(value);
                  field.onChange(numValue);
                  handleDoctorShareChange(item.index, value);
                }}
                disabled={disabled}
                error={item.isValid === false}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-error": {
                      "& fieldset": {
                        borderColor: "error.main",
                      },
                    },
                  },
                }}
              />
            );
          }}
        />
      ),
    },
    {
      key: "hospShare",
      header: "Hospital Share (%)",
      visible: true,
      width: 180,
      render: (item) => (
        <Controller
          name={`DoctorShares.${item.index}.hospShare`}
          control={control}
          render={({ field }) => {
            fieldRefsRef.current.set(`hospShare_${item.index}`, field);

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
                  const numValue = Number(value);
                  field.onChange(numValue);
                  handleHospitalShareChange(item.index, value);
                }}
                disabled={disabled}
                error={item.isValid === false}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-error": {
                      "& fieldset": {
                        borderColor: "error.main",
                      },
                    },
                  },
                }}
              />
            );
          }}
        />
      ),
    },
    {
      key: "total",
      header: "Total",
      visible: true,
      width: 120,
      render: (item) => {
        const total = calculateTotal(item.doctorShare, item.hospShare);
        const isValid = total === "100%";

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight="bold" color={isValid ? "success.main" : "error.main"}>
              {total}
            </Typography>
            {!isValid && <WarningIcon color="error" sx={{ fontSize: 16 }} />}
          </Box>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      width: 100,
      render: (item) => (
        <IconButton size="small" color="error" onClick={() => handleRemoveDoctor(item.index)} disabled={disabled}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    if (onUpdateFunction) {
      onUpdateFunction(() => {});
    }
  }, [onUpdateFunction]);

  if (!doctorShareEnabled) {
    return null;
  }

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
                      if (!selected) {
                        return <em>Select a doctor to add to revenue sharing...</em>;
                      }
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

          <CustomGrid
            columns={columns}
            data={gridData}
            maxHeight="400px"
            density="small"
            emptyStateMessage="No doctor revenue sharing configured. Select a doctor above to add revenue sharing."
            showDensityControls={false}
            pagination={false}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(DoctorSharesComponent);
