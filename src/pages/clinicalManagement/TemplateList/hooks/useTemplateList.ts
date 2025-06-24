import { createEntityHook } from "@/hooks/Common/useGenericEntity";
import { TemplateDetailDto, TemplateMastDto } from "@/interfaces/ClinicalManagement/TemplateDto";
import { templateDetailService, templateMastService } from "@/services/ClinicalManagementServices/clinicalManagementService";

const useGenericTemplateMast = createEntityHook<TemplateMastDto>(templateMastService, "templateID");
const useGenericTemplateDetail = createEntityHook<TemplateDetailDto>(templateDetailService, "templateDetailID");

export const useTemplateMast = () => {
  const hook = useGenericTemplateMast();

  return {
    templateList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchTemplateList: hook.fetchEntityList,
    getTemplateById: hook.getEntityById,
    saveTemplate: hook.saveEntity,
    deleteTemplate: hook.deleteEntity,
    updateTemplateStatus: hook.updateEntityStatus,
    getNextCode: hook.getNextCode,
  };
};

export const useTemplateDetail = () => {
  const hook = useGenericTemplateDetail();

  return {
    templateDetailList: hook.entityList,
    isLoading: hook.isLoading,
    error: hook.error,
    fetchTemplateDetailList: hook.fetchEntityList,
    getTemplateDetailById: hook.getEntityById,
    saveTemplateDetail: hook.saveEntity,
    deleteTemplateDetail: hook.deleteEntity,
    updateTemplateDetailStatus: hook.updateEntityStatus,
  };
};
