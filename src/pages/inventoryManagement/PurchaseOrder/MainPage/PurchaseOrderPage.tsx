import { Box, Container } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { GridRowData, PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";
import PurchaseOrderSearch from "../SubPage/PurchaseOrderSearch";

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
  const [gridData, setGridData] = useState<GridRowData[]>([]);
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
    if (gridData.length === 0) return;

    // Create a copy of the grid data
    const updatedGridData = [...gridData];
    if (isDiscPercentage) {
      // Apply percentage discount to each item
      updatedGridData.forEach((item, index) => {
        const packPrice = item.packPrice || 0;
        const requiredPack = item.requiredPack || 0;
        const totalPrice = packPrice * requiredPack;

        // Calculate discount amount based on percentage
        const discAmt = (totalPrice * totDiscAmtPer) / 100;

        // Update the item with new discount values
        updatedGridData[index] = {
          ...item,
          discAmt,
          discPercentageAmt: totDiscAmtPer,
          itemTotal: totalPrice - discAmt,
        };
      });
    } else {
      // Apply fixed amount discount proportionally to each item
      // Calculate total value of all items
      const totalItemsValue = updatedGridData.reduce((sum, item) => {
        const packPrice = item.packPrice || 0;
        const requiredPack = item.requiredPack || 0;
        return sum + packPrice * requiredPack;
      }, 0);

      if (totalItemsValue > 0) {
        // Distribute discount proportionally
        updatedGridData.forEach((item, index) => {
          const packPrice = item.packPrice || 0;
          const requiredPack = item.requiredPack || 0;
          const totalPrice = packPrice * requiredPack;

          // Calculate this item's share of the total discount
          const proportion = totalPrice / totalItemsValue;
          const discAmt = totDiscAmtPer * proportion;

          // Calculate discount percentage for this item
          const discPercentageAmt = totalPrice > 0 ? (discAmt / totalPrice) * 100 : 0;

          // Update the item with new discount values
          updatedGridData[index] = {
            ...item,
            discAmt,
            discPercentageAmt,
            itemTotal: totalPrice - discAmt,
          };
        });
      }
    }

    // Update grid data state
    setGridData(updatedGridData);
  };

  useEffect(() => {
    if (gridData) {
      console.log("Grid data updated:", gridData);
    }
  }, [gridData]);
  const handleCoinAdjustmentChange = (value: number) => {
    if (selectedData.coinAdjAmt !== value) {
      setSelectedData((prev) => {
        const netAmount = (prev.totalAmt || 0) + (prev.taxAmt || 0) - (prev.discAmt || 0) + value;
        return {
          ...prev,
          coinAdjAmt: value,
          netAmt: netAmount,
        };
      });
    }
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
  const handleProductsGrid = (gridItems: GridRowData[]) => {
    setGridData(gridItems);
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
        gstPerValue: (selectedProduct.sgstPerValue || 0) + (selectedProduct.cgstPerValue || 0),
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
      let purchaseOrderData: purchaseOrderSaveDto = {
        purchaseOrderMastDto: {
          ...selectedData,
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
    console.log(selectedData, "purchaseOrderData");
  }, [selectedData]);

  const recalculateTotals = (updatedGrid: any[]) => {
    const itemsTotal = updatedGrid.reduce((sum, item) => sum + (item.packPrice || 0), 0);
    const totalDiscAmt = updatedGrid.reduce((sum, item) => sum + (item.discAmt || 0), 0);
    const totalCGSTTaxAmt = updatedGrid.reduce((sum, item) => sum + (item.cgstTaxAmt || 0), 0);
    const totalSGSTTaxAmt = updatedGrid.reduce((sum, item) => sum + (item.sgstTaxAmt || 0), 0);
    const totalTaxAmt = totalCGSTTaxAmt + totalSGSTTaxAmt;
    const totalTaxableAmt = updatedGrid.reduce((sum, item) => sum + (item.taxableAmt || 0), 0);
    const netAmount = itemsTotal + (selectedData.coinAdjAmt || 0) - totalDiscAmt + totalTaxAmt;

    const isSame =
      selectedData.totalAmt === itemsTotal &&
      selectedData.discAmt === totalDiscAmt &&
      selectedData.taxAmt === totalTaxAmt &&
      selectedData.netCGSTTaxAmt === totalCGSTTaxAmt &&
      selectedData.netSGSTTaxAmt === totalSGSTTaxAmt &&
      selectedData.totalTaxableAmt === totalTaxableAmt &&
      selectedData.netAmt === netAmount;

    if (!isSame) {
      setSelectedData((prev) => ({
        ...prev,
        totalAmt: itemsTotal,
        discAmt: totalDiscAmt,
        taxAmt: totalTaxAmt,
        netCGSTTaxAmt: totalCGSTTaxAmt,
        netSGSTTaxAmt: totalSGSTTaxAmt,
        totalTaxableAmt,
        netAmt: netAmount,
      }));
    }
  };
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: PurchaseOrderMastDto) => {
    console.log(data);
    setSelectedData(data);
  }, []);

  useEffect(() => {
    if (selectedData.pOID > 0) {
      const fetchPOProductDetails = async () => {
        const response = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(selectedData.pOID);
        console.log("PO Product Details:", response);
        if (response.success && response.data) {
          setGridData(response.data);
        } else {
          setGridData([]);
        }
      };
      fetchPOProductDetails();
    }
  }, [selectedData.pOID]);
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
          <PurchaseOrderSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
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
