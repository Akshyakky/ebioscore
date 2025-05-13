import React, { useMemo } from "react";
import { Select, MenuItem, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { IndentDetailDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import { DisabledVisible, DisabledVisibleOutlined } from "@mui/icons-material";

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

  const renderDisabledNumberField = (item: IndentDetailDto, rowIndex: number, field: keyof IndentDetailDto) => (
    <TextField size="small" type="number" value={item[field] ?? 0} disabled sx={{ width: "100%" }} inputProps={{ style: { textAlign: "right" } }} />
  );

  const renderSelect = (
    item: IndentDetailDto,
    rowIndex: number,
    field: keyof IndentDetailDto,
    options: { value: string; label: string }[],
    type: "package" | "supplier" = "package"
  ) => (
    <Select
      size="small"
      value={type === "package" ? item.ppkgID || "" : item.supplierID || ""}
      onChange={(e) => {
        const value = e.target.value;
        const selectedOption = options.find((opt) => opt.value === value);

        if (type === "package") {
          handleCellValueChange(rowIndex, "ppkgID", selectedOption?.value || "");
          handleCellValueChange(rowIndex, "ppkgName", selectedOption?.label || "");
        } else if (type === "supplier") {
          handleCellValueChange(rowIndex, "supplierID", selectedOption?.value || "");
          handleCellValueChange(rowIndex, "supplierName", selectedOption?.label || "");
        }
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
      {
        key: "supplierName",
        header: "Supplier Name",
        visible: true,
        width: 150,
        minWidth: 150,
        render: (item: IndentDetailDto, rowIndex: number) => renderSelect(item, rowIndex, "supplierName", supplierOptions, "supplier"),
      },
      { key: "productName", header: "Product Name", visible: true, width: 180, minWidth: 180 },
      { key: "hsnCode", header: "HSN Code", visible: true, width: 100, minWidth: 100 },
      { key: "location", header: "Location", visible: true, width: 120, minWidth: 120 },
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
        width: 110,
        minWidth: 110,
        render: (item: IndentDetailDto, rowIndex: number) => renderDisabledNumberField(item, rowIndex, "netValue"),
      },
      {
        key: "requiredUnitQty",
        header: "Units/Package",
        visible: true,
        width: 100,
        minWidth: 100,
        render: (item: IndentDetailDto, rowIndex: number) => renderNumberField(item, rowIndex, "requiredUnitQty"),
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
            value={item.pUnitID || ""}
            onChange={(e) => {
              const unitValue = e.target.value;
              const unit = productOptions.find((opt) => opt.value === unitValue);
              if (unit) {
                handleCellValueChange(rowIndex, "pUnitID", unit.value);
                handleCellValueChange(rowIndex, "pUnitName", unit.label);
              }
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
        render: (item: IndentDetailDto, rowIndex: number) => renderSelect(item, rowIndex, "ppkgID", packageOptions, "package"),
      },
      { key: "groupName", header: "Group Name", visible: true, width: 120, minWidth: 120 },
      { key: "maxLevelUnits", header: "Maximum Level Units", visible: true, width: 150, minWidth: 150 },
      { key: "minLevelUnits", header: "Minimum Level Units", visible: true, width: 150, minWidth: 150 },
      { key: "stockLevel", header: "Stock Level", visible: true, width: 100, minWidth: 100 },
      { key: "baseUnit", header: "Base Unit", visible: true, width: 100, minWidth: 100 },
      { key: "leadTime", header: "Lead Time", visible: true, width: 100, minWidth: 100 },
      { key: "qoh", header: "QOH [Units]", visible: true, width: 120, minWidth: 120 },
      { key: "averageDemand", header: "Average Demand", visible: true, width: 130, minWidth: 130 },
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
