import { BillServicesDto } from "@/interfaces/Billing/BillingDto";
import { useCallback } from "react";

export const useBilling = () => {
  // Calculate discount amount for a service
  const calculateServiceDiscountAmount = useCallback((service: Partial<BillServicesDto>) => {
    return (service.dValDisc || 0) + (service.hValDisc || 0);
  }, []);

  // Calculate net amount for a service
  const calculateServiceNetAmount = useCallback(
    (service: Partial<BillServicesDto>) => {
      const grossAmt = service.cHValue || 0;
      const discAmt = calculateServiceDiscountAmount(service);
      return grossAmt - discAmt;
    },
    [calculateServiceDiscountAmount]
  );

  // Calculate discount based on percentage
  const calculateDiscountFromPercent = (amount: number, percentage: number): number => {
    return (amount * percentage) / 100;
  };

  // Calculate total for all services
  const calculateServicesTotal = useCallback(
    (services: Partial<BillServicesDto>[]): number => {
      return services.reduce((sum, service) => {
        return sum + calculateServiceNetAmount(service);
      }, 0);
    },
    [calculateServiceNetAmount]
  );
  const calculateServiceTotals = (service: BillServicesDto) => {
    const quantity = service.chUnits || 1;
    const drAmt = service.dCValue || 0;
    const hospAmt = service.hCValue || 0;

    // Gross amount calculation
    const grossAmount = quantity * (drAmt + hospAmt);

    // Calculate discounts
    const drDiscAmt = calculateDiscountFromPercent(drAmt * quantity, service.drPercShare || 0);
    const hospDiscAmt = calculateDiscountFromPercent(hospAmt * quantity, service.hospPercShare || 0);

    // Total discount
    const totalDiscount = drDiscAmt + hospDiscAmt;

    // Net amount
    const netAmount = grossAmount - totalDiscount;

    return {
      grossAmount,
      drDiscAmt,
      hospDiscAmt,
      totalDiscount,
      netAmount,
    };
  };
  // Validate service amounts
  const validateServiceAmounts = useCallback((service: Partial<BillServicesDto>): boolean => {
    const grossAmt = service.cHValue || 0;
    const drAmt = service.dCValue || 0;
    const hospAmt = service.hCValue || 0;

    // Gross amount should be sum of doctor and hospital amounts
    return Math.abs(grossAmt - (drAmt + hospAmt)) < 0.01;
  }, []);

  // Calculate automatic discount values based on percentages
  const calculateDiscountValues = useCallback(
    (service: Partial<BillServicesDto>): { dValDisc: number; hValDisc: number } => {
      const drAmt = service.dCValue || 0;
      const hospAmt = service.hCValue || 0;
      const drPercShare = service.drPercShare || 0;
      const hospPercShare = service.hospPercShare || 0;

      return {
        dValDisc: calculateDiscountFromPercent(drAmt, drPercShare),
        hValDisc: calculateDiscountFromPercent(hospAmt, hospPercShare),
      };
    },
    [calculateDiscountFromPercent]
  );

  return {
    calculateServiceDiscountAmount,
    calculateServiceNetAmount,
    calculateDiscountFromPercent,
    calculateServiceTotals,
    calculateServicesTotal,
    validateServiceAmounts,
    calculateDiscountValues,
  };
};
