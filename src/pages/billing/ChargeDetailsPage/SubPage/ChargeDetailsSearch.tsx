import React from "react";
import { BChargeDto, ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import { Column } from "../../../../components/CustomGrid/CustomGrid";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetails: BChargeDto) => void;
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async (): Promise<BChargeDto[]> => {
    try {
      const result = await chargeDetailsService.getAll();
      return result.data;
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

  const getItemId = (item: BChargeDto) => item.chargeID;
  const getItemActiveStatus = (item: BChargeDto) => item.chargeStatus === "Active";

  const columns: Column<BChargeDto>[] = [
    {
      key: "chargeCode",
      header: "Service Code",
      visible: true,
      sortable: true,
      render: (item: BChargeDto) => item.chargeCode,
    },

    {
      key: "cNhsEnglishName",
      header: "Service Name",
      visible: true,
      render: (item: BChargeDto) => item.cNhsEnglishName || "",
    },

    {
      key: "chargeType",
      header: "Service Type",
      visible: true,
      render: (item: BChargeDto) => item.chargeType,
    },
    {
      key: "cShortName",
      header: "Short Name",
      visible: true,
      render: (item: BChargeDto) => item.cShortName,
    },
  ];

  return (
    <GenericAdvanceSearch<BChargeDto>
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
