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

        // Calculate comparison using the parsed data
        // SheetData already contains raw 2D arrays in the correct format
        const result = calculateComparison(
          currentData.summary,
          currentData.adjustment,
          previousData.summary,
          previousData.adjustment
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

