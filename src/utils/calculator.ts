import type { ComparisonResult, CategoryData, ProcessedSheet } from "../types";

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
 * - Usage: SUMIF(summary!category, category, summary!amount)
 * - Adjustment: SUMIF(adjustment!category, category, adjustment!amount)
 * - Subtotal: Usage - Adjustment
 * - Difference: Current Subtotal - Previous Subtotal
 */
export function calculateComparison(
  currentSummary: ProcessedSheet,
  currentAdjustment: ProcessedSheet,
  previousSummary: ProcessedSheet,
  previousAdjustment: ProcessedSheet,
): ComparisonResult {
  // 헤더에서 찾은 열 인덱스 로그
  console.log('📊 Summary 열 인덱스 - 카테고리열:', currentSummary.columns.categoryCol, '금액열:', currentSummary.columns.amountCol);
  console.log('📊 재고조정 열 인덱스 - 카테고리열:', currentAdjustment.columns.categoryCol, '금액열:', currentAdjustment.columns.amountCol);

  const categories: CategoryData[] = [];

  // Process each category
  for (const category of CATEGORIES) {
    // Current period calculations using dynamic column indices
    const currentUsage = sumif(
      currentSummary.data,
      currentSummary.columns.categoryCol,
      category,
      currentSummary.columns.amountCol,
    );

    const currentAdjustmentValue = sumif(
      currentAdjustment.data,
      currentAdjustment.columns.categoryCol,
      category,
      currentAdjustment.columns.amountCol,
    );

    // Excel: =+D6-E6
    const currentSubtotal = currentUsage - currentAdjustmentValue;

    // Previous period calculations using dynamic column indices
    const previousUsage = sumif(
      previousSummary.data,
      previousSummary.columns.categoryCol,
      category,
      previousSummary.columns.amountCol,
    );

    const previousAdjustmentValue = sumif(
      previousAdjustment.data,
      previousAdjustment.columns.categoryCol,
      category,
      previousAdjustment.columns.amountCol,
    );

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
