// src/components/InventoryManagement/IndentProductGrid.tsx
import React, { useMemo } from "react";
import { Select, MenuItem, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { IndentDetailDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import CustomGrid from "@/components/CustomGrid/CustomGrid";

interface Props {
  gridData: IndentDetailDto[];
  handleCellValueChange: (rowIndex: number, field: keyof IndentDetailDto, value: any) => void;
  handleDelete: (item: IndentDetailDto) => void;
  packageOptions: { value: string; label: string }[];
  supplierOptions: { value: string; label: string }[];
  productOptions: { value: string; label: string }[];
}

const IndentProductGrid: React.FC<Props> = ({ gridData, handleCellValueChange, handleDelete, packageOptions, supplierOptions, productOptions }) => {
  const renderNumberField = (item: IndentDetailDto, rowIndex: number, field: keyof IndentDetailDto) => (
    <TextField
      size="small"
      type="number"
      value={item[field] || ""}
      onChange={(e) => handleCellValueChange(rowIndex, field, parseFloat(e.target.value) || 0)}
      sx={{ width: "100%" }}
      inputProps={{ style: { textAlign: "right" } }}
    />
  );

  const renderSelect = (
    item: IndentDetailDto,
    rowIndex: number,
    field: keyof IndentDetailDto,
    options: { value: string; label: string }[],
    additionalHandler?: (value: string) => void
  ) => (
    <Select
      size="small"
      value={item[field] || ""}
      onChange={(e) => {
        const value = e.target.value;
        handleCellValueChange(rowIndex, field, value);
        if (additionalHandler) additionalHandler(value as string);
      }}
      sx={{ width: "100%" }}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) return "Select an Option";
        const selectedStr = String(selected);
        const opt = options.find((o) => String(o.value) === selectedStr);
        return opt ? opt.label : selectedStr;
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );

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
        render: (item: IndentDetailDto, rowIndex: number) => renderNumberField(item, rowIndex, "requiredQty"),
      },
      {
        key: "netValue",
        header: "Net Value",
        visible: true,
        width: 100,
        minWidth: 100,
        render: (item: IndentDetailDto, rowIndex: number) => renderNumberField(item, rowIndex, "netValue"),
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
                handleCellValueChange(rowIndex, "pUnitID", unit.value);
                handleCellValueChange(rowIndex, "pUnitName", unit.label);
              }
              handleCellValueChange(rowIndex, "units", unitValue);
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
        render: (item: IndentDetailDto, rowIndex: number) => renderSelect(item, rowIndex, "package", packageOptions),
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
        render: (item: IndentDetailDto, rowIndex: number) => renderSelect(item, rowIndex, "supplierName", supplierOptions),
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
    [packageOptions, supplierOptions, productOptions, handleCellValueChange, handleDelete]
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
