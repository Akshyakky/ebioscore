import { useCallback, useEffect, useState } from "react";
import ModifiedFieldDialog from "../../../../components/ModifiedFieldDailog/ModifiedFieldDailog";
import { useLoading } from "../../../../context/LoadingContext";
import { AppModifiedMast, AppModifyFieldDto } from "../../../../interfaces/HospitalAdministration/AppModifiedlistDto";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { appModifiedListService, appModifiedMastService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../../../utils/Common/showAlert";
import { Grid, SelectChangeEvent } from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../components/FormField/FormField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import moduleService from "../../../../services/CommonServices/ModuleService";
import { useAppSelector } from "@/store/hooks";

const AppModifiedDetails: React.FC = () => {
  const { setLoading } = useLoading();
  const [masterList, setMasterList] = useState<AppModifiedMast[]>([]);
  const [fieldsList, setFieldsList] = useState<AppModifyFieldDto[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number>(0);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const user = useAppSelector((state) => state.auth);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AppModifyFieldDto | null>(null);
  const [dropdownValues, setDropdownValues] = useState({
    mainModulesOptions: [] as DropdownOption[],
    authGroupOptions: [] as DropdownOption[],
  });
  const { token, adminYN, userID } = useAppSelector((state) => state.auth);
  const [isDropdownLoading, setIsDropdownLoading] = useState(true);
  const [categoryFormData, setCategoryFormData] = useState<AppModifiedMast>({
    fieldID: 0,
    fieldCode: "",
    fieldName: "",
    auGrpID: 0,
    rActiveYN: "Y",
    compID: user.compID || 0,
    compCode: user.compCode || "",
    compName: user.compName || "",
    transferYN: "Y",
    rNotes: null,
  });

  useEffect(() => {
    fetchMasterList();
  }, []);

  const handleAddField = () => {
    setFormData(null);
    setIsFieldDialogOpen(true);
  };

  const fetchMasterList = async () => {
    setLoading(true);
    try {
      const response: any = await appModifiedMastService.getAll();
      if (response && Array.isArray(response.data)) {
        const validItems = response.data.filter((item: AppModifiedMast) => item.rActiveYN === "Y");
        setMasterList(validItems);
        const categoryOptionsData = validItems.map((item: AppModifiedMast) => ({
          value: item.fieldID.toString(),
          label: item.fieldName,
        }));
        setCategoryOptions(categoryOptionsData);
      }
    } catch (error) {
      showAlert("Error", "Failed to load master list", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = useCallback(
    async (amlID: number, callback?: () => void) => {
      if (!amlID) return;
      setLoading(true);
      try {
        const response: any = await appModifiedListService.getAll();
        const fieldsData = response.data || response;
        if (Array.isArray(fieldsData)) {
          const selectedCategory = masterList.find((master) => master.fieldID === amlID);
          if (selectedCategory) {
            const filteredFields = fieldsData.filter((field) => {
              return field.amlField === selectedCategory.fieldName && field.rActiveYN === "Y";
            });
            setFieldsList(filteredFields);
            if (callback) callback();
          }
        }
      } catch (error) {
        showAlert("Error", "Failed to load fields", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, masterList]
  );

  const handleMasterChange = async (event: SelectChangeEvent<string>) => {
    const selectedId = parseInt(event.target.value);
    setSelectedMasterId(selectedId);
    const selectedCategory = masterList.find((master) => master.fieldID === selectedId);
    if (selectedCategory) {
      setSelectedCategoryName(selectedCategory.fieldName);
      fetchFields(selectedId);
    }
  };

  const handleCategoryDialogSubmit = async () => {
    const { fieldCode, fieldName, auGrpID } = categoryFormData;
    if (!fieldCode || !fieldName || !auGrpID) {
      showAlert("Error", "All fields are required. Please fill out Field Code, Field Name, and Main Modules.", "error");
      return;
    }
    try {
      const response = await appModifiedMastService.save(categoryFormData);
      if (response) {
        showAlert("Success", "Category added successfully", "success");
        setIsCategoryDialogOpen(false);
        setCategoryFormData({
          fieldID: 0,
          fieldCode: "",
          fieldName: "",
          auGrpID: 0,
          rActiveYN: "Y",
          compID: user.compID || 0,
          compCode: user.compCode || "",
          compName: user.compName || "",
          transferYN: "Y",
          rNotes: null,
        });
        fetchMasterList();
      } else {
        showAlert("Error", "Failed to add category", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred during submission.", "error");
    }
  };

  useEffect(() => {
    const fetchMainModules = async () => {
      debugger;
      if (token) {
        setIsDropdownLoading(true);
        try {
          const modulesData = await moduleService.getActiveModules(adminYN === "Y" ? 0 : (userID ?? 0));
          const mainModuleOptions = modulesData.map((module) => ({
            label: module.title,
            value: module.auGrpID.toString(),
          }));

          setDropdownValues((prevValues) => ({
            ...prevValues,
            mainModulesOptions: mainModuleOptions,
          }));
          setIsDropdownLoading(false);
        } catch (error) {
          showAlert("Error", "Error fetching main modules", "error");
          setIsDropdownLoading(false);
        }
      }
    };

    fetchMainModules();
  }, [token, adminYN, userID]);

  const handleEdit = useCallback(async (row: AppModifyFieldDto) => {
    try {
      setFormData({ ...row });
      setIsFieldDialogOpen(true);
    } catch (error) {
      showAlert("Error", "An error occurred while fetching field details.", "error");
    }
  }, []);
  const handleCloseDialog = () => {
    setFormData(null);
    setIsFieldDialogOpen(false);
  };

  const handleFieldAddedOrUpdated = () => {
    fetchFields(selectedMasterId);
    setFormData(null);
    setIsFieldDialogOpen(false);
  };

  const handleDelete = useCallback(
    async (row: AppModifyFieldDto) => {
      setLoading(true);
      try {
        const updatedField = { ...row, rActiveYN: "N" };
        const result = await appModifiedListService.save(updatedField);
        if (result) {
          showAlert("Success", `${row.amlName} deactivated successfully`, "success");
          fetchFields(selectedMasterId);
        } else {
          showAlert("Error", "Failed to deactivate field", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deactivating the field", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchFields, selectedMasterId]
  );

  const columns = [
    { key: "amlCode", header: "Field Code", visible: true },
    { key: "amlName", header: "Field Name", visible: true },
    { key: "amlField", header: "Category", visible: true },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: AppModifyFieldDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: AppModifyFieldDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row: AppModifyFieldDto) => {
        if (row.modifyYN === "Y" || user.adminYN === "Y") {
          return <CustomButton onClick={() => handleEdit(row)} icon={EditIcon} text="Edit" variant="contained" size="small" />;
        }
        return null;
      },
    },
    {
      key: "delete",
      header: "Delete",
      visible: true,
      render: (row: AppModifyFieldDto) => {
        if (row.modifyYN === "Y") {
          return <CustomButton onClick={() => handleDelete(row)} icon={DeleteIcon} text="Delete" variant="contained" color="error" size="small" />;
        }
        return null;
      },
    },
  ];

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={12} md={12}>
          <FormField
            type="select"
            label="Category"
            name="categoryId"
            value={selectedMasterId.toString()}
            options={categoryOptions}
            onChange={(event) => {
              handleMasterChange(event);
            }}
            ControlID="categoryId"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} container justifyContent="space-between" alignItems="center">
          <CustomButton icon={AddIcon} text="Add Category" onClick={() => setIsCategoryDialogOpen(true)} variant="contained" sx={{ float: "left" }} />
          <CustomButton icon={AddIcon} text="Add Field" onClick={handleAddField} variant="contained" sx={{ float: "right" }} disabled={selectedMasterId === 0} />
        </Grid>
      </Grid>
      <CustomGrid columns={columns} data={fieldsList} />
      <GenericDialog
        open={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        title="Add New Category"
        actions={
          <>
            <CustomButton onClick={() => setIsCategoryDialogOpen(false)} icon={DeleteIcon} text="Cancel" variant="contained" color="error" sx={{ marginRight: 2 }} />
            <CustomButton icon={SaveIcon} text="Save" onClick={handleCategoryDialogSubmit} variant="contained" color="success" />
          </>
        }
      >
        <Grid container spacing={2}>
          <FormField
            type="text"
            label="Field Code"
            name="fieldCode"
            value={categoryFormData.fieldCode}
            onChange={(e) =>
              setCategoryFormData((prev) => ({
                ...prev,
                fieldCode: e.target.value,
              }))
            }
            ControlID="fieldCode"
            gridProps={{ xs: 12 }}
            isMandatory={true}
            fullWidth
          />
          <FormField
            type="text"
            label="Field Name"
            name="fieldName"
            value={categoryFormData.fieldName}
            onChange={(e) =>
              setCategoryFormData((prev) => ({
                ...prev,
                fieldName: e.target.value,
              }))
            }
            ControlID="fieldName"
            isMandatory={true}
            gridProps={{ xs: 12 }}
            fullWidth
          />
          <FormField
            type="select"
            label="Main Modules"
            name="mainModule"
            value={categoryFormData.auGrpID.toString()}
            options={isDropdownLoading ? [{ label: "Loading...", value: "" }] : dropdownValues.mainModulesOptions}
            onChange={(e) =>
              setCategoryFormData((prev) => ({
                ...prev,
                auGrpID: parseInt(e.target.value),
              }))
            }
            ControlID="mainModule"
            isMandatory={true}
            gridProps={{ xs: 12 }}
            fullWidth
          />
        </Grid>
      </GenericDialog>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleCloseDialog}
        selectedCategoryName={selectedCategoryName}
        isFieldCodeDisabled={true}
        initialFormData={formData || {}}
        onFieldAddedOrUpdated={handleFieldAddedOrUpdated}
      />
    </>
  );
};

export default AppModifiedDetails;
