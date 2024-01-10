import { useState } from 'react';
import { RegistrationService } from '../../services/RegistrationService/RegistrationService';

const useRegistrationUtils = (token:string) => {
  const [loading, setLoading] = useState(false);

  const fetchLatestUHID = async () => {
    setLoading(true);
    try {
      const latestUHID = await RegistrationService.getLatestUHID(token, "GetLatestUHID");
      return latestUHID;
    } catch (error) {
      console.error("Error fetching latest UHID:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchLatestUHID, loading };
};

export default useRegistrationUtils;
