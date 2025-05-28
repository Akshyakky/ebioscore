import React, { useCallback, useEffect, useState, useRef } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
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
import { useProductSearch } from "@/hooks/InventoryManagement/Product/useProductSearch";

interface Props {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
  onIndentDetailsChange: (rows: IndentDetailDto[]) => void;
}

const IndentProductDetails: React.FC<Props> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange, onIndentDetailsChange }) => {
  const { control, setValue, reset, handleSubmit, getValues, watch } = useForm<IndentSaveRequestDto>();
  const { setLoading } = useLoading();
  const [gridData, setGridData] = useState<IndentDetailDto[]>([]);
  const initializedRef = useRef(false);
  const [selectedIndentType, setSelectedIndentType] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const { setInputValue, setSelectedProduct } = useProductSearch({ minSearchLength: 2 });
  const { showAlert } = useAlert();

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
  const { department, departmentIndent } = useDropdownValues(requiredDropdowns);

  const initializeForm = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setLoading(true);
    try {
      const nextCode = await indentProductMastService.getNextCode("IND", 3);
      const statusFilterResponse = await appModifiedListService.getAll();
      const statusFilterData = statusFilterResponse?.data?.filter((item: any) => item.amlField === "STATUSFILTER") || [];
      const pendingStatus = statusFilterData.find((s: any) => s.amlCode === "PND") ?? statusFilterData[0];

      reset({
        IndentMaster: {
          indentID: 0,
          indentCode: nextCode.data,
          indentType: "",
          indentTypeValue: "",
          indentDate: dayjs().format("YYYY-MM-DD"),
          fromDeptID: selectedDeptId,
          fromDeptName: selectedDeptName,
          toDeptID: "",
          toDeptName: "",
          rActiveYN: "Y",
          indentApprovedYN: "Y",
          rNotes: "",
          transferYN: "N",
          remarks: "",
          pChartID: 0,
          pChartCode: "",
          indStatusCode: pendingStatus?.amlCode ?? "",
          indStatus: pendingStatus?.amlName ?? "",
          indGrnStatusCode: pendingStatus?.amlCode ?? "",
          indGrnStatus: pendingStatus?.amlName ?? "",
          auGrpID: 18,
          autoIndentYN: "N",
          oldPChartID: 0,
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

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setClearSearchTrigger((prev) => prev + 1);
    showAlert("Success", "Patient selection cleared", "success");
  };

  useEffect(() => {
    if (selectedData) {
      const indentTypeValue = selectedData.IndentMaster.indentTypeValue || "";
      const indentTypeName = selectedData.IndentMaster.indentType || "";

      setValue("IndentMaster.indentTypeValue", indentTypeValue);
      setValue("IndentMaster.indentType", indentTypeName);
      setSelectedIndentType(indentTypeValue);

      setValue("IndentMaster.indentCode", selectedData.IndentMaster.indentCode || "");
      setValue("IndentMaster.indentDate", dayjs(selectedData.IndentMaster.indentDate).format("YYYY-MM-DD"));
      setValue("IndentMaster.fromDeptName", selectedData.IndentMaster.fromDeptName || selectedDeptName);
      setValue("IndentMaster.rNotes", selectedData.IndentMaster.rNotes || "");
      setValue("IndentMaster.rActiveYN", selectedData.IndentMaster.rActiveYN || "Y");
      setValue("IndentMaster.indentApprovedYN", selectedData.IndentMaster.indentApprovedYN || "N");

      const toDeptID = selectedData.IndentMaster.toDeptID;
      setValue("IndentMaster.toDeptID", toDeptID ? String(toDeptID) : "");
      setValue("IndentMaster.toDeptName", selectedData.IndentMaster.toDeptName || "");

      setGridData([...(selectedData.IndentDetails || [])]);
      initializedRef.current = true;
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
    const existingProduct = gridData.find((item) => item.productID === product.productID);
    if (existingProduct) {
      await showAlert("Duplicate Product", "This product is already in the grid. Are you sure you want to add it again?", "warning", {
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes, Add it",
        cancelButtonText: "No, Cancel",
        onConfirm: async () => {
          await fetchProductDetails(product.productID, product);
          setInputValue("");
          setSelectedProduct(null);
        },
        onCancel: () => {
          setInputValue("");
          setSelectedProduct(null);
        },
      });
    } else {
      await fetchProductDetails(product.productID, product);
      setInputValue("");
      setSelectedProduct(null);
    }
  };

  const handlePatientSelect = (patient: { pChartID: number; pChartCode: string } | null) => {
    setSelectedPatient(patient);
    if (patient) {
      setValue("IndentMaster.pChartID", patient.pChartID);
      setValue("IndentMaster.pChartCode", patient.pChartCode);
    } else {
      setValue("IndentMaster.pChartID", 0);
      setValue("IndentMaster.pChartCode", "");
    }
  };

  const handleCellValueChange = (rowIndex: number, field: keyof IndentDetailDto, value: any) => {
    setGridData((prev) => {
      const newData = [...prev];
      // Preserve all existing properties, especially indentDetID, while updating the specified field
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      setValue("IndentDetails", newData);
      onIndentDetailsChange(newData);
      return newData;
    });
  };

  const handleDelete = (item: IndentDetailDto) => {
    showAlert("Confirm Deletion", "Are you sure you want to delete this product?", "warning", {
      onConfirm: () => {
        setGridData((prev) => {
          const newData = prev.filter((row) => row !== item);
          setValue("IndentDetails", newData);
          onIndentDetailsChange(newData);
          return newData;
        });
      },
      onCancel: () => {},
    });
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

    setLoading(true);
    try {
      debugger;
      const result = await indentProductServices.saveIndent(payload);
      if (result?.success) {
        showAlert("Success", "Indent saved successfully.", "success", {
          onConfirm: () => {
            initializedRef.current = false;
            setSelectedPatient(null);
            setClearSearchTrigger((p) => p + 1);
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
              name="IndentMaster.indentTypeValue"
              control={control}
              type="select"
              label="Indent Type"
              required
              options={(departmentIndent ?? []).map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              size="small"
              defaultValue={selectedData?.IndentMaster?.indentTypeValue || ""}
              onChange={(event) => {
                let code: string | undefined;

                if (typeof event === "string") {
                  code = event;
                } else if (event && typeof event === "object") {
                  code = event.target?.value || event.value;
                }

                if (code) {
                  const opt = (departmentIndent || []).find((o) => o.value === code);
                  const label = opt?.label || "";

                  setSelectedIndentType(code); // for conditional UI
                  setValue("IndentMaster.indentTypeValue", code); // CODE
                  setValue("IndentMaster.indentType", label); // NAME
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
              setInputValue={setInputValue}
              setSelectedProduct={setSelectedProduct}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {(selectedIndentType === "departmentIndent01" || selectedIndentType === "Patient Indent") && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={clearSearchTrigger} placeholder="Enter name, UHID or phone number" />
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
