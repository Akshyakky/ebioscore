import axios from "axios";
import { APIConfig } from "../../../apiConfig";
import { DropdownOption } from "../../../interfaces/Common/DropdownOption";
import { OperationResult } from "../../../interfaces/Common/OperationResult";
import { ContactListData } from "../../../interfaces/HospitalAdministration/ContactListData";
import { handleError } from "../../CommonServices/HandlerError";

const fetchActiveSpecialties = async (
  token: string,
  compId: number
): Promise<DropdownOption[]> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/GetActiveSpecialities?compId=${compId}`;
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
    handleError(error);
    throw error;
  }
};

const saveContactList = async (
  token: string,
  contactListDto: ContactListData
): Promise<OperationResult<ContactListData>> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/SaveContactList`;
    const response = await axios.post<OperationResult<ContactListData>>(
      url,
      contactListDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

const searchContactListDetails = async (
  token: string,
  searchTerm: string
): Promise<{ data: any[]; success: boolean }> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/SearchContactList`;
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(url, {
      headers,
      params: { searchTerm },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

const fetchContactDetails = async (
  token: string,
  conID: number
): Promise<ContactListData> => {
  try {
    const url = `${APIConfig.hospitalAdministrations}ContactList/GetContactDetails/${conID}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const ContactListService = {
  fetchActiveSpecialties,
  saveContactList,
  searchContactListDetails,
  fetchContactDetails,
};
