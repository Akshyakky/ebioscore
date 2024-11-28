// import { ChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";

// export const calculateGridData = (chargeDetails: any[], dropdownValues: any) => {
//   const groupedByPIC = chargeDetails.reduce((acc, detail) => {
//     const picName = dropdownValues.pic?.find((p: any) => Number(p.value) === detail.pTypeID)?.label || "";

//     if (!acc[picName]) {
//       acc[picName] = {};
//     }

//     const wardCategory = dropdownValues.bedCategory?.find((cat: any) => Number(cat.value) === detail.wCatID);

//     if (wardCategory) {
//       const categoryLabel = wardCategory.label;
//       const drAmt = detail.dcValue || 0;
//       const hospAmt = detail.hcValue || 0;
//       const totAmt = drAmt + hospAmt;

//       acc[picName][`${categoryLabel}_drAmt`] = drAmt.toFixed(2);
//       acc[picName][`${categoryLabel}_hospAmt`] = hospAmt.toFixed(2);
//       acc[picName][`${categoryLabel}_totAmt`] = totAmt.toFixed(2);
//     }

//     return acc;
//   }, {});

//   return Object.entries(groupedByPIC).map(([picName, values]) => ({
//     picName,
//     ...values,
//   }));
// };

// export const applyAdjustments = ({
//   gridData,
//   formData,
//   dropdownValues,
//   selectedWardCategoryIds,
// }: {
//   gridData: any[];
//   formData: ChargeDetailsDto;
//   dropdownValues: any;
//   selectedWardCategoryIds: string[];
// }) => {
//   const { adjustmentType, amountType, percentage, chValue } = formData.chargeInfo;
//   const isPercentage = percentage === "Y";
//   const adjustmentValue = parseFloat(chValue || "0");

//   const updatedGridData = gridData.map((row) => {
//     const updatedRow = { ...row };

//     dropdownValues.bedCategory?.forEach((category: any) => {
//       if (!selectedWardCategoryIds.includes(category.value)) return;

//       const drAmtKey = `${category.label}_drAmt`;
//       const hospAmtKey = `${category.label}_hospAmt`;
//       const totAmtKey = `${category.label}_totAmt`;

//       let drAmt = parseFloat(row[drAmtKey] || "0");
//       let hospAmt = parseFloat(row[hospAmtKey] || "0");

//       if (adjustmentType !== "None") {
//         const multiplier = adjustmentType === "Increase" ? 1 : -1;
//         const factor = isPercentage ? adjustmentValue / 100 : adjustmentValue;

//         if (amountType === "Dr Amt" || amountType === "Both") {
//           drAmt += multiplier * (isPercentage ? drAmt * factor : factor);
//         }
//         if (amountType === "Hosp Amt" || amountType === "Both") {
//           hospAmt += multiplier * (isPercentage ? hospAmt * factor : factor);
//         }
//       }

//       updatedRow[drAmtKey] = drAmt.toFixed(2);
//       updatedRow[hospAmtKey] = hospAmt.toFixed(2);
//       updatedRow[totAmtKey] = (drAmt + hospAmt).toFixed(2);
//     });

//     return updatedRow;
//   });

//   return {
//     gridData: updatedGridData,
//     chargeDetails: generateChargeDetails(updatedGridData, formData, dropdownValues),
//   };
// };

// const generateChargeDetails = (gridData: any[], formData: ChargeDetailsDto, dropdownValues: any) => {
//   return gridData.flatMap((row) => {
//     const picValue = dropdownValues.pic?.find((p: any) => p.label === row.picName)?.value || "0";

//     return dropdownValues.bedCategory?.map((category: any) => ({
//       chDetID: 0,
//       chargeID: formData.chargeInfo.chargeID,
//       pTypeID: parseInt(picValue, 10),
//       wCatID: parseInt(category.value, 10),
//       dcValue: parseFloat(row[`${category.label}_drAmt`] || "0"),
//       hcValue: parseFloat(row[`${category.label}_hospAmt`] || "0"),
//       chValue: parseFloat(row[`${category.label}_totAmt`] || "0"),
//       chargeStatus: "A",
//       compID: formData.chargeInfo.compID,
//       compCode: formData.chargeInfo.compCode,
//       compName: formData.chargeInfo.compName,
//       rActiveYN: "Y",
//       transferYN: "N",
//       rNotes: "",
//     }));
//   });
// };
