import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { ProductSearch } from "../../CommonPage/Product/ProductSearchForm";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import { IndentDetailDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { ProductOption, ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interfacr";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import IndentProductGrid from "./IndentProdctDetails";
import { indentProductMastService, productListService, productOverviewService } from "@/services/InventoryManagementService/inventoryManagementService";
import IndentProductFooter from "./IndentProductFooter";
import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

interface Props {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
  onIndentDetailsChange: (rows: IndentDetailDto[]) => void;
}

const IndentProductDetails: React.FC<Props> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange, onIndentDetailsChange }) => {
  const { control, setValue, reset, handleSubmit, getValues } = useForm<IndentSaveRequestDto>();
  const { compID, compCode, compName, userID } = useAppSelector((s) => s.auth);
  const { setLoading } = useLoading();
  const [gridData, setGridData] = useState<IndentDetailDto[]>([]);

  // Static options could be moved outside the component or to a constants file
  const packageOptions = [
    { value: "1", label: "Package 1" },
    { value: "2", label: "Package 2" },
    { value: "3", label: "Package 3" },
  ];

  const supplierOptions = [
    { value: "1", label: "Supplier 1" },
    { value: "2", label: "Supplier 2" },
    { value: "3", label: "Supplier 3" },
  ];

  const productOptions = [
    { value: "1", label: "unit 1" },
    { value: "2", label: "unit 2" },
    { value: "3", label: "unit 3" },
  ];

  const requiredDropdowns: DropdownType[] = ["statusFilter", "department", "departmentIndent"];
  const { statusFilter, department, departmentIndent } = useDropdownValues(requiredDropdowns);

  const initializeForm = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await indentProductMastService.getNextCode("IND", 3);
      const statusFilterResponse = await appModifiedListService.getAll();
      const statusFilterData = statusFilterResponse?.data?.filter((item: any) => item.amlField === "STATUSFILTER") || [];
      reset({
        IndentMaster: {
          indentID: 0,
          indentCode: nextCode.data,
          indentType: "",
          indentDate: dayjs().format("DD/MM/YYYY"),
          fromDeptID: selectedDeptId,
          fromDeptName: selectedDeptName,
          toDeptID: 0,
          toDeptName: "",
          rActiveYN: "Y",
          compID: 0,
          compCode: "",
          compName: "",
          transferYN: "N",
          remarks: "",
          pChartID: 0,
          pChartCode: "",
          indStatusCode: statusFilterData[0]?.amlCode || "",
          indStatus: statusFilterData[0]?.amlName || "",
        },
        IndentDetails: [],
      });

      setGridData([]);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Indent Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, selectedDeptName, reset, setLoading]);

  useEffect(() => {
    if (selectedData) {
      setValue("IndentMaster.indentType", selectedData.IndentMaster.indentType || "");
      setValue("IndentMaster.indentCode", selectedData.IndentMaster.indentCode || "");
      setValue("IndentMaster.indentDate", dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD"));
      setValue("IndentMaster.fromDeptName", selectedData.IndentMaster.fromDeptName || selectedDeptName);
      setValue("IndentMaster.toDeptID", selectedData.IndentMaster.toDeptID || 0);
      setValue("IndentMaster.toDeptName", selectedData.IndentMaster.toDeptName || "");
      setGridData([...selectedData.IndentDetails]);
    } else {
      initializeForm();
    }
  }, [selectedData, initializeForm, setValue, selectedDeptName]);

  const handleToDepartmentChange = (val: any) => {
    try {
      let deptId = "";
      if (typeof val === "object" && val !== null) {
        deptId = val.target?.value !== undefined ? val.target.value : val.value !== undefined ? val.value : "";
      } else {
        deptId = val;
      }

      const numericDeptId = Number(deptId);
      if (isNaN(numericDeptId)) {
        showAlert("Warning", "Please select a valid department", "warning");
        return;
      }

      const dept = department?.find((d: any) => Number(d.value) === numericDeptId);
      if (dept) {
        setValue("IndentMaster.toDeptID", numericDeptId);
        setValue("IndentMaster.toDeptName", dept.label ?? "");
      } else {
        showAlert("Warning", "Selected department not found in the options. Please select a valid department.", "warning");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while processing department selection. Please try again.", "error");
    }
  };

  const fetchProductDetails = async (productID: number, basicInfo: ProductSearchResult) => {
    try {
      setLoading(true);
      const [productRes, productOverviewRes] = await Promise.all([productListService.getById(productID), productOverviewService.getAll()]);

      const product: ProductListDto = productRes.data ?? ({} as ProductListDto);
      const productOverview = productOverviewRes.data?.find((p: ProductOverviewDto) => p.productID === productID);

      if (!product || !productOverview) {
        showAlert("Warning", "Product data not found.", "warning");
        return;
      }

      const newRow: IndentDetailDto = {
        indentDetID: 0,
        productID: product.productID,
        productCode: product.productCode ?? "",
        productName: product.productName ?? product.catValue ?? "—",
        catValue: product.catValue,
        pGrpID: product.pGrpID,
        psGrpID: product.psGrpID,
        groupName: product.productGroupName ?? "",
        package: product.productPackageName ?? "",
        pUnitID: product.pUnitID?.toString() ?? "",
        pUnitName: product.pUnitName ?? "",
        baseUnit: product.baseUnit ?? 1,
        hsnCode: product.hsnCODE ?? "",
        manufacturerID: product.manufacturerID,
        manufacturerCode: product.manufacturerCode,
        manufacturerName: product.manufacturerName,
        mGenID: product.mGenID,
        supplierName: product.manufacturerName ?? "",
        location: productOverview.productLocation ?? product.productLocation ?? "",
        stockLevel: productOverview.stockLevel ?? 0,
        qoh: productOverview.stockLevel ?? 0,
        average: productOverview.avgDemand ?? 0,
        averageDemand: productOverview.avgDemand ?? 0,
        reOrderLevel: productOverview.reOrderLevel ?? 0,
        rol: productOverview.reOrderLevel ?? 0,
        minLevelUnits: productOverview.minLevelUnits ?? 0,
        maxLevelUnits: productOverview.maxLevelUnits ?? 0,
        requiredQty: 0,
        requiredUnitQty: 0,
        netValue: 0,
        deptIssualYN: "N",
        units: product.pUnitID?.toString() ?? "",
        unitsPackage: 1,
        roq: 0,
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
      };

      const updatedGrid = [...gridData, newRow];
      setGridData(updatedGrid);
      setValue("IndentDetails", updatedGrid);
      onIndentDetailsChange(updatedGrid);
    } catch (err) {
      showAlert("Error", "Failed to fetch product details.", "error");
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
    if (!data.IndentMaster.indentType || !data.IndentMaster.indentCode || !data.IndentMaster.toDeptID) {
      showAlert("Error", "Indent Type, Indent Code, and To Department are required.", "error");
      return;
    }

    const validIndentDetails = gridData.filter((detail) => detail.productID && detail.requiredQty > 0);
    if (validIndentDetails.length === 0) {
      showAlert("Error", "Indent Details cannot be empty or incomplete.", "error");
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
      IndentDetails: validIndentDetails,
    };

    setLoading(true);
    try {
      const result = await indentProductServices.saveIndent(payload);
      if (result?.success) {
        showAlert("Success", "Indent saved successfully.", "success", {
          onConfirm: initializeForm,
        });
      } else {
        showAlert("Error", `Failed to save indent: ${result?.errorMessage || "Unknown error"}`, "error");
      }
    } catch (error) {
      showAlert("Error", `An error occurred while saving indent: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const convertToProductOption = (detail: IndentDetailDto): ProductOption => ({
    productID: detail.productID || 0,
    productCode: detail.productCode || "",
    productName: detail.productName || "",
    productCategory: detail.catValue || "",
    rActiveYN: detail.rActiveYN || "Y",
  });

  const toDepartmentOptions = (department || []).filter((d: any) => d.isStoreYN === "Y");

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
            <FormField
              name="IndentMaster.indentType"
              control={control}
              type="select"
              label="Indent Type"
              required
              options={departmentIndent || []}
              size="small"
              defaultValue={selectedData?.IndentMaster?.indentType || ""}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField
              name="IndentMaster.indentCode"
              control={control}
              type="text"
              label="Indent Code"
              disabled
              required
              size="small"
              defaultValue={selectedData?.IndentMaster?.indentCode || ""}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField
              name="IndentMaster.indentDate"
              control={control}
              type="datepicker"
              label="Date"
              disabled
              size="small"
              defaultValue={selectedData?.IndentMaster?.indentDate ? dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD") : ""}
              onChange={(date) => setValue("IndentMaster.indentDate", dayjs(date).format("YYYY-MM-DD"))}
            />
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
              size="small"
              defaultValue={selectedData?.IndentMaster?.toDeptID || ""}
              onChange={handleToDepartmentChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <ProductSearch
              onProductSelect={handleProductSelect}
              label="Search Product"
              placeholder="Search product..."
              initialSelection={gridData.length > 0 ? convertToProductOption(gridData[0]) : null}
            />
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

        <IndentProductFooter setValue={setValue} control={control} getValues={getValues} />

        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={initializeForm} onSave={handleSubmit(onSubmit)} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </form>
    </Paper>
  );
};

export default IndentProductDetails;
