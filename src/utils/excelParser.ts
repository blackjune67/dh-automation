import * as XLSX from 'xlsx';
import type { SheetData, ProcessedSheet, ColumnIndices } from '../types';

/**
 * Find column index by searching for text in header rows
 */
function findColumnIndex(headerRows: any[][], searchTerms: string[]): number {
  for (const row of headerRows) {
    if (!Array.isArray(row)) continue;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cell = row[colIdx];
      if (typeof cell === 'string') {
        const cellText = cell.replace(/\s/g, ''); // Remove whitespace
        for (const term of searchTerms) {
          const searchText = term.replace(/\s/g, '');
          if (cellText.includes(searchText)) {
            return colIdx;
          }
        }
      }
    }
  }
  return -1;
}

/**
 * Find "금액" column that belongs to "사용량" section
 * Looks for "사용량" or "사용" header first, then finds "금액" in adjacent columns
 */
function findUsageAmountColumn(headerRows: any[][]): number {
  // First, find "사용량" or "사용" in the upper header row (merged header)
  let usageSectionStart = -1;

  for (const row of headerRows) {
    if (!Array.isArray(row)) continue;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cell = row[colIdx];
      if (typeof cell === 'string') {
        const cellText = cell.replace(/\s/g, '');
        if (cellText.includes('사용량') || cellText === '사용') {
          usageSectionStart = colIdx;
          break;
        }
      }
    }
    if (usageSectionStart !== -1) break;
  }

  console.log('📊 사용량 섹션 시작 위치:', usageSectionStart);

  // If found "사용량" section, look for "금액" in the columns after it
  if (usageSectionStart !== -1) {
    for (const row of headerRows) {
      if (!Array.isArray(row)) continue;

      // Search from usageSectionStart onwards for "금액"
      for (let colIdx = usageSectionStart; colIdx < Math.min(usageSectionStart + 5, row.length); colIdx++) {
        const cell = row[colIdx];
        if (typeof cell === 'string') {
          const cellText = cell.replace(/\s/g, '');
          if (cellText.includes('금액')) {
            console.log('📊 사용량 섹션 내 금액열 발견:', colIdx);
            return colIdx;
          }
        }
      }
    }
  }

  return -1;
}

/**
 * Finds the header rows and extracts data with dynamic column mapping
 * @param rawData - Raw 2D array from Excel
 * @param sheetType - 'summary' or 'adjustment' to determine which columns to find
 */
function processSheetData(rawData: any[][], sheetType: 'summary' | 'adjustment'): ProcessedSheet {
  // Find the row containing "품목구분" or "대분류" - this is the main header row
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row)) {
      // Look for "품목구분" or "대분류" column (both mean category)
      const catIndex = row.findIndex(cell =>
        typeof cell === 'string' && (cell.includes('품목구분') || cell.includes('대분류'))
      );

      if (catIndex !== -1) {
        headerRowIndex = i;
        break;
      }
    }
  }

  // Default column indices (fallback)
  let columns: ColumnIndices = {
    categoryCol: 1,  // B column
    amountCol: sheetType === 'summary' ? 17 : 5,  // R or F column
  };

  if (headerRowIndex === -1) {
    console.warn('⚠️ Header row not found, using default column indices');
    return { data: rawData, columns };
  }

  // Get header rows (up to 3 rows above for merged headers)
  const headerRows = rawData.slice(Math.max(0, headerRowIndex - 3), headerRowIndex + 1);

  // Find category column (품목구분 or 대분류)
  const categoryCol = findColumnIndex(headerRows, ['품목구분', '대분류']);
  if (categoryCol !== -1) {
    columns.categoryCol = categoryCol;
  }

  // Find amount column based on sheet type
  if (sheetType === 'summary') {
    // Summary: first try "사용금액" or "사용 금액"
    let amountCol = findColumnIndex(headerRows, ['사용금액', '사용 금액']);

    // If not found, try to find "금액" within "사용량" section
    if (amountCol === -1) {
      amountCol = findUsageAmountColumn(headerRows);
    }

    console.log('📊 Summary 금액열 최종 결과:', amountCol);
    if (amountCol !== -1) {
      columns.amountCol = amountCol;
    } else {
      console.warn('⚠️ 금액 열을 찾지 못함, 기본값 17 사용');
    }
  } else {
    // Adjustment: look for "금액" in 기초재고(조정) section
    const amountCol = findColumnIndex(headerRows, ['금액']);
    console.log('📊 재고조정 금액열 검색 결과:', amountCol);
    if (amountCol !== -1) {
      columns.amountCol = amountCol;
    } else {
      console.warn('⚠️ 금액 열을 찾지 못함, 기본값 5 사용');
    }
  }

  // Return data starting from the row after header
  return {
    data: rawData.slice(headerRowIndex + 1),
    columns,
  };
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
        // console.log('📊 Available sheets in file:', workbook.SheetNames);

        // Find the Summary sheet (ignore whitespace differences)
        const summarySheetName = workbook.SheetNames.find(
          (name) => name.replace(/\s/g, '') === 'Summary(상세)'
        );
        // console.log('✅ Found Summary sheet:', summarySheetName || 'NOT FOUND');

        if (!summarySheetName) {
          reject(
            new Error(
              'Required sheet "Summary(상세)" not found in Excel file. Available sheets: ' +
                workbook.SheetNames.join(', ')
            )
          );
          return;
        }

        // Find the Adjustment sheet (optional, ignore whitespace differences)
        const adjustmentSheetName = workbook.SheetNames.find(
          (name) => name.replace(/\s/g, '') === '재고조정'
        );
        // console.log('📋 Found Adjustment sheet:', adjustmentSheetName || 'NOT FOUND');

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

        // Process data with dynamic column detection
        const processedSummary = processSheetData(summaryRawData, 'summary');
        const processedAdjustment = processSheetData(adjustmentRawData, 'adjustment');

        // console.log('📈 Processed - Summary rows:', processedSummary.data.length, 'Adjustment rows:', processedAdjustment.data.length);
        // console.log('📊 Summary columns:', processedSummary.columns);
        // console.log('📊 Adjustment columns:', processedAdjustment.columns);

        // Return processed data with column indices
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

