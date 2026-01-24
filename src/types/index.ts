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
 * Represents the parsed data from an Excel sheet
 */
export interface SheetData {
  /** Raw 2D array from Summary sheet (rows and columns) */
  summary: any[][];
  /** Raw 2D array from Adjustment sheet (rows and columns) */
  adjustment: any[][];
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
