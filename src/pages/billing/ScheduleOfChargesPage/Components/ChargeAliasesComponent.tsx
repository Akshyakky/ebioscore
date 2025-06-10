import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
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
  onUpdateFunction?: (updateFn: () => void) => void;
}

interface AliasGridRow {
  id: string;
  pTypeID: number;
  picName: string;
  chargeDesc: string;
  hasAlias: boolean;
}

const ChargeAliasesComponent: React.FC<ChargeAliasesComponentProps> = ({ control, pic, expanded, onToggleExpand, onUpdateFunction }) => {
  const [aliasGridData, setAliasGridData] = useState<AliasGridRow[]>([]);
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
      const existingAlias = watchedAliases.find((alias: BChargeAliasDto) => Number(alias.pTypeID) === pTypeID);
      return {
        id: `pic-${pTypeID}`,
        pTypeID: pTypeID,
        picName: picOption.label,
        chargeDesc: existingAlias?.chargeDesc || "",
        hasAlias: Boolean(existingAlias?.chargeDesc),
      };
    });
    setAliasGridData(gridRows);
  }, [pic, watchedAliases]);

  const updateChargeAliasesFromGrid = useCallback(() => {
    const chargeAliasesArray: BChargeAliasDto[] = [];
    for (const row of aliasGridData) {
      const hasContent = Boolean(row.chargeDesc);
      if (hasContent) {
        chargeAliasesArray.push({
          chAliasID: 0,
          chargeID: 0,
          pTypeID: row.pTypeID,
          chargeDesc: row.chargeDesc,
          chargeDescLang: row.chargeDesc,
          rActiveYN: "Y",
          rTransferYN: "N",
          rNotes: "",
        });
      }
    }
    aliasesArray.replace(chargeAliasesArray);
  }, [aliasGridData, aliasesArray]);

  const handleFieldChange = useCallback(
    (rowIndex: number, valueOrEvent: any) => {
      let actualValue = "";
      if (typeof valueOrEvent === "string") {
        actualValue = valueOrEvent;
      } else if (valueOrEvent && valueOrEvent.target && typeof valueOrEvent.target.value === "string") {
        actualValue = valueOrEvent.target.value;
      } else if (valueOrEvent && typeof valueOrEvent.value === "string") {
        actualValue = valueOrEvent.value;
      }
      setAliasGridData((prevData) => {
        const updatedGridData = [...prevData];
        const row = updatedGridData[rowIndex];
        if (!row) return prevData;
        const updatedRow = {
          ...row,
          chargeDesc: actualValue,
          hasAlias: Boolean(actualValue),
        };
        updatedGridData[rowIndex] = updatedRow;
        const chargeAliasesArray: BChargeAliasDto[] = [];
        for (const gridRow of updatedGridData) {
          const hasContent = Boolean(gridRow.chargeDesc);
          if (hasContent) {
            chargeAliasesArray.push({
              chAliasID: 0,
              chargeID: 0,
              pTypeID: gridRow.pTypeID,
              chargeDesc: gridRow.chargeDesc,
              chargeDescLang: gridRow.chargeDesc,
              rActiveYN: "Y",
              rTransferYN: "N",
              rNotes: "",
            });
          }
        }
        aliasesArray.replace(chargeAliasesArray);
        return updatedGridData;
      });
    },
    [aliasesArray]
  );

  useEffect(() => {
    initializeAliasGridData();
  }, [initializeAliasGridData]);

  useEffect(() => {
    if (onUpdateFunction) {
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
            <EnhancedFormField
              name={`alias_chargeDesc_${item.pTypeID}`}
              control={control}
              type="text"
              label=""
              size="small"
              variant="standard"
              fullWidth
              placeholder="Enter alias name (max 250 characters)"
              helperText=""
              defaultValue={item.chargeDesc}
              onChange={(value) => handleFieldChange(rowIndex, value)}
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
