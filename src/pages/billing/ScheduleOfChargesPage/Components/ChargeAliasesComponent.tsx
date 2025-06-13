import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { BChargeAliasDto } from "@/interfaces/Billing/ChargeDto";
import { CheckCircle as CheckIcon, ExpandMore as ExpandMoreIcon, Label as LabelIcon, Save as SaveIcon, Warning as WarningIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, useFieldArray } from "react-hook-form";

interface ChargeAliasesComponentProps {
  control: Control<any>;
  pic: { value: string; label: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
  chargeAliases: BChargeAliasDto[];
  onUpdateFunction?: (updateFn: () => void) => void;
  disabled?: boolean;
  maxAliasLength?: number;
}

interface AliasGridRow {
  id: string;
  pTypeID: number;
  picName: string;
  chargeDesc: string;
  hasAlias: boolean;
  isValid: boolean;
  characterCount: number;
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({
  control,
  pic,
  expanded,
  onToggleExpand,
  chargeAliases,
  onUpdateFunction,
  disabled = false,
  maxAliasLength = 250,
}) => {
  const [aliasGridData, setAliasGridData] = useState<AliasGridRow[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSuccess, setShowSuccess] = useState(false);
  const isInitializedRef = useRef(false);
  const previousChargeAliasesRef = useRef<BChargeAliasDto[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const hasChargeAliasesChanged = useMemo(() => {
    if (previousChargeAliasesRef.current.length !== chargeAliases.length) {
      return true;
    }
    return chargeAliases.some((alias, index) => {
      const prevAlias = previousChargeAliasesRef.current[index];
      return !prevAlias || alias.pTypeID !== prevAlias.pTypeID || alias.chargeDesc !== prevAlias.chargeDesc || alias.chargeDescLang !== prevAlias.chargeDescLang;
    });
  }, [chargeAliases]);

  const aliasStatistics = useMemo(() => {
    const activeAliases = aliasGridData.filter((row) => row.hasAlias);
    const validAliases = activeAliases.filter((row) => row.isValid);
    const invalidAliases = activeAliases.filter((row) => !row.isValid);
    const completionPercentage = pic.length > 0 ? (activeAliases.length / pic.length) * 100 : 0;
    return {
      total: pic.length,
      active: activeAliases.length,
      valid: validAliases.length,
      invalid: invalidAliases.length,
      completionPercentage: Math.round(completionPercentage),
      hasErrors: invalidAliases.length > 0,
    };
  }, [aliasGridData, pic.length]);

  const initializeAliasGridData = useCallback(() => {
    if (!pic || pic.length === 0) return;
    const gridRows: AliasGridRow[] = pic.map((picOption) => {
      const pTypeID = Number(picOption.value);
      const existingAlias = chargeAliases.find((alias: BChargeAliasDto) => Number(alias.pTypeID) === pTypeID);
      const chargeDesc = existingAlias?.chargeDesc || "";
      const characterCount = chargeDesc.length;
      const isValid = characterCount > 0 && characterCount <= maxAliasLength;
      return {
        id: `pic-${pTypeID}`,
        pTypeID: pTypeID,
        picName: picOption.label,
        chargeDesc,
        hasAlias: Boolean(chargeDesc),
        isValid,
        characterCount,
      };
    });

    setAliasGridData(gridRows);
    previousChargeAliasesRef.current = [...chargeAliases];
    isInitializedRef.current = true;
  }, [pic, chargeAliases, maxAliasLength]);

  useEffect(() => {
    if (!isInitializedRef.current || hasChargeAliasesChanged) {
      initializeAliasGridData();
    }
  }, [initializeAliasGridData, hasChargeAliasesChanged]);

  const updateChargeAliasesFromGrid = useCallback(() => {
    setSaveStatus("saving");
    const chargeAliasesArray: BChargeAliasDto[] = [];
    for (const row of aliasGridData) {
      const hasContent = Boolean(row.chargeDesc && row.chargeDesc.trim());
      if (hasContent && row.isValid) {
        const existingAlias = chargeAliases.find((alias: BChargeAliasDto) => Number(alias.pTypeID) === row.pTypeID);

        chargeAliasesArray.push({
          chAliasID: existingAlias?.chAliasID || existingAlias?.chaliasID || 0,
          chargeID: existingAlias?.chargeID || 0,
          pTypeID: row.pTypeID,
          chargeDesc: row.chargeDesc.trim(),
          chargeDescLang: row.chargeDesc.trim(),
          rActiveYN: "Y",
          rTransferYN: existingAlias?.rTransferYN || existingAlias?.transferYN || "N",
          rNotes: existingAlias?.rNotes || "",
        });
      }
    }

    aliasesArray.replace(chargeAliasesArray);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("saved");
      setShowSuccess(true);
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  }, [aliasGridData, aliasesArray, chargeAliases]);

  const handleFieldChange = useCallback(
    (rowIndex: number, newValue: string) => {
      setAliasGridData((prevData) => {
        const updatedGridData = [...prevData];
        const row = updatedGridData[rowIndex];

        if (!row || row.chargeDesc === newValue) return prevData;

        const characterCount = newValue.length;
        const isValid = characterCount === 0 || (characterCount > 0 && characterCount <= maxAliasLength);

        updatedGridData[rowIndex] = {
          ...row,
          chargeDesc: newValue,
          hasAlias: Boolean(newValue && newValue.trim()),
          isValid,
          characterCount,
        };

        return updatedGridData;
      });
    },
    [maxAliasLength]
  );

  useEffect(() => {
    if (onUpdateFunction && isInitializedRef.current) {
      onUpdateFunction(updateChargeAliasesFromGrid);
    }
  }, [updateChargeAliasesFromGrid, onUpdateFunction]);
  const columns: Column<AliasGridRow>[] = useMemo(
    () => [
      {
        key: "picName",
        header: "Patient Type (PIC)",
        visible: true,
        width: 300,
        minWidth: 250,
        align: "left",
        render: (item) => (
          <Box sx={{ py: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: item.hasAlias ? 600 : 400,
                color: item.hasAlias ? (item.isValid ? "primary.main" : "error.main") : "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {item.hasAlias && (item.isValid ? <CheckIcon sx={{ fontSize: 16, color: "success.main" }} /> : <WarningIcon sx={{ fontSize: 16, color: "error.main" }} />)}
              {item.picName}
            </Typography>
          </Box>
        ),
      },
      {
        key: "chargeDesc",
        header: "Alias Name",
        visible: true,
        width: 400,
        minWidth: 300,
        align: "left",
        render: (item, rowIndex) => (
          <Box sx={{ py: 1 }}>
            <TextField
              size="small"
              variant="outlined"
              fullWidth
              placeholder={`Enter alias for ${item.picName}...`}
              value={item.chargeDesc}
              onChange={(e) => handleFieldChange(rowIndex, e.target.value)}
              disabled={disabled}
              error={item.hasAlias && !item.isValid}
              helperText={item.hasAlias && !item.isValid ? `Exceeds ${maxAliasLength} characters` : `${item.characterCount}/${maxAliasLength}`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused": {
                    "& fieldset": {
                      borderColor: item.hasAlias && !item.isValid ? "error.main" : "primary.main",
                    },
                  },
                },
              }}
              InputProps={{
                endAdornment: item.characterCount > maxAliasLength * 0.8 && (
                  <Tooltip title={`${item.characterCount}/${maxAliasLength} characters`}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: item.characterCount > maxAliasLength ? "error.main" : "warning.main",
                      }}
                    />
                  </Tooltip>
                ),
              }}
            />
          </Box>
        ),
      },
    ],
    [handleFieldChange, disabled, maxAliasLength]
  );

