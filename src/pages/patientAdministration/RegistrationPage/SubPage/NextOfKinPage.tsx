import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NextOfKinForm from "./NextOfKinForm";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { useLoading } from "@/context/LoadingContext";
import { notifySuccess, notifyError, notifyWarning } from "@/utils/Common/toastManager";
import NextOfKinList from "./NextOfKinList";

interface NextOfKinPageProps {
  pChartID: number;
  pChartCode: string;
}

const NextOfKinPage: React.FC<NextOfKinPageProps> = ({ pChartID, pChartCode }) => {
  const [nokList, setNokList] = useState<PatNokDetailsDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNok, setSelectedNok] = useState<PatNokDetailsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const { setLoading: setGlobalLoading } = useLoading();

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
    setShowForm(true);
  };

  const handleEdit = (item: PatNokDetailsDto) => {
    setSelectedNok(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedNok(null);
  };

  const handleSave = async (data: PatNokDetailsDto) => {
    try {
      setGlobalLoading(true);

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
        setShowForm(false);
        setSelectedNok(null);
      } else {
        notifyError(response.errorMessage || "Failed to save next of kin information");
      }
    } catch (error) {
      console.error("Error saving next of kin:", error);
      notifyError("An error occurred while saving next of kin information");
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDelete = async (nokId: number) => {
    try {
      setGlobalLoading(true);

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
      setGlobalLoading(false);
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
      {!showForm ? (
        <>
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
          <NextOfKinList data={nokList.filter((nok) => nok.rActiveYN === "Y")} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
        </>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">{selectedNok ? "Edit Next of Kin" : "Add Next of Kin"}</Typography>
          </Box>
          <NextOfKinForm onSave={handleSave} onCancel={handleCancel} initialData={selectedNok} pChartID={pChartID} pChartCode={pChartCode} />
        </>
      )}
    </Box>
  );
};

export default NextOfKinPage;
