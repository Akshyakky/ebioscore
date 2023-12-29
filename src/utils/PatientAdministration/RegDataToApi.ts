import { ApiPatientData } from '../../models/PatientAdministration/ApiPatientData';
import { RegsitrationFormData } from '../../interfaces/PatientAdministration/registrationFormData';

export const transformToApiData = (formData: RegsitrationFormData): ApiPatientData => {
    return {
        PChartCode: formData.PChartCode,
        FirstName: formData.PFName,
        LastName: formData.PLName,
        // ... map other fields ...
    };
};
