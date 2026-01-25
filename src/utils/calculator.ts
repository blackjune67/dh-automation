import type { ComparisonResult, CategoryData } from "../types";

/**
 * Categories for comparison
 */
export const CATEGORIES = [
  "기공료",
  "임플란트",
  "치과재료",
  "기공재료",
  "의약품",
  "소모품",
] as const;

/**
 * SUMIF function: Sums values in targetCol where colB matches category
 * Equivalent to Excel's SUMIF function
 *
 * @param data - 2D array representing Excel data (rows and columns)
 * @param colB - Column index for category matching (B column)
 * @param category - Category name to match
 * @param targetCol - Column index to sum (R column for usage, F column for adjustment)
 * @returns Sum of all matching values
 *
 * @example
 * // Excel: =SUMIF(당월DB_상세!$B:$B,비교!$C6,당월DB_상세!$R:$R)
 * sumif(summaryData, 1, '기공료', 17)
 */
export function sumif(
  data: any[][],
  colB: number,
  category: string,
  targetCol: number,
): number {
  let sum = 0;

  // Start from index 0 (headers already removed by processSheetData)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Check if row exists and has enough columns
    if (!row || row.length <= Math.max(colB, targetCol)) {
      continue;
    }

    const categoryValue = row[colB];
    const targetValue = row[targetCol];

    // Trim whitespace and tabs from both sides for comparison
    const trimmedCategory =
      typeof categoryValue === "string" ? categoryValue.trim() : categoryValue;

    // Match category and sum target column
    if (trimmedCategory === category) {
      // Add debug logging for first match
      /* if (category === '치과재료' && sum === 0) {
        console.log('  🔍 First match for 치과재료:');
        console.log('    targetValue:', targetValue, 'type:', typeof targetValue);
        console.log('    Number(targetValue):', Number(targetValue));
        console.log('    isNaN:', isNaN(Number(targetValue)));
        console.log('    isFinite:', isFinite(Number(targetValue)));
      } */

      // Handle null, undefined, empty strings, and non-numeric values
      if (
        targetValue !== null &&
        targetValue !== undefined &&
        targetValue !== ""
      ) {
        const numValue = Number(targetValue);
        if (!isNaN(numValue) && isFinite(numValue)) {
          sum += numValue;
        }
      }
    }
  }

  return sum;
}

/**
 * Calculate comparison between current and previous period
 *
 * @param currentSummary - Current period summary data (당월DB_상세)
 * @param currentAdjustment - Current period adjustment data (당월DB_재고조정)
 * @param previousSummary - Previous period summary data (전월DB_상세)
 * @param previousAdjustment - Previous period adjustment data (전월DB_재고조정)
 * @returns ComparisonResult with all calculated values
 *
 * @remarks
 * Calculation logic based on Excel formulas:
 * - Usage: SUMIF(summary!$B:$B, category, summary!$R:$R)
 * - Adjustment: SUMIF(adjustment!$B:$B, category, adjustment!$F:$F)
 * - Subtotal: Usage - Adjustment
 * - Difference: Current Subtotal - Previous Subtotal
 */
