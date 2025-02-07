import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ReasonListData } from "@/interfaces/frontOffice/ReasonListData";
import { LInvMastDto } from "@/interfaces/Laboratory/LInvMastDto";
import { reasonListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import React from "react";

interface InvestigationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: LInvMastDto) => void;
}

const InvestigationListSearch: React.FC<InvestigationListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    const result = await reasonListService.getAll();

    return result.success && result.data ? result.data : [];
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await reasonListService.updateActiveStatus(id, status);
    return result;
  };

  const columns = [
    { key: "arlCode", header: "Reason Code", visible: true },
    { key: "arlName", header: "Reason Description", visible: true },
    { key: "arlDuration", header: "Duration", visible: true },
    { key: "rlName", header: "Resource", visible: true },
    { key: "rNotes", header: "Instructions", visible: true },
  ];

  return (
    <GenericAdvanceSearch<LInvMastDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="INVESTIGATION SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.arlID}
      getItemActiveStatus={(item) => item.rActiveYN === "Y"}
      searchPlaceholder="Enter reason name or code"
      isEditButtonVisible={true}
      isActionVisible={true}
    />
  );
};

export default InvestigationListSearch;
