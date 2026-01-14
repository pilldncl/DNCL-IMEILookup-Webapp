'use client';

import { useState } from 'react';
import { ApiType } from '@/types';

interface ImeiListItem {
  imei: string;
  tabName: ApiType;
  station: string;
  userName: string;
  updatedDate: string;
  hasNote: boolean;
  historyCount: number;
}

interface ImeiListProps {
  imeis: ImeiListItem[];
  loading: boolean;
  onImeiClick: (imei: string, tabName: ApiType) => void;
}

export default function ImeiList({ imeis, loading, onImeiClick }: ImeiListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'imei' | 'station'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedImeis = [...imeis].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = (a.updatedDate || '').localeCompare(b.updatedDate || '');
    } else if (sortBy === 'imei') {
      comparison = a.imei.localeCompare(b.imei);
    } else if (sortBy === 'station') {
      comparison = a.station.localeCompare(b.station);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'date' | 'imei' | 'station') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="mt-6 text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Loading IMEIs...</p>
      </div>
    );
  }

  if (imeis.length === 0) {
    return (
      <div className="mt-6 text-center py-8 text-gray-500">
        No IMEIs found. Try adjusting your filters or add some notes first.
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-end mb-2">
        <div className="flex gap-2 text-sm">
          <span className="text-gray-600 self-center">Sort by:</span>
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              sortBy === 'date' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('imei')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              sortBy === 'imei' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            IMEI {sortBy === 'imei' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('station')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              sortBy === 'station' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Station {sortBy === 'station' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  IMEI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Station
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedImeis.map((item, index) => (
                <tr
                  key={`${item.tabName}-${item.imei}-${index}`}
                  onClick={() => onImeiClick(item.imei, item.tabName)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.imei}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.tabName === 'phonecheck' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.tabName === 'phonecheck' ? 'Phonecheck' : 'ICE-Q'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.station}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.userName || <span className="text-gray-400">-</span>}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.updatedDate || <span className="text-gray-400">-</span>}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex justify-center gap-1">
                      {item.hasNote && (
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800" 
                          title="Has Note"
                        >
                          📝 Note
                        </span>
                      )}
                      {item.historyCount > 0 && (
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800" 
                          title={`${item.historyCount} history entries`}
                        >
                          📋 {item.historyCount}
                        </span>
                      )}
                      {!item.hasNote && item.historyCount === 0 && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-500 text-center">
        Click on any row to view full details
      </div>
    </div>
  );
}
