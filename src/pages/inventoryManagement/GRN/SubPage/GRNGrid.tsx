import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { AppDispatch, RootState } from "@/store";
import { showAlert } from "@/utils/Common/showAlert";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { DeleteIcon } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const GRNGrid: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const grnDetailData = useSelector((state: RootState) => state.grn.grnDetailData) ?? [];
  const dropdownValues = useDropdownValues(["taxType"]);
  const handleDeleteRow = async (productId: number, grnDetID: number) => {
    const confirmDelete = await showAlert("Confirm Delete", "Are you sure you want to delete this item?", "warning", true);
    if (!confirmDelete) {
      return;
    }
  };
  const handleCellChange = (value: number, rowIndex: number, field: keyof PurchaseOrderDetailDto) => {};
  const renderEditableNumberField = (row: GRNDetailDto, field: string, index: number) => (
    <FormField
      type="number"
      value={row[field] || 0}
      onChange={(e) => handleCellChange(Number(e.target.value), index, field)}
      label=""
      name={field}
      disabled={false}
      ControlID={`${field}_${index}`}
    />
  );
  const renderEditableTextField = (row: GRNDetailDto, field: string, index: number) => (
    <FormField
      type="text"
      value={row[field] || 0}
      onChange={(e) => handleCellChange(Number(e.target.value), index, field)}
      label=""
      name={field}
      disabled={false}
      ControlID={`${field}_${index}`}
    />
  );
  const renderEditableDateField = (row: GRNDetailDto, field: string, index: number) => (
    <FormField
      type="date"
      value={row[field] || 0}
      onChange={(e) => handleCellChange(Number(e.target.value), index, field)}
      label=""
      name={field}
      disabled={false}
      ControlID={`${field}_${row.productID}`}
    />
  );
  const tableHeaderNames = [
    "#",
    "Product",
    "Required Pack",
    "Received Pack",
    "Units/Pack",
    "Received Qty",
    "Free Items",
    "UOM",
    "Serial No.",
    "Batch No.",
    "Reference No.",
    "Expiry Date",
    "Selling Price",
    "Pack Price",
    "GST[%]",
    "Disc[%]",
    "Tax after Disc[%]",
    "Inc. Tax",
    "GST Amt",
    "CGST%",
    "CGST Tax Amt",
    "SGST%",
    "SGST Tax Amt",
    "Value",
    "Manufacturer",
    "Past Received Pack",
    "Disc",
    "Unit Price",
    "Selling Unit Price",
    "Delete",
  ];
  return (
    <Paper sx={{ mt: 2, overflowX: "auto" }}>
      <Box sx={{ minWidth: 1200 }}>
        <TableContainer sx={{ minHeight: 300, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableHeaderNames.map((header) => (
                  <TableCell align="center">{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {grnDetailData
                .filter((row) => row.rActiveYN !== "N")
                .map((row: GRNDetailDto, index) => (
                  <TableRow key={row.productID}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{0.0}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "recvdQty", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "pUnitsPerPack", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "_recievedQty", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "freeItems", index)}
                    </TableCell>
                    <TableCell>{row.pUnitName}</TableCell>
                    <TableCell>{row._serialNo}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableTextField(row, "batchNo", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableTextField(row, "refNo", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableDateField(row, "expiryDate", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "sellUnitPrice", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "unitPrice", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        type="select"
                        value={dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(row.tax))?.value || ""}
                        onChange={(e) => {
                          const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.value) === Number(e.target.value));
                          const selectedRate = Number(selectedTax?.label || 0);
                          handleCellChange(selectedRate, index, "tax");
                        }}
                        options={dropdownValues.taxType || []}
                        label=""
                        name="tax"
                        disabled={false}
                        ControlID={`tax_${row.productID}`}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "discPercentage", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "taxAfterDiscYN", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "taxAfterDiscYN", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "taxableAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "cgstPerValue", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "cgstTaxAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "sgstPerValue", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "sgstTaxAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "productValue", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableTextField(row, "manufacturerName", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "discAmt", index)}
                    </TableCell>
                    <TableCell align="right">{row._unitPrice}</TableCell>
                    <TableCell align="right">{row._sellingUnitPrice}</TableCell>
                    <TableCell align="center">
                      <IconButton disabled={false} size="small" onClick={() => handleDeleteRow(row.productID, row.pODetID)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default GRNGrid;
