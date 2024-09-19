//for reference how to work with generic service
import React, { useState, useEffect } from 'react';
import { productGroupService, productSubGroupService } from './../../services/GenericEntityService/GenericEntityService';
import { ProductSubGroupDto } from '../../interfaces/InventoryManagement/ProductSubGroupDto';
import { ProductGroupDto } from '../../interfaces/InventoryManagement/ProductGroupDto';

const EntityList: React.FC = () => {
    const [productSubGroups, setProductSubGroups] = useState<ProductSubGroupDto[]>([]);
    const [productGroups, setProductGroups] = useState<ProductGroupDto[]>([]);
    const [nextSubGroupCode, setNextSubGroupCode] = useState<string>('');
    const [nextGroupCode, setNextGroupCode] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subGroups = await productSubGroupService.getAll();
                setProductSubGroups(subGroups);

                const groups = await productGroupService.getAll();
                setProductGroups(groups);

                const subGroupCode = await productSubGroupService.getNextCode();
                setNextSubGroupCode(subGroupCode);

                const groupCode = await productGroupService.getNextCode();
                setNextGroupCode(groupCode);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // ... rest of your component logic

    return (
        <div>
            <h2>Product Sub Groups</h2>
            <p>Next available code: {nextSubGroupCode}</p>
            {/* Render your list of product sub groups */}

            <h2>Product Groups</h2>
            <p>Next available code: {nextGroupCode}</p>
            {/* Render your list of product groups */}
        </div>
    );
};

export default EntityList;