  // Enhanced header display with progress indicator
  const getStatusColor = () => {
    if (aliasStatistics.hasErrors) return "error";
    if (aliasStatistics.active === 0) return "default";
    if (aliasStatistics.completionPercentage === 100) return "success";
    return "primary";
  };

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={onToggleExpand}
        sx={{
          "&.Mui-expanded": {
            margin: "8px 0",
          },
          "&:before": {
            display: "none",
          },
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "8px !important",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1} width="100%">
            <LabelIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Charge Aliases
            </Typography>

            <Chip label={`${aliasStatistics.active} of ${aliasStatistics.total} configured`} size="small" color={getStatusColor()} variant="outlined" />

            {saveStatus === "saving" && <Chip icon={<SaveIcon sx={{ fontSize: 14 }} />} label="Saving..." size="small" color="info" variant="filled" />}

            {aliasStatistics.hasErrors && (
              <Tooltip title={`${aliasStatistics.invalid} invalid aliases`} arrow>
                <WarningIcon color="error" sx={{ fontSize: 16 }} />
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ padding: "16px" }}>
          <Stack spacing={2}>
            <Box
              sx={{
                "& .MuiTableContainer-root": {
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                },
                "& .MuiTableHead-root": {
                  backgroundColor: "grey.50",
                },
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
                "& .MuiTableCell-body": {
                  padding: "8px 12px",
                },
              }}
            >
              <CustomGrid
                columns={columns}
                data={aliasGridData}
                maxHeight="600px"
                minHeight="300px"
                emptyStateMessage="No patient types available. Please ensure PIC data is loaded."
                showDensityControls={false}
                density="medium"
                rowKeyField="id"
                pagination={false}
                selectable={false}
                loading={saveStatus === "saving"}
              />
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default React.memo(ChargeAliasesComponent);
