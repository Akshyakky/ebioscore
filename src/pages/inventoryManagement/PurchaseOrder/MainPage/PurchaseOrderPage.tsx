import React, { useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { Box, Container } from "@mui/material";
import { Delete as DeleteIcon, Save as SaveIcon, Search } from "@mui/icons-material";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";
import PurchaseOrderSearch from "../SubPage/PurchaseOrderSearch";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { useAlert } from "@/providers/AlertProvider";
import { purchaseOrderService } from "@/services/InventoryManagementService/inventoryManagementService";
import { initialPOMastDto, PurchaseOrderDetailDto, PurchaseOrderFormData, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";

const PurchaseOrderPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { control, handleSubmit, reset, setValue, watch } = useForm<PurchaseOrderFormData>({
    defaultValues: {
      purchaseOrderMast: { ...initialPOMastDto, fromDeptID: deptId, fromDeptName: deptName },
      purchaseOrderDetails: [],
      selectedProduct: null,
    },
    mode: "onChange",
  });

  const {
    fields: purchaseOrderDetails,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: "purchaseOrderDetails",
    keyName: "id", // Use id for unique key
  });

  const departmentId = watch("purchaseOrderMast.fromDeptID");
  const pOID = watch("purchaseOrderMast.pOID");
  const pOApprovedYN = watch("purchaseOrderMast.pOApprovedYN");
  const approvedDisable = watch("purchaseOrderMast.disableApprovedFields") || false;

  useEffect(() => {
    if (isDepartmentSelected) {
      setValue("purchaseOrderMast.fromDeptID", deptId);
      setValue("purchaseOrderMast.fromDeptName", deptName);
    }
  }, [deptId, deptName, isDepartmentSelected, setValue]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleClear = () => {
    reset({
      purchaseOrderMast: { ...initialPOMastDto, fromDeptID: 0, fromDeptName: "" },
      purchaseOrderDetails: [],
      selectedProduct: null,
    });
    handleDepartmentSelect(0, "");
    openDialog();
    setIsSubmitted(false);
  };

  const formaPODateIsoString = (PODatestring: string) => {
    const [day, month, year] = PODatestring.split("/");
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    return date.toISOString();
  };

  const handleSave: SubmitHandler<PurchaseOrderFormData> = async (data) => {
    if (approvedDisable) {
      return;
    }

    setIsSubmitted(true);

    const { purchaseOrderMast, purchaseOrderDetails } = data;
    const { fromDeptID, pODate, supplierID } = purchaseOrderMast;

    if (!fromDeptID || !pODate || !supplierID) {
      showAlert("", "Please fill all mandatory fields", "error");
      return;
    }

    if (purchaseOrderDetails.length === 0) {
      showAlert("", "Please add at least one product", "error");
      return;
    }

    const finalizedPO = pOApprovedYN === "Y";
    if (finalizedPO && purchaseOrderMast.pOApprovedID === 0) {
      showAlert("error", "Please select an approved by", "error");
      return;
    }

    const fieldChecks: { key: keyof PurchaseOrderDetailDto; label: string }[] = [
      { key: "receivedQty", label: "Required Pack" },
      { key: "unitPack", label: "Units/Pack" },
      { key: "unitPrice", label: "Unit Price" },
      { key: "totAmt", label: "Selling Price" },
    ];

    for (const { key, label } of fieldChecks) {
      if (purchaseOrderDetails.some((item) => !item[key] || item[key] <= 0)) {
        showAlert("", `${label} should not be 0`, "warning");
        return;
      }
    }

    try {
      const purchaseOrderData: purchaseOrderSaveDto = {
        purchaseOrderMastDto: {
          ...purchaseOrderMast,
          pOApprovedBy: finalizedPO ? purchaseOrderMast.pOApprovedBy : "",
          pOApprovedID: finalizedPO ? purchaseOrderMast.pOApprovedID : 0,
          pOStatusCode: finalizedPO ? "CMP" : "PND",
          pOStatus: finalizedPO ? "Completed" : "Pending",
          rActiveYN: "Y",
          auGrpID: 18,
          catDesc: "REVENUE",
          catValue: "MEDI",
          pOType: "Revenue Purchase Order",
          pOTypeValue: "RVPO",
          pODate: formaPODateIsoString(purchaseOrderMast.pODate),
        },
        purchaseOrderDetailDto: purchaseOrderDetails.map((row: PurchaseOrderDetailDto) => ({
          ...row,
          pOYN: finalizedPO ? "Y" : "N",
          pODetStatusCode: finalizedPO ? "CMP" : "PND",
          taxAmt: (row.cgstTaxAmt || 0) + (row.sgstTaxAmt || 0),
          taxOnUnitPrice: "Y",
          transferYN: "Y",
          rActiveYN: row.rActiveYN || "Y",
        })),
      };

      const response = await purchaseOrderService.save(purchaseOrderData);
      if (response.success) {
        showAlert("Saved", "Purchase Order saved successfully", "success");
        handleClear();
      } else {
        showAlert("", "Failed to save purchase order", "error");
      }
    } catch (error) {
      console.error("Error saving purchase order:", error);
      showAlert("", "Failed to save purchase order", "error");
    }
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

  const handleDepartmentChange = () => {
    openDialog();
  };

  return (
    <>
      {departmentId > 0 && (
        <Container maxWidth={false}>
          {departmentId > 0 && (
            <>
              {pOID === 0 && (
                <Box sx={{ marginBottom: 2 }}>
                  <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
                </Box>
              )}
              <PurchaseOrderHeader control={control} setValue={setValue} handleDepartmentChange={handleDepartmentChange} />
              <PurchaseOrderGrid
                control={control}
                fields={purchaseOrderDetails}
                append={append}
                remove={remove}
                update={update}
                approvedDisable={approvedDisable}
                setValue={setValue} // Pass setValue
              />
              <PurchaseOrderFooter control={control} setValue={setValue} watch={watch} />
              <PurchaseOrderSearch open={isSearchOpen} onClose={handleCloseSearch} control={control} setValue={setValue} />
              <Box sx={{ mt: 4 }}>
                <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSubmit(handleSave)} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
              </Box>
            </>
          )}
        </Container>
      )}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={departmentId ?? 0} requireSelection={true} />
    </>
  );
};

export default PurchaseOrderPage;
