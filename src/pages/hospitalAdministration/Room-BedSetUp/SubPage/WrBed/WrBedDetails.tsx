import { useState, useCallback, useMemo, useEffect } from "react";
import { Box, Grid, IconButton, SelectChangeEvent, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Folder as FolderIcon, FolderOpen as FolderOpenIcon } from "@mui/icons-material";
import { useAppSelector } from "@/store/hooks";
import { RoomGroupDto, RoomListDto, WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import React from "react";
import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { roomListService, wrBedService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "@/utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomGrid from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";

interface WrBedDetailsProps {
  beds: WrBedDto[];
  roomGroups: RoomGroupDto[];
  roomLists: RoomListDto[];
  fetchBeds: () => Promise<void>;
}

const WrBedDetails: React.FC<WrBedDetailsProps> = ({ beds, roomGroups, roomLists, fetchBeds }) => {
  const { setLoading } = useLoading();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [expandedBeds, setExpandedBeds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<WrBedDto>({} as WrBedDto);
  const { handleDropdownChange } = useDropdownChange<WrBedDto>(setFormData);
  const dropdownValues = useDropdownValues(["bedCategory", "service"]);
  const user = useAppSelector((state) => state.auth);
  const [filteredRoomLists, setFilteredRoomLists] = useState<RoomListDto[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        bchID: 0,
        bedID: 0,
        bedName: "",
        rlID: 0,
        rActiveYN: "Y",
        compID: user.compID || 0,
        compCode: user.compCode || "",
        compName: user.compName || "",
        transferYN: "Y",
        blockBedYN: "N",
        wbCatID: 0,
        key: 0,
        bedStatusValue: "AVLBL",
        bedStatus: "Available",
        rgrpID: 0,
      });
    }
  }, [user]); // Run this effect when `user` changes

  useEffect(() => {
    if (formData.rgrpID) {
      const filtered = roomLists.filter((room) => room.rgrpID === formData.rgrpID);
      setFilteredRoomLists(filtered);
    } else {
      setFilteredRoomLists([]);
    }
  }, [formData.rgrpID, roomLists]);

  const handleRoomGroupChange = useCallback((event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    setFormData((prev) => ({
      ...prev,
      rgrpID: parseInt(newValue, 10),
      rlID: 0,
    }));
  }, []);

  const handleAdd = useCallback(
    (isSubGroup: boolean = false, parentGroup?: WrBedDto) => {
      // Initialize formData based on user directly here instead of calling getInitialFormData()
      const newFormData: WrBedDto = {
        bchID: 0,
        bedID: 0,
        bedName: "",
        rlID: 0,
        rActiveYN: "Y",
        compID: user.compID || 0,
        compCode: user.compCode || "",
        compName: user.compName || "",
        transferYN: "Y",
        blockBedYN: "N",
        wbCatID: 0,
        key: isSubGroup ? parentGroup?.bedID || 0 : 0,
        bedStatusValue: "AVLBL",
        bedStatus: "Available",
        rgrpID: 0,
      };

      setFormData(newFormData);
      setDialogTitle(isSubGroup ? "Add Cradle" : "Add Bed");
      setIsDialogOpen(true);
    },
    [user]
  ); // Make sure `user` is included in the dependency array

  const handleAddDialogSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const preparedData: WrBedDto = {
        ...formData,
        wbCatID: formData.wbCatID ? parseInt(formData.wbCatID.toString(), 10) : undefined,
        bchID: formData.bchID ? parseInt(formData.bchID.toString(), 10) : undefined,
        bedStatus: formData.bedStatus || "",
        compID: user.compID || 0,
        compCode: user.compCode || "",
        compName: user.compName || "",
        key: parseInt(formData.key.toString(), 10),
      };

      const response = await wrBedService.save(preparedData);
      if (response.success) {
        showAlert("Success", formData.bedID ? "Bed updated successfully" : "Bed added successfully", "success");
        setIsDialogOpen(false);
        await fetchBeds();
      } else {
        showAlert("Error", response.errorMessage || "Failed to save bed", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred during submission.", "error");
    } finally {
      setLoading(false);
    }
  }, [formData, fetchBeds, setLoading]);

  const toggleExpand = useCallback((bedID: number) => {
    setExpandedBeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bedID)) {
        newSet.delete(bedID);
      } else {
        newSet.add(bedID);
      }
      return newSet;
    });
  }, []);

  const handleEdit = useCallback(async (row: WrBedDto) => {
    try {
      const response = await wrBedService.getById(row.bedID);
      if (response.success && response.data) {
        const bedData = response.data;
        const roomResponse = await roomListService.getById(bedData.rlID);
        if (roomResponse.success && roomResponse.data) {
          setFormData({
            ...bedData,
            rgrpID: roomResponse.data.rgrpID,
          });
          setDialogTitle("Edit Bed");
          setIsDialogOpen(true);
        }
      } else {
        showAlert("Error", response.errorMessage || "Failed to load bed details", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while fetching bed details.", "error");
    }
  }, []);

  const handleDelete = useCallback(
    async (row: WrBedDto) => {
      setLoading(true);
      try {
        const result = await wrBedService.save({ ...row, rActiveYN: "N" });
        if (result.success) {
          showAlert("Success", "Bed deactivated successfully", "success");
          await fetchBeds();
        } else {
          showAlert("Error", result.errorMessage || "Failed to delete bed", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deleting the bed.", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, fetchBeds]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const buildBedHierarchy = useCallback((beds: WrBedDto[]): WrBedDto[] => {
    const map = new Map<number, WrBedDto[]>();
    const roots: WrBedDto[] = [];

    beds.forEach((bed) => {
      if (bed.key === 0) {
        roots.push(bed);
      } else {
        if (!map.has(bed.key)) {
          map.set(bed.key, []);
        }
        map.get(bed.key)!.push(bed);
      }
    });

    roots.forEach((bed) => {
      bed.children = map.get(bed.bedID) || [];
    });

    return roots;
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "bedName",
        header: "Bed Name",
        visible: true,
        render: (row: WrBedDto) => {
          const hasChildren = row.children && row.children.length > 0;
          const isExpanded = expandedBeds.has(row.bedID);

          return (
            <Box sx={{ display: "flex", alignItems: "center", paddingLeft: row.key !== 0 ? 4 : 0 }}>
              {hasChildren && (
                <IconButton size="small" onClick={() => toggleExpand(row.bedID)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              {row.key === 0 ? <FolderIcon sx={{ mr: 1, color: "#FFC107" }} /> : <FolderOpenIcon sx={{ mr: 1, color: "primary.main" }} />}
              <Typography variant="body2">{row.bedName}</Typography>
            </Box>
          );
        },
      },
      {
        key: "rGrpName",
        header: "RG Name",
        visible: true,
        render: (row: WrBedDto) => row.roomList?.roomGroup?.rGrpName || "No Group",
      },
      {
        key: "rName",
        header: "Room Name",
        visible: true,
        render: (row: WrBedDto) => row.roomList?.rName || "No Room",
      },
      { key: "bedStatus", header: "Bed Status", visible: true },
      {
        key: "edit",
        header: "Edit",
        visible: true,
        render: (row: WrBedDto) => <CustomButton onClick={() => handleEdit(row)} icon={EditIcon} text="Edit" variant="contained" size="small" />,
      },
      {
        key: "delete",
        header: "Delete",
        visible: true,
        render: (row: WrBedDto) => <CustomButton onClick={() => handleDelete(row)} icon={DeleteIcon} text="Delete" variant="contained" color="error" size="small" />,
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
    ],
    [expandedBeds, handleEdit, handleDelete, handleAdd, toggleExpand]
  );

  const renderData = useCallback(
    (beds: WrBedDto[]): WrBedDto[] => {
      const result: WrBedDto[] = [];
      beds.forEach((bed) => {
        result.push(bed);
        if (expandedBeds.has(bed.bedID) && bed.children && bed.children.length > 0) {
          result.push(...bed.children);
        }
      });
      return result;
    },
    [expandedBeds]
  );

  const bedHierarchy = useMemo(() => buildBedHierarchy(beds), [beds, buildBedHierarchy]);

  return (
    <>
      <Grid container justifyContent="flex-end" sx={{ marginBottom: 2 }}>
        <CustomButton icon={AddIcon} text="Add Bed" onClick={() => handleAdd()} variant="contained" />
      </Grid>
      <CustomGrid columns={columns} data={renderData(bedHierarchy)} />

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
            label="Room Group"
            name="rgrpID"
            value={formData.rgrpID?.toString() || ""}
            onChange={handleRoomGroupChange}
            options={roomGroups.map((group) => ({
              label: group.rGrpName,
              value: group.rGrpID.toString(),
            }))}
            ControlID="rgrpID"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="select"
            label="Room Name"
            name="rlID"
            value={formData.rlID?.toString() || ""}
            onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
            options={filteredRoomLists.map((list) => ({
              label: list.rName,
              value: list.rlID.toString(),
            }))}
            gridProps={{ xs: 12 }}
            ControlID="rlID"
          />

          <FormField
            type="select"
            label="Bed Category"
            name="wCatID"
            value={formData.wbCatID || 0}
            onChange={handleDropdownChange(["wbCatID"], ["wbCatName"], dropdownValues.bedCategory || [])}
            options={dropdownValues.bedCategory || []}
            ControlID="wCatID"
            gridProps={{ xs: 12 }}
          />
          <FormField
            type="select"
            label="Service Type"
            name="bchID"
            value={formData.bchID || ""}
            onChange={handleDropdownChange(["bchID"], ["bchName"], dropdownValues.service || [])}
            options={dropdownValues.service || []}
            ControlID="bchID"
            gridProps={{ xs: 12 }}
          />
        </Grid>
      </GenericDialog>
    </>
  );
};

export default WrBedDetails;
