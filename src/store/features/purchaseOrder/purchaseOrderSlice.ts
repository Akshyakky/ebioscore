import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { DepartmentInfo, PurchaseOrderDetailDto, PurchaseOrderMastDto, PurchaseOrderState } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: PurchaseOrderState = {
  departmentInfo: null,
  purchaseOrderMastData: null,
  purchaseOrderDetails: [],
  selectedProduct: null,
  discountFooter: { totDiscAmtPer: 0, isDiscPercentage: false },
};

const purchaseOrderState = createSlice({
  name: "purchaseOrderState",
  initialState,
  reducers: {
    setDepartmentInfo(state, action: PayloadAction<DepartmentInfo>) {
      state.departmentInfo = action.payload;
    },
    setPurchaseOrderMastData(state, action: PayloadAction<PurchaseOrderMastDto>) {
      state.purchaseOrderMastData = action.payload;
    },
    resetPurchaseOrderState(state) {
      state.departmentInfo = null;
      state.purchaseOrderMastData = null;
      state.purchaseOrderDetails = [];
      state.selectedProduct = null;
    },
    updatePurchaseOrderMastField(state, action: PayloadAction<{ field: keyof PurchaseOrderMastDto; value: any }>) {
      if (state.purchaseOrderMastData) {
        (state.purchaseOrderMastData[action.payload.field] as any) = action.payload.value;
      }
    },
    addPurchaseOrderDetail(state, action: PayloadAction<PurchaseOrderDetailDto>) {
      state.purchaseOrderDetails.push(action.payload);
    },
    updateAllPurchaseOrderDetails(state, action: PayloadAction<PurchaseOrderDetailDto[]>) {
      state.purchaseOrderDetails = action.payload;
    },
    removePurchaseOrderDetail(state, action: PayloadAction<number>) {
      state.purchaseOrderDetails = state.purchaseOrderDetails.filter((item) => item.productID !== action.payload);
    },
    resetPurchaseOrderDetails(state) {
      state.purchaseOrderDetails = [];
    },
    setSelectedProduct(state, action: PayloadAction<ProductListDto | null>) {
      state.selectedProduct = action.payload;
    },
    setDiscountFooterField(state, action: PayloadAction<{ field: keyof PurchaseOrderState["discountFooter"]; value: any }>) {
      state.discountFooter[action.payload.field] = action.payload.value;
    },
  },
});

export const {
  setDepartmentInfo,
  setPurchaseOrderMastData,
  updatePurchaseOrderMastField,
  resetPurchaseOrderState,
  addPurchaseOrderDetail,
  removePurchaseOrderDetail,
  resetPurchaseOrderDetails,
  setSelectedProduct,
  updateAllPurchaseOrderDetails,
  setDiscountFooterField,
} = purchaseOrderState.actions;
export default purchaseOrderState.reducer;
