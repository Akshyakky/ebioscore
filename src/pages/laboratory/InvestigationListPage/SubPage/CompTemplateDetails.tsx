import React, { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Divider, CircularProgress, IconButton, Checkbox, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AdvancedGrid, { ColumnConfig } from "@/components/AdvancedGrid/AdvancedGrid";
import RichTextEditor from "@/components/RichTextEditor/CkEditor";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { LCompTemplateDto, LComponentDto } from "@/interfaces/Laboratory/LInvMastDto";
import { useAppSelector } from "@/store/hooks";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { showAlert } from "@/utils/Common/showAlert";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import CustomButton from "@/components/Button/CustomButton";
import FormField from "@/components/FormField/FormField";

interface TemplateGroup extends AppModifyFieldDto {
  templates: LCompTemplateDto[];
}

interface LCompTemplateDetailsProps {
  onUpdateTemplate: (templateData: LCompTemplateDto) => void;
  selectedComponent: LComponentDto;
  indexID: number; // <-- ADD THIS
}

const CompTemplateDetails: React.FC<LCompTemplateDetailsProps> = ({ onUpdateTemplate, selectedComponent, indexID }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);
  const serverDate = useServerDate();
  const [searchTerm, setSearchTerm] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [selectedTemplateGroupId, setSelectedTemplateGroupId] = useState<number | null>(null);
  const theme = useTheme();
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("TEMPLATEGROUP");
  const [formDataDialog, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "TEMPLATEGROUP",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    transferYN: "Y",
  });
  useEffect(() => {
    if (selectedComponent?.compoID) {
      fetchTemplateGroups();
    }
  }, [selectedComponent?.compoID]);

  const fetchTemplateGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appModifiedListService.getAll();
      const allFields = response.data || response;
      const templateGroupFields = allFields
        .filter((field: AppModifyFieldDto) => field.amlField === "TEMPLATEGROUP" && field.rActiveYN === "Y")
        .map(
          (group: AppModifyFieldDto): TemplateGroup => ({
            ...group,
            templates: [],
          })
        );
      if (selectedComponent?.compoID) {
        const invResponse = await investigationlistService.getById(selectedComponent.invID);
        if (invResponse.success && invResponse.data) {
          const compTemplates: LCompTemplateDto[] =
            invResponse.data.lCompTemplateDtos?.filter(
              (t: LCompTemplateDto) => (t.compOID === selectedComponent.compoID || t.compoID === selectedComponent.compoID) && t.rActiveYN === "Y"
            ) || [];

          // after fetching compTemplates…
          compTemplates.forEach(
            (t) => onUpdateTemplate({ ...t, indexID }) // ← BACK‑FILL IT
          );

          templateGroupFields.forEach((group: TemplateGroup) => {
            group.templates = compTemplates.filter((template) => template.tGroupID === group.amlID);
          });

          const firstGroupWithTemplate = templateGroupFields.find((group: LCompTemplateDto) => group.templates.length > 0);

          if (firstGroupWithTemplate) {
            setSelectedTemplateGroupId(firstGroupWithTemplate.amlID);
            setEditorValue(firstGroupWithTemplate.templates[0].cTText || "");
          }
        }
      }

      setTemplateGroups(templateGroupFields);
    } catch (err) {
      setError("Failed to load template groups");
      setTemplateGroups([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddField = () => {
    setDialogCategory("TEMPLATEGROUP");
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: "TEMPLATEGROUP",
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "Y",
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = async (saved?: boolean) => {
    setIsFieldDialogOpen(false);
    if (saved) {
      await fetchTemplateGroups();
    }
  };

  const handleEditTemplateGroup = async (group: TemplateGroup) => {
    setDialogCategory("TEMPLATEGROUP");
    setFormDataDialog({ ...group, amlField: "TEMPLATEGROUP" });
    setIsFieldDialogOpen(true);
  };

  const handleDeleteTemplateGroup = async (amlID: number) => {
    try {
      const groupToDelete = templateGroups.find((g) => g.amlID === amlID);
      if (groupToDelete) {
        const updated = { ...groupToDelete, rActiveYN: "N" };
        await appModifiedListService.save(updated);
        await fetchTemplateGroups();
      }
    } catch (error) {
      showAlert("error", "Failed to delete template group", "error");
    }
  };

  const handleAddTemplate = async () => {
    if (!selectedTemplateGroupId || !editorValue.trim()) {
      showAlert("warning", "Please select a template group (checkbox) and enter template content", "warning");
      return;
    }

    const group = templateGroups.find((g) => g.amlID === selectedTemplateGroupId);
    if (!group) {
      showAlert("error", "Group not found", "error");
      return;
    }

    const newTemplate: LCompTemplateDto = {
      cTID: 0,
      tGroupID: group.amlID,
      tGroupName: group.amlName,
      cTText: editorValue,
      isBlankYN: "N",
      indexID,
      compOID: selectedComponent.compoID,
      invID: selectedComponent.invID,
      compCode: selectedComponent.compCode,
      rActiveYN: "Y",
      compID: compID || 0,
      compName: compName || "",
      transferYN: "N",
      rNotes: "",
      rCreatedOn: serverDate || new Date(),
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
      rModifiedId: userID || 0,
      rCreatedId: userID || 0,
    };
    onUpdateTemplate(newTemplate);
    showAlert("success", "Template added successfully", "success");
  };

  const groupsData = templateGroups.map((g) => ({
    ...g,
    id: g.amlID,
  }));

  const columns: ColumnConfig<TemplateGroup>[] = [
    {
      key: "checkbox",
      label: "Select",
      width: "60",
      renderCell: (row) => <Checkbox checked={row.amlID === selectedTemplateGroupId} onChange={() => setSelectedTemplateGroupId(row.amlID)} />,
    },
    {
      key: "amlName",
      label: "Template Name",
      renderCell: (row) => row.amlName,
      width: "200",
    },
    {
      key: "actions",
      label: "Actions",
      width: "80",
      renderCell: (row) => (
        <>
          <IconButton color="primary" size="small" onClick={() => handleEditTemplateGroup(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDeleteTemplateGroup(row.amlID)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];
  const filteredData = groupsData.filter((group) => group.amlName?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        gap: 3,
        backgroundColor: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(24, 26, 32, 0.95)",
        position: "relative",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      <Card
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: 3,
          minHeight: "100px",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
            Manage Templates
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
            <FormField
              type="text"
              label="Search"
              name="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ControlID="search"
              rows={4}
              maxLength={1000}
              gridProps={{ xs: 12 }}
            />

            <CustomButton color="primary">
              <SearchIcon sx={{ fontSize: "1.3rem" }} />
            </CustomButton>
          </Box>

          <CustomButton variant="contained" color="primary" icon={AddCircleOutlineIcon} onClick={handleAddField}>
            ADD TEMPLATE GROUP
          </CustomButton>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" fontWeight="bold" color="primary">
            Template Groups List
          </Typography>
          {isLoading ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : (
            <Box sx={{ height: "400px" }}>
              <AdvancedGrid<TemplateGroup> data={filteredData} columns={columns} maxHeight="400px" />
            </Box>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          height: "665px",
        }}
      >
        <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
            Template Editor
          </Typography>
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              overflow: "hidden",
              mb: 2,
            }}
          >
            <RichTextEditor value={editorValue} onChange={setEditorValue} />
          </Box>
          <CustomButton variant="contained" color="primary" onClick={handleAddTemplate} icon={SaveIcon}>
            Save Template
          </CustomButton>
        </CardContent>
      </Card>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        isFieldCodeDisabled={true}
        initialFormData={formDataDialog}
      />
    </Box>
  );
};

export default CompTemplateDetails;
