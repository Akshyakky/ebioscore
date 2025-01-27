import React, { useMemo, useCallback, useState, useEffect } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import { useAppSelector } from "@/store/hooks";
import EditIcon from "@mui/icons-material/Edit";
import CustomSwitch from "@/components/Checkbox/ColorSwitch";

interface MedicationFormSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (medicationForm: MedicationFormDto) => void;
}

const MedicationFormSearch: React.FC<MedicationFormSearchProps> = ({ open, onClose, onSelect }) => {
  const medicationFormService = useMemo(() => createEntityService<MedicationFormDto>("MedicationForm", "clinicalManagementURL"), []);
  const user = useAppSelector((state) => state.auth);
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});
  const [items, setItems] = useState<MedicationFormDto[]>([]);

  const fetchItems = async () => {
    try {
      const response = await medicationFormService.getAll();
      if (response.data) {
        setItems(response.data);
        const initialSwitchStatus = response.data.reduce((statusMap: { [key: number]: boolean }, item: MedicationFormDto) => {
          statusMap[item.mFID] = item.rActiveYN === "Y";
          return statusMap;
        }, {});
        setSwitchStatus(initialSwitchStatus);
      }
      return response.data || [];
    } catch (error) {
      console.error("Error fetching medication forms:", error);
      return [];
    }
  };

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const handleActiveToggle = async (row: MedicationFormDto, status: boolean) => {
    if (isUpdating[row.mFID]) return; // Prevent multiple simultaneous updates

    try {
      setIsUpdating((prev) => ({ ...prev, [row.mFID]: true }));
      setSwitchStatus((prev) => ({ ...prev, [row.mFID]: status }));
      const updatedItem = { ...row, rActiveYN: status ? "Y" : "N" };
      const result = await medicationFormService.save(updatedItem);
      if (result && result.success) {
        setItems((prevItems) => prevItems.map((item) => (item.mFID === row.mFID ? { ...item, rActiveYN: status ? "Y" : "N" } : item)));
        const message = status ? `${row.mFName} activated successfully` : `${row.mFName} deactivated successfully`;
        showAlert("Success", message, "success");
      } else {
        setSwitchStatus((prev) => ({ ...prev, [row.mFID]: !status }));
        showAlert("Error", "Failed to update status", "error");
      }
    } catch (error) {
      setSwitchStatus((prev) => ({ ...prev, [row.mFID]: !status }));
      showAlert("Error", "An error occurred while updating the status", "error");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [row.mFID]: false }));
    }
  };

  const handleEdit = useCallback(
    async (row: MedicationFormDto) => {
      try {
        onSelect(row);
        onClose();
      } catch (error) {
        showAlert("Error", "An error occurred while fetching field details.", "error");
      }
    },
    [onSelect, onClose]
  );

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationFormService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating medication form active status:", error);
      return false;
    }
  };

  const getItemId = (item: MedicationFormDto) => item.mFID;
  const getItemActiveStatus = (item: MedicationFormDto) => switchStatus[item.mFID] ?? item.rActiveYN === "Y";

  const columns = [
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row: MedicationFormDto) => {
        if (row.modifyYN === "Y" || user.adminYN === "Y") {
          return <CustomButton onClick={() => handleEdit(row)} icon={EditIcon} text="Edit" variant="contained" size="small" />;
        }
        return null;
      },
    },
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "mFCode", header: "Medication Form Code", visible: true },
    { key: "mFSnomedCode", header: "Medication Form Snomed Code", visible: true },
    { key: "mFName", header: "Medication Form Name", visible: true },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: MedicationFormDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: MedicationFormDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    { key: "rNotes", header: "Notes", visible: true },
    {
      key: "activeStatus",
      header: "Active Status",
      visible: true,
      render: (row: MedicationFormDto) => {
        if (row.modifyYN === "Y") {
          return (
            <CustomSwitch
              checked={switchStatus[row.mFID] ?? row.rActiveYN === "Y"}
              onChange={(e) => handleActiveToggle(row, e.target.checked)}
              color="primary"
              disabled={isUpdating[row.mFID]}
            />
          );
        }
        return null;
      },
    },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION FORM"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter medication form code or text"
    />
  );
};

export default MedicationFormSearch;
