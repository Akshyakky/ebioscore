import { RecordFields } from "./RecordFields";

export interface PhysicianReferralFields {
  attendingPhysicianId?: number;
  attendingPhysicianName?: string;
  attendingPhysicianSpecialtyId?: number;
  attendingPhysicianSpecialty?: string;
  primaryPhysicianId?: number;
  primaryPhysicianName?: string;
  primaryPhysicianSpecialtyId?: number;
  primaryPhysicianSpecialty?: string;
  primaryReferralSourceId?: number;
  primaryReferralSourceName?: string;
  secondaryReferralSourceId?: number;
  secondaryReferralSourceName?: string;
}

export interface RecordFieldsWithPhysician extends RecordFields, PhysicianReferralFields {}
