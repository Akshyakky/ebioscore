import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { GRNMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import { GRNService } from "@/services/InventoryManagementService/GRNService/GRNService";
import { AppDispatch, RootState } from "@/store";
import { setGRNMastData } from "@/store/features/grn/grnSlice";
import { showAlert } from "@/utils/Common/showAlert";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

interface GRNSearchProps {
  open: boolean;
  onClose: () => void;
}

const GRNSearch: React.FC<GRNSearchProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const grnService = new GRNService();
  const departmentInfo = useSelector((state: RootState) => state.grn.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;

  const onSelect = useCallback((fetchedGRNMastData: GRNMastDto) => {
    dispatch(setGRNMastData(fetchedGRNMastData));
    console.log(fetchedGRNMastData);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const result: OperationResult<GRNMastDto[]> = (await grnService.getAll()) as OperationResult<GRNMastDto[]>;
      let items = result.success ? result.data ?? [] : [];
      // items = items.filter((item) => item.fromDeptID === departmentId);
      items = items.map((item) => {
        item.poDate = item.poDate ? new Date(item.poDate).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
        item.grnDate = new Date(item.grnDate).toLocaleDateString("en-GB");
        item.invDate = new Date(item.invDate).toLocaleDateString("en-GB");
        return item;
      });
      return items;
    } catch (error) {
      console.error("Error fetching:", error);
      return [];
    }
  }, [grnService, departmentId]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await grnService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result.success;
      } catch (error) {
        console.error("Error updating active status:", error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [grnService]
  );

  const getItemId = (item: GRNMastDto) => item.grnID;
  const getItemActiveStatus = (item: GRNMastDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "grnCode", header: "GRN Code", visible: true },
    { key: "grnDate", header: "Date", visible: true },
    { key: "invoiceNo", header: "Invoice No", visible: true },
    { key: "supplrName", header: "Supplier Name", visible: true },
    { key: "poTotalAmt", header: "PO Amount", visible: true },
    { key: "pOApprovedBy", header: "Approved By", visible: true },
  ];
  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="GRN Search"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter GRN details"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default GRNSearch;
