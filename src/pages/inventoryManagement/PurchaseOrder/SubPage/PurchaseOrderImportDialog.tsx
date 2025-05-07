import React, { useEffect, useState } from "react";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { purchaseOrderMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Collapse, CircularProgress, Typography } from "@mui/material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { ArrowDownwardTwoTone, History } from "@mui/icons-material";
import CustomButton from "@/components/Button/CustomButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateAllPurchaseOrderDetails } from "@/store/features/purchaseOrder/purchaseOrderSlice";

interface PurchaseOrderImportDialogProps {
  open: boolean;
  onClose: () => void;
  supplierID: number;
  fromDeptID: number;
}

type PurchaseOrderWithDetails = PurchaseOrderMastDto & {
  details: PurchaseOrderDetailDto[];
};

const PurchaseOrderImportDialog: React.FC<PurchaseOrderImportDialogProps> = ({ open, onClose, supplierID, fromDeptID }) => {
  const [poMastBySupplier, setPOMastBySupplier] = useState<PurchaseOrderWithDetails[]>([]);
  const [expandedPOID, setExpandedPOID] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (open) fetchPOMastData();
  }, [open]);

  const fetchPOMastData = async () => {
    try {
      const result = await purchaseOrderMastService.getAll();
      const items = result.success ? result.data ?? [] : [];
      const filteredItems = items
        .filter((item: PurchaseOrderMastDto) => item.fromDeptID === fromDeptID && item.supplierID === supplierID && item.pOApprovedYN === "Y")
        .map((item) => ({ ...item, details: [] }));

      setPOMastBySupplier(filteredItems as PurchaseOrderWithDetails[]);
    } catch (error) {
      console.error("Error fetching PO Master Data:", error);
      setPOMastBySupplier([]);
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
        const response: OperationResult<purchaseOrderSaveDto> = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(importPOID);
        if (response.success && response.data) {
          selectedPO.details = response.data.purchaseOrderDetailDto ?? [];
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
    await togglePODetails(importPOID);
    const prevPODetails = poMastBySupplier.find((po) => po.pOID === importPOID)?.details;
    if (!prevPODetails) return;

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
      unitPack: 0,
      sgstTaxAmt: 0,
      cgstTaxAmt: 0,
      netAmount: 0,
      totAmt: 0,
      taxAmt: 0,
    }));

    dispatch(updateAllPurchaseOrderDetails(updatedPODetails));
    onClose();
  };

  return (
    <GenericDialog open={open} onClose={onClose} title="Select a purchase order to import from" maxWidth="md">
      <TableContainer sx={{ minHeight: 500, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Code</TableCell>
              <TableCell>PO Date</TableCell>
              <TableCell>Supplier Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {poMastBySupplier.length === 0 ? (
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
                    <TableCell>{po.pODate}</TableCell>
                    <TableCell>{po.supplierName}</TableCell>
                    <TableCell>
                      <CustomButton onClick={() => togglePODetails(po.pOID)} text={""} variant="text" icon={ArrowDownwardTwoTone} size="small" color="primary" />
                      <CustomButton onClick={() => handleImportPrevPO(po.pOID)} text={"Import"} variant="contained" icon={History} size="medium" color="primary" />
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
                                <TableCell>Sl. No</TableCell>
                                <TableCell>Product Name</TableCell>
                                <TableCell>Qty</TableCell>
                                <TableCell>Pack Price</TableCell>
                                <TableCell>Selling Price</TableCell>
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
