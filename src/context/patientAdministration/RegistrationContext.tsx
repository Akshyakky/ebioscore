//context/patientAdministration/RegistrationContext.tsx
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";

// Define the state interface
interface RegistrationState {
  patientData: PatientRegistrationDto;
  kinData: PatNokDetailsDto[];
  insuranceData: OPIPInsurancesDto[];
  isEditMode: boolean;
  selectedPChartID: number;
  submitErrors: Record<string, string>;
  isSubmitting: boolean;
}

// Define action types
type RegistrationAction =
  | { type: "SET_PATIENT_DATA"; payload: PatientRegistrationDto }
  | { type: "UPDATE_PATIENT_FIELD"; payload: { path: string[]; value: any } }
  | { type: "ADD_KIN_DATA"; payload: PatNokDetailsDto }
  | { type: "UPDATE_KIN_DATA"; payload: PatNokDetailsDto }
  | { type: "REMOVE_KIN_DATA"; payload: number }
  | { type: "SET_KIN_DATA"; payload: PatNokDetailsDto[] }
  | { type: "ADD_INSURANCE_DATA"; payload: OPIPInsurancesDto }
  | { type: "UPDATE_INSURANCE_DATA"; payload: OPIPInsurancesDto }
  | { type: "REMOVE_INSURANCE_DATA"; payload: number }
  | { type: "SET_INSURANCE_DATA"; payload: OPIPInsurancesDto[] }
  | { type: "SET_EDIT_MODE"; payload: boolean }
  | { type: "SET_SELECTED_PCHART_ID"; payload: number }
  | { type: "SET_SUBMIT_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_SUBMIT_ERRORS" }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_FORM" };

// Create the context
interface RegistrationContextType {
  state: RegistrationState;
  dispatch: React.Dispatch<RegistrationAction>;
  updatePatientField: (path: string[], value: any) => void;
  setPatientData: (data: PatientRegistrationDto) => void;
  addKinData: (data: PatNokDetailsDto) => void;
  updateKinData: (data: PatNokDetailsDto) => void;
  removeKinData: (id: number) => void;
  addInsuranceData: (data: OPIPInsurancesDto) => void;
  updateInsuranceData: (data: OPIPInsurancesDto) => void;
  removeInsuranceData: (id: number) => void;
  setEditMode: (isEdit: boolean) => void;
  resetForm: () => void;
}

// Helper function to get a nested property by path
const getNestedProperty = (obj: any, path: string[]): any => {
  return path.reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
};

// Helper function to set a nested property by path
const setNestedProperty = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value;

  const result = { ...obj };
  let current = result;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] = current[key] !== undefined ? { ...current[key] } : {};
    current = current[key];
  }

  current[path[path.length - 1]] = value;
  return result;
};

// Default state creator function with server date placeholder
const createDefaultState = (serverDate: Date): RegistrationState => ({
  patientData: {
    patRegisters: {
      pChartID: 0,
      pChartCode: "",
      pRegDate: serverDate,
      pTitleVal: "",
      pTitle: "",
      pFName: "",
      pMName: "",
      pLName: "",
      pDobOrAgeVal: "Y",
      pDobOrAge: "",
      pDob: serverDate,
      pGender: "",
      pGenderVal: "",
      pBldGrp: "",
      rActiveYN: "Y",
      rNotes: "",
      compID: 0,
      compCode: "",
      compName: "",
      pFhName: "",
      pTypeID: 0,
      pTypeCode: "",
      pTypeName: "",
      fatherBldGrp: "",
      patMemID: 0,
      patMemName: "",
      patMemDescription: "",
      patMemSchemeExpiryDate: serverDate,
      patSchemeExpiryDateYN: "N",
      patSchemeDescriptionYN: "N",
      cancelReason: "",
      cancelYN: "N",
      attendingPhysicianId: 0,
      attendingPhysicianName: "",
      deptID: 0,
      deptName: "",
      facultyID: 0,
      faculty: "",
      langType: "",
      pChartCompID: 0,
      pExpiryDate: serverDate,
      physicianRoom: "",
      regTypeVal: "GEN",
      regType: "",
      primaryReferralSourceId: 0,
      primaryReferralSourceName: "",
      pPob: "",
      patCompName: "",
      patCompNameVal: "",
      patDataFormYN: "N",
      intIdPsprt: "",
      transferYN: "N",
      indentityType: "",
      indentityValue: "",
      patientType: "",
    },
    patAddress: {
      pAddID: 0,
      pChartID: 0,
      pChartCode: "",
      pAddType: "LOCAL",
      pAddMailVal: "N",
      pAddMail: "",
      pAddSMSVal: "N",
      pAddSMS: "",
      pAddEmail: "",
      pAddStreet: "",
      pAddStreet1: "",
      pAddCityVal: "",
      pAddCity: "",
      pAddState: "",
      pAddPostcode: "",
      pAddCountry: "",
      pAddCountryVal: "",
      pAddPhone1: "",
      pAddPhone2: "",
      pAddPhone3: "",
      pAddWorkPhone: "",
      pAddActualCountryVal: "",
      pAddActualCountry: "",
      patAreaVal: "",
      patArea: "",
      patDoorNo: "",
    },
    patOverview: {
      patOverID: 0,
      pChartID: 0,
      pChartCode: "",
      pPhoto: "",
      pMaritalStatus: "",
      pReligion: "",
      pEducation: "",
      pOccupation: "",
      pEmployer: "",
      ethnicity: "",
      pCountryOfOrigin: "",
      pAgeNumber: 0,
      pAgeDescriptionVal: "Years",
    },
    opvisits: {
      visitTypeVal: "H",
      visitType: "Hospital",
    },
  },
  kinData: [],
  insuranceData: [],
  isEditMode: false,
  selectedPChartID: 0,
  submitErrors: {},
  isSubmitting: false,
});

