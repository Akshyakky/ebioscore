import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../../context/LoadingContext";
import { showAlert } from "../../../../../utils/Common/showAlert";
import CustomGrid from "../../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../../components/Button/CustomButton";
import { RoomGroupDto, RoomListDto } from "../../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import GenericDialog from "../../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../../components/FormField/FormField";
import useDropdownChange from "../../../../../hooks/useDropdownChange";
import { store } from "../../../../../store/store";
import { RoomListService } from "../../../../../services/HospitalAdministrationServices/Room-BedSetUpService/RoomListService";
import useDropdownValues from "../../../../../hooks/PatientAdminstration/useDropdownValues";
import { ViewArray } from "@mui/icons-material";

interface RoomListDetailsProps {
    roomGroup: RoomGroupDto | null;
    onClose: () => void;
    onRoomSelect: (roomId: number) => void;
}

const RoomListDetails: React.FC<RoomListDetailsProps> = ({ roomGroup, onRoomSelect }) => {
    const [rooms, setRooms] = useState<RoomListDto[]>([]);
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
        rgrpID: roomGroup?.rGrpID || 0,
        compID: store.getState().userDetails.compID || 0,
        transferYN: "Y",
        rLocation: "",
        rLocationID: 0,
        deptName: roomGroup?.deptName || "",
        deptID: roomGroup?.deptID || 0,
        dulID: 0,
        unitDesc: ''
    });
    const { handleDropdownChange } = useDropdownChange<RoomListDto>(setFormData);
    const { floorValues, unitValues } = useDropdownValues();

    const fetchRooms = async () => {
        debugger
        setLoading(true);
        try {
            const response = await RoomListService.getAllRoomList();
            if (response.success) {
                const activeRooms = (response.data || []).filter(
                    (room) => room.rActiveYN === "Y" && room.rgrpID === (roomGroup?.rGrpID || 0)
                );
                setRooms(activeRooms);
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to fetch room lists",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error fetching room lists:", error);
            showAlert(
                "Error",
                "An error occurred while fetching room lists.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roomGroup?.rGrpID) {
            fetchRooms();
        }
    }, [roomGroup?.rGrpID]);

    const handleAdd = () => {
        setFormData({
            rlID: 0,
            rName: "",
            noOfBeds: 0,
            rActiveYN: "Y",
            rgrpID: roomGroup?.rGrpID || 0,
            compID: store.getState().userDetails.compID || 0,
            transferYN: "Y",
            rlCode: '',
            rNotes: '',
            deptName: roomGroup?.deptName || "",
            deptID: roomGroup?.deptID || 0,
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
            const response = await RoomListService.saveRoomList(formData);
            if (response.success) {
                showAlert(
                    "Success",
                    formData.rlID
                        ? "Room updated successfully"
                        : "Room added successfully",
                    "success"
                );
                fetchRooms();
                setIsDialogOpen(false);
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to save room",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error submitting room:", error);
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
            const response = await RoomListService.getRoomListById(row.rlID);
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
            console.error("Error fetching room details:", error);
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
            const result = await RoomListService.saveRoomList(updatedRoom);
            if (result.success) {
                showAlert(
                    "Success",
                    "Room deactivated successfully",
                    "success"
                );
                setRooms((prevRooms) =>
                    prevRooms.filter((room) => room.rlID !== row.rlID)
                );
            } else {
                showAlert(
                    "Error",
                    result.errorMessage || "Failed to delete room",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error deleting room:", error);
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
        {
            key: "actions",
            header: "View/Add",
            visible: true,
            render: (row: RoomListDto) => (
                <CustomButton
                    onClick={() => onRoomSelect(row.rlID)}
                    text="View"
                    variant="contained"
                    size="small"
                    color="success"
                    icon={ViewArray}
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
            <CustomGrid columns={columns} data={rooms} />
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
