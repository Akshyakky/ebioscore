import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { purchaseOrderMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { RootState } from "@/store";
import { showAlert } from "@/utils/Common/showAlert";

import React, { useCallback } from "react";
import { useSelector } from "react-redux";

interface PurchaseOrderSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (purchaseOrderMastDto: PurchaseOrderMastDto) => void;
}

const PurchaseOrderSearch: React.FC<PurchaseOrderSearchProps> = ({ open, onClose, onSelect }) => {
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;

  const fetchItems = useCallback(async () => {
    try {
      const result = await purchaseOrderMastService.getAll();
      let items = result.success ? result.data : [];
      items = items.filter((item: PurchaseOrderMastDto) => item.fromDeptID === departmentId);
      console.log("Items:", items, departmentId);
      return items;
    } catch (error) {
      console.error("Error fetching:", error);
      showAlert("Error", "Failed", "error");
      return [];
    }
  }, [purchaseOrderMastService, departmentId]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await purchaseOrderMastService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result;
      } catch (error) {
        console.error("Error updating active status:", error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [purchaseOrderMastService]
  );
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
