import { DepartmentInfo } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GRNState {
  departmentInfo: DepartmentInfo | null;
}
const initialState: GRNState = {
  departmentInfo: null,
};

const GRNState = createSlice({
  name: "GRNState",
  initialState,
  reducers: {
    setDepartmentInfo(state, action: PayloadAction<DepartmentInfo>) {
      state.departmentInfo = action.payload;
    },
  },
});

export const { setDepartmentInfo } = GRNState.actions;
export default GRNState.reducer;
