import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { chargeDetailsService } from "@/services/BillingServices/chargeDetailsService";
import { showAlert } from "@/utils/Common/showAlert";
import { useCallback } from "react";
import React from "react";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetails: any) => void;
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = useCallback(async () => {
    try {
      const result: any = await chargeDetailsService.getAll();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching User:", error);
      showAlert("Error", "Failed to User.", "error");
      return [];
    }
  }, [chargeDetailsService]);

  //   try {
  //     const result: any = await chargeDetailsService.getAll();
  //     if (result.success && result.data) {
  //       const chargelistDatas: any = result.data.map((item: ChargeDetailsDto) => item.chargeInfo);
  //       console.log("Fetching items...", chargelistDatas);
  //       return chargelistDatas;
  //     } else {
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error("Error fetching User:", error);
  //     showAlert("Error", "Failed to User.", "error");
  //     return [];
  //   }
  // }, [chargeDetailsService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await chargeDetailsService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result;
      } catch (error) {
        console.error("Error updating User active status:", error);
        showAlert("Error", "Failed to update user status.", "error");
        return false;
      }
    },
    [chargeDetailsService]
  );

  const getItemId = (item: any) => item?.chargeID;
  const getItemActiveStatus = (item: any) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "chargeCode", header: "Service Code", visible: true },
    { key: "cNhsEnglishName", header: "Service Name", visible: true },
    { key: "chargeType", header: "Service Type", visible: true },
    { key: "cShortName", header: "Service S Name", visible: true },
    { key: "status", header: "Service Status", visible: true },
  ];
  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="CHARGE DETAILS LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter charge code or description"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ChargeDetailsSearch;