export function calculateComparison(
  currentSummary: any[][],
  currentAdjustment: any[][],
  previousSummary: any[][],
  previousAdjustment: any[][],
): ComparisonResult {
  // Log initial data received
  /* console.log('📊 Calculator received data:');
  console.log('  Current Summary rows:', currentSummary.length, 'cols:', currentSummary[0]?.length);
  console.log('  Current Adjustment rows:', currentAdjustment.length, 'cols:', currentAdjustment[0]?.length);
  console.log('  Previous Summary rows:', previousSummary.length, 'cols:', previousSummary[0]?.length);
  console.log('  Previous Adjustment rows:', previousAdjustment.length, 'cols:', previousAdjustment[0]?.length); */

  // Log first few rows to see data structure
  /* console.log('  Current Summary first 10 rows:', currentSummary.slice(0, 10));
  console.log('  Previous Summary first 10 rows:', previousSummary.slice(0, 10));
  console.log('  Current Adjustment first 10 rows:', currentAdjustment.slice(0, 10));
  console.log('  Previous Adjustment first 10 rows:', previousAdjustment.slice(0, 10)); */

  const categories: CategoryData[] = [];

  // Process each category
  for (const category of CATEGORIES) {
    // Log details for the first category to debug
    /* if (category === '기공료' || category === '치과재료') {
      console.log('🔍 Processing category:', category);
    } */

    // Current period calculations
    // Excel: =SUMIF(당월DB_상세!$B:$B,비교!$C6,당월DB_상세!$R:$R)
    const currentUsage = sumif(currentSummary, 1, category, 17); // B=1 (0-indexed), R=17

    // Excel: =SUMIF(당월DB_재고조정!$B:$B,비교!$C6,당월DB_재고조정!$F:$F)
    const currentAdjustmentValue = sumif(currentAdjustment, 1, category, 5); // B=1, F=5

    // Log detailed adjustment data for first category
    /* if (category === '기공료' || category === '치과재료') {
      console.log('🔍 Adjustment data for', category);
      console.log('  Current adjustment rows:', currentAdjustment.length);
      console.log('  Looking at first 20 rows for category matches:');
      for (let i = 0; i < Math.min(20, currentAdjustment.length); i++) {
        const row = currentAdjustment[i];
        if (row && row[1]) {
          const trimmed = typeof row[1] === 'string' ? row[1].trim() : row[1];
          console.log(`    Row ${i}: [${row[1]}] trimmed=[${trimmed}] match=${trimmed === category} amount=${row[5]}`);
        }
      }
    } */

    // Log values for first category
    /* if (category === '기공료' || category === '치과재료') {
      console.log('  Current usage:', currentUsage);
      console.log('  Current adjustment:', currentAdjustmentValue);
    } */

    // Excel: =+D6-E6
    const currentSubtotal = currentUsage - currentAdjustmentValue;

    // Previous period calculations
    // Excel: =SUMIF(전월DB_상세!$B:$B,비교!$B6,전월DB_상세!$R:$R)
    const previousUsage = sumif(previousSummary, 1, category, 17);

    // Excel: =SUMIF(전월DB_재고조정!$B:$B,비교!$B6,전월DB_재고조정!$F:$F)
    const previousAdjustmentValue = sumif(previousAdjustment, 1, category, 5);

    // Log values for first category
    /* if (category === "기공료" || category === "치과재료") {
      console.log("  Previous usage:", previousUsage);
      console.log("  Previous adjustment:", previousAdjustmentValue);
    } */

    // Excel: =+G6-H6
    const previousSubtotal = previousUsage - previousAdjustmentValue;

    // Difference calculation
    // Excel: =+F6-I6
    const difference = currentSubtotal - previousSubtotal;

    categories.push({
      category,
      currentUsage,
      currentAdjustment: currentAdjustmentValue,
      currentSubtotal,
      previousUsage,
      previousAdjustment: previousAdjustmentValue,
      previousSubtotal,
      difference,
    });
  }

  // Calculate totals
  // Excel: =SUM(F6:F11)
  const currentTotal = categories.reduce(
    (sum, cat) => sum + cat.currentSubtotal,
    0,
  );

  // Excel: =SUM(I6:I11)
  const previousTotal = categories.reduce(
    (sum, cat) => sum + cat.previousSubtotal,
    0,
  );

  // Excel: =+J10+J11 (의약품 + 소모품)
  const medicineCategory = categories.find((cat) => cat.category === "의약품");
  const consumableCategory = categories.find(
    (cat) => cat.category === "소모품",
  );
  const medicineConsumableSum =
    (medicineCategory?.difference || 0) + (consumableCategory?.difference || 0);

  return {
    categories,
    currentTotal,
    previousTotal,
    medicineConsumableSum,
  };
}
