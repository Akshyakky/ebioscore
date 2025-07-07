// src/services/InventoryManagementService/ProductHistoryService.ts

import { GrnDetailDto, GrnMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { grnDetailService, grnMastService } from "@/services/InventoryManagementService/inventoryManagementService";

export interface ProductHistoryItem {
  grnDetID: number;
  grnID: number;
  productID: number;
  productName: string;
  productCode: string;
  purchaseDate: string;
  department: string;
  supplier: string;
  manufacturer: string;
  units: number;
  package: string;
  unitsPerPackage: number;
  expiryDate: string;
  batchNo: string;
  taxPercentage: number;
  sellingPrice: number;
  taxAmount: number;
  unitPrice: number;
  acceptedQty: number;
  value: number;
  remarks: string;
  grnCode: string;
  invoiceNo: string;
  grnStatus: string;
  approvedDate: string;
  cgstPerValue: number;
  sgstPerValue: number;
  cgstTaxAmt: number;
  sgstTaxAmt: number;
  deptName: string;
  supplierName: string;
  manufacturerName: string;
}

export interface ProductHistoryRequest {
  productID: number;
  startDate?: string;
  endDate?: string;
  departmentID?: number;
  supplierID?: number;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
}

class ProductHistoryService {
  /**
   * Fetches purchase history for a specific product using existing GRN services
   */
  async getProductHistory(productID: number, filters?: Partial<ProductHistoryRequest>): Promise<OperationResult<ProductHistoryItem[]>> {
    try {
      // Use existing grnDetailService to get all GRN details for the product
      const grnDetailsResponse = await grnDetailService.getAll();

      if (!grnDetailsResponse.success || !grnDetailsResponse.data) {
        return {
          success: false,
          data: undefined,
          errorMessage: "Failed to fetch GRN details: " + grnDetailsResponse.errorMessage,
        };
      }

      // Filter GRN details by productID
      const productGrnDetails = grnDetailsResponse.data.filter((detail: GrnDetailDto) => detail.productID === productID && detail.rActiveYN === "Y");

      if (productGrnDetails.length === 0) {
        return {
          success: true,
          data: [],
          errorMessage: undefined,
        };
      }

      // Get unique GRN IDs to fetch master records
      const grnIds = [...new Set(productGrnDetails.map((detail: GrnDetailDto) => detail.grnID))];

      // Fetch GRN master records
      const grnMastersResponse = await grnMastService.getAll();

      if (!grnMastersResponse.success || !grnMastersResponse.data) {
        return {
          success: false,
          data: undefined,
          errorMessage: "Failed to fetch GRN master records: " + grnMastersResponse.errorMessage,
        };
      }

      // Create a map of GRN masters for quick lookup
      const grnMastersMap = new Map<number, GrnMastDto>();
      grnMastersResponse.data.forEach((master: GrnMastDto) => {
        if (grnIds.includes(master.grnID)) {
          grnMastersMap.set(master.grnID, master);
        }
      });

      // Transform data to ProductHistoryItem format
      const historyItems: ProductHistoryItem[] = productGrnDetails.map((detail: GrnDetailDto) => {
        const grnMaster = grnMastersMap.get(detail.grnID);
        const taxPercentage = (detail.cgstPerValue || 0) + (detail.sgstPerValue || 0);
        const taxAmount = (detail.cgstTaxAmt || 0) + (detail.sgstTaxAmt || 0);

        return {
          grnDetID: detail.grnDetID,
          grnID: detail.grnID,
          productID: detail.productID,
          productName: detail.productName || "Unknown Product",
          productCode: detail.productCode || "",
          purchaseDate: grnMaster?.grnDate || "",
          department: grnMaster?.deptName || "",
          supplier: grnMaster?.supplrName || "",
          manufacturer: detail.manufacturerName || detail.mfName || "-",
          units: detail.recvdQty || 0,
          package: detail.pkgName || "",
          unitsPerPackage: detail.pUnitsPerPack || 1,
          expiryDate: detail.expiryDate || "",
          batchNo: detail.batchNo || "",
          taxPercentage: taxPercentage,
          sellingPrice: detail.sellUnitPrice || detail.unitPrice || 0,
          taxAmount: taxAmount,
          unitPrice: detail.unitPrice || 0,
          acceptedQty: detail.acceptQty || detail.recvdQty || 0,
          value: detail.productValue || 0,
          remarks: detail.rNotes || "",
          grnCode: grnMaster?.grnCode || "",
          invoiceNo: grnMaster?.invoiceNo || "",
          grnStatus: grnMaster?.grnStatus || "",
          approvedDate: grnMaster?.grnApprovedYN === "Y" ? grnMaster.grnDate || "" : "",
          cgstPerValue: detail.cgstPerValue || 0,
          sgstPerValue: detail.sgstPerValue || 0,
          cgstTaxAmt: detail.cgstTaxAmt || 0,
          sgstTaxAmt: detail.sgstTaxAmt || 0,
          deptName: grnMaster?.deptName || "",
          supplierName: grnMaster?.supplrName || "",
          manufacturerName: detail.manufacturerName || detail.mfName || "",
        };
      });

      // Apply filters if provided
      let filteredItems = historyItems;

      if (filters?.startDate) {
        const startDate = new Date(filters.startDate);
        filteredItems = filteredItems.filter((item) => new Date(item.purchaseDate) >= startDate);
      }

      if (filters?.endDate) {
        const endDate = new Date(filters.endDate);
        filteredItems = filteredItems.filter((item) => new Date(item.purchaseDate) <= endDate);
      }

      if (filters?.departmentID) {
        filteredItems = filteredItems.filter((item) => {
          const grnMaster = grnMastersMap.get(item.grnID);
          return grnMaster?.deptID === filters.departmentID;
        });
      }

      if (filters?.supplierID) {
        filteredItems = filteredItems.filter((item) => {
          const grnMaster = grnMastersMap.get(item.grnID);
          return grnMaster?.supplrID === filters.supplierID;
        });
      }

      // Apply sorting
      const sortBy = filters?.sortBy || "purchaseDate";
      const sortAscending = filters?.sortAscending ?? false;

      filteredItems.sort((a, b) => {
        let aValue: any = (a as any)[sortBy];
        let bValue: any = (b as any)[sortBy];

        // Handle date sorting
        if (sortBy === "purchaseDate" || sortBy === "expiryDate" || sortBy === "approvedDate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sortAscending ? -1 : 1;
        if (aValue > bValue) return sortAscending ? 1 : -1;
        return 0;
      });

      // Apply pagination if provided
      if (filters?.pageIndex !== undefined && filters?.pageSize !== undefined) {
        const startIndex = filters.pageIndex * filters.pageSize;
        const endIndex = startIndex + filters.pageSize;
        filteredItems = filteredItems.slice(startIndex, endIndex);
      }

      return {
        success: true,
        data: filteredItems,
        errorMessage: undefined,
      };
    } catch (error) {
      console.error("Error fetching product history:", error);
      return {
        success: false,
        data: undefined,
        errorMessage: error instanceof Error ? error.message : "Failed to fetch product history",
      };
    }
  }

  /**
   * Fetches detailed purchase history with GRN details
   */
  async getDetailedProductHistory(productID: number): Promise<OperationResult<GrnDetailDto[]>> {
    try {
      const grnDetailsResponse = await grnDetailService.getAll();

      if (!grnDetailsResponse.success || !grnDetailsResponse.data) {
        return {
          success: false,
          data: undefined,
          errorMessage: "Failed to fetch GRN details: " + grnDetailsResponse.errorMessage,
        };
      }

      const productGrnDetails = grnDetailsResponse.data.filter((detail: GrnDetailDto) => detail.productID === productID && detail.rActiveYN === "Y");

      return {
        success: true,
        data: productGrnDetails,
        errorMessage: undefined,
      };
    } catch (error) {
      console.error("Error fetching detailed product history:", error);
      return {
        success: false,
        data: undefined,
        errorMessage: error instanceof Error ? error.message : "Failed to fetch detailed product history",
      };
    }
  }

  /**
   * Exports product history to various formats
   */
  async exportProductHistory(productID: number, format: "excel" | "csv" | "pdf" = "excel", filters?: Partial<ProductHistoryRequest>): Promise<OperationResult<Blob>> {
    try {
      const historyResult = await this.getProductHistory(productID, filters);

      if (!historyResult.success || !historyResult.data) {
        return {
          success: false,
          data: undefined,
          errorMessage: "Failed to fetch history data for export: " + historyResult.errorMessage,
        };
      }

      // For now, convert to CSV format as example
      const csvContent = this.convertToCSV(historyResult.data);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      return {
        success: true,
        data: blob,
        errorMessage: undefined,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        errorMessage: error instanceof Error ? error.message : "Failed to export product history",
      };
    }
  }

  /**
   * Gets product history statistics
   */
  async getProductHistoryStats(productID: number): Promise<
    OperationResult<{
      totalPurchases: number;
      totalQuantity: number;
      totalValue: number;
      averageUnitPrice: number;
      lastPurchaseDate: string;
      uniqueSuppliers: number;
      uniqueDepartments: number;
    }>
  > {
    try {
      const historyResult = await this.getProductHistory(productID);

      if (!historyResult.success || !historyResult.data) {
        throw new Error("Failed to fetch history data for statistics");
      }

      const history = historyResult.data;
      const totalPurchases = history.length;
      const totalQuantity = history.reduce((sum, item) => sum + item.acceptedQty, 0);
      const totalValue = history.reduce((sum, item) => sum + item.value, 0);
      const averageUnitPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
      const lastPurchaseDate = history.length > 0 ? history.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())[0].purchaseDate : "";
      const uniqueSuppliers = new Set(history.map((item) => item.supplier)).size;
      const uniqueDepartments = new Set(history.map((item) => item.department)).size;

      return {
        success: true,
        data: {
          totalPurchases,
          totalQuantity,
          totalValue,
          averageUnitPrice,
          lastPurchaseDate,
          uniqueSuppliers,
          uniqueDepartments,
        },
        errorMessage: undefined,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        errorMessage: error instanceof Error ? error.message : "Failed to calculate product history statistics",
      };
    }
  }

  /**
   * Converts history data to CSV format
   */
  private convertToCSV(data: ProductHistoryItem[]): string {
    const headers = [
      "Purchase Date",
      "Department",
      "Supplier",
      "Manufacturer",
      "Units",
      "Package",
      "Units/Package",
      "Expiry Date",
      "Batch No",
      "Tax%",
      "Selling Price",
      "Tax Amount",
      "Unit Price",
      "Accepted Qty",
      "Value",
      "Remarks",
    ];

    const csvRows = [headers.join(",")];

    data.forEach((item) => {
      const row = [
        item.purchaseDate,
        `"${item.department}"`,
        `"${item.supplier}"`,
        `"${item.manufacturer}"`,
        item.units.toString(),
        `"${item.package}"`,
        item.unitsPerPackage.toString(),
        item.expiryDate,
        `"${item.batchNo}"`,
        item.taxPercentage.toString(),
        item.sellingPrice.toString(),
        item.taxAmount.toString(),
        item.unitPrice.toString(),
        item.acceptedQty.toString(),
        item.value.toString(),
        `"${item.remarks}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }
}

export const productHistoryService = new ProductHistoryService();
