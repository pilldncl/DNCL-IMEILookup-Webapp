'use client';

import { useState, useEffect } from 'react';
import { ApiType, NoteData } from '@/types';
import { getAllImeis, getImeiDetails, searchNotesByText } from '@/lib/firestore-notes';
import { db } from '@/lib/firebase';
import FilterSidebar from './FilterSidebar';
import ImeiList from './ImeiList';
import ImeiDetailView from './ImeiDetailView';
import Pagination from './Pagination';

interface ImeiListItem {
  imei: string;
  tabName: ApiType;
  station: string;
  userName: string;
  updatedDate: string;
  hasNote: boolean;
  historyCount: number;
}

const ITEMS_PER_PAGE = 50;

export default function FirebaseSearch() {
  const [loading, setLoading] = useState(false);
  const [allImeis, setAllImeis] = useState<ImeiListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImei, setSelectedImei] = useState<{ imei: string; tabName: ApiType } | null>(null);
  const [imeiDetails, setImeiDetails] = useState<NoteData | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [filters, setFilters] = useState({
    tabName: '' as ApiType | '',
    station: '',
    dateFrom: '',
    dateTo: '',
    userName: '',
    searchText: '',
  });
  const [showFilters, setShowFilters] = useState(true);
  const [error, setError] = useState<string>('');

  // Check Firebase connection on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!db) {
        setError('Firebase not initialized. Please check your environment variables.');
        console.error('Firebase db is not initialized');
      } else {
        console.log('Firebase db is initialized');
      }
    }
  }, []);

  // Load IMEIs on mount (default: top 50)
  useEffect(() => {
    if (db) {
      loadImeis();
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.tabName, filters.station, filters.dateFrom, filters.dateTo, filters.userName, filters.searchText]);

  const loadImeis = async () => {
    if (!db) {
      setError('Firebase not initialized');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (filters.searchText.trim()) {
        // Use text search - get all matching results
        const results = await searchNotesByText(filters.searchText, {
          tabName: filters.tabName || undefined,
          station: filters.station || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          userName: filters.userName || undefined,
        });
        
        // Convert to list format
        const listItems: ImeiListItem[] = results.map(item => ({
          imei: item.imei,
          tabName: item.tabName,
          station: item.data.station || 'Unknown',
          userName: item.data.userName || '',
          updatedDate: item.data.updatedDate || '',
          hasNote: !!item.data.currentNote,
          historyCount: item.data.history?.length || 0
        }));
        setAllImeis(listItems);
      } else {
        // Load IMEIs with filters - default limit of 50 for initial load
        // When filters are applied, remove limit to get all matching results
        const hasActiveFilters = filters.tabName || filters.station || filters.dateFrom || filters.dateTo || filters.userName;
        const results = await getAllImeis({
          tabName: filters.tabName || undefined,
          station: filters.station || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          userName: filters.userName || undefined,
          limitCount: hasActiveFilters ? undefined : ITEMS_PER_PAGE, // Only limit when no filters
        });
        setAllImeis(results);
        console.log(`Loaded ${results.length} IMEIs from Firebase`);
      }
    } catch (error: any) {
      console.error('Error loading IMEIs:', error);
      setError(`Error loading data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    loadImeis();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      tabName: '' as ApiType | '',
      station: '',
      dateFrom: '',
      dateTo: '',
      userName: '',
      searchText: '',
    };
    setFilters(clearedFilters);
  };

  const handleImeiClick = async (imei: string, tabName: ApiType) => {
    setSelectedImei({ imei, tabName });
    setLoadingDetails(true);
    setViewMode('detail');
    
    try {
      const details = await getImeiDetails(tabName, imei);
      setImeiDetails(details);
    } catch (error) {
      console.error('Error loading IMEI details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedImei(null);
    setImeiDetails(null);
  };

  // Get active filters (non-empty)
  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value && value !== '' && key !== 'searchText'
  );

  // Calculate pagination
  const totalItems = allImeis.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageImeis = allImeis.slice(startIndex, endIndex);

  // Calculate statistics (from all results, not just current page)
  const stats = {
    total: allImeis.length,
    byTab: {
      phonecheck: allImeis.filter(r => r.tabName === 'phonecheck').length,
      iceq: allImeis.filter(r => r.tabName === 'iceq').length,
    },
    byStation: {} as Record<string, number>,
    withHistory: allImeis.filter(r => r.historyCount > 0).length,
    withNotes: allImeis.filter(r => r.hasNote).length,
  };

  allImeis.forEach(item => {
    const station = item.station || 'Unknown';
    stats.byStation[station] = (stats.byStation[station] || 0) + 1;
  });

  if (viewMode === 'detail') {
    return (
      <ImeiDetailView
        imei={selectedImei?.imei || ''}
        tabName={selectedImei?.tabName || 'phonecheck'}
        details={imeiDetails}
        loading={loadingDetails}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="flex gap-4">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${showFilters ? '' : ''}`}>
        {/* Global Search and Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-semibold text-gray-900">IMEIs</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{totalItems} results</span>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Global Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => handleFilterChange({ ...filters, searchText: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              placeholder="Search by IMEI, station, user, or note content..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.tabName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Source: {filters.tabName === 'phonecheck' ? 'Phonecheck' : 'ICE-Q'}
                  <button
                    onClick={() => handleFilterChange({ ...filters, tabName: '' as ApiType | '' })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.station && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Station: {filters.station}
                  <button
                    onClick={() => handleFilterChange({ ...filters, station: '' })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.userName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  User: {filters.userName}
                  <button
                    onClick={() => handleFilterChange({ ...filters, userName: '' })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                  <button
                    onClick={() => handleFilterChange({ ...filters, dateFrom: '', dateTo: '' })}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Statistics Bar */}
        {allImeis.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="ml-1 text-gray-600">{stats.total}</span>
              </div>
              <div>
                <span className="font-semibold text-blue-600">Phonecheck:</span>
                <span className="ml-1 text-gray-600">{stats.byTab.phonecheck}</span>
              </div>
              <div>
                <span className="font-semibold text-green-600">ICE-Q:</span>
                <span className="ml-1 text-gray-600">{stats.byTab.iceq}</span>
              </div>
              <div>
                <span className="font-semibold text-purple-600">With Notes:</span>
                <span className="ml-1 text-gray-600">{stats.withNotes}</span>
              </div>
              <div>
                <span className="font-semibold text-orange-600">With History:</span>
                <span className="ml-1 text-gray-600">{stats.withHistory}</span>
              </div>
            </div>
          </div>
        )}

        {/* IMEI List Table */}
        <ImeiList
          imeis={currentPageImeis}
          loading={loading}
          onImeiClick={handleImeiClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Filter Sidebar */}
      {showFilters && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            stats={stats}
          />
        </div>
      )}
    </div>
  );
}
