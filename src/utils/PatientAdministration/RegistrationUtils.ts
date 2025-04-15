import { useLoading } from "@/context/LoadingContext";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";

const useRegistrationUtils = () => {
  const { setLoading } = useLoading();
  const fetchLatestUHID = async () => {
    setLoading(true);
    try {
      const latestUHID = await RegistrationService.getLatestUHID("GetLatestUHID");
      return latestUHID;
    } catch (error) {
      console.error("Error fetching latest UHID:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchLatestUHID };
};

export default useRegistrationUtils;
