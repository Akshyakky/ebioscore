import React from "react";
import { BPayTypeDto } from "../../../../interfaces/Billing/BPayTypeDto";
import { PaymentTypesService } from "../../../../services/BillingServices/PaymentTypesService";
import CommonSearchDialog from "../../../../components/Dialog/CommonSearchDialog";

interface PaymentTypesSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (pay: BPayTypeDto) => void;
}

const PaymentTypesSearch: React.FC<PaymentTypesSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const fetchItems = () =>
    PaymentTypesService.getAllBPayTypes().then((result) => result.data || []);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await PaymentTypesService.updateBPayTypeActiveStatus(
      id,
      status
    );
    return result.success; // Extracting the boolean value from the OperationResult
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
    <CommonSearchDialog
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Payment Type CODE LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus} // This now returns a Promise<boolean>
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Payment name or code"
    />
  );
};

export default PaymentTypesSearch;
