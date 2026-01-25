import React, { useRef } from "react";
import type { ExcelFile } from "../types";

interface FileUploadProps {
  label: string;
  value: ExcelFile | null;
  onChange: (file: ExcelFile | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const excelFile: ExcelFile = {
        file,
        name: file.name,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      onChange(excelFile);
    }
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full space-y-3">
      <label className="flex items-center gap-2 text-base font-bold text-purple-700">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xs font-bold shadow-md">
          {label.includes("당월") ? "📅" : "📆"}
        </span>
        {label}
      </label>

      <div className="relative">
        {!value ? (
          <button
            type="button"
            onClick={handleClick}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-5 py-6 text-center transition-all duration-300 hover:border-purple-400 hover:from-purple-100 hover:via-pink-100 hover:to-blue-100 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div className="text-left">
                <p className="text-base font-bold text-purple-600">
                  클릭하여 엑셀 파일 선택
                </p>
                <p className="text-xs font-medium text-purple-400 mt-0.5">
                  📁 .xlsx, .xls 파일만 가능
                </p>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/10 to-purple-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-5 py-4 shadow-md">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 shadow-lg">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-700 truncate">
                    {value.name}
                  </p>
                  <p className="text-xs text-emerald-500 font-medium mt-0.5">
                    ✅ 파일 선택 완료
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-xl bg-gradient-to-br from-rose-100 to-red-100 border-2 border-rose-200 px-4 py-2.5 text-rose-600 text-sm font-bold transition-all duration-200 hover:from-rose-200 hover:to-red-200 hover:border-rose-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
              aria-label="Clear file"
            >
              🗑️ 파일 삭제
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          aria-label={label}
        />
      </div>
    </div>
  );
};
