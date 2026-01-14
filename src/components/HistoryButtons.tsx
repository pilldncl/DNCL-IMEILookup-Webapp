'use client';

import { ImeiHistoryItem, ApiType } from '@/types';

interface HistoryButtonsProps {
  history: ImeiHistoryItem[];
  onItemClick: (imei: string) => void;
  apiType: ApiType;
}

export default function HistoryButtons({ history, onItemClick, apiType }: HistoryButtonsProps) {
  // Ensure we always have 3 slots
  const displayHistory = [...history];
  while (displayHistory.length < 3) {
    displayHistory.push({ imei: '', model: '', memory: '', carrier: '', status: '' });
  }

  return (
    <div className="flex gap-2 flex-1">
      {displayHistory.map((item, index) => {
        if (!item.imei) {
          return (
            <div
              key={index}
              className="flex-1 h-16 bg-gray-100 border border-gray-200 rounded"
            />
          );
        }

        const statusClass =
          item.status === 'pass'
            ? 'border-green-500 bg-green-50'
            : item.status === 'fail'
            ? 'border-red-500 bg-red-50'
            : item.status === 'pending'
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-300 bg-gray-50';

        return (
          <button
            key={index}
            onClick={() => onItemClick(item.imei)}
            className={`flex-1 h-16 p-2 border-2 rounded text-left hover:opacity-80 transition-opacity ${statusClass}`}
          >
            <div className="text-xs font-semibold text-gray-800 truncate">
              {item.model} {item.memory} {item.carrier}
            </div>
            <div className="text-xs text-gray-600 truncate mt-1">{item.imei}</div>
          </button>
        );
      })}
    </div>
  );
}
