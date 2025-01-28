import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { paymentTypeService } from "@/services/BillingServices/BillingGenericService";
import React from "react";

interface PaymentTypesSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pay: BPayTypeDto) => void;
}

const PaymentTypesSearch: React.FC<PaymentTypesSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = () => paymentTypeService.getAll().then((result) => result.data || []);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await paymentTypeService.updateActiveStatus(id, status);
    return result;
  };

  const getItemId = (item: BPayTypeDto) => item.payID;
  const getItemActiveStatus = (item: BPayTypeDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "payCode", header: "Payment Type Code", visible: true },
    { key: "payName", header: "Payment Type Name", visible: true },
    { key: "payMode", header: "Payment Mode", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Payment Type Code List"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Payment name or code"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default PaymentTypesSearch;
