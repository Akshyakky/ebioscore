import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";
import { chargeDetailsService } from "@/services/BillingServices/chargeDetailsService";

const useGenericScheduleOfCharge = createEntityHook<ChargeDetailsDto>(chargeDetailsService, "chargeID");

export const useScheduleOfCharge = () => {
  const hook = useGenericScheduleOfCharge();

  return {
    chargeList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchChargeList: hook.fetchEntityList,
    getChargeById: hook.getEntityById,
    saveCharge: hook.saveEntity,
    deleteCharge: hook.deleteEntity,
    updateChargeStatus: hook.updateEntityStatus,
    generateChargeCode: async () => {
      const result = await chargeDetailsService.generateChargeCode();
      return result.success ? result.data : null;
    },
    saveChargeDetails: async (chargeDetails: ChargeDetailsDto) => {
      return await chargeDetailsService.saveChargeDetails(chargeDetails);
    },
    getAllChargeDetails: async () => {
      return await chargeDetailsService.getAllChargeDetails();
    },
    getChargeDetailsById: async (chargeID: number) => {
      return await chargeDetailsService.getAllByID(chargeID);
    },
  };
};
