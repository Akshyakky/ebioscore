import React, { useCallback, useEffect, useRef, useState } from "react";
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
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";

interface IndentProductListDetailsProps {
  selectedData?: IndentSaveRequestDto | null;
  selectedDeptId: number;
  selectedDeptName: string;
  handleDepartmentChange: () => void;
}

const IndentProductListDetails: React.FC<IndentProductListDetailsProps> = ({ selectedData, selectedDeptId, selectedDeptName, handleDepartmentChange }) => {
  const [formState, setFormState] = useState<IndentSaveRequestDto>({
    IndentMaster: {
      indentID: 0,
      indentCode: "",
      indentType: "Department Indent",
      indentDate: new Date().toISOString().split("T")[0],
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
      pChartCode: "",
      pChartID: 0,
    },
    IndentDetails: [],
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();
  const dropdownValues = useDropdownValues(["department", "departmentIndent"]);
  const { handleDropdownChange } = useDropdownChange(setFormState);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidInputRef = useRef<HTMLInputElement>(null);

  const departmentList = dropdownValues.department || [];
  const toDepartmentOptions = departmentList.filter((d: any) => d?.isStoreYN === "Y" && parseInt(d.value) !== formState.IndentMaster.fromDeptID);
  const fromDepartmentOptions = departmentList.filter((d: any) => parseInt(d.value) !== formState.IndentMaster.toDeptID);
  const selectedIndentType = formState.IndentMaster.indentType;

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await indentProductService.getNextCode("IND", 3);
      setFormState({
        IndentMaster: {
          indentID: 0,
          indentCode: nextCode.data,
          indentType: "Department Indent",
          indentDate: new Date().toISOString().split("T")[0],
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
      });
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Indent Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDeptId, selectedDeptName, compID, compCode, compName]);

  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
    } else {
      handleClear();
    }
  }, [selectedData, handleClear]);

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

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const { name, value } = event.target;
      const deptId = parseInt(value);
      const selectedDept = departmentList.find((d) => parseInt(d.value) === deptId);
      const deptName = selectedDept?.label || "";

      setFormState((prev) => ({
        ...prev,
        IndentMaster: {
          ...prev.IndentMaster,
          [name]: deptId,
          ...(name === "toDeptID" && { toDeptName: deptName }),
        },
      }));
    },
    [departmentList]
  );

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
        <Grid size={{ xs: 12, md: 3 }}>
          <DepartmentInfoChange deptName={formState.IndentMaster.fromDeptName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>

        <FormField
          type="select"
          label="Indent Type"
          value={formState.IndentMaster.indentType}
          onChange={handleDropdownChange(["IndentMaster", "indentType"], [], dropdownValues.departmentIndent || [])}
          name="indentType"
          ControlID="indentType"
          options={dropdownValues.departmentIndent || []}
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

        <FormField type="date" label="Date" value={formState.IndentMaster.indentDate} onChange={handleInputChange} name="indentDate" ControlID="indentDate" disabled />

        <FormField
          type="select"
          label="From Dept"
          value={formState.IndentMaster.fromDeptID?.toString() || ""}
          onChange={() => {}}
          name="fromDeptID"
          ControlID="fromDeptID"
          options={fromDepartmentOptions}
          disabled
        />

        {selectedIndentType === "departmentIndent01" && (
          <FormField
            ref={uhidInputRef}
            type="autocomplete"
            label="UHID No."
            value={formState.IndentMaster.pChartCode}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                IndentMaster: {
                  ...prev.IndentMaster,
                  pChartCode: e.target.value,
                },
              }))
            }
            name="pChartCode"
            ControlID="pChartCode"
            placeholder="Search by UHID, Name, Mobile"
            isMandatory
            fetchSuggestions={fetchPatientSuggestions}
            onSelectSuggestion={(suggestion) => {
              const pChartCode = suggestion.split("|")[0].trim();
              const pChartID = extractNumbers(pChartCode)[0] || null;
              if (pChartID) {
                setFormState((prev) => ({
                  ...prev,
                  IndentMaster: {
                    ...prev.IndentMaster,
                    pChartCode,
                    pChartID,
                  },
                }));
              }
            }}
          />
        )}

        {/* <Grid item xs={12} md={9}>
          <PatientDemographics pChartID={formState.pChartID} />
        </Grid> */}

        <FormField
          type="select"
          label="To Department"
          value={formState.IndentMaster.toDeptID?.toString() || ""}
          onChange={handleSelectChange}
          name="toDeptID"
          ControlID="toDeptID"
          options={toDepartmentOptions}
          isMandatory
          isSubmitted={isSubmitted}
        />

        <FormField type="text" label="Product Search" value={""} onChange={() => {}} name="productSearch" ControlID="productSearch" placeholder="Search product..." />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default IndentProductListDetails;
