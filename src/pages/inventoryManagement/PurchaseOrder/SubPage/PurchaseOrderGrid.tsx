import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormField from "@/components/FormField/FormField";

interface PurchaseOrderGridProps {
  poDetailDto?: PurchaseOrderDetailDto;
}

interface GridRowData extends PurchaseOrderDetailDto {
  itemTotal: number;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ poDetailDto }) => {
  const [gridData, setGridData] = useState<GridRowData[]>([]);

  useEffect(() => {
    if (poDetailDto) {
      const productExists = gridData.some((item) => item.productID === poDetailDto.productID);
      if (!productExists) {
        const itemTotal = (poDetailDto.requiredPack || 0) * (poDetailDto.packPrice || 0) - (poDetailDto.disc || 0);

        const newRow: GridRowData = {
          ...poDetailDto,
          itemTotal,
        };

        setGridData((prevData) => [...prevData, newRow]);
      }
    }
  }, [poDetailDto]);

  const handleDeleteRow = (productId: number) => {
    setGridData((prevData) => prevData.filter((item) => item.productID !== productId));
  };

  const handleCellChange = (value: number, rowIndex: number, field: keyof GridRowData) => {
    const updatedData = [...gridData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: value,
    };

    // Update itemTotal if any related field is updated
    const { requiredPack = 0, packPrice = 0, disc = 0 } = updatedData[rowIndex];
    updatedData[rowIndex].itemTotal = requiredPack * packPrice - disc;

    setGridData(updatedData);
  };

  return (
    <Paper sx={{ mt: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell align="right">QOH[Units]</TableCell>
              <TableCell align="right">Required Pack</TableCell>
              <TableCell align="right">Required Unit Qty</TableCell>
              <TableCell align="right">Units/Pack</TableCell>
              <TableCell align="right">Pack Price</TableCell>
              <TableCell align="right">Selling Price</TableCell>
              <TableCell align="right">Disc</TableCell>
              <TableCell align="right">Disc[%]</TableCell>
              <TableCell align="right">GST[%]</TableCell>
              <TableCell align="right">ROL</TableCell>
              <TableCell align="right">Item Total</TableCell>
              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gridData.map((row: GridRowData, index) => (
              <TableRow key={row.productID}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.manufacturerName}</TableCell>
                <TableCell align="right">{row.stock || 0}</TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.requiredPack || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "requiredPack")}
                    label=""
                    name="requiredPack"
                    ControlID={`requiredPack_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.requiredUnitQty}</TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.unitQuantity || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "unitQuantity")}
                    label=""
                    name=""
                    ControlID={`unitQuantity_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.packPrice || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "packPrice")}
                    label=""
                    name="packPrice"
                    ControlID={`packPrice_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.sellingPrice || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "sellingPrice")}
                    label=""
                    name="sellingPrice"
                    ControlID={`sellingPrice_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.disc || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "disc")}
                    label=""
                    name="disc"
                    ControlID={`disc_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.discPercentage || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discPercentage")}
                    label=""
                    name="discPercentage"
                    ControlID={`discPercentage_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.taxPercentage || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "taxPercentage")}
                    label=""
                    name="taxPercentage"
                    ControlID={`taxPercentage_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.reorderLevel || 0}</TableCell>

                <TableCell align="right">{row.itemTotal.toFixed(2)}</TableCell>

                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDeleteRow(row.productID)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PurchaseOrderGrid;
