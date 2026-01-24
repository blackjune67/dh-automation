import * as XLSX from 'xlsx';
import type { SheetData } from '../types';

/**
 * Finds the header row and extracts data with proper column mapping
 */
function processSheetData(rawData: any[][]): any[][] {
  // Find the row containing "품목구분" - this is the header row
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row)) {
      // Look for "품목구분" column
      const catIndex = row.findIndex(cell =>
        typeof cell === 'string' && cell.includes('품목구분')
      );

      if (catIndex !== -1) {
        headerRowIndex = i;

        console.log('✅ Found header at row', i, '품목구분 at col', catIndex, '사용금액 at col',
          row.findIndex(cell => typeof cell === 'string' && (cell.includes('사용금액') || cell.includes('사용 금액')))
        );
        break;
      }
    }
  }

  // If header not found, return original data
  if (headerRowIndex === -1) {
    console.warn('⚠️ Header row not found, using original data');
    return rawData;
  }

  // Return data starting from the row after header
  // Keep the original column structure
  return rawData.slice(headerRowIndex + 1);
}

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
        console.log('📊 Available sheets in file:', workbook.SheetNames);

        // Find the Summary sheet
        const summarySheetName = workbook.SheetNames.find(
          (name) => name === 'Summary (상세)'
        );
        console.log('✅ Found Summary sheet:', summarySheetName || 'NOT FOUND');

        if (!summarySheetName) {
          reject(
            new Error(
              'Required sheet "Summary (상세)" not found in Excel file. Available sheets: ' +
                workbook.SheetNames.join(', ')
            )
          );
          return;
        }

        // Find the Adjustment sheet (optional)
        const adjustmentSheetName = workbook.SheetNames.find(
          (name) => name === '재고조정'
        );
        console.log('📋 Found Adjustment sheet:', adjustmentSheetName || 'NOT FOUND');

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

        // Process data to remove header rows
        const processedSummary = processSheetData(summaryRawData);
        const processedAdjustment = processSheetData(adjustmentRawData);

        console.log('📈 Processed - Summary rows:', processedSummary.length, 'Adjustment rows:', processedAdjustment.length);

        // Return raw data directly for SUMIF operations
        const sheetData: SheetData = {
          summary: processedSummary,
          adjustment: processedAdjustment,
        };

        resolve(sheetData);
      } catch (error) {
        console.error('❌ Error parsing Excel file:', error);
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

