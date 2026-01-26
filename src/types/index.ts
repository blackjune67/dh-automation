/**
 * Represents the data for a single category in the comparison
 */
export interface CategoryData {
  /** The category name (e.g., "Medicine", "Consumable") */
  category: string;
  /** Current period usage amount */
  currentUsage: number;
  /** Current period adjustment amount */
  currentAdjustment: number;
  /** Current period subtotal (usage + adjustment) */
  currentSubtotal: number;
  /** Previous period usage amount */
  previousUsage: number;
  /** Previous period adjustment amount */
  previousAdjustment: number;
  /** Previous period subtotal (usage + adjustment) */
  previousSubtotal: number;
  /** Difference between current and previous subtotals */
  difference: number;
}

/**
 * Represents the complete comparison result between two periods
 */
export interface ComparisonResult {
  /** Array of category data for all categories */
  categories: CategoryData[];
  /** Total sum of all current period subtotals */
  currentTotal: number;
  /** Total sum of all previous period subtotals */
  previousTotal: number;
  /** Sum of Medicine and Consumable categories only */
  medicineConsumableSum: number;
}

/**
 * Column indices found dynamically from headers
 */
export interface ColumnIndices {
  /** Column index for category (품목구분/대분류) */
  categoryCol: number;
  /** Column index for amount (사용 금액/금액) */
  amountCol: number;
}

/**
 * Processed sheet with data and column mapping
 */
export interface ProcessedSheet {
  /** Raw 2D array of data (without header rows) */
  data: any[][];
  /** Dynamically found column indices */
  columns: ColumnIndices;
}

/**
 * Represents the parsed data from an Excel sheet
 */
export interface SheetData {
  /** Processed Summary sheet with data and column indices */
  summary: ProcessedSheet;
  /** Processed Adjustment sheet with data and column indices */
  adjustment: ProcessedSheet;
}

/**
 * Represents metadata for an uploaded Excel file
 */
export interface ExcelFile {
  /** The File object from the browser */
  file: File;
  /** Display name for the file */
  name: string;
  /** Unique identifier for the file */
  id: string;
}

/**
 * Type guard to check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
