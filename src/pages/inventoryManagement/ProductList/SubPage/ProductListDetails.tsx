import React, { useState, useCallback, useEffect } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "@/store/hooks";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import useDropdownChange from "@/hooks/useDropdownChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

const ProductListDetails: React.FC<{ editData?: ProductListDto }> = ({ editData }) => {
  const [formState, setFormState] = useState<ProductListDto>({
    expiry: "Y",
    prescription: "Y",
    sellable: "Y",
    taxable: "Y",
    productID: 0,
    catValue: "",
    pLocationID: 0,
    chargableYN: "N",
    supplierStatus: "N",
    vedCode: "",
    abcCode: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
    isAssetYN: "N",
  });

  const { handleDropdownChange } = useDropdownChange<ProductListDto>(setFormState);
  const dropdownValues = useDropdownValues(["productCategory", "productGroup", "productSubGroup", "productUnit", "medicationForm", "medicationGeneric", "taxType"]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (editData) {
      setFormState(editData);
    } else {
      handleClear();
    }
  }, [editData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSave = async () => {
    setIsSubmitted(true);

    if (!formState.productCode?.trim()) {
      showAlert("Error", "Product Code is mandatory.", "error");
      return;
    }
    setLoading(true);
    try {
      const result = await productListService.save(formState);

      if (result.success) {
        showAlert("Success", "Product saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Product.", "error");
      }
    } catch (error) {
      console.error("Error saving Product:", error);
      showAlert("Error", "An unexpected error occurred while saving. Please check the console for more details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormState({
      expiry: "Y",
      prescription: "Y",
      sellable: "Y",
      taxable: "Y",
      productID: 0,
      catValue: "",
      pLocationID: 1,
      chargableYN: "N",
      supplierStatus: "N",
      vedCode: "Y",
      abcCode: "Y",
      rActiveYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "Y",
      isAssetYN: "N",
    });
    setIsSubmitted(false);
  }, [compID, compCode, compName]);

  const handleSwitchToggle = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [name]: event.target.checked ? "Y" : "N",
      }));
    },
    []
  );

  const handleGSTChange = (value: number, taxTypeOptions: any[]) => {
    const selectedTax = taxTypeOptions.find((option) => option.value === value);
    if (selectedTax) {
      const gstValue = parseFloat(selectedTax.label);
      const halfGstValue = gstValue / 2;

      setFormState((prevState) => {
        const newState = {
          ...prevState,
          taxID: value,
          cgstPerValue: halfGstValue,
          sgstPerValue: halfGstValue,
        };
        return newState;
      });
    }
  };
  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="product-list-header">
        Product Details
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="select"
          label="Category Value"
          value={formState.catValue}
          onChange={handleDropdownChange(["catValue"], ["catDescription"], dropdownValues.productCategory)}
          options={dropdownValues.productCategory}
          name="catValue"
          ControlID="catValue"
          placeholder="Category Value"
          maxLength={50}
          isMandatory
        />

        <FormField
          type="text"
          label="Product Code"
          value={formState.productCode || ""}
          onChange={handleInputChange}
          name="productCode"
          ControlID="productCode"
          placeholder="Product Code"
          maxLength={25}
          isMandatory
        />
        <FormField
          type="text"
          label="Product Name"
          value={formState.productName || ""}
          onChange={handleInputChange}
          name="productName"
          ControlID="productName"
          placeholder="Product Name"
          maxLength={50}
        />

        <FormField
          type="select"
          label="Product Group"
          value={formState.pGrpID}
          onChange={handleDropdownChange(["pGrpID"], ["productGroupName"], dropdownValues.productGroup)}
          options={dropdownValues.productGroup}
          name="pGrpID"
          ControlID="pGrpID"
          placeholder="Product Group"
          maxLength={50}
          isMandatory
        />
        <FormField
          type="select"
          label="Product Sub Group"
          value={formState.psGrpID}
          onChange={handleDropdownChange(["psGrpID"], ["psGroupName"], dropdownValues.productSubGroup)}
          options={dropdownValues.productSubGroup}
          name="psGrpID"
          ControlID="psGrpID"
          placeholder="Product Sub Group"
          maxLength={50}
          isMandatory
        />
        <>
          <FormField
            type="number"
            label="Base Unit"
            value={formState.baseUnit}
            onChange={handleInputChange}
            name="baseUnit"
            ControlID="baseUnit"
            placeholder="BaseUnit"
            maxLength={1}
            isMandatory
            gridProps={{ xs: 12, md: 1 }}
          />
          <FormField
            type="select"
            label="Product Unit"
            value={formState.pUnitID}
            onChange={handleDropdownChange(["pUnitID"], ["pUnitName"], dropdownValues.productUnit)}
            options={dropdownValues.productUnit}
            name="pUnitID"
            ControlID="pUnitID"
            placeholder="Product Unit"
            maxLength={50}
            isMandatory
            gridProps={{ xs: 12, md: 2 }}
          />
        </>

        <>
          <FormField
            type="number"
            label="Issue Unit"
            value={formState.issueUnit}
            onChange={handleInputChange}
            name="issueUnit"
            ControlID="issueUnit"
            placeholder="Issue Unit"
            maxLength={1}
            isMandatory
            gridProps={{ xs: 12, md: 1 }}
          />
          <FormField
            type="select"
            label="Issue Unit"
            value={formState.pPackageID}
            onChange={handleDropdownChange(["pPackageID"], ["pUnitName"], dropdownValues.productUnit)}
            options={dropdownValues.productUnit}
            name="pPackageID"
            ControlID="pPackageID"
            placeholder="Issue Unit"
            maxLength={50}
            isMandatory
            gridProps={{ xs: 12, md: 2 }}
          />
        </>
        <FormField
          type="select"
          label="Form Name "
          value={formState.mFID}
          onChange={handleDropdownChange(["mFID"], ["MFName"], dropdownValues.medicationForm)}
          options={dropdownValues.medicationForm}
          name="mFID"
          ControlID="mFID"
          placeholder="Form Name"
          maxLength={50}
          isMandatory
        />

        <FormField
          type="select"
          label="Generic Name "
          value={formState.mGenID}
          onChange={handleDropdownChange(["mGenID"], ["manufacturerGenericName"], dropdownValues.medicationGeneric)}
          options={dropdownValues.medicationGeneric}
          name="mGenID"
          ControlID="mGenID"
          placeholder="Generic Name"
          maxLength={50}
          isMandatory
        />

        <FormField
          type="number"
          label="Bar Code"
          value={formState.barcode}
          onChange={handleInputChange}
          name="barcode"
          ControlID="barcode"
          placeholder="Bar Code"
          maxLength={1}
          isMandatory
        />

        <FormField
          type="number"
          label="Universal Code(PC)"
          value={formState.universalCode}
          onChange={handleInputChange}
          name="universalCode"
          ControlID="UniversalCode(PC)"
          placeholder="Universal Code(PC)"
          maxLength={1}
          isMandatory
        />

        <FormField
          type="radio"
          label="ABC Code"
          name="abcCode"
          value={formState.abcCode}
          onChange={(e) =>
            handleInputChange({
              target: { name: "abcCode", value: e.target.value },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          options={[
            { value: "Y", label: "A" },
            { value: "N", label: "B" },
            { value: "N", label: "C" },
          ]}
          ControlID="abcCode"
          gridProps={{ xs: 12, md: 1.5 }}
          inline={true}
        />
        <FormField
          type="radio"
          label="VED Code"
          name="vedCode"
          value={formState.vedCode}
          onChange={(e) =>
            handleInputChange({
              target: { name: "vedCode", value: e.target.value },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          options={[
            { value: "Y", label: "V" },
            { value: "N", label: "E" },
            { value: "N", label: "D" },
          ]}
          ControlID="vedCode"
          gridProps={{ xs: 12, md: 1.5 }}
          inline={true}
        />
        <FormField
          type="select"
          label="Manufacturer Name"
          value={formState.manufacturerID}
          onChange={handleDropdownChange(["manufacturerID"], ["manufacturerName"], dropdownValues.medicationGeneric)}
          options={dropdownValues.medicationGeneric}
          name="manufacturerID"
          ControlID="manufacturerID"
          placeholder="Manufacturer Name"
          maxLength={50}
          isMandatory
        />

        <FormField
          type="select"
          label="GST"
          value={formState.taxID || ""}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            handleGSTChange(value, dropdownValues.taxType);
          }}
          options={dropdownValues.taxType}
          name="taxID"
          ControlID="taxID"
          placeholder="GST"
          maxLength={50}
          isMandatory
        />

        <FormField
          type="number"
          label="CGST"
          value={formState.cgstPerValue !== undefined ? formState.cgstPerValue.toString() : ""}
          onChange={handleInputChange}
          name="cgstPerValue"
          ControlID="cgstPerValue"
          placeholder="CGST"
          maxLength={1}
          isMandatory
          disabled={true}
        />

        <FormField
          type="number"
          label="SGST"
          value={formState.sgstPerValue !== undefined ? formState.sgstPerValue.toString() : ""}
          onChange={handleInputChange}
          name="sgstPerValue"
          ControlID="sgstPerValue"
          placeholder="SGST"
          maxLength={1}
          isMandatory
          disabled={true}
        />

        <FormField
          type="text"
          label="HSN Code"
          value={formState.hsnCODE}
          onChange={handleInputChange}
          name="hsnCODE"
          ControlID="hsnCODE"
          placeholder="HSN Code"
          maxLength={1}
          isMandatory
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
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleSwitchToggle("rActiveYN")}
          name="rActiveYN"
          ControlID="rActiveYN"
          size="medium"
        />
        <FormField
          type="switch"
          label={formState.expiry === "Y" ? "Activate Expiry" : "Deactivate Expiry"}
          value={formState.expiry}
          checked={formState.expiry === "Y"}
          onChange={handleSwitchToggle("expiry")}
          name="Expiry"
          ControlID="expiry"
          size="medium"
          color="secondary"
        />
        <FormField
          type="switch"
          label={formState.taxable === "Y" ? "Activate Taxable" : "Deactivate Taxable"}
          value={formState.taxable}
          checked={formState.taxable === "Y"}
          onChange={handleSwitchToggle("taxable")}
          name="Taxable"
          ControlID="taxable"
          color="info"
          size="medium"
        />
        <FormField
          type="switch"
          label={formState.prescription === "Y" ? "Activate Prescription" : "Deactivate Prescription"}
          value={formState.prescription}
          checked={formState.prescription === "Y"}
          onChange={handleSwitchToggle("prescription")}
          name="Prescription"
          ControlID="prescription"
          color="info"
          size="medium"
        />
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ProductListDetails;
