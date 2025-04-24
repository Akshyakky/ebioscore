import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Folder as FolderIcon, FolderOpen as FolderOpenIcon } from "@mui/icons-material";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { roomGroupService, roomListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "@/utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/FormField/FormField";
import { RoomGroupDto, RoomListDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";

interface RoomGroupDetailsProps {
  roomGroups: RoomGroupDto[];
  fetchRoomGroups: () => Promise<void>;
}

const RoomGroupDetails: React.FC<RoomGroupDetailsProps> = ({ roomGroups, fetchRoomGroups }) => {
  const { setLoading } = useLoading();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [roomGroupHierarchy, setRoomGroupHierarchy] = useState<RoomGroupDto[]>([]);
  const [formData, setFormData] = useState<RoomGroupDto>({
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
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
  });

  const { handleDropdownChange } = useDropdownChange<RoomGroupDto>(setFormData);
  const dropdownValues = useDropdownValues(["department", "gender"]);

  useEffect(() => {
    const buildRoomGroupHierarchy = (groups: RoomGroupDto[]): RoomGroupDto[] => {
      const map = new Map<number, RoomGroupDto[]>();
      const roots: RoomGroupDto[] = [];

      groups.forEach((group) => {
        if (group.key === 0) {
          roots.push(group);
        } else {
          if (!map.has(group.key)) {
            map.set(group.key, []);
          }
          map.get(group.key)!.push(group);
        }
      });

      roots.forEach((group) => {
        group.children = map.get(group.rGrpID) || [];
      });

      return roots;
    };

    setRoomGroupHierarchy(buildRoomGroupHierarchy(roomGroups));
  }, [roomGroups]);

  const handleAdd = useCallback(
    (isSubGroup: boolean = false, parentGroup?: RoomGroupDto) => {
      setFormData({
        ...formData,
        rGrpID: 0,
        rGrpName: "",
        key: isSubGroup ? parentGroup?.rGrpID || 0 : 0,
      });
      setDialogTitle(isSubGroup ? "Add Sub Group" : "Add Room Group");
      setIsDialogOpen(true);
    },
    [formData]
  );

  const handleAddDialogSubmit = useCallback(async () => {
    try {
      const response = await roomGroupService.save(formData);
      if (response) {
        showAlert("Success", formData.rGrpID ? "Room group updated successfully" : "Room group added successfully", "success");
        setIsDialogOpen(false);
        await fetchRoomGroups();
      } else {
        showAlert("Error", "Failed to save room group", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred during submission.", "error");
    }
  }, [formData, fetchRoomGroups]);

  const handleEdit = useCallback(async (row: RoomGroupDto) => {
    try {
      const response = await roomGroupService.getById(row.rGrpID);
      if (response.success && response.data) {
        setFormData({ ...response.data });
        setDialogTitle("Edit Room Group");
        setIsDialogOpen(true);
      } else {
        showAlert("Error", response.errorMessage || "Failed to load room group details", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while fetching room group details.", "error");
    }
  }, []);

  const handleDelete = useCallback(
    async (row: RoomGroupDto) => {
      setLoading(true);
      try {
        const response = await roomListService.getAll();
        if (response.success && response.data) {
          const associatedRooms = response.data.filter((room: RoomListDto) => room.rgrpID === row.rGrpID && room.rActiveYN === "Y");

          if (associatedRooms.length > 0) {
            showAlert("Error", `Room Group ${row.rGrpName} cannot be deleted as it has active associated rooms. Please deactivate or delete the rooms first.`, "error");
          } else {
            const updatedRoomGroup = { ...row, rActiveYN: "N" };
            const result = await roomGroupService.save(updatedRoomGroup);
            if (result) {
              showAlert("Success", `Room Group ${row.rGrpName} deactivated successfully`, "success");
              await fetchRoomGroups();
            } else {
              showAlert("Error", "Failed to deactivate Room Group", "error");
            }
          }
        } else {
          showAlert("Error", "Failed to load room list", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deleting the Room Group.", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchRoomGroups]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleExpand = useCallback((groupId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  const renderData = useCallback(
    (groups: RoomGroupDto[]): RoomGroupDto[] => {
      const result: RoomGroupDto[] = [];
      groups.forEach((group) => {
        result.push(group);
        if (expandedGroups.has(group.rGrpID) && group.children && group.children.length > 0) {
          result.push(...group.children);
        }
      });
      return result;
    },
    [expandedGroups]
  );

  const columns = [
    {
      key: "rGrpName",
      header: "Room Group Name",
      visible: true,
      render: (row: RoomGroupDto) => (
        <Box sx={{ display: "flex", alignItems: "center", paddingLeft: row.key !== 0 ? 4 : 0 }}>
          {row.children && row.children.length > 0 && (
            <IconButton size="small" onClick={() => toggleExpand(row.rGrpID)}>
              {expandedGroups.has(row.rGrpID) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {row.key === 0 ? <FolderIcon sx={{ mr: 1, color: "#FFC107" }} /> : <FolderOpenIcon sx={{ mr: 1, color: "primary.main" }} />}
          <Typography variant="body2">{row.rGrpName}</Typography>
        </Box>
      ),
    },
    {
      key: "edit",
      header: "Edit",
      visible: true,
      render: (row: RoomGroupDto) => <CustomButton onClick={() => handleEdit(row)} icon={EditIcon} text="Edit" variant="contained" size="small" />,
    },
    {
      key: "delete",
      header: "Delete",
      visible: true,
      render: (row: RoomGroupDto) => <CustomButton onClick={() => handleDelete(row)} icon={DeleteIcon} text="Delete" variant="contained" color="error" size="small" />,
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
            text="Sub Group"
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#008B8B",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#006363",
              },
            }}
          />
        ) : null,
    },
  ];

  return (
    <>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <CustomButton icon={AddIcon} text="Add Room Group" onClick={() => handleAdd()} variant="contained" />
      </Grid>
      <CustomGrid columns={columns} data={renderData(roomGroupHierarchy)} />
      <GenericDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={dialogTitle}
        actions={
          <>
            <CustomButton onClick={() => setIsDialogOpen(false)} icon={DeleteIcon} text="Cancel" variant="contained" color="error" sx={{ marginRight: 2 }} />
            <CustomButton icon={SaveIcon} text="Save" onClick={handleAddDialogSubmit} variant="contained" color="success" />
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
            onChange={handleDropdownChange(["deptID"], ["deptName"], dropdownValues.department)}
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
            onChange={handleDropdownChange(["gender"], ["genderValue"], dropdownValues.gender)}
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
              [
                { value: "Ward", label: "Ward" },
                { value: "ICU", label: "ICU" },
              ]
            )}
            options={[
              { value: "Ward", label: "Ward" },
              { value: "ICU", label: "ICU" },
            ]}
            ControlID="roomGroupType"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="radio"
            label="Teaching Ward"
            name="teachingYN"
            value={formData.teachingYN}
            onChange={handleChange}
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
            onChange={handleChange}
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
