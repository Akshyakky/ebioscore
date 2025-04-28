import React, { useState, useCallback } from "react";
import { TextField, Select, MenuItem, useTheme, Box } from "@mui/material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { IndentDetailDto } from "@/interfaces/InventoryManagement/IndentProductDto";

interface Props {
  data: IndentDetailDto[];
  unitOptions: { value: number; label: string }[];
  packageOptions: { value: number; label: string }[];
  onChange: (updatedList: IndentDetailDto[]) => void;
}

const IndentProductGrid: React.FC<Props> = ({ data, unitOptions, packageOptions, onChange }) => {
  const [gridData, setGridData] = useState<IndentDetailDto[]>(data);
  const theme = useTheme();

  const handleInputChange = useCallback(
    (index: number, field: keyof IndentDetailDto, value: any) => {
      const updatedList = [...gridData];
      updatedList[index] = { ...updatedList[index], [field]: value };
      setGridData(updatedList);
      onChange(updatedList);
    },
    [gridData, onChange]
  );

  const columns: Column<IndentDetailDto>[] = [
    { key: "productName", header: "Product Name", visible: true },
    { key: "hsnCode", header: "HSN Code", visible: true },
    { key: "manufacturerName", header: "Manufacturer", visible: true },
    {
      key: "requiredQty",
      header: "Required Qty",
      visible: true,
      render: (row, rowIndex) => (
        <TextField fullWidth value={row.requiredQty ?? ""} size="small" type="number" onChange={(e) => handleInputChange(rowIndex, "requiredQty", parseFloat(e.target.value))} />
      ),
    },
    {
      key: "requiredUnitQty",
      header: "Net Value",
      visible: true,
      render: (row, rowIndex) => (
        <TextField
          fullWidth
          value={row.requiredUnitQty ?? ""}
          size="small"
          type="number"
          onChange={(e) => handleInputChange(rowIndex, "requiredUnitQty", parseFloat(e.target.value))}
        />
      ),
    },
    {
      key: "unitPack",
      header: "Units/Package",
      visible: true,
      render: (row, rowIndex) => (
        <TextField fullWidth value={row.unitPack ?? ""} size="small" type="number" onChange={(e) => handleInputChange(rowIndex, "unitPack", parseInt(e.target.value))} />
      ),
    },
    {
      key: "pUnitID",
      header: "Units",
      visible: true,
      render: (row, rowIndex) => (
        <Select fullWidth value={row.pUnitID ?? ""} size="small" onChange={(e) => handleInputChange(rowIndex, "pUnitID", e.target.value)}>
          {unitOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      key: "ppkgID",
      header: "Package",
      visible: true,
      render: (row, rowIndex) => (
        <Select fullWidth value={row.ppkgID ?? ""} size="small" onChange={(e) => handleInputChange(rowIndex, "ppkgID", e.target.value)}>
          {packageOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    { key: "pGrpName", header: "Group Name", visible: true },
    { key: "stockLevel", header: "Stock Level", visible: true },
    { key: "baseUnit", header: "Base Unit", visible: true },
    { key: "leadTime", header: "Lead Time", visible: true },
    { key: "qoh", header: "QOH [Units]", visible: true },
    { key: "average", header: "Average", visible: true },
  ];

  return (
    <Box sx={{ overflowX: "auto", width: "100%", backgroundColor: theme.palette.background.paper, borderRadius: 2, boxShadow: 1 }}>
      <CustomGrid columns={columns} data={gridData} pagination={true} />
    </Box>
  );
};

export default IndentProductGrid;
