import React, { useCallback, useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentProductDetails from "../SubPage/IndentProductList";
import IndentSearchDialog from "../SubPage/IndentProductSearch";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";
import dayjs from "dayjs";
import { indentProductDetailService } from "@/services/InventoryManagementService/inventoryManagementService";

const IndentProductPage: React.FC = () => {
  const [department, setDepartment] = useState({ id: 0, name: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IndentSaveRequestDto | null>(null);
  const [indentDetails, setIndentDetails] = useState<IndentDetailDto[]>([]);
  const { setLoading } = useLoading();

  const handleDepartmentSelect = useCallback((id: number, name: string) => {
    setDepartment({ id, name });
    setIsDialogOpen(false);
  }, []);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleCreateNew = () => {
    setSelectedData(null); // Clear any selected indent to start fresh
  };

  const onIndentDetailsChange = (updatedDetails: IndentDetailDto[]) => {
    setIndentDetails(updatedDetails);
  };

  // Function to fetch the complete indent data when an indent is selected for editing
  // Inside fetchIndentDetails function
  const fetchIndentDetails = useCallback(
    async (indentId: number) => {
      try {
        setLoading(true);

        // Fetch master and detail data in parallel
        const [masterResult, detailsResult] = await Promise.all([indentProductServices.getIndentById(indentId), indentProductDetailService.getById(indentId)]);

        if (!masterResult.success || !masterResult.data) {
          showAlert("Error", masterResult.errorMessage || "Failed to fetch indent details", "error");
          return null;
        }

        // Process details data
        const details = Array.isArray(detailsResult.data) ? detailsResult.data : detailsResult.data ? [detailsResult.data] : [];

        // Format details array
        const formattedDetails = details.map((detail: any) => ({
          indentDetID: detail.indentDetID || 0,
          productID: detail.productID || 0,
          productName: detail.productName || "",
          productCode: detail.productCode || "",
          requiredQty: detail.requiredQty || 0,
          deptIssualYN: detail.deptIssualYN || "N",
          supplierName: detail.supplierName || "",
          pUnitName: detail.pUnitName || "",
          catValue: detail.catValue || "",
          hsnCode: detail.hsnCode || "",
          ...detail, // Include any other properties
        }));

        // Create the complete indent data
        const indentData: IndentSaveRequestDto = {
          id: masterResult.data.indentMaster?.indentID || 0,
          rActiveYN: masterResult.data.indentMaster?.rActiveYN || "Y",
          IndentMaster: {
            ...masterResult.data.indentMaster,
            indentDate: masterResult.data.indentMaster?.indentDate ? dayjs(masterResult.data.indentMaster.indentDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
          },
          IndentDetails: formattedDetails,
        };

        setSelectedData(indentData);
        setIndentDetails(formattedDetails);
        return indentData;
      } catch (error) {
        console.error("Error fetching indent details:", error);
        showAlert("Error", "An error occurred while fetching indent details", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const handleIndentSelect = async (indentMastDto: IndentMastDto) => {
    if (!indentMastDto || !indentMastDto.indentID) {
      showAlert("Warning", "Invalid indent selected", "warning");
      return;
    }

    // Fetch the complete indent details for editing
    await fetchIndentDetails(indentMastDto.indentID);
    setIsSearchOpen(false); // Close the search dialog after selection
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleOpenSearch,
    },
  ];

  return (
    <>
      {department.id > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ mb: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>

          <IndentProductDetails
            selectedData={selectedData}
            selectedDeptId={department.id}
            selectedDeptName={department.name}
            handleDepartmentChange={() => setIsDialogOpen(true)}
            onIndentDetailsChange={onIndentDetailsChange}
          />
        </Container>
      )}

      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={department.id}
        requireSelection
      />

      {/* Indent Search Dialog */}
      <IndentSearchDialog open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleIndentSelect} />
    </>
  );
};

export default IndentProductPage;
