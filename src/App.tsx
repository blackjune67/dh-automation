import { FileUpload } from './components/FileUpload';
import ResultTable from './components/ResultTable';
import { useComparisonStore } from './store/useComparisonStore';
import { useExcelComparison } from './hooks/useExcelComparison';
import type { ComparisonResult, ExcelFile } from './types';

function App() {
  const {
    currentFile,
    previousFile,
    result,
    error,
    setCurrentFile,
    setPreviousFile,
    setResult,
    setError,
  } = useComparisonStore();

  const { mutate, isPending } = useExcelComparison();

  const handleCalculate = () => {
    console.log('🔍 Starting calculation with files:', currentFile?.name, previousFile?.name);

    if (!currentFile || !previousFile) {
      setError('두 파일 모두 선택해주세요.');
      return;
    }

    mutate(
      { currentFile: currentFile.file, previousFile: previousFile.file },
      {
        onSuccess: (data: ComparisonResult) => {
          console.log('✅ Calculation successful, result:', data);
          setResult(data);
          setError(null);
        },
        onError: (err: Error) => {
          console.error('❌ Calculation error:', err);
          console.error('Error message:', err.message);
          console.error('Error stack:', err.stack);
          setError(err.message || '계산 중 오류가 발생했습니다.');
          setResult(null);
        },
      }
    );
  };

  const handleFileChange = (
    type: 'current' | 'previous',
    file: ExcelFile | null
  ) => {
    if (type === 'current') {
      setCurrentFile(file);
    } else {
      setPreviousFile(file);
    }
    // Clear error when files change
    setError(null);
  };

  const isCalculateDisabled = !currentFile || !previousFile || isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
            엑셀 사용량 비교
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-medium">
            당월과 전월 엑셀 파일을 업로드하여 사용량을 비교하세요
          </p>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6 mb-8">
          <FileUpload
            label="당월 엑셀 파일"
            value={currentFile}
            onChange={(file) => handleFileChange('current', file)}
          />

          <FileUpload
            label="전월 엑셀 파일"
            value={previousFile}
            onChange={(file) => handleFileChange('previous', file)}
          />

          {/* Calculate Button */}
          <div className="pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculateDisabled}
              className={`
                w-full rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg
                transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isCalculateDisabled
                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {isPending ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>계산 중...</span>
                </span>
              ) : (
                '비교 계산 실행'
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border-2 border-red-200 px-4 py-3">
              <div className="flex items-start space-x-3">
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-semibold text-red-800">
                  {error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              비교 결과
            </h2>
            <ResultTable result={result} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
