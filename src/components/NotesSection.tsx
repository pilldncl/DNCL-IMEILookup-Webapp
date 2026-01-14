'use client';

import { useState, useEffect } from 'react';
import { ApiType, NoteHistoryEntry } from '@/types';
import { saveNoteToCloud, loadNoteFromCloud, loadNoteHistory } from '@/lib/firestore-notes';

interface NotesSectionProps {
  apiType: ApiType;
  imei: string;
}

export default function NotesSection({ apiType, imei }: NotesSectionProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [history, setHistory] = useState<NoteHistoryEntry[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);

  useEffect(() => {
    if (imei) {
      loadNotes();
      loadHistoryData();
    } else {
      setNotes('');
      setHistory([]);
    }
  }, [apiType, imei]);

  const loadNotes = async () => {
    if (!imei) return;
    
    // Try localStorage first
    const key = `extraNotes_${apiType}_${imei}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setNotes(cached);
    }

    // Then try Firebase
    try {
      const cloudNotes = await loadNoteFromCloud(apiType, imei);
      if (cloudNotes) {
        setNotes(cloudNotes);
        localStorage.setItem(key, cloudNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadHistoryData = async () => {
    if (!imei) return;
    try {
      const historyData = await loadNoteHistory(apiType, imei);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSave = async () => {
    if (!imei) return;
    
    setSaving(true);
    setSaveStatus('Saving...');
    
    // Save to localStorage immediately
    const key = `extraNotes_${apiType}_${imei}`;
    localStorage.setItem(key, notes);

    try {
      const success = await saveNoteToCloud(apiType, imei, notes, true);
      if (success) {
        setSaveStatus('✓ Saved');
        setTimeout(() => setSaveStatus(''), 2000);
        await loadHistoryData();
      } else {
        setSaveStatus('✗ Failed');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaveStatus('✗ Error');
      setTimeout(() => setSaveStatus(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setNotes(value);
    // Auto-save to localStorage
    if (imei) {
      const key = `extraNotes_${apiType}_${imei}`;
      localStorage.setItem(key, value);
    }
  };

  if (!imei) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-lg font-semibold text-primary tracking-wide">
          EXTRA NOTES{' '}
          {saveStatus && (
            <span className="text-sm font-normal text-green-600 ml-2">{saveStatus}</span>
          )}
        </label>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
          title="Save note to cloud"
        >
          💾 Save
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add any additional notes or comments... (Auto-saves to cloud as you type)"
        className="w-full p-2 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-primary focus:bg-white resize-y min-h-[40px] max-h-[75px] transition-colors"
      />
      
      {history.length > 0 && (
        <>
          <button
            onClick={() => setHistoryVisible(!historyVisible)}
            className="mt-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            📋 {historyVisible ? 'Hide' : 'Show'} History ({history.length} {history.length === 1 ? 'entry' : 'entries'})
          </button>
          
          {historyVisible && (
            <div className="mt-3 max-h-[200px] overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 text-xs">
              <div className="font-semibold mb-2 text-primary">Note History:</div>
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`mb-2.5 p-2 rounded border-l-4 ${
                    entry.isCurrent
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex justify-between mb-1 text-gray-600 text-xs">
                    <span>
                      <b>{entry.station}</b>{' '}
                      {entry.timestamp?.toDate
                        ? entry.timestamp.toDate().toLocaleString()
                        : entry.date}
                    </span>
                    {entry.isCurrent && (
                      <span className="text-primary font-semibold">CURRENT</span>
                    )}
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap break-words">
                    {entry.note}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
