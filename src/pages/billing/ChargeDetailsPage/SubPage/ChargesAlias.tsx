import AdvancedGrid, { ColumnConfig } from "@/components/AdvancedGrid/AdvancedGrid";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import { BChargeDetailsDto, ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import { Box, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";

interface DropdownOption {
  value: string;
  label: string;
}
interface GridData {
  picName: string;
  [key: string]: any;
}
interface ChargeConfigDetailsProps {
  formData: ChargeDetailsDto;
  handleSwitchChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPicIds: string[];
  handlePicChange: (e: any) => void;
  selectedWardCategoryIds: string[];
  handleWardCategoryChange: (e: any) => void;
  dropdownValues: {
    pic?: DropdownOption[];
    bedCategory?: DropdownOption[];
  };
  isSubmitted: boolean;
  setFormData: (value: any) => void;
  selectedTab: "ServiceCharges" | "ServiceAlias";
  setSelectedTab: (value: "ServiceCharges" | "ServiceAlias") => void;
  columns: any[];
  aliasData: any[];
  editData?: ChargeDetailsDto;
  onGridDataChange: (updatedData: GridData[]) => void;
  gridData: GridData[];
  onRowSelect?: (rowIndex: number) => void;
}

export const ChargeConfigDetails: React.FC<ChargeConfigDetailsProps> = ({
  formData,
  selectedPicIds,
  handlePicChange,
  selectedWardCategoryIds,
  handleWardCategoryChange,
  dropdownValues,
  isSubmitted,
  setFormData,
  selectedTab,
  setSelectedTab,
  columns,
  aliasData,
  editData,
  onGridDataChange,
  gridData,
  onRowSelect,
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [, setGridData] = useState<GridData[]>([]);
  const [, setSelectedRowIndex] = useState<number | null>(null);

  const createChargeDetail = (pTypeID: string, wCatID: string): BChargeDetailsDto => ({
    chDetID: 0,
    chargeID: formData.chargeInfo.chargeID,
    pTypeID: parseInt(pTypeID, 10),
    wCatID: parseInt(wCatID, 10),
    dcValue: 0,
    hcValue: 0,
    chValue: 0,
    chargeStatus: "Y",
    compID: formData.chargeInfo.compID,
    compCode: formData.chargeInfo.compCode,
    compName: formData.chargeInfo.compName,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  });

  const groupedColumns: ColumnConfig[] = useMemo(() => {
    const baseColumns: ColumnConfig[] = [
      { key: "select", label: "Select", editable: false, input: false, type: "Radio" },
      { key: "picName", label: "PIC Name", group: "Details", editable: false, input: false },
    ];

    if (gridData.length === 0) {
      return baseColumns;
    }

    const dynamicColumns: ColumnConfig[] = Object.keys(gridData[0])
      .filter((key) => key !== "picName")
      .map((key) => {
        const [categoryName, subColumn] = key.split("_");
        return {
          key,
          label: subColumn ? subColumn.replace(/([A-Z])/g, " $1") : key,
          group: categoryName || "Default",
          editable: subColumn !== "totAmt",
          input: subColumn !== "totAmt",
          type: "number",
        };
      });

    return [...baseColumns, ...dynamicColumns];
  }, [gridData]);

  const handleRowSelection = useCallback(
    (rowIndex: number) => {
      setSelectedRowIndex(rowIndex);
      if (onRowSelect) {
        onRowSelect(rowIndex);
      }
    },
    [onRowSelect]
  );

  useEffect(() => {
    if (editData?.chargeDetails && dropdownValues.pic && dropdownValues.bedCategory) {
      const uniqueWardCatIds = [...new Set(editData.chargeDetails.map((d) => d.wCatID))];
      const uniquePicIds = [...new Set(editData.chargeDetails.map((d) => d.pTypeID))];
      if (selectedWardCategoryIds.length === 0) {
        handleWardCategoryChange({ target: { value: uniqueWardCatIds } } as any);
      }
      if (selectedPicIds.length === 0) {
        handlePicChange({ target: { value: uniquePicIds } } as any);
      }
      const groupedByPIC = editData.chargeDetails.reduce(
        (acc, detail) => {
          const picName = dropdownValues.pic?.find((p) => Number(p.value) === detail.pTypeID)?.label || "";

          if (!acc[picName]) {
            acc[picName] = {};
          }
          const wardCategory = dropdownValues.bedCategory?.find((cat) => Number(cat.value) === detail.wCatID);
          if (wardCategory) {
            const categoryLabel = wardCategory.label;
            const drAmt = detail.dcValue || 0;
            const hospAmt = detail.hcValue || 0;
            const totAmt = drAmt + hospAmt;
            acc[picName][`${categoryLabel}_drAmt`] = drAmt.toFixed(2);
            acc[picName][`${categoryLabel}_hospAmt`] = hospAmt.toFixed(2);
            acc[picName][`${categoryLabel}_totAmt`] = totAmt.toFixed(2);
          }
          return acc;
        },
        {} as Record<string, any>
      );

      const transformedData = Object.entries(groupedByPIC).map(([picName, values]) => ({
        picName,
        ...values,
      }));
      setGridData(transformedData);
      onGridDataChange(transformedData);
      setShowGrid(true);
      setSelectedTab("ServiceCharges");
      const updatedChargeDetails = editData.chargeDetails.map((detail) => ({
        ...detail,
        picName: dropdownValues.pic?.find((p) => Number(p.value) === detail.pTypeID)?.label || "",
        wardCategoryName: dropdownValues.bedCategory?.find((cat) => Number(cat.value) === detail.wCatID)?.label || "",
      }));
      setFormData((prev: any) => ({
        ...prev,
        chargeDetails: updatedChargeDetails,
      }));
    }
  }, [
    editData,
    dropdownValues.pic,
    dropdownValues.bedCategory,
    handlePicChange,
    handleWardCategoryChange,
    selectedWardCategoryIds.length,
    selectedPicIds.length,
    onGridDataChange,
    setFormData,
    setSelectedTab,
  ]);

  useEffect(() => {
    if (gridData && gridData.length > 0) {
      setShowGrid(true);
      setSelectedTab("ServiceCharges");
    } else {
      setShowGrid(false);
    }
  }, [gridData]);

  const handleGridDataChange = useCallback(
    (updatedData: GridData[]) => {
      const modifiedData = updatedData.map((row) => {
        const updatedRow = { ...row };
        dropdownValues.bedCategory
          ?.filter((cat) => selectedWardCategoryIds.includes(cat.value))
          .forEach((category) => {
            const drAmtKey = `${category.label}_drAmt`;
            const hospAmtKey = `${category.label}_hospAmt`;
            const totAmtKey = `${category.label}_totAmt`;
            const dcValue = parseFloat(updatedRow[drAmtKey] || "0");
            const hcValue = parseFloat(updatedRow[hospAmtKey] || "0");
            updatedRow[totAmtKey] = (dcValue + hcValue).toFixed(2);
          });
        return updatedRow;
      });
      const filteredData = modifiedData.filter((row) =>
        dropdownValues.bedCategory?.some((category) => {
          const drAmtKey = `${category.label}_drAmt`;
          const hospAmtKey = `${category.label}_hospAmt`;
          return row[drAmtKey] || row[hospAmtKey];
        })
      );
      onGridDataChange(filteredData);
      const updatedChargeDetails: BChargeDetailsDto[] = filteredData
        .flatMap((row) => {
          const picValue = dropdownValues.pic?.find((p) => p.label === row.picName)?.value || "0";
          return (
            dropdownValues.bedCategory
              ?.filter((cat) => selectedWardCategoryIds.includes(cat.value))
              .map((category) => {
                const drAmtKey = `${category.label}_drAmt`;
                const hospAmtKey = `${category.label}_hospAmt`;
                const totAmtKey = `${category.label}_totAmt`;
                const dcValue = parseFloat(row[drAmtKey] || "0");
                const hcValue = parseFloat(row[hospAmtKey] || "0");
                const chValue = parseFloat(row[totAmtKey] || "0");
                if (dcValue > 0 || hcValue > 0 || chValue > 0) {
                  return {
                    chDetID: 0,
                    chargeID: formData.chargeInfo.chargeID || 0,
                    pTypeID: parseInt(picValue, 10),
                    wCatID: parseInt(category.value, 10),
                    dcValue: dcValue || 0,
                    hcValue: hcValue || 0,
                    chValue: chValue || 0,
                    chargeStatus: "Y",
                    compID: formData.chargeInfo.compID || 0,
                    compCode: formData.chargeInfo.compCode || "",
                    compName: formData.chargeInfo.compName || "",
                    rActiveYN: "Y",
                    transferYN: "N",
                    rNotes: "",
                    chargeDesc: `ChargeCode_${formData.chargeInfo.chargeID}`,
                  } as BChargeDetailsDto;
                }
                return null;
              }) || []
          );
        })
        .filter((detail): detail is BChargeDetailsDto => detail !== null);
      setFormData((prev: ChargeDetailsDto) => ({
        ...prev,
        chargeDetails: updatedChargeDetails,
      }));
    },
    [dropdownValues, selectedWardCategoryIds, formData.chargeInfo, onGridDataChange, setFormData]
  );

  const handleViewButtonClick = useCallback(() => {
    const selectedPics = selectedPicIds.length > 0 ? selectedPicIds : dropdownValues.pic?.map((p) => p.value) || [];
    const selectedWardCategories = selectedWardCategoryIds.length > 0 ? selectedWardCategoryIds : dropdownValues.bedCategory?.map((cat) => cat.value) || [];
    const newGridData = selectedPics.map((picValue) => {
      const picName = dropdownValues.pic?.find((p) => p.value === picValue)?.label || "Unknown PIC";
      const rowData: GridData = { picName };
      selectedWardCategories.forEach((wardValue) => {
        const wardName = dropdownValues.bedCategory?.find((cat) => cat.value === wardValue)?.label || "Unknown Ward";
        const drAmtKey = `${wardName}_drAmt`;
        const hospAmtKey = `${wardName}_hospAmt`;
        const totAmtKey = `${wardName}_totAmt`;
        const existingRow = gridData.find((row) => row.picName === picName);
        rowData[drAmtKey] = existingRow?.[drAmtKey] || "0.00";
        rowData[hospAmtKey] = existingRow?.[hospAmtKey] || "0.00";
        rowData[totAmtKey] = existingRow?.[totAmtKey] || "0.00";
      });
      return rowData;
    });

    const mergedGridData = [...gridData];
    newGridData.forEach((newRow) => {
      const existingIndex = mergedGridData.findIndex((row) => row.picName === newRow.picName);
      if (existingIndex > -1) {
        mergedGridData[existingIndex] = { ...mergedGridData[existingIndex], ...newRow };
      } else {
        mergedGridData.push(newRow);
      }
    });

    onGridDataChange(mergedGridData);
    setShowGrid(true);
  }, [dropdownValues, selectedPicIds, selectedWardCategoryIds, gridData, onGridDataChange]);

  const applyAdjustmentToGrid = (adjustmentType: string, adjustmentValue: number, isPercentage: boolean, amountType: string): GridData[] => {
    return gridData.map((row) => {
      const updatedRow = { ...row };
      dropdownValues.bedCategory
        ?.filter((cat) => selectedWardCategoryIds.includes(cat.value))
        .forEach((category) => {
          const drAmtKey = `${category.label}_drAmt`;
          const hospAmtKey = `${category.label}_hospAmt`;
          const totAmtKey = `${category.label}_totAmt`;
          const drAmt = parseFloat(row[drAmtKey] || "0");
          const hospAmt = parseFloat(row[hospAmtKey] || "0");
          let updatedDrAmt = drAmt;
          let updatedHospAmt = hospAmt;
          if (adjustmentType === "Increase" || adjustmentType === "Decrease") {
            const multiplier = adjustmentType === "Increase" ? 1 : -1;
            if (amountType === "Dr Amt" || amountType === "Both") {
              const adjustment = isPercentage ? (drAmt * adjustmentValue) / 100 : adjustmentValue;
              updatedDrAmt += multiplier * adjustment;
            }
            if (amountType === "Hosp Amt" || amountType === "Both") {
              const adjustment = isPercentage ? (hospAmt * adjustmentValue) / 100 : adjustmentValue;
              updatedHospAmt += multiplier * adjustment;
            }
          } else if (adjustmentType === "None") {
            if (amountType === "Dr Amt" || amountType === "Both") {
              updatedDrAmt = isPercentage ? (drAmt * adjustmentValue) / 100 : adjustmentValue;
            }
            if (amountType === "Hosp Amt" || amountType === "Both") {
              updatedHospAmt = isPercentage ? (hospAmt * adjustmentValue) / 100 : adjustmentValue;
            }
          }
          updatedDrAmt = Math.max(0, updatedDrAmt);
          updatedHospAmt = Math.max(0, updatedHospAmt);
          updatedRow[drAmtKey] = updatedDrAmt.toFixed(2);
          updatedRow[hospAmtKey] = updatedHospAmt.toFixed(2);
          updatedRow[totAmtKey] = (updatedDrAmt + updatedHospAmt).toFixed(2);
        });

      return updatedRow;
    });
  };

  const handleApplyButtonClick = useCallback(() => {
    const adjustmentType = formData.chargeInfo.adjustmentType;
    const amountType = formData.chargeInfo.amountType;
    const isPercentage = formData.chargeInfo.percentage === "Y";
    const adjustmentValue = formData.chargeInfo.chValue ?? 0;
    const updatedGridData = applyAdjustmentToGrid(adjustmentType, adjustmentValue, isPercentage, amountType);
    setGridData(updatedGridData);
    onGridDataChange(updatedGridData);

    const updatedChargeDetails: BChargeDetailsDto[] = updatedGridData.flatMap((row) => {
      const picValue = dropdownValues.pic?.find((p) => p.label === row.picName)?.value || "0";
      return (
        dropdownValues.bedCategory
          ?.filter((cat) => selectedWardCategoryIds.includes(cat.value))
          .map((category) => {
            const drAmtKey = `${category.label}_drAmt`;
            const hospAmtKey = `${category.label}_hospAmt`;
            const totAmtKey = `${category.label}_totAmt`;
            return {
              ...createChargeDetail(picValue, category.value),
              dcValue: parseFloat(row[drAmtKey] || "0"),
              hcValue: parseFloat(row[hospAmtKey] || "0"),
              chValue: parseFloat(row[totAmtKey] || "0"),
            };
          }) || []
      );
    });
    setFormData((prev: ChargeDetailsDto) => ({
      ...prev,
      chargeDetails: updatedChargeDetails,
    }));
  }, [gridData, onGridDataChange, formData, dropdownValues, selectedWardCategoryIds, applyAdjustmentToGrid, setGridData, setFormData, formData.chargeInfo]);

  useEffect(() => {
    if (formData.chargeInfo.adjustmentType === "None" && formData.chargeInfo.amountType === "Both") {
      handleApplyButtonClick();
    }
  }, [formData, handleApplyButtonClick]);

  useEffect(() => {
    setFormData((prev: ChargeDetailsDto) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        percentage: prev.chargeInfo.percentage || "N",
        chValue: prev.chargeInfo.chValue || "0",
      },
    }));
  }, [setFormData]);

  const handleAmountChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const isPercentage = e.target.checked;
      const currentValue = formData.chargeInfo.chValue ?? 0;

      setFormData((prev: ChargeDetailsDto) => {
        return {
          ...prev,
          chargeInfo: {
            ...prev.chargeInfo,
            [field]: isPercentage ? "Y" : "N",
            chValue: currentValue,
          },
        };
      });
    },
    [formData.chargeInfo.chValue]
  );

  const adjustmentOptions = [
    { value: "None", label: "None" },
    { value: "Increase", label: "Increase" },
    { value: "Decrease", label: "Decrease" },
  ];

  const amountOptions = [
    { value: "Both", label: "Both" },
    { value: "Dr Amt", label: "Dr Amt" },
    { value: "Hosp Amt", label: "Hosp Amt" },
  ];

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <FormField
              type="multiselect"
              label="PIC"
              value={selectedPicIds}
              onChange={handlePicChange}
              name="pic"
              ControlID="pic"
              options={dropdownValues.pic ?? []}
              isMandatory
              isSubmitted={isSubmitted}
            />
            <FormField
              type="multiselect"
              label="Ward Category"
              value={selectedWardCategoryIds}
              onChange={handleWardCategoryChange}
              name="wardCategory"
              ControlID="wardCategory"
              options={dropdownValues.bedCategory ?? []}
              isMandatory
              isSubmitted={isSubmitted}
            />
            <Grid item sx={{ mt: 2 }}>
              <Typography variant="body1">Percentage</Typography>
            </Grid>
            <Grid item sx={{ mt: 2 }}>
              <FormField
                type="switch"
                label=""
                checked={formData.chargeInfo.percentage === "Y"}
                onChange={handleAmountChange("percentage")}
                name="percentage"
                ControlID="percentage"
                color="primary"
                value={formData.chargeInfo.percentage === "Y"}
              />
            </Grid>
            <Grid item sx={{ mt: 2, ml: -2 }}>
              <Typography variant="body1">Amount</Typography>
            </Grid>
            <FormField
              type="number"
              label=""
              value={formData.chargeInfo.chValue || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  chargeInfo: {
                    ...prev.chargeInfo,
                    chValue: e.target.value,
                  },
                }))
              }
              placeholder="0"
              name="chValue"
              ControlID="amount"
              size="small"
            />
            <FormField
              type="radio"
              name="adjustmentType"
              label="Adjustment Type"
              value={formData.chargeInfo.adjustmentType || "None"}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  chargeInfo: {
                    ...prev.chargeInfo,
                    adjustmentType: e.target.value,
                  },
                }))
              }
              options={adjustmentOptions}
              inline
              ControlID="adjustmentType"
            />
            <FormField
              type="radio"
              name="amountType"
              label="Amount Type"
              value={formData.chargeInfo.amountType || "Both"}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  chargeInfo: {
                    ...prev.chargeInfo,
                    amountType: e.target.value,
                  },
                }))
              }
              options={amountOptions}
              inline
              ControlID="amountType"
              sx={{ ml: 4 }}
            />
            <Grid item sx={{ mt: 2 }}>
              <Box display="flex" gap={2}>
                <CustomButton variant="contained" onClick={handleViewButtonClick} text="View" size="small" />
                <CustomButton variant="contained" onClick={handleApplyButtonClick} text="Apply" size="small" />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid spacing={2} sx={{ mt: 2 }}>
        <Box mb={2}>
          <CustomButton
            variant={selectedTab === "ServiceCharges" ? "contained" : "outlined"}
            color="primary"
            onClick={() => setSelectedTab("ServiceCharges")}
            text="Service Charges"
            sx={{ mr: 2 }}
          />
          <CustomButton variant={selectedTab === "ServiceAlias" ? "contained" : "outlined"} color="primary" onClick={() => setSelectedTab("ServiceAlias")} text="Service Alias" />
        </Box>

        <Box sx={{ width: "100%" }}>
          {selectedTab === "ServiceCharges" && showGrid && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Service Charges
              </Typography>
              <AdvancedGrid data={gridData} columns={groupedColumns} onRowChange={handleGridDataChange} maxHeight="500px" onRowSelect={handleRowSelection} />
            </Box>
          )}

          {selectedTab === "ServiceAlias" && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Service Alias
              </Typography>
              <CustomGrid columns={columns} data={aliasData} pagination={false} selectable={false} />
            </Box>
          )}
        </Box>
      </Grid>
    </>
  );
};

export default ChargeConfigDetails;
