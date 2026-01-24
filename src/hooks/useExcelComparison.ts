import { useMutation } from '@tanstack/react-query';
import { parseExcelFile } from '../utils/excelParser';
import { calculateComparison } from '../utils/calculator';
import type { ComparisonResult } from '../types';

/**
 * Parameters for the Excel comparison mutation
 */
interface ExcelComparisonParams {
  /** Current period Excel file */
  currentFile: File;
  /** Previous period Excel file */
  previousFile: File;
}

/**
 * Custom hook for Excel file comparison using React Query
 *
 * @returns Mutation object with mutate, mutateAsync, isLoading, error, and data
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error, data } = useExcelComparison();
 *
 * const handleCompare = () => {
 *   mutate({ currentFile, previousFile }, {
 *     onSuccess: (result) => {
 *       console.log('Comparison result:', result);
 *     },
 *     onError: (error) => {
 *       console.error('Comparison failed:', error);
 *     }
 *   });
 * };
 * ```
 */
export function useExcelComparison() {
  return useMutation<ComparisonResult, Error, ExcelComparisonParams>({
    mutationFn: async ({ currentFile, previousFile }: ExcelComparisonParams) => {
      try {
        // Parse both Excel files in parallel
        const [currentData, previousData] = await Promise.all([
          parseExcelFile(currentFile),
          parseExcelFile(previousFile),
        ]);

        // Convert SheetData to the format expected by calculateComparison
        // The calculator expects raw 2D arrays with headers
        const currentSummaryArray = convertToArray(currentData.summary);
        const currentAdjustmentArray = convertToArray(currentData.adjustment);
        const previousSummaryArray = convertToArray(previousData.summary);
        const previousAdjustmentArray = convertToArray(previousData.adjustment);

        // Calculate comparison using the parsed data
        const result = calculateComparison(
          currentSummaryArray,
          currentAdjustmentArray,
          previousSummaryArray,
          previousAdjustmentArray
        );

        return result;
      } catch (error) {
        // Ensure error is an Error instance
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(
          `Failed to compare Excel files: ${String(error)}`
        );
      }
    },
  });
}

/**
 * Converts SheetData array to 2D array format expected by calculator
 * Adds a header row and converts data rows to array format
 *
 * @param data - Array of category and amount objects
 * @returns 2D array with header row and data rows
 */
function convertToArray(
  data: Array<{ category: string; amount: number }>
): any[][] {
  // Add header row (indices match calculator expectations)
  // B column (index 1) = category, R column (index 17) or F column (index 5) = amount
  const result: any[][] = [];

  // Add header row
  const headerRow = new Array(18).fill('');
  headerRow[1] = 'category'; // B column
  headerRow[17] = 'amount';  // R column for summary, or
  headerRow[5] = 'amount';   // F column for adjustment
  result.push(headerRow);

  // Add data rows
  for (const item of data) {
    const row = new Array(18).fill('');
    row[1] = item.category;  // B column
    row[17] = item.amount;   // R column
    row[5] = item.amount;    // F column (for adjustment sheets)
    result.push(row);
  }

  return result;
}
