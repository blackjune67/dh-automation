import { Agentation } from "agentation";
import { FileUpload } from "./components/FileUpload";
import { LoadingStatus } from "./components/LoadingStatus";
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-sky-50 relative overflow-hidden">

        {/* ── Aurora background blobs ── */}
        <div className="absolute top-[-8%] left-[-6%] w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[90px] animate-aurora" />
        <div className="absolute top-[-4%] right-[-6%] w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[80px] animate-aurora-reverse" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[30%] left-[-8%] w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-[70px] animate-aurora" style={{ animationDelay: "7s" }} />
        <div className="absolute top-[20%] right-[-4%] w-[26rem] h-[26rem] bg-blue-300 rounded-full mix-blend-multiply filter blur-[90px] animate-aurora-reverse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-8%] left-[20%] w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-[80px] animate-aurora" style={{ animationDelay: "10s" }} />
        <div className="absolute bottom-[-4%] right-[25%] w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-[70px] animate-aurora-reverse" style={{ animationDelay: "5s" }} />

        {/* ── Floating micro-particles ── */}
        <div className="absolute top-[22%] left-[18%] w-2 h-2 rounded-full bg-purple-400/50 animate-particle" style={{ animationDelay: "0s" }} />
        <div className="absolute top-[35%] right-[22%] w-1.5 h-1.5 rounded-full bg-pink-400/50 animate-particle" style={{ animationDelay: "1.8s" }} />
        <div className="absolute top-[60%] left-[30%] w-2.5 h-2.5 rounded-full bg-blue-400/40 animate-particle" style={{ animationDelay: "3.2s" }} />
        <div className="absolute top-[48%] right-[15%] w-1.5 h-1.5 rounded-full bg-violet-400/50 animate-particle" style={{ animationDelay: "4.8s" }} />
        <div className="absolute top-[75%] left-[65%] w-2 h-2 rounded-full bg-fuchsia-400/40 animate-particle" style={{ animationDelay: "2.4s" }} />
        <div className="absolute top-[12%] left-[50%] w-1.5 h-1.5 rounded-full bg-sky-400/40 animate-particle" style={{ animationDelay: "6s" }} />

        <div className="relative container mx-auto px-4 py-8 md:py-12 max-w-6xl">

          {/* ── Header ── */}
          <div className="text-center mb-10 md:mb-14 animate-slide-up">
            <div className="inline-block mb-4 animate-float-y">
              <span className="text-5xl md:text-6xl">📊</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 mb-4 animate-shimmer">
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

          {/* ── File Upload Section ── */}
          <div
            className="glass-card gradient-border rounded-3xl animate-glow-pulse p-6 md:p-8 space-y-8 mb-8 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
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
            <div className="pt-8 mt-4 border-t-2 border-purple-100/60">
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculateDisabled}
                className={`
                  w-full rounded-2xl px-8 py-5 text-lg font-bold text-white
                  transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2
                  cursor-pointer
                  ${
                    isCalculateDisabled
                      ? "bg-slate-300 cursor-not-allowed opacity-50 shadow-none"
                      : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 shadow-lg shadow-purple-300/40 hover:shadow-2xl hover:shadow-purple-400/50 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 hover:scale-[1.025] active:scale-[0.975]"
                  }
                `}
              >
                {isPending ? (
                  <LoadingStatus />
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
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-rose-200/80 px-5 py-4 shadow-sm shadow-rose-100 animate-slide-up">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">😢</span>
                  <p className="text-sm font-semibold text-rose-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div
              className="glass-card gradient-border rounded-3xl animate-glow-pulse p-6 md:p-8 animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
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
