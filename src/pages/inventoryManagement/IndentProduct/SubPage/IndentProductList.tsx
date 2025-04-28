import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useForm } from "react-hook-form";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import { indentProductService } from "@/services/InventoryManagementService/inventoryManagementService";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import dayjs from "dayjs";

interface IndentProductDetailsProps {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
}

const IndentProductDetails: React.FC<IndentProductDetailsProps> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange }) => {
  const { control, setValue, watch, reset, handleSubmit } = useForm<IndentSaveRequestDto>();
  const [, setIsSubmitted] = useState(false);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();
  const dropdownValues = useDropdownValues(["department", "departmentIndent"]);
  const fromDeptID = watch("IndentMaster.fromDeptID");
  const departmentList = dropdownValues.department || [];
  const toDepartmentOptions = departmentList
    .filter((d: any) => d?.isStoreYN === "Y" && parseInt(d.value) !== fromDeptID)
    .map((dept: any) => ({ value: parseInt(dept.value), label: dept.label }));

  const indentTypeOptions = (dropdownValues.departmentIndent || []).map((type: any) => ({ value: type.value, label: type.label }));

  const initializeForm = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await indentProductService.getNextCode("IND", 3);
      const defaultValues = {
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
          compID: compID || 0,
          compCode: compCode || "",
          compName: compName || "",
          transferYN: "N",
          remarks: "",
          pChartCode: "",
          pChartID: 0,
        },
        IndentDetails: [],
      };

      reset(defaultValues);
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Indent Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, selectedDeptName, compID, compCode, compName, reset, setLoading]);

  useEffect(() => {
    if (selectedData) {
      const formattedData = {
        ...selectedData,
        IndentMaster: {
          ...selectedData.IndentMaster,
          indentDate: dayjs(selectedData.IndentMaster.indentDate).format("DD/MM/YYYY"),
        },
      };
      reset(formattedData);
    } else {
      initializeForm();
    }
  }, [selectedData, initializeForm, reset]);

  const handleToDepartmentChange = (value: any) => {
    const deptId = typeof value === "string" ? parseInt(value) : value;
    const selectedDept = departmentList.find((d: any) => parseInt(d.value) === deptId);
    const deptName = selectedDept?.label || "";
    setValue("IndentMaster.toDeptID", deptId);
    setValue("IndentMaster.toDeptName", deptName);
  };

  const onSubmit = async (data: IndentSaveRequestDto) => {
    setIsSubmitted(true);

    if (!data.IndentMaster.indentType || !data.IndentMaster.indentCode) {
      showAlert("Error", "Indent Type and Indent Code are required.", "error");
      return;
    }

    const formattedData = {
      ...data,
      IndentMaster: {
        ...data.IndentMaster,
        indentDate: dayjs(data.IndentMaster.indentDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      },
    };

    setLoading(true);
    try {
      await indentProductService.save(formattedData);
      showAlert("Success", "Indent saved successfully.", "success", { onConfirm: initializeForm });
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
            <FormField name="productSearch" control={control} type="text" label="Product Search" placeholder="Search product..." defaultValue="" size="small" />
          </Grid>
        </Grid>

        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={initializeForm} onSave={handleSubmit(onSubmit)} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </form>
    </Paper>
  );
};

export default IndentProductDetails;
