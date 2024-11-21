import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { GroupedCustomGrid } from "./ServiceChargeGrid";
import { BChargeDetailsDto, ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";

interface DropdownOption {
  value: string;
  label: string;
}
interface GridData {
  picName: string;
  backgroundColor?: string;
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
}
export const ChargeConfigDetails: React.FC<ChargeConfigDetailsProps> = ({
  formData,
  handleSwitchChange,
  selectedPicIds = [],
  handlePicChange,
  selectedWardCategoryIds = [],
  handleWardCategoryChange,
  dropdownValues = { pic: [], bedCategory: [] },
  isSubmitted,
  setFormData,
  selectedTab,
  setSelectedTab,
  columns,
  aliasData,
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [gridData, setGridData] = useState<GridData[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const resetFields = useCallback(() => {
    setFormData((prev: ChargeDetailsDto) => ({
      ...prev,
      chargeInfo: {
        ...prev.chargeInfo,
        chValue: "",
      },
      chargeDetails: [],
    }));
    handlePicChange({ target: { value: [] } });
    handleWardCategoryChange({ target: { value: [] } });
    setGridData([]);
    setShowGrid(false);
  }, [handlePicChange, handleWardCategoryChange, setFormData]);

  const createChargeDetail = useCallback(
    (picValue: string, categoryValue: string): BChargeDetailsDto => ({
      chDetID: 0,
      chargeID: formData.chargeInfo.chargeID,
      pTypeID: parseInt(picValue),
      wCatID: parseInt(categoryValue),
      dcValue: 0, // Default value
      hcValue: 0, // Default value
      chValue: 0, // Default value, computed as dcValue + hcValue
      chargeStatus: "A",
      compID: formData.chargeInfo.compID,
      compCode: formData.chargeInfo.compCode,
      compName: formData.chargeInfo.compName,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    }),
    [formData.chargeInfo]
  );

  const handleChargeDetailsChange = useCallback(
    (chargeDetails: BChargeDetailsDto[]) => {
      if (isUpdating) return;

      setIsUpdating(true);
      setFormData((prev: ChargeDetailsDto) => {
        const uniqueChargeDetails = chargeDetails.reduce((acc: BChargeDetailsDto[], curr) => {
          const existingIndex = acc.findIndex((detail) => detail.pTypeID === curr.pTypeID && detail.wCatID === curr.wCatID);

          if (existingIndex === -1) {
            acc.push(curr);
          } else {
            acc[existingIndex] = curr;
          }
          return acc;
        }, []);

        return {
          ...prev,
          chargeDetails: uniqueChargeDetails.map((detail) => ({
            ...detail,
            dcValue: Number(detail.dcValue || 0),
            hcValue: Number(detail.hcValue || 0),
            chValue: Number(detail.dcValue || 0) + Number(detail.hcValue || 0),
          })),
        };
      });
      setIsUpdating(false);
    },
    [setFormData, isUpdating]
  );

  const handleGridSelectionChange = (row: any) => {
    console.log("Selected row:", row);
  };

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

  const colorMapping: Record<string, string> = {
    "BPL CARD": "#f8d7da",
    DISASTER: "#d1ecf1",
    ESIS: "#d4edda",
  };

  const calculateAdjustedAmount = (baseAmount: number, adjustment: string, value: number) => {
    switch (adjustment) {
      case "Increase":
        return baseAmount + value;
      case "Decrease":
        return Math.max(baseAmount - value, 0);
      default:
        return value;
    }
  };

  const serviceChargesData: GridData[] = useMemo(() => {
    const pics = dropdownValues.pic || [];
    const bedCategories = dropdownValues.bedCategory || [];

    const picsToUse = selectedPicIds.length > 0 ? pics.filter((pic) => selectedPicIds.includes(pic.value)) : pics;
    const categoriesToUse = selectedWardCategoryIds.length > 0 ? bedCategories.filter((cat) => selectedWardCategoryIds.includes(cat.value)) : bedCategories;

    return picsToUse.map((picItem) => {
      const baseData: GridData = {
        picName: picItem.label,
        backgroundColor: colorMapping[picItem.label] || "#ffffff",
      };

      categoriesToUse.forEach((category) => {
        const categoryLabel = category.label;
        baseData[`${categoryLabel}_drAmt`] = 0;
        baseData[`${categoryLabel}_hospAmt`] = 0;
        baseData[`${categoryLabel}_totAmt`] = 0;
      });

      return baseData;
    });
  }, [dropdownValues.pic, dropdownValues.bedCategory, selectedPicIds, selectedWardCategoryIds, colorMapping]);

  const selectedWardCategories = useMemo(() => {
    const bedCategories = dropdownValues.bedCategory || [];

    return selectedWardCategoryIds.length > 0 ? bedCategories.filter((category) => selectedWardCategoryIds.includes(category.value)) : bedCategories;
  }, [dropdownValues.bedCategory, selectedWardCategoryIds]);

  const selectedPicValues = useMemo(() => {
    const pics = dropdownValues.pic || [];
    return selectedPicIds.length > 0 ? pics.filter((pic) => selectedPicIds.includes(pic.value)) : pics;
  }, [dropdownValues.pic, selectedPicIds]);

  const handleViewButtonClick = useCallback(() => {
    if (!showGrid) {
      const initialGridData = serviceChargesData.map((row) => {
        const picValue = dropdownValues.pic?.find((p) => p.label === row.picName)?.value || "0";

        return {
          ...row,
          chargeDetails: selectedWardCategories.map((category) => createChargeDetail(picValue, category.value)),
        };
      });

      setGridData(initialGridData);
      setShowGrid(true);
    }
  }, [showGrid, serviceChargesData, selectedWardCategories, dropdownValues.pic, createChargeDetail]);

  useEffect(() => {
    if (showGrid) {
      setGridData([...gridData]);
    }
  }, [showGrid, gridData]);

  const handleApplyButtonClick = useCallback(() => {
    if (isUpdating) return;

    const amount = parseFloat(formData.chargeInfo.chValue) || 0;
    const adjustmentType = formData.chargeInfo.adjustmentType;
    const amountType = formData.chargeInfo.amountType;
    const isPercentage = formData.chargeInfo.percentage === "Y";

    const updatedData = gridData.map((row) => {
      const updatedRow = { ...row };
      const rowChargeDetails: BChargeDetailsDto[] = [];
      const picValue = dropdownValues.pic?.find((p) => p.label === row.picName)?.value || "0";

      selectedWardCategories.forEach((category) => {
        const categoryLabel = category.label;
        const currentDrAmt = parseFloat(updatedRow[`${categoryLabel}_drAmt`] || "0");
        const currentHospAmt = parseFloat(updatedRow[`${categoryLabel}_hospAmt`] || "0");
        const adjustmentValue = isPercentage ? (amount / 100) * (currentDrAmt + currentHospAmt) : amount;

        let newDrAmt = currentDrAmt;
        let newHospAmt = currentHospAmt;

        if (amountType === "Both" || amountType === "Dr Amt") {
          newDrAmt = calculateAdjustedAmount(currentDrAmt, adjustmentType, adjustmentValue);
        }
        if (amountType === "Both" || amountType === "Hosp Amt") {
          newHospAmt = calculateAdjustedAmount(currentHospAmt, adjustmentType, adjustmentValue);
        }

        updatedRow[`${categoryLabel}_drAmt`] = newDrAmt;
        updatedRow[`${categoryLabel}_hospAmt`] = newHospAmt;
        updatedRow[`${categoryLabel}_totAmt`] = newDrAmt + newHospAmt;

        rowChargeDetails.push({
          ...createChargeDetail(picValue, category.value),
          dcValue: newDrAmt,
          hcValue: newHospAmt,
          chValue: newDrAmt + newHospAmt,
        });
      });

      updatedRow.chargeDetails = rowChargeDetails;
      return updatedRow;
    });

    setGridData(updatedData);
    const allChargeDetails = updatedData.flatMap((row) => row.chargeDetails || []);
    handleChargeDetailsChange(allChargeDetails);
    resetFields();
  }, [formData.chargeInfo, gridData, selectedWardCategories, dropdownValues.pic, handleChargeDetailsChange, createChargeDetail, isUpdating, resetFields]);

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
              options={dropdownValues.pic ?? []} // Use empty array if `dropdownValues.pic` is undefined
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
              options={dropdownValues.bedCategory ?? []} // Use empty array if `dropdownValues.bedCategory` is undefined
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
                onChange={handleSwitchChange("percentage")}
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
              name=""
              label=""
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
              name=""
              label=""
              value={formData.chargeInfo.amountType || "Hosp Amt"}
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

            <Grid sx={{ mt: 2 }}>
              <Box display="flex" gap={2}>
                <CustomButton variant="contained" color="secondary" onClick={handleViewButtonClick} text="View" size="small" />
                <CustomButton variant="contained" color="primary" onClick={handleApplyButtonClick} text="Apply" size="small" />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid sx={{ mt: 2 }}>
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
      </Grid>

      {showGrid && selectedTab === "ServiceCharges" && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Service Charges
          </Typography>
          <GroupedCustomGrid
            selectedWardCategories={selectedWardCategories}
            data={gridData}
            onSelectionChange={handleGridSelectionChange}
            selectedPicValues={selectedPicValues}
            onChargeDetailsChange={handleChargeDetailsChange}
            createChargeDetail={createChargeDetail}
          />
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

      <Grid container spacing={2}>
        <FormField
          type="switch"
          label="Hide"
          checked={formData.chargeInfo.rActiveYN === "Y"}
          onChange={handleSwitchChange("rActiveYN")}
          name="rActiveYN"
          ControlID="rActiveYN"
          color="primary"
          value={formData.chargeInfo.rActiveYN === "N"}
        />
        <FormField
          type="switch"
          label="Is Bed Service"
          checked={formData.chargeInfo.isBedService === "Y"}
          onChange={handleSwitchChange("isBedService")}
          name="isBedService"
          ControlID="isBedService"
          color="primary"
          value={formData.chargeInfo.isBedService === "Y"}
        />
      </Grid>
    </>
  );
};

export default ChargeConfigDetails;
