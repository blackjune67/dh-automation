import { Agentation } from "agentation";
import { FileUpload } from "./components/FileUpload";
import ResultTable from "./components/ResultTable";
import { useComparisonStore } from "./store/useComparisonStore";
import { useExcelComparison } from "./hooks/useExcelComparison";
import type { ComparisonResult, ExcelFile } from "./types";

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
    /* console.log(
      "🔍 Starting calculation with files:",
      currentFile?.name,
      previousFile?.name,
    ); */

    if (!currentFile || !previousFile) {
      setError("두 파일 모두 선택해주세요.");
      return;
    }

    mutate(
      { currentFile: currentFile.file, previousFile: previousFile.file },
      {
        onSuccess: (data: ComparisonResult) => {
          // console.log("✅ Calculation successful, result:", data);
          setResult(data);
          setError(null);
        },
        onError: (err: Error) => {
          console.error("❌ Calculation error:", err);
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
          setError(err.message || "계산 중 오류가 발생했습니다.");
          setResult(null);
        },
      },
    );
  };

  const handleFileChange = (
    type: "current" | "previous",
    file: ExcelFile | null,
  ) => {
    if (type === "current") {
      setCurrentFile(file);
    } else {
      setPreviousFile(file);
    }
    // Clear error when files change
    setError(null);
  };

  const isCalculateDisabled = !currentFile || !previousFile || isPending;

  return (
    <>
      {import.meta.env.DEV && <Agentation />}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div
          className="absolute top-0 right-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative container mx-auto px-4 py-8 md:py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-block mb-4">
              <span className="text-5xl md:text-6xl">📊</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 mb-4">
              엑셀 사용량 비교
            </h1>
            <div className="space-y-2">
              <p className="text-base md:text-lg text-purple-600 font-medium">
                💕 다현이를 위한 엑셀 계산 프로그램입니당 💕
              </p>
              <p className="text-sm md:text-base text-pink-500">
                당월과 전월 엑셀 파일을 업로드하여 사용량을 비교하세요 🥸 엣헴!
              </p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-6 md:p-8 space-y-8 mb-8">
            <FileUpload
              label="당월 엑셀 파일"
              value={currentFile}
              onChange={(file) => handleFileChange("current", file)}
            />

            <FileUpload
              label="전월 엑셀 파일"
              value={previousFile}
              onChange={(file) => handleFileChange("previous", file)}
            />

            {/* Calculate Button */}
            <div className="pt-8 mt-4 border-t-2 border-purple-100">
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculateDisabled}
                className={`
                w-full rounded-2xl px-8 py-5 text-lg font-bold text-white shadow-lg
                transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2
                ${
                  isCalculateDisabled
                    ? "bg-slate-300 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                }
              `}
              >
                {isPending ? (
                  <span className="flex items-center justify-center space-x-3">
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>열심히 계산하는 중... 🔢</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>비교 계산 실행</span>
                    <span>✨</span>
                  </span>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-rose-200 px-5 py-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">😢</span>
                  <p className="text-sm font-semibold text-rose-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 flex items-center gap-3">
                <span className="text-3xl">📋</span>
                비교 결과
              </h2>
              <ResultTable result={result} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
