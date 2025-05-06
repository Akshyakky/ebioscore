import React, { useCallback, useEffect, useState } from "react";
import { Column } from "@/components/CustomGrid/CustomGrid";
import EnhancedGenericAdvanceSearch from "@/components/GenericDialog/EnhancedGenericAdvanceSearch";
import { IndentMastDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { DateFilterType, FilterDto } from "@/interfaces/Common/FilterDto";
import { showAlert } from "@/utils/Common/showAlert";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";

interface IndentSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: IndentMastDto) => void;
}

const IndentSearchDialog: React.FC<IndentSearchDialogProps> = ({ open, onClose, onSelect }) => {
  // Define your column configuration

  const [statusOptions, setStatusOptions] = useState<{ label: string; value: string }[]>([]);
  const [filterConfigs, setFilterConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [indents, setIndents] = useState<IndentMastDto[]>([]);
  const [selectedIndent, setSelectedIndent] = useState<IndentMastDto | null>(null);
  const [indentType, setIndentType] = useState<string>("Department Indent");
  const [status, setStatus] = useState<string>(""); // initially empty, will be set from fetched options
  const [sortByDate, setSortByDate] = useState<string>("Descending");
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.All);
  const requiredDropdowns: DropdownType[] = ["statusFilter", "department", "departmentIndent"];
  const { departmentIndent } = useDropdownValues(requiredDropdowns);
  const sortOptions = [
    { value: "asc", label: " Ascending" },
    { value: "desc", label: "Desceinding" },
  ];
  const [filterDto] = useState<FilterDto>({
    dateFilter: DateFilterType.All, // <-- use enum value
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

        const defaultStatusValue = mapped.length > 0 ? mapped[0].value : "";
        setStatus(defaultStatusValue); // <-- this sets the actual status code like DIPCD

        setFilterConfigs([
          {
            name: "indentType",
            label: "Indent Type",
            options: departmentIndent || [],
            defaultValue: "",
          },
          {
            name: "status",
            label: "Status",
            options: fullOptions,
            defaultValue: defaultStatusValue,
          },
          {
            name: "sortByDate",
            label: "Sort By Date",
            options: sortOptions,
            defaultValue: "asc",
          },
        ]);
      } catch (error) {
        console.error("Error fetching status options", error);
        setStatusOptions([{ value: "", label: "All" }]);
      }
    };

    fetchStatusOptions();
  }, [departmentIndent]);

  const handleFilterChange = (filterName: string, value: string | number) => {
    if (filterName === "status") {
      setStatus(value as string);
    }
    if (filterName === "indentType") {
      setIndentType(value as string);
    }
    if (filterName === "sortByDate") {
      setSortByDate(value as string);
    }
  };

  useEffect(() => {
    if (open) {
      fetchIndents(); // call when dialog is open and filters change
    }
  }, [status, indentType, sortByDate, dateFilter, open]);

  // Define your fetch function
  const fetchIndents = useCallback(async (): Promise<IndentMastDto[]> => {
    setLoading(true);
    try {
      const updatedFilterDto: FilterDto = {
        ...filterDto,
        dateFilter,
        statusFilter: status,
      };

      const result = await indentProductServices.getAllIndents(updatedFilterDto);

      if (result.success && result.data) {
        let fetchedIndents = result.data.items || [];

        fetchedIndents = [...fetchedIndents].sort((a, b) => {
          const dateA = new Date(a.indentDate || "").getTime();
          const dateB = new Date(b.indentDate || "").getTime();
          return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
        });

        setIndents(fetchedIndents); // for internal state
        return fetchedIndents; // for EnhancedGenericAdvanceSearch
      } else {
        showAlert("Error", result.errorMessage || "Failed to fetch indents", "error");
        return [];
      }
    } catch (error) {
      showAlert("Error", "An error occurred while fetching indents", "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [status, indentType, sortByDate, dateFilter, filterDto]);

  // Define your status update function
  const updateIndentStatus = async (id: number, status: boolean): Promise<boolean> => {
    try {
      // Replace with your actual API call
      await fetch(`/api/indents/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: status }),
      });
      return true;
    } catch (error) {
      console.error("Error updating indent status:", error);
      return false;
    }
  };

  const columns: Column<IndentMastDto>[] = [
    { key: "indentCode", header: "Indent No", visible: true, sortable: true },

    { key: "fromDeptName", header: "From Department ", visible: true, sortable: true },
    { key: "toDeptName", header: "To Department ", visible: true, sortable: true },

    {
      key: "indentDate",
      header: " Date",
      visible: true,
      sortable: true,
    },
    { key: "indStatus", header: "Record Status", visible: true, sortable: true },
    { key: "createdBy", header: "Created BY", visible: true, sortable: true },
    { key: "indentType", header: "Indent Type", visible: true, sortable: true },
    { key: "remarks", header: "Remarks", visible: true, sortable: true },

    // Add other columns as needed
  ];

  // Handle filter changes

  // Handle date filter changes
  const handleDateFilterChange = (filterType: DateFilterType) => {
    console.log("Date filter changed to:", filterType);
    // You can implement additional logic here if needed
  };

  // Handle date range selection
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    console.log("Date range selected:", { startDate, endDate });
    // You can implement additional logic here if needed
  };

  // Custom filter function (optional)
  const customIndentFilter = (item: IndentMastDto, searchValue: string): boolean => {
    if (!searchValue) return true;

    const searchLower = searchValue.toLowerCase();
    return (
      item.indentNo?.toLowerCase().includes(searchLower) ||
      false ||
      item.indentType?.toLowerCase().includes(searchLower) ||
      false ||
      item.status?.toLowerCase().includes(searchLower) ||
      false ||
      item.department?.toLowerCase().includes(searchLower) ||
      false
    );
  };

  return (
    <EnhancedGenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Search Indents"
      fetchItems={fetchIndents}
      updateActiveStatus={updateIndentStatus}
      columns={columns}
      getItemId={(item: any) => item.id}
      getItemActiveStatus={(item: any) => item.status === "Active"} // Adjust based on your data structure
      searchPlaceholder="Search by indent no, type, status..."
      isEditButtonVisible={true}
      isStatusVisible={true}
      isActionVisible={true}
      showExportCSV={true}
      showExportPDF={true}
      pagination={true}
      customFilter={customIndentFilter}
      // Filter options
      showFilters={true}
      filterConfigs={filterConfigs}
      onFilterChange={handleFilterChange}
      dateFilterOptions={{
        showDateFilter: true,
        // onDateFilterChange: handleDateFilterChange,
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
