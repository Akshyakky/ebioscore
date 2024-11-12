import React from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetailsDto: ChargeDetailsDto) => void;
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      debugger;
      const result = await chargeDetailsService.getAll();
      return result || [];
    } catch (error) {
      console.error("Error fetching charge details:", error);
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await chargeDetailsService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating active status:", error);
      return false;
    }
  };

  const getItemId = (item: ChargeDetailsDto) => item.chargeInfo.chargeID;
  const getItemActiveStatus = (item: ChargeDetailsDto) => item.chargeInfo.rActiveYN === "Y";

  // Define columns for the search table
  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true, sortable: true },
    { key: "chargeCode", header: "Charge Code", visible: true },
    { key: "chargeDesc", header: "Charge Description", visible: true },
    { key: "chargeType", header: "Charge Type", visible: true },
    { key: "cShortName", header: "Short Name", visible: true },
    { key: "chargeCost", header: "Cost", visible: true },
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
      isStatusVisible={true}
      pagination={true}
      showExportCSV={true}
      showExportPDF={true}
    />
  );
};

export default ChargeDetailsSearch;
