import React, { useMemo, useState } from "react";
import { Grid, Typography, Box } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { GroupedCustomGrid } from "./ServiceChargeGrid";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";

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
    pic: DropdownOption[];
    bedCategory: DropdownOption[];
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
  selectedPicIds,
  handlePicChange,
  selectedWardCategoryIds,
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

  const colorMapping: Record<string, string> = {
    "BPL CARD": "#f8d7da",
    DISASTER: "#d1ecf1",
    ESIS: "#d4edda",
  };

  const serviceChargesData: GridData[] = useMemo(() => {
    return (dropdownValues.pic || [])
      .filter((picItem) => selectedPicIds.includes(picItem.value))
      .map((picItem) => {
        const baseData: GridData = {
          picName: picItem.label,
          backgroundColor: colorMapping[picItem.label] || "#ffffff",
        };

        (selectedWardCategoryIds || []).forEach((id) => {
          const category = dropdownValues.bedCategory?.find((cat) => cat.value === id);
          const categoryLabel = category ? category.label : `Category ${id}`;
          baseData[`${categoryLabel}_drAmt`] = 0;
          baseData[`${categoryLabel}_hospAmt`] = 0;
          baseData[`${categoryLabel}_totAmt`] = 0;
        });

        return baseData;
      });
  }, [dropdownValues.pic, selectedPicIds, selectedWardCategoryIds, dropdownValues.bedCategory, colorMapping]);

  const selectedWardCategories = useMemo(
    () => (dropdownValues.bedCategory || []).filter((category) => selectedWardCategoryIds.includes(category.value)),
    [dropdownValues.bedCategory, selectedWardCategoryIds]
  );

  const handleGridSelectionChange = (row: any) => {
    console.log("Selected row:", row);
  };

  const handleViewButtonClick = () => {
    if (selectedPicIds.length > 0 && selectedWardCategoryIds.length > 0) {
      setShowGrid(true);
    } else {
      alert("Please select both PIC Name and Ward Category before viewing.");
    }
  };

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
              options={dropdownValues.pic || []}
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
              options={dropdownValues.bedCategory || []}
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

            <Grid item sx={{ mt: 2 }}>
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
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ mt: 2 }}>
        <CustomButton variant="contained" color="secondary" onClick={handleViewButtonClick} text="View" />
      </Grid>

      <Grid item xs={12} sx={{ mt: 2 }}>
        <Box display="flex" justifyContent="flex-start" mb={2}>
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
          <GroupedCustomGrid selectedWardCategories={selectedWardCategories} data={serviceChargesData} onSelectionChange={handleGridSelectionChange} />
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
          checked={formData.chargeInfo.rActiveYN === "N"}
          onChange={(e) => handleSwitchChange("rActiveYN")(e)}
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
