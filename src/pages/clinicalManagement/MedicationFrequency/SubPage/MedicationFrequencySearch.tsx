import React from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationFrequencyDto } from "../../../../interfaces/ClinicalManagement/MedicationFrequencyDto";
import { medicationFrequencyService } from "@/services/ClinicalManagementServices/clinicalManagementService";

interface MedicationFrequencySearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (medicationFrequency: MedicationFrequencyDto) => void;
}

const MedicationFrequencySearch: React.FC<MedicationFrequencySearchProps> = ({ open, onClose, onSelect }) => {
    const fetchItems = async () => {
        try {
            const items = await medicationFrequencyService.getAll();
            return items.data || [];
        } catch (error) {
            return [];
        }
    };

    const updateActiveStatus = async (id: number, status: boolean) => {
        try {
            return await medicationFrequencyService.updateActiveStatus(id, status);
        } catch (error) {
            return false;
        }
    };

    const getItemId = (item: MedicationFrequencyDto) => item.mFrqId;
    const getItemActiveStatus = (item: MedicationFrequencyDto) => item.rActiveYN === "Y";

    const columns = [
        { key: "serialNumber", header: "Sl.No", visible: true },
        { key: "mFrqCode", header: "Medication Frequency Code", visible: true },
        { key: "mFrqSnomedCode", header: "Medication Frequency Snomed Code", visible: true },
        { key: "mFrqName", header: "Medication Frequency Name", visible: true },
        {
            key: "modifyYN",
            header: "Modifiable",
            visible: true,
            render: (row: MedicationFrequencyDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
        },
        {
            key: "defaultYN",
            header: "Default",
            visible: true,
            render: (row: MedicationFrequencyDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
        },
        { key: "rNotes", header: "Notes", visible: true },
    ];

    return (
        <GenericAdvanceSearch
            isEditButtonVisible={true}
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="MEDICATION FREQUENCY"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={getItemId}
            getItemActiveStatus={getItemActiveStatus}
            searchPlaceholder="Enter medication frequency code or text"
            isStatusVisible={(item: MedicationFrequencyDto) => item.modifyYN === "Y"}
            isActionVisible={(item: MedicationFrequencyDto) => item.modifyYN === "Y"}
        />
    );
};

export default MedicationFrequencySearch;
