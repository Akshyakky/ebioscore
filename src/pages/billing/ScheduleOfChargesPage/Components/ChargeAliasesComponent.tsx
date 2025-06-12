import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { BChargeAliasDto } from "@/interfaces/Billing/ChargeDto";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Control, useFieldArray } from "react-hook-form";

interface ChargeAliasesComponentProps {
  control: Control<any>;
  pic: { value: string; label: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
  chargeAliases: BChargeAliasDto[];
  onUpdateFunction?: (updateFn: () => void) => void;
}

interface AliasGridRow {
  id: string;
  pTypeID: number;
  picName: string;
  chargeDesc: string;
  hasAlias: boolean;
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({ control, pic, expanded, onToggleExpand, chargeAliases, onUpdateFunction }) => {
  const [aliasGridData, setAliasGridData] = useState<AliasGridRow[]>([]);
  const isInitializedRef = useRef(false);
  const previousChargeAliasesRef = useRef<BChargeAliasDto[]>([]);
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
      return !prevAlias || alias.pTypeID !== prevAlias.pTypeID || alias.chargeDesc !== prevAlias.chargeDesc;
    });
  }, [chargeAliases]);

  const initializeAliasGridData = useCallback(() => {
    if (!pic || pic.length === 0) return;
    const gridRows: AliasGridRow[] = pic.map((picOption) => {
      const pTypeID = Number(picOption.value);
      const existingAlias = chargeAliases.find((alias: BChargeAliasDto) => Number(alias.pTypeID) === pTypeID);
      return {
        id: `pic-${pTypeID}`,
        pTypeID: pTypeID,
        picName: picOption.label,
        chargeDesc: existingAlias?.chargeDesc || "",
        hasAlias: Boolean(existingAlias?.chargeDesc),
      };
    });
    setAliasGridData(gridRows);
    previousChargeAliasesRef.current = [...chargeAliases];
    isInitializedRef.current = true;
  }, [pic, chargeAliases]);

  useEffect(() => {
    if (!isInitializedRef.current || hasChargeAliasesChanged) {
      initializeAliasGridData();
    }
  }, [initializeAliasGridData, hasChargeAliasesChanged]);

  const updateChargeAliasesFromGrid = useCallback(() => {
    const chargeAliasesArray: BChargeAliasDto[] = [];
    for (const row of aliasGridData) {
      const hasContent = Boolean(row.chargeDesc && row.chargeDesc.trim());
      if (hasContent) {
        const existingAlias = chargeAliases.find((alias: BChargeAliasDto) => Number(alias.pTypeID) === row.pTypeID);
        chargeAliasesArray.push({
          chAliasID: existingAlias?.chAliasID || existingAlias?.chaliasID || 0,
          chargeID: existingAlias?.chargeID || 0,
          pTypeID: row.pTypeID,
          chargeDesc: row.chargeDesc,
          chargeDescLang: row.chargeDesc,
          rActiveYN: "Y",
          rTransferYN: existingAlias?.rTransferYN || existingAlias?.transferYN || "N",
          rNotes: existingAlias?.rNotes || "",
        });
      }
    }
    aliasesArray.replace(chargeAliasesArray);
  }, [aliasGridData, aliasesArray, chargeAliases]);

  const handleFieldChange = useCallback(
    (rowIndex: number, newValue: string) => {
      setAliasGridData((prevData) => {
        const updatedGridData = [...prevData];
        const row = updatedGridData[rowIndex];
        if (!row) return prevData;
        if (row.chargeDesc === newValue) return prevData;
        updatedGridData[rowIndex] = {
          ...row,
          chargeDesc: newValue,
          hasAlias: Boolean(newValue && newValue.trim()),
        };
        return updatedGridData;
      });
    },
    [aliasesArray, chargeAliases]
  );

  useEffect(() => {
    if (onUpdateFunction && isInitializedRef.current) {
      onUpdateFunction(updateChargeAliasesFromGrid);
    }
  }, [updateChargeAliasesFromGrid, onUpdateFunction]);

  const activeAliasCount = useMemo(() => {
    return aliasGridData.filter((row) => row.hasAlias).length;
  }, [aliasGridData]);

  const columns: Column<AliasGridRow>[] = useMemo(
    () => [
      {
        key: "picName",
        header: "PIC Name",
        visible: true,
        width: 400,
        minWidth: 350,
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
        width: 400,
        minWidth: 350,
        align: "left",
        render: (item, rowIndex) => (
          <Box sx={{ py: 1 }}>
            <TextField
              size="small"
              variant="standard"
              fullWidth
              placeholder="Enter alias name (max 250 characters)"
              value={item.chargeDesc}
              onChange={(e) => handleFieldChange(rowIndex, e.target.value)}
              sx={{
                "& .MuiInput-underline:before": {
                  borderBottomColor: "transparent",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottomColor: "primary.main",
                },
                "& .MuiInput-underline:after": {
                  borderBottomColor: "primary.main",
                },
              }}
            />
          </Box>
        ),
      },
    ],
    [handleFieldChange]
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
