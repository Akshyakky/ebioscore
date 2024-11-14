import React from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { reasonListService } from "../../../../services/FrontOfficeServices/FrontOfiiceApiServices";
import { ReasonListData } from "../../../../interfaces/frontOffice/ReasonListData";

interface ReasonListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: ReasonListData) => void;
}

const ReasonListSearch: React.FC<ReasonListSearchProps> = ({ open, onClose, onSelect }) => {
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
    <GenericAdvanceSearch<ReasonListData>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="REASON SEARCH LIST"
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

export default ReasonListSearch;
