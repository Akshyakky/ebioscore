import { GrnSearchRequest } from "@/interfaces/InventoryManagement/GRNDto";
import { GrnProductOption } from "@/interfaces/InventoryManagement/Product/GrnProductSearch.interface";
import { grnService } from "@/services/InventoryManagementService/GRNService/GRNService";
import { debounce } from "@/utils/Common/debounceUtils";
import { useCallback, useEffect, useState } from "react";

interface UseGrnProductSearchProps {
  departmentId?: number;
  debounceTimeMs?: number;
  minSearchLength?: number;
  approvedGrnsOnly?: boolean;
  availableStockOnly?: boolean;
}

interface UseGrnProductSearchResult {
  inputValue: string;
  setInputValue: (value: string) => void;
  options: GrnProductOption[];
  isLoading: boolean;
  selectedProduct: GrnProductOption | null;
  setSelectedProduct: (product: GrnProductOption | null) => void;
  clearSearch: () => void;
  error: string | null;
}

export const useGrnProductSearch = ({
  departmentId,
  debounceTimeMs = 500,
  minSearchLength = 2,
  approvedGrnsOnly = true,
  availableStockOnly = true,
}: UseGrnProductSearchProps = {}): UseGrnProductSearchResult => {
  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<GrnProductOption[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<GrnProductOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchGrnProducts = useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length < minSearchLength) {
        setOptions([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Search for GRNs based on department and other criteria
        const grnSearchRequest: GrnSearchRequest = {
          pageIndex: 1,
          pageSize: 1000,
          departmentID: departmentId,
          approvedStatus: approvedGrnsOnly ? "Y" : undefined,
          sortBy: "grnDate",
          sortAscending: false,
        };

        const grnResult = await grnService.grnSearch(grnSearchRequest);

        if (!grnResult.success || !grnResult.data?.items) {
          setOptions([]);
          setError("No GRN records found");
          return;
        }

        // Collect all products from GRN details
        const grnProductOptions: GrnProductOption[] = [];
        const processedProducts = new Set<string>(); // To avoid duplicates

        for (const grn of grnResult.data.items) {
          try {
            // Get GRN with details
            const grnWithDetails = await grnService.getGrnWithDetailsById(grn.grnID);

            if (grnWithDetails.success && grnWithDetails.data?.grnDetailDto) {
              const grnMast = grnWithDetails.data.grnMastDto;

              for (const detail of grnWithDetails.data.grnDetailDto) {
                // Filter by search term
                const matchesSearch =
                  detail.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  detail.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  detail.batchNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  detail.manufacturerName?.toLowerCase().includes(searchTerm.toLowerCase());

                // Filter by available stock if required
                const hasStock = !availableStockOnly || (detail.acceptQty && detail.acceptQty > 0);

                if (matchesSearch && hasStock && detail.productID) {
                  // Create unique key to avoid duplicates
                  const uniqueKey = `${detail.productID}_${detail.batchNo || "nobatch"}_${grn.grnID}`;

                  if (!processedProducts.has(uniqueKey)) {
                    processedProducts.add(uniqueKey);

                    // Map essential fields from GRN detail and master
                    const grnProductOption: GrnProductOption = {
                      productID: detail.productID,
                      productCode: detail.productCode || "",
                      productName: detail.productName || "",
                      productCategory: detail.catDesc || "",
                      manufacturerName: detail.manufacturerName || detail.mfName || "",
                      batchNo: detail.batchNo || "",
                      expiryDate: detail.expiryDate ? new Date(detail.expiryDate) : undefined,
                      availableQty: detail.acceptQty || 0,
                      unitPrice: detail.unitPrice || detail.defaultPrice || 0,
                      grnDetID: detail.grnDetID,
                      grnID: grn.grnID,
                      grnCode: grnMast.grnCode || "",
                      grnDate: grnMast.grnDate ? new Date(grnMast.grnDate) : undefined,
                      deptID: grnMast.deptID,
                      deptName: grnMast.deptName || "",
                      supplierName: grnMast.supplrName || "",
                      rActiveYN: detail.rActiveYN || "Y",
                      hsnCode: detail.hsnCode || "",

                      // Critical fields for display in the Stock Return grid
                      recvdQty: detail.recvdQty || 0,
                      acceptQty: detail.acceptQty || 0,
                      invoiceNo: grnMast.invoiceNo || "",
                      invDate: grnMast.invDate || "",
                      tax: detail.tax || 0,
                      sellUnitPrice: detail.sellUnitPrice || 0,
                      freeItems: detail.freeItems || 0,
                      mfID: detail.mfID || 0,
                      mfName: detail.mfName || "",
                      // manufacturerID: detail.manufacturerID || 0,
                      // manufacturerCode: detail.manufacturerCode || "",
                      mrp: detail.mrp || 0,
                      supplierID: grnMast.supplrID || 0,
                      supplrID: grnMast.supplrID || 0,
                      supplrName: grnMast.supplrName || "",
                    };

                    grnProductOptions.push(grnProductOption);
                  }
                }
              }
            }
          } catch (detailError) {
            console.warn(`Failed to process GRN ${grn.grnID}:`, detailError);
          }
        }

        // Sort results by product name and then by expiry date
        grnProductOptions.sort((a, b) => {
          const nameCompare = (a.productName || "").localeCompare(b.productName || "");
          if (nameCompare !== 0) return nameCompare;

          // If same product, sort by expiry date (earliest first)
          if (a.expiryDate && b.expiryDate) {
            return a.expiryDate.getTime() - b.expiryDate.getTime();
          }

          return 0;
        });

        setOptions(grnProductOptions);

        if (grnProductOptions.length === 0) {
          setError("No matching products found in GRN records");
        }
      } catch (error) {
        console.error("Error searching GRN products:", error);
        setError("Failed to search GRN products. Please try again.");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [departmentId, minSearchLength, approvedGrnsOnly, availableStockOnly]
  );

  const debouncedSearch = useCallback(debounce(searchGrnProducts, debounceTimeMs), [searchGrnProducts, debounceTimeMs]);

  useEffect(() => {
    debouncedSearch(inputValue);

    return () => {
      debouncedSearch.cancel();
    };
  }, [inputValue, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setSelectedProduct(null);
    setInputValue("");
    setOptions([]);
    setError(null);
  }, []);

  return {
    inputValue,
    setInputValue,
    options,
    isLoading,
    selectedProduct,
    setSelectedProduct,
    clearSearch,
    error,
  };
};
