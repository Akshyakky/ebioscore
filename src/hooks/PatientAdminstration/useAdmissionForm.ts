// src/hooks/useAdmissionForm.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { IcdDetailDto } from "../../interfaces/ClinicalManagement/IcdDetailDto";
import { extendedAdmissionService } from "../../services/PatientAdministrationServices/patientAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";
import { AdmissionDto, IPAdmissionDetailsDto, IPAdmissionDto, WrBedDetailsDto } from "../../interfaces/PatientAdministration/AdmissionDto";
import { useLoading } from "../../context/LoadingContext";

const initialFormState: AdmissionDto = {
  IPAdmissionDto: {
    admitDate: new Date(),
    admitCode: "",
  } as IPAdmissionDto,
  IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
  WrBedDetailsDto: {} as WrBedDetailsDto,
};

const useAdmissionForm = () => {
  const [formData, setFormData] = useState<AdmissionDto>(initialFormState);
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState<IcdDetailDto[]>([]);
  const [associatedDiagnoses, setAssociatedDiagnoses] = useState<IcdDetailDto[]>([]);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const [shouldClearPatientHistory, setShouldClearPatientHistory] = useState(false);
  const insurancePageRef = useRef<any>(null);
  const { setLoading } = useLoading();

  const fetchAdmitCode = useCallback(async () => {
    try {
      const admitCodeResponse = await extendedAdmissionService.generateAdmitCode();
      if (admitCodeResponse.success && admitCodeResponse.data) {
        setFormData((prev) => ({
          ...prev,
          IPAdmissionDto: {
            ...prev.IPAdmissionDto,
            admitCode: admitCodeResponse.data,
          },
        }));
      } else {
        console.error("Failed to generate admit code:", admitCodeResponse.errorMessage);
      }
    } catch (error) {
      console.error("Error fetching admit code:", error);
    }
  }, []);

  useEffect(() => {
    fetchAdmitCode();
  }, [fetchAdmitCode]);

  const handleChange = useCallback((field: keyof AdmissionDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDropdownChange = useCallback((fields: (keyof AdmissionDto)[], values: any[], options: any[]) => {
    setFormData((prev) => {
      const newData = { ...prev };
      fields.forEach((field, index) => {
        newData[field] = values[index];
      });
      return newData;
    });
  }, []);

  const handleClear = useCallback(() => {
    setFormData((prev) => ({
      ...initialFormState,
      IPAdmissionDto: {
        ...initialFormState.IPAdmissionDto,
        admitDate: new Date(),
        admitCode: prev.IPAdmissionDto.admitCode,
      },
    }));
    setPrimaryDiagnoses([]);
    setAssociatedDiagnoses([]);
    setShouldClearInsuranceData(true);
    setShouldClearPatientHistory(true);
    if (insurancePageRef.current && insurancePageRef.current.handleClear) {
      insurancePageRef.current.handleClear();
    }
    fetchAdmitCode();
  }, [fetchAdmitCode]);

  const validateForm = useCallback(() => {
    const { IPAdmissionDto, IPAdmissionDetailsDto } = formData;

    if (!IPAdmissionDto.pChartID) {
      showAlert("Error", "Please select a patient", "error");
      return false;
    }

    if (!IPAdmissionDto.attendingPhyID) {
      showAlert("Error", "Please select attending physician", "error");
      return false;
    }

    if (!IPAdmissionDetailsDto.bedID) {
      showAlert("Error", "Please select a bed", "error");
      return false;
    }

    return true;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    try {
      const result = await extendedAdmissionService.admitPatient(formData);
      showAlert("Success", "Admission saved successfully", "success");
      handleClear();
    } catch (error) {
      showAlert("Error", "Failed to save admission", "error");
    }
  }, [formData, primaryDiagnoses, associatedDiagnoses, handleClear]);

  const handlePatientSelect = useCallback(async (pChartID: number | null) => {
    if (!pChartID) {
      setFormData((prev) => ({
        ...prev,
        IPAdmissionDto: {
          ...prev.IPAdmissionDto,
          pChartID: 0,
          pChartCode: "",
        },
      }));
      return;
    }

    try {
      setLoading(true);
      const response = await extendedAdmissionService.getPatientAdmissionStatus(pChartID);

      if (!response.success) {
        throw new Error(response.errorMessage || "Failed to get patient status");
      }

      const { data } = response;
      if (data?.isAdmitted) {
        setFormData((prev) => ({
          ...prev,
          ...data.admissionData,
        }));
      } else if (data?.patientData) {
        setFormData((prev) => ({
          ...prev,
          IPAdmissionDto: {
            ...prev.IPAdmissionDto,
            pChartID,
            // Add other relevant patient data mappings
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching patient status:", error);
      showAlert("Error", "Failed to fetch patient status", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBedSelect = useCallback((bed: any) => {
    setFormData((prev) => ({
      ...prev,
      WrBedDetailsDto: {
        ...prev.WrBedDetailsDto,
        bedID: bed.bedID,
        bedName: bed.bedName,
        rGrpID: bed.roomList?.roomGroup?.rGrpID || 0,
        rGrpName: bed.roomList?.roomGroup?.rGrpName || "",
      },
      IPAdmissionDetailsDto: {
        ...prev.IPAdmissionDetailsDto,
        rlID: bed.rlID,
        rName: bed.roomList?.rName || "",
        wCatID: bed.wbCatID || 0,
        wCatName: bed.wbCatName || "",
      },
    }));
  }, []);

  return {
    formData,
    setFormData,
    primaryDiagnoses,
    setPrimaryDiagnoses,
    associatedDiagnoses,
    setAssociatedDiagnoses,
    handleChange,
    handleDropdownChange,
    handleClear,
    handleSave,
    handlePatientSelect,
    handleBedSelect,
    shouldClearInsuranceData,
    setShouldClearInsuranceData,
    shouldClearPatientHistory,
    setShouldClearPatientHistory,
    insurancePageRef,
  };
};

export default useAdmissionForm;
