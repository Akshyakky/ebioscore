import React from 'react';
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { ProductTaxListDto } from "../../../../interfaces/InventoryManagement/ProductTaxListDto";
import { ProductTaxListService } from '../../../../services/InventoryManagementService/ProductListService/ProductTaxListService';

interface ProductTaxListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (productTax: ProductTaxListDto) => void;
}

const ProductTaxListSearch: React.FC<ProductTaxListSearchProps> = ({ open, onClose, onSelect }) => {
    const fetchItems = () =>
        ProductTaxListService.getAllProductTaxList().then(
            (result) => result.data || []
        );


    const updateActiveStatus = async (id: number, status: boolean) => {
        const result = await ProductTaxListService.updateProductTaxListActiveStatus(
            id,
            status
        );
        return result.success;
    };

    const getItemId = (item: ProductTaxListDto) => item.pTaxID;
    const getItemActiveStatus = (item: ProductTaxListDto) => item.rActiveYN === "Y";

    const columns = [
        { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
        { key: "pTaxCode", header: "Tax Code", visible: true },
        { key: "pTaxName", header: "Tax Name", visible: true },
        { key: "pTaxAmt", header: "Tax Amount", visible: true },
    ];

    return (
        <GenericAdvanceSearch
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="PRODUCT TAX LIST"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={getItemId}
            getItemActiveStatus={getItemActiveStatus}
            searchPlaceholder="Enter tax code or name"
            isActionVisible={true}
            isEditButtonVisible={true}
            isStatusVisible={true}
        />
    );
};

export default ProductTaxListSearch;