// src/components/MedicalEntitySearch/MedicalEntitySearch.tsx
import React, { useCallback } from "react";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";

interface MedicalEntitySearchProps<T extends BaseDto> {
  open: boolean;
  onClose: () => void;
  onSelect: (data: T) => void;
  title: string;
  entityName: string;
  serviceUrl: string;
  columns: Array<{
    key: string;
    header: string;
    visible: boolean;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
  }>;
  getItemId: (item: T) => number;
  searchPlaceholder: string;
  isStatusVisible?: boolean | ((item: T) => boolean);
  isActionVisible?: boolean | ((item: T) => boolean);
  customFilter?: (item: T, searchValue: string) => boolean;
}

export function MedicalEntitySearch<T extends BaseDto>({
  open,
  onClose,
  onSelect,
  title,
  entityName,
  serviceUrl,
  columns,
  getItemId,
  searchPlaceholder,
  isStatusVisible = true,
  isActionVisible = true,
  customFilter,
}: MedicalEntitySearchProps<T>) {
  const entityService = React.useMemo(() => createEntityService<T>(entityName, serviceUrl), [entityName, serviceUrl]);

  const fetchItems = useCallback(async () => {
    try {
      const result = await entityService.getAll();
      return result.success ? result.data : [];
    } catch (error) {
      console.error(`Error fetching ${entityName} details:`, error);
      showAlert("Error", `Failed to fetch ${entityName} details.`, "error");
      return [];
    }
  }, [entityService, entityName]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await entityService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result.success;
      } catch (error) {
        console.error(`Error updating ${entityName} active status:`, error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [entityService, entityName]
  );

  const getItemActiveStatus = useCallback((item: T) => {
    return (item as any).rActiveYN === "Y";
  }, []);

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title={title}
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder={searchPlaceholder}
      isActionVisible={isActionVisible}
      isEditButtonVisible={true}
      isStatusVisible={isStatusVisible}
      customFilter={customFilter}
    />
  );
}

export default MedicalEntitySearch;
