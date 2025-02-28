import React, { useState, useEffect } from "react";

import {
  Paper,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import EditIcon from "@mui/icons-material/Edit";

import SaveIcon from "@mui/icons-material/Save";

import DeleteIcon from "@mui/icons-material/Delete";

import { LComponentDto, LCompTemplateDto } from "@/interfaces/Laboratory/LInvMastDto";

import { useAppSelector } from "@/store/hooks";

import { useServerDate } from "@/hooks/Common/useServerDate";

import RichTextEditor from "@/components/RichTextEditor/CkEditor";

import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";

import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedlistDto";

import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

import { appModifiedListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

import { showAlert } from "@/utils/Common/showAlert";

import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

interface LCompTemplateDetailsProps {
  onUpdateTemplate: (templateData: LCompTemplateDto) => void;

  selectedComponent: LComponentDto;
}

interface Template extends LCompTemplateDto {
  selected: boolean;
}

interface TemplateGroup extends AppModifyFieldDto {
  templates: LCompTemplateDto[];
}

const CompTemplateDetails: React.FC<LCompTemplateDetailsProps> = ({ onUpdateTemplate, selectedComponent }) => {
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);

  const serverDate = useServerDate();

  const [templates, setTemplates] = useState<Template[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [editorValue, setEditorValue] = useState("");

  const [openModal, setOpenModal] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  const [dialogCategory, setDialogCategory] = useState<string>("");

  const [formDataDialog, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,

    amlName: "",

    amlCode: "",

    amlField: "",

    defaultYN: "N",

    modifyYN: "N",

    rNotes: "",

    rActiveYN: "Y",

    compID: 0,

    compCode: "",

    compName: "",

    transferYN: "Y",
  });

  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isEditLoading, setIsEditLoading] = useState(false);

  const [selectedTemplateGroupId, setSelectedTemplateGroupId] = useState<number | null>(null);

  const handleEditorChange = (htmlContent: string) => {
    setEditorValue(htmlContent);
  };

  const handleSaveTemplateContent = () => {
    if (selectedTemplate) {
      const updatedTemplate: LCompTemplateDto = {
        ...selectedTemplate,

        cTText: editorValue,

        rModifiedOn: serverDate || new Date(),

        rModifiedBy: userName || "",

        rModifiedId: userID || 0,
      };

      const templateWithSelected: Template = { ...updatedTemplate, selected: true };

      setTemplates((prev) => prev.map((t) => (t.tGroupID === selectedTemplate.tGroupID ? templateWithSelected : t)));

      onUpdateTemplate(updatedTemplate);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);

    setNewTemplateName("");

    setEditingIndex(null);
  };

  const handleSaveTemplate = () => {
    debugger;

    if (newTemplateName.trim() === "") return;

    const templateData: LCompTemplateDto = {
      cTID: 0,

      tGroupID: 0,

      tGroupName: newTemplateName,

      cTText: editorValue,

      isBlankYN: "N",

      compOID: 0,

      rActiveYN: "Y",

      compID: compID || 0,

      compCode: compCode || "",

      compName: compName || "",

      transferYN: "N",

      rNotes: "",

      rCreatedOn: serverDate || new Date(),

      rModifiedOn: serverDate || new Date(),

      rModifiedBy: userName || "",

      rModifiedId: userID || 0,

      rCreatedId: userID || 0,
    };

    const newTemplate: Template = {
      ...templateData,

      selected: true,
    };

    if (editingIndex !== null) {
      const existingTemplate = templates[editingIndex];

      const updatedTemplate = {
        ...existingTemplate,

        ctName: newTemplateName,

        rModifiedID: userID || 0,

        rModifiedBy: userName || "",

        rModifiedOn: serverDate || new Date(),
      };

      setTemplates((prev) => prev.map((t, i) => (i === editingIndex ? updatedTemplate : t)));

      onUpdateTemplate({
        cTID: updatedTemplate.cTID,

        tGroupID: updatedTemplate.tGroupID,

        tGroupName: updatedTemplate.tGroupName,

        cTText: updatedTemplate.cTText,

        isBlankYN: updatedTemplate.isBlankYN,

        compOID: updatedTemplate.compOID,

        rActiveYN: updatedTemplate.rActiveYN,

        compID: compID || 0,

        compCode: compCode || "",

        compName: compName || "",

        transferYN: updatedTemplate.transferYN,

        rNotes: updatedTemplate.rNotes,

        rCreatedOn: updatedTemplate.rCreatedOn,

        rModifiedOn: updatedTemplate.rModifiedOn,

        rModifiedBy: updatedTemplate.rModifiedBy,

        rModifiedId: updatedTemplate.rModifiedID,

        rCreatedId: updatedTemplate.rCreatedId,
      });
    } else {
      setTemplates((prev) => [...prev, newTemplate]);

      onUpdateTemplate({
        cTID: newTemplate.cTID,

        tGroupID: newTemplate.tGroupID,

        tGroupName: newTemplate.tGroupName,

        cTText: newTemplate.cTText,

        isBlankYN: newTemplate.isBlankYN,

        compOID: newTemplate.compOID,

        rActiveYN: newTemplate.rActiveYN,

        rModifiedID: newTemplate.rModifiedID,

        rModifiedBy: newTemplate.rModifiedBy,

        rCreatedID: newTemplate.rCreatedID,

        rCreatedBy: newTemplate.rCreatedBy,

        rCreatedOn: newTemplate.rCreatedOn,

        rModifiedOn: newTemplate.rModifiedOn,

        compID: compID || 0,

        compCode: compCode || "",

        compName: compName || "",

        transferYN: newTemplate.transferYN,

        rNotes: newTemplate.rNotes,
      });
    }

    handleCloseModal();
  };

  const handleEditTemplate = (index: number) => {
    setNewTemplateName(templates[index].ctName);

    setEditingIndex(index);
  };

  const handleDeleteTemplate = (index: number) => {
    setTemplates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddField = (category: string) => {
    debugger;

    setDialogCategory(category);

    setFormDataDialog({
      amlID: 0,

      amlName: "",

      amlCode: "",

      amlField: category,

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

  const handleTemplateGroupSelect = (templateGroup: TemplateGroup) => {
    setSelectedTemplateGroupId(templateGroup.amlID);

    setEditorValue("");
  };

  const handleAddTemplate = async () => {
    if (!selectedTemplateGroupId || !editorValue.trim()) {
      showAlert("error", "Please select a template group and enter content", "error");
      return;
    }

    try {
      const selectedGroup = templateGroups.find((g) => g.amlID === selectedTemplateGroupId);
      if (!selectedGroup) {
        showAlert("error", "Selected template group not found", "error");
        return;
      }

      const newTemplate: LCompTemplateDto = {
        cTID: 0,
        tGroupID: selectedGroup.amlID,
        tGroupName: selectedGroup.amlName,
        cTText: editorValue,
        isBlankYN: "N",
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

      setEditorValue("");
      setSelectedTemplateGroupId(null);

      showAlert("success", "Template added successfully", "success");
    } catch (error) {
      console.error("Error saving template:", error);
      showAlert("error", "Failed to save template", "error");
    }
  };

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
        try {
          const invResponse = await investigationlistService.getById(selectedComponent.invID);

          if (invResponse.success && invResponse.data) {
            const componentTemplates = invResponse.data.lCompTemplateDtos?.filter(
              (template: LCompTemplateDto) => template.compOID === selectedComponent.compoID && template.compCode === selectedComponent.compCode
            );

            if (componentTemplates?.length > 0) {
              templateGroupFields.forEach((group: TemplateGroup) => {
                group.templates = componentTemplates.filter((template: LCompTemplateDto) => template.tGroupID === group.amlID && template.rActiveYN === "Y");
              });

              const activeTemplate = componentTemplates.find(
                (template: LCompTemplateDto) => template.compOID === selectedComponent.compoID && template.rActiveYN === "Y" && template.compCode === selectedComponent.compCode
              );

              if (activeTemplate) {
                setSelectedTemplateGroupId(activeTemplate.tGroupID);

                setEditorValue(activeTemplate.cTText || "");
              }
            }
          }
        } catch (templateError) {
          console.error("Error fetching templates:", templateError);
        }
      }

      setTemplateGroups(templateGroupFields);
    } catch (error) {
      console.error("Error fetching template groups:", error);

      setError("Failed to load template groups");

      setTemplateGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    debugger;

    if (selectedComponent) {
      fetchTemplateGroups();
    }
  }, [selectedComponent]);

  useEffect(() => {
    console.log("Template Groups State:", templateGroups);
  }, [templateGroups]);

  const handleEditTemplateGroup = async (group: TemplateGroup) => {
    setIsEditLoading(true);

    try {
      debugger;

      const response = await appModifiedListService.getById(group.amlID);

      const templateGroup = response.data || response;

      if (templateGroup) {
        setFormDataDialog({
          ...templateGroup,

          amlField: "TEMPLATEGROUP",

          compID: compID || 0,

          compCode: compCode || "",

          compName: compName || "",
        });

        const template = templateGroup.templates?.find((t: LCompTemplateDto) => t.compOID === selectedComponent.compoID);

        if (template) {
          setEditorValue(template.cTText || "");

          setSelectedTemplateGroupId(templateGroup.amlID);
        }

        setDialogCategory("TEMPLATEGROUP");

        setIsFieldDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching template group details:", error);

      setError("Failed to load template group details");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleDeleteTemplateGroup = async (amlID: number) => {
    try {
      const groupToDelete = templateGroups.find((group) => group.amlID === amlID);

      if (groupToDelete) {
        const updatedGroup = { ...groupToDelete, rActiveYN: "N" };

        await appModifiedListService.save(updatedGroup);

        await fetchTemplateGroups();
      }
    } catch (error) {
      console.error("Error deleting template group:", error);
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", gap: 3, backgroundColor: "#f4f6f8" }}>
      <Card
        sx={{
          flex: 1,

          borderRadius: 3,

          boxShadow: 3,

          backgroundColor: "#ffffff",

          transition: "height 0.3s ease-in-out",

          minHeight: "250px",

          maxHeight: "90vh",

          display: "flex",

          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
            Manage Templates
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search Templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ bgcolor: "background.paper", borderRadius: 2 }}
            />

            <IconButton
              color="primary"
              sx={{
                background: "linear-gradient(135deg, #007FFF 30%, #0059B2 90%)",

                color: "white",

                borderRadius: "50%",

                width: "36px",

                height: "36px",

                p: 0.8,

                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              <SearchIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => handleAddField("TEMPLATEGROUP")}
            sx={{
              mb: 2,

              borderRadius: 2,

              fontWeight: "bold",

              background: "linear-gradient(135deg, #007FFF 30%, #0059B2 90%)",

              boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",

              "&:hover": {
                background: "linear-gradient(135deg, #0059B2 30%, #004396 90%)",
              },
            }}
          >
            ADD TEMPLATE GROUP
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary"
            sx={{
              mb: 2,

              display: "flex",

              alignItems: "center",

              "&::before": {
                content: '""',

                width: 4,

                height: 24,

                backgroundColor: "primary.main",

                marginRight: 2,

                borderRadius: 2,
              },
            }}
          >
            Template Groups List
          </Typography>

          <TableContainer
            sx={{
              bgcolor: "#ffffff",

              borderRadius: 2,

              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",

              overflow: "auto",

              height: "300px",

              border: "1px solid #e0e0e0",

              "& .MuiTable-root": {
                borderCollapse: "separate",

                borderSpacing: "0 4px",
              },

              "& .MuiTableHead-root": {
                position: "sticky",

                top: 0,

                zIndex: 1,

                backgroundColor: "#ffffff",
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "primary.main",

                      width: "60px",

                      borderBottom: "none",

                      color: "primary.main",

                      fontWeight: 600,

                      fontSize: "0.875rem",
                    }}
                  >
                    Select
                  </TableCell>

                  <TableCell
                    sx={{
                      bgcolor: "primary.main",

                      borderBottom: "none",

                      color: "primary.main",

                      fontWeight: 600,

                      fontSize: "0.875rem",
                    }}
                  >
                    Template Name
                  </TableCell>

                  <TableCell
                    sx={{
                      bgcolor: "primary.main",

                      borderBottom: "none",

                      color: "primary.main",

                      fontWeight: 600,

                      fontSize: "0.875rem",

                      width: "120px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: "error.main", py: 3 }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : templateGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No template groups available
                    </TableCell>
                  </TableRow>
                ) : (
                  templateGroups

                    .filter((group) => group.amlName.toLowerCase().includes(searchTerm.toLowerCase()))

                    .map((group) => (
                      <TableRow
                        key={group.amlID}
                        sx={{
                          transition: "all 0.2s ease",

                          "&:hover": {
                            bgcolor: "rgba(0, 127, 255, 0.04)",

                            transform: "translateY(-1px)",

                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          },

                          bgcolor: selectedTemplateGroupId === group.amlID ? "rgba(0, 127, 255, 0.08)" : "#ffffff",

                          "& td": {
                            borderBottom: "1px solid #f0f0f0",

                            borderTop: "1px solid #f0f0f0",

                            "&:first-of-type": {
                              borderLeft: "1px solid #f0f0f0",

                              borderTopLeftRadius: 8,

                              borderBottomLeftRadius: 8,
                            },

                            "&:last-of-type": {
                              borderRight: "1px solid #f0f0f0",

                              borderTopRightRadius: 8,

                              borderBottomRightRadius: 8,
                            },
                          },
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox
                            checked={selectedTemplateGroupId === group.amlID}
                            onChange={() => handleTemplateGroupSelect(group)}
                            sx={{
                              color: "primary.light",

                              "&.Mui-checked": {
                                color: "primary.main",
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ color: "text.primary", fontWeight: 500 }}>{group.amlName}</TableCell>

                        <TableCell>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditTemplateGroup(group)}
                            disabled={isEditLoading}
                            sx={{
                              mr: 1,

                              "&:hover": {
                                bgcolor: "primary.lighter",
                              },
                            }}
                          >
                            {isEditLoading ? <CircularProgress size={20} /> : <EditIcon fontSize="small" />}
                          </IconButton>

                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteTemplateGroup(group.amlID)}
                            sx={{
                              "&:hover": {
                                bgcolor: "error.lighter",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3, backgroundColor: "#ffffff" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Template Editor
            </Typography>

            {selectedTemplate && (
              <Button variant="contained" color="primary" onClick={handleSaveTemplateContent} startIcon={<SaveIcon />}>
                Save Template
              </Button>
            )}
          </Box>

          <RichTextEditor value={editorValue} onChange={handleEditorChange} />

          {/* <Button
            variant="contained"
            color="primary"
            onClick={handleAddTemplate}
            startIcon={<AddCircleOutlineIcon />}
            disabled={!selectedTemplateGroupId || !editorValue.trim()}
            sx={{
              alignSelf: "flex-end",

              background: "linear-gradient(45deg, #4CAF50 30%, #45a849 90%)",

              color: "white",

              "&:hover": {
                background: "linear-gradient(45deg, #45a849 30%, #4CAF50 90%)",
              },
            }}
          >
            Add Template
          </Button> */}
        </CardContent>
      </Card>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold", color: "primary" }}>Manage Templates</DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Template Name"
            variant="outlined"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            sx={{ my: 2, borderRadius: 2 }}
          />

          <Button onClick={handleSaveTemplate} variant="contained" color="primary" fullWidth sx={{ mb: 2, borderRadius: 3, fontWeight: "bold" }}>
            {editingIndex !== null ? "Save Changes" : "Add Template"}
          </Button>

          <Divider sx={{ my: 2 }} />

          <TableContainer>
            <Table>
              <TableBody>
                {templates.map((template, index) => (
                  <TableRow key={template.cTID}>
                    <TableCell>{template.ctName}</TableCell>

                    <TableCell>
                      <IconButton onClick={() => handleEditTemplate(index)} color="primary">
                        <EditIcon />
                      </IconButton>

                      <IconButton onClick={() => handleDeleteTemplate(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary" sx={{ borderRadius: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryName={dialogCategory}
        isFieldCodeDisabled={true}
        initialFormData={formDataDialog}
      />
    </Box>
  );
};

export default CompTemplateDetails;
