import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { ArrowDownwardTwoTone, ArrowUpwardTwoTone, History } from "@mui/icons-material";
import { CircularProgress, Collapse, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";

interface PurchaseOrderImportDialogProps {
  open: boolean;
  onClose: () => void;
  fromDeptID: number;
  supplierID: number;
  onImport: (details: PurchaseOrderDetailDto[]) => void;
}

type PurchaseOrderWithDetails = PurchaseOrderMastDto & {
  details: PurchaseOrderDetailDto[];
};

const PurchaseOrderImportDialog: React.FC<PurchaseOrderImportDialogProps> = ({ open, onClose, fromDeptID, supplierID, onImport }) => {
  const [poMastBySupplier, setPOMastBySupplier] = useState<PurchaseOrderWithDetails[]>([]);
  const [expandedPOID, setExpandedPOID] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { getPurchaseOrdersByDepartment, getPurchaseOrderById } = usePurchaseOrder();

  useEffect(() => {
    if (open && fromDeptID && supplierID) {
      fetchPOMastData();
    }
  }, [open, fromDeptID, supplierID]);

  const fetchPOMastData = async () => {
    try {
      setLoading(true);
      const departmentPOs = await getPurchaseOrdersByDepartment(fromDeptID);

      // Filter by supplier and approved status
      const filteredItems = departmentPOs
        .filter((item: PurchaseOrderMastDto) => item.supplierID === supplierID && item.pOApprovedYN === "Y")
        .map((item) => ({ ...item, details: [] }));

      setPOMastBySupplier(filteredItems as PurchaseOrderWithDetails[]);
    } catch (error) {
      console.error("Error fetching PO Master Data:", error);
      setPOMastBySupplier([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePODetails = async (importPOID: number) => {
    if (expandedPOID === importPOID) {
      setExpandedPOID(null);
      return;
    }

    setLoading(true);
    try {
      const updatedList = [...poMastBySupplier];
      const selectedPO = updatedList.find((po) => po.pOID === importPOID);

      if (selectedPO && selectedPO.details.length === 0) {
        const poData = await getPurchaseOrderById(importPOID);
        if (poData) {
          selectedPO.details = poData.purchaseOrderDetailDto || [];
        }
      }

      setPOMastBySupplier(updatedList);
      setExpandedPOID(importPOID);
    } catch (error) {
      console.error("Error fetching PO Details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrevPO = async (importPOID: number) => {
    // First ensure we have the details
    if (expandedPOID !== importPOID) {
      await togglePODetails(importPOID);
    }

    const prevPODetails = poMastBySupplier.find((po) => po.pOID === importPOID)?.details;
    if (!prevPODetails) return;

    // Reset certain fields for new PO
    const updatedPODetails = prevPODetails.map((poDetail) => ({
      ...poDetail,
      pOID: 0,
      pODetID: 0,
      grnDetID: 0,
      pOYN: "N",
      pODetStatusCode: "PND",
      discAmt: 0,
      discPercentageAmt: 0,
      receivedQty: 0,
      requiredUnitQty: 0,
      unitPack: poDetail.unitPack || 0,
      sgstTaxAmt: 0,
      cgstTaxAmt: 0,
      netAmount: 0,
      totAmt: 0,
      taxAmt: 0,
      gstPerValue: (poDetail.cgstPerValue || 0) + (poDetail.sgstPerValue || 0),
      rActiveYN: "Y",
    }));

    onImport(updatedPODetails);
    onClose();
  };

  return (
    <GenericDialog open={open} onClose={onClose} title="Select a purchase order to import from" maxWidth="md">
      <TableContainer sx={{ minHeight: 500, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              {["PO Code", "PO Date", "Supplier Name", "Action"].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && poMastBySupplier.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : poMastBySupplier.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No previous purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              poMastBySupplier.map((po) => (
                <React.Fragment key={po.pOID}>
                  <TableRow>
                    <TableCell>{po.pOCode}</TableCell>
                    <TableCell>{new Date(po.pODate).toLocaleDateString()}</TableCell>
                    <TableCell>{po.supplierName}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <CustomButton
                          onClick={() => togglePODetails(po.pOID)}
                          text=""
                          variant="text"
                          icon={expandedPOID === po.pOID ? ArrowUpwardTwoTone : ArrowDownwardTwoTone}
                          size="small"
                          color="primary"
                        />
                        <CustomButton onClick={() => handleImportPrevPO(po.pOID)} text="Import" variant="contained" icon={History} size="medium" color="primary" />
                      </Stack>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <Collapse in={expandedPOID === po.pOID} timeout="auto" unmountOnExit>
                        {loading && expandedPOID === po.pOID ? (
                          <Stack alignItems="center" py={2}>
                            <CircularProgress size={24} />
                          </Stack>
                        ) : (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {["Sl. No", "Product Name", "Qty", "Pack Price", "Selling Price"].map((header) => (
                                  <TableCell key={header}>{header}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {po.details.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{item.productName}</TableCell>
                                  <TableCell>{item.receivedQty}</TableCell>
                                  <TableCell>{item.unitPrice}</TableCell>
                                  <TableCell>{item.totAmt}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericDialog>
  );
};

export default PurchaseOrderImportDialog;
