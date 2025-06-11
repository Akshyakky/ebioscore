// src/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics.tsx
import { usePatientDemographics } from "@/hooks/PatientAdminstration/patient/usePatientDemographics";
import React from "react";
import { PatientDemographicsCard } from "./PatientDemographicsCard";
import { PatientDemographicsProps } from "./PatientDemographicsProps";

/**
 * Reusable patient demographics component
 */
export const PatientDemographics: React.FC<PatientDemographicsProps> = ({
  pChartID = null,
  demographicsData = null,
  showEditButton = true,
  onEditClick,
  showRefreshButton = true,
  onRefreshClick,
  className,
  isLoading: externalLoading,
  variant = "detailed",
  emptyStateMessage = "No demographics information available for this patient.",
}) => {
  // Use the hook to fetch data if no data is provided
  const {
    demographics: fetchedDemographics,
    isLoading: hookLoading,
    refresh,
  } = usePatientDemographics({
    pChartID: demographicsData ? null : pChartID,
    autoFetch: !demographicsData,
  });

  // Use provided data or fetched data
  const data = demographicsData || fetchedDemographics;

  // Loading state can be controlled externally or from the hook
  const isLoading = externalLoading !== undefined ? externalLoading : hookLoading;

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefreshClick) {
      onRefreshClick();
    } else {
      refresh();
    }
  };

  // Force empty state message when no patient is selected
  const effectiveEmptyStateMessage = pChartID === null ? "Please select a patient to view demographics" : emptyStateMessage;

  return (
    <PatientDemographicsCard
      demographicsData={data}
      isLoading={isLoading}
      showEditButton={showEditButton && !!pChartID}
      showRefreshButton={showRefreshButton && !!pChartID}
      onEditClick={onEditClick || (() => {})}
      onRefreshClick={handleRefresh}
      variant={variant}
      emptyStateMessage={effectiveEmptyStateMessage}
      className={className || ""}
    />
  );
};
