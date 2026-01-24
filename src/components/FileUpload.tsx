import React, { useRef } from 'react';
import type { ExcelFile } from '../types';

interface FileUploadProps {
  label: string;
  value: ExcelFile | null;
  onChange: (file: ExcelFile | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange }) => {
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
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {!value ? (
          <button
            type="button"
            onClick={handleClick}
            className="w-full group relative overflow-hidden rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-8 text-center transition-all duration-300 hover:border-blue-500 hover:from-blue-100 hover:to-indigo-100 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="rounded-full bg-blue-500 p-3 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-base font-bold text-slate-800">
                  Choose Excel file
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  or drag and drop here
                </p>
              </div>

              <p className="text-xs font-medium text-blue-600">
                .xlsx, .xls files only
              </p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        ) : (
          <div className="group relative overflow-hidden rounded-xl border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="rounded-lg bg-green-500 p-2.5 shadow-md">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {value.name}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">
                    File selected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="ml-3 flex-shrink-0 rounded-lg bg-red-500 p-2 text-white shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Clear file"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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
