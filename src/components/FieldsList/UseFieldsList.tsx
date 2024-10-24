import { useEffect, useState } from "react";
import { DropdownOption } from "../../interfaces/Common/DropdownOption";
import { AppModifyFieldDto } from "../../interfaces/HospitalAdministration/AppModifiedlistDto";
import { appModifiedListService } from "../../services/HospitalAdministrationServices/hospitalAdministrationService";
import { showAlert } from "../../utils/Common/showAlert";

const useFieldsList = (fieldNames: string[]) => {
    const [fieldsList, setFieldsList] = useState<{ [key: string]: DropdownOption[] }>({});
    const [defaultFields, setDefaultFields] = useState<{ [key: string]: string }>({});
    const [isFetched, setIsFetched] = useState(false); // To prevent unnecessary re-fetching

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const response: any = await appModifiedListService.getAll();
                console.log("API Response:", response);
                const fieldsData = response.data || response;

                // Early exit if there's no data
                if (!fieldsData || fieldsData.length === 0) {
                    console.log("No fields data received from the API.");
                    return;
                }

                let fieldOptions: { [key: string]: DropdownOption[] } = {};
                let defaultValues: { [key: string]: string } = {};

                const normalizedFieldNames = fieldNames.map(name => name.toLowerCase());

                normalizedFieldNames.forEach((fieldName) => {
                    const filteredFields = fieldsData
                        .filter((field: AppModifyFieldDto) => {
                            // Ensure case-insensitive comparison
                            return field.amlField?.toLowerCase() === fieldName && field.rActiveYN === "Y";
                        })
                        .map((field: AppModifyFieldDto) => ({
                            value: field.amlID.toString(),
                            label: field.amlName,
                            defaultYN: field.defaultYN,
                        }));

                    // Log filtered fields for debugging
                    console.log(`Filtered fields for ${fieldName}:`, filteredFields);

                    if (filteredFields.length === 0) {
                        console.log(`No fields found for ${fieldName}`);
                        return;
                    }

                    fieldOptions[fieldName] = filteredFields;

                    // Find default field
                    const defaultField = filteredFields.find(
                        (field: DropdownOption) => field.defaultYN === "Y"
                    );

                    if (defaultField) {
                        defaultValues[fieldName] = defaultField.value;
                    }

                    console.log(`Default value for ${fieldName}:`, defaultField?.value || "No default set");
                });

                setFieldsList(fieldOptions);
                setDefaultFields(defaultValues);
                setIsFetched(true); // Mark as fetched to prevent re-fetching
                console.log("Final Fields List:", fieldOptions);
                console.log("Final Default Fields:", defaultValues);

            } catch (error) {
                console.error("Error fetching fields:", error);
                showAlert("Error", "Failed to load fields", "error");
            }
        };

        // Only fetch data if not already fetched
        if (!isFetched) {
            fetchFields();
        }
    }, [fieldNames, isFetched]);

    return { fieldsList, defaultFields };
};

export default useFieldsList;


