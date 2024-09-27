import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { DeptUnitListDto } from "../../../../interfaces/HospitalAdministration/DeptunitListDto";
import { DeptUnitListService } from "../../../../services/HospitalAdministrationServices/DeptUnitListService/DeptUnitListService";

interface DeptUnitListSearchProps {
    open: boolean;
    onClose: () => void;
    onSelect: (PIC: DeptUnitListDto) => void;
}

const DeptUnitListSearch: React.FC<DeptUnitListSearchProps> = ({ open, onClose, onSelect }) => {
    const fetchItems = () =>
        DeptUnitListService.getAllDeptUnitList().then(
            (result) => result.data || []
        );

    const updateActiveStatus = async (id: number, status: boolean) => {

        const result = await DeptUnitListService.updateDeptUnitListActiveStatus(
            id,
            status
        );
        return result.success;
    };

    const getItemId = (item: DeptUnitListDto) => item.dulID;
    const getItemActiveStatus = (item: DeptUnitListDto) => item.rActiveYN === "Y";

    const columns = [
        { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
        { key: "unitDesc", header: "Unit Name", visible: true },
        { key: "deptName", header: "Department Name", visible: true },

    ]

    return (
        <GenericAdvanceSearch
            open={open}
            onClose={onClose}
            onSelect={onSelect}
            title="DEPARTMENT UNIT LIST"
            fetchItems={fetchItems}
            updateActiveStatus={updateActiveStatus}
            columns={columns}
            getItemId={getItemId}
            getItemActiveStatus={getItemActiveStatus}
            searchPlaceholder="Enter department name or code"
            isActionVisible={true}
        />
    );
};

export default DeptUnitListSearch;