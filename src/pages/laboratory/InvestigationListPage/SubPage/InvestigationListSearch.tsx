import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { investigationDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import React, { ChangeEvent, useEffect, useState } from "react";

interface InvestigationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (investigation: investigationDto) => void;
  onEdit?: (investigation: investigationDto) => void;
}

const InvestigationListSearch: React.FC<InvestigationListSearchProps> = ({ open, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInvestigations, setFilteredInvestigations] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);

  const fetchItems = async () => {
    const result = await investigationlistService.getAll();
    const data = result.success && result.data ? result.data : [];

    setInvestigations(data); // ✅ fix added
    setFilteredInvestigations(data); // ✅ also set this initially
    return data;
  };

  useEffect(() => {
    if (open) {
      fetchItems(); // ✅ This now sets investigations properly
    }
  }, [open]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvestigations(investigations);
    } else {
      const lowerTerm = searchTerm.toLowerCase().trim();
      const filtered = investigations.filter((inv) => {
        const { invName = "", invID = "", invCode = "", invShortName = "", invType = "" } = inv.lInvMastDto || {};
        return (
          invName.toLowerCase().includes(lowerTerm) ||
          invID.toString().toLowerCase().includes(lowerTerm) ||
          invCode.toLowerCase().includes(lowerTerm) ||
          invShortName.toLowerCase().includes(lowerTerm) ||
          invType.toLowerCase().includes(lowerTerm)
        );
      });
      setFilteredInvestigations(filtered);
    }
  }, [searchTerm, investigations]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    debugger;
    const result = await investigationlistService.updateActiveStatus(id, status);

    setInvestigations((prev) =>
      prev.map((inv) => {
        if (inv.lInvMastDto?.invID === id) {
          return {
            ...inv,
            lInvMastDto: {
              ...inv.lInvMastDto,
              rActiveYN: status ? "Y" : "N",
            },
          };
        }
        return inv;
      })
    );

    return result;
  };

  const columns = [
    { key: "invCode", header: "Investigation Code", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invCode || "" },
    { key: "invName", header: "Name", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invName || "" },
    { key: "invShortName", header: "Short Name", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invShortName || "" },
    { key: "invType", header: "Type", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invType || "" },
  ];

  return (
    <GenericAdvanceSearch<investigationDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="INVESTIGATION SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.lInvMastDto?.invID || 0}
      getItemActiveStatus={(item) => item.lInvMastDto?.rActiveYN === "Y"}
      searchPlaceholder="Search by Investigation Code, Name, Type, Department"
      isEditButtonVisible={true}
      isActionVisible={true}
      isStatusVisible={true}
    />
  );
};

export default InvestigationListSearch;
