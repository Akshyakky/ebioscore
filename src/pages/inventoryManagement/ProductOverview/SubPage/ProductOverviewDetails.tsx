import React, { useCallback, useEffect, useState } from "react";
import { debounce, Grid, Paper, SelectChangeEvent, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import { ChangeCircleRounded } from "@mui/icons-material";
import { useAppSelector } from "@/store/hooks";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { productListService, productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import { showAlert } from "@/utils/Common/showAlert";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface ProductOverviewDetailProps {
  selectedData?: ProductOverviewDto;
  onChangeDepartment?: () => void;
  editData?: ProductOverviewDto;
}

const ProductOverviewDetail: React.FC<ProductOverviewDetailProps> = ({ selectedData, onChangeDepartment }) => {
  const user = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState<ProductOverviewDto>({
    pvID: 0,
    productID: 0,
    productCode: "",
    leadTime: 0,
    leadTimeUnit: "",
    fsbCode: "N",
    rackNo: "",
    shelfNo: "",
    minLevelUnits: 0,
    maxLevelUnits: 0,
    dangerLevelUnits: 0,
    reOrderLevel: 0,
    avgDemand: 0,
    stockLevel: 0,
    supplierAllocation: "N",
    poStatus: "N",
    deptID: 0,
    department: "",
    defaultYN: "N",
    isAutoIndentYN: "N",
    productLocation: "",
    rActiveYN: "Y",
    compID: user.compID || 0,
    compCode: "",
    compName: "",
    transferYN: "N",
    rNotes: "",
  });

  const [productOptions, setProductOptions] = useState<ProductListDto[]>([]);
  const [, setIsLoading] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState<ProductListDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [, setConvertedLeadTime] = useState<number | null>(null);

  useEffect(() => {
    if (selectedData?.pvID) {
      setFormState({
        ...selectedData,
        compID: user.compID || 0,
      });
      setDialogOpen(true);
    } else {
      handleClear();
    }
  }, [selectedData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleDropdownChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormState({
      pvID: 0,
      productID: 0,
      productCode: "",
      fsbCode: "N",
      rackNo: "",
      shelfNo: "",
      minLevelUnits: 0,
      maxLevelUnits: 0,
      dangerLevelUnits: 0,
      reOrderLevel: 0,
      avgDemand: 0,
      stockLevel: 0,
      supplierAllocation: "N",
      poStatus: "N",
      deptID: 0,
      department: "",
      defaultYN: "N",
      isAutoIndentYN: "N",
      productLocation: "",
      rActiveYN: "Y",
      compID: user.compID || 0,
      compCode: "",
      compName: "",
      transferYN: "N",
      rNotes: "",
    });
  };

  const handleSave = async () => {
    try {
      const productOverview: ProductOverviewDto = {
        ...formState,
        fsbCode: formState.fsbCode || "N",
        supplierAllocation: formState.supplierAllocation || "N",
        poStatus: formState.poStatus || "N",
        defaultYN: formState.defaultYN || "N",
        isAutoIndentYN: formState.isAutoIndentYN || "N",
        deptID: formState.deptID || 1,
        minLevelUnits: formState.minLevelUnits || 0,
        maxLevelUnits: formState.maxLevelUnits || 0,
        dangerLevelUnits: formState.dangerLevelUnits || 0,
        reOrderLevel: formState.reOrderLevel || 0,
        avgDemand: formState.avgDemand || 0,
        stockLevel: formState.stockLevel || 0,
        compID: user.compID || 0,
      };

      await productOverviewService.save(productOverview);
      showAlert("success", "Product saved successfully!", "success");
    } catch (error) {
      showAlert("Error", "Failed to save product.", "error");
    }
  };

  const options = [
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months" },
    { value: "years", label: "Years" },
  ];

  const convertToDays = useCallback(() => {
    const { leadTime, leadTimeUnit } = formState;

    let days = leadTime;
    switch (leadTimeUnit) {
      case "weeks":
        days = leadTime * 7;
        break;
      case "months":
        days = leadTime * 30;
        break;
      case "years":
        days = leadTime * 365;
        break;
      default:
        break;
    }
    setConvertedLeadTime(days);
  }, [formState]);

  useEffect(() => {
    convertToDays();
  }, [formState.leadTime, formState.leadTimeUnit, convertToDays]);

  const fetchProductSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return [];

    try {
      const response = await productListService.getAll();
      return (
        response.data
          ?.filter((product: any) => {
            const prodCode = product.productCode?.toLowerCase();
            return prodCode && prodCode.startsWith(searchTerm.toLowerCase());
          })
          .map((product: any) => {
            const prodCode = product.productCode || "";
            const prodName = product.productName || "";
            return `${prodCode} - ${prodName}`;
          }) || []
      );
    } catch (error) {
      return [];
    }
  }, []);

  const debouncedFetchSuggestions = useCallback(debounce(fetchProductSuggestions, 300), [fetchProductSuggestions]);

  const handleProductCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormState((prevState) => ({ ...prevState, productCode: value }));
      debouncedFetchSuggestions(value);
    },
    [debouncedFetchSuggestions]
  );

  const handleProductSelect = useCallback(async (selectedProductString: string) => {
    const [selectedProductCode] = selectedProductString.split(" - ");
    setFormState((prevState) => ({
      ...prevState,
      productCode: selectedProductCode,
    }));

    try {
      const response = await productListService.getAll();
      if (response.success && response.data) {
        const selectedProductDetails = response.data
          .filter((product: any) => product.productCode === selectedProductCode)
          .map(({ serialNumber, mfName: MFName, ...rest }: any) => ({
            ...rest,
            MFName,
          }));

        if (selectedProductDetails.length > 0) {
          setFormState((prevState) => ({
            ...prevState,
            ...selectedProductDetails[0],
            productID: selectedProductDetails[0].productID || 0,
          }));
          setFieldsDisabled(true);
          setSelectedProductData(selectedProductDetails);
        }
      }
    } catch (error) {
      showAlert("error", "Failed to fetch product details", "error");
    }
  }, []);

  const handleEdit = (productID: number) => {
    setDialogOpen(true);
  };

  const columns: Column<ProductListDto>[] = [
    { key: "productCode", header: "Product Code", visible: true },
    { key: "productName", header: "Product Name", visible: true },
    { key: "catDescription", header: "Category Name", visible: true },
    { key: "mfName", header: "Form Name", visible: true },
    { key: "manufacturerGenericName", header: "Generic Name", visible: true },
    {
      key: "recordStatus",
      header: "Record Status",
      visible: true,
      render: (rowData: ProductListDto) => <Typography variant="body2">{rowData.rActiveYN === "Y" ? "Active" : "Hidden"}</Typography>,
    },
    { key: "pLocationName", header: "Product Location", visible: true },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      render: (rowData: ProductListDto) => (
        <CustomButton onClick={() => handleEdit(rowData.productID)} text="Enter Result" icon={AddIcon} variant="contained" size="small" color="secondary" />
      ),
    },
  ];

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="product-overview-details-header">
        PRODUCT OVERVIEW DETAILS
      </Typography>

      <Grid container justifyContent="space-between" alignItems="center" size={{ xs: 12, md: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormField
            ControlID="productCode"
            label="Product Code"
            name="productCode"
            type="autocomplete"
            placeholder="Search through product..."
            value={formState.productCode || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              setFormState((prev) => ({
                ...prev,
                productCode: value,
              }));
            }}
            fetchSuggestions={fetchProductSuggestions} // Function that returns suggestions as per the input
            onSelectSuggestion={handleProductSelect}
            isMandatory={true}
            maxLength={60}
            gridProps={{ xs: 12 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomButton
            onClick={onChangeDepartment}
            text={selectedData?.department || "Not Selected"}
            variant="contained"
            icon={ChangeCircleRounded}
            size="small"
            sx={{
              backgroundColor: "#ff5722",
              color: "white",
              "&:hover": {
                backgroundColor: "#e64a19",
              },
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {Array.isArray(selectedProductData) && selectedProductData.length > 0 && <CustomGrid columns={columns} data={selectedProductData} />}
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />

      <GenericDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Enter Result"
        maxWidth="md"
        fullWidth
        actions={
          <>
            <CustomButton onClick={() => setDialogOpen(false)} color="error" text="Close" variant="contained" icon={Close} />
            <CustomButton onClick={handleSave} color="success" text="Save" variant="contained" icon={SaveIcon} />
          </>
        }
      >
        <Grid container spacing={2}>
          <FormField
            type="text"
            label="Product Code"
            value={formState.productCode}
            onChange={handleInputChange}
            ControlID="dialogProductCode"
            name="productCode"
            isMandatory
            placeholder="Product Code"
            disabled={fieldsDisabled}
          />
          <FormField
            type="text"
            label="Product Name"
            value={formState.productName}
            onChange={handleInputChange}
            ControlID="dialogProductName"
            name="productName"
            isMandatory
            placeholder="Product Name"
            disabled={fieldsDisabled}
          />
          <FormField
            type="text"
            label="Base Unit"
            value={formState.baseUnit}
            onChange={handleInputChange}
            ControlID="dialogBaseUnit"
            name="baseUnit"
            placeholder="Base Unit"
            disabled={fieldsDisabled}
          />

          <FormField
            type="text"
            label="Location"
            value={formState.productLocation}
            onChange={handleInputChange}
            ControlID="dialogProductLocation"
            name="productLocation"
            placeholder="Location"
          />
          <FormField type="text" label="Rack" value={formState.rackNo} onChange={handleInputChange} ControlID="dialogRack" name="rackNo" placeholder="Rack" />
          <FormField type="text" label="Shelf" value={formState.shelfNo} onChange={handleInputChange} ControlID="dialogShelf" name="shelfNo" placeholder="Shelf" />
          <FormField
            type="number"
            label="Lead Time"
            value={formState.leadTime}
            onChange={handleInputChange}
            ControlID="dialogLeadTime"
            name="leadTime"
            placeholder="Enter Lead Time"
          />
          <FormField type="select" label="Unit" value={formState.leadTimeUnit} onChange={handleDropdownChange} ControlID="leadTimeUnit" name="leadTimeUnit" options={options} />

          {/* <Grid spacing={2}>
                        <Typography variant="body1" mt={5} ml={2}>
                            {convertedLeadTime ? `${convertedLeadTime} Days` : "N/A"}
                        </Typography>
                    </Grid> */}
          <FormField
            type="number"
            label="Danger Level"
            value={formState.dangerLevelUnits}
            onChange={handleInputChange}
            ControlID="dialogDangerLevel"
            name="dangerLevelUnits"
            placeholder="Danger Level"
          />
          <FormField
            type="number"
            label="Stock Level"
            value={formState.stockLevel}
            onChange={handleInputChange}
            ControlID="dialogStockLevel"
            name="stockLevel"
            placeholder="Stock Level"
          />
          <FormField
            type="number"
            label="Average Demand"
            value={formState.avgDemand}
            onChange={handleInputChange}
            ControlID="dialogAverageDemand"
            name="avgDemand"
            placeholder="Average Demand"
            // gridProps={{ xs: 12, md: 2 }}
          />

          <FormField
            type="select"
            label="Average DemandUnit"
            value={formState.avgDemandUnit}
            onChange={handleDropdownChange}
            ControlID="avgDemandUnit"
            name="avgDemandUnit"
            options={options}
            // gridProps={{ xs: 12, md: 3.1 }}
          />
          {/* <Grid container spacing={2}>
                        <Typography variant="body1" mt={5} >
                            {formState.avgDemand ? `${formState.avgDemand} ${formState.avgDemandUnit}` : "N/A"}
                        </Typography>
                    </Grid> */}

          <FormField
            type="number"
            label="Re-Order Level"
            value={formState.reOrderLevel}
            onChange={handleInputChange}
            ControlID="dialogReOrderLevel"
            name="reOrderLevel"
            placeholder="Re-Order Level"
          />
          <FormField
            type="number"
            label="Re-Order Quantity"
            value={formState.reOrderQuantity}
            onChange={handleInputChange}
            ControlID="dialogReOrderQuantity"
            name="reOrderQuantity"
            placeholder="Re-Order Quantity"
          />
          <FormField
            type="radio"
            label=""
            name="poStatus"
            value={formState.poStatus}
            onChange={handleInputChange}
            options={[
              { value: "Y", label: "Automatic" },
              { value: "N", label: "Manual" },
            ]}
            ControlID="poStatus"
            gridProps={{ xs: 12, md: 4, mt: 2 }}
            inline={true}
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="radio"
            label=" Is Auto Indent"
            name="isAutoIndentYN"
            value={formState.isAutoIndentYN}
            onChange={handleInputChange}
            options={[
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ]}
            ControlID="isAutoIndentYN"
            gridProps={{ xs: 12, md: 4 }}
            inline={true}
          />
        </Grid>
        <Grid container spacing={2}>
          <FormField
            type="textarea"
            label="Notes"
            value={formState.rNotes || ""}
            onChange={handleInputChange}
            name="rNotes"
            ControlID="rNotes"
            placeholder="Notes"
            maxLength={4000}
          />
        </Grid>
      </GenericDialog>
    </Paper>
  );
};

export default ProductOverviewDetail;
