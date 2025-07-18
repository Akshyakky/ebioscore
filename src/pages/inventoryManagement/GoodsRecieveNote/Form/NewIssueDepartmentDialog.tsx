// Updated IssueDepartmentDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface IssueDepartmentData {
  id?: string;
  deptID: number;
  deptName: string;
  quantity: number;
  productName: string;
  productID: number;
  grnDetailId?: string | number;
  indentNo?: string;
  remarks?: string;
  createIssual?: boolean;
  maxAvailableQty?: number;
  unitName?: string;
  batchNo?: string;
}

interface IssueDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IssueDepartmentData) => void;
  selectedProduct?: GrnDetailDto | null;
  editData?: IssueDepartmentData | null;
  title?: string;
  defaultIndentNo?: string;
  defaultRemarks?: string;
  departments: { value: string; label: string }[];
  existingIssueDepartments?: IssueDepartmentData[];
  showAlert?: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
}

const IssueDepartmentDialog: React.FC<IssueDepartmentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  selectedProduct,
  editData,
  title = "New Issue Department",
  defaultIndentNo = "",
  defaultRemarks = "",
  departments,
  existingIssueDepartments = [],
  showAlert,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [remainingQuantity, setRemainingQuantity] = useState(0);

  // Calculate remaining quantity after existing issues
  useEffect(() => {
    if (selectedProduct && existingIssueDepartments) {
      const totalAvailable = selectedProduct.acceptQty || selectedProduct.recvdQty || 0;
      setAvailableQuantity(totalAvailable);

      // Calculate total quantity already issued to this product (excluding current edit)
      const currentProductIssues = existingIssueDepartments.filter((dept) => dept.productID === selectedProduct.productID && dept.id !== editData?.id);
      const totalIssued = currentProductIssues.reduce((sum, dept) => sum + dept.quantity, 0);
      const remaining = totalAvailable - totalIssued;
      setRemainingQuantity(Math.max(0, remaining));
    }
  }, [selectedProduct, existingIssueDepartments, editData?.id]);

  const issueDepartmentSchema = useMemo(
    () =>
      z.object({
        deptID: z.number().min(1, "Department is required"),
        deptName: z.string().min(1, "Department name is required"),
        quantity: z.coerce
          .number({ invalid_type_error: "Please enter a valid quantity." })
          .positive("Quantity must be greater than 0")
          .max(remainingQuantity, `Cannot issue more than the remaining stock of ${remainingQuantity}`)
          .refine(
            (val) => {
              // Additional validation for remaining quantity
              return val <= remainingQuantity;
            },
            {
              message: `Quantity exceeds remaining available stock of ${remainingQuantity}`,
            }
          ),
        productName: z.string().min(1, "Product name is required"),
        productID: z.number().min(1, "Product ID is required"),
        indentNo: z.string().optional(),
        remarks: z.string().optional(),
        createIssual: z.boolean().default(true),
      }),
    [remainingQuantity]
  );

  type IssueDepartmentFormData = z.infer<typeof issueDepartmentSchema>;

  const { control, handleSubmit, reset, setValue, watch } = useForm<IssueDepartmentFormData>({
    resolver: zodResolver(issueDepartmentSchema),
    defaultValues: {
      deptID: 0,
      deptName: "",
      quantity: undefined,
      productName: "",
      productID: 0,
      indentNo: defaultIndentNo,
      remarks: defaultRemarks,
      createIssual: true,
    },
  });

  const watchedDeptID = watch("deptID");
  const watchedCreateIssual = watch("createIssual");

  useEffect(() => {
    if (open) {
      if (editData) {
        // Editing existing issue department
        reset({
          deptID: editData.deptID,
          deptName: editData.deptName,
          quantity: editData.quantity,
          productName: editData.productName,
          productID: editData.productID,
          indentNo: editData.indentNo || defaultIndentNo,
          remarks: editData.remarks || defaultRemarks,
          createIssual: editData.createIssual !== undefined ? editData.createIssual : true,
        });
      } else if (selectedProduct) {
        // Creating new issue department
        reset({
          deptID: 0,
          deptName: "",
          quantity: undefined,
          productName: selectedProduct.productName || "",
          productID: selectedProduct.productID || 0,
          indentNo: defaultIndentNo,
          remarks: defaultRemarks,
          createIssual: true,
        });
      }
    }
  }, [open, selectedProduct, editData, reset, defaultIndentNo, defaultRemarks]);

  // Update department name when department is selected
  useEffect(() => {
    if (watchedDeptID && departments && departments.length > 0) {
      const selectedDept = departments.find((dept) => Number(dept.value) === Number(watchedDeptID));
      if (selectedDept) {
        setValue("deptName", selectedDept.label);
      }
    }
  }, [watchedDeptID, departments, setValue]);

  const departmentOptions = useMemo(
    () =>
      departments?.map((dept) => ({
        value: dept.value,
        label: dept.label,
      })) || [],
    [departments]
  );

  const handleDepartmentChange = (value: any) => {
    const selectedDept = departmentOptions.find((dept) => dept.value === value.toString());
    if (selectedDept) {
      // Check if this department is already selected for this product (excluding current edit)
      const isDepartmentAlreadySelected = existingIssueDepartments.some(
        (dept) => dept.productID === selectedProduct?.productID && dept.deptID === Number(selectedDept.value) && dept.id !== editData?.id
      );

      if (isDepartmentAlreadySelected) {
        showAlert && showAlert("Warning", "This department is already selected for this product", "warning");
        return;
      }

      setValue("deptID", Number(selectedDept.value));
      setValue("deptName", selectedDept.label);
    }
  };

  const onFormSubmit = async (data: IssueDepartmentFormData) => {
    setIsSubmitting(true);
    try {
      // Additional validation
      if (data.quantity > remainingQuantity) {
        throw new Error(`Quantity ${data.quantity} exceeds remaining stock of ${remainingQuantity}`);
      }

      // Check for duplicate department selection
      const isDepartmentAlreadySelected = existingIssueDepartments.some((dept) => dept.productID === data.productID && dept.deptID === data.deptID && dept.id !== editData?.id);

      if (isDepartmentAlreadySelected) {
        throw new Error("This department is already selected for this product");
      }

      const submitData: IssueDepartmentData = {
        id: editData?.id || `issue-${data.productID}-${data.deptID}-${Date.now()}`,
        deptID: data.deptID,
        deptName: data.deptName,
        quantity: data.quantity,
        productName: data.productName,
        productID: data.productID,
        grnDetailId: selectedProduct?.grnDetID || editData?.grnDetailId,
        indentNo: data.indentNo || "",
        remarks: data.remarks || "",
        createIssual: data.createIssual,
        maxAvailableQty: availableQuantity,
        unitName: selectedProduct?.pUnitName || "",
        batchNo: selectedProduct?.batchNo || "",
      };

      onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Error submitting issue department:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert && showAlert("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Close" onClick={handleClose} disabled={isSubmitting} />
      <CustomButton variant="contained" text={editData ? "Update" : "Ok"} color="primary" disabled={isSubmitting} onClick={handleSubmit(onFormSubmit)} />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="sm"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} id="issue-department-form">
        <Box>
          {selectedProduct && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Selected Product:</strong> {selectedProduct.productName}
                <br />
                <strong>Total Quantity Available:</strong> {availableQuantity}
                <br />
                <strong>Remaining for Issue:</strong> {remainingQuantity}
                {remainingQuantity !== availableQuantity && (
                  <>
                    <br />
                    <strong>Already Issued:</strong> {availableQuantity - remainingQuantity}
                  </>
                )}
              </Typography>
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <EnhancedFormField name="productName" control={control} type="text" label="Product Name" disabled fullWidth helperText="Product selected from GRN details" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                name="deptID"
                control={control}
                type="select"
                label="Select Department"
                required
                fullWidth
                options={departmentOptions}
                onChange={handleDepartmentChange}
                disabled={isSubmitting}
                placeholder="Choose a department"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                name="quantity"
                control={control}
                type="number"
                label="Quantity to Issue"
                required
                fullWidth
                disabled={isSubmitting || !watchedCreateIssual}
                inputProps={{
                  min: 0,
                  max: remainingQuantity,
                  step: 0.01,
                }}
                helperText={`Enter the quantity to be issued to the department. (Remaining: ${remainingQuantity})`}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                name="indentNo"
                control={control}
                type="text"
                label="Indent Number"
                fullWidth
                disabled={isSubmitting || !watchedCreateIssual}
                helperText="Reference number for this issuance (optional)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <EnhancedFormField
                name="remarks"
                control={control}
                type="textarea"
                label="Remarks"
                fullWidth
                disabled={isSubmitting || !watchedCreateIssual}
                helperText="Additional notes about this issuance (optional)"
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox checked={watchedCreateIssual} onChange={(e) => setValue("createIssual", e.target.checked)} color="primary" />}
                label="Create product issual on GRN approval"
              />
            </Grid>
          </Grid>
        </Box>
      </form>
    </GenericDialog>
  );
};

export default IssueDepartmentDialog;
