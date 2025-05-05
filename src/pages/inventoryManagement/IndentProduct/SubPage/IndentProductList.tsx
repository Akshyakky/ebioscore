import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography, TextField, Select, MenuItem, IconButton, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { indentProductService, productListService, productOverviewService, productUnitService } from "@/services/InventoryManagementService/inventoryManagementService";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { ProductSearch } from "../../CommonPage/Product/ProductSearchForm";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { IndentDetailDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interfacr";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import IndentProductGrid from "./IndentProdctDetails";

interface Props {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
  onIndentDetailsChange: (rows: IndentDetailDto[]) => void;
}

const IndentProductDetails: React.FC<Props> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange, onIndentDetailsChange }) => {
  const { control, setValue, reset, handleSubmit } = useForm<IndentSaveRequestDto>();
  const { compID, compCode, compName } = useAppSelector((s) => s.auth);
  const { setLoading } = useLoading();
  const [gridData, setGridData] = useState<IndentDetailDto[]>([]);

  const [packageOptions] = useState([
    { value: "1", label: "Package 1" },
    { value: "2", label: "Package 2" },
    { value: "3", label: "Package 3" },
  ]);

  const [supplierOptions] = useState([
    { value: "1", label: "Supplier 1" },
    { value: "2", label: "Supplier 2" },
    { value: "3", label: "Supplier 3" },
  ]);
  const [productOptions] = useState([
    { value: "1", label: "unit 1" },
    { value: "2", label: "unit 2" },
    { value: "3", label: "unit 3" },
  ]);

  const dropdownValues = useDropdownValues(["department", "departmentIndent"]);
  const departmentList = dropdownValues.department || [];
  const indentTypeOptions = (dropdownValues.departmentIndent || []).map((d: any) => ({ value: d.value, label: d.label }));

  const initializeForm = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await indentProductService.getNextCode("IND", 3);

      reset({
        IndentMaster: {
          indentID: 0,
          indentCode: nextCode.data,
          indentType: "Department Indent",
          indentDate: dayjs().format("DD/MM/YYYY"),
          fromDeptID: selectedDeptId,
          fromDeptName: selectedDeptName,
          toDeptID: 0,
          toDeptName: "",
          rActiveYN: "Y",
          compID: compID ?? 0,
          compCode: compCode ?? "",
          compName: compName ?? "",
          transferYN: "N",
          remarks: "",
          pChartID: 0,
          pChartCode: "",
        },
        IndentDetails: [],
      });

      setGridData([]);
    } catch {
      showAlert("Error", "Failed to fetch the next Indent Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, selectedDeptName, compID, compCode, compName, reset]);

  useEffect(() => {
    if (selectedData) {
      reset({
        ...selectedData,
        IndentMaster: {
          ...selectedData.IndentMaster,
          indentDate: dayjs(selectedData.IndentMaster.indentDate).format("DD/MM/YYYY"),
        },
      });
      setGridData(selectedData.IndentDetails ?? []);
    } else {
      initializeForm();
    }
  }, [selectedData, initializeForm, reset]);

  const handleToDepartmentChange = (val: any) => {
    const deptId = typeof val === "string" ? parseInt(val) : val;
    const dept = departmentList.find((d: any) => parseInt(d.value) === deptId);
    setValue("IndentMaster.toDeptID", deptId);
    setValue("IndentMaster.toDeptName", dept?.label ?? "");
  };

  const fetchProductDetails = async (productID: number, basicInfo: ProductSearchResult) => {
    try {
      setLoading(true);
      const productListResponse = await productListService.getAll();
      const productOverviewResponse = await productOverviewService.getAll();
      const productFromList = productListResponse.data.find((product: ProductListDto) => product.productID === productID);
      const productFromOverview = productOverviewResponse.data.find((overview: ProductOverviewDto) => overview.productID === productID);
      if (!productFromList || !productFromOverview) {
        showAlert("Warning", "Product data not found.", "warning");
        return;
      }

      // Make sure to set units as the value (ID) not the label
      // If pUnitID is not available, use first unit from our options or default to "1"

      const newRow: IndentDetailDto = {
        indentDetID: 0,
        productID: productFromList.productID,
        productCode: productFromList.productCode ?? "",
        productName: productFromList.productName ?? productFromList.catValue ?? "—",
        hsnCode: productFromList.hsnCODE ?? "",
        manufacturerName: productFromList.manufacturerName ?? "",
        stockLevel: productFromOverview.stockLevel ?? 0,
        qoh: productFromOverview.stockLevel ?? 0,
        average: productFromOverview.avgDemand ?? 0,
        reOrderLevel: productFromOverview.reOrderLevel ?? 0,
        minLevelUnits: productFromOverview.minLevelUnits ?? 0,
        maxLevelUnits: productFromOverview.maxLevelUnits ?? 0,
        requiredQty: 0,
        requiredUnitQty: 0,
        pUnitID: "",
        pUnitName: productFromList.pUnitName ?? "",
        ppkgID: productFromList.ppkgID ?? 0,
        deptIssualYN: "N",
        location: productFromOverview.productLocation ?? "",
        netValue: 0,
        unitsPackage: 1,
        units: productFromList.units || "", // Set default unit ID if available
        package: productFromList.productPackageName ?? "",
        groupName: productFromList.catValue ?? "",
        baseUnit: productFromOverview.baseUnit ?? 1,
        leadTime: productFromOverview.leadTime ?? 0,
        averageDemand: productFromOverview.avgDemand ?? 0,
        supplierName: productFromOverview.supplierName ?? "",
        rol: productFromOverview.reOrderLevel ?? 0,
        roq: 0,
      };

      setGridData((prev) => [...prev, newRow]);
      setValue("IndentDetails", [...gridData, newRow]);
      onIndentDetailsChange([...gridData, newRow]);
    } catch (err) {
      showAlert("Error", "Failed to fetch product overview.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (product) fetchProductDetails(product.productID, product);
  };

  const handleCellValueChange = (rowIndex: number, field: keyof IndentDetailDto, value: any) => {
    setGridData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      setValue("IndentDetails", newData);
      onIndentDetailsChange(newData);
      return newData;
    });
  };

  const handleDelete = (item: IndentDetailDto) => {
    const newData = gridData.filter((row) => row.productID !== item.productID);
    setGridData(newData);
    setValue("IndentDetails", newData);
    onIndentDetailsChange(newData);
  };

  const onSubmit = async (data: IndentSaveRequestDto) => {
    if (!data.IndentMaster.indentType || !data.IndentMaster.indentCode) {
      showAlert("Error", "Indent Type and Indent Code are required.", "error");
      return;
    }
    const payload: IndentSaveRequestDto = {
      ...data,
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      IndentMaster: {
        ...data.IndentMaster,
        indentDate: dayjs(data.IndentMaster.indentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      },
      IndentDetails: gridData,
    };

    setLoading(true);
    try {
      await indentProductService.save(payload);
      showAlert("Success", "Indent saved successfully.", "success", {
        onConfirm: initializeForm,
      });
    } catch {
      showAlert("Error", "Failed to save indent.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toDepartmentOptions = departmentList
    .filter((d: any) => d?.isStoreYN === "Y" && parseInt(d.value) !== selectedDeptId)
    .map((d: any) => ({ value: parseInt(d.value), label: d.label }));

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Indent Product Entry
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <DepartmentInfoChange deptName={selectedDeptName || "Select Department"} handleChangeClick={handleDepartmentChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentType" control={control} type="select" label="Indent Type" required options={indentTypeOptions} size="small" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentCode" control={control} type="text" label="Indent Code" disabled required size="small" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentDate" control={control} type="datepicker" label="Date" disabled size="small" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.fromDeptName" control={control} type="text" label="From Dept" disabled defaultValue={selectedDeptName} size="small" />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormField
              name="IndentMaster.toDeptID"
              control={control}
              type="select"
              label="To Department"
              options={toDepartmentOptions}
              required
              onChange={handleToDepartmentChange}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <ProductSearch onProductSelect={handleProductSelect} label="Search Product" placeholder="Search product..." />
          </Grid>
        </Grid>

        <IndentProductGrid
          gridData={gridData}
          handleCellValueChange={handleCellValueChange}
          handleDelete={handleDelete}
          packageOptions={packageOptions}
          supplierOptions={supplierOptions}
          productOptions={productOptions}
        />

        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={initializeForm} onSave={handleSubmit(onSubmit)} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </form>
    </Paper>
  );
};

export default IndentProductDetails;
