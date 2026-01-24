import * as XLSX from 'xlsx';
import type { SheetData } from '../types';

/**
 * Parses an Excel file and extracts Summary and Adjustment sheet data
 * @param file - The Excel file to parse
 * @returns Promise<SheetData> - Parsed data from both sheets
 * @throws Error if file reading fails or Summary sheet is missing
 */
export function parseExcelFile(file: File): Promise<SheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file: No data returned'));
          return;
        }

        // Parse the workbook
        const workbook = XLSX.read(data, { type: 'binary' });

        // Find the Summary sheet
        const summarySheetName = workbook.SheetNames.find(
          (name) => name === 'Summary(상세)'
        );

        if (!summarySheetName) {
          reject(
            new Error(
              'Required sheet "Summary(상세)" not found in Excel file. Available sheets: ' +
                workbook.SheetNames.join(', ')
            )
          );
          return;
        }

        // Find the Adjustment sheet (optional)
        const adjustmentSheetName = workbook.SheetNames.find(
          (name) => name === '재고조정'
        );

        // Parse Summary sheet
        const summarySheet = workbook.Sheets[summarySheetName];
        const summaryRawData = XLSX.utils.sheet_to_json<(string | number)[]>(
          summarySheet,
          { header: 1 }
        );

        // Parse Adjustment sheet if it exists
        let adjustmentRawData: (string | number)[][] = [];
        if (adjustmentSheetName) {
          const adjustmentSheet = workbook.Sheets[adjustmentSheetName];
          adjustmentRawData = XLSX.utils.sheet_to_json<(string | number)[]>(
            adjustmentSheet,
            { header: 1 }
          );
        }

        // Return raw data directly for SUMIF operations
        const sheetData: SheetData = {
          summary: summaryRawData,
          adjustment: adjustmentRawData,
        };

        resolve(sheetData);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel file: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file: FileReader error'));
    };

    reader.readAsBinaryString(file);
  });
}

