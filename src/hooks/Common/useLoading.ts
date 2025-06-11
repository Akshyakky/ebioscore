// src/hooks/Common/useLoading.ts
import { selectIsLoading } from "@/store/features/ui/loadingSelectors";
import { setLoading } from "@/store/features/ui/loadingSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const useLoading = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  const setIsLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  return { isLoading, setLoading: setIsLoading };
};
