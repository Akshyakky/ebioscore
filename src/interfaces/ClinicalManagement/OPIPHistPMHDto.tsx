// src/interfaces/ClinicalManagement/OPIPHistPMHDto.ts
import { BaseDto } from "../../services/GenericEntityService/GenericEntityService";

export interface OPIPHistPMHDto extends BaseDto {
    opippmhId: number;
    opipNo: number;
    opvId: number;
    pchartId: number;
    opipCaseNo: number;
    patOpipYn: string;
    opippmhDate: Date;
    opippmhDesc: string;
    opippmhNotes?: string;
    oldPchartId: number;
}