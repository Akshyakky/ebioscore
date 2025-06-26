import CustomButton from "@/components/Button/CustomButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Grid, Typography } from "@mui/material";
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
}

interface IssueDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IssueDepartmentData) => void;
  selectedProduct?: GRNDetailDto | null;
  editData?: IssueDepartmentData | null;
  title?: string;
}

const IssueDepartmentDialog: React.FC<IssueDepartmentDialogProps> = ({ open, onClose, onSubmit, selectedProduct, editData, title = "New Issue Department" }) => {
  const { department } = useDropdownValues(["department"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const issueDepartmentSchema = useMemo(
    () =>
      z.object({
        deptID: z.number().min(1, "Department is required"),
        deptName: z.string().min(1, "Department name is required"),
        quantity: z.coerce
          .number({ invalid_type_error: "Please enter a valid quantity." })
          .positive("Quantity must be greater than 0")
          .max(availableQuantity, `Cannot issue more than the available stock of ${availableQuantity}`),
        productName: z.string().min(1, "Product name is required"),
        productID: z.number().min(1, "Product ID is required"),
      }),
    [availableQuantity]
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
    },
  });
  const watchedDeptID = watch("deptID");
  useEffect(() => {
    if (open) {
      const totalAvailable = selectedProduct?.recvdQty || selectedProduct?.recvdPack || 0;
      setAvailableQuantity(totalAvailable);

      if (editData) {
        reset({
          deptID: editData.deptID,
          deptName: editData.deptName,
          quantity: editData.quantity,
          productName: editData.productName,
          productID: editData.productID,
        });
      } else if (selectedProduct) {
        reset({
          deptID: 0,
          deptName: "",
          quantity: undefined,
          productName: selectedProduct.productName || "",
          productID: selectedProduct.productID || 0,
        });
      }
    }
  }, [open, selectedProduct, editData, reset]);

  useEffect(() => {
    if (watchedDeptID && department) {
      const selectedDept = department.find((dept) => Number(dept.value) === Number(watchedDeptID));
      if (selectedDept) {
        setValue("deptName", selectedDept.label);
      }
    }
  }, [watchedDeptID, department, setValue]);

  const handleDepartmentChange = (value: any) => {
    const selectedDept = department?.find((dept) => dept.value === value.toString());
    if (selectedDept) {
      setValue("deptID", Number(selectedDept.value));
      setValue("deptName", selectedDept.label);
    }
  };

  const onFormSubmit = async (data: IssueDepartmentFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: IssueDepartmentData = {
        id: editData?.id || `issue-${Date.now()}`,
        deptID: data.deptID,
        deptName: data.deptName,
        quantity: data.quantity,
        productName: data.productName,
        productID: data.productID,
        grnDetailId: selectedProduct?.grnDetID || editData?.grnDetailId,
      };

      onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Error submitting issue department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const departmentOptions =
    department?.map((dept) => ({
      value: dept.value,
      label: dept.label,
    })) || [];

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
                disabled={isSubmitting}
                inputProps={{
                  min: 0,
                  max: availableQuantity,
                  step: 0.01,
                }}
                helperText={`Enter the quantity to be issued to the department. (Available: ${availableQuantity})`}
              />
            </Grid>
          </Grid>
        </Box>
      </form>
    </GenericDialog>
  );
};

export default IssueDepartmentDialog;
