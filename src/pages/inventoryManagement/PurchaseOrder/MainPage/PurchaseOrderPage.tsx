import { Box, Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";

const PurchaseOrderPage: React.FC = () => {
  const initialPOMastDto: PurchaseOrderMastDto = {
    pOID: 0,
    supplierID: 0,
    supplierName: "",
    fromDeptID: 0,
    fromDeptName: "",
    pODate: "",
    auGrpID: 0,
    catDesc: "",
    catValue: "",
    coinAdjAmt: 0,
    discAmt: 0,
    netAmt: 0,
    pOAcknowledgement: "",
    pOApprovedBy: "",
    pOApprovedID: 0,
    pOApprovedNo: "",
    pOApprovedYN: "",
    pOCode: "",
    pOSActionNo: "",
    pOTypeValue: "",
    pOType: "",
    taxAmt: 0,
    totalAmt: 0,
    pOStatusCode: "",
    pOStatus: "",
    netCGSTTaxAmt: 0,
    netSGSTTaxAmt: 0,
    totalTaxableAmt: 0,
    rActiveYN: "",
    transferYN: "",
    rNotes: "",
  };
  const [gridData, setGridData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<PurchaseOrderMastDto>(initialPOMastDto);
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | undefined>(undefined);
  const [pODetailDto, setPODetailDto] = useState<PurchaseOrderDetailDto>();
  const [totDiscAmtPer, setTotDiscAmtPer] = useState<number>(0);
  const [isDiscPercentage, setIsDiscPercentage] = useState<boolean>(false);

  const handleApplyDiscount = () => {
    const updatedData = gridData.map((row) => {
      const requiredPack = row.requiredPack || 0;
      const packPrice = row.packPrice || 0;
      const baseTotal = requiredPack * packPrice;

      let discAmt = 0;
      let discPercentageAmt = 0;

      if (isDiscPercentage) {
        discPercentageAmt = totDiscAmtPer;
        discAmt = baseTotal ? (baseTotal * totDiscAmtPer) / 100 : 0;
      } else {
        discAmt = totDiscAmtPer;
        discPercentageAmt = baseTotal ? (totDiscAmtPer / baseTotal) * 100 : 0;
      }

      const taxableAmt = baseTotal - discAmt;
      const cgstTaxAmt = (taxableAmt * (row.cgstPerValue || 0)) / 100;
      const sgstTaxAmt = (taxableAmt * (row.sgstPerValue || 0)) / 100;

      return {
        ...row,
        discAmt,
        discPercentageAmt,
        taxableAmt,
        cgstTaxAmt,
        sgstTaxAmt,
        itemTotal: taxableAmt + cgstTaxAmt + sgstTaxAmt,
      };
    });

    setGridData(updatedData);
    recalculateTotals(updatedData);
  };

  const handleApprovedByChange = (id: number, name: string) => {
    setSelectedData((prev) => ({
      ...prev,
      pOApprovedID: id,
      pOApprovedBy: name,
    }));
  };
  const handleRemarksChange = (value: string) => {
    setSelectedData((prev) => ({
      ...prev,
      rNotes: value,
    }));
  };
  const handleFinalizeToggle = (isFinalized: boolean) => {
    setSelectedData((prev) => ({
      ...prev,
      pOApprovedYN: isFinalized ? "Y" : "N",
    }));
  };

  const handleSelectedProduct = (product: ProductListDto) => {
    console.log("Selected product:", product);

    setSelectedProduct(product);
  };
  const handleProductsGrid = (gridItems: any) => {
    setGridData(gridItems);
    recalculateTotals(gridItems);
  };

  const handleAdvancedSearch = () => {
    requireDepartmentSelection(() => {
      setIsSearchOpen(true);
    });
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  useEffect(() => {
    if (isDepartmentSelected) {
      setSelectedData((prev) => ({
        ...prev,
        fromDeptID: deptId,
        fromDeptName: deptName,
      }));
    }
  }, [deptId, deptName, isDepartmentSelected]);

  useEffect(() => {
    if (selectedProduct) {
      const detailDto: PurchaseOrderDetailDto = {
        pODetID: 0,
        pOID: 0,
        indentID: 0,
        indentDetID: 0,
        productID: selectedProduct.productID,
        productCode: selectedProduct.productCode,
        catValue: selectedProduct.catValue,
        pGrpID: selectedProduct.pGrpID ?? 0,
        pSGrpID: selectedProduct.psGrpID ?? 0,
        pUnitID: selectedProduct.pUnitID ?? 0,
        pUnitName: selectedProduct.pUnitName,
        pPkgID: selectedProduct.pPackageID,
        unitPack: selectedProduct.unitPack,
        requiredUnitQty: 1,
        pOYN: "Y",
        grnDetID: 0,
        receivedQty: 0,
        manufacturerID: selectedProduct.manufacturerID,
        manufacturerCode: selectedProduct.manufacturerCode,
        manufacturerName: selectedProduct.manufacturerName,
        discAmt: selectedProduct.productDiscount ?? 0,
        discPercentageAmt: 0,
        freeQty: 0,
        isFreeItemYN: "N",
        mfID: selectedProduct.mFID,
        mrpAbdated: 0,
        netAmount: selectedProduct.defaultPrice ?? 0,
        pODetStatusCode: "",
        profitOnMrp: 0,
        taxAfterDiscOnMrp: "N",
        taxAfterDiscYN: "N",
        taxAmtOnMrp: 0,
        taxAmt: 0,
        taxModeCode: selectedProduct.taxCode,
        taxModeDescription: selectedProduct.taxName,
        taxModeID: selectedProduct.taxID,
        taxOnFreeItemYN: "N",
        taxOnMrpYN: "N",
        taxOnUnitPrice: "Y",
        totAmt: selectedProduct.defaultPrice ?? 0,
        catDesc: selectedProduct.catDescription,
        mfName: selectedProduct.MFName,
        pGrpName: selectedProduct.productGroupName,
        pPkgName: selectedProduct.productPackageName,
        productName: selectedProduct.productName,
        pSGrpName: selectedProduct.psGroupName,
        hsnCode: selectedProduct.hsnCODE,
        cgstPerValue: selectedProduct.cgstPerValue,
        cgstTaxAmt: 0,
        sgstPerValue: selectedProduct.sgstPerValue,
        sgstTaxAmt: 0,
        taxableAmt: selectedProduct.defaultPrice ?? 0,
        transferYN: selectedProduct.transferYN,
        rNotes: selectedProduct.rNotes,
      };

      setPODetailDto(detailDto);

      const fetchPOProductDetails = async () => {
        const response = await purchaseOrderMastServices.getPOProductDetails(selectedProduct.productCode || "", selectedData.fromDeptID);
        console.log("PO Product Details:", response);
      };
      fetchPOProductDetails();
    }
  }, [selectedProduct]);

  const handleDepartmentChange = () => {
    openDialog();
  };

  const handleFormDataChange = (fieldName: keyof PurchaseOrderMastDto, value: any) => {
    setSelectedData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleClear = () => {
    setSelectedData(initialPOMastDto);
    setGridData([]);
    setTotDiscAmtPer(0);
    setIsSubmitted(false);
  };

  const handleSave = async () => {
    setIsSubmitted(true);

    // Validate required fields
    if (!selectedData.fromDeptID || !selectedData.pODate || !selectedData.supplierID) {
      return;
    }

    // Check if there are any products in the grid
    if (gridData.length === 0) {
      return;
    }

    try {
      // Calculate totals for the purchase order
      const totalAmt = gridData.reduce((sum, item) => sum + item.itemTotal, 0);
      const totalTaxableAmt = gridData.reduce((sum, item) => sum + item.taxableAmt, 0);
      const netCGSTTaxAmt = gridData.reduce((sum, item) => sum + item.cgstTaxAmt, 0);
      const netSGSTTaxAmt = gridData.reduce((sum, item) => sum + item.sgstTaxAmt, 0);
      const taxAmt = netCGSTTaxAmt + netSGSTTaxAmt;

      const netAmt = totalAmt - (selectedData.discAmt || 0) + taxAmt - (selectedData.coinAdjAmt || 0);

      let purchaseOrderData: purchaseOrderSaveDto = {
        purchaseOrderMastDto: {
          ...selectedData,
          totalAmt,
          taxAmt,
          netAmt: totalAmt - (selectedData.discAmt || 0) + taxAmt,
          netCGSTTaxAmt,
          netSGSTTaxAmt,
          totalTaxableAmt,
          pOStatusCode: "PENDING",
          pOStatus: "Pending",
          rActiveYN: "Y",
          compID: 1,
          compCode: "TEST",
          compName: "TEST",
          auGrpID: 18,
          catDesc: "catDesc",
          catValue: "catValue",
          pOApprovedID: 5,
          pOApprovedBy: "pOApprovedBy",
          supplierName: "supplierName",
          pOType: "pOType",
          pOTypeValue: "pOTe",
        },
        purchaseOrderDetailDto: gridData.map((row) => ({
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
          requiredPack: row.requiredPack || 0,
          packPrice: row.packPrice || 0,
          sellingPrice: row.sellingPrice || 0,
          pOYN: "Y",
          grnDetID: row.grnDetID || 0,
          receivedQty: row.receivedQty || 0,
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
          pODetStatusCode: "PENDING",
          taxAmt: (row.cgstTaxAmt || 0) + (row.sgstTaxAmt || 0),
          taxModeCode: row.taxModeCode,
          taxModeDescription: row.taxModeDescription,
          taxModeID: row.taxModeID,
          taxAfterDiscOnMrp: row.taxAfterDiscOnMrp || "N",
          taxAfterDiscYN: row.taxAfterDiscYN || "N",
          taxOnFreeItemYN: row.taxOnFreeItemYN || "N",
          taxOnMrpYN: row.taxOnMrpYN || "N",
          taxOnUnitPrice: row.taxOnUnitPrice || "Y",
          totAmt: row.itemTotal || 0,
          cgstPerValue: row.cgstPerValue || 0,
          cgstTaxAmt: row.cgstTaxAmt || 0,
          sgstPerValue: row.sgstPerValue || 0,
          sgstTaxAmt: row.sgstTaxAmt || 0,
          taxableAmt: row.taxableAmt || 0,
          transferYN: row.transferYN || "N",
          rNotes: row.rNotes || "",
          compID: 1,
          compCode: "TEST",
          compName: "TEST",
        })),
      };

      console.log("Submitting purchase order:", purchaseOrderData);
      purchaseOrderData.purchaseOrderMastDto.pODate = "2025-05-05";
      purchaseOrderData.purchaseOrderMastDto.pOApprovedYN = "Y";
      purchaseOrderData.purchaseOrderMastDto.transferYN = "Y";
      try {
        const response = purchaseOrderMastServices.savePurchaseOrder(purchaseOrderData);
        console.log(response);
      } catch (error) {}
    } catch (error) {
      console.error("Error saving purchase order:", error);
      // showAlert("error", "An error occurred while saving the purchase order", "error");
    }
  };
  useEffect(() => {
    console.log(selectedData);
  }, [selectedData]);

  const recalculateTotals = (updatedGrid: any[]) => {
    const totalAmt = updatedGrid.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
    const totalTaxableAmt = updatedGrid.reduce((sum, item) => sum + (item.taxableAmt || 0), 0);
    const netCGSTTaxAmt = updatedGrid.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
    const netSGSTTaxAmt = updatedGrid.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);
    const taxAmt = netCGSTTaxAmt + netSGSTTaxAmt;

    const netAmt = totalAmt - (selectedData.discAmt || 0) + taxAmt - (selectedData.coinAdjAmt || 0);

    setSelectedData((prev) => ({
      ...prev,
      totalAmt,
      taxAmt,
      netCGSTTaxAmt,
      netSGSTTaxAmt,
      totalTaxableAmt,
      netAmt,
    }));
  };

  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          <PurchaseOrderHeader
            purchaseOrderData={selectedData}
            handleDepartmentChange={handleDepartmentChange}
            onFormChange={handleFormDataChange}
            isSubmitted={isSubmitted}
            handleSelectedProduct={handleSelectedProduct}
          />
          <PurchaseOrderGrid poDetailDto={pODetailDto} handleProductsGrid={handleProductsGrid} />
          <PurchaseOrderFooter
            totDiscAmtPer={totDiscAmtPer}
            setTotDiscAmtPer={setTotDiscAmtPer}
            isDiscPercentage={isDiscPercentage}
            setIsDiscPercentage={setIsDiscPercentage}
            handleApplyDiscount={handleApplyDiscount}
            handleApprovedByChange={handleApprovedByChange}
            handleRemarksChange={handleRemarksChange}
            handleFinalizeToggle={handleFinalizeToggle}
            purchaseOrderMastData={selectedData}
          />

          <Box sx={{ mt: 4 }}>
            <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
          </Box>
        </Container>
      )}
      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={selectedData.fromDeptID}
        requireSelection={true}
      />
    </>
  );
};

export default PurchaseOrderPage;
