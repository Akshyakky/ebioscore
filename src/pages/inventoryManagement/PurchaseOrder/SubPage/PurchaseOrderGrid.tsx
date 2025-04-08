import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

interface PurchaseOrderGridProps {
  selectedProduct?: ProductListDto;
}

interface GridRowData extends ProductListDto {
  requiredPack: number;
  requiredUnitQty: number;
  packPrice: number;
  disc: number;
  discPercentage: number;
  itemTotal: number;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ selectedProduct }) => {
  const [gridData, setGridData] = useState<GridRowData[]>([]);

  useEffect(() => {
    if (selectedProduct) {
      // Check if product already exists in the grid
      const productExists = gridData.some((item) => item.productID === selectedProduct.productID);

      if (!productExists) {
        // Add new product to the grid data
        const newRow: GridRowData = {
          ...selectedProduct,
          requiredPack: 1,
          requiredUnitQty: selectedProduct.unitQuantity || 0,
          packPrice: selectedProduct.packPrice || 0,
          disc: 0,
          discPercentage: 0,
          itemTotal: selectedProduct.packPrice || 0,
        };

        setGridData((prevData) => [...prevData, newRow]);
      }
    }
  }, [selectedProduct]);

  const handleDeleteRow = (productId: number) => {
    setGridData((prevData) => prevData.filter((item) => item.productID !== productId));
  };

  return (
    <Paper sx={{ mt: 2 }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">QOH[Units]</TableCell>
              <TableCell align="right">Required Pack</TableCell>
              <TableCell align="right">Required Unit Qty</TableCell>
              <TableCell align="right">Units/Pack</TableCell>
              <TableCell align="right">Pack Price</TableCell>
              <TableCell align="right">Selling Price</TableCell>
              <TableCell align="right">Disc</TableCell>
              <TableCell align="right">Disc[%]</TableCell>
              <TableCell align="right">Tax[%]</TableCell>
              <TableCell align="right">ROL</TableCell>
              <TableCell align="right">Item Total</TableCell>
              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gridData.map((row, index) => (
              <TableRow key={row.productID}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell align="right">{row.stockQty || 0}</TableCell>
                <TableCell align="right">{row.requiredPack}</TableCell>
                <TableCell align="right">{row.requiredUnitQty}</TableCell>
                <TableCell align="right">{row.unitQuantity || 0}</TableCell>
                <TableCell align="right">{row.packPrice || 0}</TableCell>
                <TableCell align="right">{row.sellingPrice || 0}</TableCell>
                <TableCell align="right">{row.disc}</TableCell>
                <TableCell align="right">{row.discPercentage}</TableCell>
                <TableCell align="right">{row.taxPercentage || 0}</TableCell>
                <TableCell align="right">{row.reorderLevel || 0}</TableCell>
                <TableCell align="right">{row.itemTotal}</TableCell>
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
