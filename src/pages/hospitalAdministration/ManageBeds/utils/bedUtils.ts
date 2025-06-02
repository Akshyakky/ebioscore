// src/utils/bedUtils.ts
import { WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";

export const BedStatus = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  BLOCKED: "Blocked",
  MAINTENANCE: "Maintenance",
  RESERVED: "Reserved",
} as const;

export type BedStatusType = (typeof BedStatus)[keyof typeof BedStatus];

export const isBedAvailable = (bed: WrBedDto): boolean => {
  return bed.bedStatusValue === BedStatus.AVAILABLE && bed.rActiveYN === "Y";
};

export const isBedOccupied = (bed: WrBedDto): boolean => {
  return bed.bedStatusValue === BedStatus.OCCUPIED;
};

export const isBedBlocked = (bed: WrBedDto): boolean => {
  return bed.bedStatusValue === BedStatus.BLOCKED;
};

export const getBedStatusColor = (status: string): string => {
  switch (status) {
    case BedStatus.AVAILABLE:
      return "#4caf50";
    case BedStatus.OCCUPIED:
      return "#f44336";
    case BedStatus.BLOCKED:
      return "#ff9800";
    case BedStatus.MAINTENANCE:
      return "#9c27b0";
    case BedStatus.RESERVED:
      return "#2196f3";
    default:
      return "#757575";
  }
};

export const getBedDisplayName = (bed: WrBedDto, includeRoom: boolean = false): string => {
  if (includeRoom && bed.roomList?.rName) {
    return `${bed.bedName} (${bed.roomList.rName})`;
  }
  return bed.bedName;
};

export const formatBedForDisplay = (
  bed: WrBedDto
): {
  name: string;
  room: string;
  roomGroup: string;
  department: string;
  status: string;
  statusColor: string;
} => {
  return {
    name: bed.bedName,
    room: bed.roomList?.rName || "Unknown Room",
    roomGroup: bed.roomList?.roomGroup?.rGrpName || "Unknown Group",
    department: bed.roomList?.roomGroup?.deptName || "Unknown Department",
    status: bed.bedStatusValue || BedStatus.AVAILABLE,
    statusColor: getBedStatusColor(bed.bedStatusValue || BedStatus.AVAILABLE),
  };
};
