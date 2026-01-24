import type { ComparisonResult, CategoryData } from '../types';

/**
 * Categories for comparison
 */
export const CATEGORIES = [
  '기공료',
  '임플란트',
  '치과재료',
  '기공재료',
  '의약품',
  '소모품',
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
  targetCol: number
): number {
  let sum = 0;

  // Skip header row (index 0), start from data row 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Check if row exists and has enough columns
    if (!row || row.length <= Math.max(colB, targetCol)) {
      continue;
    }

    const categoryValue = row[colB];
    const targetValue = row[targetCol];

    // Match category and sum target column
    if (categoryValue === category) {
      // Handle null, undefined, empty strings, and non-numeric values
      if (
        targetValue !== null &&
        targetValue !== undefined &&
        targetValue !== ''
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
  previousAdjustment: any[][]
): ComparisonResult {
  const categories: CategoryData[] = [];

  // Process each category
  for (const category of CATEGORIES) {
    // Current period calculations
    // Excel: =SUMIF(당월DB_상세!$B:$B,비교!$C6,당월DB_상세!$R:$R)
    const currentUsage = sumif(currentSummary, 1, category, 17); // B=1 (0-indexed), R=17

    // Excel: =SUMIF(당월DB_재고조정!$B:$B,비교!$C6,당월DB_재고조정!$F:$F)
    const currentAdjustmentValue = sumif(currentAdjustment, 1, category, 5); // B=1, F=5

    // Excel: =+D6-E6
    const currentSubtotal = currentUsage - currentAdjustmentValue;

    // Previous period calculations
    // Excel: =SUMIF(전월DB_상세!$B:$B,비교!$B6,전월DB_상세!$R:$R)
    const previousUsage = sumif(previousSummary, 1, category, 17);

    // Excel: =SUMIF(전월DB_재고조정!$B:$B,비교!$B6,전월DB_재고조정!$F:$F)
    const previousAdjustmentValue = sumif(previousAdjustment, 1, category, 5);

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
    0
  );

  // Excel: =SUM(I6:I11)
  const previousTotal = categories.reduce(
    (sum, cat) => sum + cat.previousSubtotal,
    0
  );

  // Excel: =+J10+J11 (의약품 + 소모품)
  const medicineCategory = categories.find((cat) => cat.category === '의약품');
  const consumableCategory = categories.find((cat) => cat.category === '소모품');
  const medicineConsumableSum =
    (medicineCategory?.difference || 0) + (consumableCategory?.difference || 0);

  return {
    categories,
    currentTotal,
    previousTotal,
    medicineConsumableSum,
  };
}
