import { Dispatch, SetStateAction } from "react";
import { RadioButtonOption } from "../interfaces/Common/RadioButtonOption";

const useRadioButtonChange = <T extends object>(
  setFormData: Dispatch<SetStateAction<T>>
) => {
  const handleRadioButtonChange =
    (
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: RadioButtonOption[]
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );

      setFormData((prevFormData) => {
        let newData: any = { ...prevFormData };
        let valueCurrent: any = newData;
        let textCurrent: any = newData;

        for (let i = 0; i < valuePath.length - 1; i++) {
          valueCurrent = valueCurrent[valuePath[i]];
        }
        valueCurrent[valuePath[valuePath.length - 1]] = selectedValue;

        if (selectedOption && textPath.length > 0) {
          for (let i = 0; i < textPath.length - 1; i++) {
            textCurrent = textCurrent[textPath[i]];
          }
          textCurrent[textPath[textPath.length - 1]] = selectedOption.label;
        }

        return newData;
      });
    };

  return { handleRadioButtonChange };
};

export default useRadioButtonChange;
