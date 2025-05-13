import React, { useCallback, useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentSearchDialog from "../SubPage/IndentProductSearch";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";
import dayjs from "dayjs";
import { indentProductDetailService, productListService, productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import IndentProductDetails from "../SubPage/IndentProductList";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";

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
  // Function to fetch the complete indent data when an indent is selected for editing
  // Function to fetch the complete indent data when an indent is selected for editing
  const fetchIndentDetails = useCallback(
    async (indentId: number) => {
      try {
        setLoading(true);

        // Fetch master and detail data using a single service call
        const response = await indentProductServices.getIndentById(indentId);

        // Check if the request was successful
        if (!response.success || !response.data) {
          showAlert("Error", response.errorMessage || "Failed to fetch indent details", "error");
          return null;
        }

        // Destructure master and detail data
        const { indentMaster, indentDetails } = response.data;

        // Log the indentMaster to see what we're getting
        console.log("Indent Master received:", indentMaster);
        console.log("Indent Details received:", indentDetails);

        // Fetch complete product details for each product in the details
        const completeDetails = await Promise.all(
          (indentDetails || []).map(async (detail: any) => {
            const productRes = await productListService.getById(detail.productID);
            const productOverviewRes = await productOverviewService.getAll();
            const product: ProductListDto = productRes.data ?? ({} as ProductListDto);
            const productOverview = productOverviewRes.data?.find((p: ProductOverviewDto) => p.productID === detail.productID);

            // Important: Preserve the original indentDetID to ensure we update instead of insert
            return {
              ...detail,
              indentDetID: detail.indentDetID, // Preserve the existing ID
              baseUnit: product.baseUnit ?? null,
              package: product.productPackageName ?? null,
              groupName: product.productGroupName ?? null,
              ppkgID: product.pPackageID ?? null,
              stockLevel: productOverview?.stockLevel ?? null,
              qoh: productOverview?.stockLevel ?? null,
              average: productOverview?.avgDemand ?? null,
              averageDemand: productOverview?.avgDemand ?? null,
              reOrderLevel: productOverview?.reOrderLevel ?? null,
              rol: productOverview?.reOrderLevel ?? null,
              minLevelUnits: productOverview?.minLevelUnits ?? null,
              maxLevelUnits: productOverview?.maxLevelUnits ?? null,
              leadTime: product.leadTime ?? null,
              location: productOverview?.productLocation ?? product.productLocation ?? null,
              unitsPackage: product.unitPack ?? null,
              units: product.issueUnit ? String(product.issueUnit) : null,
              taxID: product.taxID ?? null,
              taxCode: product.taxCode ?? null,
              sgstPerValue: product.sgstPerValue ?? null,
              cgstPerValue: product.cgstPerValue ?? null,
              tax: product.gstPerValue ?? null,
            };
          })
        );

        // Create the complete indent data
        const indentData: IndentSaveRequestDto = {
          id: indentMaster?.indentID || 0, // Preserve the master ID
          rActiveYN: indentMaster?.rActiveYN || "Y",
          IndentMaster: {
            ...indentMaster,
            indentDate: indentMaster?.indentDate ? dayjs(indentMaster.indentDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            rNotes: indentMaster?.rNotes || "", // Ensure rNotes is properly mapped
          },
          IndentDetails: completeDetails,
        };

        console.log("Indent data prepared:", indentData);

        // Set the state with the fetched data
        setSelectedData(indentData);
        setIndentDetails(completeDetails);
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
