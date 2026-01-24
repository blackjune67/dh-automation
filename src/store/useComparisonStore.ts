import { create } from 'zustand';
import type { ExcelFile, ComparisonResult } from '../types';

/**
 * State interface for the comparison store
 */
interface ComparisonState {
  /** Currently selected Excel file for the current period */
  currentFile: ExcelFile | null;
  /** Previously selected Excel file for the previous period */
  previousFile: ExcelFile | null;
  /** Result of the comparison between two files */
  result: ComparisonResult | null;
  /** Error message if any operation fails */
  error: string | null;
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * Actions interface for the comparison store
 */
interface ComparisonActions {
  /** Set the current period Excel file */
  setCurrentFile: (file: ExcelFile | null) => void;
  /** Set the previous period Excel file */
  setPreviousFile: (file: ExcelFile | null) => void;
  /** Set the comparison result */
  setResult: (result: ComparisonResult | null) => void;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
  /** Reset all state to initial values */
  reset: () => void;
}

/**
 * Combined store type
 */
type ComparisonStore = ComparisonState & ComparisonActions;

/**
 * Initial state values
 */
const initialState: ComparisonState = {
  currentFile: null,
  previousFile: null,
  result: null,
  error: null,
  isLoading: false,
};

/**
 * Zustand store for managing global comparison state
 */
export const useComparisonStore = create<ComparisonStore>((set) => ({
  ...initialState,

  setCurrentFile: (file) => set({ currentFile: file, error: null }),

  setPreviousFile: (file) => set({ previousFile: file, error: null }),

  setResult: (result) => set({ result, error: null }),

  setError: (error) => set({ error, isLoading: false }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () => set(initialState),
}));
