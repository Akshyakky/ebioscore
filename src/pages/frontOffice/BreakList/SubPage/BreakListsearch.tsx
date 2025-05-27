import CustomButton from "@/components/Button/CustomButton";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { useLoading } from "@/hooks/Common/useLoading";
import { BreakConSuspendData } from "@/interfaces/FrontOffice/BreakConSuspendData";
import { BreakConDetailData, BreakListData } from "@/interfaces/FrontOffice/BreakListData";
import { AppointmentService } from "@/services/NotGenericPaternServices/AppointmentService";
import { BreakListService } from "@/services/NotGenericPaternServices/BreakListService";
import { breakConDetailsService, breakConSuspendService, resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { formatDate } from "@/utils/Common/dateUtils";
import { useAlert } from "@/providers/AlertProvider";
import React, { useCallback, useEffect, useState } from "react";
import BreakSuspendDetails from "./BreakSuspendDetails";
import { PauseCircleOutline, PlayCircleOutline } from "@mui/icons-material";

interface BreakListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (BreakList: any) => void;
}
const BreakListSearch: React.FC<BreakListSearchProps> = ({ open, onClose, onSelect }) => {
  const { setLoading } = useLoading();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedBreak, setSelectedBreak] = useState<any>(null);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [, setBreakList] = useState<any[]>([]);
  const [, setBreakSuspendDetails] = useState<any[]>([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchConsultantsAndResources();
    fetchBreakSuspendDetails();
  }, []);

  const fetchBreakSuspendDetails = async () => {
    try {
      const result = await breakConSuspendService.getAll();
      if (result.success && result.data) {
        setBreakSuspendDetails(result.data);
      }
    } catch (error) {
      showAlert("Error", "Failed to load break suspend details", "error");
    }
  };

  const fetchConsultantsAndResources = async () => {
    try {
      const consultantResult = await AppointmentService.fetchAppointmentConsultants();
      setConsultants(consultantResult.success && consultantResult.data ? consultantResult.data : []);
      const resourceResult = await resourceListService.getAll();
      setResources(resourceResult.success && resourceResult.data ? resourceResult.data : []);
    } catch (error) {
      showAlert("Error", "Failed to load consultants and resources", "error");
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await BreakListService.getAllBreakLists();
      if (result.success && result.data) {
        const breakListData = result.data;
        const breakConDetailsResult = await breakConDetailsService.getAll();
        const breakSuspendResult = await breakConSuspendService.getAll();
        if (breakConDetailsResult.success && breakConDetailsResult.data) {
          const breakConDetails = breakConDetailsResult.data;

          const breakSuspendData = breakSuspendResult.success ? breakSuspendResult.data ?? [] : [];
          const mergedData = breakListData.map((breakItem: BreakListData) => {
            const conDetails = breakConDetails.find((con: BreakConDetailData) => con.bLID === breakItem.bLID);
            const suspendDetails = breakSuspendData.find((sus: any) => sus.bLID === breakItem.bLID);
            return {
              ...breakItem,
              hPLID: conDetails ? conDetails.hPLID : null,
              consultantDetails: conDetails || null,
              bLStartDate: breakItem.bLStartDate ? new Date(breakItem.bLStartDate) : null,
              bLEndDate: breakItem.bLEndDate ? new Date(breakItem.bLEndDate) : null,
              rActiveYN: suspendDetails ? suspendDetails.rActiveYN : breakItem.rActiveYN,
              bCSID: suspendDetails?.bCSID,
            };
          });
          setBreakList(mergedData);
          return mergedData;
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching items:", error);
      showAlert("Error", "Failed to load break list data", "error");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (breakData: BreakConSuspendData) => {
    if (typeof breakData.bLID === "number" && breakData.bLID > 0) {
      try {
        const suspendResult = await breakConSuspendService.getAll();
        if (suspendResult.success && suspendResult.data) {
          const filteredSuspendDetails = suspendResult.data.filter((bsd: any) => bsd.bLID === breakData.bLID);
          if (filteredSuspendDetails.length > 0) {
            const currentSuspendDetail = filteredSuspendDetails[0];
            setSelectedBreak({
              ...breakData,
              bCSID: currentSuspendDetail.bCSID,
              bCSStartDate: new Date(currentSuspendDetail.bCSStartDate),
              bCSEndDate: new Date(currentSuspendDetail.bCSEndDate),
              rActiveYN: currentSuspendDetail.rActiveYN,
            });
          } else {
            setSelectedBreak({
              ...breakData,
              bCSStartDate: new Date(),
              bCSEndDate: new Date(),
              rActiveYN: "N",
            });
          }
          setSuspendDialogOpen(true);
        }
      } catch (error) {
        console.error("Error loading suspend details:", error);
        showAlert("Error", "Failed to load suspend details", "error");
      }
    }
  };

  const handleResume = async (breakData: any) => {
    try {
      if (typeof breakData.bLID === "number" && breakData.bLID > 0) {
        const suspendResult = await breakConSuspendService.getAll();
        if (suspendResult.success && suspendResult.data) {
          const filteredSuspendDetails = suspendResult.data.filter((bsd: any) => bsd.bLID === breakData.bLID);

          if (filteredSuspendDetails.length > 0) {
            const suspendDetail = filteredSuspendDetails[0];
            const updatePayload = {
              ...suspendDetail,
              rActiveYN: "Y",
              bCSID: suspendDetail.bCSID,
              bLID: breakData.bLID,
            };

            const result = await breakConSuspendService.updateActiveStatus(suspendDetail.bCSID, true);
            if (result) {
              showAlert("Success", "Break resumed successfully", "success");

              // Update local state immediately to reflect the change
              setBreakList((prevList) =>
                prevList.map((item) =>
                  item.bLID === breakData.bLID
                    ? { ...item, rActiveYN: "Y" } // Update the status in local state
                    : item
                )
              );

              return true;
            } else {
              showAlert("Error", "Failed to resume break", "error");
              return false;
            }
          } else {
            showAlert("Error", "No suspend record found", "error");
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error resuming the break:", error);
      showAlert("Error", "Failed to resume the break", "error");
      return false;
    }
  };

  const handleSuspendResume = async (breakData: BreakConSuspendData, isSuspend: boolean) => {
    setLoading(true);
    try {
      if (isSuspend) {
        // Call suspend method
        await handleSuspend(breakData);
      } else {
        // Call resume method
        const result = await handleResume(breakData);
        if (result) {
          // Update local state immediately based on the action (suspend or resume)
          setBreakList((prevList) =>
            prevList.map((item) =>
              item.bLID === breakData.bLID
                ? { ...item, rActiveYN: "Y" } // Set as active since break was resumed
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Error in suspend/resume operation:", error);
      showAlert("Error", "Failed to perform suspend/resume operation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendDialogClose = async (isSaved: boolean, updatedData?: BreakConSuspendData) => {
    setSuspendDialogOpen(false);
    if (isSaved && updatedData) {
      try {
        const suspendResult = await breakConSuspendService.getAll();
        if (suspendResult.success && suspendResult.data) {
          const filteredSuspendDetails = suspendResult.data.filter((bsd: any) => bsd.bLID === updatedData.bLID);

          setBreakList((prevList) =>
            prevList.map((item) =>
              item.bLID === updatedData.bLID
                ? {
                    ...item,
                    rActiveYN: "N",
                    bCSID: filteredSuspendDetails[0]?.bCSID,
                  }
                : item
            )
          );
        }
        await fetchBreakSuspendDetails();
      } catch (error) {
        console.error("Error updating suspend status:", error);
        showAlert("Error", "Failed to update suspend status", "error");
      }
    }
    setSelectedBreak(null);
  };

  const renderConResName = useCallback(
    (res: any) => {
      if (!res || typeof res.hPLID === "undefined" || res.hPLID === null) {
        return "Unknown";
      }
      if (!consultants.length && !resources.length) {
        return "Loading...";
      }
      const consultant = consultants.find((c) => c.conID === res.hPLID);
      if (consultant) {
        return `${consultant.conTitle || ""} ${consultant.conFName || ""} ${consultant.conMName || ""} ${consultant.conLName || ""}`.trimEnd();
      }
      const resource = resources.find((r) => r.rLID === res.hPLID);
      if (resource) {
        return resource.rLName || "Unknown Resource";
      }
      return "Unknown";
    },
    [consultants, resources]
  );

  const updateActiveStatus = async (blID: number, status: boolean) => {
    const result = await BreakListService.updateBreakListActiveStatus(blID, status);
    return result.success;
  };

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "bLName", header: "Break Name", visible: true },
    {
      key: "conResName",
      header: "Consultant/Resource Name",
      visible: true,
      render: renderConResName,
    },
    { key: "rNotes", header: "Remarks", visible: true },
    { key: "hPLID", header: "hPLID", visible: false },
    {
      key: "blStartDate",
      header: "Break Start Date",
      visible: true,
      render: (row: any) => {
        if (row.bLStartDate && !isNaN(new Date(row.bLStartDate).getTime())) {
          return formatDate(row.bLStartDate.toISOString());
        }
        return "Invalid Date";
      },
    },
    {
      key: "blEndDate",
      header: "Break End Date",
      visible: true,
      render: (row: any) => {
        if (row.bLEndDate && !isNaN(new Date(row.bLEndDate).getTime())) {
          return formatDate(row.bLEndDate.toISOString());
        }
        return "Invalid Date";
      },
    },
    {
      key: "SuspendStatus",
      header: "Suspend/Resume",
      visible: true,
      render: (row: any) => {
        const isSuspend = row.rActiveYN === "Y"; // rActiveYN is 'Y' for resumed, 'N' for suspended
        return (
          <CustomButton
            text={isSuspend ? "Suspend" : "Resume"}
            onClick={() => handleSuspendResume(row, isSuspend)}
            icon={isSuspend ? PauseCircleOutline : PlayCircleOutline}
            color={isSuspend ? "error" : "success"}
            size="small"
          />
        );
      },
    },
  ];

  return (
    <>
      <GenericAdvanceSearch
        open={open}
        onClose={onClose}
        onSelect={onSelect}
        title="Break Frequency Details"
        fetchItems={fetchItems}
        updateActiveStatus={updateActiveStatus}
        columns={columns}
        getItemId={(item: any) => item.bLID}
        getItemActiveStatus={(item: any) => item.rActiveYN === "Y"}
        searchPlaceholder="Enter resource name or code"
        dialogProps={{
          maxWidth: "xl",
          fullWidth: true,
          dialogContentSx: { maxHeight: "400px" },
        }}
        isEditButtonVisible={true}
        isStatusVisible={true}
        isActionVisible={true}
      />
      <BreakSuspendDetails open={suspendDialogOpen} onClose={handleSuspendDialogClose} breakData={selectedBreak} />
    </>
  );
};

export default BreakListSearch;
