import React, { useCallback, useEffect, useState } from "react";
import { Column } from "@/components/CustomGrid/CustomGrid";
import EnhancedGenericAdvanceSearch from "@/components/GenericDialog/EnhancedGenericAdvanceSearch";
import { IndentMastDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { DateFilterType, FilterDto } from "@/interfaces/Common/FilterDto";
import { showAlert } from "@/utils/Common/showAlert";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import { indentProductMastService } from "@/services/InventoryManagementService/inventoryManagementService";

interface IndentSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: IndentMastDto) => void;
}

const IndentSearchDialog: React.FC<IndentSearchDialogProps> = ({ open, onClose, onSelect }) => {
  const [statusOptions, setStatusOptions] = useState<{ label: string; value: string }[]>([]);
  const [filterConfigs, setFilterConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [indents, setIndents] = useState<IndentMastDto[]>([]);
  const [indentType, setIndentType] = useState<string>("");
  const [statusOpt, setStatusOpt] = useState<string>("");
  const [sortByDate, setSortByDate] = useState<string>("desc");
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.All);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [forceRefresh, setForceRefresh] = useState<number>(0);

  const requiredDropdowns: DropdownType[] = ["statusFilter", "department", "departmentIndent"];
  const { departmentIndent } = useDropdownValues(requiredDropdowns);

  const sortOptions = [
    { value: "asc", label: "Ascending" },
    { value: "desc", label: "Descending" },
  ];

  const [filterDto, setFilterDto] = useState<FilterDto>({
    dateFilter: DateFilterType.All,
    startDate: null,
    endDate: null,
    statusFilter: "",
    pageIndex: 1,
    pageSize: 20,
  });

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await appModifiedListService.getAll();
        const filtered = response?.data?.filter((item: any) => item.amlField === "STATUSFILTER") || [];
        const mapped = filtered.map((item: any) => ({
          value: item.amlCode,
          label: item.amlName,
        }));
        const fullOptions = [{ value: "", label: "All" }, ...mapped];
        setStatusOptions(fullOptions);
        const defaultStatusValue = "";
        setStatusOpt(defaultStatusValue);

        setFilterConfigs([
          {
            name: "indentType",
            label: "Indent Type",
            options: departmentIndent || [],
            defaultValue: "",
          },
          {
            name: "statusOpt",
            label: "Status Option",
            options: fullOptions,
            defaultValue: defaultStatusValue,
          },
          {
            name: "sortByDate",
            label: "Sort By Date",
            options: sortOptions,
            defaultValue: sortByDate,
          },
        ]);
      } catch (error) {
        setStatusOptions([{ value: "", label: "All" }]);
      }
    };

    if (open) {
      fetchStatusOptions();
    }
  }, [departmentIndent, open]);

  useEffect(() => {
    setFilterDto((prevFilterDto) => ({
      ...prevFilterDto,
      dateFilter: Number(dateFilter),
      startDate,
      endDate,
      statusFilter: statusOpt,
    }));
  }, [statusOpt, dateFilter, startDate, endDate]);

  const fetchIndents = useCallback(async (): Promise<IndentMastDto[]> => {
    setLoading(true);
    try {
      const updatedFilterDto = {
        ...filterDto,
        statusFilter: statusOpt,
        dateFilter: dateFilter,
        startDate: startDate,
        endDate: endDate,
      };

      const result = await indentProductServices.getAllIndents(updatedFilterDto);
      if (result.success && result.data) {
        let fetchedIndents = result.data.items || [];
        if (indentType) {
          fetchedIndents = fetchedIndents.filter((indent) => indent.indentType === indentType);
        }
        fetchedIndents = [...fetchedIndents].sort((a, b) => {
          const dateA = new Date(a.indentDate || "").getTime();
          const dateB = new Date(b.indentDate || "").getTime();
          return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
        });
        setIndents(fetchedIndents);
        return fetchedIndents;
      } else {
        showAlert("Error", result.errorMessage || "Failed to fetch indents", "error");
        setIndents([]);
        return [];
      }
    } catch (error) {
      showAlert("Error", "An error occurred while fetching indents", "error");
      setIndents([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filterDto, indentType, statusOpt, dateFilter, startDate, endDate, sortByDate]);

  useEffect(() => {
    if (open) {
      fetchIndents();
    }
  }, [open, filterDto, indentType, sortByDate, forceRefresh]);

  const handleFilterChange = useCallback((filterName: string, value: string | number) => {
    switch (filterName) {
      case "statusOpt":
        setStatusOpt(value as string);
        break;
      case "indentType":
        setIndentType(value as string);
        break;
      case "sortByDate":
        setSortByDate(value as string);
        break;
      default:
        break;
    }
    setForceRefresh((prev) => prev + 1);
  }, []);

  const handleDateFilterChange = useCallback((filterType: DateFilterType) => {
    setDateFilter(filterType);
    setForceRefresh((prev) => prev + 1);
  }, []);

  const handleDateRangeChange = useCallback((start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    setForceRefresh((prev) => prev + 1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const updateActiveStatus = useCallback(async (id: number, status: boolean) => {
    try {
      const result = await indentProductMastService.updateActiveStatus(id, status);
      if (result && result.success) {
        showAlert("Success", "Status updated successfully.", "success");
        setIndents((prevIndents) => prevIndents.map((item) => (item.indentID === id ? { ...item, indStatus: status ? "Active" : "Hidden" } : item)));
        return true;
      }
      return false;
    } catch (error) {
      showAlert("Error", "Failed to update status.", "error");
      return false;
    }
  }, []);

  const customIndentFilter = (item: IndentMastDto, searchValue: string): boolean => {
    if (!searchValue) return true;

    const searchLower = searchValue.toLowerCase();
    return (
      item.indentCode?.toLowerCase().includes(searchLower) ||
      false ||
      item.indentNo?.toLowerCase().includes(searchLower) ||
      false ||
      item.indentType?.toLowerCase().includes(searchLower) ||
      false ||
      item.indStatus?.toLowerCase().includes(searchLower) ||
      false ||
      item.fromDeptName?.toLowerCase().includes(searchLower) ||
      false ||
      item.toDeptName?.toLowerCase().includes(searchLower) ||
      false ||
      item.createdBy?.toLowerCase().includes(searchLower) ||
      false ||
      item.remarks?.toLowerCase().includes(searchLower) ||
      false
    );
  };

  const getItemId = (item: IndentMastDto) => item.indentID;
  const getItemActiveStatus = (item: IndentMastDto) => item.rActiveYN === "Y";

  // Handle the edit action to pass the selected indent back to the parent
  const handleEditClick = (item: IndentMastDto) => {
    if (item && item.indentID) {
      onSelect(item);
    } else {
      showAlert("Warning", "Invalid indent selected", "warning");
    }
  };

  // Table columns configuration
  const columns: Column<IndentMastDto>[] = [
    { key: "indentCode", header: "Indent No", visible: true, sortable: true },
    { key: "fromDeptName", header: "From Department", visible: true, sortable: true },
    { key: "toDeptName", header: "To Department", visible: true, sortable: true },
    { key: "indentDate", header: "Date", visible: true, sortable: true },
    { key: "indStatus", header: "Record Status", visible: true, sortable: true },
    { key: "createdBy", header: "Created By", visible: true, sortable: true },
    { key: "indentType", header: "Indent Type", visible: true, sortable: true },
    { key: "remarks", header: "Remarks", visible: true, sortable: true },
  ];

  return (
    <EnhancedGenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Search Indents"
      fetchItems={fetchIndents}
      items={indents}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Search by indent no, type, status..."
      onSearchChange={handleSearchChange}
      isEditButtonVisible={true}
      isStatusVisible={true}
      isActionVisible={true}
      showExportCSV={true}
      showExportPDF={true}
      pagination={true}
      customFilter={customIndentFilter}
      showFilters={true}
      filterConfigs={filterConfigs}
      onFilterChange={handleFilterChange}
      onEdit={handleEditClick} // Added explicit edit handler
      dateFilterOptions={{
        showDateFilter: true,
        onDateFilterChange: handleDateFilterChange,
        onDateRangeChange: handleDateRangeChange,
      }}
      dialogProps={{
        maxWidth: "lg",
        fullWidth: true,
        dialogContentSx: {
          minHeight: "600px",
          maxHeight: "600px",
        },
      }}
    />
  );
};

export default IndentSearchDialog;
