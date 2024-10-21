import React, { useState, useEffect, useCallback } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "../../../../context/LoadingContext";
import {
    AppModifiedMast,
    AppModifyFieldDto,
} from "../../../../interfaces/HospitalAdministration/AppModifiedlistDto";
import {
    appModifiedMastService,
    appModifiedListService,
} from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../../../utils/Common/showAlert";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../components/FormField/FormField";
import { store } from "../../../../store/store";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";

const AppModifiedDetails: React.FC = () => {
    const { setLoading } = useLoading();
    const [masterList, setMasterList] = useState<AppModifiedMast[]>([]);
    const [fieldsList, setFieldsList] = useState<AppModifyFieldDto[]>([]);
    const { compID, compCode, compName } = store.getState().userDetails;
    const [selectedMasterId, setSelectedMasterId] = useState<number>(0);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
    const [categoryOptions, setCategoryOptions] = useState<
        { value: string; label: string }[]
    >([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const userInfo = useSelector((state: RootState) => state.userDetails);
    const effectiveUserID = userInfo
        ? userInfo.adminYN === "Y"
            ? 0
            : userInfo.userID
        : -1;
    const [categoryFormData, setCategoryFormData] = useState<AppModifiedMast>({
        fieldID: 0,
        fieldCode: "",
        fieldName: "",
        auGrpID: 0,
        rActiveYN: "Y",
        compID: store.getState().userDetails.compID || 0,
        compCode: store.getState().userDetails.compCode || "",
        compName: store.getState().userDetails.compName || "",
        transferYN: "Y",
        rNotes: null,
    });
    const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
    const [formData, setFormData] = useState<AppModifyFieldDto>({
        amlID: 0,
        amlName: "",
        amlCode: "",
        amlField: "",
        defaultYN: "N",
        modifyYN: "N",
        rNotes: "",
        compID: compID || 0,
        compCode: "",
        compName: "",
        transferYN: "Y",
        rActiveYN: "Y",
    });

    useEffect(() => {
        fetchMasterList();
    }, []);

    const fetchMasterList = async () => {
        setLoading(true);
        try {
            const response: any = await appModifiedMastService.getAll();
            if (response && Array.isArray(response.data)) {
                const validItems = response.data.filter(
                    (item: AppModifiedMast) => item.rActiveYN === "Y"
                );
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
        async (amlID: number) => {
            if (!amlID) return;
            setLoading(true);
            try {
                const response: any = await appModifiedListService.getAll();
                console.log("Fields Response:", response);
                const fieldsData = response.data || response;
                if (Array.isArray(fieldsData)) {
                    const selectedCategory = masterList.find(
                        (master) => master.fieldID === amlID
                    );
                    if (selectedCategory) {
                        const filteredFields = fieldsData.filter(
                            (field: AppModifyFieldDto) => {
                                const matches =
                                    field.amlField === selectedCategory.fieldName &&
                                    field.rActiveYN === "Y";
                                return matches;
                            }
                        );
                        setFieldsList(filteredFields);
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

    const handleMasterChange = (event: SelectChangeEvent<string>) => {
        const selectedId = parseInt(event.target.value);
        setSelectedMasterId(selectedId);
        const selectedCategory = masterList.find(
            (master) => master.fieldID === selectedId
        );
        if (selectedCategory) {
            setSelectedCategoryName(selectedCategory.fieldName);
            setFormData((prev) => ({
                ...prev,
                amlField: selectedCategory.fieldName,
            }));
            setCategoryFormData((prev) => ({
                ...prev,
                fieldCode: selectedCategory.fieldName,
            }));
            fetchFields(selectedId);
            generateFieldCode(selectedCategory.fieldName);
        }
    };

    const generateFieldCode = async (prefix: string) => {
        try {
            const response: any = await appModifiedMastService.getNextCode(prefix, 3);
            if (response && response.success) {
                setFormData((prev) => ({
                    ...prev,
                    amlCode: response.data,
                }));
                setCategoryFormData((prev) => ({
                    ...prev,
                    fieldCode: response.data,
                }));
            } else {
                showAlert("Error", "Failed to generate field code", "error");
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while generating the field code",
                "error"
            );
        }
    };

    const handleCategoryDialogSubmit = async () => {
        try {
            const response = await appModifiedMastService.save(categoryFormData);
            if (response) {
                showAlert("Success", "Category added successfully", "success");
                setIsCategoryDialogOpen(false);
                fetchMasterList();
            } else {
                showAlert("Error", "Failed to add category", "error");
            }
        } catch (error) {
            showAlert("Error", "An error occurred during submission.", "error");
        }
    };

    const handleFieldDialogSubmit = async () => {
        try {
            if (!selectedMasterId) {
                showAlert("Error", "Please select a category first", "error");
                return;
            }
            const newFieldData = {
                ...formData,
                amlField: selectedCategoryName,
                compID: compID ?? 0,
                compCode: compCode ?? "",
                compName: compName ?? "",
            };
            const response = await appModifiedListService.save(newFieldData);
            if (response) {
                showAlert(
                    "Success",
                    formData.amlID
                        ? "Field updated successfully"
                        : "Field added successfully",
                    "success"
                );
                setIsFieldDialogOpen(false);
                fetchFields(selectedMasterId);
            } else {
                showAlert("Error", "Failed to save field", "error");
            }
        } catch (error) {
            console.error("Error submitting field:", error);
            showAlert("Error", "An error occurred during submission.", "error");
        }
    };

    const handleEdit = useCallback(async (row: AppModifyFieldDto) => {
        try {
            setFormData({ ...row });
            setIsFieldDialogOpen(true);
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while fetching field details.",
                "error"
            );
        }
    }, []);

    const handleDelete = useCallback(
        async (row: AppModifyFieldDto) => {
            setLoading(true);
            try {
                const updatedField = { ...row, rActiveYN: "N" };
                const result = await appModifiedListService.save(updatedField);
                if (result) {
                    showAlert(
                        "Success",
                        `Field ${row.amlName} deactivated successfully`,
                        "success"
                    );
                    fetchFields(selectedMasterId);
                } else {
                    showAlert("Error", "Failed to deactivate field", "error");
                }
            } catch (error) {
                showAlert(
                    "Error",
                    "An error occurred while deactivating the field",
                    "error"
                );
            } finally {
                setLoading(false);
            }
        },
        [setLoading, fetchFields, selectedMasterId]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const columns = [
        { key: "amlCode", header: "Field Code", visible: true },
        { key: "amlName", header: "Field Name", visible: true },
        { key: "amlField", header: "Category", visible: true },
        {
            key: "defaultYN",
            header: "Default",
            visible: true,
            render: (row: AppModifyFieldDto) =>
                row.defaultYN === "Y" ? "Yes" : "No",
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
                if (row.modifyYN === "Y" || userInfo?.adminYN === "Y") {
                    return (
                        <CustomButton
                            onClick={() => handleEdit(row)}
                            icon={EditIcon}
                            text="Edit"
                            variant="contained"
                            size="small"
                        />
                    );
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
                    return (
                        <CustomButton
                            onClick={() => handleDelete(row)}
                            icon={DeleteIcon}
                            text="Delete"
                            variant="contained"
                            color="error"
                            size="small"
                        />
                    );
                }
                return null;
            },
        },
    ];

    return (
        <>
            <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ marginBottom: 2 }}
            >
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
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    container
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <CustomButton
                        icon={AddIcon}
                        text="Add Category"
                        onClick={() => setIsCategoryDialogOpen(true)}
                        variant="contained"
                        sx={{ float: "left" }}
                    />
                    <CustomButton
                        icon={AddIcon}
                        text="Add Field"
                        onClick={() => setIsFieldDialogOpen(true)}
                        variant="contained"
                        sx={{ float: "right" }}
                    />
                </Grid>
            </Grid>
            <CustomGrid columns={columns} data={fieldsList} />
            <GenericDialog
                open={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                title="Add New Category"
                actions={
                    <>
                        <CustomButton
                            onClick={() => setIsCategoryDialogOpen(false)}
                            icon={DeleteIcon}
                            text="Cancel"
                            variant="contained"
                            color="error"
                            sx={{ marginRight: 2 }}
                        />
                        <CustomButton
                            icon={SaveIcon}
                            text="Save"
                            onClick={handleCategoryDialogSubmit}
                            variant="contained"
                            color="success"
                        />
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
                        type="number"
                        label="Authorization Group ID"
                        name="auGrpID"
                        value={categoryFormData.auGrpID.toString()}
                        onChange={(e) =>
                            setCategoryFormData((prev) => ({
                                ...prev,
                                auGrpID: parseInt(e.target.value),
                            }))
                        }
                        ControlID="auGrpID"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />
                </Grid>
            </GenericDialog>
            <GenericDialog
                open={isFieldDialogOpen}
                onClose={() => setIsFieldDialogOpen(false)}
                title={formData.amlID ? "Edit Field" : "Add New Field"}
                actions={
                    <>
                        <CustomButton
                            onClick={() => setIsFieldDialogOpen(false)}
                            icon={DeleteIcon}
                            text="Cancel"
                            variant="contained"
                            color="error"
                            sx={{ marginRight: 2 }}
                        />
                        <CustomButton
                            icon={SaveIcon}
                            text="Save"
                            onClick={handleFieldDialogSubmit}
                            variant="contained"
                            color="success"
                        />
                    </>
                }
            >
                <Grid container spacing={2}>
                    <FormField
                        type="text"
                        label="Field Code"
                        name="amlCode"
                        value={formData.amlCode}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, amlCode: e.target.value }))
                        }
                        ControlID="amlCode"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                        disabled={true}
                    />
                    <FormField
                        type="text"
                        label="Field Name"
                        name="amlName"
                        value={formData.amlName}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, amlName: e.target.value }))
                        }
                        ControlID="amlName"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />
                    <FormField
                        type="text"
                        label="Field"
                        name="amlField"
                        value={selectedCategoryName}
                        onChange={(e) => { }}
                        disabled={true}
                        ControlID="amlField"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />
                </Grid>
                <Grid>
                    <FormField
                        type="radio"
                        label="Default"
                        name="defaultYN"
                        value={formData.defaultYN}
                        onChange={handleChange}
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                        ]}
                        ControlID="defaultYN"
                        gridProps={{ xs: 12 }}
                        inline={true}
                    />
                    <FormField
                        type="radio"
                        label="Modifiable"
                        name="modifyYN"
                        value={formData.modifyYN}
                        onChange={handleChange}
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                        ]}
                        ControlID="modifyYN"
                        gridProps={{ xs: 12 }}
                        inline={true}
                    />
                </Grid>
            </GenericDialog>
        </>
    );
};

export default AppModifiedDetails;
