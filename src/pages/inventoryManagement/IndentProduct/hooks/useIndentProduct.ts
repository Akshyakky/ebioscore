// src/pages/inventoryManagement/IndentProduct/hooks/useIndentProduct.ts

import { useLoading } from "@/hooks/Common/useLoading";
import { DateFilterType, FilterDto } from "@/interfaces/Common/FilterDto";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { useAlert } from "@/providers/AlertProvider";
import { OperationResult } from "@/services/GenericEntityService/GenericEntityService";
import { indentDetailService, indentMastService, indentService } from "@/services/InventoryManagementService/indentProductService/IndentProductService";
import { useCallback, useState } from "react";

export const useIndentProduct = () => {
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const [indentList, setIndentList] = useState<IndentMastDto[]>([]);
  const [indentDetails, setIndentDetails] = useState<IndentDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIndentList = useCallback(
    async (filterDto?: FilterDto) => {
      try {
        setIsLoading(true);
        setError(null);

        const defaultFilter: FilterDto = {
          dateFilter: DateFilterType.ThisMonth,
          pageIndex: 1,
          pageSize: 100,
          startDate: null,
          endDate: null,
          statusFilter: null,
        };
        const filter = filterDto || defaultFilter;
        const response = await indentService.getAllIndents(filter);
        if (response.success && response.data) {
          setIndentList(response.data.items || []);
          return response.data.items || [];
        } else {
          throw new Error(response.errorMessage || "Failed to fetch indent list");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch indent list";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const getIndentsByDepartment = useCallback(
    async (deptId: number, filterDto?: Partial<FilterDto>) => {
      try {
        setIsLoading(true);
        setError(null);
        const defaultFilter: FilterDto = {
          dateFilter: DateFilterType.ThisMonth,
          pageIndex: 1,
          pageSize: 100,
          startDate: null,
          endDate: null,
          statusFilter: null,
          ...filterDto,
        };

        const response = await indentService.getAllIndents(defaultFilter);
        if (response.success && response.data) {
          const departmentIndents = (response.data.items || []).filter((indent) => indent.fromDeptID === deptId || indent.toDeptID === deptId);
          setIndentList(departmentIndents);
          return departmentIndents;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch department indents");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch department indents";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [showAlert]
  );

  const getIndentById = useCallback(
    async (indentId: number): Promise<IndentSaveRequestDto | null> => {
      try {
        setLoading(true);
        const response = await indentService.getIndentById(indentId);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch indent details");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch indent details";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert]
  );

  const saveIndent = useCallback(
    async (indentData: IndentSaveRequestDto): Promise<OperationResult<IndentSaveRequestDto>> => {
      try {
        setLoading(true);
        const response = await indentService.saveIndent(indentData);
        if (response.success) {
          await fetchIndentList();
          return response;
        } else {
          throw new Error(response.errorMessage || "Failed to save indent");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save indent";
        showAlert("Error", errorMessage, "error");
        return {
          success: false,
          errorMessage,
          data: undefined,
        };
      } finally {
        setLoading(false);
      }
    },
    [showAlert, fetchIndentList]
  );

  const deleteIndent = useCallback(
    async (indentId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await indentMastService.delete(indentId);
        if (response.success) {
          setIndentList((prev) => prev.filter((indent) => indent.indentID !== indentId));
          showAlert("Success", "Indent deleted successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete indent");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete indent";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert]
  );

  const updateIndentStatus = useCallback(
    async (indentId: number, status: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const currentIndent = indentList.find((indent) => indent.indentID === indentId);
        if (!currentIndent) {
          throw new Error("Indent not found");
        }
        const updatedIndent: IndentMastDto = {
          ...currentIndent,
          indStatusCode: status,
          indStatus: getStatusDisplayName(status),
        };
        const response = await indentMastService.save(updatedIndent);
        if (response.success) {
          setIndentList((prev) => prev.map((indent) => (indent.indentID === indentId ? { ...indent, indStatusCode: status, indStatus: getStatusDisplayName(status) } : indent)));
          showAlert("Success", "Indent status updated successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to update indent status");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update indent status";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, indentList, setLoading]
  );

  const approveIndent = useCallback(
    async (indentId: number): Promise<boolean> => {
      try {
        setLoading(true);
        const currentIndent = indentList.find((indent) => indent.indentID === indentId);
        if (!currentIndent) {
          throw new Error("Indent not found");
        }
        const updatedIndent: IndentMastDto = {
          ...currentIndent,
          indentApprovedYN: "Y",
          indentAcknowledgement: `Approved on ${new Date().toLocaleDateString()}`,
          indStatusCode: "APPROVED",
          indStatus: "Approved",
        };
        const response = await indentMastService.save(updatedIndent);
        if (response.success) {
          setIndentList((prev) =>
            prev.map((indent) =>
              indent.indentID === indentId
                ? {
                    ...indent,
                    indentApprovedYN: "Y",
                    indStatusCode: "APPROVED",
                    indStatus: "Approved",
                    indentAcknowledgement: updatedIndent.indentAcknowledgement,
                  }
                : indent
            )
          );
          showAlert("Success", "Indent approved successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to approve indent");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to approve indent";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, indentList]
  );

  const rejectIndent = useCallback(
    async (indentId: number, reason?: string): Promise<boolean> => {
      try {
        setLoading(true);
        const currentIndent = indentList.find((indent) => indent.indentID === indentId);
        if (!currentIndent) {
          throw new Error("Indent not found");
        }
        const updatedIndent: IndentMastDto = {
          ...currentIndent,
          indentApprovedYN: "N",
          indentAcknowledgement: `Rejected on ${new Date().toLocaleDateString()}${reason ? `: ${reason}` : ""}`,
          indStatusCode: "REJECTED",
          indStatus: "Rejected",
        };
        const response = await indentMastService.save(updatedIndent);
        if (response.success) {
          setIndentList((prev) =>
            prev.map((indent) =>
              indent.indentID === indentId
                ? {
                    ...indent,
                    indentApprovedYN: "N",
                    indStatusCode: "REJECTED",
                    indStatus: "Rejected",
                    indentAcknowledgement: updatedIndent.indentAcknowledgement,
                  }
                : indent
            )
          );
          showAlert("Success", "Indent rejected successfully", "success");
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to reject indent");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to reject indent";
        showAlert("Error", errorMessage, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showAlert, indentList]
  );

  const getNextIndentCode = useCallback(
    async (prefix: string = "IND", padLength: number = 5): Promise<string | null> => {
      try {
        setLoading(true);
        const response = await indentMastService.getNextCode(prefix, padLength);
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.errorMessage || "Failed to generate indent code");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate indent code";
        showAlert("Error", errorMessage, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showAlert]
  );
  const getIndentDetails = useCallback(
    async (indentId: number): Promise<IndentDetailDto[]> => {
      try {
        setLoading(true);
        const response = await indentDetailService.getAll();
        if (response.success && response.data) {
          const details = response.data.filter((detail) => detail.indentID === indentId);
          setIndentDetails(details);
          return details;
        } else {
          throw new Error(response.errorMessage || "Failed to fetch indent details");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch indent details";
        setError(errorMessage);
        showAlert("Error", errorMessage, "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showAlert]
  );

  const getIndentStatistics = useCallback(
    (deptId?: number) => {
      try {
        const currentList = deptId ? indentList.filter((indent) => indent.fromDeptID === deptId || indent.toDeptID === deptId) : indentList;

        const totalIndents = currentList.length;
        const pendingIndents = currentList.filter((indent) => indent.indStatusCode === "PND").length;
        const approvedIndents = currentList.filter((indent) => indent.indentApprovedYN === "Y").length;
        const completedIndents = currentList.filter((indent) => indent.indStatusCode === "CMP").length;
        const partiallyCompletedIndents = currentList.filter((indent) => indent.indStatusCode === "DIPCD").length;
        const rejectedIndents = currentList.filter((indent) => indent.indStatusCode === "REJECTED").length;
        const autoIndents = currentList.filter((indent) => indent.autoIndentYN === "Y").length;

        return {
          totalIndents,
          pendingIndents,
          approvedIndents,
          completedIndents,
          partiallyCompletedIndents,
          rejectedIndents,
          autoIndents,
          approvalRate: totalIndents > 0 ? Math.round((approvedIndents / totalIndents) * 100) : 0,
          completionRate: totalIndents > 0 ? Math.round((completedIndents / totalIndents) * 100) : 0,
        };
      } catch (error) {
        return {
          totalIndents: 0,
          pendingIndents: 0,
          approvedIndents: 0,
          completedIndents: 0,
          partiallyCompletedIndents: 0,
          rejectedIndents: 0,
          autoIndents: 0,
          approvalRate: 0,
          completionRate: 0,
        };
      }
    },
    [indentList]
  );

  const getStatusDisplayName = useCallback((statusCode: string): string => {
    switch (statusCode) {
      case "PND":
        return "Pending";
      case "CMP":
        return "Completed";
      case "DIPCD":
        return "Partially Completed";
      case "DICMP":
        return "DI Completed";
      case "REJECTED":
        return "Rejected";
      default:
        return statusCode || "Unknown";
    }
  }, []);

  const canEditIndent = useCallback((indent: IndentMastDto): boolean => {
    return indent.indStatusCode !== "CMP" && indent.indStatusCode !== "DICMP";
  }, []);

  const canDeleteIndent = useCallback((indent: IndentMastDto): boolean => {
    return indent.indStatusCode !== "CMP" && indent.indStatusCode !== "DICMP";
  }, []);

  const getIndentStatusColor = useCallback((indent: IndentMastDto): "success" | "info" | "warning" | "error" | "default" => {
    switch (indent.indStatusCode) {
      case "CMP":
        return "success";
      case "DIPCD":
        return "info";
      case "DICMP":
        return "info";
      case "PND":
        return "warning";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  }, []);

  const refreshIndentList = useCallback(
    async (deptId?: number, filterDto?: Partial<FilterDto>) => {
      if (deptId) {
        return await getIndentsByDepartment(deptId, filterDto);
      } else {
        return await fetchIndentList(filterDto as FilterDto);
      }
    },
    [getIndentsByDepartment, fetchIndentList]
  );

  return {
    indentList,
    indentDetails,
    isLoading,
    error,

    fetchIndentList,
    getIndentsByDepartment,
    getIndentById,
    saveIndent,
    deleteIndent,

    updateIndentStatus,
    approveIndent,
    rejectIndent,

    getNextIndentCode,
    getIndentDetails,
    getIndentStatistics,
    getStatusDisplayName,
    refreshIndentList,

    canEditIndent,
    canDeleteIndent,
    getIndentStatusColor,
  };
};
