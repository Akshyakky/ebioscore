import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Chip, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { useFieldArray, Control, useWatch } from "react-hook-form";

interface ChargeAliasesComponentProps {
  control: Control<any>;
  pic: { value: string; label: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdateFunction?: (updateFn: () => void) => void;
}

interface AliasGridRow {
  id: string;
  pTypeID: number;
  picName: string;
  chargeDesc: string;
  chargeDescLang: string;
  rActiveYN: "Y" | "N";
  hasAlias: boolean;
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({ control, pic, expanded, onToggleExpand, onUpdateFunction }) => {
  const [aliasGridData, setAliasGridData] = useState<AliasGridRow[]>([]);
  const [gridDataUpdated, setGridDataUpdated] = useState(false);

  const aliasesArray = useFieldArray({
    control,
    name: "ChargeAliases",
  });

  const watchedAliases =
    useWatch({
      control,
      name: "ChargeAliases",
    }) || [];

  const initializeAliasGridData = useCallback(() => {
    if (!pic || pic.length === 0) return;
    const gridRows: AliasGridRow[] = pic.map((picOption) => {
      const pTypeID = Number(picOption.value);
      const existingAlias = watchedAliases.find((alias: any) => Number(alias.pTypeID) === pTypeID);
      return {
        id: `pic-${pTypeID}`,
        pTypeID: pTypeID,
        picName: picOption.label,
        chargeDesc: existingAlias?.chargeDesc || "",
        chargeDescLang: existingAlias?.chargeDescLang || "",
        rActiveYN: existingAlias?.rActiveYN || "Y",
        hasAlias: !!(existingAlias?.chargeDesc?.trim() || existingAlias?.chargeDescLang?.trim()),
      };
    });
    setAliasGridData(gridRows);
  }, [pic, watchedAliases]);

  useEffect(() => {
    initializeAliasGridData();
  }, [initializeAliasGridData]);

  const updateChargeAliasesFromGrid = useCallback(() => {
    const chargeAliasesArray = [];
    for (const row of aliasGridData) {
      const hasContent = row.chargeDesc?.trim() || row.chargeDescLang?.trim();
      if (hasContent) {
        chargeAliasesArray.push({
          chAliasID: 0,
          chargeID: 0,
          pTypeID: row.pTypeID,
          chargeDesc: row.chargeDesc || "",
          chargeDescLang: row.chargeDescLang || "",
          rActiveYN: row.rActiveYN || "Y",
        });
      }
    }
    aliasesArray.replace(chargeAliasesArray);
  }, [aliasGridData, aliasesArray]);

  useEffect(() => {
    if (gridDataUpdated) {
      updateChargeAliasesFromGrid();
      setGridDataUpdated(false);
    }
  }, [gridDataUpdated, updateChargeAliasesFromGrid]);

  const handleFieldChange = useCallback(
    (rowIndex: number, fieldName: string, value: any) => {
      const updatedGridData = [...aliasGridData];
      const row = updatedGridData[rowIndex];
      if (!row) return;
      updatedGridData[rowIndex] = {
        ...row,
        [fieldName]: value,
        hasAlias: (fieldName === "chargeDesc" ? !!value?.trim() : !!row.chargeDesc?.trim()) || (fieldName === "chargeDescLang" ? !!value?.trim() : !!row.chargeDescLang?.trim()),
      };
      setAliasGridData(updatedGridData);
      setGridDataUpdated(true);
    },
    [aliasGridData]
  );

  useEffect(() => {
    if (onUpdateFunction) {
      onUpdateFunction(updateChargeAliasesFromGrid);
    }
  }, [updateChargeAliasesFromGrid, onUpdateFunction]);

  const activeAliasCount = useMemo(() => {
    return aliasGridData.filter((row) => row.hasAlias && row.rActiveYN === "Y").length;
  }, [aliasGridData]);

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
        render: (item, rowIndex) => (
          <Box sx={{ py: 1 }}>
            <EnhancedFormField
              name={`alias_chargeDesc_${item.pTypeID}`}
              control={control}
              type="text"
              label=""
              size="small"
              variant="standard"
              fullWidth
              placeholder="Enter alias description (max 250 characters)"
              helperText=""
              defaultValue={item.chargeDesc}
              inputProps={{
                maxLength: 250,
              }}
              onChange={(value) => handleFieldChange(rowIndex, "chargeDesc", value)}
            />
          </Box>
        ),
      },
      {
        key: "chargeDescLang",
        header: "Local Language Description",
        visible: true,
        width: 300,
        minWidth: 250,
        align: "left",
        render: (item, rowIndex) => (
          <Box sx={{ py: 1 }}>
            <EnhancedFormField
              name={`alias_chargeDescLang_${item.pTypeID}`}
              control={control}
              type="text"
              label=""
              size="small"
              variant="standard"
              fullWidth
              placeholder="Enter local language description (max 250 characters)"
              helperText=""
              defaultValue={item.chargeDescLang}
              inputProps={{
                maxLength: 250,
              }}
              onChange={(value) => handleFieldChange(rowIndex, "chargeDescLang", value)}
            />
          </Box>
        ),
      },
      {
        key: "rActiveYN",
        header: "Active",
        visible: true,
        width: 100,
        align: "center",
        render: (item, rowIndex) => (
          <Box sx={{ py: 1, display: "flex", justifyContent: "center" }}>
            <EnhancedFormField
              name={`alias_rActiveYN_${item.pTypeID}`}
              control={control}
              type="switch"
              label=""
              size="small"
              helperText=""
              defaultValue={item.rActiveYN === "Y"}
              onChange={(value) => handleFieldChange(rowIndex, "rActiveYN", value ? "Y" : "N")}
            />
          </Box>
        ),
      },
    ],
    [control, handleFieldChange]
  );

  return (
    <Accordion expanded={expanded} onChange={onToggleExpand}>
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
              data={aliasGridData}
              maxHeight="600px"
              minHeight="300px"
              emptyStateMessage="No patient types available. Please ensure PIC data is loaded."
              showDensityControls={false}
              density="medium"
              rowKeyField="id"
              pagination={false}
              selectable={false}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ChargeAliasesComponent;
