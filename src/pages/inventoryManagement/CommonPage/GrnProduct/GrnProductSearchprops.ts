// src/pages/inventoryManagement/commonPage/product/GrnProductSearchProps.ts

import { GrnProductOption, GrnProductSearchResult } from "@/interfaces/InventoryManagement/Product/GrnProductSearch.interface";

export interface GrnProductSearchProps {
  /**
   * Callback function called when a GRN product is selected
   */
  onProductSelect: (product: GrnProductSearchResult | null) => void;

  /**
   * External trigger to clear the search (increment to trigger)
   */
  clearTrigger?: number;

  /**
   * Department ID to filter GRN products by department
   */
  departmentId?: number;

  /**
   * Include only approved GRNs
   * @default true
   */
  approvedGrnsOnly?: boolean;

  /**
   * Include only products with available quantity > 0
   * @default true
   */
  availableStockOnly?: boolean;

  /**
   * Minimum length of search term before search is performed
   * @default 2
   */
  minSearchLength?: number;

  /**
   * Custom label for the search field
   * @default "Search GRN Product"
   */
  label?: string;

  /**
   * Custom placeholder text
   * @default "Enter product name, code, or batch number"
   */
  placeholder?: string;

  /**
   * Whether the component should be disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Initial product selection (optional)
   */
  initialSelection?: GrnProductOption | null;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Show additional GRN information in options
   * @default true
   */
  showGrnInfo?: boolean;

  /**
   * Show batch and expiry information
   * @default true
   */
  showBatchInfo?: boolean;

  /**
   * External setter for input value (for clearing)
   */
  setInputValue?: (value: string) => void;

  /**
   * External setter for selected product (for clearing)
   */
  setSelectedProduct?: (product: GrnProductOption | null) => void;
}
