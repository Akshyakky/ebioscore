import React from "react";
import { WardCategoryDto } from "../../../../interfaces/HospitalAdministration/WardCategoryDto";
import { WardCategoryService } from "../../../../services/HospitalAdministrationServices/ContactListService/WardCategoryService/WardCategoryService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";

interface WardCategorySearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (wardCategory: WardCategoryDto) => void;
}

const WardCategorySearch: React.FC<WardCategorySearchProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const fetchItems = () =>
        WardCategoryService.getAllWardCategory().then(
            (result) => result.data || []
        );

    const updateActiveStatus = async (id: number, status: boolean) => {
        const result = await WardCategoryService.updateWardCategoryActiveStatus(
            id,
            status
        );
        return result.success;
    };

    const getItemId = (item: WardCategoryDto) => item.wCatID;
    const getItemActiveStatus = (item: WardCategoryDto) => item.rActiveYN === "Y";

    const columns = [
        { key: "serialNumber", header: "Sl No", visible: true },
        { key: "wCatCode", header: "Ward Category Code", visible: true },
        { key: "wCatName", header: "Ward Category Name", visible: true },
        { key: "rNotes", header: "Remarks", visible: true },
    ];

    return (
        <GenericAdvanceSearch
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="Ward Category List"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={getItemId}
            getItemActiveStatus={getItemActiveStatus}
            searchPlaceholder="Enter Ward Category name or code"
        />
    );
};

export default WardCategorySearch;
