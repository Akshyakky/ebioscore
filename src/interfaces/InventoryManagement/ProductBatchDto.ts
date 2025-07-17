export interface ProductBatchDto {
  productID: number;
  batchNo: string;
  expiryDate: Date | string;
  grnDetID: number;
  deptID: number;
  deptName: string;
  sellingPrice: number;
  unitPrice: number;
  invoiceNo: string;
  productQOH: number;
}
