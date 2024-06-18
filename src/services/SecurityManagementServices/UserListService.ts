export interface UserListData {
    appID: number;
    appUserName: string;
    appGeneralCode: string;
    rActiveYN: string;
    rCreatedOn: Date;
    rCreatedID: number;
    rCreatedBy: string;
    rModifiedOn: Date;
    rModifiedID: number;
    rModifiedBy: string;
    rNotes?: string;
    conID: number;
    appUcatCode: string;
    appUcatType: string;
    adminUserYN: string;
    compCode: string;
    compID?: number;
    compName: string;
    conCompId?: number;
    digSignPath?: string;
    transferYN?: string;
    appCode: string;
    appUAccess?: string;
    profileID?: number;
}
