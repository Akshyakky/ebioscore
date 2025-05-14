import { Grid, Paper } from "@mui/material";
import React from "react";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import FormField from "@/components/FormField/FormField";
import { updateGRNMastField } from "@/store/features/grn/grnSlice";
import { initialMastData } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductSearch } from "../../CommonPage/Product/ProductSearchForm";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interfacr";

interface GRNHeaderProps {
  handleDepartmentChange: () => void;
}
const GRNHeader: React.FC<GRNHeaderProps> = ({ handleDepartmentChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownValues = useDropdownValues(["department", "grnType"]);
  const departmentInfo = useSelector((state: RootState) => state.grn.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentName } = departmentInfo;

  const grnMastData = useSelector((state: RootState) => state.grn.grnMastData) ?? initialMastData;
  const { grnCode, invoiceNo, invDate, supplrID, grnType, dcNo, poNo, poDate, grnDate } = grnMastData;

  const approvedDisable = useSelector((state: RootState) => state.grn.disableApprovedFields) ?? false;
  const fetchProductDetails = async (productID: number, basicInfo: ProductSearchResult) => {
    console.log(productID, basicInfo);
    try {
    } catch (err) {
    } finally {
    }
  };

  const handleProductSelect = (product: ProductSearchResult | null) => {
    if (product) fetchProductDetails(product.productID, product);
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <DepartmentInfoChange deptName={departmentName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="GRN Code"
          value={grnCode}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "grnCode", value: e.target.value }));
          }}
          name="grnCode"
          ControlID="grnCode"
          isMandatory
          disabled
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="Invoice No"
          value={invoiceNo}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "invoiceNo", value: e.target.value }));
          }}
          name="invoiceNo"
          ControlID="invoiceNo"
          isMandatory
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />

        <FormField
          type="text"
          label="INV Date"
          value={invDate}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "invDate", value: e.target.value }));
          }}
          name="invDate"
          ControlID="invDate"
          isMandatory
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="select"
          label="Supplier Name"
          value={supplrID}
          onChange={(e) => {
            const value = Number(e.target.value);
            const selected = dropdownValues?.department?.find((opt) => Number(opt.value) === value);
            if (selected) {
              dispatch(updateGRNMastField({ field: "supplrName", value: selected.label }));
            }
            dispatch(updateGRNMastField({ field: "supplrID", value: e.target.value }));
          }}
          name="supplrID"
          ControlID="supplrID"
          options={dropdownValues.department || []}
          isMandatory
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="select"
          label="GRN Type"
          value={grnType}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "grnType", value: e.target.value }));
          }}
          name="supplrID"
          ControlID="supplrID"
          options={dropdownValues.grnType || []}
          isMandatory
          disabled={approvedDisable}
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="DC No"
          value={dcNo}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "dcNo", value: e.target.value }));
          }}
          name="dcNo"
          ControlID="dcNo"
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="GRN Date"
          value={grnDate}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "grnDate", value: e.target.value }));
          }}
          name="grnDate"
          ControlID="grnDate"
          isMandatory
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="PO Code"
          value={poNo}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "poNo", value: e.target.value }));
          }}
          name="poNo"
          ControlID="poNo"
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
        <FormField
          type="text"
          label="PO Date"
          value={poDate}
          onChange={(e) => {
            dispatch(updateGRNMastField({ field: "poDate", value: e.target.value }));
          }}
          name="poDate"
          ControlID="poDate"
          gridProps={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
        />
      </Grid>
      <Grid container spacing={2}>
        {!approvedDisable && (
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}>
            <ProductSearch onProductSelect={handleProductSelect} label="Search Product" placeholder="Search product..." initialSelection={null} />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default GRNHeader;
