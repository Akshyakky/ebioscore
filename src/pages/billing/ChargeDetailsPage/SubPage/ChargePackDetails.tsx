import AdvancedGrid, { ColumnConfig } from "@/components/AdvancedGrid/AdvancedGrid";
import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { BChargeDetailsDto, BChargePackDto } from "@/interfaces/Billing/BChargeDetails";
import { chargeDetailsService } from "@/services/BillingServices/chargeDetailsService";
import { useAppSelector } from "@/store/hooks";
import { showAlert } from "@/utils/Common/showAlert";
import { Box, Grid, SelectChangeEvent, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import React from "react";

interface ChargePackageDetailsProps {
  chargeDetails?: BChargeDetailsDto[];
  chargeBreakYN?: string;
  onChargePackagesChange: (packages: BChargePackDto[]) => void;
  onGridDataChange: (data: any[]) => void;
  selectedChargeCode?: string;
  onRowUpdate: (updatedRow: any) => void;
}

interface GridData {
  serviceName: string;
  [key: string]: any;
}

const ChargePackageDetails: React.FC<ChargePackageDetailsProps> = ({ chargeBreakYN, onChargePackagesChange, onGridDataChange }) => {
  const [gridData, setGridData] = useState<GridData[]>([]);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [isPercentage, setIsPercentage] = useState<boolean>(true);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease" | "none">("none");
  const dropdownValues = useDropdownValues(["bedCategory", "pic"]);
  const [adjustmentScope, setAdjustmentScope] = useState<"both" | "drAmt" | "hospAmt">("both");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<{ value: string; label: string }[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await chargeDetailsService.getAll();
        const options = response.data.map((item: any) => ({
          value: item.chargeCode,
          label: `${item.chargeCode} - ${item.chargeDesc}`,
        }));
        setServiceOptions(options);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();

    const baseColumns: ColumnConfig[] = [
      { key: "serviceName", label: "Service Name", editable: false },
      { key: "serviceCode", label: "Service Code", editable: false },
    ];

    if (dropdownValues.bedCategory) {
      dropdownValues.bedCategory.forEach((category) => {
        baseColumns.push(
          {
            key: `${category.label}_drAmt`,
            label: `${category.label} Dr Amt`,
            editable: true,
            type: "number",
            input: true,
          },
          {
            key: `${category.label}_hospAmt`,
            label: `${category.label} Hosp Amt`,
            editable: true,
            type: "number",
            input: true,
          },
          {
            key: `${category.label}_totAmt`,
            label: `${category.label} Total`,
            editable: false,
          }
        );
      });
    }

    setColumns(baseColumns);
  }, [dropdownValues.bedCategory]);

  const fetchServiceDetails = async (serviceCode: string): Promise<GridData | null> => {
    try {
      const response = await chargeDetailsService.getAllChargeDetails();
      if (!response.success || !response.data) return null;
      const matchingCharge = response.data.find((charge: any) => charge.chargeInfo?.chargeCode === serviceCode);
      if (!matchingCharge?.chargeInfo?.chargeID) return null;
      const chargeDetailsResponse = await chargeDetailsService.getAllByID(matchingCharge.chargeInfo.chargeID);
      if (!chargeDetailsResponse.success || !chargeDetailsResponse.data) return null;
      const details = chargeDetailsResponse.data.chargeDetails;
      const serviceName = serviceOptions.find((opt) => opt.value === serviceCode)?.label || serviceCode;
      const rowData: GridData = {
        serviceName: serviceName.split(" - ")[1] || serviceName,
        serviceCode: serviceCode,
      };

      dropdownValues.bedCategory?.forEach((category) => {
        const detail = details.find((d: any) => d.wCatID === Number(category.value));
        rowData[`${category.label}_drAmt`] = detail?.dcValue?.toFixed(2) || "0.00";
        rowData[`${category.label}_hospAmt`] = detail?.hcValue?.toFixed(2) || "0.00";
        rowData[`${category.label}_totAmt`] = ((detail?.dcValue || 0) + (detail?.hcValue || 0)).toFixed(2);
      });
      return rowData;
    } catch (error) {
      console.error("Error fetching service details:", error);
      return null;
    }
  };

  const handleServiceChange = async (event: SelectChangeEvent<string[]>) => {
    const values = Array.isArray(event.target.value) ? event.target.value : [event.target.value];
    setSelectedServices(values);
    const newGridData: GridData[] = [];
    for (const service of values) {
      const serviceCode = service.split(" - ")[0];
      const serviceDetails = await fetchServiceDetails(serviceCode);
      if (serviceDetails) {
        newGridData.push(serviceDetails);
      }
    }
    setGridData(newGridData);
    onGridDataChange(newGridData);
  };

  const handleGridDataChange = useCallback(
    async (updatedData: GridData[]) => {
      const sanitizedRows = await Promise.all(
        updatedData.map(async (row) => {
          let chargeID = parseInt(row.serviceCode, 10);
          if (!chargeID || isNaN(chargeID)) {
            try {
              const response = await chargeDetailsService.getAllChargeDetails();
              const matchingCharge = response?.data?.find((charge: any) => charge.chargeInfo?.chargeCode === row.serviceCode);
              chargeID = matchingCharge?.chargeInfo?.chargeID || NaN;
            } catch (error) {
              console.error(`Error fetching chargeID for serviceCode: ${row.serviceCode}`, error);
              chargeID = NaN;
            }
          }

          if (!chargeID || isNaN(chargeID)) {
            console.error("Charge ID missing for row:", row);
            showAlert("Error", `Charge ID is missing for row: ${JSON.stringify(row)}`, "error");
            return null;
          }

          const sanitizedRow: GridData = {
            ...row,
            chargeID,
          };

          dropdownValues.bedCategory?.forEach((category) => {
            const drAmtKey = `${category.label}_drAmt`;
            const hospAmtKey = `${category.label}_hospAmt`;
            const totAmtKey = `${category.label}_totAmt`;

            const drAmt = parseFloat(row[drAmtKey] || "0.00");
            const hospAmt = parseFloat(row[hospAmtKey] || "0.00");

            sanitizedRow[drAmtKey] = drAmt.toFixed(2);
            sanitizedRow[hospAmtKey] = hospAmt.toFixed(2);
            sanitizedRow[totAmtKey] = (drAmt + hospAmt).toFixed(2);
          });

          return sanitizedRow;
        })
      );

      const validRows = sanitizedRows.filter((row) => row !== null);

      if (validRows.length !== sanitizedRows.length) {
        console.error("Some rows have missing chargeID.");
        showAlert("Error", "Some rows have missing chargeID. Please fix the errors before saving.", "error");
        return;
      }

      const packages: BChargePackDto[] = validRows.map((row) => ({
        pkDetID: row.pkDetID || 0,
        chDetID: row.chargeID,
        chargeID: row.chargeID,
        chargeRevise: "defaultRevise",
        chargeStatus: "Y",
        DcValue: parseFloat(row[`${dropdownValues.bedCategory?.[0]?.label}_drAmt`] || "0"),
        hcValue: parseFloat(row[`${dropdownValues.bedCategory?.[0]?.label}_hospAmt`] || "0"),
        chValue: parseFloat(row[`${dropdownValues.bedCategory?.[0]?.label}_totAmt`] || "0"),
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        transferYN: "Y",
        rActiveYN: "Y",
        rNotes: "",
      }));

      onChargePackagesChange(packages);
      setGridData(validRows);
      onGridDataChange(validRows);
    },
    [dropdownValues.bedCategory, onGridDataChange, onChargePackagesChange]
  );

  const applyAdjustmentToGrid = (
    adjustmentType: "increase" | "decrease" | "none",
    adjustmentValue: number,
    isPercentage: boolean,
    adjustmentScope: "both" | "drAmt" | "hospAmt"
  ): GridData[] => {
    return gridData.map((row) => {
      const updatedRow = { ...row };
      dropdownValues.bedCategory?.forEach((category) => {
        const drAmtKey = `${category.label}_drAmt`;
        const hospAmtKey = `${category.label}_hospAmt`;
        const totAmtKey = `${category.label}_totAmt`;
        const drAmt = parseFloat(row[drAmtKey] || "0");
        const hospAmt = parseFloat(row[hospAmtKey] || "0");
        let updatedDrAmt = drAmt;
        let updatedHospAmt = hospAmt;
        const multiplier = adjustmentType === "increase" ? 1 : adjustmentType === "decrease" ? -1 : 0;
        if (adjustmentScope === "both" || adjustmentScope === "drAmt") {
          const adjustment = isPercentage ? (drAmt * adjustmentValue) / 100 : adjustmentValue;
          updatedDrAmt += multiplier * adjustment;
        }
        if (adjustmentScope === "both" || adjustmentScope === "hospAmt") {
          const adjustment = isPercentage ? (hospAmt * adjustmentValue) / 100 : adjustmentValue;
          updatedHospAmt += multiplier * adjustment;
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

  const applyAdjustment = useCallback(() => {
    if (!adjustmentAmount || adjustmentType === "none") {
      showAlert("Warning", "Please provide a valid adjustment type and amount", "warning");
      return;
    }
    if (!gridData.length) {
      showAlert("Warning", "No data available to apply adjustment", "warning");
      return;
    }

    const updatedGridData = applyAdjustmentToGrid(adjustmentType, adjustmentAmount, isPercentage, adjustmentScope);
    setGridData(updatedGridData);
    onGridDataChange(updatedGridData);
    showAlert("Success", "Adjustment applied successfully", "success");
  }, [adjustmentAmount, adjustmentType, isPercentage, adjustmentScope, gridData, dropdownValues.bedCategory, onGridDataChange]);
  if (chargeBreakYN !== "Y") {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Package Details</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormField
            type="multiselect"
            label="Service List"
            name="serviceList"
            ControlID="serviceList"
            value={selectedServices}
            onChange={handleServiceChange}
            options={serviceOptions}
            defaultText="Select services to view details"
          />
        </Grid>

        {gridData.length > 0 && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box
              sx={{
                border: "1px solidrgb(10, 9, 9)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <Typography variant="h6" sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                Service Details
              </Typography>
              <AdvancedGrid data={gridData} columns={columns} onRowChange={handleGridDataChange} />
            </Box>
          </Grid>
        )}

        <Grid container spacing={2} sx={{ mt: 2, px: 2 }}>
          <FormField
            type="radio"
            label="Adjustment Type"
            name="adjustmentType"
            ControlID="adjustmentType"
            value={adjustmentType}
            inline
            onChange={(e: any) => setAdjustmentType(e.target.value)}
            options={[
              { value: "none", label: "None" },
              { value: "increase", label: "Increase" },
              { value: "decrease", label: "Decrease" },
            ]}
          />
          <FormField
            type="radio"
            label="Scope"
            name="adjustmentScope"
            ControlID="adjustmentScope"
            inline
            value={adjustmentScope}
            onChange={(e: SelectChangeEvent) => setAdjustmentScope(e.target.value as any)}
            options={[
              { value: "both", label: "Both" },
              { value: "drAmt", label: "Doctor Amount" },
              { value: "hospAmt", label: "Hospital Amount" },
            ]}
          />

          <Grid item sx={{ mt: 3 }}>
            <Typography variant="body1">Percentage</Typography>
          </Grid>
          <Grid item sx={{ mt: 3 }}>
            <FormField
              type="switch"
              label=""
              checked={isPercentage}
              onChange={(e) => setIsPercentage(e.target.checked)}
              name="percentageMode"
              ControlID="percentageMode"
              color="primary"
              value={isPercentage}
            />
          </Grid>
          <Grid item sx={{ mt: 3, ml: -2 }}>
            <Typography variant="body1">Amount</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormField
              type="number"
              label=""
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
              placeholder="0"
              name="adjustmentAmount"
              ControlID="adjustmentAmount"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <CustomButton variant="contained" color="primary" onClick={applyAdjustment} text="Apply Adjustment" />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChargePackageDetails;
