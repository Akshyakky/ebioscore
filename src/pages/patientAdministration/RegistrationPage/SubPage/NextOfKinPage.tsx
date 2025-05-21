import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NextOfKinForm from "./NextOfKinForm";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { useLoading } from "@/hooks/Common/useLoading";
import { notifySuccess, notifyError, notifyWarning } from "@/utils/Common/toastManager";
import NextOfKinList from "./NextOfKinList";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface NextOfKinPageProps {
  pChartID: number;
  pChartCode: string;
}

const NextOfKinPage: React.FC<NextOfKinPageProps> = ({ pChartID, pChartCode }) => {
  const [nokList, setNokList] = useState<PatNokDetailsDto[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const { isLoading, setLoading } = useLoading();

  const fetchNokData = useCallback(async () => {
    if (!pChartID) return;

    try {
      setLoading(true);
      const response = await PatNokService.getNokDetailsByPChartID(pChartID);

      if (response.success && response.data) {
        setNokList(response.data);
      } else if (response.errorMessage) {
        notifyWarning(response.errorMessage);
      }
    } catch (error) {
      console.error("Error fetching next of kin data:", error);
      notifyError("Failed to load next of kin information");
    } finally {
      setLoading(false);
    }
  }, [pChartID]);

  useEffect(() => {
    fetchNokData();
  }, [fetchNokData]);

  const handleAddNew = () => {
    setSelectedNok(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (item: PatNokDetailsDto) => {
    setSelectedNok(item);
    setFormDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormDialogOpen(false);
    setSelectedNok(null);
  };

  const handleSave = async (data: PatNokDetailsDto) => {
    try {
      setLoading(true);

      // Ensure pChartID is set
      const nokData = {
        ...data,
        pChartID: pChartID,
        pNokPChartCode: pChartCode,
        rActiveYN: "Y",
      };

      const response = await PatNokService.saveNokDetails(nokData);

      if (response.success) {
        notifySuccess(selectedNok ? "Next of kin updated successfully" : "Next of kin added successfully");
        await fetchNokData();
        setFormDialogOpen(false);
        setSelectedNok(null);
      } else {
        notifyError(response.errorMessage || "Failed to save next of kin information");
      }
    } catch (error) {
      console.error("Error saving next of kin:", error);
      notifyError("An error occurred while saving next of kin information");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nokId: number) => {
    try {
      setLoading(true);

      // Find the NOK record
      const nokToUpdate = nokList.find((nok) => nok.pNokID === nokId);

      if (!nokToUpdate) {
        notifyError("Record not found");
        return;
      }

      // Update the record to set it as inactive
      const updatedNok = {
        ...nokToUpdate,
        rActiveYN: "N",
      };

      const response = await PatNokService.saveNokDetails(updatedNok);

      if (response.success) {
        notifySuccess("Next of kin removed successfully");
        await fetchNokData();
      } else {
        notifyError(response.errorMessage || "Failed to remove next of kin");
      }
    } catch (error) {
      console.error("Error deleting next of kin:", error);
      notifyError("An error occurred while removing next of kin");
    } finally {
      setLoading(false);
    }
  };

  // Guard for invalid pChartID
  if (!pChartID) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body1">Patient information is required to add next of kin details.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Next of Kin Information</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew} size="small">
          Add New
        </Button>
      </Box>

      <NextOfKinList data={nokList.filter((nok) => nok.rActiveYN === "Y")} onEdit={handleEdit} onDelete={handleDelete} loading={isLoading} />

      {/* Form in modal dialog */}
      <GenericDialog
        open={formDialogOpen}
        onClose={handleCloseForm}
        title={selectedNok ? "Edit Next of Kin" : "Add Next of Kin"}
        maxWidth="lg"
        fullWidth
        showCloseButton={true}
        disableBackdropClick={true}
      >
        <NextOfKinForm onSave={handleSave} onCancel={handleCloseForm} initialData={selectedNok} pChartID={pChartID} pChartCode={pChartCode} />
      </GenericDialog>
    </Box>
  );
};

export default NextOfKinPage;
