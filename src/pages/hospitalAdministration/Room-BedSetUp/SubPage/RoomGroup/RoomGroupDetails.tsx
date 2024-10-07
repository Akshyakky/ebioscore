import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { useLoading } from "../../../../../context/LoadingContext";
import { showAlert } from "../../../../../utils/Common/showAlert";
import CustomGrid from "../../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../../components/Button/CustomButton";
import {
    RoomGroupDto,
    RoomListDto,
} from "../../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import GenericDialog from "../../../../../components/GenericDialog/GenericDialog";
import useDropdownValues from "../../../../../hooks/PatientAdminstration/useDropdownValues";
import FormField from "../../../../../components/FormField/FormField";
import useDropdownChange from "../../../../../hooks/useDropdownChange";
import { store } from "../../../../../store/store";
import { DropdownOption } from "../../../../../interfaces/Common/DropdownOption";
import {
    roomGroupService,
    roomListService,
} from "../../../../../services/HospitalAdministrationServices/hospitalAdministrationService";

interface RoomGroupDetailsProps {
    roomGroups: RoomGroupDto[];
}

const RoomGroupDetails: React.FC<RoomGroupDetailsProps> = ({ roomGroups }) => {
    const { setLoading } = useLoading();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [isSubGroup, setIsSubGroup] = useState(false);
    const compID = store.getState().userDetails.compID;
    const [updatedRoomGroups, setUpdatedRoomGroups] = useState<RoomGroupDto[]>([]);
    const [formData, setFormData] = useState<RoomGroupDto>(getInitialFormData());
    const { handleDropdownChange } = useDropdownChange<RoomGroupDto>(setFormData);
    const dropdownValues = useDropdownValues(['department', 'gender']);

    useEffect(() => {
        setUpdatedRoomGroups(roomGroups);
    }, [roomGroups]);

    function getInitialFormData(): RoomGroupDto {
        return {
            rGrpID: 0,
            rGrpCode: "",
            rGrpName: "",
            deptName: "",
            key: 0,
            groupYN: "N",
            rActiveYN: "Y",
            showinboYN: "Y",
            teachingYN: "Y",
            deptID: 0,
            transferYN: "Y",
            rGrpTypeValue: "",
            compID: compID || 0,
        };
    }

    const roomGroupOptions: DropdownOption[] = [
        { value: "Ward", label: "Ward" },
        { value: "ICU", label: "ICU" },
    ];

    const handleAdd = useCallback((isSubGroup: boolean = false, parentGroup?: RoomGroupDto) => {
        setFormData(getInitialFormData());
        setDialogTitle(isSubGroup ? "Add Sub Group" : "Add Room Group");
        setIsSubGroup(isSubGroup);
        setIsDialogOpen(true);
    }, []);

    const handleAddDialogSubmit = useCallback(async () => {
        setLoading(true);
        try {
            const response = await roomGroupService.save(formData);
            if (response && response.success) {
                showAlert(
                    "Success",
                    formData.rGrpID
                        ? "Room group updated successfully"
                        : "Room group added successfully",
                    "success"
                );
                setIsDialogOpen(false);

                const savedRoomGroup = await roomGroupService.getById(response.data.rGrpID);

                if (savedRoomGroup.success) {
                    const updatedRoomGroup = savedRoomGroup.data;
                    setUpdatedRoomGroups((prevRoomGroups) =>
                        formData.rGrpID
                            ? prevRoomGroups.map((group) =>
                                group.rGrpID === updatedRoomGroup.rGrpID
                                    ? updatedRoomGroup
                                    : group
                            )
                            : [...prevRoomGroups, updatedRoomGroup]
                    );
                }
            } else {
                showAlert("Error", "Failed to save room group", "error");
            }
        } catch (error) {
            showAlert("Error", "An error occurred during submission.", "error");
        } finally {
            setLoading(false);
        }
    }, [formData]);

    const handleEdit = useCallback(async (row: RoomGroupDto) => {
        try {
            const response = await roomGroupService.getById(row.rGrpID);

            if (response.success) {
                const roomGroup = response.data;
                if (roomGroup) {
                    setFormData({ ...roomGroup });
                    setDialogTitle("Edit Room Group");
                    setIsDialogOpen(true);
                } else {
                    showAlert("Error", "Room group data is missing", "error");
                }
            } else {
                showAlert(
                    "Error",
                    response.errorMessage || "Failed to load room group details",
                    "error"
                );
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while fetching room group details.",
                "error"
            );
        }
    }, []);

    const handleDelete = useCallback(async (row: RoomGroupDto) => {
        setLoading(true);
        try {
            const response = await roomListService.getAll();

            if (response.success && response.data) {
                const associatedRooms = response.data.filter(
                    (room: RoomListDto) =>
                        room.rgrpID === row.rGrpID && room.rActiveYN === "Y"
                );

                if (associatedRooms.length > 0) {
                    showAlert(
                        "Error",
                        `Room Group ${row.rGrpName} cannot be deleted as it has active associated rooms. Please deactivate or delete the rooms first.`,
                        "error"
                    );
                } else {
                    const updatedRoomGroup = { ...row, rActiveYN: "N" };
                    const result = await roomGroupService.save(updatedRoomGroup);

                    if (result) {
                        showAlert(
                            "Success",
                            `Room Group ${row.rGrpName} deactivated successfully`,
                            "success"
                        );
                        setUpdatedRoomGroups((prevGroups) =>
                            prevGroups.filter((group) => group.rGrpID !== row.rGrpID)
                        );
                    } else {
                        showAlert("Error", "Failed to deactivate Room Group", "error");
                    }
                }
            } else {
                showAlert("Error", "Failed to load room list", "error");
            }
        } catch (error) {
            showAlert(
                "Error",
                "An error occurred while deleting the Room Group.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const columns = [
        { key: "rGrpName", header: "Name", visible: true },
        {
            key: "edit",
            header: "Edit",
            visible: true,
            render: (row: RoomGroupDto) => (
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
            render: (row: RoomGroupDto) => (
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
            key: "addSubGrp",
            header: "Add Sub Group",
            visible: true,
            render: (row: RoomGroupDto) =>
                row.key === 0 ? (
                    <CustomButton
                        onClick={() => handleAdd(true, row)}
                        icon={SubdirectoryArrowRightIcon}
                        text="Sub GRP"
                        variant="contained"
                        size="small"
                        color="secondary"
                    />
                ) : null,
        },
    ];

    return (
        <>
            <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
                <CustomButton
                    icon={AddIcon}
                    text="Add Room Group"
                    onClick={() => handleAdd()}
                    variant="contained"
                />
            </Grid>
            <CustomGrid columns={columns} data={updatedRoomGroups} />
            <GenericDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title={dialogTitle}
                actions={
                    <>
                        <CustomButton
                            onClick={() => setIsDialogOpen(false)}
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
                        label="Name"
                        name="rGrpName"
                        value={formData.rGrpName}
                        onChange={handleChange}
                        ControlID="rGrpName"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                        fullWidth
                    />
                    <FormField
                        type="select"
                        label="Department"
                        name="deptID"
                        value={formData.deptID.toString()}
                        onChange={handleDropdownChange(
                            ["deptID"],
                            ["deptName"],
                            dropdownValues.department
                        )}
                        options={dropdownValues.department}
                        ControlID="deptID"
                        isMandatory={true}
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="select"
                        label="Gender"
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleDropdownChange(
                            ["gender"],
                            ["genderValue"],
                            dropdownValues.gender
                        )}
                        options={dropdownValues.gender}
                        ControlID="gender"
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="select"
                        label="Room Group Type"
                        name="rGrpTypeValue"
                        value={formData.rGrpTypeValue || ""}
                        onChange={handleDropdownChange(
                            ["rGrpTypeValue"],
                            ["rGrpTypeValue"],
                            roomGroupOptions
                        )}
                        options={roomGroupOptions}
                        ControlID="roomGroupType"
                        gridProps={{ xs: 12 }}
                    />
                    <FormField
                        type="radio"
                        label="Teaching Ward"
                        name="teachingYN"
                        value={formData.teachingYN}
                        onChange={(e) =>
                            handleChange({
                                target: { name: "teachingYN", value: e.target.value },
                            } as React.ChangeEvent<HTMLInputElement>)
                        }
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                        ]}
                        ControlID="teachingYN"
                        gridProps={{ xs: 12 }}
                        inline={true}
                    />
                    <FormField
                        type="radio"
                        label="Display Ward in Bed Occupancy"
                        name="showinboYN"
                        value={formData.showinboYN}
                        onChange={(e) =>
                            handleChange({
                                target: { name: "showinboYN", value: e.target.value },
                            } as React.ChangeEvent<HTMLInputElement>)
                        }
                        options={[
                            { value: "Y", label: "Yes" },
                            { value: "N", label: "No" },
                        ]}
                        ControlID="showinboYN"
                        gridProps={{ xs: 12 }}
                        inline={true}
                    />
                </Grid>
            </GenericDialog>
        </>
    );
};

export default RoomGroupDetails;