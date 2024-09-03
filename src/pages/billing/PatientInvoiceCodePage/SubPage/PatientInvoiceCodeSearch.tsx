import React from "react";
import { BPatTypeDto } from "../../../../interfaces/Billing/BPatTypeDto";
import { PatientInvoiceCodeService } from "../../../../services/BillingServices/PatientInvoiceService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";

interface PatientInvoiceCodeSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: BPatTypeDto) => void;
}

const PatientInvoiceCodeSearch: React.FC<PatientInvoiceCodeSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const fetchItems = () =>
    PatientInvoiceCodeService.getAllBPatTypes().then(
      (result) => result.data || []
    );

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await PatientInvoiceCodeService.updateBPatTypeActiveStatus(
      id,
      status
    );
    return result.success;
  };

  const getItemId = (item: BPatTypeDto) => item.pTypeID;
  const getItemActiveStatus = (item: BPatTypeDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "pTypeCode", header: "Patient Invoice Code", visible: true },
    { key: "pTypeName", header: "Patient Invoice Name", visible: true },
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
    />
  );
};

export default PatientInvoiceCodeSearch;
