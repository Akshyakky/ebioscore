import React, { useState } from "react";
import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../../context/LoadingContext";
import { showAlert } from "../../../../../utils/Common/showAlert";
import CustomGrid from "../../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../../components/Button/CustomButton";
import { WrBedDto } from "../../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import GenericDialog from "../../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../../components/FormField/FormField";
import useDropdownChange from "../../../../../hooks/useDropdownChange";
import { store } from "../../../../../store/store";
import useDropdownValues from "../../../../../hooks/PatientAdminstration/useDropdownValues";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import {
    roomGroupService,
    wrBedService,
} from "../../../../../services/HospitalAdministrationServices/hospitalAdministrationService";
interface WrBedDetailsProps {
    beds: WrBedDto[];
}

const WrBedDetails: React.FC<WrBedDetailsProps> = ({ beds }) => {
    const { setLoading } = useLoading();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [updatedBeds, setUpdatedBeds] = useState<WrBedDto[]>(beds);
    const [formData, setFormData] = useState<WrBedDto>({
        bchID: 0,
        bedID: 0,
        bedName: "",
        rlID: 0,
        rActiveYN: "Y",
        compID: store.getState().userDetails.compID || 0,
        transferYN: "Y",
        blockBedYN: "N",
        wbCatID: 0,
        key: 0,
    });
    const { handleDropdownChange } = useDropdownChange<WrBedDto>(setFormData);
    const dropdownValues = useDropdownValues(['bedCategory', 'service', 'roomGroup', 'roomList']);
    const [, setIsSubGroup] = useState(false);

    const handleAdd = (isSubGroup: boolean = false, parentGroup?: WrBedDto) => {
        setFormData({
            bchID: 0,
            bedID: 0,
            bedName: "",
            rlID: 0,
            rActiveYN: "Y",
            compID: store.getState().userDetails.compID || 0,
            transferYN: "Y",
            blockBedYN: "N",
            wbCatID: 0,
            key: isSubGroup ? parentGroup?.bedID || 0 : 0,
        });
        setDialogTitle(isSubGroup ? "Add Bed" : "Add Cradle");
        setIsSubGroup(isSubGroup);
        setIsDialogOpen(true);
    };

    const handleAddDialogSubmit = async () => {
        setLoading(true);
        try {
            const preparedData: WrBedDto = {
                wbCatID: formData.wbCatID
                    ? parseInt(formData.wbCatID.toString(), 10)
                    : undefined,
                bchID: formData.bchID
                    ? parseInt(formData.bchID.toString(), 10)
                    : undefined,
                bedID: formData.bedID,
                bedName: formData.bedName ?? "",
                bedStatus: formData.bchID ? formData.bchName : undefined,
                rlID: formData.rlID,
                rActiveYN: "Y",
                compID: store.getState().userDetails.compID || 0,
                compCode: store.getState().userDetails.compCode || "",
                compName: store.getState().userDetails.compName || "",
                transferYN: "N",
                blockBedYN: "N",
                key: parseInt(formData.key.toString(), 10),
            };

            const response = await wrBedService.save(preparedData);
            if (response.success) {
                showAlert(
                    "Success",
                    formData.bedID
                        ? "Bed updated successfully"
                        : "Bed added successfully",
                    "success"
                );
                setIsDialogOpen(false);

                const savedBed = await wrBedService.getById(response.data.bedID);
                if (savedBed.success) {
                    const updatedBed = savedBed.data;

                    setUpdatedBeds((prevBeds) =>
                        formData.bedID
                            ? prevBeds.map((bed) =>
                                bed.bedID === updatedBed.bedID ? updatedBed : bed
                            )
                            : [...prevBeds, updatedBed]
                    );
                }
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to save bed",
                    "error"
                );
            }
        } catch (error) {
            showAlert("Error", "An error occurred during submission.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentDetails = async (rgrpID: number) => {
        setLoading(true);
        try {
            const response = await roomGroupService.getById(rgrpID);
            if (response.success && response.data) {
                const roomGroup = response.data;
                setFormData((prev) => ({
                    ...prev,
                    deptID: roomGroup.deptID || 0,
                    deptName: roomGroup.deptName || "",
                }));
            } else {
                showAlert("Error", "Failed to load department details", "error");
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while fetching department details.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRoomGroupChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "rgrpID") {
            fetchDepartmentDetails(value);
        }
    };

    const handleAddDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleEdit = async (row: WrBedDto) => {
        try {
            const response = await wrBedService.getById(row.bedID);
            if (response.success) {
                const bed = response.data;
                if (bed) {
                    setFormData({
                        ...bed,
                        wbCatID: bed.wbCatID || 0,
                        bchID: bed.bchID || 0,
                        rlID: bed.rlID || 0,
                    });
                    setDialogTitle("Edit Bed");
                    setIsDialogOpen(true);
                } else {
                    showAlert("Error", "Bed data is missing", "error");
                }
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to load bed details",
                    "error"
                );
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while fetching bed details.",
                "error"
            );
        }
    };

    const handleDelete = async (row: WrBedDto) => {
        setLoading(true);
        try {
            const updateWrBed = { ...row, rActiveYN: "N" };
            const result = await wrBedService.save(updateWrBed);
            if (result.success) {
                showAlert("Success", "Bed deactivated successfully", "success");
            } else {
                showAlert(
                    "Error",
                    result.errorMessage || "Failed to delete bed",
                    "error"
                );
            }
        } catch (error) {
            showAlert("Error", "An error occurred while deleting the bed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const columns = [
        { key: "bedName", header: "Bed Name", visible: true },
        {
            key: "rGrpName",
            header: "RG Name",
            visible: true,
            render: (row: WrBedDto) => row.roomList?.roomGroup?.rGrpName || "",
        },
        {
            key: "rName",
            header: "Room Name",
            visible: true,
            render: (row: WrBedDto) => row.roomList?.rName || "",
        },
        { key: "bchName", header: "Bed Status", visible: true },
        {
            key: "edit",
            header: "Edit",
            visible: true,
            render: (row: WrBedDto) => (
                <CustomButton
                    onClick={() => handleEdit(row)}
                    icon={EditIcon}
                    text="Edit"
                    variant="contained"
                    size="small"
                />
            ),
        },
        {
            key: "delete",
            header: "Delete",
            visible: true,
            render: (row: WrBedDto) => (
                <CustomButton
                    onClick={() => handleDelete(row)}
                    icon={DeleteIcon}
                    text="Delete"
                    variant="contained"
                    color="error"
                    size="small"
                />
            ),
        },

        {
            key: "addCradle",
            header: "Add Cradle",
            visible: true,
            render: (row: WrBedDto) =>
                row.key === 0 ? (
                    <CustomButton
                        onClick={() => handleAdd(true, row)}
                        icon={SubdirectoryArrowRightIcon}
                        text="Cradle"
                        variant="contained"
                        size="small"
                        color="secondary"
                    />
                ) : (
                    <></>
                ),
        },
    ];

    return (
        <>
            <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
                <CustomButton
                    icon={AddIcon}
                    text="Add Bed"
                    onClick={() => handleAdd()}
                    variant="contained"
                />
            </Grid>
            <CustomGrid columns={columns} data={updatedBeds} />
            <GenericDialog
                open={isDialogOpen}
                onClose={handleAddDialogClose}
                title={dialogTitle}
                actions={
                    <>
                        <CustomButton
                            onClick={handleAddDialogClose}
                            icon={DeleteIcon}
                            text="Cancel"
                            variant="contained"
                            color="error"
                            sx={{ marginRight: 2 }}
                        />
                        <CustomButton
                            icon={SaveIcon}
                            text="Save"
                            onClick={handleAddDialogSubmit}
                            variant="contained"
                            color="success"
                        />
                    </>
                }
            >
                <Grid container spacing={2}>
                    <FormField
                        type="text"
                        label="Bed Name"
                        name="bedName"
                        value={formData.bedName}
                        onChange={handleChange}
                        ControlID="bedName"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />
                    <FormField
                        type="select"
                        label="RGR Name"
                        name="rgrpID"
                        value={formData.rgrpID || ""}
                        onChange={(e) => handleRoomGroupChange("rgrpID", e.target.value)}
                        options={dropdownValues.roomGroup}
                        ControlID="rgrpID"
                        gridProps={{ xs: 12 }}
                    />

                    <FormField
                        type="select"
                        label="Room Name"
                        name="rlID"
                        value={formData.rlID || 0}
                        onChange={(e) => handleRoomGroupChange("rlID", e.target.value)}
                        options={dropdownValues.roomList}
                        ControlID="rlID"
                        gridProps={{ xs: 12 }}
                    />

                    <FormField
                        type="select"
                        label="Bed Category"
                        name="wCatID"
                        value={formData.wbCatID || 0}
                        onChange={handleDropdownChange(["wbCatID"], ["wbCatName"], dropdownValues.bedCategory)}
                        options={dropdownValues.bedCategory}
                        ControlID="wCatID"
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="select"
                        label="Bed Status"
                        name="bchID"
                        value={formData.bchID || ""}
                        onChange={handleDropdownChange(["bchID"], ["bchName"], dropdownValues.service)}
                        options={dropdownValues.service}
                        ControlID="bchID"
                        gridProps={{ xs: 12 }}
                    />
                </Grid>
            </GenericDialog>
        </>
    );
};

export default WrBedDetails;
