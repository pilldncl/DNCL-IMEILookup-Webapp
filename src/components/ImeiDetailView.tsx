'use client';

import { useState } from 'react';
import { ApiType, NoteData, NoteHistoryEntry } from '@/types';
import Link from 'next/link';

interface ImeiDetailViewProps {
  imei: string;
  tabName: ApiType;
  details: NoteData | null;
  loading: boolean;
  onBack: () => void;
}

export default function ImeiDetailView({
  imei,
  tabName,
  details,
  loading,
  onBack,
}: ImeiDetailViewProps) {
  const [historyExpanded, setHistoryExpanded] = useState(true);

  if (loading) {
    return (
      <div className="mt-6 text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Loading details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-600 mb-4">No details found for this IMEI</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{imei}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${
              tabName === 'phonecheck' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {tabName === 'phonecheck' ? 'Phonecheck' : 'ICE-Q'}
            </span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to List
        </button>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-600 mb-1">Station</div>
            <div className="font-semibold text-gray-900">{details.station || 'N/A'}</div>
          </div>
          {details.userName && (
            <div>
              <div className="text-sm text-gray-600 mb-1">User</div>
              <div className="font-semibold text-gray-900">{details.userName}</div>
            </div>
          )}
          {details.location && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Location</div>
              <div className="font-semibold text-gray-900">{details.location}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 mb-1">Last Updated</div>
            <div className="font-semibold text-gray-900">{details.updatedDate || 'N/A'}</div>
          </div>
        </div>

        {/* Current Note */}
        {details.currentNote ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-gray-800">Current Note</h4>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                {details.currentNote}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-500 italic">No current note</p>
          </div>
        )}

        {/* History */}
        {details.history && details.history.length > 0 && (
          <div>
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="flex justify-between items-center w-full mb-2"
            >
              <h4 className="text-lg font-semibold text-gray-800">
                History ({details.history.length} entries)
              </h4>
              <span className="text-gray-500">
                {historyExpanded ? '▼' : '▶'}
              </span>
            </button>
            
            {historyExpanded && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {details.history.map((entry: NoteHistoryEntry, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {entry.station} - {entry.date}
                      </span>
                      {entry.timestamp?.toDate && (
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toDate().toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {entry.note}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href={`/?tab=${tabName}&imei=${imei}`}
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lookup this IMEI
          </Link>
        </div>
      </div>
    </div>
  );
}
