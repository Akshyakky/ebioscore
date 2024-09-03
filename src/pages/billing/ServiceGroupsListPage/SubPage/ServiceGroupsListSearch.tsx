import React from "react";
import { BServiceGrpDto } from "../../../../interfaces/Billing/BServiceGrpDto";
import { ServiceGroupListCodeService } from "../../../../services/BillingServices/ServiceGroupsListService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";

interface ServiceGroupsListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (SGRP: BServiceGrpDto) => void;
}

const ServiceGroupsListSearch: React.FC<ServiceGroupsListSearchProps> = ({ open, onClose, onSelect }) => {
    const fetchItems = async () => {
        const result = await ServiceGroupListCodeService.getAllBServiceGrps();
        return result.success && result.data ? result.data : [];
    };

    const updateActiveStatus = async (id: number, status: boolean) => {
        const result = await ServiceGroupListCodeService.updateBServiceGrpActiveStatus(id, status);
        return result.success;
    };

    const columns = [
        { key: "serialNumber", header: "Sl No", visible: true },
        { key: "sGrpCode", header: "Service Group Code", visible: true },
        { key: "sGrpName", header: "Service Group Name", visible: true },
        { key: "rNotes", header: "Remarks", visible: true },
    ];

    return (
        <GenericAdvanceSearch<BServiceGrpDto>
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="Service Group List"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={(item) => item.sGrpID}
            getItemActiveStatus={(item) => item.rActiveYN === "Y"}
            searchPlaceholder="Enter resource name or code"
        />
    );
};

export default ServiceGroupsListSearch;