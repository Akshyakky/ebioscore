import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import dayjs from "dayjs";

interface IndentProductDetailsProps {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
}

const IndentProductDetails: React.FC<IndentProductDetailsProps> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange }) => {
  const { control, setValue, watch, reset, handleSubmit } = useForm<IndentSaveRequestDto>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();
  const dropdownValues = useDropdownValues(["department", "departmentIndent"]);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidInputRef = useRef<HTMLInputElement>(null);

  // Watch values to update dependent fields
  const indentType = watch("IndentMaster.indentType");
  const fromDeptID = watch("IndentMaster.fromDeptID");
  const toDeptID = watch("IndentMaster.toDeptID");

  // Process department options
  const departmentList = dropdownValues.department || [];
  const toDepartmentOptions = departmentList
    .filter((d: any) => d?.isStoreYN === "Y" && parseInt(d.value) !== fromDeptID)
    .map((dept: any) => ({ value: parseInt(dept.value), label: dept.label }));

  const fromDepartmentOptions = departmentList.filter((d: any) => parseInt(d.value) !== toDeptID).map((dept: any) => ({ value: parseInt(dept.value), label: dept.label }));

  // Process indent type options
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
      // Format date for the form field
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

  const handlePatientSelection = (suggestion: string) => {
    const pChartCode = suggestion.split("|")[0].trim();
    const pChartID = extractNumbers(pChartCode)[0] || 0;

    setValue("IndentMaster.pChartCode", pChartCode);
    setValue("IndentMaster.pChartID", pChartID);
  };

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

    // Format date back to ISO format for API
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
          <Grid size={{ xs: 12, md: 3 }}>
            <DepartmentInfoChange deptName={selectedDeptName || "Select Department"} handleChangeClick={handleDepartmentChange} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentType" control={control} type="select" label="Indent Type" required options={indentTypeOptions} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentCode" control={control} type="text" label="Indent Code" disabled required />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.indentDate" control={control} type="datepicker" label="Date" disabled />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormField name="IndentMaster.fromDeptID" control={control} type="select" label="From Dept" options={fromDepartmentOptions} disabled />
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
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="productSearch" control={control} type="text" label="Product Search" placeholder="Search product..." defaultValue="" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormField name="IndentMaster.remarks" control={control} type="textarea" label="Remarks" rows={3} />
          </Grid>
        </Grid>

        <FormSaveClearButton clearText="Clear" saveText="Save" onClear={initializeForm} onSave={handleSubmit(onSubmit)} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      </form>
    </Paper>
  );
};

export default IndentProductDetails;
