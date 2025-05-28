// import { createEntityHook } from "@/hooks/Common/useGenericEntity";
// import { BreakListData } from "@/interfaces/FrontOffice/BreakListData";
// import { breakListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

// const useGenericBreakList = createEntityHook<BreakListData>(breakListService, "bLID");

// export const useBreakList = () => {
//   const hook = useGenericBreakList();

//   return {
//     breakList: hook.entityList,
//     isLoading: hook.isLoading,
//     error: hook.error,
//     fetchBreakList: hook.fetchEntityList,
//     getBreakById: hook.getEntityById,
//     saveBreak: hook.saveEntity,
//     deleteBreak: hook.deleteEntity,
//     updateBreakStatus: hook.updateEntityStatus,
//     getNextCode: hook.getNextCode,
//   };
// };
