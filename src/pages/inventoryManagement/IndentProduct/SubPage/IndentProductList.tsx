import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
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
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import IndentProductGrid from "./IndentProdctDetails";
import { indentProductServices } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { useServerDate } from "@/hooks/Common/useServerDate";

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
  const { userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();

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
  }, [selectedDeptId, selectedDeptName, compID, compCode, compName, userID, userName, reset]);

  useEffect(() => {
    if (selectedData) {
      reset({
        ...selectedData,
        IndentMaster: {
          ...selectedData.IndentMaster,
          indentDate: dayjs(selectedData.IndentMaster.indentDate).format("DD/MM/YYYY"),
        },
      });
      setValue("IndentMaster.indentDate", dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD"));
      setGridData(selectedData.IndentDetails ?? []);
    } else {
      initializeForm();
    }
  }, [selectedData, initializeForm, reset, setValue]);

  const handleToDepartmentChange = (val: any) => {
    const deptId = typeof val === "object" && val.target ? parseInt(val.target.value) : parseInt(val);
    if (isNaN(deptId)) {
      showAlert("Error", "Invalid department ID", "error");
      return;
    }
    const dept = departmentList.find((d: any) => parseInt(d.value) === deptId);
    if (dept) {
      setValue("IndentMaster.toDeptID", deptId);
      setValue("IndentMaster.toDeptName", dept.label ?? "");
    } else {
      showAlert("Error", "Department not found", "error");
    }
  };

  const fetchProductDetails = async (productID: number, basicInfo: ProductSearchResult) => {
    try {
      debugger;
      setLoading(true);
      const productRes = await productListService.getById(productID);
      const product: ProductListDto = productRes.data;
      const productOverviewRes = await productOverviewService.getAll();
      const productOverview = productOverviewRes.data.find((p: ProductOverviewDto) => p.productID === productID);
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
        supplierName: product.manufacturerName ?? "", // Optional use of same field
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
      console.error("Error fetching product details:", err);
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
    debugger;
    if (!data.IndentMaster.indentType || !data.IndentMaster.indentCode || !data.IndentMaster.toDeptID) {
      showAlert("Error", "Indent Type, Indent Code, and To Department are required.", "error");
      return;
    }
    let toDeptID: number;
    if (typeof data.IndentMaster.toDeptID === "string") {
      toDeptID = parseInt(data.IndentMaster.toDeptID);
    } else if (data.IndentMaster.toDeptID && typeof data.IndentMaster.toDeptID === "object" && "target" in data.IndentMaster.toDeptID) {
      const targetValue = (data.IndentMaster.toDeptID as unknown as { target: { value: string } })?.target?.value;
      toDeptID = targetValue ? parseInt(String(targetValue)) : 0;
    } else {
      toDeptID = Number(data.IndentMaster.toDeptID || 0);
    }

    if (isNaN(toDeptID)) {
      showAlert("Error", "Invalid To Department ID", "error");
      return;
    }
    const validIndentDetails = gridData.filter((detail) => detail.productID);
    const payload: IndentSaveRequestDto = {
      ...data,
      compID: compID ?? 0,
      compCode: compCode ?? "",
      rCreatedBy: userName ?? "",
      compName: compName ?? "",
      IndentMaster: {
        ...data.IndentMaster,
        toDeptID: toDeptID,
        indentDate: dayjs(data.IndentMaster.indentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      },
      IndentDetails: validIndentDetails,
    };

    console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    setLoading(true);
    try {
      const result = await indentProductServices.saveIndentWithDetails(payload);
      if (result && result.success) {
        showAlert("Success", "Indent saved successfully.", "success", {
          onConfirm: initializeForm,
        });
      } else {
        showAlert("Error", `Failed to save indent: ${result?.errorMessage || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Save error:", error);
      showAlert("Error", `An error occurred while saving indent: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
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
            <FormField
              name="IndentMaster.indentDate"
              control={control}
              type="datepicker"
              label="Date"
              disabled
              size="small"
              onChange={(date) => setValue("IndentMaster.indentDate", dayjs(date).format("YYYY-MM-DD"))} // Handle change if needed
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
