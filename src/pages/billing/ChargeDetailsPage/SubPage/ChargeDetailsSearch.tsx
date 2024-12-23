import React, { useState } from "react";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { chargeDetailsService } from "../../../../services/BillingServices/chargeDetailsService";
import { Column } from "../../../../components/CustomGrid/CustomGrid";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import Switch from "@mui/material/Switch";

interface ChargeDetailsSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (chargeDetails: ChargeDetailsDto) => void;
}

const ChargeDetailsSearch: React.FC<ChargeDetailsSearchProps> = ({ open, onClose, onSelect }) => {
  const dropdownValues = useDropdownValues(["service"]);
  const [items, setItems] = useState<ChargeDetailsDto[]>([]);

  const fetchItems = async (): Promise<ChargeDetailsDto[]> => {
    try {
      const result = await chargeDetailsService.getAllChargeDetails();
      if (!result.success || !result.data) {
        console.error("Failed to fetch charge details:", result.errorMessage);
        return [];
      }
      const mappedData = result.data.map((item) => ({
        ...item,
        chargeDetails: item.chargeDetails || [],
        chargeAliases: item.chargeAliases || [],
        faculties: item.faculties || [],
      }));
      setItems(mappedData);
      return mappedData;
    } catch (error) {
      console.error("Error fetching charge details:", error);
      return [];
    }
  };

  const handleStatusChange = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.chargeInfo?.chargeID === id
          ? {
              ...item,
              chargeInfo: {
                ...item.chargeInfo,
                rActiveYN: newStatus ? "Y" : "N",
              },
            }
          : item
      )
    );

    try {
      const success = await updateActiveStatus(id, newStatus);
      if (!success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.chargeInfo?.chargeID === id
              ? {
                  ...item,
                  chargeInfo: {
                    ...item.chargeInfo,
                    rActiveYN: currentStatus ? "Y" : "N",
                  },
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert back on error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.chargeInfo?.chargeID === id
            ? {
                ...item,
                chargeInfo: {
                  ...item.chargeInfo,
                  rActiveYN: currentStatus ? "Y" : "N",
                },
              }
            : item
        )
      );
    }
  };

  const updateActiveStatus = async (id: number, status: boolean): Promise<boolean> => {
    try {
      const result = await chargeDetailsService.updateActiveStatus(id, status);
      return !!result;
    } catch (error) {
      console.error("Failed to update active status:", error);
      return false;
    }
  };

  const getItemId = (item: ChargeDetailsDto) => item.chargeInfo?.chargeID || 0;
  const getItemActiveStatus = (item: ChargeDetailsDto) => item.chargeInfo?.rActiveYN === "Y";

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
      render: (item: ChargeDetailsDto) => {
        if (!dropdownValues.service) return "Loading...";
        const service = dropdownValues.service.find((service) => String(service.value) === String(item.chargeInfo?.chargeType));
        return service ? service.label : "Unknown";
      },
    },
    {
      key: "chargeInfo.cShortName",
      header: "Short Name",
      visible: true,
      render: (item: ChargeDetailsDto) => item.chargeInfo?.cShortName,
    },
    {
      key: "chargeInfo.status",
      header: "Status",
      visible: true,
      render: (item: ChargeDetailsDto) => {
        const isActive = item.chargeInfo?.rActiveYN === "Y";
        return <span className="whitespace-nowrap">{isActive ? "Active" : "Hidden"}</span>;
      },
    },
    {
      key: "chargeInfo.action",
      header: "Action",
      visible: true,
      render: (item: ChargeDetailsDto) => {
        const isActive = item.chargeInfo?.rActiveYN === "Y";
        return (
          <Switch
            checked={isActive}
            onChange={() => {
              const id = item.chargeInfo?.chargeID || 0;
              handleStatusChange(id, isActive);
            }}
          />
        );
      },
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
      pagination={true}
      showExportCSV={true}
      showExportPDF={true}
      isEditButtonVisible={true}
    />
  );
};

export default ChargeDetailsSearch;
