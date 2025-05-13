import React, { useCallback, useEffect, useState, useRef } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
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
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import CustomButton from "@/components/Button/CustomButton";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";

interface Props {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
  onIndentDetailsChange: (rows: IndentDetailDto[]) => void;
}

const IndentProductDetails: React.FC<Props> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange, onIndentDetailsChange }) => {
  const { control, setValue, reset, handleSubmit, getValues, watch } = useForm<IndentSaveRequestDto>();
  const { compID, compCode, compName, userID } = useAppSelector((s) => s.auth);
  const { setLoading } = useLoading();
  const [gridData, setGridData] = useState<IndentDetailDto[]>([]);
  const initializedRef = useRef(false);
  const [selectedIndentType, setSelectedIndentType] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);

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
    if (initializedRef.current) return;
    initializedRef.current = true;
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
          indentDate: dayjs().format("YYYY-MM-DD"),
          fromDeptID: selectedDeptId,
          fromDeptName: selectedDeptName,
          toDeptID: "",
          toDeptName: "",
          rActiveYN: "Y",
          indentApprovedYN: "N",
          rNotes: "",
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
  }, [selectedDeptId, selectedDeptName, reset, setLoading, getValues]);
  useEffect(() => {
    if (departmentIndent && departmentIndent.length > 0) {
      console.log("Department indent options:", departmentIndent);
    }
  }, [departmentIndent]);

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setClearSearchTrigger((prev) => prev + 1);
    showAlert("Success", "Patient selection cleared", "success");
  };

  useEffect(() => {
    if (selectedData) {
      const indentType = selectedData.IndentMaster.indentType || "";
      setValue("IndentMaster.indentType", indentType);
      setValue("IndentMaster.indentCode", selectedData.IndentMaster.indentCode || "");
      setValue("IndentMaster.indentDate", dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD"));
      setValue("IndentMaster.fromDeptName", selectedData.IndentMaster.fromDeptName || selectedDeptName);
      setValue("IndentMaster.rNotes", selectedData.IndentMaster.rNotes || "");
      setValue("IndentMaster.rActiveYN", selectedData.IndentMaster.rActiveYN || "Y");
      setValue("IndentMaster.indentApprovedYN", selectedData.IndentMaster.indentApprovedYN || "N");
      setSelectedIndentType(indentType);
      const toDeptID = selectedData.IndentMaster.toDeptID;
      const stringToDeptID = toDeptID ? String(toDeptID) : "";
      setValue("IndentMaster.toDeptID", stringToDeptID);
      setValue("IndentMaster.toDeptName", selectedData.IndentMaster.toDeptName || "");
      setGridData([...(selectedData.IndentDetails || [])]);
      initializedRef.current = true;
      setTimeout(() => {
        console.log("Current form values:", getValues());
      }, 100);
    } else if (!initializedRef.current) {
      initializeForm();
    }
  }, [selectedData, initializeForm, setValue, selectedDeptName, getValues]);

  const handleToDepartmentChange = (val: any) => {
    try {
      let deptId = "";
      if (typeof val === "object" && val !== null) {
        deptId = val.target?.value !== undefined ? val.target.value : val.value !== undefined ? val.value : "";
      } else {
        deptId = String(val);
      }
      if (!deptId) {
        setValue("IndentMaster.toDeptID", "");
        setValue("IndentMaster.toDeptName", "");
        return;
      }

      const dept = department?.find((d: any) => d.value === deptId);
      if (dept) {
        setValue("IndentMaster.toDeptID", deptId);
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
      const indentID = selectedData?.id || 0;
      const newRow: IndentDetailDto = {
        indentDetID: 0,
        indentID: indentID,
        productID: product.productID,
        productCode: product.productCode ?? "",
        productName: product.productName ?? product.catValue ?? "—",
        catValue: product.catValue ?? "",
        catDesc: product.catDescription ?? "",
        pGrpID: product.pGrpID,
        pGrpName: product.productGroupName ?? "",
        psGrpID: product.psGrpID,
        psGrpName: product.psGroupName ?? "",
        baseUnit: product.baseUnit ?? 1,
        package: product.productPackageName ?? "",
        ppkgID: product.pPackageID ?? 0,
        ppkgName: product.productPackageName ?? "",
        pUnitID: "",
        pUnitName: "",
        hsnCode: product.hsnCODE ?? "",
        manufacturerID: product.manufacturerID,
        manufacturerCode: product.manufacturerCode,
        manufacturerName: product.manufacturerName,
        mfName: product.mfName ?? "",
        supplierID: 0,
        supplierName: "",
        stockLevel: productOverview.stockLevel ?? 0,
        qoh: productOverview.stockLevel ?? 0,
        average: productOverview.avgDemand ?? 0,
        averageDemand: productOverview.avgDemand ?? 0,
        reOrderLevel: productOverview.reOrderLevel ?? 0,
        rol: productOverview.reOrderLevel ?? 0,
        minLevelUnits: productOverview.minLevelUnits ?? 0,
        maxLevelUnits: productOverview.maxLevelUnits ?? 0,
        location: productOverview.productLocation ?? product.productLocation ?? "",
        requiredQty: 0,
        requiredUnitQty: 0,
        netValue: 0,
        leadTime: product.leadTime ?? 0,
        leadTimeDesc: product.leadTimeDesc ?? "",
        taxID: product.taxID ?? 0,
        taxCode: product.taxCode ?? "",
        sgstPerValue: product.sgstPerValue ?? 0,
        cgstPerValue: product.cgstPerValue ?? 0,
        tax: product.gstPerValue ?? 0,
        rOL: productOverview.reOrderLevel ?? 0,
        expiryYN: product.expiry ?? "N",
        rActiveYN: product.rActiveYN ?? "Y",
        rNotes: product.rNotes ?? "",
        units: product.issueUnit ? String(product.issueUnit) : "",
        unitsPackage: product.unitPack ?? 1,
        deptIssualYN: "N",
        indentDetStatusCode: "N",
        transferYN: product.transferYN ?? "N",
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

  const handleProductSelect = async (product: ProductSearchResult | null) => {
    if (!product) return;
    const existingProductIndex = gridData.findIndex((item) => item.productID === product.productID);
    if (existingProductIndex >= 0) {
      showAlert("Warning", "This product is already in the indent list. Please modify the existing entry instead.", "warning");
      return;
    }

    await fetchProductDetails(product.productID, product);
  };

  const handleCellValueChange = (rowIndex: number, field: keyof IndentDetailDto, value: any) => {
    setGridData((prev) => {
      const newData = [...prev];
      // Preserve all existing properties, especially indentDetID, while updating the specified field
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      setValue("IndentDetails", newData);
      onIndentDetailsChange(newData);

      // Log the updated details to confirm ID is preserved
      console.log(`Updated row ${rowIndex}, field ${String(field)} to ${value}`);
      console.log(`Row now has indentDetID: ${newData[rowIndex].indentDetID}`);

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
    const isoDate = dayjs(data.IndentMaster.indentDate, "YYYY-MM-DD", true);
    if (!isoDate.isValid()) {
      showAlert("Error", "Indent Date is invalid.", "error");
      return;
    }
    const isUpdate = selectedData?.id > 0;
    const indentID = isUpdate ? selectedData?.id : 0;
    const payload: IndentSaveRequestDto = {
      id: indentID,
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      IndentMaster: {
        ...data.IndentMaster,
        indentID: indentID,
        toDeptID: data.IndentMaster.toDeptID ? Number(data.IndentMaster.toDeptID) : 0,
        indentDate: isoDate.toISOString(),
      },
      IndentDetails: validIndentDetails.map((detail) => ({
        ...detail,
        indentID: indentID,
      })),
    };

    console.log("Payload being sent to API:", payload);

    setLoading(true);
    try {
      const result = await indentProductServices.saveIndent(payload);
      if (result?.success) {
        showAlert("Success", "Indent saved successfully.", "success", {
          onConfirm: () => {
            initializedRef.current = false;
            initializeForm();
          },
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
              options={(departmentIndent ?? []).map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              size="small"
              defaultValue={selectedData?.IndentMaster?.indentType || ""}
              onChange={(event) => {
                console.log("Raw indent type onChange event:", event);
                let value;
                if (typeof event === "string") {
                  value = event;
                } else if (event && typeof event === "object") {
                  value = event.target?.value || event.value;
                }
                console.log("Extracted value:", value);
                if (value) {
                  setSelectedIndentType(value);
                  setValue("IndentMaster.indentType", value);
                  console.log("Updated selectedIndentType to:", value);
                }
              }}
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
              defaultValue={selectedData?.IndentMaster?.indentDate ? dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}
              onChange={(date) => setValue("IndentMaster.indentDate", dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : "")}
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
              defaultValue={selectedData?.IndentMaster?.toDeptID ? String(selectedData.IndentMaster.toDeptID) : ""}
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
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {(selectedIndentType === "departmentIndent01" || selectedIndentType === "Patient Indent") && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <PatientSearch onPatientSelect={setSelectedPatient} clearTrigger={clearSearchTrigger} placeholder="Enter name, UHID or phone number" />
                  </Box>
                  <CustomButton variant="outlined" color="error" size="small" text="Clear" icon={DeleteIcon} onClick={handleClearPatient} />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                {selectedPatient ? (
                  <PatientDemographics
                    pChartID={selectedPatient.pChartID}
                    showEditButton={true}
                    showRefreshButton={true}
                    onEditClick={() => showAlert("Info", "Edit patient clicked", "info")}
                    variant="detailed"
                    emptyStateMessage="No demographics information available"
                  />
                ) : (
                  <Typography variant="body1">Select a patient to view demographics.</Typography>
                )}
              </Grid>
            </>
          )}
        </Grid>

        <IndentProductGrid
          gridData={gridData}
          handleCellValueChange={handleCellValueChange}
          handleDelete={handleDelete}
          packageOptions={packageOptions}
          supplierOptions={supplierOptions}
          productOptions={productOptions}
        />

        <IndentProductFooter setValue={setValue} control={control} getValues={getValues} watch={watch} />

        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={() => {
            initializedRef.current = false;
            initializeForm();
          }}
          onSave={handleSubmit(onSubmit)}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </form>
    </Paper>
  );
};

export default IndentProductDetails;
