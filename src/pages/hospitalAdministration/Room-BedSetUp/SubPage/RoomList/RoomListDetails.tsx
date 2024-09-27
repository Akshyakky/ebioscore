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
import { RoomListDto } from "../../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import GenericDialog from "../../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../../components/FormField/FormField";
import useDropdownChange from "../../../../../hooks/useDropdownChange";
import { store } from "../../../../../store/store";
import useDropdownValues from "../../../../../hooks/PatientAdminstration/useDropdownValues";
import { roomListService } from "../../../../../services/HospitalAdministrationServices/hospitalAdministrationService";

interface RoomListDetailsProps {
    roomLists: RoomListDto[];
}

const RoomListDetails: React.FC<RoomListDetailsProps> = ({ roomLists }) => {
    const { setLoading } = useLoading();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [formData, setFormData] = useState<RoomListDto>({
        rlID: 0,
        rlCode: '',
        rNotes: '',
        rName: "",
        noOfBeds: 0,
        rActiveYN: "Y",
        rgrpID: 0,//roomGroup?.rGrpID ||
        compID: store.getState().userDetails.compID || 0,
        transferYN: "Y",
        rLocation: "",
        rLocationID: 0,
        deptName: "",//roomGroup?.deptName 
        deptID: 0,//roomGroup?.deptID ||
        dulID: 0,
        unitDesc: ''
    });
    const { handleDropdownChange } = useDropdownChange<RoomListDto>(setFormData);
    const { floorValues, unitValues, roomGroupValues } = useDropdownValues();

    const handleAdd = () => {
        setFormData({
            rlID: 0,
            rName: "",
            noOfBeds: 0,
            rActiveYN: "Y",
            rgrpID: 0,//roomGroup?.rGrpID ||
            compID: store.getState().userDetails.compID || 0,
            transferYN: "Y",
            rlCode: '',
            rNotes: '',
            deptName: "",//roomGroup?.deptName || 
            deptID: 0,//roomGroup?.deptID || 
            dulID: 0,
            unitDesc: '',
            rLocation: "",
            rLocationID: 0,
        });
        setDialogTitle("Add Room");
        setIsDialogOpen(true);
    };

    const handleAddDialogSubmit = async () => {
        setLoading(true);
        try {
            debugger
            const response = await roomListService.save(formData);
            if (response.success) {
                showAlert(
                    "Success",
                    formData.rlID
                        ? "Room updated successfully"
                        : "Room added successfully",
                    "success"
                );
                setIsDialogOpen(false);
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to save room",
                    "error"
                );
            }
        } catch (error) {
            showAlert("Error", "An error occurred during submission.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDialogClose = () => {
        setIsDialogOpen(false);
    };

    const handleEdit = async (row: RoomListDto) => {
        try {
            const response = await roomListService.getById(row.rlID);
            if (response.success) {
                const room = response.data;
                if (room) {
                    setFormData({ ...room });
                    setDialogTitle("Edit Room");
                    setIsDialogOpen(true);
                } else {
                    showAlert("Error", "Room data is missing", "error");
                }
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to load room details",
                    "error"
                );
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while fetching room details.",
                "error"
            );
        }
    };

    const handleDelete = async (row: RoomListDto) => {
        setLoading(true);
        try {
            const updatedRoom = { ...row, rActiveYN: "N" };
            const result = await roomListService.save(updatedRoom);
            if (result.success) {
                showAlert(
                    "Success",
                    "Room deactivated successfully",
                    "success"
                );
            } else {
                showAlert(
                    "Error",
                    result.errorMessage || "Failed to delete room",
                    "error"
                );
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while deleting the room.",
                "error"
            );
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
        { key: "rName", header: "Room Name", visible: true },
        { key: "rGrpName", header: "RGP Name", visible: true },
        { key: "rLocation", header: "Room Location", visible: true },
        { key: "deptName", header: "Department", visible: true },
        {
            key: "actions",
            header: "Edit",
            visible: true,
            render: (row: RoomListDto) => (
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
            key: "actions",
            header: "Delete",
            visible: true,
            render: (row: RoomListDto) => (
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
    ];

    return (
        <>
            <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
                <CustomButton
                    icon={AddIcon}
                    text="Add Room"
                    onClick={handleAdd}
                    variant="contained"
                />
            </Grid>
            <CustomGrid columns={columns} data={roomLists} />
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
                        label="RoomName"
                        name="rName"
                        value={formData.rName}
                        onChange={handleChange}
                        ControlID="rName"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />

                    <FormField
                        type="select"
                        label="RGR Name"
                        name="rgrpID"
                        value={formData.rgrpID || ""}
                        onChange={handleDropdownChange(
                            ["rgrpID"],
                            [""],
                            roomGroupValues
                        )}
                        options={roomGroupValues}
                        ControlID="rgrpID"
                        gridProps={{ xs: 12 }}
                    />


                    <FormField
                        type="select"
                        label="Location"
                        name="rLocation"
                        value={formData.rLocation || ""}
                        onChange={handleDropdownChange(
                            ["rLocationID"],
                            ["rLocation"],
                            floorValues
                        )}
                        options={floorValues}
                        ControlID="rLocation"
                        gridProps={{ xs: 12 }}
                    />

                    <FormField
                        type="select"
                        label="Unit "
                        name="dulID"
                        value={formData.dulID || ""}
                        onChange={handleDropdownChange(
                            ["dulID"],
                            ["unitDesc"],
                            unitValues
                        )}
                        options={unitValues}
                        ControlID="dulID"
                        gridProps={{ xs: 12 }}
                    />
                </Grid>
            </GenericDialog>
        </>
    );
};

export default RoomListDetails;
