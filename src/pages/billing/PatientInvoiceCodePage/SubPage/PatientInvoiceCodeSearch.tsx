import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import { patientInvioceService } from "@/services/BillingServices/BillingGenericService";
import React from "react";

interface PatientInvoiceCodeSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: BPatTypeDto) => void;
}

const PatientInvoiceCodeSearch: React.FC<PatientInvoiceCodeSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = () => patientInvioceService.getAll().then((result) => result.data || []);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await patientInvioceService.updateActiveStatus(id, status);
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
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default PatientInvoiceCodeSearch;
