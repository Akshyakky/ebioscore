import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface PurchaseOrderGridProps {
  poDetailDto?: PurchaseOrderDetailDto;
  handleProductsGrid: (data: any) => void;
}

interface GridRowData extends PurchaseOrderDetailDto {
  itemTotal: number;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ poDetailDto, handleProductsGrid }) => {
  const [gridData, setGridData] = useState<GridRowData[]>([]);
  const dropdownValues = useDropdownValues(["taxType"]);
  useEffect(() => {
    if (poDetailDto) {
      const productExists = gridData.some((item) => item.productID === poDetailDto.productID);
      if (!productExists) {
        const itemTotal = (poDetailDto.requiredPack || 0) * (poDetailDto.packPrice || 0) - (poDetailDto.discAmt || 0);

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
    const currentRow = { ...updatedData[rowIndex], [field]: value };

    const requiredPack = currentRow.requiredPack || 0;
    const packPrice = currentRow.packPrice || 0;
    const baseTotal = requiredPack * packPrice;

    if (field === "discAmt") {
      // If user entered discount amount, update percentage
      currentRow.discPercentageAmt = baseTotal ? (value / baseTotal) * 100 : 0;
    } else if (field === "discPercentageAmt") {
      // If user entered discount %, update discount amount
      currentRow.discAmt = baseTotal ? (baseTotal * value) / 100 : 0;
    }

    // Recalculate tax values
    const taxableAmt = baseTotal - (currentRow.discAmt || 0);
    const cgstTaxAmt = (taxableAmt * (currentRow.cgstPerValue || 0)) / 100;
    const sgstTaxAmt = (taxableAmt * (currentRow.sgstPerValue || 0)) / 100;

    // Update calculated fields
    currentRow.taxableAmt = taxableAmt;
    currentRow.cgstTaxAmt = cgstTaxAmt;
    currentRow.sgstTaxAmt = sgstTaxAmt;
    currentRow.itemTotal = taxableAmt + cgstTaxAmt + sgstTaxAmt;

    updatedData[rowIndex] = currentRow;
    setGridData(updatedData);
  };

  useEffect(() => {
    handleProductsGrid(gridData);
  }, [gridData]);
  console.log("row.cgstPerValue Data", poDetailDto);
  return (
    <Paper sx={{ mt: 2 }}>
      <TableContainer sx={{ minHeight: 300 }}>
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
                    value={row.discAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discAmt")}
                    label=""
                    name="discAmt"
                    ControlID={`discAmt_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.discPercentageAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discPercentageAmt")}
                    label=""
                    name="discPercentageAmt"
                    ControlID={`discPercentageAmt_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="select"
                    value={dropdownValues.taxType.find((tax) => Number(tax.label) === Number(row.cgstPerValue))?.value || ""}
                    onChange={(e) => {
                      const selectedTax = dropdownValues.taxType.find((tax) => Number(tax.value) === Number(e.target.value));
                      const selectedRate = Number(selectedTax?.label || 0);

                      handleCellChange(selectedRate, index, "cgstPerValue");
                    }}
                    options={dropdownValues.taxType}
                    label=""
                    name="gstPercent"
                    ControlID={`gstPercent_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.rOL || 0}</TableCell>

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
