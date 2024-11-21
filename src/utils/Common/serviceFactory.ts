//src/utils/Common/serviceFactory.ts
import { CommonApiService } from "../../services/CommonApiService";
import { BaseDto, GenericEntityService } from "../../services/GenericEntityService/GenericEntityService";
import { APIConfig } from "../../apiConfig";

export function createEntityService<T extends BaseDto>(entityName: string, apiKey: keyof typeof APIConfig): GenericEntityService<T> {
  return new GenericEntityService<T>(
    new CommonApiService({
      baseURL: APIConfig[apiKey],
    }),
    entityName
  );
}
