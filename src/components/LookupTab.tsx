'use client';

import { useState, useEffect, useRef } from 'react';
import { DeviceData, ApiType, ImeiHistoryItem } from '@/types';
import { detectInputType } from '@/lib/utils';
import DeviceDisplay from './DeviceDisplay';
import NotesSection from './NotesSection';
import HistoryButtons from './HistoryButtons';

interface LookupTabProps {
  apiType: ApiType;
}

export default function LookupTab({ apiType }: LookupTabProps) {
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'pass' | 'fail' | 'pending' | ''>('');
  const [history, setHistory] = useState<ImeiHistoryItem[]>([]);
  const [rawVisible, setRawVisible] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    loadHistory();
  }, [apiType]);

  const loadHistory = () => {
    if (typeof window === 'undefined') return;
    const key = `imeiHistory_${apiType}`;
    const historyStr = localStorage.getItem(key);
    if (historyStr) {
      try {
        setHistory(JSON.parse(historyStr));
      } catch (e) {
        setHistory([]);
      }
    }
  };

  const saveHistory = (imei: string, data: DeviceData) => {
    if (typeof window === 'undefined') return;
    const key = `imeiHistory_${apiType}`;
    let historyItems: ImeiHistoryItem[] = [];
    
    try {
      const existing = localStorage.getItem(key);
      if (existing) {
        historyItems = JSON.parse(existing);
      }
    } catch (e) {
      historyItems = [];
    }

    // Remove duplicates
    historyItems = historyItems.filter(item => 
      item.imei.toLowerCase() !== imei.toLowerCase()
    );

    // Determine status
    let status: 'pass' | 'fail' | 'pending' | '' = '';
    const workingStatus = String(data.working || '').toLowerCase();
    if (workingStatus === 'yes' || workingStatus === 'pass' || workingStatus === 'pass*') {
      status = 'pass';
    } else if (workingStatus === 'no' || workingStatus === 'fail' || workingStatus === 'fail*') {
      status = 'fail';
    } else if (workingStatus === 'pending' || workingStatus === 'incomplete' || workingStatus === 'incomplete*') {
      status = 'pending';
    }

    // Add to beginning
    historyItems.unshift({
      imei,
      model: data.model || 'Unknown',
      memory: data.memory || '',
      carrier: data.carrier || '',
      status
    });

    // Keep only last 3
    historyItems = historyItems.slice(0, 3);
    localStorage.setItem(key, JSON.stringify(historyItems));
    setHistory(historyItems);
  };

  const handleSearchWithImei = async (imeiToSearch: string) => {
    const input = imeiToSearch.trim();
    setError('');
    setDeviceData(null);
    setStatus('');
    setRawVisible(false);

    const inputType = detectInputType(input);
    if (!inputType) {
      if (/[^A-Za-z0-9]/.test(input) || input.length < 8 || input.length > 15) {
        setError('Please enter 8-15 letters and numbers (no spaces or symbols).');
      } else if (/^\d+$/.test(input)) {
        setError('IMEI must be 8-15 digits.');
      } else {
        setError('Serial must be 8-15 letters and numbers.');
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/${apiType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imei: input }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch device data');
      }

      if (result.success && result.data) {
        const data = result.data as DeviceData;
        setDeviceData(data);
        saveHistory(input, data);

        const workingStatus = String(data.working || '').toLowerCase();
        if (workingStatus === 'yes' || workingStatus === 'pass' || workingStatus === 'pass*') {
          setStatus('pass');
        } else if (workingStatus === 'no' || workingStatus === 'fail' || workingStatus === 'fail*') {
          setStatus('fail');
        } else if (workingStatus === 'pending' || workingStatus === 'incomplete' || workingStatus === 'incomplete*') {
          setStatus('pending');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStatus('fail');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await handleSearchWithImei(imei);
  };

  const handleHistoryClick = async (historyImei: string) => {
    setImei(historyImei);
    // Trigger search after state update
    setTimeout(() => {
      handleSearchWithImei(historyImei);
    }, 100);
  };

  const handleClearHistory = () => {
    if (typeof window === 'undefined') return;
    const key = `imeiHistory_${apiType}`;
    localStorage.removeItem(key);
    setHistory([]);
  };

  return (
    <div>
      {/* History Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <HistoryButtons
          history={history}
          onItemClick={handleHistoryClick}
          apiType={apiType}
        />
        <button
          onClick={handleClearHistory}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="Clear History"
          aria-label="Clear IMEI History"
        >
          🗑️
        </button>
      </div>

      {/* Input */}
      <input
        id={`${apiType}ImeiInput`}
        type="text"
        value={imei}
        onChange={(e) => setImei(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        placeholder="Enter IMEI or Serial (8-15 digits)"
        maxLength={15}
        className="w-full px-4 py-3.5 mb-4 text-xl border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-colors"
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full py-3.5 px-4 mb-4 text-xl font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Status/Error Display */}
      {error && (
        <div className="min-h-8 mb-4 p-3 text-center border-2 border-red-300 bg-red-50 text-red-700 font-semibold rounded-lg uppercase tracking-wide">
          {error}
        </div>
      )}

      {status && !error && (
        <div
          className={`min-h-8 mb-4 p-3 text-center border-2 rounded-lg font-bold text-lg uppercase tracking-wide ${
            status === 'pass'
              ? 'bg-green-50 border-green-500 text-green-700'
              : status === 'fail'
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-yellow-50 border-yellow-500 text-yellow-700'
          }`}
        >
          {status === 'pass' ? 'SUCCESS' : status === 'fail' ? 'FAILED' : 'PENDING'}
        </div>
      )}

      {/* Device Display */}
      {deviceData && (
        <div className="mt-4">
          <DeviceDisplay
            data={deviceData}
            apiType={apiType}
            rawVisible={rawVisible}
            onToggleRaw={() => setRawVisible(!rawVisible)}
          />
          <NotesSection
            apiType={apiType}
            imei={deviceData.imei || imei}
          />
        </div>
      )}
    </div>
  );
}