// Reducer function
const registrationReducer = (state: RegistrationState, action: RegistrationAction): RegistrationState => {
  switch (action.type) {
    case "SET_PATIENT_DATA":
      return {
        ...state,
        patientData: action.payload,
      };

    case "UPDATE_PATIENT_FIELD": {
      const { path, value } = action.payload;
      return {
        ...state,
        patientData: setNestedProperty(state.patientData, path, value),
      };
    }

    case "ADD_KIN_DATA":
      return {
        ...state,
        kinData: [...state.kinData, action.payload],
      };

    case "UPDATE_KIN_DATA":
      return {
        ...state,
        kinData: state.kinData.map((item) => ((item.pNokID && item.pNokID === action.payload.pNokID) || (item.ID && item.ID === action.payload.ID) ? action.payload : item)),
      };

    case "REMOVE_KIN_DATA":
      return {
        ...state,
        kinData: state.kinData.filter((item) => item.pNokID !== action.payload && item.ID !== action.payload),
      };

    case "SET_KIN_DATA":
      return {
        ...state,
        kinData: action.payload,
      };

    case "ADD_INSURANCE_DATA":
      return {
        ...state,
        insuranceData: [...state.insuranceData, action.payload],
      };

    case "UPDATE_INSURANCE_DATA":
      return {
        ...state,
        insuranceData: state.insuranceData.map((item) =>
          (item.oPIPInsID && item.oPIPInsID === action.payload.oPIPInsID) || (item.ID && item.ID === action.payload.ID) ? action.payload : item
        ),
      };

    case "REMOVE_INSURANCE_DATA":
      return {
        ...state,
        insuranceData: state.insuranceData.filter((item) => item.oPIPInsID !== action.payload && item.ID !== action.payload),
      };

    case "SET_INSURANCE_DATA":
      return {
        ...state,
        insuranceData: action.payload,
      };

    case "SET_EDIT_MODE":
      return {
        ...state,
        isEditMode: action.payload,
      };

    case "SET_SELECTED_PCHART_ID":
      return {
        ...state,
        selectedPChartID: action.payload,
      };

    case "SET_SUBMIT_ERRORS":
      return {
        ...state,
        submitErrors: action.payload,
      };

    case "CLEAR_SUBMIT_ERRORS":
      return {
        ...state,
        submitErrors: {},
      };

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case "RESET_FORM":
      return createDefaultState(
        state.patientData.patRegisters.pRegDate // Preserve server date reference
      );

    default:
      return state;
  }
};

// Create the context
const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

// Provider component
interface RegistrationProviderProps {
  children: ReactNode;
  initialServerDate: Date;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({ children, initialServerDate }) => {
  const [state, dispatch] = useReducer(registrationReducer, createDefaultState(initialServerDate));

  // Convenience action creators
  const updatePatientField = useCallback((path: string[], value: any) => {
    dispatch({ type: "UPDATE_PATIENT_FIELD", payload: { path, value } });
  }, []);

  const setPatientData = useCallback((data: PatientRegistrationDto) => {
    dispatch({ type: "SET_PATIENT_DATA", payload: data });
  }, []);

  const addKinData = useCallback((data: PatNokDetailsDto) => {
    dispatch({ type: "ADD_KIN_DATA", payload: data });
  }, []);

  const updateKinData = useCallback((data: PatNokDetailsDto) => {
    dispatch({ type: "UPDATE_KIN_DATA", payload: data });
  }, []);

  const removeKinData = useCallback((id: number) => {
    dispatch({ type: "REMOVE_KIN_DATA", payload: id });
  }, []);

  const addInsuranceData = useCallback((data: OPIPInsurancesDto) => {
    dispatch({ type: "ADD_INSURANCE_DATA", payload: data });
  }, []);

  const updateInsuranceData = useCallback((data: OPIPInsurancesDto) => {
    dispatch({ type: "UPDATE_INSURANCE_DATA", payload: data });
  }, []);

  const removeInsuranceData = useCallback((id: number) => {
    dispatch({ type: "REMOVE_INSURANCE_DATA", payload: id });
  }, []);

  const setEditMode = useCallback((isEdit: boolean) => {
    dispatch({ type: "SET_EDIT_MODE", payload: isEdit });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: "RESET_FORM" });
  }, []);

  const value = {
    state,
    dispatch,
    updatePatientField,
    setPatientData,
    addKinData,
    updateKinData,
    removeKinData,
    addInsuranceData,
    updateInsuranceData,
    removeInsuranceData,
    setEditMode,
    resetForm,
  };

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
};

// Hook to use the registration context
export const useRegistration = (): RegistrationContextType => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return context;
};
