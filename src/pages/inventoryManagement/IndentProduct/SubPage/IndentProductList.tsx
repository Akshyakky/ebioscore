import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, SelectChangeEvent, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { indentProductService } from "@/services/InventoryManagementService/inventoryManagementService";

import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";

const IndentProductListDetails: React.FC = () => {
  const [formState, setFormState] = useState<IndentSaveRequestDto>({
    IndentMaster: {
      indentID: 0,
      indentCode: "",
      indentType: "Department Indent",
      indentDate: new Date().toISOString().split("T")[0],
      fromDeptID: undefined,
      fromDeptName: "",
      toDeptID: undefined,
      toDeptName: "",
      rActiveYN: "Y",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "N",
      remarks: "",
    },
    IndentDetails: [],
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await indentProductService.getNextCode("INDENT", 3);
      setFormState({
        IndentMaster: {
          indentID: 0,
          indentCode: nextCode.data, // ✅ auto-filled
          indentType: "Department Indent",
          indentDate: new Date().toISOString().split("T")[0],
          fromDeptID: undefined,
          fromDeptName: "",
          toDeptID: undefined,
          toDeptName: "",
          rActiveYN: "Y",
          compID: compID || 0,
          compCode: compCode || "",
          compName: compName || "",
          transferYN: "N",
          remarks: "",
        },
        IndentDetails: [],
      });
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to generate next indent code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, setLoading]);

  useEffect(() => {
    handleClear();
  }, [handleClear]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      IndentMaster: {
        ...prev.IndentMaster,
        [name]: value,
      },
    }));
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      IndentMaster: {
        ...prev.IndentMaster,
        [name]: value,
      },
    }));
  }, []);

  const handleSave = async () => {
    setIsSubmitted(true);
    if (!formState.IndentMaster.indentType || !formState.IndentMaster.indentCode) {
      showAlert("Error", "Indent Type and Indent Code are required.", "error");
      return;
    }

    setLoading(true);
    try {
      await indentProductService.save(formState);
      showAlert("Success", "Indent saved successfully.", "success", { onConfirm: handleClear });
    } catch (error) {
      showAlert("Error", "Failed to save indent.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Indent Product Entry
      </Typography>

      <Grid container spacing={2}>
        <FormField
          type="select"
          label="Indent Type"
          value={formState.IndentMaster.indentType}
          onChange={handleSelectChange}
          name="indentType"
          ControlID="indentType"
          options={[{ label: "Department Indent", value: "Department Indent" }]}
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Indent Code"
          value={formState.IndentMaster.indentCode}
          name="indentCode"
          ControlID="indentCode"
          disabled
          isMandatory
          isSubmitted={isSubmitted}
          onChange={() => {}}
        />

        <FormField type="date" label="Date" value={formState.IndentMaster.indentDate} onChange={handleInputChange} name="indentDate" ControlID="indentDate" />
        <FormField type="text" label="From Dept" value={formState.IndentMaster.fromDeptName} onChange={handleInputChange} name="fromDeptName" ControlID="fromDeptName" disabled />
        <FormField type="text" label="To Department" value={formState.IndentMaster.toDeptName} onChange={handleInputChange} name="toDeptName" ControlID="toDeptName" />
        <FormField type="text" label="Product Search" value={""} onChange={() => {}} name="productSearch" ControlID="productSearch" placeholder="Search product..." />
        <FormField type="text" label="Department" value={formState.IndentMaster.fromDeptName || ""} name="fromDeptName" ControlID="fromDeptName" disabled onChange={() => {}} />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default IndentProductListDetails;
