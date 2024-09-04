import { Grid, Typography, Box } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import { useLoading } from "../../../../context/LoadingContext";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";

interface ContactDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
}

// Assuming token is a string, endpoint is a string, and fieldCode is a string
const useDropdownFetcher = (
  endpoint: string,
  fieldCode: string
) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [error, setError] = useState<any>(null); // Use 'any' or a more specific type for error
  const { setLoading } = useLoading();
  useEffect(() => {
    let cancel = false;
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const data = await AppModifyListService.fetchAppModifyList(
          endpoint,
          fieldCode
        );
        if (!cancel) {
          setOptions(
            data.map((item) => ({ value: item.value, label: item.label }))
          );
        }
      } catch (err) {
        if (!cancel) {
          console.error(`Error fetching ${fieldCode} values:`, err);
          setError(err);
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      cancel = true;
    };
  }, [fieldCode]);

  return { options, error };
};

const ContactDetails: React.FC<ContactDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;

  const { handleDropdownChange } =
    useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<PatientRegistrationDto>(setFormData);

  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  const { options: areaValues } = useDropdownFetcher(
    endPointAppModifyList,
    "AREA"
  );
  const { options: cityValues } = useDropdownFetcher(
    endPointAppModifyList,
    "CITY"
  );
  const { options: countryValues } = useDropdownFetcher(
    endPointAppModifyList,
    "ACTUALCOUNTRY"
  );
  const { options: companyValues } = useDropdownFetcher(
    endPointAppModifyList,
    "COMPANY"
  );

  const smsOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  const emailOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];
  return (
    <section aria-labelledby="contact-details-header">
      <Box>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
          Contact Details
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FloatingLabelTextBox
            ControlID="Address"
            title="Address"
            type="text"
            size="small"
            placeholder="Address"
            value={formData.patAddress.pAddStreet || ""}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patAddress: {
                  ...prevFormData.patAddress,
                  pAddStreet: e.target.value,
                },
              }))
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            label="Area"
            name="Area"
            value={formData.patAddress.patAreaVal || ""}
            options={areaValues}
            onChange={handleDropdownChange(
              ["patAddress", "patAreaVal"],
              ["patAddress", "patArea"],
              areaValues
            )}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            label="City"
            name="City"
            value={formData.patAddress.pAddCityVal || ""}
            options={cityValues}
            onChange={handleDropdownChange(
              ["patAddress", "pAddCityVal"],
              ["patAddress", "pAddCity"],
              cityValues
            )}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            label="Country"
            name="Country"
            value={formData.patAddress.pAddActualCountryVal || ""}
            options={countryValues}
            onChange={handleDropdownChange(
              ["patAddress", "pAddActualCountryVal"],
              ["patAddress", "pAddActualCountry"],
              countryValues
            )}
            size="small"
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FloatingLabelTextBox
            ControlID="PostCode"
            title="Post Code"
            type="text"
            size="small"
            placeholder="Post Code"
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patAddress: {
                  ...prevFormData.patAddress,
                  pAddPostcode: e.target.value,
                },
              }))
            }
            value={formData.patAddress.pAddPostcode || ""}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FloatingLabelTextBox
            ControlID="Email"
            title="Email"
            type="email"
            size="small"
            placeholder="Email"
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patAddress: {
                  ...prevFormData.patAddress,
                  pAddEmail: e.target.value,
                },
              }))
            }
            value={formData.patAddress.pAddEmail || ""}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownSelect
            label="Company"
            name="Company"
            value={formData.patRegisters.patCompNameVal || ""}
            options={companyValues}
            onChange={handleDropdownChange(
              ["patRegisters", "patCompNameVal"],
              ["patRegisters", "patCompName"],
              companyValues
            )}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={6}>
              <RadioGroup
                name="receiveSMS"
                label="Receive SMS"
                options={smsOptions}
                selectedValue={formData.patAddress.pAddSMSVal || ""}
                onChange={handleRadioButtonChange(
                  ["patAddress", "pAddSMSVal"],
                  ["patAddress", "pAddSMS"],
                  smsOptions
                )}
                inline={true}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <RadioGroup
                name="receiveEmail"
                label="Receive Email"
                options={emailOptions}
                selectedValue={formData.patAddress.pAddMailVal || ""}
                onChange={handleRadioButtonChange(
                  ["patAddress", "pAddMailVal"],
                  ["patAddress", "pAddMail"],
                  emailOptions
                )}
                inline={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
};

export default ContactDetails;
