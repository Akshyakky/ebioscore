import { Box, Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import { purchaseOrderMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";

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
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "",
    rNotes: "",
  };

  const [selectedData, setSelectedData] = useState<PurchaseOrderMastDto>(initialPOMastDto);
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | undefined>(undefined);
  const [pODetailDto, setPODetailDto] = useState<PurchaseOrderDetailDto>();
  const handleSelectedProduct = (product: ProductListDto) => {
    console.log("Selected product:", product);
    setSelectedProduct(product);
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
        compID: selectedProduct.compID,
        compCode: selectedProduct.compCode,
        compName: selectedProduct.compName,
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
    setIsSubmitted(false);
  };

  const handleSave = () => {
    setIsSubmitted(true);
    if (!selectedData.fromDeptID && !selectedData.pODate && !selectedData.supplierID) {
      return;
    }
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
          <PurchaseOrderGrid poDetailDto={pODetailDto} />
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
