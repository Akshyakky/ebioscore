import { useEffect, useState } from "react";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { AppModifyFieldDto } from "../../interfaces/HospitalAdministration/AppModifiedlistDto";
import { appModifiedListService } from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";

const useFieldsList = (fieldNames: string[]) => {
  const [fieldsList, setFieldsList] = useState<{ [key: string]: DropdownOption[] }>({});
  const [defaultFields, setDefaultFields] = useState<{ [key: string]: string }>({});
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response: any = await appModifiedListService.getAll();
        const fieldsData = response.data || response;
        if (!fieldsData || fieldsData.length === 0) {
          return;
        }
        let fieldOptions: { [key: string]: DropdownOption[] } = {};
        let defaultValues: { [key: string]: string } = {};
        const normalizedFieldNames = fieldNames.map((name) => name.toLowerCase());
        normalizedFieldNames.forEach((fieldName) => {
          const filteredFields = fieldsData
            .filter((field: AppModifyFieldDto) => {
              return field.amlField?.toLowerCase() === fieldName && field.rActiveYN === "Y";
            })
            .map((field: AppModifyFieldDto) => ({
              value: field.amlID.toString(),
              label: field.amlName,
              defaultYN: field.defaultYN,
            }));
          if (filteredFields.length === 0) {
            return;
          }
          fieldOptions[fieldName] = filteredFields;
          const defaultField = filteredFields.find((field: DropdownOption) => field.defaultYN === "Y");
          if (defaultField) {
            defaultValues[fieldName] = defaultField.value;
          }
        });
        setFieldsList(fieldOptions);
        setDefaultFields(defaultValues);
        setIsFetched(true);
      } catch (error) {
        showAlert("Error", "Failed to load fields", "error");
      }
    };
    if (!isFetched) {
      fetchFields();
    }
  }, [fieldNames, isFetched]);
  return { fieldsList, defaultFields };
};

export default useFieldsList;
