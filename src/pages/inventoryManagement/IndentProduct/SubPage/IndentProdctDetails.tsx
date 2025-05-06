// src/components/InventoryManagement/IndentProductGrid.tsx
import React, { useEffect, useMemo } from "react";
import { Select, MenuItem, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { IndentDetailDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import CustomGrid from "@/components/CustomGrid/CustomGrid";

import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface Props {
  gridData: IndentDetailDto[];
  handleCellValueChange: (rowIndex: number, field: keyof IndentDetailDto, value: any) => void;
  handleDelete: (item: IndentDetailDto) => void;
  packageOptions: { value: string; label: string }[];
  supplierOptions: { value: string; label: string }[];
  productOptions: { value: string; label: string }[];
}

const IndentProductGrid: React.FC<Props> = ({ gridData, handleCellValueChange, handleDelete, packageOptions, supplierOptions, productOptions }) => {
  // const dropdownValues = useDropdownValues(["productUnit"]);

  // const productUnitOptions = useMemo(() => {
  //   debugger;
  //   return (
  //     dropdownValues?.productUnit?.map((option) => ({
  //       label: option.label,
  //       value: option.value.toString(),
  //     })) || []
  //   );
  // }, [dropdownValues?.productUnit]);

  const columns = useMemo(
    () => [
      { key: "location", header: "Location", visible: true, width: 120, minWidth: 120 },
      { key: "productName", header: "Product Name", visible: true, width: 180, minWidth: 180 },
      { key: "hsnCode", header: "HSN Code", visible: true, width: 100, minWidth: 100 },
      { key: "manufacturerName", header: "Manufacturer", visible: true, width: 150, minWidth: 150 },
      {
        key: "requiredQty",
        header: "Required Qty",
        visible: true,
        width: 110,
        minWidth: 110,
        render: (item: IndentDetailDto, rowIndex: number) => (
          <TextField
            size="small"
            type="number"
            value={item.requiredQty || ""}
            onChange={(e) => handleCellValueChange(rowIndex, "requiredQty", parseFloat(e.target.value) || 0)}
            sx={{ width: "100%" }}
            inputProps={{ style: { textAlign: "right" } }}
          />
        ),
      },
      {
        key: "netValue",
        header: "Net Value",
        visible: true,
        width: 100,
        minWidth: 100,
        render: (item: IndentDetailDto, rowIndex: number) => (
          <TextField
            size="small"
            type="number"
            value={item.netValue || ""}
            onChange={(e) => handleCellValueChange(rowIndex, "netValue", parseFloat(e.target.value) || 0)}
            sx={{ width: "100%" }}
            inputProps={{ style: { textAlign: "right" } }}
          />
        ),
      },

      {
        key: "units",
        header: "Units",
        visible: true,
        width: 150,
        minWidth: 150,
        render: (item: IndentDetailDto, rowIndex: number) => (
          <Select
            size="small"
            value={item.units || ""}
            onChange={(e) => {
              const unitValue = e.target.value;
              const unit = productOptions.find((opt) => opt.value === unitValue);
              if (unit) {
                handleCellValueChange(rowIndex, "pUnitID", unit.value); // Save the unit ID
                handleCellValueChange(rowIndex, "pUnitName", unit.label); // Save the unit label
              }
              handleCellValueChange(rowIndex, "units", unitValue); // Update the selected unit
            }}
            sx={{ width: "100%" }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) return "Select an Option";
              const selectedStr = String(selected);
              const opt = productOptions.find((o) => String(o.value) === selectedStr);
              return opt ? opt.label : selectedStr;
            }}
          >
            {productOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ),
      },
      {
        key: "package",
        header: "Package",
        visible: true,
        width: 150,
        minWidth: 150,
        render: (item: IndentDetailDto, rowIndex: number) => (
          <Select
            size="small"
            value={item.package || ""}
            onChange={(e) => handleCellValueChange(rowIndex, "package", e.target.value)}
            sx={{ width: "100%" }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) return "Select an Option";
              const selectedStr = String(selected);
              const opt = packageOptions.find((o) => String(o.value) === selectedStr);
              return opt ? opt.label : selectedStr;
            }}
          >
            {packageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ),
      },
      { key: "groupName", header: "Group Name", visible: true, width: 120, minWidth: 120 },
      { key: "maxLevelUnits", header: "Maximum Level Units", visible: true, width: 150, minWidth: 150 },
      { key: "minLevelUnits", header: "Minimum Level Units", visible: true, width: 150, minWidth: 150 },
      { key: "stockLevel", header: "Stock Level", visible: true, width: 100, minWidth: 100 },
      { key: "baseUnit", header: "Base Unit", visible: true, width: 100, minWidth: 100 },
      { key: "leadTime", header: "Lead Time", visible: true, width: 100, minWidth: 100 },
      { key: "qoh", header: "QOH [Units]", visible: true, width: 120, minWidth: 120 },
      { key: "average", header: "Average", visible: true, width: 100, minWidth: 100 },
      { key: "averageDemand", header: "Average Demand", visible: true, width: 130, minWidth: 130 },

      {
        key: "supplierName",
        header: "Supplier Name",
        visible: true,
        width: 150,
        minWidth: 150,
        render: (item: IndentDetailDto, rowIndex: number) => (
          <Select
            size="small"
            value={item.supplierName || ""}
            onChange={(e) => handleCellValueChange(rowIndex, "supplierName", e.target.value)}
            sx={{ width: "100%" }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) return "Select an Option";
              const selectedStr = String(selected);
              const opt = supplierOptions.find((o) => String(o.value) === selectedStr);
              return opt ? opt.label : selectedStr;
            }}
          >
            {supplierOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        ),
      },

      { key: "roq", header: "ROQ", visible: true, width: 80, minWidth: 80 },
      {
        key: "delete",
        header: "Delete",
        visible: true,
        width: 70,
        minWidth: 70,
        render: (item: IndentDetailDto) => (
          <IconButton size="small" color="error" onClick={() => handleDelete(item)}>
            <DeleteIcon />
          </IconButton>
        ),
      },
    ],
    [packageOptions, supplierOptions, handleCellValueChange, handleDelete, productOptions]
  );

  return (
    <CustomGrid
      columns={columns}
      data={gridData}
      pagination
      maxHeight="400px"
      emptyStateMessage="No products added yet. Use the search above to add products."
      gridStyle={{ minWidth: "100%" }}
    />
  );
};

export default IndentProductGrid;
