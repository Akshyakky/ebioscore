import React, { useCallback } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { purchaseOrderMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { useAlert } from "@/providers/AlertProvider";
import { PurchaseOrderFormData, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";

interface PurchaseOrderSearchProps {
  open: boolean;
  onClose: () => void;
  control: Control<PurchaseOrderFormData>;
  setValue: UseFormSetValue<PurchaseOrderFormData>;
}

const PurchaseOrderSearch: React.FC<PurchaseOrderSearchProps> = ({ open, onClose, control, setValue }) => {
  const departmentId = control._formValues.purchaseOrderMast.fromDeptID;
  const { showAlert } = useAlert();

  const onSelect = useCallback(
    (data: PurchaseOrderMastDto) => {
      setValue("purchaseOrderMast", {
        ...data,
        pODate: new Date(data.pODate).toLocaleDateString("en-GB"),
      });
      const isApproved = data.pOApprovedYN === "Y" && data.pOID > 0;
      setValue("purchaseOrderMast.disableApprovedFields", isApproved);
      onClose();
    },
    [setValue, onClose]
  );

  const fetchItems = useCallback(async () => {
    try {
      const result = await purchaseOrderMastService.getAll();
      let items = result.success ? result.data ?? [] : [];
      items = items.filter((item: PurchaseOrderMastDto) => item.fromDeptID === departmentId);
      items = items.map((item: PurchaseOrderMastDto) => ({
        ...item,
        pODate: new Date(item.pODate).toLocaleDateString("en-GB"),
      }));
      return items;
    } catch (error) {
      console.error("Error fetching:", error);
      showAlert("Error", "Failed", "error");
      return [];
    }
  }, [departmentId]);

  const updateActiveStatus = useCallback(async (id: number, status: boolean) => {
    try {
      const result = await purchaseOrderMastService.updateActiveStatus(id, status);
      if (result) {
        showAlert("Success", "Status updated successfully.", "success");
      }
      return result.success;
    } catch (error) {
      console.error("Error updating active status:", error);
      showAlert("Error", "Failed to update status.", "error");
      return false;
    }
  }, []);

  const getItemId = (item: PurchaseOrderMastDto) => item.pOID;
  const getItemActiveStatus = (item: PurchaseOrderMastDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "pOCode", header: "PO Code", visible: true },
    { key: "pODate", header: "PO Date", visible: true },
    { key: "supplierName", header: "Supplier Name", visible: true },
    { key: "pOApprovedBy", header: "Approved By", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Purchase Order Search"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter PO code or name"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default PurchaseOrderSearch;
