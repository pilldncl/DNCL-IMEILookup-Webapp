'use client';

import { useState } from 'react';
import { ApiType } from '@/types';

interface FilterSidebarProps {
  filters: {
    tabName: ApiType | '';
    station: string;
    dateFrom: string;
    dateTo: string;
    userName: string;
    searchText: string;
  };
  onFiltersChange: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
  stats: {
    total: number;
    byTab: { phonecheck: number; iceq: number };
    byStation: Record<string, number>;
    withHistory: number;
    withNotes: number;
  };
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  stats,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    source: true,
    station: true,
    date: true,
    user: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Get unique stations from stats
  const stations = Object.keys(stats.byStation).sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Source/Tab Filter */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('source')}
          className="w-full flex justify-between items-center text-left font-medium text-gray-900 mb-2 hover:text-gray-700"
        >
          <span>Source</span>
          <span className="text-gray-400">{expandedSections.source ? '▼' : '▶'}</span>
        </button>
        {expandedSections.source && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="source-all"
                name="source-operator"
                checked={true}
                readOnly
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="source-all" className="text-sm text-gray-700">All sources</label>
            </div>
            <div className="space-y-2 pl-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={filters.tabName === 'phonecheck'}
                  onChange={() => handleFilterChange('tabName', 'phonecheck')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Phonecheck</span>
                <span className="ml-auto text-xs text-gray-500">({stats.byTab.phonecheck})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={filters.tabName === 'iceq'}
                  onChange={() => handleFilterChange('tabName', 'iceq')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">ICE-Q</span>
                <span className="ml-auto text-xs text-gray-500">({stats.byTab.iceq})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="source"
                  checked={filters.tabName === ''}
                  onChange={() => handleFilterChange('tabName', '')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">All</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Station Filter */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('station')}
          className="w-full flex justify-between items-center text-left font-medium text-gray-900 mb-2 hover:text-gray-700"
        >
          <span>Station</span>
          <span className="text-gray-400">{expandedSections.station ? '▼' : '▶'}</span>
        </button>
        {expandedSections.station && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="station-is"
                name="station-operator"
                checked={true}
                readOnly
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="station-is" className="text-sm text-gray-700">is</label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.station}
                onChange={(e) => handleFilterChange('station', e.target.value)}
                placeholder="Search for a station..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {stations.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {stations.slice(0, 10).map((station) => (
                  <label key={station} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.station === station}
                      onChange={(e) => handleFilterChange('station', e.target.checked ? station : '')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 flex-1">{station}</span>
                    <span className="text-xs text-gray-500">({stats.byStation[station]})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Filter */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('date')}
          className="w-full flex justify-between items-center text-left font-medium text-gray-900 mb-2 hover:text-gray-700"
        >
          <span>Last Updated</span>
          <span className="text-gray-400">{expandedSections.date ? '▼' : '▶'}</span>
        </button>
        {expandedSections.date && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="date-is"
                name="date-operator"
                checked={true}
                readOnly
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="date-is" className="text-sm text-gray-700">is</label>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From (including)</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To (including)</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Filter */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection('user')}
          className="w-full flex justify-between items-center text-left font-medium text-gray-900 mb-2 hover:text-gray-700"
        >
          <span>User</span>
          <span className="text-gray-400">{expandedSections.user ? '▼' : '▶'}</span>
        </button>
        {expandedSections.user && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="user-is"
                name="user-operator"
                checked={true}
                readOnly
                className="text-primary focus:ring-primary"
              />
              <label htmlFor="user-is" className="text-sm text-gray-700">is</label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={filters.userName}
                onChange={(e) => handleFilterChange('userName', e.target.value)}
                placeholder="Search for a user..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <button
          onClick={onApply}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
