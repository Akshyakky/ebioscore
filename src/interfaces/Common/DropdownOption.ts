export interface DropdownOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export interface PicValue {
  pTypeID: string;
  pTypeName: string;
}

export interface DepartmentValue {
  deptID: string;
  deptName: string;
}

export interface PhysicianValue {
  physicianID: string;
  physicianName: string;
}
