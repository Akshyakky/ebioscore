// src/pages/inventoryManagement/commonPage/product/ProductSearchProps.ts

import { ProductOption, ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";

export interface ProductSearchProps {
  /**
   * Callback function called when a product is selected
   */
  onProductSelect: (product: ProductSearchResult | null) => void;

  /**
   * External trigger to clear the search (increment to trigger)
   */
  clearTrigger?: number;

  /**
   * Minimum length of search term before search is performed
   * @default 2
   */
  minSearchLength?: number;

  /**
   * Custom label for the search field
   * @default "Search Product"
   */
  label?: string;

  /**
   * Custom placeholder text
   * @default "Enter product name or code"
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
  initialSelection?: ProductOption | null;

  /**
   * Additional CSS class names
   */
  className: string;

  setInputValue?: (value: string) => void; // To clear the input value

  setSelectedProduct?: (product: ProductOption | null) => void; // To clear the selected product
}
