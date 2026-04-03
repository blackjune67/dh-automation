import React from 'react';
import type { ComparisonResult, CategoryData } from '../types';

interface ResultTableProps {
  result: ComparisonResult;
}

const ResultTable: React.FC<ResultTableProps> = ({ result }) => {
  /**
   * Formats a number with Korean locale formatting
   */
  const formatNumber = (value: number): string => {
    return value.toLocaleString('ko-KR');
  };

  /**
   * Returns badge style classes based on the difference value
   * Positive values (increase) → red badge, Negative (decrease) → blue badge
   */
  const getDiffBadgeClass = (value: number): string => {
    if (value > 0) return 'bg-red-100 text-red-700 ring-1 ring-red-200/80';
    if (value < 0) return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/80';
    return 'bg-gray-100 text-gray-500 ring-1 ring-gray-200/60';
  };

  /**
   * Arrow indicator for the difference value
   */
  const getDiffArrow = (value: number): string => {
    if (value > 0) return '▲';
    if (value < 0) return '▼';
    return '―';
  };

  /**
   * Calculates the total difference between current and previous totals
   */
  const getTotalDifference = (): number => {
    return result.currentTotal - result.previousTotal;
  };

  const totalDiff = getTotalDifference();

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-purple-100/60 shadow-xl shadow-purple-100/30">
      <table className="min-w-full border-collapse">

        {/* ── Gradient header ── */}
        <thead>
          <tr className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-600">
            {[
              '카테고리',
              '당월 사용량',
              '당월 재고조정',
              '당월 소계',
              '전월 사용량',
              '전월 재고조정',
              '전월 소계',
              '증감',
            ].map((col, i) => (
              <th
                key={col}
                className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white/90 whitespace-nowrap
                  ${i === 0 ? 'text-left' : 'text-right'}
                  ${i === 0 ? 'rounded-tl-2xl' : ''}
                  ${i === 7 ? 'rounded-tr-2xl' : ''}
                `}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-purple-50">
          {result.categories.map((category: CategoryData, index: number) => (
            <tr
              key={index}
              className={`
                group transition-all duration-200
                hover:bg-gradient-to-r hover:from-purple-50/80 hover:via-fuchsia-50/50 hover:to-blue-50/80
                table-row-animate
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
              `}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {/* Category name */}
              <td className="px-4 py-3 text-left text-sm font-semibold text-gray-800 whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 shrink-0 group-hover:scale-125 transition-transform duration-200" />
                  {category.category}
                </span>
              </td>

              {/* Current usage */}
              <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums">
                {formatNumber(category.currentUsage)}
              </td>

              {/* Current adjustment */}
              <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums">
                {formatNumber(category.currentAdjustment)}
              </td>

              {/* Current subtotal */}
              <td className="px-4 py-3 text-right text-sm font-bold text-purple-900 tabular-nums">
                {formatNumber(category.currentSubtotal)}
              </td>

              {/* Previous usage */}
              <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums">
                {formatNumber(category.previousUsage)}
              </td>

              {/* Previous adjustment */}
              <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums">
                {formatNumber(category.previousAdjustment)}
              </td>

              {/* Previous subtotal */}
              <td className="px-4 py-3 text-right text-sm font-bold text-blue-900 tabular-nums">
                {formatNumber(category.previousSubtotal)}
              </td>

              {/* Difference badge */}
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${getDiffBadgeClass(category.difference)}`}>
                  <span className="text-[10px] leading-none">{getDiffArrow(category.difference)}</span>
                  {formatNumber(Math.abs(category.difference))}
                </span>
              </td>
            </tr>
          ))}

          {/* ── Total row ── */}
          <tr className="bg-gradient-to-r from-purple-50 via-fuchsia-50/80 to-blue-50 border-t-2 border-purple-200/60">
            <td className="px-4 py-4 text-left text-sm font-black text-purple-900 rounded-bl-2xl">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600" />
                전체 합계
              </span>
            </td>
            <td className="px-4 py-4 text-right text-sm text-gray-400">―</td>
            <td className="px-4 py-4 text-right text-sm text-gray-400">―</td>
            <td className="px-4 py-4 text-right text-sm font-black text-purple-900 tabular-nums">
              {formatNumber(result.currentTotal)}
            </td>
            <td className="px-4 py-4 text-right text-sm text-gray-400">―</td>
            <td className="px-4 py-4 text-right text-sm text-gray-400">―</td>
            <td className="px-4 py-4 text-right text-sm font-black text-blue-900 tabular-nums">
              {formatNumber(result.previousTotal)}
            </td>

            {/* Total difference badge — larger */}
            <td className="px-4 py-4 text-right rounded-br-2xl">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black tabular-nums shadow-sm ${getDiffBadgeClass(totalDiff)}`}>
                <span className="text-[11px] leading-none">{getDiffArrow(totalDiff)}</span>
                {formatNumber(Math.abs(totalDiff))}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
