// src/pages/inventoryManagement/PurchaseOrder/hooks/usePurchaseOrder.ts

import { useLoading } from "@/hooks/Common/useLoading";
import { FilterDto } from "@/interfaces/Common/FilterDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { purchaseOrderMastService } from "@/services/InventoryManagementService/inventoryManagementService";
import { useCallback, useState } from "react";

export const usePurchaseOrder = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [purchaseOrderList, setPurchaseOrderList] = useState<PurchaseOrderMastDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all purchase orders
   */
  const fetchPurchaseOrderList = useCallback(
    async (filterDto?: FilterDto) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await purchaseOrderMastService.getAll();

        if (response.success && response.data) {
          setPurchaseOrderList(response.data);
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch purchase order list");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch purchase order list";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  /**
   * Get purchase orders by department
   */
  const getPurchaseOrdersByDepartment = useCallback(
    async (deptId: number, filterDto?: Partial<FilterDto>) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await purchaseOrderMastService.getAll();

        if (response.success && response.data) {
          // Filter by department
          const departmentPOs = response.data.filter((po) => po.fromDeptID === deptId);

          setPurchaseOrderList(departmentPOs);
          return departmentPOs;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch department purchase orders");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch department purchase orders";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  /**
   * Get purchase order by ID with details
   */
  const getPurchaseOrderById = useCallback(
    async (poId: number): Promise<purchaseOrderSaveDto | null> => {
      try {
        setLoading(true);

        const response = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(poId);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch purchase order details");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch purchase order details";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Save purchase order (create or update)
   */
  const savePurchaseOrder = useCallback(
    async (purchaseOrderData: purchaseOrderSaveDto): Promise<OperationResult<purchaseOrderSaveDto>> => {
      //   try {
      //     setLoading(true);
      //     const response = await purchaseOrderMastServices.save(purchaseOrderData);
      //     if (response.success) {
      //       await fetchPurchaseOrderList();
      //       return response;
      //     } else {
      //       throw new Error(response.errorMessage || "Failed to save purchase order");
      //     }
      //   } catch (error) {
      //     const errorMessage = error instanceof Error ? error.message : "Failed to save purchase order";
      //     showAlert("Error", errorMessage, "error");
      //     return {
      //       success: false,
      //       errorMessage,
      //       data: undefined,
      //     };
      //   } finally {
      //     setLoading(false);
      //   }

      return {
        success: false,
        errorMessage: "",
        data: undefined,
      };
    },
    [showAlert, fetchPurchaseOrderList, setLoading]
  );

  /**
   * Delete purchase order
   */
  const deletePurchaseOrder = useCallback(
    async (poId: number): Promise<boolean> => {
      try {
        setLoading(true);

        const response = await purchaseOrderMastService.delete(poId);

        if (response.success) {
          setPurchaseOrderList((prev) => prev.filter((po) => po.pOID !== poId));
          showAlert("Success", "Purchase order deleted successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete purchase order");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete purchase order";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Generate purchase order code
   */
  const generatePurchaseOrderCode = useCallback(
    async (departmentId: number): Promise<string | null> => {
      try {
        setLoading(true);

        const response = await purchaseOrderMastServices.getPOCode(departmentId);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to generate purchase order code");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate purchase order code";
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Get product details for purchase order
   */
  const getProductDetailsForPO = useCallback(
    async (productCode: string): Promise<PurchaseOrderDetailDto | null> => {
      try {
        setLoading(true);

        const response = await purchaseOrderMastServices.getPOProductDetails(productCode, 0);

        if (response.success && response.data) {
          return response.data as PurchaseOrderDetailDto;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch product details");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch product details";
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, setLoading]
  );

  /**
   * Update purchase order status
   */
  const updatePurchaseOrderStatus = useCallback(
    async (poId: number, status: string): Promise<boolean> => {
      try {
        setLoading(true);

        const currentPO = purchaseOrderList.find((po) => po.pOID === poId);
        if (!currentPO) {
          throw new Error("Purchase order not found");
        }

        const updatedPO: PurchaseOrderMastDto = {
          ...currentPO,
          pOStatusCode: status,
          pOStatus: status.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        };

        const response = await purchaseOrderMastService.save(updatedPO);

        if (response.success) {
          setPurchaseOrderList((prev) => prev.map((po) => (po.pOID === poId ? { ...po, pOStatusCode: status, pOStatus: updatedPO.pOStatus } : po)));

          showAlert("Success", "Purchase order status updated successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to update purchase order status");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update purchase order status";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, purchaseOrderList, setLoading]
  );

  /**
   * Approve purchase order
   */
  const approvePurchaseOrder = useCallback(
    async (poId: number): Promise<boolean> => {
      try {
        setLoading(true);

        const currentPO = purchaseOrderList.find((po) => po.pOID === poId);
        if (!currentPO) {
          throw new Error("Purchase order not found");
        }

        const updatedPO: PurchaseOrderMastDto = {
          ...currentPO,
          pOApprovedYN: "Y",
          pOApprovedBy: "Current User", // Should get from auth context
          pOStatusCode: "APPROVED",
          pOStatus: "Approved",
        };

        const response = await purchaseOrderMastService.save(updatedPO);

        if (response.success) {
          setPurchaseOrderList((prev) =>
            prev.map((po) =>
              po.pOID === poId
                ? {
                    ...po,
                    pOApprovedYN: "Y",
                    pOStatusCode: "APPROVED",
                    pOStatus: "Approved",
                  }
                : po
            )
          );

          showAlert("Success", "Purchase order approved successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to approve purchase order");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to approve purchase order";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, purchaseOrderList, setLoading]
  );

  /**
   * Get purchase order statistics
   */
  const getPurchaseOrderStatistics = useCallback(
    async (deptId?: number) => {
      try {
        const currentList = deptId ? purchaseOrderList.filter((po) => po.fromDeptID === deptId) : purchaseOrderList;

        const totalOrders = currentList.length;
        const pendingOrders = currentList.filter((po) => po.pOStatusCode === "PENDING").length;
        const approvedOrders = currentList.filter((po) => po.pOApprovedYN === "Y").length;
        const completedOrders = currentList.filter((po) => po.pOStatusCode === "COMPLETED").length;
        const rejectedOrders = currentList.filter((po) => po.pOStatusCode === "REJECTED").length;

        const totalAmount = currentList.reduce((sum, po) => sum + (po.totalAmt || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

        return {
          totalOrders,
          pendingOrders,
          approvedOrders,
          completedOrders,
          rejectedOrders,
          totalAmount,
          avgOrderValue,
          approvalRate: totalOrders > 0 ? Math.round((approvedOrders / totalOrders) * 100) : 0,
          completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        };
      } catch (error) {
        console.error("Failed to calculate purchase order statistics:", error);
        return {
          totalOrders: 0,
          pendingOrders: 0,
          approvedOrders: 0,
          completedOrders: 0,
          rejectedOrders: 0,
          totalAmount: 0,
          avgOrderValue: 0,
          approvalRate: 0,
          completionRate: 0,
        };
      }
    },
    [purchaseOrderList]
  );

  /**
   * Check if purchase order can be edited
   */
  const canEditPurchaseOrder = useCallback((po: PurchaseOrderMastDto): boolean => {
    return po.pOApprovedYN !== "Y" && po.pOStatusCode !== "COMPLETED" && po.pOStatusCode !== "REJECTED";
  }, []);

  /**
   * Check if purchase order can be deleted
   */
  const canDeletePurchaseOrder = useCallback((po: PurchaseOrderMastDto): boolean => {
    return po.pOApprovedYN !== "Y" && po.pOStatusCode !== "COMPLETED";
  }, []);

  return {
    // State
    purchaseOrderList,
    isLoading,
    error,

    // Core CRUD operations
    fetchPurchaseOrderList,
    getPurchaseOrdersByDepartment,
    getPurchaseOrderById,
    savePurchaseOrder,
    deletePurchaseOrder,

    // Utility functions
    generatePurchaseOrderCode,
    getProductDetailsForPO,

    // Status management
    updatePurchaseOrderStatus,
    approvePurchaseOrder,

    // Statistics and helpers
    getPurchaseOrderStatistics,
    canEditPurchaseOrder,
    canDeletePurchaseOrder,
  };
};
