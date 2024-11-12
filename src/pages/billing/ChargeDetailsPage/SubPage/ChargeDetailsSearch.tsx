// src/components/Billing/SubPage/ChargeDetailsSearch.tsx
import React from "react";
import { ChargeDetailsDto, BChargeDto } from "../../../../interfaces/Billing/BChargeDetails";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import { Column } from "../../../../components/CustomGrid/CustomGrid";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetails: ChargeDetailsDto) => void;
  filterId?: number; // Optional filterId prop to specify the ID
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect, filterId }) => {
  // Fetch all Charge Details with optional filtering by ID
  const fetchItems = async (): Promise<ChargeDetailsDto[]> => {
    try {
      // API call to fetch from the database
      const result = await chargeDetailsService.getAll();
      const allData = result.data;

      // Filter by chargeID if filterId is provided
      if (filterId) {
        return allData.filter((item: ChargeDetailsDto) => item.chargeInfo.chargeID === filterId);
      }

      return allData; // Return all data if no filterId is specified
    } catch (error) {
      console.error("Error fetching charge details:", error);
      return [];
    }
  };

  // Update active status for specific item
  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      const result = await chargeDetailsService.updateActiveStatus(id, status);
      return result;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  };

  // Column definitions for displaying Charge Details data
  const columns: Column<ChargeDetailsDto>[] = [
    {
      key: "chargeCode",
      header: "Charge Code",
      visible: true,
      sortable: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo.chargeCode,
    },
    {
      key: "chargeDesc",
      header: "Charge Description",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo.chargeDesc,
    },
    {
      key: "chargeType",
      header: "Charge Type",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo.chargeType,
    },
    {
      key: "cShortName",
      header: "Short Name",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo.cShortName,
    },
    {
      key: "chargeStatus",
      header: "Status",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo.chargeStatus,
    },
  ];

  // Handler for item selection
  const handleSelect = (data: ChargeDetailsDto) => {
    onSelect(data);
  };

  return (
    <GenericAdvanceSearch<ChargeDetailsDto>
      open={open}
      onClose={onClose}
      onSelect={handleSelect}
      title="CHARGE DETAILS LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.chargeInfo.chargeID}
      getItemActiveStatus={(item) => item.chargeInfo.chargeStatus === "Active"}
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
