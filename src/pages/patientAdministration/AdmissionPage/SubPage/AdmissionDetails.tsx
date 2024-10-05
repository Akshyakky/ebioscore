//src/pages/patientAdministration/AdmissionPage/SubPage/AdmissionDetails.tsx
import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import PatientDemographics from "../../CommonPage/Demograph/PatientDemographics";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";

interface AdmissionDetailsProps {
    formData: AdmissionDto;
    onChange: (field: keyof AdmissionDto, value: any) => void;
    onDropdownChange: (valuePath: (string | number)[], textPath: (string | number)[], options: DropdownOption[]) => (e: SelectChangeEvent<string>, child?: React.ReactNode) => void;
    fetchPatientSuggestions: (input: string) => Promise<string[]>;
    handlePatientSelect: (pChartID: number | null) => void;
}

const AdmissionDetails: React.FC<AdmissionDetailsProps> = ({
    formData,
    onChange,
    onDropdownChange,
    fetchPatientSuggestions,
    handlePatientSelect
}) => {
    const dropdownValues = useDropdownValues(['admissionType', 'primaryIntroducingSource', 'department', 'unit', 'attendingPhy', 'roomGroup', 'roomList', 'beds', 'caseType', 'pic']);

    return (
        <FormSectionWrapper title="Admission Details" spacing={1}>
            <FormField
                type="autocomplete"
                label="UHID No."
                ControlID="pChartCode"
                value={formData.IPAdmissionDto.pChartCode || ''}
                name="pChartCode"
                placeholder="UHID, Name, DOB, Phone No"
                isMandatory={true}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, pChartCode: e.target.value })}
                fetchSuggestions={fetchPatientSuggestions}
                onSelectSuggestion={(suggestion) => {
                    const pChartCode = suggestion.split('|')[0].trim();
                    const numbersArray = extractNumbers(pChartCode);
                    const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
                    onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, pChartCode, pChartID });
                    handlePatientSelect(pChartID);
                }}
                gridProps={{ xs: 12, md: 3, lg: 3 }}
            />
            <Grid item xs={12} sm={6} md={9} lg={9} xl={9}>
                <PatientDemographics pChartID={formData.IPAdmissionDto.pChartID || 0} />
            </Grid>

            <FormField
                type="select"
                label="Admission Type"
                name="admissionType"
                value={formData.IPAdmissionDetailsDto.admissionType || ''}
                onChange={onDropdownChange(['IPAdmissionDetailsDto', 'admissionType'], ['IPAdmissionDetailsDto', 'admissionType'], dropdownValues.admissionType)}
                options={dropdownValues.admissionType}
                ControlID="admissionType"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Case Type"
                name="caseType"
                value={formData.IPAdmissionDto.caseTypeID || ''}
                onChange={onDropdownChange(['IPAdmissionDto', 'caseTypeID'], ['IPAdmissionDto', 'caseTypeName'], dropdownValues.caseType)}
                options={dropdownValues.caseType}
                ControlID="caseType"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="text"
                label="Case Number"
                name="admitCode"
                value={formData.IPAdmissionDto.admitCode || ''}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, admitCode: e.target.value })}
                ControlID="admitCode"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
                disabled={true}
            />

            <FormField
                type="datetimepicker"
                label="Admission Date-Time"
                name="admitDate"
                value={formData.IPAdmissionDto.admitDate || null}
                onChange={(date) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, admitDate: date })}
                ControlID="admitDate"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="text"
                label="Visit Number"
                name="visitGesy"
                value={formData.IPAdmissionDto.visitGesy || ''}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, visitGesy: e.target.value })}
                ControlID="visitGesy"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Primary Introducing Source"
                name="PrimaryIntroducingSource"
                value={formData.IPAdmissionDto.primaryRefferalSourceID || ''}
                onChange={onDropdownChange(['IPAdmissionDto', 'primaryRefferalSourceID'], ['IPAdmissionDto', 'primaryRefferalSourceName'], dropdownValues.primaryIntroducingSource)}
                options={dropdownValues.primaryIntroducingSource}
                ControlID="primaryIntroducingSource"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Secondary Introducing Source"
                name="SecondaryIntroducingSource"
                value={formData.IPAdmissionDto.secondaryRefferalSourceID || ''}
                onChange={onDropdownChange(['IPAdmissionDto', 'secondaryRefferalSourceID'], ['IPAdmissionDto', 'secondaryRefferalSourceName'], dropdownValues.primaryIntroducingSource)}
                options={dropdownValues.primaryIntroducingSource}
                ControlID="secondaryIntroducingSource"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Department"
                name="Department"
                value={formData.IPAdmissionDto.deptID || ''}
                onChange={onDropdownChange(['IPAdmissionDto', 'deptID'], ['IPAdmissionDto', 'deptName'], dropdownValues.department)}
                options={dropdownValues.department}
                ControlID="department"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Unit"
                name="Unit"
                value={formData.IPAdmissionDto.dulId || ''}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, dulId: Number(e.target.value) })}
                options={dropdownValues.unit}
                ControlID="unit"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Attending Physician"
                name="Attending Physician"
                value={formData.IPAdmissionDto.attendingPhyID || ''}
                onChange={onDropdownChange(['IPAdmissionDto', 'attendingPhyID'], ['IPAdmissionDto', 'attendingPhyName'], dropdownValues.attendingPhy)}
                options={dropdownValues.attendingPhy}
                ControlID="attendingPhysician"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="PIC"
                name="PIC"
                value={formData.IPAdmissionDto.pTypeID || ''}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, pTypeID: Number(e.target.value) })}
                options={dropdownValues.pic}
                ControlID="pic"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="textarea"
                label="Reason for Admission"
                name="rNotes"
                value={formData.IPAdmissionDetailsDto.plannedProc || ''}
                onChange={(e) => onChange('IPAdmissionDetailsDto', { ...formData.IPAdmissionDetailsDto, plannedProc: e.target.value })}
                ControlID="rNotes"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
                maxLength={4000}
            />

            <FormField
                type="select"
                label="Patient Attendant"
                name="patNokID"
                value={formData.IPAdmissionDto.patNokID || ''}
                onChange={(e) => onChange('IPAdmissionDto', { ...formData.IPAdmissionDto, patNokID: Number(e.target.value) })}
                options={dropdownValues.attendingPhy}
                ControlID="patNokID"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Ward Name"
                name="rGrpID"
                value={formData.WrBedDetailsDto.rGrpID || ''}
                onChange={onDropdownChange(['WrBedDetailsDto', 'rGrpID'], ['WrBedDetailsDto', 'rGrpName'], dropdownValues.roomGroup)}
                options={dropdownValues.roomGroup}
                ControlID="rGrpID"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Room Name"
                name="rlID"
                value={formData.IPAdmissionDetailsDto.rlID || ''}
                onChange={onDropdownChange(['IPAdmissionDetailsDto', 'rlID'], ['IPAdmissionDetailsDto', 'rName'], dropdownValues.roomList)}
                options={dropdownValues.roomList}
                ControlID="rlID"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

            <FormField
                type="select"
                label="Bed Name"
                name="bedID"
                value={formData.WrBedDetailsDto.bedID || ''}
                onChange={onDropdownChange(['WrBedDetailsDto', 'bedID'], ['WrBedDetailsDto', 'bedName'], dropdownValues.beds)}
                options={dropdownValues.beds}
                ControlID="bedID"
                gridProps={{ xs: 12, sm: 6, md: 3 }}
            />

        </FormSectionWrapper>
    );
}

export default AdmissionDetails;