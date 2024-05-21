import { RegistrationService } from "../../services/PatientAdministrationServices/RegistrationService/RegistrationService";
import { useLoading } from "../../context/LoadingContext";

const useRegistrationUtils = (token: string) => {
  const { setLoading } = useLoading();
  const fetchLatestUHID = async () => {
    setLoading(true);
    try {
      const latestUHID = await RegistrationService.getLatestUHID(
        token,
        "GetLatestUHID"
      );
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
