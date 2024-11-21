import React from "react";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import { Column } from "../../../../components/CustomGrid/CustomGrid";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetails: ChargeDetailsDto) => void;
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async (): Promise<ChargeDetailsDto[]> => {
    try {
      const result = await chargeDetailsService.getAllChargeDetails();
      if (!result.success || !result.data) {
        console.error("Failed to fetch charge details:", result.errorMessage);
        return [];
      }
      console.log("API Response:", result.data);
      const mappedData = result.data.map((item) => ({
        ...item,
        chargeDetails: item.chargeDetails || [],
        chargeAliases: item.chargeAliases || [],
        faculties: item.faculties || [],
      }));
      console.log("Mapped Data:", mappedData);
      return mappedData;
    } catch (error) {
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      const result = await chargeDetailsService.updateActiveStatus(id, status);
      return result;
    } catch (error) {
      return false;
    }
  };

  const getItemId = (item: ChargeDetailsDto) => item.chargeInfo?.chargeID || 0;
  const getItemActiveStatus = (item: ChargeDetailsDto) => item.chargeInfo?.chargeStatus === "Active";
  const columns: Column<ChargeDetailsDto>[] = [
    {
      key: "chargeInfo.chargeCode",
      header: "Service Code",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo?.chargeCode,
    },
    {
      key: "chargeInfo.cNhsEnglishName",
      header: "Service Name",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo?.chargeDesc,
    },
    {
      key: "chargeInfo.chargeType",
      header: "Service Type",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo?.chargeType,
    },
    {
      key: "chargeInfo.cShortName",
      header: "Short Name",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo?.cShortName,
    },
  ];

  return (
    <GenericAdvanceSearch<ChargeDetailsDto>
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
      isEditButtonVisible={true}
    />
  );
};

export default ChargeDetailsSearch;
