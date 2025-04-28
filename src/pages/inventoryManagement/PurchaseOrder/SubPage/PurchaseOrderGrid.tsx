import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowData, PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";

interface PurchaseOrderGridProps {
  poDetailDto?: PurchaseOrderDetailDto;
  handleProductsGrid: (data: GridRowData[]) => void;
  initialGridData?: GridRowData[];
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ poDetailDto, handleProductsGrid, initialGridData = [] }) => {
  const [gridData, setGridData] = useState<GridRowData[]>([]);
  const dropdownValues = useDropdownValues(["taxType"]);
  useEffect(() => {
    console.log("Grid component received new props or state:", {
      poDetailDto,
      currentGridData: gridData,
    });
  }, [poDetailDto, gridData]);

  useEffect(() => {
    if (initialGridData && initialGridData.length > 0) {
      console.log("Updating grid data from initialGridData:", initialGridData);
      setGridData(initialGridData);
    }
  }, [initialGridData]);

  useEffect(() => {
    if (poDetailDto && poDetailDto.productID) {
      const productExists = gridData.some((item) => item.productID === poDetailDto.productID);
      if (!productExists) {
        const unitPack = poDetailDto.unitPack || 1;
        const requiredPack = poDetailDto.requiredPack || 1;
        const packPrice = poDetailDto.packPrice || 0;
        const discAmt = poDetailDto.discAmt || 0;

        const requiredUnitQty = requiredPack * unitPack;

        const itemTotal = packPrice * requiredPack - discAmt;

        const totalPrice = packPrice * requiredPack;
        const discPercentageAmt = totalPrice > 0 ? (discAmt / totalPrice) * 100 : 0;

        const cgstPerValue = poDetailDto.cgstPerValue || 0;
        const sgstPerValue = poDetailDto.sgstPerValue || 0;
        const taxableAmount = totalPrice - discAmt;
        const cgstTaxAmt = (taxableAmount * cgstPerValue) / 100;
        const sgstTaxAmt = (taxableAmount * sgstPerValue) / 100;

        const newRow: GridRowData = {
          ...poDetailDto,
          requiredUnitQty,
          requiredPack,
          itemTotal,
          discPercentageAmt,
          cgstTaxAmt,
          sgstTaxAmt,
          taxableAmt: taxableAmount,
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
    const currentRow = { ...updatedData[rowIndex] };
    console.log("Current Row", currentRow);
    if (field === "discPercentageAmt" && value > 100) {
      showAlert("error", "Discount percentage cannot exceed 100%", "error");
      value = 0;
      return;
    } else if (field === "discAmt") {
      const totalPackPrice = (currentRow.packPrice || 0) * (currentRow.requiredPack || 0);
      if (value > totalPackPrice) {
        showAlert("error", "Discount amount cannot exceed pack price", "error");
        value = 0;
        return;
      }
    }
    currentRow[field] = value;
    const requiredPack = currentRow.requiredPack || 0;
    const unitPack = currentRow.unitPack || 1;
    const packPrice = currentRow.packPrice || 0;

    currentRow.requiredUnitQty = requiredPack * unitPack;

    const totalPrice = packPrice * requiredPack;

    if (field === "discPercentageAmt") {
      currentRow.discAmt = (totalPrice * value) / 100;
    } else if (field === "discAmt") {
      currentRow.discPercentageAmt = totalPrice > 0 ? (value / totalPrice) * 100 : 0;
    }

    if (field === "gstPerValue") {
      currentRow.cgstPerValue = value / 2;
      currentRow.sgstPerValue = value / 2;
    }

    const discAmt = currentRow.discAmt || 0;
    const taxableAmount = totalPrice - discAmt;

    currentRow.taxableAmt = taxableAmount;
    currentRow.cgstTaxAmt = (totalPrice * (currentRow.cgstPerValue || 0)) / 100;
    currentRow.sgstTaxAmt = (totalPrice * (currentRow.sgstPerValue || 0)) / 100;

    const gstTaxAmt = (totalPrice * (currentRow.gstPerValue || 0)) / 100;
    currentRow.itemTotal = totalPrice - discAmt + gstTaxAmt;
    updatedData[rowIndex] = currentRow;

    setGridData(updatedData);

    handleProductsGrid(updatedData);
  };

  useEffect(() => {
    handleProductsGrid(gridData);
  }, [gridData, handleProductsGrid]);

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

                <TableCell align="right">{row.requiredUnitQty || 0}</TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.unitPack || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "unitPack")}
                    label=""
                    name="unitPack"
                    ControlID={`unitPack_${row.productID}`}
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
                    value={dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(row.gstPerValue))?.value || ""}
                    onChange={(e) => {
                      const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.value) === Number(e.target.value));
                      const selectedRate = Number(selectedTax?.label || 0);

                      handleCellChange(selectedRate, index, "gstPerValue");
                    }}
                    options={dropdownValues.taxType || []}
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
