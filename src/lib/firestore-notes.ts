import { db } from './firebase';
import { 
  collection, 
  collectionGroup,
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { NoteData, NoteHistoryEntry, StationConfig, ApiType } from '@/types';

/**
 * Get station config from localStorage
 */
export function getStationConfig(): StationConfig {
  if (typeof window === 'undefined') {
    return { stationName: 'Station-1', userName: '', location: '' };
  }
  
  return {
    stationName: localStorage.getItem('stationName') || 'Station-1',
    userName: localStorage.getItem('userName') || '',
    location: localStorage.getItem('location') || ''
  };
}

/**
 * Save a note to Firebase
 */
export async function saveNoteToCloud(
  tabName: ApiType,
  imei: string,
  notes: string,
  appendHistory: boolean = false
): Promise<boolean> {
  if (!db || !imei) return false;

  try {
    const noteRef = doc(db, 'notes', tabName, 'imei', imei);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const stationConfig = getStationConfig();

    if (appendHistory) {
      const docSnap = await getDoc(noteRef);
      const existingData = docSnap.exists() ? (docSnap.data() as any) : { 
        currentNote: '', 
        history: [] 
      };

      const existingHistory = Array.isArray(existingData.history) ? existingData.history : [];
      
      if (existingData.currentNote && existingData.currentNote !== notes) {
        existingHistory.push({
          note: existingData.currentNote,
          date: existingData.updatedDate || dateStr,
          station: existingData.station || stationConfig.stationName,
          timestamp: existingData.updatedAt || Timestamp.now()
        });
      }

      await setDoc(noteRef, {
        currentNote: notes || '',
        updatedAt: serverTimestamp(),
        updatedDate: dateStr,
        station: stationConfig.stationName,
        userName: stationConfig.userName || '',
        location: stationConfig.location || '',
        history: existingHistory
      });
    } else {
      await setDoc(noteRef, {
        currentNote: notes || '',
        updatedAt: serverTimestamp(),
        updatedDate: dateStr,
        station: stationConfig.stationName,
        userName: stationConfig.userName || '',
        location: stationConfig.location || ''
      }, { merge: true });
    }

    return true;
  } catch (error) {
    console.error('Error saving note to Firebase:', error);
    return false;
  }
}

/**
 * Load a note from Firebase
 */
export async function loadNoteFromCloud(
  tabName: ApiType,
  imei: string
): Promise<string> {
  if (!db || !imei) return '';

  try {
    const noteRef = doc(db, 'notes', tabName, 'imei', imei);
    const docSnap = await getDoc(noteRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      return data.currentNote || '';
    }
    
    return '';
  } catch (error) {
    console.error('Error loading note from Firebase:', error);
    return '';
  }
}

/**
 * Load note history for a specific IMEI
 */
export async function loadNoteHistory(
  tabName: ApiType,
  imei: string
): Promise<NoteHistoryEntry[]> {
  if (!db || !imei) return [];

  try {
    const noteRef = doc(db, 'notes', tabName, 'imei', imei);
    const docSnap = await getDoc(noteRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      
      // Handle history - it might be an array or a map/object
      let history: NoteHistoryEntry[] = [];
      if (Array.isArray(data.history)) {
        history = data.history;
      } else if (data.history && typeof data.history === 'object') {
        // Convert map to array if needed
        history = Object.values(data.history);
      }
      
      if (data.currentNote) {
        const currentEntry: NoteHistoryEntry = {
          note: data.currentNote,
          date: data.updatedDate || new Date().toISOString().split('T')[0],
          station: data.station || getStationConfig().stationName,
          timestamp: data.updatedAt || Timestamp.now(),
          isCurrent: true
        };
        return [currentEntry, ...history];
      }
      
      return history;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading note history:', error);
    return [];
  }
}

/**
 * Get all IMEIs with minimal metadata (for list view)
 * This loads IMEIs with pagination support - full data loaded on demand
 */
export async function getAllImeis(filters?: {
  tabName?: ApiType;
  station?: string;
  dateFrom?: string;
  dateTo?: string;
  userName?: string;
  limitCount?: number;
}): Promise<Array<{ imei: string; tabName: ApiType; station: string; userName: string; updatedDate: string; hasNote: boolean; historyCount: number }>> {
  if (!db) {
    console.error('Firebase db not initialized');
    return [];
  }

  try {
    const results: Array<{ imei: string; tabName: ApiType; station: string; userName: string; updatedDate: string; hasNote: boolean; historyCount: number }> = [];
    
    // Use collectionGroup to query all 'imei' collections (matches Firebase console approach)
    const imeiCollectionGroup = collectionGroup(db, 'imei');
    const snapshot = await getDocs(imeiCollectionGroup);
    
    console.log(`Loaded ${snapshot.size} documents from collection group 'imei'`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Extract tabName from the document path: notes/{tabName}/imei/{imei}
      const pathParts = docSnap.ref.path.split('/');
      const tabNameIndex = pathParts.indexOf('notes') + 1;
      const tabName = pathParts[tabNameIndex] as ApiType;
      
      // Skip if tabName filter is set and doesn't match
      if (filters?.tabName && tabName !== filters.tabName) {
        return;
      }
      
      let include = true;

      if (filters?.station && data.station !== filters.station) {
        include = false;
      }

      if (filters?.dateFrom && data.updatedDate < filters.dateFrom) {
        include = false;
      }

      if (filters?.dateTo && data.updatedDate > filters.dateTo) {
        include = false;
      }

      if (filters?.userName && data.userName !== filters.userName) {
        include = false;
      }

      if (include) {
        // Handle history count - history might be array or object
        let historyCount = 0;
        if (data.history) {
          if (Array.isArray(data.history)) {
            historyCount = data.history.length;
          } else if (typeof data.history === 'object') {
            historyCount = Object.keys(data.history).length;
          }
        }

        results.push({
          imei: docSnap.id,
          tabName,
          station: data.station || 'Unknown',
          userName: data.userName || '',
          updatedDate: data.updatedDate || '',
          hasNote: !!data.currentNote,
          historyCount
        });
      }
    });

    // Sort by updatedDate descending (newest first)
    results.sort((a, b) => {
      if (!a.updatedDate) return 1;
      if (!b.updatedDate) return -1;
      return b.updatedDate.localeCompare(a.updatedDate);
    });

    // Apply limit if specified
    if (filters?.limitCount) {
      return results.slice(0, filters.limitCount);
    }

    return results;
  } catch (error) {
    console.error('Error getting all IMEIs:', error);
    return [];
  }
}

/**
 * Get full note data for a specific IMEI (load on demand)
 */
export async function getImeiDetails(tabName: ApiType, imei: string): Promise<NoteData | null> {
  if (!db || !imei) return null;

  try {
    const noteRef = doc(db, 'notes', tabName, 'imei', imei);
    const docSnap = await getDoc(noteRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      
      // Convert history from object/map to array if needed
      let history: NoteHistoryEntry[] = [];
      if (data.history) {
        if (Array.isArray(data.history)) {
          history = data.history;
        } else if (typeof data.history === 'object') {
          history = Object.values(data.history);
        }
      }
      
      return {
        currentNote: data.currentNote || '',
        updatedDate: data.updatedDate || '',
        station: data.station || '',
        userName: data.userName || '',
        location: data.location || '',
        updatedAt: data.updatedAt,
        history: history
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting IMEI details:', error);
    return null;
  }
}

/**
 * Search notes by text content (searches current note and history)
 */
export async function searchNotesByText(searchText: string, filters?: {
  tabName?: ApiType;
  station?: string;
  dateFrom?: string;
  dateTo?: string;
  userName?: string;
}): Promise<Array<{ imei: string; tabName: ApiType; data: NoteData }>> {
  if (!db || !searchText) return [];

  try {
    const results: Array<{ imei: string; tabName: ApiType; data: NoteData }> = [];
    const tabNames: ApiType[] = filters?.tabName 
      ? [filters.tabName] 
      : ['phonecheck', 'iceq'];

    const searchLower = searchText.toLowerCase();

    // Use collectionGroup to query all 'imei' collections
    const imeiCollectionGroup = collectionGroup(db, 'imei');
    const snapshot = await getDocs(imeiCollectionGroup);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      
      // Extract tabName from the document path
      const pathParts = docSnap.ref.path.split('/');
      const tabNameIndex = pathParts.indexOf('notes') + 1;
      const tabName = pathParts[tabNameIndex] as ApiType;
      
      // Skip if tabName filter is set and doesn't match
      if (filters?.tabName && tabName !== filters.tabName) {
        return;
      }
      
      let include = true;

      // Apply filters
      if (filters?.station && data.station !== filters.station) {
        include = false;
      }

      if (filters?.dateFrom && data.updatedDate < filters.dateFrom) {
        include = false;
      }

      if (filters?.dateTo && data.updatedDate > filters.dateTo) {
        include = false;
      }

      if (filters?.userName && data.userName !== filters.userName) {
        include = false;
      }

      // Search in note content
      if (include) {
        const matchesNote = data.currentNote?.toLowerCase().includes(searchLower);
        
        // Check history - handle both array and object
        let matchesHistory = false;
        if (data.history) {
          if (Array.isArray(data.history)) {
            matchesHistory = data.history.some((h: any) => 
              h.note?.toLowerCase().includes(searchLower)
            );
          } else if (typeof data.history === 'object') {
            matchesHistory = Object.values(data.history).some((h: any) =>
              h.note?.toLowerCase().includes(searchLower)
            );
          }
        }
        
        if (matchesNote || matchesHistory) {
          // Convert history to array
          let history: NoteHistoryEntry[] = [];
          if (data.history) {
            if (Array.isArray(data.history)) {
              history = data.history;
            } else if (typeof data.history === 'object') {
              history = Object.values(data.history);
            }
          }
          
          results.push({
            imei: docSnap.id,
            tabName,
            data: {
              currentNote: data.currentNote || '',
              updatedDate: data.updatedDate || '',
              station: data.station || '',
              userName: data.userName || '',
              location: data.location || '',
              updatedAt: data.updatedAt,
              history: history
            }
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
}

// Legacy function for backwards compatibility
export async function searchNotes(filters: {
  tabName?: ApiType;
  station?: string;
  dateFrom?: string;
  dateTo?: string;
  userName?: string;
  searchText?: string;
}): Promise<Array<{ imei: string; tabName: ApiType; data: NoteData }>> {
  if (filters.searchText) {
    return searchNotesByText(filters.searchText, filters);
  }
  
  // If no search text, just return all matching IMEIs with full data
  const imeis = await getAllImeis(filters);
  const results: Array<{ imei: string; tabName: ApiType; data: NoteData }> = [];
  
  for (const item of imeis) {
    const details = await getImeiDetails(item.tabName, item.imei);
    if (details) {
      results.push({
        imei: item.imei,
        tabName: item.tabName,
        data: details
      });
    }
  }
  
  return results;
}
