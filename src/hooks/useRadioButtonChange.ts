// useRadioButtonChange.ts
import { useState } from 'react';

const useRadioButtonChange = <T extends object>(initialData: T) => {
  const [formData, setFormData] = useState<T>(initialData);

  const handleRadioButtonChange = (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: e.target.value
    }));
  };

  return { formData, handleRadioButtonChange };
};

export default useRadioButtonChange;
