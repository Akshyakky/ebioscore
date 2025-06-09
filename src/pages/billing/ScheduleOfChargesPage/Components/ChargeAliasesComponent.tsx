import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Chip, Stack, Alert, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control, useWatch } from "react-hook-form";
import { BChargeAliasDto } from "@/interfaces/Billing/ChargeDto";

interface ChargeAliasesComponentProps {
  control: Control<any>;
  pic: { value: string; label: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
}

interface AliasGridRow {
  id: string;
  pTypeID: number;
  picName: string;
  chargeDesc: string;
  chargeDescLang: string;
  rActiveYN: "Y" | "N";
  hasAlias: boolean;
  originalIndex?: number;
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({ control, pic, expanded, onToggleExpand }) => {
  const [gridData, setGridData] = useState<AliasGridRow[]>([]);

  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const watchedAliases =
    useWatch({
      control,
      name: "ChargeAliases",
    }) || [];
  const initializeGridData = useCallback(() => {
    if (!pic || pic.length === 0) return;
    const gridRows: AliasGridRow[] = pic.map((picOption) => {
      const pTypeID = Number(picOption.value);
      const existingAliasIndex = watchedAliases.findIndex((alias: any) => Number(alias.pTypeID) === pTypeID);
      const existingAlias = existingAliasIndex >= 0 ? watchedAliases[existingAliasIndex] : null;
      return {
        id: `pic-${pTypeID}`,
        pTypeID: pTypeID,
        picName: picOption.label,
        chargeDesc: existingAlias?.chargeDesc || "",
        chargeDescLang: existingAlias?.chargeDescLang || "",
        rActiveYN: existingAlias?.rActiveYN || "Y",
        hasAlias: !!existingAlias && (existingAlias.chargeDesc?.trim() || existingAlias.chargeDescLang?.trim()),
        originalIndex: existingAliasIndex >= 0 ? existingAliasIndex : undefined,
      };
    });

    setGridData(gridRows);
  }, [pic, watchedAliases]);

  useEffect(() => {
    initializeGridData();
  }, [initializeGridData]);

  const handleFieldChange = useCallback(
    (rowIndex: number, fieldName: string, value: any) => {
      const gridRow = gridData[rowIndex];
      if (!gridRow) return;

      const pTypeID = gridRow.pTypeID;
      const existingAliasIndex = watchedAliases.findIndex((alias: any) => Number(alias.pTypeID) === pTypeID);

      const updatedAlias = {
        chAliasID: 0,
        chargeID: 0,
        pTypeID: pTypeID,
        chargeDesc: fieldName === "chargeDesc" ? value : gridRow.chargeDesc,
        chargeDescLang: fieldName === "chargeDescLang" ? value : gridRow.chargeDescLang,
        rActiveYN: fieldName === "rActiveYN" ? value : gridRow.rActiveYN,
      };

      if (existingAliasIndex >= 0) {
        aliasesArray.update(existingAliasIndex, updatedAlias);
      } else {
        const hasContent = updatedAlias.chargeDesc?.trim() || updatedAlias.chargeDescLang?.trim();
        if (hasContent) {
          aliasesArray.append(updatedAlias);
        }
      }

      if (fieldName === "chargeDesc" || fieldName === "chargeDescLang") {
        const hasContent = updatedAlias.chargeDesc?.trim() || updatedAlias.chargeDescLang?.trim();
        if (!hasContent && existingAliasIndex >= 0) {
          aliasesArray.remove(existingAliasIndex);
        }
      }
    },
    [gridData, watchedAliases, aliasesArray]
  );

  const activeAliasCount = useMemo(() => {
    return gridData.filter((row) => row.hasAlias && row.rActiveYN === "Y").length;
  }, [gridData]);

  const columns: Column<AliasGridRow>[] = useMemo(
    () => [
      {
        key: "picName",
        header: "PIC Name",
        visible: true,
        width: 350,
        minWidth: 300,
        align: "left",
        render: (item) => (
          <Box sx={{ py: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: item.hasAlias ? 600 : 400,
                color: item.hasAlias ? "primary.main" : "text.primary",
              }}
            >
              {item.picName}
            </Typography>
          </Box>
        ),
      },
      {
        key: "chargeDesc",
        header: "Alias Name",
        visible: true,
        width: 300,
        minWidth: 250,
        align: "left",
        render: (item, rowIndex) => {
          const existingAliasIndex = watchedAliases.findIndex((alias: any) => Number(alias.pTypeID) === item.pTypeID);

          return (
            <Box sx={{ py: 1 }}>
              <EnhancedFormField
                name={existingAliasIndex >= 0 ? `ChargeAliases.${existingAliasIndex}.chargeDesc` : `temp_chargeDesc_${item.pTypeID}`}
                control={control}
                type="text"
                label=""
                size="small"
                variant="standard"
                fullWidth
                placeholder="Enter alias description (max 250 characters)"
                helperText=""
                inputProps={{
                  maxLength: 250,
                }}
                onChange={(value) => handleFieldChange(rowIndex, "chargeDesc", value)}
              />
            </Box>
          );
        },
      },
      {
        key: "chargeDescLang",
        header: "Local Language Description",
        visible: true,
        width: 300,
        minWidth: 250,
        align: "left",
        render: (item, rowIndex) => {
          const existingAliasIndex = watchedAliases.findIndex((alias: any) => Number(alias.pTypeID) === item.pTypeID);

          return (
            <Box sx={{ py: 1 }}>
              <EnhancedFormField
                name={existingAliasIndex >= 0 ? `ChargeAliases.${existingAliasIndex}.chargeDescLang` : `temp_chargeDescLang_${item.pTypeID}`}
                control={control}
                type="text"
                label=""
                size="small"
                variant="standard"
                fullWidth
                placeholder="Enter local language description (max 250 characters)"
                helperText=""
                inputProps={{
                  maxLength: 250,
                }}
                onChange={(value) => handleFieldChange(rowIndex, "chargeDescLang", value)}
              />
            </Box>
          );
        },
      },
      {
        key: "rActiveYN",
        header: "Active",
        visible: true,
        width: 100,
        align: "center",
        render: (item, rowIndex) => {
          const existingAliasIndex = watchedAliases.findIndex((alias: any) => Number(alias.pTypeID) === item.pTypeID);

          return (
            <Box sx={{ py: 1, display: "flex", justifyContent: "center" }}>
              <EnhancedFormField
                name={existingAliasIndex >= 0 ? `ChargeAliases.${existingAliasIndex}.rActiveYN` : `temp_rActiveYN_${item.pTypeID}`}
                control={control}
                type="switch"
                label=""
                size="small"
                helperText=""
                onChange={(value) => handleFieldChange(rowIndex, "rActiveYN", value)}
              />
            </Box>
          );
        },
      },
    ],
    [control, watchedAliases, handleFieldChange]
  );

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Charge Aliases
          </Typography>
          <Chip label={`${activeAliasCount} of ${pic.length} configured`} size="small" color={activeAliasCount > 0 ? "success" : "default"} variant="outlined" />
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
          {/* Information Alert */}

          {/* Grid Section */}
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
              "& .MuiTextField-root": {
                "& .MuiInput-underline:before": {
                  borderBottomColor: "transparent",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "primary.main",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "primary.main",
                },
              },
            }}
          >
            <CustomGrid
              columns={columns}
              data={gridData}
              maxHeight="600px"
              minHeight="300px"
              emptyStateMessage="No patient types available. Please ensure PIC data is loaded."
              showDensityControls={false}
              density="medium"
              rowKeyField="id"
            />
          </Box>

          {/* Summary Information */}
          <Box sx={{ p: 1, backgroundColor: "grey.50", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total patient types: {pic.length} | Configured aliases: {activeAliasCount} | Active aliases: {gridData.filter((row) => row.hasAlias && row.rActiveYN === "Y").length}
            </Typography>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChargeAliasesComponent;
