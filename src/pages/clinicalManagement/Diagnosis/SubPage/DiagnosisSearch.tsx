import React, { useCallback, useMemo } from 'react';
import GenericAdvanceSearch from '../../../../components/GenericDialog/GenericAdvanceSearch';
import { IcdDetailDto } from '../../../../interfaces/ClinicalManagement/IcdDetailDto';
import { createEntityService } from '../../../../utils/Common/serviceFactory';
import { showAlert } from "../../../../utils/Common/showAlert";

interface DiagnosisSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (diagnosis: IcdDetailDto) => void;
}

const DiagnosisSearch: React.FC<DiagnosisSearchProps> = ({ open, onClose, onSelect }) => {
    const icdDetailService = useMemo(() => createEntityService<IcdDetailDto>('IcdDetail', 'clinicalManagementURL'), []);

    const fetchItems = useCallback(async () => {
        try {
            const result = await icdDetailService.getAll();
            return result.success ? result.data : [];
        } catch (error) {
            console.error("Error fetching ICD details:", error);
            showAlert("Error", "Failed to fetch ICD details.", "error");
            return [];
        }
    }, [icdDetailService]);

    const updateActiveStatus = useCallback(async (id: number, status: boolean) => {
        try {
            const result = await icdDetailService.updateActiveStatus(id, status);
            if (result) {
                showAlert("Success", "Status updated successfully.", "success");
            }
            return result;
        } catch (error) {
            console.error("Error updating ICD detail active status:", error);
            showAlert("Error", "Failed to update status.", "error");
            return false;
        }
    }, [icdDetailService]);

    const getItemId = useCallback((item: IcdDetailDto) => item.icddId, []);
    const getItemActiveStatus = useCallback((item: IcdDetailDto) => item.rActiveYN === "Y", []);

    const columns = useMemo(() => [
        { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
        { key: "icddCode", header: "ICD Code", visible: true },
        { key: "icddName", header: "ICD Name", visible: true },
        { key: "icddVer", header: "Version", visible: true },
        { key: "icddNameGreek", header: "Greek Name", visible: true },
    ], []);

    return (
        <GenericAdvanceSearch
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="ICD DETAIL LIST"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={getItemId}
            getItemActiveStatus={getItemActiveStatus}
            searchPlaceholder="Enter ICD code or name"
            isActionVisible={true}
            isEditButtonVisible={true}
            isStatusVisible={true}
        />
    );
};

export default React.memo(DiagnosisSearch);