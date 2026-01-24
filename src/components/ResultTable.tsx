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
   * Returns the appropriate color class based on the value
   * Positive values (increase) are red, negative values (decrease) are blue
   */
  const getDifferenceColor = (value: number): string => {
    if (value > 0) return 'text-red-600';
    if (value < 0) return 'text-blue-600';
    return 'text-gray-900';
  };

  /**
   * Calculates the sum of current subtotals for Medicine and Consumable categories
   */
  const getMedicineConsumableCurrentSum = (): number => {
    return result.categories
      .filter(cat => cat.category === '의약품' || cat.category === '소모품')
      .reduce((sum, cat) => sum + cat.currentSubtotal, 0);
  };

  /**
   * Calculates the sum of previous subtotals for Medicine and Consumable categories
   */
  const getMedicineConsumablePreviousSum = (): number => {
    return result.categories
      .filter(cat => cat.category === '의약품' || cat.category === '소모품')
      .reduce((sum, cat) => sum + cat.previousSubtotal, 0);
  };

  /**
   * Calculates the difference for Medicine and Consumable sum
   */
  const getMedicineConsumableDifference = (): number => {
    const currentSum = getMedicineConsumableCurrentSum();
    const previousSum = getMedicineConsumablePreviousSum();
    return currentSum - previousSum;
  };

  /**
   * Calculates the total difference between current and previous totals
   */
  const getTotalDifference = (): number => {
    return result.currentTotal - result.previousTotal;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 bg-white shadow-lg">
        {/* Header */}
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
              카테고리
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              당월 사용량
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              당월 재고조정
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              당월 소계
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              전월 사용량
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              전월 재고조정
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              전월 소계
            </th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
              증감
            </th>
          </tr>
        </thead>

        {/* Body - Category Rows */}
        <tbody>
          {result.categories.map((category: CategoryData, index: number) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="border border-gray-300 px-4 py-2 text-left">
                {category.category}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {formatNumber(category.currentUsage)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {formatNumber(category.currentAdjustment)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                {formatNumber(category.currentSubtotal)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {formatNumber(category.previousUsage)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                {formatNumber(category.previousAdjustment)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                {formatNumber(category.previousSubtotal)}
              </td>
              <td className={`border border-gray-300 px-4 py-2 text-right font-bold ${getDifferenceColor(category.difference)}`}>
                {formatNumber(category.difference)}
              </td>
            </tr>
          ))}

          {/* Medicine + Consumable Sum Row */}
          <tr className="bg-yellow-50">
            <td className="border border-gray-300 px-4 py-2 text-left font-bold">
              의약품 + 소모품
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right font-bold">
              {formatNumber(getMedicineConsumableCurrentSum())}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right font-bold">
              {formatNumber(getMedicineConsumablePreviousSum())}
            </td>
            <td className={`border border-gray-300 px-4 py-2 text-right font-bold ${getDifferenceColor(getMedicineConsumableDifference())}`}>
              {formatNumber(getMedicineConsumableDifference())}
            </td>
          </tr>

          {/* Total Row */}
          <tr className="bg-gray-100">
            <td className="border border-gray-300 px-4 py-3 text-left font-bold">
              전체 합계
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right font-bold">
              {formatNumber(result.currentTotal)}
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right">
              -
            </td>
            <td className="border border-gray-300 px-4 py-3 text-right font-bold">
              {formatNumber(result.previousTotal)}
            </td>
            <td className={`border border-gray-300 px-4 py-3 text-right font-bold ${getDifferenceColor(getTotalDifference())}`}>
              {formatNumber(getTotalDifference())}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
