import { GRNDetailDto, GRNMastDto, initialMastData } from "@/interfaces/InventoryManagement/GRNDto";
import { DepartmentInfo } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GRNState {
  departmentInfo: DepartmentInfo | null;
  grnMastData: GRNMastDto;
  grnDetailData: GRNDetailDto[];
  disableApprovedFields: boolean;
}
const initialState: GRNState = {
  departmentInfo: null,
  grnMastData: initialMastData,
  grnDetailData: [],
  disableApprovedFields: false,
};

const GRNState = createSlice({
  name: "GRNState",
  initialState,
  reducers: {
    setDepartmentInfo(state, action: PayloadAction<DepartmentInfo>) {
      state.departmentInfo = action.payload;
    },
    setGRNMastData(state, action: PayloadAction<GRNMastDto>) {
      state.grnMastData = action.payload;
    },
    updateGRNMastField(state, action: PayloadAction<{ field: keyof GRNMastDto; value: any }>) {
      if (state.grnMastData) {
        (state.grnMastData[action.payload.field] as any) = action.payload.value;
      }
    },
    setDisableApprovedFields(state, action: PayloadAction<boolean>) {
      state.disableApprovedFields = action.payload;
    },
    addGRNDetailData(state, action: PayloadAction<GRNDetailDto>) {
      state.grnDetailData.push(action.payload);
    },
    updateAllGRNDetailDatas(state, action: PayloadAction<GRNDetailDto[]>) {
      state.grnDetailData = action.payload;
    },
    resetGRNState(state) {
      state.departmentInfo = null;
      state.grnMastData = initialMastData;
      state.disableApprovedFields = false;
    },
  },
});

export const { setDepartmentInfo, setGRNMastData, updateGRNMastField, setDisableApprovedFields, addGRNDetailData, updateAllGRNDetailDatas, resetGRNState } = GRNState.actions;
export default GRNState.reducer;
