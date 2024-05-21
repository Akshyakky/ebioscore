//HospitalAdministrationServices/ContactListService.ts
import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import { DropdownOption } from "../../../interfaces/Common/DropdownOption";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { ContactListData } from "../../../interfaces/hospitalAdministration/ContactListData";

const fetchActiveSpecialties = async (
  token: string,
  compId: number
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/GetActiveSpecialites?compId=${compId}`;
    debugger;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.map((item: any) => ({
      value: item.facId,
      label: item.facName,
    }));
  } catch (error) {
    console.error("Error fetching active specialties:", error);
    throw error;
  }
};

const saveContactList = async (
  token: string,
  contactListDto: ContactListData
): Promise<OperationResult<ContactListData>> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/SaveContactList`;
    const response = await axios.post(url, contactListDto, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error saving contact list:", error);
    throw error;
  }
};

export const ContactListService = {
  fetchActiveSpecialties,
  saveContactList,
};
