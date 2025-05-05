import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import React, { useCallback, useEffect, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { Box, Container } from "@mui/material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { Delete as DeleteIcon, Save as SaveIcon, Search } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setDepartmentInfo, setPurchaseOrderMastData, resetPurchaseOrderState } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { AppDispatch } from "@/store";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { initialPOMastDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";
import PurchaseOrderSearch from "../SubPage/PurchaseOrderSearch";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { showAlert } from "@/utils/Common/showAlert";
import { purchaseOrderService } from "@/services/InventoryManagementService/inventoryManagementService";

const PurchaseOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;
  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: PurchaseOrderMastDto) => {
    dispatch(setPurchaseOrderMastData(data));
  }, []);

  useEffect(() => {
    if (isDepartmentSelected) {
      dispatch(setDepartmentInfo({ departmentId: deptId, departmentName: deptName }));
      dispatch(
        setPurchaseOrderMastData({
          ...initialPOMastDto,
          fromDeptID: deptId,
          fromDeptName: deptName,
        } as PurchaseOrderMastDto)
      );
    }
  }, [deptId, deptName, isDepartmentSelected]);

  const handleDepartmentChange = () => {
    openDialog();
  };

  useEffect(() => {
    return () => {
      dispatch(resetPurchaseOrderState());
    };
  }, []);

  const handleClear = () => {
    dispatch(resetPurchaseOrderState());
    closeDialog();
  };

  useEffect(() => {
    console.log("Purchase Order Mast Data:", purchaseOrderMastData);
  }, [purchaseOrderMastData]);
  useEffect(() => {
    console.log("Purchase Order Detail Data:", purchaseOrderDetails);
  }, [purchaseOrderDetails]);

  const handleSave = () => {
    setIsSubmitted(true);
    const { pOApprovedYN, fromDeptID, pODate, supplierID } = purchaseOrderMastData;
    // Validate required fields
    if (!fromDeptID || !pODate || !supplierID) {
      return;
    }

    if (purchaseOrderDetails.length === 0) {
      return;
    }

    const finalizedPO = pOApprovedYN === "Y";
    try {
      const purchaseOrderData: purchaseOrderSaveDto = {
        purchaseOrderMastDto: {
          ...purchaseOrderMastData,
          pOStatusCode: finalizedPO ? "CMP" : "PND",
          pOStatus: finalizedPO ? "Completed" : "Pending",
          rActiveYN: "Y",
          auGrpID: 18,
          catDesc: "REVENUE",
          catValue: "MEDI",
          pOType: "Revenue Purchase Order",
          pOTypeValue: "RVPO",
          pODate: "2025-05-02T00:00:00.000Z",
        },
        purchaseOrderDetailDto: purchaseOrderDetails.map((row) => ({
          pODetID: row.pODetID || 0,
          pOID: row.pOID || 0,
          indentID: row.indentID || 0,
          indentDetID: row.indentDetID || 0,
          productID: row.productID,
          productCode: row.productCode,
          productName: row.productName,
          catValue: row.catValue,
          catDesc: row.catDesc,
          pGrpID: row.pGrpID,
          pGrpName: row.pGrpName,
          pSGrpID: row.pSGrpID,
          pSGrpName: row.pSGrpName,
          pUnitID: row.pUnitID,
          pUnitName: row.pUnitName,
          pPkgID: row.pPkgID,
          pPkgName: row.pPkgName,
          unitPack: row.unitPack,
          requiredUnitQty: row.requiredUnitQty,
          receivedQty: row.receivedQty || 0,
          packPrice: row.packPrice || 0,
          pOYN: finalizedPO ? "Y" : "N",
          grnDetID: row.grnDetID || 0,
          manufacturerID: row.manufacturerID,
          manufacturerCode: row.manufacturerCode,
          manufacturerName: row.manufacturerName,
          discAmt: row.discAmt || 0,
          discPercentageAmt: row.discPercentageAmt || 0,
          freeQty: row.freeQty || 0,
          isFreeItemYN: row.isFreeItemYN || "N",
          mfID: row.mfID,
          mfName: row.mfName,
          netAmount: row.netAmount || 0,
          pODetStatusCode: finalizedPO ? "CMP" : "PND",
          taxAmt: (row.cgstTaxAmt || 0) + (row.sgstTaxAmt || 0),
          taxModeCode: row.taxModeCode || "TAX0",
          taxModeDescription: row.taxModeDescription || "TAX0",
          taxModeID: row.taxModeID,
          taxAfterDiscOnMrp: row.taxAfterDiscOnMrp || "N",
          taxAfterDiscYN: row.taxAfterDiscYN || "N",
          taxOnFreeItemYN: row.taxOnFreeItemYN || "N",
          taxOnMrpYN: row.taxOnMrpYN || "N",
          taxOnUnitPrice: "Y",
          totAmt: row.totAmt || 0,
          cgstPerValue: row.cgstPerValue || 0,
          cgstTaxAmt: row.cgstTaxAmt || 0,
          sgstPerValue: row.sgstPerValue || 0,
          sgstTaxAmt: row.sgstTaxAmt || 0,
          taxableAmt: row.taxableAmt || 0,
          transferYN: "Y",
          rActiveYN: "Y",
          rNotes: row.rNotes || "",
          hsnCode: "test",
        })),
      };
      try {
        const response: any = purchaseOrderService.save(purchaseOrderData);
        if (response.success) {
          showAlert("Saved", "Purchase Order saved successfully", "success");
          handleClear();
        } else {
          showAlert("error", "Failed to save purchase order", "error");
        }
      } catch (error) {}
    } catch (error) {
      console.error("Error saving purchase order:", error);
      showAlert("error", "Failed to save purchase order", "error");
    }
  };

  const handleAdvancedSearch = () => {
    requireDepartmentSelection(() => {
      setIsSearchOpen(true);
    });
  };
  const formaPODateIsoString = (PODatestring: string) => {
    const [day, month, year] = PODatestring.split("/");
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    return date.toISOString();
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          <PurchaseOrderHeader handleDepartmentChange={handleDepartmentChange} />
          <PurchaseOrderGrid />
          <PurchaseOrderFooter />
          <PurchaseOrderSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
          <Box sx={{ mt: 4 }}>
            {departmentId > 0 && <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />}
          </Box>
        </Container>
      )}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={departmentId ?? 0} requireSelection={true} />
    </>
  );
};

export default PurchaseOrderPage;
