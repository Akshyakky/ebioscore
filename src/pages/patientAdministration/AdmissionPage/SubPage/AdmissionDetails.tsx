//src/pages/patientAdministration/AdmissionPage/SubPage/AdmissionDetails.tsx
import { CircularProgress, Grid, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";

interface AdmissionDetailsProps {
    formData: Partial<AdmissionDto>;
    onChange: (field: keyof AdmissionDto, value: any) => void;
    fetchPatientSuggestions: (input: string) => Promise<string[]>;
    handlePatientSelect: (pChartID: number | null) => void;
}

const AdmissionDetails: React.FC<AdmissionDetailsProps> = ({
    formData,
    onChange,
    fetchPatientSuggestions,
    handlePatientSelect
}) => {
    const dropdownValues = useDropdownValues(['admissionType']);
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">Admission Details</Typography>
            </Grid>
            <FormField
                type="autocomplete"
                label="UHID No."
                ControlID="pChartCode"
                value={formData.pChartCode}
                name="pChartCode"
                placeholder="UHID, Name, DOB, Phone No"
                isMandatory={true}
                onChange={(e) => onChange('pChartCode', e.target.value)}
                fetchSuggestions={fetchPatientSuggestions}
                onSelectSuggestion={(suggestion) => {
                    const pChartCode = suggestion.split('|')[0].trim();
                    onChange('pChartCode', pChartCode);
                    const numbersArray = extractNumbers(pChartCode);
                    const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
                    onChange('pChartID', pChartID);
                    handlePatientSelect(pChartID);
                }}
                gridProps={{ xs: 12, md: 3, lg: 3 }}
            />
            <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                <PatientDemographics pChartID={formData.pChartID ?? 0} />
            </Grid>

            <FormField
                type="select"
                label="Admission Type"
                name="admissionType"
                value={formData.admissionType || ''}
                onChange={(e) => onChange('admissionType', e.target.value)}
                options={dropdownValues.admissionType}
                ControlID="admissionType"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

        </Grid>
    );
}

export default AdmissionDetails;